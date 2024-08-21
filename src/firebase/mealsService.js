import { ref, get, set, push, remove, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db } from './firebaseConfig';

const storage = getStorage();

export const uploadImageAndGetURL = async (imageFile, storagePath) => {
  if (!imageFile) return null;

 
  const fileRef = storageRef(storage, storagePath);
  await uploadBytes(fileRef, imageFile);
  return await getDownloadURL(fileRef);
};

export const getMeals = async () => {
  const mealsRef = ref(db, 'meals');
  const snapshot = await get(mealsRef);
  const meals = [];
  if (snapshot.exists()) {
    snapshot.forEach((dietTypeSnapshot) => {
      const dietType = dietTypeSnapshot.key;
      dietTypeSnapshot.forEach((mealTimeSnapshot) => {
        const mealTime = mealTimeSnapshot.key;
        mealTimeSnapshot.forEach((mealSnapshot) => {
          meals.push({
            id: mealSnapshot.key,
            dietType,
            mealTime,
            ...mealSnapshot.val(),
          });
        });
      });
    });
  }
 
  return meals;
};

export const addMeal = async (meal) => {
  const categoryRef = ref(db, `meals/${meal.dietType}/meals/${meal.mealTime}`);
  const newMealRef = meal.id ? ref(db, `meals/${meal.dietType}/meals/${meal.mealTime}/${meal.id}`) : push(categoryRef);

  try {
    let mealImageUrl = meal.imageUrl || '';
    if (meal.imageFile instanceof File) {
      const imageFileRef = storageRef(storage, `meals/${meal.dietType}/${meal.mealTime}/${newMealRef.key}/imageUrl/${meal.imageFile.name}`);
      await uploadBytes(imageFileRef, meal.imageFile);
      mealImageUrl = await getDownloadURL(imageFileRef);
     }

    const newMeal = {
      ...meal,
      imageUrl: mealImageUrl,
      createdAt: meal.createdAt || Date.now() / 1000,
    };

    delete newMeal.imageFile;
    delete newMeal.dietType;
    delete newMeal.mealTime;

    await set(newMealRef, newMeal);
   
    return { id: newMealRef.key, ...newMeal, dietType: meal.dietType, mealTime: meal.mealTime };
  } catch (error) {
    console.error("Error adding/updating meal:", error);
    throw error;
  }
};
 
export const updateMeal = async (id, meal, oldCategory, oldMealTime) => {
  try {
     if (oldCategory !== meal.dietType || oldMealTime !== meal.mealTime) {
       await deleteMeal(id, oldCategory, oldMealTime);
        const newMealId = await addMeal(meal);
      return { id: newMealId, ...meal };
    }

    const mealRef = ref(db, `meals/${meal.dietType}/meals/${meal.mealTime}/${id}`);
    let mealImageUrl = meal.imageUrl;
    if (meal.imageFile instanceof File) {
      const imageFileRef = storageRef(storage, `meals/${meal.dietType}/${meal.mealTime}/${id}/imageUrl/${meal.imageFile.name}`);
      await uploadBytes(imageFileRef, meal.imageFile);
      mealImageUrl = await getDownloadURL(imageFileRef);
    }
    const updatedMeal = {
      ...meal,
      imageUrl: mealImageUrl,
    };
    delete updatedMeal.imageFile;
    await update(mealRef, updatedMeal);
     return { id, ...updatedMeal, dietType: meal.dietType, mealTime: meal.mealTime };
  } catch (error) {
    console.error("Error updating meal:", error);
    throw error;
  }
};



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