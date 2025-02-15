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
import { v4 as uuidv4 } from 'uuid';
import { compressImage, shouldCompress } from './utils/imageCompression';

const storage = getStorage();

export const uploadImageAndGetURL = async (imageFile, problemAreaCategory, name, workoutId) => {
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
    const storagePath = `problemAreaWorkouts/${problemAreaCategory}/workoutsData/${workoutId}.${fileExtension}`;
    const fileRef = storageRef(storage, storagePath);
    
    await uploadBytes(fileRef, fileToUpload);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Function to get all problem area workouts
export const getProblemAreaWorkouts = async () => {
  const workoutsRef = ref(db, 'problemAreaWorkouts');
  const snapshot = await get(workoutsRef);
  const workouts = [];

  if (snapshot.exists()) {
    snapshot.forEach((categorySnapshot) => {
      const problemAreaCategory = categorySnapshot.key;
      categorySnapshot.child('workoutsData').forEach((workoutSnapshot) => {
        const workoutData = workoutSnapshot.val();
        workouts.push({
          id: workoutSnapshot.key,
          name: workoutData.name || '',
          problemAreaCategory,
          description: workoutData.description || '',
          imageUrl: workoutData.imageUrl || '',
          gifUrl: workoutData.gifUrl || '',
          imageFile: null,
          gifFile: null,
          problemAreaCategoryDescription: workoutData.problemAreaCategoryDescription || '',
        });
      });
    });
  }

  return workouts;
};

// Function to add a new problem area workout
export const addProblemAreaWorkout = async (workout) => {
  const workoutId = workout.id || uuidv4();
  const workoutRef = ref(db, `problemAreaWorkouts/${workout.problemAreaCategory}/workoutsData/${workoutId}`);

  try {
    let workoutImageUrl = workout.imageUrl || '';
    let workoutGifUrl = workout.gifUrl || '';

    const newWorkout = {
      ...workout,
      id: workoutId,
      name: workout.name || 'Untitled Problem Area Workout', 
      imageUrl: workoutImageUrl,
      gifUrl: workoutGifUrl,
      problemAreaCategoryDescription: workout.problemAreaCategoryDescription || '',
      createdAt: workout.createdAt || Date.now() / 1000,
    };

    await set(workoutRef, newWorkout);

    // Ensure the category exists with its description
    const categoryRef = ref(db, `problemAreaCategories/${workout.problemAreaCategory}`);
    const categorySnapshot = await get(categoryRef);
    
    if (!categorySnapshot.exists()) {
      await addProblemAreaCategory(
        workout.problemAreaCategory, 
        workout.problemAreaCategoryDescription || ''
      );
    }

    return { 
      id: workoutId, 
      ...newWorkout, 
      problemAreaCategory: workout.problemAreaCategory 
    };
  } catch (error) {
    console.error("Error adding/updating problem area workout:", error);
    throw error;
  }
};

export const updateProblemAreaWorkout = async (id, workout, oldCategory) => {
  try {
    const oldWorkoutRef = ref(db, `problemAreaWorkouts/${oldCategory}/workoutsData/${id}`);
    const oldWorkoutSnapshot = await get(oldWorkoutRef);
    
    if (!oldWorkoutSnapshot.exists()) {
      await addProblemAreaWorkout({ ...workout, id });
      return { 
        id, 
        ...workout, 
        problemAreaCategory: workout.problemAreaCategory 
      };
    }

    const oldWorkoutData = oldWorkoutSnapshot.val();
    let workoutImageUrl = workout.imageUrl;
    let workoutGifUrl = workout.gifUrl;

    // Handle image updates
    if (workout.imageFile instanceof File) {
      workoutImageUrl = await uploadImageAndGetURL(
        workout.imageFile,
        workout.problemAreaCategory,
        workout.name,
        `${id}_image`
      );
      
      // Delete old image if it exists
      if (oldWorkoutData.imageUrl) {
        try {
          const oldImagePath = decodeURIComponent(oldWorkoutData.imageUrl.split('/o/')[1].split('?')[0]);
          const oldImageRef = storageRef(storage, oldImagePath);
          await deleteObject(oldImageRef);
        } catch (imageError) {
          console.warn("Error deleting old image:", imageError);
        }
      }
    }

    // Handle GIF updates
    if (workout.gifFile instanceof File) {
      workoutGifUrl = await uploadImageAndGetURL(
        workout.gifFile,
        workout.problemAreaCategory,
        workout.name,
        `${id}_gif`
      );
      
      // Delete old GIF if it exists
      if (oldWorkoutData.gifUrl) {
        try {
          const oldGifPath = decodeURIComponent(oldWorkoutData.gifUrl.split('/o/')[1].split('?')[0]);
          const oldGifRef = storageRef(storage, oldGifPath);
          await deleteObject(oldGifRef);
        } catch (gifError) {
          console.warn("Error deleting old GIF:", gifError);
        }
      }
    }

    const updatedWorkout = {
      ...workout,
      name: workout.name || 'Untitled Problem Area Workout',
      imageUrl: workoutImageUrl,
      gifUrl: workoutGifUrl,
      problemAreaCategoryDescription: workout.problemAreaCategoryDescription || '',
    };
    delete updatedWorkout.imageFile;
    delete updatedWorkout.gifFile;

    // Ensure the category exists with its description
    const categoryRef = ref(db, `problemAreaCategories/${workout.problemAreaCategory}`);
    const categorySnapshot = await get(categoryRef);
    
    if (!categorySnapshot.exists()) {
      await addProblemAreaCategory(
        workout.problemAreaCategory, 
        workout.problemAreaCategoryDescription || ''
      );
    }

    // If category changed, delete old record and create new one
    if (oldCategory !== workout.problemAreaCategory) {
      await remove(oldWorkoutRef);
      const newWorkoutRef = ref(db, `problemAreaWorkouts/${workout.problemAreaCategory}/workoutsData/${id}`);
      await set(newWorkoutRef, updatedWorkout);
    } else {
      // Otherwise just update existing record
      const workoutRef = ref(db, `problemAreaWorkouts/${workout.problemAreaCategory}/workoutsData/${id}`);
      await update(workoutRef, updatedWorkout);
    }

    return { 
      id, 
      ...updatedWorkout, 
      problemAreaCategory: workout.problemAreaCategory 
    };
  } catch (error) {
    console.error("Error updating problem area workout:", error);
    throw error;
  }
};

// Function to delete a problem area workout
export const deleteProblemAreaWorkout = async (workoutId, problemAreaCategory) => {
  try {
    const workoutRef = ref(db, `problemAreaWorkouts/${problemAreaCategory}/workoutsData/${workoutId}`);
    const snapshot = await get(workoutRef);

    if (snapshot.exists()) {
      const workoutData = snapshot.val();
      if (workoutData && workoutData.imageUrl) {
        const imageRef = storageRef(storage, workoutData.imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (imageError) {
          console.warn("Error deleting workout image:", imageError);
        }
      }
      
      if (workoutData && workoutData.gifUrl) {
        const gifRef = storageRef(storage, workoutData.gifUrl);
        try {
          await deleteObject(gifRef);
        } catch (gifError) {
          console.warn("Error deleting workout GIF:", gifError);
        }
      }
      
      await remove(workoutRef);
    }
  } catch (error) {
    console.error("Error deleting problem area workout:", error);
    throw error;
  }
};

// Function to add a new problem area category
export const addProblemAreaCategory = async (categoryName, categoryDescription = '', imageUrl = '') => {
  if (!categoryName) {
    throw new Error('Category name is required');
  }

  const categoryRef = ref(db, `problemAreaCategories/${categoryName}`);
  
  const categoryData = {
    name: categoryName,
    description: categoryDescription || '',
    imageUrl: imageUrl || '',
    createdAt: Date.now() / 1000,
  };

  try {
    await set(categoryRef, categoryData);
    return categoryData;
  } catch (error) {
    console.error("Error adding problem area category:", error);
    throw error;
  }
};

const initialProblemAreaCategories = [
  { 
    name: 'Glutes and hips', 
    description: 'A set of exercises targeting the glutes, hip flexors, and abductors to improve strength, stability, and mobility. Includes movements like squats, lunges, hip thrusts, and lateral steps for enhanced lower-body performance.',
    imageUrl: '' 
  }, 
  { 
    name: 'Abs & Core', 
    description: 'A collection of exercises focusing on the abdominal muscles, obliques, and lower back to improve strength, stability, and posture. Includes movements like crunches, planks, leg raises, and twists for a strong and balanced core.',
    imageUrl: '' 
  }, 
  { 
    name: 'Arms', 
    description: 'A set of exercises targeting the biceps, triceps, and forearms to build strength and definition. Includes movements like curls, dips, push-ups, and extensions for balanced arm development.',
    imageUrl: '' 
  }
];

// Function to get all problem area categories
export const getAllProblemAreaCategories = async () => {
  const categoriesRef = ref(db, 'problemAreaCategories');
  const snapshot = await get(categoriesRef);
  const categories = [];

  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const categoryData = childSnapshot.val();
      categories.push({
        name: categoryData.name,
        description: categoryData.description || '',
        imageUrl: categoryData.imageUrl || '',
      });
  
    });
  }

  // If no categories found in database, add initial categories
  if (categories.length === 0) {
    // Attempt to add initial categories to the database
    for (const category of initialProblemAreaCategories) {
      try {
        await addProblemAreaCategory(category.name, category.description, category.imageUrl);
      } catch (error) {
        console.error(`Error adding initial category ${category.name}:`, error);
      }
    }
    return initialProblemAreaCategories;
  }

  return categories;
};

// Function to update problem area category cover image
export const updateProblemAreaCategoryImage = async (categoryName, imageFile) => {
  if (!categoryName || !imageFile) {
    throw new Error('Category name and image file are required');
  }

  try {
    // Upload image to Firebase Storage
    const storageLocation = `problemAreaCategories/${categoryName}/coverImage`;
    const storageReference = storageRef(storage, storageLocation);
    
    // Upload the file
    await uploadBytes(storageReference, imageFile);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageReference);
    
    // Update category in Realtime Database
    const categoryRef = ref(db, `problemAreaCategories/${categoryName}`);
    await update(categoryRef, { imageUrl: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error("Error updating problem area category image:", error);
    throw error;
  }
};

// Function to delete a problem area category
export const deleteProblemAreaCategory = async (problemAreaCategory) => {
  try {
    const categoryRef = ref(db, `problemAreaCategories/${problemAreaCategory}`);
    const snapshot = await get(categoryRef);

    if (snapshot.exists()) {
      const categoryData = snapshot.val();
      
      // Delete category cover image if it exists
      if (categoryData.imageUrl) {
        const imageRef = storageRef(storage, categoryData.imageUrl);
        try {
          await deleteObject(imageRef);
        } catch (imageError) {
          console.warn("Error deleting category cover image:", imageError);
        }
      }

      // Delete all workouts in this category
      const workoutsRef = ref(db, `problemAreaWorkouts/${problemAreaCategory}/workoutsData`);
      const workoutsSnapshot = await get(workoutsRef);
      
      if (workoutsSnapshot.exists()) {
        workoutsSnapshot.forEach(async (workoutSnapshot) => {
          const workoutData = workoutSnapshot.val();
          if (workoutData.imageUrl) {
            const imageRef = storageRef(storage, workoutData.imageUrl);
            try {
              await deleteObject(imageRef);
            } catch (imageError) {
              console.warn("Error deleting workout image:", imageError);
            }
          }
          if (workoutData.gifUrl) {
            const gifRef = storageRef(storage, workoutData.gifUrl);
            try {
              await deleteObject(gifRef);
            } catch (gifError) {
              console.warn("Error deleting workout GIF:", gifError);
            }
          }
        });
      }

      // Remove the entire category
      await remove(categoryRef);
    }
  } catch (error) {
    console.error("Error deleting problem area category:", error);
    throw error;
  }
};