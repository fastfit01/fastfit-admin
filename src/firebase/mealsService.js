import { ref, get, set, push, remove, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid'; // Assuming you are using UUID for generating IDs

const storage = getStorage();

 export const uploadImageAndGetURL = async (imageFile, storagePath) => {
  if (!imageFile) return null;

  const fileRef = storageRef(storage, storagePath);
  await uploadBytes(fileRef, imageFile);
  return await getDownloadURL(fileRef);
};

// Function to get all meals
export const getMeals = async () => {
  const mealsRef = ref(db, 'meals');
  const snapshot = await get(mealsRef);
  const meals = [];

  if (snapshot.exists()) {
    snapshot.forEach((dietTypeSnapshot) => {
      const dietType = dietTypeSnapshot.key;
      dietTypeSnapshot.child('meals').forEach((mealTimeSnapshot) => {
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
            imageFile: null
          });
        });
      });
    });
  }

  return meals;
};

// Function to add a new meal
export const addMeal = async (meal) => {
  const mealId = meal.id || uuidv4(); // Generate a new UUID if ID is not provided
  const mealRef = ref(db, `meals/${meal.dietType}/meals/${meal.mealTime}/${mealId}`);

  try {
    let mealImageUrl = meal.imageUrl || '';
    if (meal.imageFile instanceof File) {
      const imageFileRef = storageRef(storage, `meals/${meal.dietType}/meals/${meal.mealTime}/${mealId}/imageUrl/${meal.imageFile.name}`);
      await uploadBytes(imageFileRef, meal.imageFile);
      mealImageUrl = await getDownloadURL(imageFileRef);
    }

    const newMeal = {
      ...meal,
      id: mealId,
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
      const imageFileRef = storageRef(storage, `meals/${meal.dietType}/meals/${meal.mealTime}/${id}/imageUrl/${meal.imageFile.name}`);
      await uploadBytes(imageFileRef, meal.imageFile);
      mealImageUrl = await getDownloadURL(imageFileRef);
    }
    const updatedMeal = {
      ...meal,
      imageUrl: mealImageUrl,
    };
    delete updatedMeal.imageFile;

    const oldMealRef = ref(db, `meals/${oldCategory}/meals/${oldMealTime}/${id}`);
    const oldMealSnapshot = await get(oldMealRef);

    if (!oldMealSnapshot.exists()) {
       await addMeal({ ...meal, id });
      return { id, ...updatedMeal, dietType: meal.dietType, mealTime: meal.mealTime };
    }

    if (oldCategory !== meal.dietType || oldMealTime !== meal.mealTime) {
      await remove(oldMealRef);
      await addMeal({ ...meal, id });
    } else {
      const mealRef = ref(db, `meals/${meal.dietType}/meals/${meal.mealTime}/${id}`);
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
    const mealRef = ref(db, `meals/${mealCategory}/meals/${mealTime}/${mealId}`);
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

// Function to get all diet types
export const getAllDietTypes = async () => {
  try {
    const mealsRef = ref(db, 'meals');
    const snapshot = await get(mealsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const dietTypes = Object.keys(data);
      return dietTypes;
    }
    return [];
  } catch (error) {
    console.error("Error fetching diet types:", error);
    throw error;
  }
};
