// src/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, db } from "../services/firebase";
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInAnonymously,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Alert } from "react-native";


type Role = "guest" | "user" | "admin" | "vip";

type AppUser = {
  email: string | null;
  role: Role;
  premium: boolean;
};

type AuthContextType = {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDoc = async (uid: string) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setAppUser(snap.data() as AppUser);
    }
  };

  // 🔥 SIGN UP – upgrade to normal user
  const signUp = async (email: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          email,
          role: "user",
          premium: false,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e: any) {
      console.log("SignUp error", e);
      Alert.alert(e.message);
    }
  };

  // 🔑 LOGIN
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      console.log("Login error", e);
      Alert.alert(e.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // 👇 Anonymous guest + listener
  useEffect(() => {
    const ensureAnon = async () => {
      if (!auth.currentUser) {
        const anonCred = await signInAnonymously(auth);

        await setDoc(
          doc(db, "users", anonCred.user.uid),
          {
            email: null,
            role: "guest",
            premium: false,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    };

    ensureAnon().catch(console.log);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchUserDoc(user.uid);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, signUp, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
