import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjIxvzt0PW9f6s9CMmd2Pnp7mcctApo8g",
  authDomain: "sdfw-2662f.firebaseapp.com",
  projectId: "sdfw-2662f",
  storageBucket: "sdfw-2662f.firebasestorage.app",
  messagingSenderId: "928520619205",
  appId: "1:928520619205:web:eae8a470fe13c8f71f1cac",
  measurementId: "G-NGHFPWHBPR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
