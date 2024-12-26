import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { ref, push, set, get, query, orderByChild, equalTo, remove, update } from "firebase/database";

import { compressImage } from './utils/imageCompression';

// Helper function to transform workout data
const transformWorkoutData = (workout) => {
  if (!workout || !Array.isArray(workout)) return {};
  
  return workout.reduce((acc, set, index) => {
    const setKey = `set${index + 1}`;
    acc[setKey] = set.exercises.map(exercise => ({
      name: exercise.name || '',
      reps: exercise.reps || '',
      rest: exercise.rest || '',
      tempo: exercise.tempo || '',
      duration: exercise.duration || '',
      gifUrl: exercise.gifUrl || ''
    }));
    return acc;
  }, {});
};

// Helper function to transform weeks data for Firebase
const transformWeeks = (weeks) => {
  if (!weeks || !Array.isArray(weeks)) return {};
  
  return weeks.reduce((acc, week, weekIndex) => {
    acc[`week${weekIndex + 1}`] = {
      days: week.days.reduce((daysAcc, day, dayIndex) => {
        daysAcc[`day${dayIndex + 1}`] = {
          title: day.title || '',
          description: day.description || '',
          duration: day.duration || '',
          equipment: day.equipment || '',
          targetArea: day.targetArea || [],
          isOptional: day.isOptional || false,
          focus: day.focus || '',
          level: day.level || '',
          imageUrl: day.imageUrl || '',
          warmUp: (day.warmUp || []).map(exercise => ({
            name: exercise.name || '',
            duration: exercise.duration || '',
            reps: exercise.reps || '',
            gifUrl: exercise.gifUrl || ''
          })),
          workout: transformWorkoutForFirebase(day.workout),
          mindfulness: (day.mindfulness || []).map(exercise => ({
            name: exercise.name || '',
            duration: exercise.duration || '',
            imageUrl: exercise.imageUrl || ''
          })),
          stretch: (day.stretch || []).map(exercise => ({
            name: exercise.name || '',
            duration: exercise.duration || '',
            imageUrl: exercise.imageUrl || ''
          }))
        };
        return daysAcc;
      }, {})
    };
    return acc;
  }, {});
};

// Helper function to remove undefined values
const removeUndefinedValues = (obj) => {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !(value instanceof File)) {
        result[key] = Array.isArray(value)
          ? value.map(item => removeUndefinedValues(item))
          : removeUndefinedValues(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

// Helper function to delete old image
const deleteOldImage = async (oldImageUrl) => {
  if (oldImageUrl && !oldImageUrl.startsWith('blob:')) {
    try {
      const oldImagePath = decodeURIComponent(oldImageUrl.split('/o/')[1].split('?')[0]);
      const oldImageRef = storageRef(storage, oldImagePath);
      await deleteObject(oldImageRef);
    } catch (error) {
      console.warn("Error deleting old image:", error);
    }
  }
};

// Helper function to transform array structure
const transformToArrayStructure = (weeks) => {
  if (!weeks) return [];
  return Object.entries(weeks).map(([weekKey, weekValue]) => ({
    ...weekValue,
    days: Object.values(weekValue.days || {}).map(day => ({
      ...day,
      workout: day.workout ? Object.entries(day.workout).map(([setKey, exercises]) => ({
        setName: `Set ${setKey.replace('set', '')}`,
        exercises: exercises // Direct array of exercises
      })) : []
    }))
  }));
};

// Get programs by category
const getProgramsByCategory = async (category) => {
  try {
    const programsRef = ref(db, `programs/${category}`);
    const snapshot = await get(programsRef);
    const programs = [];

    if (snapshot.exists()) {
      snapshot.forEach((levelSnapshot) => {
        const level = levelSnapshot.key;
        levelSnapshot.forEach((programSnapshot) => {
          const program = programSnapshot.val();
          console.log('Before transform:', JSON.stringify(program.weeks, null, 2));
          const transformed = transformForUI({
            ...program,
            level,
            programCategory: category
          });
          console.log('After transform:', JSON.stringify(transformed.weeks, null, 2));
          programs.push(transformed);
        });
      });
    }

    return programs;
  } catch (error) {
    console.error(`Error fetching ${category} programs:`, error);
    throw error;
  }
};

// Get all program categories
const getAllProgramCategories = async () => {
  try {
    const programsRef = ref(db, 'programs');
    const snapshot = await get(programsRef);
    if (snapshot.exists()) {
      const categories = Object.keys(snapshot.val()).map(name => ({
        name,
        imageUrl: snapshot.val()[name].categoryImageUrl || ''
      }));
      return categories;
    }
    return [];
  } catch (error) {
    console.error("Error fetching program categories:", error);
    throw error;
  }
};

// Add new program category
const addNewProgramCategory = async (category) => {
  try {
    const categoryRef = ref(db, `programs/${category}`);
    await set(categoryRef, {
      categoryImageUrl: '',
    });
    return true;
  } catch (error) {
    console.error("Error adding new program category:", error);
    throw error;
  }
};

// Update program category cover image
const updateProgramCategoryCoverImage = async (category, imageFile) => {
  try {
    if (!imageFile) return null;

    let fileToUpload = imageFile;
    fileToUpload = await compressImage(imageFile);

    const downloadURL = await uploadFile(
      fileToUpload,
      `programs/${category}/categoryImage/cover`
    );
    
    const categoryRef = ref(db, `programs/${category}`);
    await update(categoryRef, { categoryImageUrl: downloadURL });

    return downloadURL;
  } catch (error) {
    console.error("Error updating program category cover image:", error);
    throw error;
  }
};

// Delete program category
const deleteProgramCategory = async (category) => {
  try {
    // Get all programs in this category first
    const categoryRef = ref(db, `programs/${category}`);
    const snapshot = await get(categoryRef);
    
    if (snapshot.exists()) {
      // Delete category cover image if exists
      const categoryData = snapshot.val();
      if (categoryData.categoryImageUrl) {
        try {
          const imageRef = storageRef(storage, categoryData.categoryImageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn("Error deleting category cover image:", error);
        }
      }

      // Delete all program files in storage
      const folderRef = storageRef(storage, `programs/${category}`);
      try {
        const filesList = await listAll(folderRef);
        
        // Delete all files
        await Promise.all(filesList.items.map(fileRef => deleteObject(fileRef)));
        
        // Recursively delete subfolders
        await Promise.all(filesList.prefixes.map(prefix => 
          deleteAllProgramFiles(prefix.fullPath)
        ));
      } catch (error) {
        console.warn("Error deleting program files:", error);
      }

      // Delete the category from database
      await remove(categoryRef);
    }
    return true;
  } catch (error) {
    console.error("Error deleting program category:", error);
    throw error;
  }
};

// Helper function to recursively delete files
const deleteAllProgramFiles = async (path) => {
  try {
    const folderRef = storageRef(storage, path);
    const filesList = await listAll(folderRef);
    
    const deletePromises = filesList.items.map(fileRef => deleteObject(fileRef));
    await Promise.all(deletePromises);
    
    const deleteFolderPromises = filesList.prefixes.map(prefix => 
      deleteAllProgramFiles(prefix.fullPath)
    );
    await Promise.all(deleteFolderPromises);
  } catch (error) {
    console.warn("Error deleting program files:", error);
  }
};

// Add this helper function to handle file uploads
const handleFileUpload = async (file, path) => {
  try {
    if (!file) return null;
    const compressedFile = await compressImage(file);
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, compressedFile);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Update the updateProgram function
const updateProgram = async (programId, programData, oldCategory, oldLevel) => {
  try {
    const oldProgramRef = ref(db, `programs/${oldCategory}/${oldLevel}/${programId}`);
    const oldProgramSnapshot = await get(oldProgramRef);
    const oldProgramData = oldProgramSnapshot.val();
    let updatedProgram = { ...programData };

    // Handle program image
    if (programData.programImageFile) {
      if (oldProgramData.programImageUrl) {
        await deleteOldImage(oldProgramData.programImageUrl);
      }
      const programImageUrl = await handleFileUpload(
        programData.programImageFile,
        `programs/${programData.programCategory}/${programData.level}/${programId}/programImageUrl/${programData.programImageFile.name}`
      );
      updatedProgram.programImageUrl = programImageUrl;
    }

    // Process all files and transform data structure
    if (programData.weeks) {
      const processedWeeks = {};
      
      for (let weekIndex = 0; weekIndex < programData.weeks.length; weekIndex++) {
        const week = programData.weeks[weekIndex];
        const weekKey = `week${weekIndex + 1}`;
        processedWeeks[weekKey] = { days: {} };

        if (week.days) {
          for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
            const day = week.days[dayIndex];
            const dayKey = `day${dayIndex + 1}`;
            const oldDay = oldProgramData?.weeks?.[weekKey]?.days?.[dayKey];

            // Process day image
            let dayImageUrl = day.imageUrl;
            if (day.imageFile) {
              if (oldDay?.imageUrl) {
                await deleteOldImage(oldDay.imageUrl);
              }
              dayImageUrl = await handleFileUpload(
                day.imageFile,
                `programs/${programData.programCategory}/${programData.level}/${programId}/weeks/${weekKey}/days/${dayKey}/dayImage/${day.imageFile.name}`
              );
            }

            // Process warmUp exercises
            const processedWarmUp = await Promise.all((day.warmUp || []).map(async (exercise, index) => {
              let gifUrl = exercise.gifUrl;
              if (exercise.gifFile) {
                if (oldDay?.warmUp?.[index]?.gifUrl) {
                  await deleteOldImage(oldDay.warmUp[index].gifUrl);
                }
                gifUrl = await handleFileUpload(
                  exercise.gifFile,
                  `programs/${programData.programCategory}/${programData.level}/${programId}/weeks/${weekKey}/days/${dayKey}/warmUp/${index}/${exercise.gifFile.name}`
                );
              }
              return {
                name: exercise.name || '',
                duration: exercise.duration || '',
                reps: exercise.reps || '',
                gifUrl
              };
            }));

            // Process workout exercises
            const processedWorkout = {};
            if (day.workout) {
              for (let setIndex = 0; setIndex < day.workout.length; setIndex++) {
                const set = day.workout[setIndex];
                const setKey = `set${setIndex + 1}`;
                
                processedWorkout[setKey] = await Promise.all(set.exercises.map(async (exercise) => {
                  let gifUrl = exercise.gifUrl;
                  if (exercise.gifFile) {
                    const oldExercise = oldDay?.workout?.[setKey]?.[0];
                    if (oldExercise?.gifUrl) {
                      await deleteOldImage(oldExercise.gifUrl);
                    }
                    gifUrl = await handleFileUpload(
                      exercise.gifFile,
                      `programs/${programData.programCategory}/${programData.level}/${programId}/weeks/${weekKey}/days/${dayKey}/workout/${setKey}/${exercise.name}/${exercise.gifFile.name}`
                    );
                  }
                  return {
                    name: exercise.name || '',
                    reps: exercise.reps || '',
                    rest: exercise.rest || '',
                    tempo: exercise.tempo || '',
                    duration: exercise.duration || '',
                    gifUrl
                  };
                }));
              }
            }

            // Process mindfulness exercises
            const processedMindfulness = await Promise.all((day.mindfulness || []).map(async (exercise, index) => {
              let imageUrl = exercise.imageUrl;
              if (exercise.imageFile) {
                if (oldDay?.mindfulness?.[index]?.imageUrl) {
                  await deleteOldImage(oldDay.mindfulness[index].imageUrl);
                }
                imageUrl = await handleFileUpload(
                  exercise.imageFile,
                  `programs/${programData.programCategory}/${programData.level}/${programId}/weeks/${weekKey}/days/${dayKey}/mindfulness/${index}/${exercise.imageFile.name}`
                );
              }
              return {
                name: exercise.name || '',
                duration: exercise.duration || '',
                imageUrl
              };
            }));

            // Process stretch exercises
            const processedStretch = await Promise.all((day.stretch || []).map(async (exercise, index) => {
              let imageUrl = exercise.imageUrl;
              if (exercise.imageFile) {
                if (oldDay?.stretch?.[index]?.imageUrl) {
                  await deleteOldImage(oldDay.stretch[index].imageUrl);
                }
                imageUrl = await handleFileUpload(
                  exercise.imageFile,
                  `programs/${programData.programCategory}/${programData.level}/${programId}/weeks/${weekKey}/days/${dayKey}/stretch/${index}/${exercise.imageFile.name}`
                );
              }
              return {
                name: exercise.name || '',
                duration: exercise.duration || '',
                imageUrl
              };
            }));

            // Construct the day object with the correct structure
            processedWeeks[weekKey].days[dayKey] = {
              title: day.title || '',
              description: day.description || '',
              duration: day.duration || '',
              equipment: day.equipment || '',
              targetArea: Array.isArray(day.targetArea) ? 
                day.targetArea.map(target => Array.isArray(target) ? target : target.split('')) : [],
              isOptional: day.isOptional || false,
              focus: day.focus || '',
              imageUrl: dayImageUrl || '',
              warmUp: processedWarmUp,
              workout: processedWorkout,
              mindfulness: processedMindfulness,
              stretch: processedStretch
            };
          }
        }
      }

      updatedProgram.weeks = processedWeeks;
    }

    // Clean up file properties and prepare final data
    const finalProgram = {
      id: programId,
      title: updatedProgram.title || '',
      description: updatedProgram.description || '',
      duration: updatedProgram.duration || '',
      guidedOrSelfGuidedProgram: updatedProgram.guidedOrSelfGuidedProgram || '',
      programImageUrl: updatedProgram.programImageUrl,
      level: updatedProgram.level,
      programCategory: updatedProgram.programCategory,
      weeks: updatedProgram.weeks
    };

    // Update database
    const programRef = ref(db, `programs/${programData.programCategory}/${programData.level}/${programId}`);
    await set(programRef, finalProgram);
    
    return finalProgram;
  } catch (error) {
    console.error("Error updating program:", error);
    throw error;
  }
};

// Upload file helper function
const uploadFile = async (file, path) => {
  try {
    const fileRef = storageRef(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { success: true, url };
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

//  i want to handle the program categopry and level chnAGE if user change it how can i handle, right now its getting moved to another cateegory but 
// right now if we change the category and level then  the copy of the program is still showing on older category and level. also storeage its not getting chnaged, how can i handle it 
const handleProgramCategoryAndLevelChange = async (oldCategory, oldLevel, programId, newCategory, newLevel) => {
  try {
    // Get program data from old location
    const oldProgramRef = ref(db, `programs/${oldCategory}/${oldLevel}/${programId}`);
    const snapshot = await get(oldProgramRef);
    if (!snapshot.exists()) {
      throw new Error('Program not found');
    }
    const programData = snapshot.val();

    // Update program data with new category and level
    const updatedProgram = {
      ...programData,
      programCategory: newCategory,
      level: newLevel
    };

    // Move program data to new location
    const newProgramRef = ref(db, `programs/${newCategory}/${newLevel}/${programId}`);
    await set(newProgramRef, updatedProgram);

    // Move storage files
    const oldStoragePrefix = `programs/${oldCategory}/${oldLevel}/${programId}`;
    const newStoragePrefix = `programs/${newCategory}/${newLevel}/${programId}`;
    
    // List all files in old location
    const oldFolderRef = storageRef(storage, oldStoragePrefix);
    console.log("oldFolderRef", oldFolderRef);
    const filesList = await listAll(oldFolderRef);
    console.log("filesList", filesList);

    // Move each file to new location
    for (const item of filesList.items) {
      console.log("item", item);
      const oldPath = item.fullPath;
      const newPath = oldPath.replace(oldStoragePrefix, newStoragePrefix);
      
      // Download file
      const fileData = await getDownloadURL(item);
      const response = await fetch(fileData);
      const blob = await response.blob();

      // Upload to new location
      const newFileRef = storageRef(storage, newPath);
      console.log("newFileRef", newFileRef);
      await uploadBytes(newFileRef, blob);

      // Delete from old location
      await deleteObject(item);
    }

    // Delete program from old location
    await remove(oldProgramRef);
    console.log("oldProgramRef", oldProgramRef);
    console.log("updatedProgram after moving", updatedProgram);

    return updatedProgram;

  } catch (error) {
    console.error("Error moving program:", error);
    throw error;
  }
};

// Get week details
const getWeekDetails = async (programId, programCategory, level, weekIndex) => {
  try {
    const weekRef = ref(db, `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}`);
    const snapshot = await get(weekRef);
    if (snapshot.exists()) {
      const weekData = snapshot.val();
      return {
        days: Object.entries(weekData.days || {}).map(([dayKey, dayData]) => ({
          ...dayData,
          workout: dayData.workout ? Object.entries(dayData.workout).map(([setName, exercises]) => ({
            setName,
            exercises: exercises || []
          })) : []
        }))
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching week details:", error);
    throw error;
  }
};

// Get day details
const getDayDetails = async (programId, programCategory, level, weekIndex, dayIndex) => {
  try {
    const dayRef = ref(db, `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}`);
    const snapshot = await get(dayRef);
    if (snapshot.exists()) {
      const dayData = snapshot.val();
      return {
        ...dayData,
        workout: dayData.workout ? Object.entries(dayData.workout).map(([setName, exercises]) => ({
          setName,
          exercises: exercises || []
        })) : []
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching day details:", error);
    throw error;
  }
};

// Handle day image upload
const handleDayImageUpload = async (programId, programCategory, level, weekIndex, dayIndex, file) => {
  try {
    const path = `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/dayImage/${file.name}`;
    const dayRef = ref(db, `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}`);
    const snapshot = await get(dayRef);
    const oldUrl = snapshot.exists() ? snapshot.val().imageUrl : null;

    const downloadUrl = await handleFileUploadWithReplacement(file, oldUrl, path);
    await update(dayRef, { imageUrl: downloadUrl });

    return downloadUrl;
  } catch (error) {
    console.error('Error in handleDayImageUpload:', error);
    throw error;
  }
};

// Update day details
const updateDayDetails = async (programId, programCategory, level, weekIndex, dayIndex, dayData) => {
  try {
    const dayRef = ref(db, `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}`);
    await update(dayRef, removeUndefinedValues(dayData));
    return true;
  } catch (error) {
    console.error("Error updating day details:", error);
    throw error;
  }
};

// Add this helper function
const transformWorkoutForFirebase = (workout) => {
  if (!Array.isArray(workout)) return {};
  
  return workout.reduce((acc, set, index) => {
    const setKey = `set${index + 1}`;
    if (set.exercises && Array.isArray(set.exercises)) {
      // Transform exercises array to match Firebase structure
      acc[setKey] = set.exercises.map(exercise => ({
        name: exercise.name || '',
        reps: exercise.reps || '',
        rest: exercise.rest || '',
        tempo: exercise.tempo || '',
        duration: exercise.duration || '',
        gifUrl: exercise.gifUrl || ''
      }));
    }
    return acc;
  }, {});
};

// Add this helper function for handling file uploads with replacement
const handleFileUploadWithReplacement = async (file, oldUrl, newPath) => {
    try {
        // Delete old file if it exists and is not a blob URL
        if (oldUrl && !oldUrl.startsWith('blob:')) {
          console.log("oldUrl", oldUrl);
            try {
                const oldImagePath = decodeURIComponent(oldUrl.split('/o/')[1].split('?')[0]);
                const oldImageRef = storageRef(storage, oldImagePath);
                console.log("oldImageRef", oldImageRef);
                console.log("oldUrl", oldUrl);
                await deleteObject(oldImageRef);
            } catch (error) {
                console.warn("Error deleting old image:", error);
            }
        }

        // Upload new file
        const compressedFile = await compressImage(file);
        const newFileRef = storageRef(storage, newPath);
        console.log("newFileRef", newFileRef);
        console.log("newPath", newPath);
        await uploadBytes(newFileRef, compressedFile);
        const downloadUrl = await getDownloadURL(newFileRef);
        console.log("downloadUrl", downloadUrl);
        return downloadUrl;
    } catch (error) {
        console.error("Error handling file upload:", error);
        throw error;
    }
};

// Update handleGifUpload function
const handleGifUpload = async (programId, programCategory, level, weekIndex, dayIndex, type, setIndex = null, exerciseIndex = null, file) => {
    let path;
    let oldUrl;

    if (type === 'workout') {
        path = `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/workout/set${setIndex + 1}/${exerciseIndex}/${file.name}`;
        oldUrl = await getExerciseGifUrl(programId, programCategory, level, weekIndex, dayIndex, 'workout', setIndex, exerciseIndex);
    } else if (type === 'warmUp') {
        path = `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/warmUp/${exerciseIndex}/${file.name}`;
        oldUrl = await getExerciseGifUrl(programId, programCategory, level, weekIndex, dayIndex, 'warmUp', null, exerciseIndex);
    }

    return handleFileUploadWithReplacement(file, oldUrl, path);
};

// Add functions to get existing URLs
const getExerciseGifUrl = async (programId, programCategory, level, weekIndex, dayIndex, type, setIndex, exerciseIndex) => {
    const path = type === 'workout' 
        ? `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/${type}/set${setIndex + 1}/${exerciseIndex}`
        : `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/${type}/${exerciseIndex}`;
    
    const exerciseRef = ref(db, path);
    const snapshot = await get(exerciseRef);
    return snapshot.exists() ? snapshot.val().gifUrl : null;
};

const getDayImageUrl = async (programId, programCategory, level, weekIndex, dayIndex) => {
    try {
        // Path should match your DB structure: programs/category/level/programId/weeks/[index]/days/[index]
        const dayRef = ref(db, `programs/${programCategory}/${level}/${programId}/weeks/${weekIndex}/days/${dayIndex}`);
        console.log("Getting image URL for path:", dayRef.toString());
        
        const snapshot = await get(dayRef);
        console.log("Snapshot exists:", snapshot.exists(), snapshot.val());

  if (snapshot.exists()) {
            const dayData = snapshot.val();
            return dayData.imageUrl || null;
        }
        return null;
    } catch (error) {
        console.error("Error getting day image URL:", error);
        return null;
    }
};

// Update handleMindfulnessImageUpload
const handleMindfulnessImageUpload = async (programId, programCategory, level, weekIndex, dayIndex, exerciseIndex, file) => {
    const path = `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/mindfulness/${exerciseIndex}/${file.name}`;
    const oldUrl = await getExerciseImageUrl(programId, programCategory, level, weekIndex, dayIndex, 'mindfulness', exerciseIndex);
    
    return handleFileUploadWithReplacement(file, oldUrl, path);
};

// Update handleStretchImageUpload
const handleStretchImageUpload = async (programId, programCategory, level, weekIndex, dayIndex, exerciseIndex, file) => {
    const path = `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/stretch/${exerciseIndex}/${file.name}`;
    const oldUrl = await getExerciseImageUrl(programId, programCategory, level, weekIndex, dayIndex, 'stretch', exerciseIndex);
    
    return handleFileUploadWithReplacement(file, oldUrl, path);
};

// Helper function for mindfulness and stretch image URLs
const getExerciseImageUrl = async (programId, programCategory, level, weekIndex, dayIndex, type, exerciseIndex) => {
    const path = `programs/${programCategory}/${level}/${programId}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/${type}/${exerciseIndex}`;
    const exerciseRef = ref(db, path);
    const snapshot = await get(exerciseRef);
    return snapshot.exists() ? snapshot.val().imageUrl : null;
};

// Add this function for adding new programs
const addProgram = async (program) => {
  try {
    const { id, programCategory, level } = program;
    
    // Handle program image upload first
    let programImageUrl = program.programImageUrl;
    if (program.programImageFile) {
      const path = `programs/${programCategory}/${level}/${id}/programImageUrl/${program.programImageFile.name}`;
      programImageUrl = await handleFileUploadWithReplacement(
        program.programImageFile,
        null,
        path
      );
    }

    // Handle all image/gif uploads in weeks/days
    const processedWeeks = await Promise.all(program.weeks.map(async (week, weekIndex) => {
      const processedDays = await Promise.all(week.days.map(async (day, dayIndex) => {
        // Process warmUp exercises
        if (day.warmUp) {
          day.warmUp = await Promise.all(day.warmUp.map(async (exercise, exerciseIndex) => {
            let gifUrl = exercise.gifUrl;
            if (exercise.gifFile) {
              const path = `programs/${programCategory}/${level}/${id}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/warmUp/${exerciseIndex}/${exercise.gifFile.name}`;
              gifUrl = await handleFileUploadWithReplacement(exercise.gifFile, null, path);
            }
            return {
              ...exercise,
              gifUrl,
              gifFile: undefined
            };
          }));
        }

        // Process workout exercises
        if (day.workout) {
          day.workout = await Promise.all(day.workout.map(async (set, setIndex) => {
            const processedExercises = await Promise.all(set.exercises.map(async (exercise) => {
              let gifUrl = exercise.gifUrl;
              if (exercise.gifFile) {
                const path = `programs/${programCategory}/${level}/${id}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/workout/set${setIndex + 1}/${exercise.name}/${exercise.gifFile.name}`;
                gifUrl = await handleFileUploadWithReplacement(exercise.gifFile, null, path);
              }
              return {
                ...exercise,
                gifUrl,
                gifFile: undefined
              };
            }));
            return {
              ...set,
              exercises: processedExercises
            };
          }));
        }

        // Process mindfulness exercises
        if (day.mindfulness) {
          day.mindfulness = await Promise.all(day.mindfulness.map(async (exercise, exerciseIndex) => {
            let imageUrl = exercise.imageUrl;
            if (exercise.imageFile) {
              const path = `programs/${programCategory}/${level}/${id}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/mindfulness/${exerciseIndex}/${exercise.imageFile.name}`;
              imageUrl = await handleFileUploadWithReplacement(exercise.imageFile, null, path);
            }
            return {
              ...exercise,
              imageUrl,
              imageFile: undefined
            };
          }));
        }

        // Process stretch exercises
        if (day.stretch) {
          day.stretch = await Promise.all(day.stretch.map(async (exercise, exerciseIndex) => {
            let imageUrl = exercise.imageUrl;
            if (exercise.imageFile) {
              const path = `programs/${programCategory}/${level}/${id}/weeks/week${weekIndex + 1}/days/day${dayIndex + 1}/stretch/${exerciseIndex}/${exercise.imageFile.name}`;
              imageUrl = await handleFileUploadWithReplacement(exercise.imageFile, null, path);
            }
            return {
              ...exercise,
              imageUrl,
              imageFile: undefined
            };
          }));
        }

        return day;
      }));
      return {
        ...week,
        days: processedDays
      };
    }));

    // Transform the program data for Firebase
    const programData = {
      id,
      title: program.title || '',
      description: program.description || '',
      duration: program.duration || '',
      guidedOrSelfGuidedProgram: program.guidedOrSelfGuidedProgram || '',
      programImageUrl,
      createdAt: Date.now(),
      weeks: transformWeeks({
        ...program,
        weeks: processedWeeks
      }.weeks)
    };

    console.log('Transformed program data for Firebase:', JSON.stringify(programData, null, 2));

    // Save the program data
    const programRef = ref(db, `programs/${programCategory}/${level}/${id}`);
    await set(programRef, removeUndefinedValues(programData));

    return programData;
  } catch (error) {
    console.error('Error adding program:', error);
    throw error;
  }
};

// Helper function to transform data for UI consumption
const transformForUI = (program) => {
  if (!program.weeks) return program;

  return {
    ...program,
    weeks: Object.entries(program.weeks).map(([weekKey, weekData]) => ({
      days: Object.entries(weekData.days).map(([dayKey, dayData]) => ({
        ...dayData,
        workout: Object.entries(dayData.workout || {}).map(([setKey, exercises]) => ({
          setName: `Set ${setKey.replace('set', '')}`,
          exercises: Array.isArray(exercises) ? exercises : []
        }))
      }))
    }))
  };
};

// Export all the functions
export {
  getProgramsByCategory,
  getAllProgramCategories,
  addNewProgramCategory,
  updateProgramCategoryCoverImage,
  deleteProgramCategory,
  updateProgram,
  addProgram,
  uploadFile,
  transformToArrayStructure,
  transformWeeks,
  transformWorkoutData,
  deleteOldImage,
  getWeekDetails,
  getDayDetails,
  handleDayImageUpload,
  updateDayDetails,
  handleGifUpload,
  handleMindfulnessImageUpload,
  handleStretchImageUpload,
  handleFileUploadWithReplacement,
  transformWorkoutForFirebase,
  handleProgramCategoryAndLevelChange
};