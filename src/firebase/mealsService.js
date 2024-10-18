import { ref, get, set, push, remove, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid'; // Assuming you are using UUID for generating IDs

const storage = getStorage();

export const uploadImageAndGetURL = async (imageFile, dietType, mealTime, mealId) => {
  if (!imageFile) return null;

  const fileExtension = imageFile.name.split('.').pop();
  const storagePath = `meals/${dietType}/mealsData/${mealTime}/${mealId}.${fileExtension}`;
  const fileRef = storageRef(storage, storagePath);
  await uploadBytes(fileRef, imageFile);
  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;  
};

// Function to get all meals
export const getMeals = async () => {
  const mealsRef = ref(db, 'meals');
  const snapshot = await get(mealsRef);
  const meals = [];

  if (snapshot.exists()) {
    snapshot.forEach((dietTypeSnapshot) => {
      const dietType = dietTypeSnapshot.key;
      dietTypeSnapshot.child('mealsData').forEach((mealTimeSnapshot) => {
        const mealTime = mealTimeSnapshot.key;
        mealTimeSnapshot.forEach((mealSnapshot) => {
          const mealData = mealSnapshot.val();
          meals.push({
            id: mealSnapshot.key, // Using the key as the ID
            name: mealData.name || '',
            dietType,
            mealTime,
            ingredients: mealData.ingredients || '',
            instructions: mealData.instructions || '',
            imageUrl: mealData.imageUrl || '',
            imageFile: null,
            mealDuration:mealData?.mealDuration
          });
        });
      });
    });
  }

  return meals;
};

// Function to add a new meal
export const addMeal = async (meal) => {
  const mealId = meal.id || uuidv4();
  const mealRef = ref(db, `meals/${meal.dietType}/mealsData/${meal.mealTime}/${mealId}`);

  try {
    let mealImageUrl = meal.imageUrl || '';
    if (meal?.imageFile) {
      mealImageUrl = await uploadImageAndGetURL(meal.imageFile, meal.dietType, meal.mealTime, mealId);
    }

    const newMeal = {
      ...meal,
      id: mealId,
      name: meal.name || 'Untitled Meal', 
      imageUrl: mealImageUrl,
      createdAt: meal.createdAt || Date.now() / 1000,
    };

    delete newMeal.imageFile;

    await set(mealRef, newMeal);

    return { id: mealId, ...newMeal, dietType: meal.dietType, mealTime: meal.mealTime };
  } catch (error) {
    console.error("Error adding/updating meal:", error);
    throw error;
  }
};

export const updateMeal = async (id, meal, oldCategory, oldMealTime) => {
  try {
    let mealImageUrl = meal.imageUrl;
    if (meal.imageFile instanceof File) {
      mealImageUrl = await uploadImageAndGetURL(meal.imageFile, meal.dietType, meal.mealTime, id);
    }
    const updatedMeal = {
      ...meal,
      name: meal.name || 'Untitled Meal',  
      imageUrl: mealImageUrl,
    };
    delete updatedMeal.imageFile;

    const oldMealRef = ref(db, `meals/${oldCategory}/mealsData/${oldMealTime}/${id}`);
    const oldMealSnapshot = await get(oldMealRef);
    if (!oldMealSnapshot.exists()) {
      await addMeal({ ...meal, id });
      return { id, ...updatedMeal, dietType: meal.dietType, mealTime: meal.mealTime };
    }

    if (oldCategory !== meal.dietType || oldMealTime !== meal.mealTime) {
      const oldMealData = oldMealSnapshot.val();
      if (oldMealData && oldMealData.imageUrl) {
        const oldImageRef = storageRef(storage, oldMealData.imageUrl);
        try {
          await deleteObject(oldImageRef);
        } catch (imageError) {
          console.warn("Error deleting old meal image:", imageError);
        }
      }
      await remove(oldMealRef);
      await addMeal({ ...meal, id });
    } else {
      const mealRef = ref(db, `meals/${meal.dietType}/mealsData/${meal.mealTime}/${id}`);
      await update(mealRef, updatedMeal);
    }
    return { id, ...updatedMeal, dietType: meal.dietType, mealTime: meal.mealTime };
  } catch (error) {
    console.error("Error updating meal:", error);
    throw error;
  }
};

// Function to delete a meal
export const deleteMeal = async (mealId, mealCategory, mealTime) => {
  try {
    const mealRef = ref(db, `meals/${mealCategory}/mealsData/${mealTime}/${mealId}`);
    const snapshot = await get(mealRef);

    if (snapshot.exists()) {
      const mealData = snapshot.val();
      if (mealData && mealData.imageUrl) {
        const imageRef = storageRef(storage, mealData.imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (imageError) {
          console.warn("Error deleting meal image:", imageError);
        }
      }
      await remove(mealRef);
      return true;
    } else {
      console.log("Meal not found.");
      return false;
    }
  } catch (error) {
    console.error("Error deleting meal:", error);
    throw error;
  }
};

export const getAllDietTypes = async () => {
  try {
    const mealsRef = ref(db, 'meals');
    const snapshot = await get(mealsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const dietTypes = Object.keys(data).map(key => ({
        name: key,
        imageUrl: data[key].dietTypeImageUrl || ''
      }));
      return dietTypes;
    }
    return [];
  } catch (error) {
    console.error("Error fetching diet types:", error);
    throw error;
  }
};

export const updateDietTypeCoverImage = async (dietType, imageFile) => {
  try {
    if (!imageFile) return null;

    const downloadURL = await uploadImageAndGetURL(imageFile, dietType, 'dietTypeCoverImage', 'cover');
    const dietTypeRef = ref(db, `meals/${dietType}`);
    await update(dietTypeRef, { dietTypeImageUrl: downloadURL });

    return downloadURL;
  } catch (error) {
    console.error("Error updating diet type cover image:", error);
    throw error;
  }
};
