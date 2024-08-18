import { ref, get, set, push, remove } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './firebaseConfig';

export const uploadImageAndGetURL = async (imageFile, storagePath) => {
  if (!imageFile) return null;

  const storage = getStorage();
  const fileRef = storageRef(storage, storagePath);
  await uploadBytes(fileRef, imageFile);
  return await getDownloadURL(fileRef);
};

export const getMeals = async () => {
  const mealsRef = ref(db, 'meals');
  const snapshot = await get(mealsRef);
  return snapshot.val() || {};
};

export const addMeal = async (dietType, mealTime, mealData, imageFile) => {
  const mealRef = ref(db, `meals/${dietType}/meals/${mealTime}`);
  const newMealRef = push(mealRef);
  const mealId = newMealRef.key;

  // Upload the image and get the URL
  if (imageFile) {
    const imageUrl = await uploadImageAndGetURL(imageFile, `meals/${dietType}/${mealTime}/${mealId}`);
    mealData.imageUrl = imageUrl;
  }

  await set(newMealRef, mealData);
  return mealId;
};

export const updateMeal = async (dietType, mealTime, mealId, mealData, imageFile) => {
  const mealRef = ref(db, `meals/${dietType}/meals/${mealTime}/${mealId}`);

  if (imageFile) {
    const imageUrl = await uploadImageAndGetURL(imageFile, `meals/${dietType}/${mealTime}/${mealId}`);
    mealData.imageUrl = imageUrl;
  }

  await set(mealRef, mealData);
};

export const deleteMeal = async (dietType, mealTime, mealId) => {
  const mealRef = ref(db, `meals/${dietType}/meals/${mealTime}/${mealId}`);
  await remove(mealRef);
};