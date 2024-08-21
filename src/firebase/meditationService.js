import { ref, push, set, get, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
 


export const getMeditations = async () => {
    const meditationsRef = ref(db, 'meditations');
    const snapshot = await get(meditationsRef);
    const meditations = [];
    snapshot.forEach((childSnapshot) => {
      meditations.push({ id: childSnapshot.key, ...childSnapshot.val() });
    });
    return meditations;
  };
  
  export const addMeditation = async ({ title, duration, audioFile, category, description, difficulty, imageUrl, tags }) => {
    const meditationsRef = ref(db, 'meditations');
    const newMeditationRef = push(meditationsRef);
    
    let audioUrl = '';
    let imageDownloadUrl = '';

    // Upload Audio File (if any)
    if (audioFile) {
        const audioFileRef = storageRef(storage, `meditations/${newMeditationRef.key}/audio/${audioFile.name}`);
        await uploadBytes(audioFileRef, audioFile);
        audioUrl = await getDownloadURL(audioFileRef);
    }

    // Upload Image File (if any)
    if (imageUrl && typeof imageUrl !== 'string') { // Check if it's a file, not a string
        const imageFileRef = storageRef(storage, `meditations/${newMeditationRef.key}/image/${imageUrl.name}`);
        await uploadBytes(imageFileRef, imageUrl);
        imageDownloadUrl = await getDownloadURL(imageFileRef);
    }

    const newMeditation = {
        title,
        duration,
        audioUrl,
        category,
        description,
        difficulty,
        imageUrl: imageDownloadUrl || '', // Save the image download URL to the database
        tags,
        createdAt: Date.now() / 1000, // Current timestamp in seconds
    };

    await set(newMeditationRef, newMeditation);

    return { id: newMeditationRef.key, ...newMeditation };
};

export const updateMeditation = async (id, { title, duration, audioFile, category, description, difficulty, imageUrl, tags }) => {
    const meditationRef = ref(db, `meditations/${id}`);
 
    
    let audioUrl = '';
    let imageDownloadUrl = imageUrl; // Keep the existing image URL if no new file is uploaded

    // Upload Audio File (if any)
    if (audioFile) {
        const audioFileRef = storageRef(storage, `meditations/${id}/audio/${audioFile.name}`);
        await uploadBytes(audioFileRef, audioFile);
        audioUrl = await getDownloadURL(audioFileRef);
    }

    // Upload Image File (if any)
    if (imageUrl && typeof imageUrl !== 'string') { // Check if it's a file, not a string
        const imageFileRef = storageRef(storage, `meditations/${id}/image/${imageUrl.name}`);
        await uploadBytes(imageFileRef, imageUrl);
        imageDownloadUrl = await getDownloadURL(imageFileRef);
    }

    const updatedMeditation = {
        title,
        duration,
        ...(audioUrl && { audioUrl }), // Add audio URL only if it exists
        category,
        description,
        difficulty,
        imageUrl: imageDownloadUrl, // Update the image URL
        tags,
    };

    await update(meditationRef, updatedMeditation);

    return { id, ...updatedMeditation };
};


export const deleteMeditation = async (id) => {
  const meditationRef = ref(db, `meditations/${id}`);
  await remove(meditationRef);
};