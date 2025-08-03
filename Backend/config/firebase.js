// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDT_Nt1QbJC0735dByKfE4K4Buall2W8s",
  authDomain: "resear-analisyst.firebaseapp.com",
  projectId: "resear-analisyst",
  storageBucket: "resear-analisyst.firebasestorage.app",
  messagingSenderId: "986663043604",
  appId: "1:986663043604:web:2e14c30c02f82e50565d01",
  measurementId: "G-GFEVPT1C0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
