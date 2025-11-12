// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const extra = (Constants.expoConfig || Constants.manifest)?.extra ?? {};

const firebaseConfig = {
  apiKey: extra.apiKey,
  authDomain: extra.authDomain,
  projectId: extra.projectId,
  storageBucket: extra.storageBucket,
  messagingSenderId: extra.messagingSenderId,
  appId: extra.appId,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
