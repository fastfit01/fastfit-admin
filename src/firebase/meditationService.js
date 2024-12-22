import { ref, push, set, get, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { compressImage, shouldCompress } from './utils/imageCompression';

export const getMeditations = async () => {
  const meditationsRef = ref(db, 'meditations');
  const snapshot = await get(meditationsRef);
  const meditations = [];
  snapshot.forEach((childSnapshot) => {
    meditations.push({ id: childSnapshot.key, ...childSnapshot.val() });
  });
  return meditations;
};

export const addMeditation = async (meditationData) => {
  const meditationsRef = ref(db, 'meditations');
  const newMeditationRef = push(meditationsRef);

  const { audioFile, imageFile, ...otherData } = meditationData;

  const newMeditation = {
    ...otherData,
    category: otherData.category || 'focus',
    createdAt: Date.now() / 1000,
  };

  if (audioFile) {
    newMeditation.audioUrl = await uploadFile(newMeditationRef.key, 'audio', audioFile);
  }

  if (imageFile) {
    newMeditation.imageUrl = await uploadFile(newMeditationRef.key, 'image', imageFile);
  }

  await set(newMeditationRef, newMeditation);
  return { id: newMeditationRef.key, ...newMeditation };
};

export const updateMeditation = async (id, meditationData) => {
  const meditationRef = ref(db, `meditations/${id}`);

  // Get the current meditation data
  const snapshot = await get(meditationRef);
  const currentMeditation = snapshot.val();

  const { audioFile, imageFile, ...otherData } = meditationData;

  const updatedMeditation = { ...currentMeditation, ...otherData };

  if (audioFile) {
    // Delete the old audio file if it exists
    if (currentMeditation.audioUrl) {
      await deleteFile(currentMeditation.audioUrl);
    }
    updatedMeditation.audioUrl = await uploadFile(id, 'audio', audioFile);
  }

  if (imageFile) {
    // Delete the old image file if it exists
    if (currentMeditation.imageUrl) {
      await deleteFile(currentMeditation.imageUrl);
    }
    updatedMeditation.imageUrl = await uploadFile(id, 'image', imageFile);
  }

  await update(meditationRef, updatedMeditation);
  return { id, ...updatedMeditation };
};

const uploadFile = async (meditationId, fileType, file) => {
  try {
    let fileToUpload = file;

    // Only compress images, not audio files
    if (fileType === 'image' && shouldCompress(file)) {
      fileToUpload = await compressImage(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      });
    }

    const fileRef = storageRef(storage, `meditations/${meditationId}/${fileType}/${file.name}`);
    await uploadBytes(fileRef, fileToUpload);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

const deleteFile = async (fileUrl) => {
  const fileRef = storageRef(storage, fileUrl);
  try {
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

export const deleteMeditation = async (id) => {
  const meditationRef = ref(db, `meditations/${id}`);
  
  // Get the current meditation data
  const snapshot = await get(meditationRef);
  const meditation = snapshot.val();

  // Delete associated files
  if (meditation.audioUrl) {
    await deleteFile(meditation.audioUrl);
  }
  if (meditation.imageUrl) {
    await deleteFile(meditation.imageUrl);
  }

  // Delete the meditation data
  await remove(meditationRef);
};

export const getAllMeditationCategories = async () => {
  try {
    const meditationsRef = ref(db, 'meditations');
    const snapshot = await get(meditationsRef);
    const categories = new Set();
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const meditation = childSnapshot.val();
        if (meditation.category) {
          categories.add(meditation.category);
        }
      });
    }

    // If no categories exist, create default ones
    const defaultCategories = ['focus', 'relaxation', 'sleep'];
    const finalCategories = categories.size > 0 ? Array.from(categories) : defaultCategories;
    
    return finalCategories.map(name => ({
      name,
      imageUrl: ''
    }));
  } catch (error) {
    console.error("Error fetching meditation categories:", error);
    throw error;
  }
};

export const getMeditationsByCategory = async (category) => {
  const meditationsRef = ref(db, 'meditations');
  const snapshot = await get(meditationsRef);
  const meditations = [];

  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const meditation = childSnapshot.val();
      if (meditation.category === category) {
        meditations.push({
          id: childSnapshot.key,
          ...meditation
        });
      }
    });
  }

  return meditations;
};

export const addNewMeditationCategory = async (category) => {
  try {
    const meditationsRef = ref(db, 'meditations');
    const snapshot = await get(meditationsRef);
    const categories = new Set();
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const meditation = childSnapshot.val();
        if (meditation.category) {
          categories.add(meditation.category);
        }
      });
    }

    // Add the new category if it doesn't exist
    if (!categories.has(category)) {
      categories.add(category);
    }

    return Array.from(categories).map(name => ({
      name,
      imageUrl: ''
    }));
  } catch (error) {
    console.error("Error adding new meditation category:", error);
    throw error;
  }
};