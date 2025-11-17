import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function GenerateQRScreen() {
  const [table, setTable] = useState("");
  const [qrValue, setQrValue] = useState("");

  const handleGenerate = () => {
    if (!table.trim()) return;
    setQrValue(`smartdine://table/${table.trim()}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Table QR</Text>

      <TextInput
        placeholder="Enter table number (e.g. 5)"
        value={table}
        onChangeText={setTable}
        keyboardType="numeric"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleGenerate}>
        <Text style={styles.buttonText}>Generate QR</Text>
      </TouchableOpacity>

      {qrValue !== "" && (
        <View style={styles.qrBox}>
          <QRCode value={qrValue} size={220} />
          <Text style={styles.qrText}>{qrValue}</Text>
          <Text style={styles.hint}>
            Take a screenshot and print this QR to place on the table.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#FF8C42",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#FF8C42",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  qrBox: {
    alignItems: "center",
    marginTop: 20,
  },
  qrText: {
    marginTop: 10,
    fontSize: 12,
    color: "#555",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
});
