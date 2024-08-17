import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyAZFWAH_78ooJdsWWL2MnPWJh3S9j_xvp0",
  authDomain: "fastfit-14a7f.firebaseapp.com",
  databaseURL: "https://fastfit-14a7f-default-rtdb.firebaseio.com",
  projectId: "fastfit-14a7f",
  storageBucket: "fastfit-14a7f.appspot.com",
  messagingSenderId: "343713290969",
  appId: "1:343713290969:web:5667768f5807535cab3cc8",
  measurementId: "G-P9Z979B6NP"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app); 
export const auth = getAuth(app);
export const storage = getStorage(app);
