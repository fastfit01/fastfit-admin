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

export const addProgram = async (program) => {
    const categoryRef = ref(db, `programs/${program.programCategory}`);
    const newProgramRef = program.id ? ref(db, `programs/${program.programCategory}/${program.id}`) : push(categoryRef);

    try {
        let programImageUrl = program.programImageUrl || '';
        if (program.programImageFile instanceof File) {
            const imageFileRef = storageRef(storage, `programs/${program.programCategory}/${newProgramRef.key}/programImageUrl/${program.programImageFile.name}`);
            await uploadBytes(imageFileRef, program.programImageFile);
            programImageUrl = await getDownloadURL(imageFileRef);
            console.log("Program image uploaded:", programImageUrl);
        }

        const processedWeeks = await processWeeksAndExercises(program.programCategory, newProgramRef.key, program.weeks || []);

        const newProgram = {
            ...program,
            programImageUrl,
            weeks: transformToNamedStructure(processedWeeks),
            createdAt: program.createdAt || Date.now() / 1000,
        };

        delete newProgram.programImageFile;
        delete newProgram.programCategory;

        await set(newProgramRef, newProgram);
 
        return { id: newProgramRef.key, ...newProgram, programCategory: program.programCategory };
    } catch (error) {
        console.error("Error adding/updating program:", error);
        throw error;
    }
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