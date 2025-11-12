import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyAgXaKatWVtPAk2oHVo9jd4hv8ZUFZZCtQ",
  authDomain: "todolistrn-e878f.firebaseapp.com",
  projectId: "todolistrn-e878f",
  storageBucket: "todolistrn-e878f.firebasestorage.app",
  messagingSenderId: "599063415703",
  appId: "1:599063415703:web:fe3864c19e63239ab0d2d2",
};

let app;
let firestore;
let auth;
let isFirebaseInitialized = false;

const useFirebase = () => {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [db, setDb] = useState(null);

  useEffect(() => {
    if (!isFirebaseInitialized) {
      if (!firebase.apps.length) {
        app = firebase.initializeApp(firebaseConfig);
      } else {
        app = firebase.app();
      }
      firestore = app.firestore();
      auth = app.auth();
      setDb(firestore);
      isFirebaseInitialized = true;
    }

    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user) setUserId(user.uid);
      else {
        const cred = await auth.signInAnonymously();
        setUserId(cred.user.uid);
      }
      setIsAuthReady(true);
    });

    return () => unsub();
  }, []);

  return { db, userId, isAuthReady };
};

// --- Main Component ---
export default function App() {
  const { db, userId, isAuthReady } = useFirebase();
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const collectionPath = "tasks";

  useEffect(() => {
    if (!db || !isAuthReady) return;
    const unsubscribe = db
      .collection(collectionPath)
      .orderBy("createdAt", "desc")
      .onSnapshot((snap) => {
        const fetched = [];
        snap.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
        setTasks(fetched);
        setIsLoading(false);
      });
    return () => unsubscribe();
  }, [db, isAuthReady]);

  const addTask = useCallback(async () => {
    if (!db || !taskInput.trim()) return;
    await db.collection(collectionPath).add({
      title: taskInput.trim(),
      completed: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: userId,
    });
    setTaskInput("");
  }, [db, taskInput, userId]);

  const toggleTask = useCallback(
    async (id, current) => {
      await db.collection(collectionPath).doc(id).update({ completed: !current });
    },
    [db]
  );

  const deleteTask = useCallback(
    async (id) => {
      await db.collection(collectionPath).doc(id).delete();
    },
    [db]
  );

  const renderTask = ({ item }) => (
    <View
      style={[
        styles.taskItem,
        item.completed && { backgroundColor: "#e0f7ef" },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          item.completed && styles.checkboxChecked,
        ]}
        onPress={() => toggleTask(item.id, item.completed)}
      >
        {item.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <Text
        style={[
          styles.taskText,
          item.completed && styles.taskDone,
        ]}
      >
        {item.title}
        {item.completed && " 🌸"}
      </Text>

      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.delete}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground
        source={{
          uri: "https://i.imgur.com/j8Yje3Z.jpg", // pastel floral background
        }}
        resizeMode="cover"
        style={styles.bg}
      >
        <View style={styles.overlay}>
          <Text style={styles.header}>🧠 TaskForce.exe</Text>
          <Text style={styles.subHeader}>// Initialize productivity protocol_</Text>

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type new task..."
              placeholderTextColor="#444"
              value={taskInput}
              onChangeText={setTaskInput}
              onSubmitEditing={addTask}
            />
            <TouchableOpacity
              style={[styles.addBtn, !taskInput.trim() && styles.addBtnDisabled]}
              onPress={addTask}
              disabled={!taskInput.trim()}
            >
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Task List */}
          <Text style={styles.taskListHeader}>💾 Memory Tasks</Text>
          <View style={styles.taskListBox}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#003366" />
            ) : (
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
                ListEmptyComponent={
                  <Text style={styles.empty}>✨ All systems idle. No tasks found.</Text>
                }
              />
            )}
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "700",
    color: "#002b5b",
    marginTop: 40,
    textAlign: "center",
    fontFamily: "monospace",
  },
  subHeader: {
    textAlign: "center",
    color: "#334155",
    fontSize: 14,
    marginBottom: 20,
    fontFamily: "monospace",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 10,
    shadowColor: "#002b5b",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1e293b",
  },
  addBtn: {
    backgroundColor: "#1e3a8a",
    borderRadius: 12,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#a5b4fc",
  },
  addText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "600",
  },
  taskListHeader: {
    fontSize: 18,
    color: "#1e3a8a",
    fontWeight: "700",
    marginBottom: 8,
    fontFamily: "monospace",
  },
  taskListBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingTop: 6,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginVertical: 5,
    paddingHorizontal: 5,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#1e3a8a",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1e3a8a",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "700",
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    marginHorizontal: 12,
    color: "#1e293b",
  },
  taskDone: {
    textDecorationLine: "line-through",
    color: "#64748b",
  },
  delete: {
    color: "#dc2626",
    fontSize: 24,
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    color: "#475569",
    marginTop: 40,
    fontFamily: "monospace",
  },
});
