import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
  return Object.values(weeks).map(week => ({
    ...week,
    days: Object.values(week.days)
  }));
};

export const getPrograms = async () => {
    const programsRef = ref(db, 'programs');
    const snapshot = await get(programsRef);
    const programs = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((categorySnapshot) => {
        const category = categorySnapshot.key;
        categorySnapshot.forEach((programSnapshot) => {
          const program = programSnapshot.val();
          if (program.weeks) {
            program.weeks = transformToArrayStructure(program.weeks);
          }
          programs.push({ 
            id: programSnapshot.key, 
            programCategory: category,
            ...program 
          });
        });
      });
    }
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
  const baseStoragePath = `programs/${program.programCategory}/${programId}`;

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
  
    const programId = program.id || push(ref(db, 'programs')).key;
    const programRef = ref(db, `programs/${programId}`);

    // Upload all files and update URLs in the program object
    const updatedProgram = await uploadProgramFiles({ ...program, id: programId });

    const transformedProgram = {
      [updatedProgram.programCategory]: {
        [updatedProgram.level]: {
          createdAt: Date.now() / 1000,
          description: updatedProgram.description,
          duration: updatedProgram.duration,
          guidedOrSelfGuidedProgram: updatedProgram.guidedOrSelfGuidedProgram,
          id: programId,
          programImageUrl: updatedProgram.programImageUrl,
          title: updatedProgram.title,
          weeks: transformWeeks(updatedProgram.weeks)
        }
      }
    };

    // Remove any undefined values from the transformedProgram
    const cleanProgram = JSON.parse(JSON.stringify(transformedProgram));
    await set(programRef, cleanProgram);
 
    return {
      programId,
      program: cleanProgram
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
          focus:day.focus,
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

export const updateProgram = async (id, program, oldCategory) => {
    if (oldCategory !== program.programCategory) {     
        try {
            const deleted = await deleteProgram(id, oldCategory);
            if (deleted) {
                console.log("Program deleted from old category. Adding to new category.");
            } else {
                console.log("Program not found in old category. Proceeding with add operation.");
            }

            return addProgram(program);
        } catch (error) {
            console.error("Error during category change process:", error);
            throw error;
        }
    }

    const programRef = ref(db, `programs/${program.programCategory}/${id}`);

    try {
        let programImageUrl = program.programImageUrl;
        if (program.programImageFile instanceof File) {
            const imageFileRef = storageRef(storage, `programs/${program.programCategory}/${id}/programImageUrl/${program.programImageFile.name}`);
            await uploadBytes(imageFileRef, program.programImageFile);
            programImageUrl = await getDownloadURL(imageFileRef);
         }

        const processedWeeks = await processWeeksAndExercises(program.programCategory, id, program.weeks || []);

        const updatedProgram = {
            ...program,
            programImageUrl,
            weeks: transformToNamedStructure(processedWeeks),
        };

        delete updatedProgram.programImageFile;
        delete updatedProgram.programCategory;

        await update(programRef, updatedProgram);
        console.log("Program updated:", id);

        return { id, ...updatedProgram, programCategory: program.programCategory };
    } catch (error) {
        console.error("Error updating program:", error);
        throw error;
    }
};

export const deleteProgram = async (programId, programCategory) => {
     try {
      const programRef = ref(db, `programs/${programCategory}/${programId}`);
      const snapshot = await get(programRef);
  
       if (snapshot.exists()) {
        const programData = snapshot.val();
         
        if (programData && programData.programImageUrl) {          
          const imageRef = storageRef(storage, programData.programImageUrl);
          try {
            await deleteObject(imageRef);
            console.log("Program image deleted successfully");
          } catch (imageError) {
            console.warn("Error deleting program image:", imageError);
           }
        }
  
        await remove(programRef);
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