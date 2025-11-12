import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useRouter } from "expo-router";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "history"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>History</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.expression}>{item.expression}</Text>
            <Text style={styles.result}>= {item.result}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.backText}>← Back to Calculator</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#000" },
  heading: {
    color: "#fff",
    fontSize: 26,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "700",
  },
  item: {
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  expression: { color: "#ccc", fontSize: 20 },
  result: { color: "#4CAF50", fontSize: 22, fontWeight: "600" },
  backButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  backText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
