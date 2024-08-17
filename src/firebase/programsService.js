import { ref, push, set, get, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';

export const getPrograms = async () => {
    const programsRef = ref(db, 'programs');
    console.log("Fetching programs from:", programsRef);
    
    const snapshot = await get(programsRef);
    console.log("Snapshot received:", snapshot.exists());
    
    const programs = [];
    snapshot.forEach((childSnapshot) => {
        programs.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    console.log("Programs fetched:", programs.length);
    return programs;
};

export const addProgram = async (program) => {
    const programsRef = ref(db, 'programs');
    const newProgramRef = push(programsRef);
    
    let programImageUrl = '';

    try {
        // Upload Program Image File (if any)
        if (program.programImageUrl && program.programImageUrl instanceof File) {
            const imageFileRef = storageRef(storage, `programs/${newProgramRef.key}/programImageUrl/${program.programImageUrl.name}`);
            await uploadBytes(imageFileRef, program.programImageUrl);
            programImageUrl = await getDownloadURL(imageFileRef);
            console.log("Program image uploaded:", programImageUrl);
        }

        // Process weeks, days, and exercises
        const processedWeeks = await processWeeksAndExercises(newProgramRef.key, program.weeks || []);

        const newProgram = {
            ...program,
            programImageUrl,
            weeks: processedWeeks,
            createdAt: Date.now() / 1000, // Current timestamp in seconds
        };

        // Remove the File object before saving to the database
        delete newProgram.programImageUrl;

        await set(newProgramRef, newProgram);
        console.log("New program added:", newProgramRef.key);

        return { id: newProgramRef.key, ...newProgram };
    } catch (error) {
        console.error("Error adding program:", error);
        throw error;
    }
};

export const updateProgram = async (id, program) => {
    const programRef = ref(db, `programs/${id}`);
    
    let programImageUrl = program.programImageUrl;

    try {
        // Upload Program Image File (if any)
        if (program.programImageUrl && program.programImageUrl instanceof File) {
            const imageFileRef = storageRef(storage, `programs/${id}/programImageUrl/${program.programImageUrl.name}`);
            await uploadBytes(imageFileRef, program.programImageUrl);
            programImageUrl = await getDownloadURL(imageFileRef);
            console.log("Program image updated:", programImageUrl);
        }

        // Process weeks, days, and exercises
        const processedWeeks = await processWeeksAndExercises(id, program.weeks || []);

        const updatedProgram = {
            ...program,
            programImageUrl,
            weeks: processedWeeks,
        };

        // Remove the File object before saving to the database
        delete updatedProgram.programImageUrl;

        await update(programRef, updatedProgram);
        console.log("Program updated:", id);

        return { id, ...updatedProgram };
    } catch (error) {
        console.error("Error updating program:", error);
        throw error;
    }
};

const processWeeksAndExercises = async (programId, weeks) => {
    const processedWeeks = [];

    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
        const week = weeks[weekIndex];
        const processedDays = [];

        for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
            const day = week.days[dayIndex];
            const processedWarmUp = await processExercises(programId, weekIndex, dayIndex, 'warmUp', day.warmUp || []);
            const processedWorkout = await processExercises(programId, weekIndex, dayIndex, 'workout', day.workout || []);

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

const processExercises = async (programId, weekIndex, dayIndex, type, exercises) => {
    const processedExercises = [];

    for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex++) {
        const exercise = exercises[exerciseIndex];
        let gifUrl = exercise.gifUrl;

        if (exercise.gifUrl && exercise.gifUrl instanceof File) {
            const gifFileRef = storageRef(storage, `programs/${programId}/week${weekIndex}/day${dayIndex}/${type}/${exerciseIndex}/${exercise.gifUrl.name}`);
            await uploadBytes(gifFileRef, exercise.gifUrl);
            gifUrl = await getDownloadURL(gifFileRef);
            console.log(`Exercise GIF uploaded: ${type}, Week ${weekIndex}, Day ${dayIndex}, Exercise ${exerciseIndex}`);
        }

        processedExercises.push({
            ...exercise,
            gifUrl,
        });
    }

    return processedExercises;
};

export const deleteProgram = async (id) => {
    const programRef = ref(db, `programs/${id}`);
    await remove(programRef);
    console.log("Program deleted:", id);
    // Note: This doesn't delete files from storage. You may want to implement that separately.
};

export const addWeek = async (programId, weekData) => {
    const programRef = ref(db, `programs/${programId}`);
    const snapshot = await get(programRef);
    const program = snapshot.val();
    
    if (!program.weeks) {
        program.weeks = [];
    }
    
    program.weeks.push(weekData);
    
    await update(programRef, { weeks: program.weeks });
    console.log("Week added to program:", programId);
};

export const updateWeek = async (programId, weekIndex, weekData) => {
    const weekRef = ref(db, `programs/${programId}/weeks/${weekIndex}`);
    await update(weekRef, weekData);
    console.log(`Week ${weekIndex} updated in program:`, programId);
};

export const deleteWeek = async (programId, weekIndex) => {
    const programRef = ref(db, `programs/${programId}`);
    const snapshot = await get(programRef);
    const program = snapshot.val();
    
    program.weeks.splice(weekIndex, 1);
    
    await update(programRef, { weeks: program.weeks });
    console.log(`Week ${weekIndex} deleted from program:`, programId);
};

export const addDay = async (programId, weekIndex, dayData) => {
    const weekRef = ref(db, `programs/${programId}/weeks/${weekIndex}`);
    const snapshot = await get(weekRef);
    const week = snapshot.val();
    
    if (!week.days) {
        week.days = [];
    }
    
    week.days.push(dayData);
    
    await update(weekRef, { days: week.days });
    console.log(`Day added to Week ${weekIndex} in program:`, programId);
};

export const updateDay = async (programId, weekIndex, dayIndex, dayData) => {
    const dayRef = ref(db, `programs/${programId}/weeks/${weekIndex}/days/${dayIndex}`);
    await update(dayRef, dayData);
    console.log(`Day ${dayIndex} in Week ${weekIndex} updated in program:`, programId);
};

export const deleteDay = async (programId, weekIndex, dayIndex) => {
    const weekRef = ref(db, `programs/${programId}/weeks/${weekIndex}`);
    const snapshot = await get(weekRef);
    const week = snapshot.val();
    
    week.days.splice(dayIndex, 1);
    
    await update(weekRef, { days: week.days });
    console.log(`Day ${dayIndex} in Week ${weekIndex} deleted from program:`, programId);
};