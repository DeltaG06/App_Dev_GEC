import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { CartContext } from "../context/CartContext";

type Props = NativeStackScreenProps<RootStackParamList, "QrScan">;

export default function QrScanScreen({ navigation }: Props) {
  const { setTableNumber } = useContext(CartContext);
  const [code, setCode] = useState("");

  const parseTableFromCode = (value: string): string | null => {
    const trimmed = value.trim();

    // smartdine://table/5
    const urlMatch = trimmed.match(/table[\/_-](\d+)/i);
    if (urlMatch) return urlMatch[1];

    // TABLE_5 or table-5
    const simpleMatch = trimmed.match(/table[_-](\d+)/i);
    if (simpleMatch) return simpleMatch[1];

    // just "5"
    if (/^\d+$/.test(trimmed)) return trimmed;

    return null;
  };

  const handleConfirm = () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter a table code or number.");
      return;
    }

    const table = parseTableFromCode(code);
    if (!table) {
      Alert.alert(
        "Invalid code",
        "Could not detect a table number. Try 5 or TABLE_5 or smartdine://table/5."
      );
      return;
    }

    setTableNumber(table);
    Alert.alert("Table selected", `You are at table ${table}.`, [
      {
        text: "OK",
        onPress: () => navigation.replace("Menu"),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Table Code</Text>
      <Text style={styles.subtitle}>
        In final version this is scanned from a QR.{"\n"}
        For this prototype, type the code printed on the table.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Table Code / Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5 or TABLE_5 or smartdine://table/5"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Set Table</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        For demo: generate QR with value{" "}
        <Text style={{ fontWeight: "bold" }}>smartdine://table/5</Text>,{"\n"}
        then just type that value here to simulate scanning.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF8C42",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
    marginTop: 4,
    fontSize: 13,
  },
  card: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#FF8C42",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  hint: {
    marginTop: 16,
    fontSize: 11,
    color: "#999",
    textAlign: "center",
  },
});
