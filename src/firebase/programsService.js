import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { ref, push, set, get, query, orderByChild, equalTo, remove, update } from "firebase/database";
import { compressImage, shouldCompress } from './utils/imageCompression';

const transformToArrayStructure = (weeks) => {
  return Object.entries(weeks).map(([weekKey, weekValue]) => ({
    ...weekValue,
    days: Object.values(weekValue.days)
  }));
};

export const getPrograms = async () => {
  const programsRef = ref(db, 'programs');
  const snapshot = await get(programsRef);
  const programs = [];

  if (snapshot.exists()) {
    snapshot.forEach((categorySnapshot) => {
      const category = categorySnapshot.key;
      categorySnapshot.forEach((levelSnapshot) => {
        const level = levelSnapshot.key;
        levelSnapshot.forEach((programSnapshot) => {
          const program = programSnapshot.val();
          if (program.weeks) {
            program.weeks = transformToArrayStructure(program.weeks);
          }
          programs.push({
            id: programSnapshot.key,
            title: program?.title,
            description: program?.description,
            level: level,
            programImageUrl: program?.programImageUrl,
            guidedOrSelfGuidedProgram: program?.guidedOrSelfGuidedProgram,
            duration: program?.duration,
            weeks: program?.weeks?.map(week => ({
              days: week?.days?.map(day => ({
                title: day?.title,
                description: day.description,
                duration: day?.duration,
                targetArea: day?.targetArea || [],
                isOptional: day?.isOptional,
                imageUrl: day?.imageUrl,
                level: day?.level,
                equipment: day?.equipment || [],
                warmUp: day?.warmUp ? day?.warmUp.map(exercise => ({
                  name: exercise?.name,
                  duration: exercise?.duration,
                  reps: exercise?.reps,
                  gifUrl: exercise?.gifUrl
                })) : [],
                workout: Object.entries(day?.workout || {}).map(([setName, exercises]) => ({
                  setName: setName,
                  exercises: exercises?.map(exercise => ({
                    name: exercise?.name,
                    reps: exercise?.reps,
                    rest: exercise?.rest,
                    tempo: exercise?.tempo,
                    duration: exercise?.duration,
                    gifUrl: exercise?.gifUrl
                  }))
                })),
                focus: day?.focus,
                mindfulness: day?.mindfulness?.map(exercise => ({
                  name: exercise?.name,
                  duration: exercise?.duration,
                  imageUrl: exercise?.imageUrl
                })) || [],
                stretch: day?.stretch?.map(exercise => ({
                  name: exercise?.name,
                  duration: exercise?.duration,
                  imageUrl: exercise?.imageUrl
                })) || []
              }))
            })),
            programCategory: category
          });
        });
      });
    });
  }

  console.log("programs get=>", programs);
  return programs;
};

export const uploadFileToFirebase = async (file, path) => {
  if (!file) return null;

  try {
    let fileToUpload = file;
    
    if (shouldCompress(file)) {
      fileToUpload = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024
      });
    }

    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, fileToUpload);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const uploadProgramFiles = async (program) => {
  const programId = program.id || Date.now().toString();
  const baseStoragePath = `programs/${program.programCategory}/${program.level}/${programId}`;

  try {
    // Upload program image
    if (program.programImageFile) {
      let programImageToUpload = program.programImageFile;
      if (shouldCompress(program.programImageFile)) {
        programImageToUpload = await compressImage(program.programImageFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200 // Larger for program cover images
        });
      }
      program.programImageUrl = await uploadFileToFirebase(
        programImageToUpload,
        `${baseStoragePath}/programImageUrl/${program.programImageFile.name}`
      );
    }

    // Upload week images and exercise GIFs
    if (program.weeks && Array.isArray(program.weeks)) {
      for (let weekIndex = 0; weekIndex < program.weeks.length; weekIndex++) {
        const week = program.weeks[weekIndex];
        if (week.days && Array.isArray(week.days)) {
          for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
            const day = week.days[dayIndex];

            // Upload day image
            if (day.imageFile) {
              let dayImageToUpload = day.imageFile;
              if (shouldCompress(day.imageFile)) {
                dayImageToUpload = await compressImage(day.imageFile, {
                  maxSizeMB: 0.8,
                  maxWidthOrHeight: 1024
                });
              }
              day.imageUrl = await uploadFileToFirebase(
                dayImageToUpload,
                `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/dayImage/${day.imageFile.name}`
              );
            }

            // Upload warm-up GIFs/images
            if (day.warmUp && Array.isArray(day.warmUp)) {
              for (let warmUpIndex = 0; warmUpIndex < day.warmUp.length; warmUpIndex++) {
                const warmUpExercise = day.warmUp[warmUpIndex];
                if (warmUpExercise.gifFile) {
                  let warmUpFileToUpload = warmUpExercise.gifFile;
                  if (shouldCompress(warmUpExercise.gifFile)) {
                    warmUpFileToUpload = await compressImage(warmUpExercise.gifFile, {
                      maxSizeMB: 0.5,
                      maxWidthOrHeight: 800
                    });
                  }
                  warmUpExercise.gifUrl = await uploadFileToFirebase(
                    warmUpFileToUpload,
                    `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/warmUp/${warmUpIndex}/${warmUpExercise.gifFile.name}`
                  );
                }
              }
            }

            // Handle mindfulness and stretch images
            for (const section of ['mindfulness', 'stretch']) {
              if (day[section] && Array.isArray(day[section])) {
                for (let exerciseIndex = 0; exerciseIndex < day[section].length; exerciseIndex++) {
                  const exercise = day[section][exerciseIndex];
                  if (exercise.imageFile) {
                    let imageToUpload = exercise.imageFile;
                    if (shouldCompress(exercise.imageFile)) {
                      imageToUpload = await compressImage(exercise.imageFile, {
                        maxSizeMB: 0.5,
                        maxWidthOrHeight: 800
                      });
                    }
                    exercise.imageUrl = await uploadFileToFirebase(
                      imageToUpload,
                      `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/${section}/${exerciseIndex}/${exercise.imageFile.name}`
                    );
                  }
                }
              }
            }

            // Upload workout GIFs/images
            if (day.workout && Array.isArray(day.workout)) {
              for (let setIndex = 0; setIndex < day.workout.length; setIndex++) {
                const set = day.workout[setIndex];
                if (set.exercises && Array.isArray(set.exercises)) {
                  for (let exerciseIndex = 0; exerciseIndex < set.exercises.length; exerciseIndex++) {
                    const exercise = set.exercises[exerciseIndex];
                    if (exercise.gifFile) {
                      let workoutFileToUpload = exercise.gifFile;
                      if (shouldCompress(exercise.gifFile)) {
                        workoutFileToUpload = await compressImage(exercise.gifFile, {
                          maxSizeMB: 0.5,
                          maxWidthOrHeight: 800
                        });
                      }
                      exercise.gifUrl = await uploadFileToFirebase(
                        workoutFileToUpload,
                        `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/workout/set${setIndex + 1}/${exerciseIndex}/${exercise.gifFile.name}`
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return program;
  } catch (error) {
    console.error("Error uploading program files:", error);
    throw error;
  }
};

export const addProgram = async (program) => {
  try {
    const programId = program.id || push(ref(db, `programs/${program.programCategory}/${program.level}`)).key;
    const programRef = ref(db, `programs/${program.programCategory}/${program.level}/${programId}`);

    // Upload all files and update URLs in the program object
    const updatedProgram = await uploadProgramFiles({ ...program, id: programId });

    const transformedProgram = {
      createdAt: Date.now() / 1000,
      description: updatedProgram.description,
      duration: updatedProgram.duration,
      guidedOrSelfGuidedProgram: updatedProgram.guidedOrSelfGuidedProgram,
      id: programId,
      programImageUrl: updatedProgram.programImageUrl,
      title: updatedProgram.title,
      weeks: transformWeeks(updatedProgram.weeks)
    };

    // Remove any undefined values from the transformedProgram
    const cleanProgram = removeUndefinedValues(transformedProgram);
    await set(programRef, cleanProgram);

    // Return the program in the format expected by the UI
    return {
      id: programId,
      ...updatedProgram,
      programCategory: program.programCategory,
      level: program.level,
      weeks: updatedProgram.weeks?.map(week => ({
        ...week,
        days: week.days?.map(day => ({
          ...day,
          workout: day.workout?.map(set => ({
            ...set,
            exercises: Array.isArray(set.exercises) ? set.exercises : []
          })) || []
        })) || []
      })) || []
    };
  } catch (error) {
    console.error("Error adding/updating program:", error);
    throw error;
  }
};

const transformWeeks = (weeks) => {
  return weeks.reduce((acc, week, weekIndex) => {
    acc[`week${weekIndex + 1}`] = {
      days: week.days.reduce((dayAcc, day, dayIndex) => {
        dayAcc[`day${dayIndex + 1}`] = {
          title: day.title,
          description: day.description,
          duration: day.duration,
          targetArea: day.targetArea,
          focus: day.focus,
          isOptional: day.isOptional,
          imageUrl: day.imageUrl,
          level: day.level,
          equipment: day.equipment,
          warmUp: day.warmUp.map(exercise => ({
            name: exercise.name,
            duration: exercise.duration,
            reps: exercise.reps,
            gifUrl: exercise.gifUrl
          })),
          workout: day.workout.reduce((setAcc, set, setIndex) => {
            setAcc[`set${setIndex + 1}`] = set.exercises.map(exercise => ({
              name: exercise?.name,
              reps: exercise?.reps,
              rest: exercise?.rest,
              tempo: exercise?.tempo,
              duration: exercise?.duration,
              gifUrl: exercise.gifUrl
            }));
            return setAcc;
          }, {}),
          mindfulness: day.mindfulness?.map(exercise => ({
            name: exercise.name,
            duration: exercise.duration,
            imageUrl: exercise.imageUrl
          })),
          stretch: day.stretch?.map(exercise => ({
            name: exercise.name,
            duration: exercise.duration,
            imageUrl: exercise.imageUrl
          }))
        };
        return dayAcc;
      }, {})
    };
    return acc;
  }, {});
};

 

// Helper function to remove undefined values
function removeUndefinedValues(obj) {
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
}

export const updateProgram = async (programId, programData, oldCategory, oldLevel) => {
  try {
    // Delete the old program from the database
    const oldProgramRef = ref(db, `programs/${oldCategory}/${oldLevel}/${programId}`);
    await remove(oldProgramRef);

    // Move files if the category or level has changed
    if (oldCategory !== programData.programCategory || oldLevel !== programData.level) {
      await moveProgramFiles(oldCategory, oldLevel, programId, programData.programCategory, programData.level);
    }

    // Create a new program with the updated data
    const updatedProgram = await addProgram(programData);

    console.log("Program updated:", updatedProgram.id);
    
    return updatedProgram;
  } catch (error) {
    console.error("Error updating program:", error);
    throw error;
  }
};

const moveProgramFiles = async (oldCategory, oldLevel, programId, newCategory, newLevel) => {
  const oldBasePath = `programs/${oldCategory}/${oldLevel}/${programId}`;
  const newBasePath = `programs/${newCategory}/${newLevel}/${programId}`;

  try {
    const oldFilesRef = storageRef(storage, oldBasePath);
    const filesList = await listAll(oldFilesRef);

    for (const itemRef of filesList.items) {
      const oldFilePath = itemRef.fullPath;
      const fileName = itemRef.name;
      const newFilePath = `${newBasePath}/${fileName}`;

      // Download the file
      const fileBlob = await getDownloadURL(itemRef).then(url => fetch(url).then(res => res.blob()));

      // Upload to new location
      const newFileRef = storageRef(storage, newFilePath);
      await uploadBytes(newFileRef, fileBlob);

      // Delete from old location
      await deleteObject(itemRef);
    }

    console.log("All program files moved successfully");
  } catch (error) {
    console.error("Error moving program files:", error);
    throw error;
  }
};

export const deleteProgram = async (programId, programCategory, level) => {
  console.log("deleteProgram function programId=>", programId);
  console.log("deleteProgram function programCategory=>", programCategory);
  console.log("deleteProgram function level=>", level);

  try {
    const programRef = ref(db, `programs/${programCategory}/${level}/${programId}`);
    const snapshot = await get(programRef);
    console.log("snapshot.exists()=>", snapshot.exists());
    if (snapshot.exists()) {
      const programData = snapshot.val();
      console.log("programData snap=>", programData);
      // Delete program image
      if (programData && programData.programImageUrl) {
        const imageRef = storageRef(storage, programData.programImageUrl);
        try {
          await deleteObject(imageRef);
          console.log("Program image deleted successfully");
        } catch (imageError) {
          console.warn("Error deleting program image:", imageError);
        }
      }

      // Delete all files associated with the program
      await deleteAllProgramFiles(programCategory, level, programId);

      // Remove the program from the database
      await remove(programRef);
      console.log("Program deleted successfully");
      return true;
    } else {
      console.log("Program not found.");
      return false;
    }
  } catch (error) {
    console.error("Error deleting program:", error);
    throw error;
  }
};

const deleteAllProgramFiles = async (programCategory, level, programId) => {
  const baseStoragePath = `programs/${programCategory}/${level}/${programId}`;
  const filesRef = storageRef(storage, baseStoragePath);

  try {
    const filesList = await listAll(filesRef);
    const deletePromises = filesList.items.map(fileRef => deleteObject(fileRef));
    await Promise.all(deletePromises);
    console.log("All program files deleted successfully");
  } catch (error) {
    console.error("Error deleting program files:", error);
  }
};

export const getAllProgramCategories = async () => {
  try {
    const programsRef = ref(db, 'programs');
    const snapshot = await get(programsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const categories = Object.keys(data).map(key => ({
        name: key,
        imageUrl: data[key].categoryImageUrl || ''
      }));
      return categories;
    }
    // If no categories exist, create default ones
    const defaultCategories = [
      'atGymWorkouts',
      'atHomeWorkouts',
      'balanceAndStability',
      'cardioPrograms',
      'coordinationAndAgilityPrograms',
      'kettleBellOnlyPrograms',
      'yogaPrograms'
    ];
    await Promise.all(defaultCategories.map(type => addNewProgramCategory(type)));
    return defaultCategories.map(name => ({ name, imageUrl: '' }));
  } catch (error) {
    console.error("Error fetching program categories:", error);
    throw error;
  }
};

export const updateProgramCategoryImage = async (category, imageFile) => {
  try {
    if (!imageFile) return null;

    const imageUrl = await uploadFileToFirebase(imageFile, `programs/${category}/categoryImage`);
    const categoryRef = ref(db, `programs/${category}`);
    await update(categoryRef, { categoryImageUrl: imageUrl });

    return imageUrl;
  } catch (error) {
    console.error("Error updating program category image:", error);
    throw error;
  }
};

export const getProgramsByCategory = async (category) => {
  const programsRef = ref(db, `programs/${category}`);
  const snapshot = await get(programsRef);
  const programs = [];

  if (snapshot.exists()) {
    snapshot.forEach((levelSnapshot) => {
      const level = levelSnapshot.key;
      levelSnapshot.forEach((programSnapshot) => {
        const program = programSnapshot.val();
        programs.push({
          id: programSnapshot.key,
          title: program?.title || '',
          description: program?.description || '',
          level: level,
          programImageUrl: program?.programImageUrl || '',
          guidedOrSelfGuidedProgram: program?.guidedOrSelfGuidedProgram || '',
          duration: program?.duration || '',
          weeks: program.weeks ? transformToArrayStructure(program.weeks) : [],
          programCategory: category
        });
      });
    });
  }

  return programs;
};

export const addNewProgramCategory = async (category) => {
  try {
    const categoryRef = ref(db, `programs/${category}`);
    await set(categoryRef, {
      categoryImageUrl: '',
      programs: {}
    });
    return true;
  } catch (error) {
    console.error("Error adding new program category:", error);
    throw error;
  }
};