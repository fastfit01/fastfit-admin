import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { ref, push, set, get, query, orderByChild, equalTo, remove, update } from "firebase/database";

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

    try {
        // Upload Program Image File (if any) and get URL
        let programImageUrl = '';
        if (program.programImageFile instanceof File) {
            const imageFileRef = storageRef(storage, `programs/${newProgramRef.key}/programImageUrl/${program.programImageFile.name}`);
            await uploadBytes(imageFileRef, program.programImageFile);
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

        // Remove the File objects before saving to the database
        delete newProgram.programImageFile;

        // Save the complete program object to the database
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

    try {
        // Upload Program Image File (if any) and get URL
        let programImageUrl = program.programImageUrl;
        if (program.programImageFile instanceof File) {
            const imageFileRef = storageRef(storage, `programs/${id}/programImageUrl/${program.programImageFile.name}`);
            await uploadBytes(imageFileRef, program.programImageFile);
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

        // Remove the File objects before saving to the database
        delete updatedProgram.programImageFile;

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

        if (exercise.gifFile instanceof File) {
            const gifFileRef = storageRef(storage, `programs/${programId}/week${weekIndex}/day${dayIndex}/${type}/${exerciseIndex}/${exercise.gifFile.name}`);
            await uploadBytes(gifFileRef, exercise.gifFile);
            gifUrl = await getDownloadURL(gifFileRef);
            console.log(`Exercise GIF uploaded: ${type}, Week ${weekIndex}, Day ${dayIndex}, Exercise ${exerciseIndex}`);
        }

        processedExercises.push({
            ...exercise,
            gifUrl,
        });

        // Remove the File object
        delete processedExercises[exerciseIndex].gifFile;
    }

    return processedExercises;
};

export const deleteProgram = async (programId) => {
    try {
        // Reference to the "programs" collection in the database
        const programsRef = ref(db, "programs");

        // Query to find the program where "id" matches the given programId
        const programQuery = query(programsRef, orderByChild("id"), equalTo(programId));

        // Get the snapshot of the query result
        const snapshot = await get(programQuery);

        if (snapshot.exists()) {
            // Fetch the program key (programKey)
            const programKey = Object.keys(snapshot.val())[0];
            const programData = snapshot.val()[programKey];
 
            // If there's an associated image, delete it from Firebase Storage
            if (programData && programData.programImageUrl) {
                const imageRef = storageRef(storage, programData.programImageUrl);
                await deleteObject(imageRef);
            }

            // Delete the program data from the Realtime Database
            const programRef = ref(db, `programs/${programKey}`);
            await remove(programRef);
        } else {
            console.log("Program with the given id not found");
        }

    } catch (error) {
        console.error("Error deleting program:", error);
    }
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