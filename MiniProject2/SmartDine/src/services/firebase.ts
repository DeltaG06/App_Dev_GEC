// src/services/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDp6d0EnLKT33RkOY7YwxbaOGErtX94vU",
  authDomain: "smartdine-33471.firebaseapp.com",
  projectId: "smartdine-33471",
  storageBucket: "smartdine-33471.firebasestorage.app",
  messagingSenderId: "15685879106",
  appId: "1:15685879106:web:4fa23ab6c94175bb7874db",
  measurementId: "G-JRC31NV4ZT"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);  // 👈 simple, works
export const db = getFirestore(app);
