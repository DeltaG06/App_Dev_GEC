// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6g41Y4XCnjUzsjnclXQLkOn0zhttaH54",
  authDomain: "basic-auth-20569.firebaseapp.com",
  projectId: "basic-auth-20569",
  storageBucket: "basic-auth-20569.firebasestorage.app",
  messagingSenderId: "781211649855",
  appId: "1:781211649855:web:175522b0776f81fb83758a"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);

// Export initialized services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
