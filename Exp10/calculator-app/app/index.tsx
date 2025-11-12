import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

const { width, height } = Dimensions.get("window");

export default function CalculatorScreen() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const router = useRouter();

  const handlePress = (value: string) => {
    if (value === "C") {
      setInput("");
      setResult("");
      return;
    }

    if (value === "=") {
      try {
        const evalResult = eval(input);
        setResult(evalResult.toString());
        saveToFirebase(input, evalResult.toString());
      } catch {
        setResult("Error");
      }
      return;
    }

    setInput((prev) => prev + value);
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const saveToFirebase = async (expression: string, result: string) => {
    try {
      await addDoc(collection(db, "history"), {
        expression,
        result,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.log("Error saving to Firebase:", error);
    }
  };

  const buttons = [
    ["C", "(", ")", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "=", "←"],
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Display */}
        <View style={styles.displayContainer}>
          <View style={styles.displayBox}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.inputText}>{input || "0"}</Text>
            </ScrollView>
            <Text style={styles.resultText}>{result ? "= " + result : ""}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {buttons.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((btn) => {
                const isOperator = ["+", "-", "*", "/", "="].includes(btn);
                const isSpecial = ["C", "←"].includes(btn);

                return (
                  <TouchableOpacity
                    key={btn}
                    style={[
                      styles.button,
                      isOperator && styles.operatorButton,
                      isSpecial && styles.specialButton,
                      btn === "=" && styles.equalsButton,
                    ]}
                    onPress={() =>
                      btn === "←" ? handleBackspace() : handlePress(btn)
                    }
                  >
                    <LinearGradient
                      colors={
                        btn === "="
                          ? ["#003366", "#002244"]
                          : isOperator
                          ? ["#1e3a8a", "#1e40af"]
                          : isSpecial
                          ? ["#ef4444", "#b91c1c"]
                          : ["#e0e7ff", "#c7d2fe"]
                      }
                      style={styles.buttonInner}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          btn === "=" && { color: "#fff" },
                          isOperator && { color: "#fff" },
                          isSpecial && { color: "#fff" },
                        ]}
                      >
                        {btn}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* History Button */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/history")}
        >
          <LinearGradient
            colors={["#1e3a8a", "#1e40af"]}
            style={styles.historyGradient}
          >
            <Text style={styles.historyText}>📜 View History</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc", // light white-gray
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  displayContainer: {
    flex: 0.35,
    justifyContent: "center",
    alignItems: "center",
  },
  displayBox: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#003366",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  inputText: {
    fontSize: 40,
    color: "#003366",
    textAlign: "right",
    fontWeight: "700",
  },
  resultText: {
    fontSize: 26,
    color: "#1e3a8a",
    textAlign: "right",
    marginTop: 6,
  },
  buttonsContainer: {
    flex: 0.55,
    justifyContent: "center",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 6,
  },
  button: {
    width: width / 5.2,
    height: height / 12.5,
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e3a8a",
  },
  operatorButton: {
    borderColor: "#1e3a8a",
    borderWidth: 0.6,
  },
  specialButton: {
    borderColor: "#ef4444",
    borderWidth: 0.6,
  },
  equalsButton: {
    borderColor: "#1e40af",
    borderWidth: 1,
  },
  historyButton: {
    marginTop: 8,
    borderRadius: 25,
  },
  historyGradient: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  historyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
