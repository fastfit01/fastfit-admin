import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { ref, push, set, get, query, orderByChild, equalTo, remove, update } from "firebase/database";

const transformToNamedStructure = (weeks) => {
  return weeks.reduce((acc, week, weekIndex) => {
    acc[`week${weekIndex + 1}`] = {
      ...week,
      days: week.days.reduce((dayAcc, day, dayIndex) => {
        dayAcc[`day${dayIndex + 1}`] = day;
        return dayAcc;
      }, {})
    };
    return acc;
  }, {});
};

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

  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
};

export const uploadProgramFiles = async (program) => {
  const programId = program.id || Date.now().toString();
  const baseStoragePath = `programs/${program.programCategory}/${program.level}/${programId}`;

  // Upload program image
  if (program.programImageFile) {
    program.programImageUrl = await uploadFileToFirebase(
      program.programImageFile,
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
            day.imageUrl = await uploadFileToFirebase(
              day.imageFile,
              `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/dayImage/${day.imageFile.name}`
            );
          }

          // Upload warm-up GIFs
          if (day.warmUp && Array.isArray(day.warmUp)) {
            for (let warmUpIndex = 0; warmUpIndex < day.warmUp.length; warmUpIndex++) {
              const warmUpExercise = day.warmUp[warmUpIndex];
              if (warmUpExercise.gifFile) {
                warmUpExercise.gifUrl = await uploadFileToFirebase(
                  warmUpExercise.gifFile,
                  `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/warmUp/${warmUpIndex}/${warmUpExercise.gifFile.name}`
                );
              }
            }
          }

          // Upload workout GIFs
          if (day.workout && Array.isArray(day.workout)) {
            for (let setIndex = 0; setIndex < day.workout.length; setIndex++) {
              const set = day.workout[setIndex];
              if (set.exercises && Array.isArray(set.exercises)) {
                for (let exerciseIndex = 0; exerciseIndex < set.exercises.length; exerciseIndex++) {
                  const exercise = set.exercises[exerciseIndex];
                  if (exercise.gifFile) {
                    exercise.gifUrl = await uploadFileToFirebase(
                      exercise.gifFile,
                      `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/workout/set${setIndex + 1}/${exerciseIndex}/${exercise.gifFile.name}`
                    );
                  }
                }
              }
            }
          }

          // Upload mindfulness images
          if (day.mindfulness && Array.isArray(day.mindfulness)) {
            for (let mindfulnessIndex = 0; mindfulnessIndex < day.mindfulness.length; mindfulnessIndex++) {
              const mindfulness = day.mindfulness[mindfulnessIndex];
              if (mindfulness.imageFile) {
                mindfulness.imageUrl = await uploadFileToFirebase(
                  mindfulness.imageFile,
                  `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/mindfulness/${mindfulnessIndex}/${mindfulness.imageFile.name}`
                );
              }
            }
          }

          // Upload stretch images
          if (day.stretch && Array.isArray(day.stretch)) {
            for (let stretchIndex = 0; stretchIndex < day.stretch.length; stretchIndex++) {
              const stretch = day.stretch[stretchIndex];
              if (stretch.imageFile) {
                stretch.imageUrl = await uploadFileToFirebase(
                  stretch.imageFile,
                  `${baseStoragePath}/week${weekIndex + 1}/day${dayIndex + 1}/stretch/${stretchIndex}/${stretch.imageFile.name}`
                );
              }
            }
          }
        }
      }
    }
  }

  return program;
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

    return {
      id: programId,
      ...updatedProgram,
      weeks: updatedProgram.weeks.map(week => ({
        ...week,
        days: week.days.map(day => ({
          ...day,
          workout: day.workout.map(set => ({
            ...set,
            exercises: Array.isArray(set.exercises) ? set.exercises : Object.values(set.exercises)
          }))
        }))
      }))
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
              name: exercise.name,
              reps: exercise.reps,
              rest: exercise.rest,
              tempo: exercise.tempo,
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

const transformDays = (days) => {
  return days.reduce((acc, day, dayIndex) => {
    acc[`day${dayIndex + 1}`] = {
      description: day.description,
      duration: day.duration,
      imageUrl: day.imageUrl,
      isOptional: day.isOptional,
      level: day.level,
      title: day.title,
      warmUp: day.warmUp,
      workout: transformWorkout(day.workout),
      mindfulness: day.mindfulness,
      stretch: day.stretch
    };
    return acc;
  }, {});
};

const transformWorkout = (workout) => {
  return workout.reduce((acc, set, setIndex) => {
    acc[`set${setIndex + 1}`] = set.exercises;
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
    // Delete the old program
    await deleteProgram(programId, oldCategory, oldLevel);

    // Create a new program with the updated data
    const updatedProgram = await addProgram(programData);

    console.log("Program updated:", updatedProgram.id);
    
    return updatedProgram;
  } catch (error) {
    console.error("Error updating program:", error);
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

const processWeeksAndExercises = async (programCategory, programId, weeks) => {
  const processedWeeks = [];

  for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
    const week = weeks[weekIndex];
    const processedDays = [];

    for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
      const day = week.days[dayIndex];
      const processedWarmUp = await processExercises(programCategory, programId, weekIndex, dayIndex, 'warmUp', day.warmUp || []);
      const processedWorkout = await processExercises(programCategory, programId, weekIndex, dayIndex, 'workout', day.workout || []);

      processedDays.push({
        ...day,
        warmUp: processedWarmUp,
        workout: processedWorkout,
      });
    }

    processedWeeks.push({
      ...week,
      days: processedDays,
    });
  }

  return processedWeeks;
};

const processExercises = async (programCategory, programId, weekIndex, dayIndex, type, exercises) => {
  const processedExercises = [];

  for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex++) {
    const exercise = exercises[exerciseIndex];
    let gifUrl = exercise.gifUrl;

    if (exercise.gifFile instanceof File) {
      const gifFileRef = storageRef(storage, `programs/${programCategory}/${programId}/week${weekIndex}/day${dayIndex}/${type}/${exerciseIndex}/${exercise.gifFile.name}`);
      await uploadBytes(gifFileRef, exercise.gifFile);
      gifUrl = await getDownloadURL(gifFileRef);
    }

    processedExercises.push({
      ...exercise,
      gifUrl,
    });

    delete processedExercises[exerciseIndex].gifFile;
  }

  return processedExercises;
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
    return [];
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