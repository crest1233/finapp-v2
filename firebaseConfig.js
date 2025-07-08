// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth }       from 'firebase/auth';
import { getFirestore }  from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD-z0FdiJJcK4M4LbF6Mkc5tjL38BKqcMc",
    authDomain: "expo-5e6c2.firebaseapp.com",
    projectId: "expo-5e6c2",
    storageBucket: "expo-5e6c2.firebasestorage.app",
    messagingSenderId: "267335214539",
    appId: "1:267335214539:web:0dafa7a25e86b33d19424e",
    measurementId: "G-C22ND6S5V9"
  };
  
const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
