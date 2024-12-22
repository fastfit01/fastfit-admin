import { ref, get, set, push, remove, update } from 'firebase/database';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  getMetadata,
  getBytes
} from 'firebase/storage';
import { db } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid'; // Assuming you are using UUID for generating IDs
import { compressImage, shouldCompress } from './utils/imageCompression';

const storage = getStorage();

export const uploadImageAndGetURL = async (imageFile, dietType, mealTime, mealId) => {
  if (!imageFile) return null;

  try {
    let fileToUpload = imageFile;
    
    // Compress image if needed
    if (shouldCompress(imageFile)) {
      fileToUpload = await compressImage(imageFile, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true
      });
    }

    const fileExtension = fileToUpload.name.split('.').pop();
    const storagePath = `meals/${dietType}/mealsData/${mealTime}/${mealId}.${fileExtension}`;
    const fileRef = storageRef(storage, storagePath);
    
    await uploadBytes(fileRef, fileToUpload);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
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
    const oldMealRef = ref(db, `meals/${oldCategory}/mealsData/${oldMealTime}/${id}`);
    const oldMealSnapshot = await get(oldMealRef);
    
    if (!oldMealSnapshot.exists()) {
      await addMeal({ ...meal, id });
      return { id, ...meal, dietType: meal.dietType, mealTime: meal.mealTime };
    }

    const oldMealData = oldMealSnapshot.val();
    let mealImageUrl = meal.imageUrl;

    // Handle image updates
    if (meal.imageFile instanceof File) {
      // If new image is being uploaded
      mealImageUrl = await uploadImageAndGetURL(meal.imageFile, meal.dietType, meal.mealTime, id);
      
      // Delete old image if it exists
      if (oldMealData.imageUrl) {
        try {
          const oldImagePath = decodeURIComponent(oldMealData.imageUrl.split('/o/')[1].split('?')[0]);
          const oldImageRef = storageRef(storage, oldImagePath);
          await deleteObject(oldImageRef);
        } catch (imageError) {
          console.warn("Error deleting old image:", imageError);
        }
      }
    } else if (oldCategory !== meal.dietType || oldMealTime !== meal.mealTime) {
      if (oldMealData.imageUrl) {
        try {
          const oldImagePath = decodeURIComponent(oldMealData.imageUrl.split('/o/')[1].split('?')[0]);
          const fileName = oldImagePath.split('/').pop();
          const newStoragePath = `meals/${meal.dietType}/mealsData/${meal.mealTime}/${fileName}`;
          
          const oldImageRef = storageRef(storage, oldImagePath);
          const newImageRef = storageRef(storage, newStoragePath);

          // Get the old file directly using Firebase Storage
          const oldMetadata = await getMetadata(oldImageRef);
          const oldBytes = await getBytes(oldImageRef);

          // Upload to new location
          await uploadBytes(newImageRef, oldBytes, {
            contentType: oldMetadata.contentType,
            customMetadata: oldMetadata.customMetadata
          });
          
          mealImageUrl = await getDownloadURL(newImageRef);
          
          // Delete old image
          await deleteObject(oldImageRef);
        } catch (imageError) {
          console.warn("Error moving image:", imageError);
          mealImageUrl = oldMealData.imageUrl;
        }
      }
    }

    const updatedMeal = {
      ...meal,
      name: meal.name || 'Untitled Meal',
      imageUrl: mealImageUrl,
    };
    delete updatedMeal.imageFile;

    // If category or meal time changed, delete old record and create new one
    if (oldCategory !== meal.dietType || oldMealTime !== meal.mealTime) {
      await remove(oldMealRef);
      const newMealRef = ref(db, `meals/${meal.dietType}/mealsData/${meal.mealTime}/${id}`);
      await set(newMealRef, updatedMeal);
    } else {
      // Otherwise just update existing record
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

export const addNewDietType = async (dietType) => {
  try {
    const dietTypeRef = ref(db, `meals/${dietType}`);
    await set(dietTypeRef, {
      dietTypeImageUrl: '',
      mealsData: {}
    });
    return true;
  } catch (error) {
    console.error("Error adding new diet type:", error);
    throw error;
  }
};

// Update getAllDietTypes to handle empty database case
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
    // If no diet types exist, create default ones
    const defaultTypes = ['Keto', 'Paleo', 'Traditional', 'Vegan', 'Vegetarian'];
    await Promise.all(defaultTypes.map(type => addNewDietType(type)));
    return defaultTypes.map(name => ({ name, imageUrl: '' }));
  } catch (error) {
    console.error("Error fetching diet types:", error);
    throw error;
  }
};

export const updateDietTypeCoverImage = async (dietType, imageFile) => {
  try {
    if (!imageFile) return null;

    let fileToUpload = imageFile;
    
    if (shouldCompress(imageFile)) {
      fileToUpload = await compressImage(imageFile, {
        maxSizeMB: 0.5, // Smaller size for cover images
        maxWidthOrHeight: 800
      });
    }

    const downloadURL = await uploadImageAndGetURL(fileToUpload, dietType, 'dietTypeCoverImage', 'cover');
    const dietTypeRef = ref(db, `meals/${dietType}`);
    await update(dietTypeRef, { dietTypeImageUrl: downloadURL });

    return downloadURL;
  } catch (error) {
    console.error("Error updating diet type cover image:", error);
    throw error;
  }
};

export const getMealsByCategory = async (category) => {
  const mealsRef = ref(db, `meals/${category}/mealsData`);
  const snapshot = await get(mealsRef);
  const meals = [];

  if (snapshot.exists()) {
    snapshot.forEach((mealTimeSnapshot) => {
      const mealTime = mealTimeSnapshot.key;
      mealTimeSnapshot.forEach((mealSnapshot) => {
        const mealData = mealSnapshot.val();
        meals.push({
          id: mealSnapshot.key,
          name: mealData.name || '',
          dietType: category,
          mealTime,
          ingredients: mealData.ingredients || '',
          instructions: mealData.instructions || '',
          imageUrl: mealData.imageUrl || '',
          imageFile: null,
          mealDuration: mealData?.mealDuration
        });
      });
    });
  }

  return meals;
};

export const deleteDietType = async (dietType) => {
  try {
    // Get all meals in this diet type first
    const mealsRef = ref(db, `meals/${dietType}`);
    const snapshot = await get(mealsRef);
    
    if (snapshot.exists()) {
      // Delete all images in storage for this diet type
      const dietTypeData = snapshot.val();
      if (dietTypeData.dietTypeImageUrl) {
        try {
          const imageRef = storageRef(storage, dietTypeData.dietTypeImageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn("Error deleting diet type cover image:", error);
        }
      }

      // Delete all meal images in this category
      if (dietTypeData.mealsData) {
        Object.values(dietTypeData.mealsData).forEach(async (mealTimeData) => {
          Object.values(mealTimeData).forEach(async (meal) => {
            if (meal.imageUrl) {
              try {
                const imageRef = storageRef(storage, meal.imageUrl);
                await deleteObject(imageRef);
              } catch (error) {
                console.warn("Error deleting meal image:", error);
              }
            }
          });
        });
      }
    }

    // Delete the diet type from database
    await remove(mealsRef);
    return true;
  } catch (error) {
    console.error("Error deleting diet type:", error);
    throw error;
  }
};
