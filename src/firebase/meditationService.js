import { ref, push, set, get, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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

export const addMeditation = async (meditationData) => {
  const meditationsRef = ref(db, 'meditations');
  const newMeditationRef = push(meditationsRef);

  const { audioFile, imageFile, ...otherData } = meditationData;

  const newMeditation = {
    ...otherData,
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
  const fileRef = storageRef(storage, `meditations/${meditationId}/${fileType}/${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
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