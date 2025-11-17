import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { AuthContext } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "VipUpsell">;

export default function VipUpsellScreen({ navigation }: Props) {
  const { appUser } = useContext(AuthContext);

  const isVip = !!appUser?.premium;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartDine VIP 💎</Text>
      <Text style={styles.subtitle}>
        Priority service. Secret menu. Exclusive discounts.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>VIP Perks</Text>
        <Text style={styles.bullet}>• Priority order preparation</Text>
        <Text style={styles.bullet}>• Access to secret menu items</Text>
        <Text style={styles.bullet}>• Extra discounts on favourites</Text>
        <Text style={styles.bullet}>• Special badge on your orders</Text>
      </View>

      {isVip ? (
        <>
          <Text style={styles.info}>You are already a VIP guest 🎉</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("VipPerks")}
          >
            <Text style={styles.buttonText}>View My VIP Perks</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.info}>
            Ask a staff member to upgrade you to VIP from the Admin panel.
          </Text>
          <Text style={styles.infoSmall}>
            (For demo: your teacher/admin will toggle your VIP status.)
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#FFF" },
  title: { fontSize: 28, fontWeight: "bold", color: "#FF8C42", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 16 },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFF3E6",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  bullet: { fontSize: 14, color: "#555", marginBottom: 4 },
  info: { fontSize: 14, marginTop: 8, color: "#444" },
  infoSmall: { fontSize: 12, marginTop: 4, color: "#777" },
  button: {
    marginTop: 16,
    backgroundColor: "#FF8C42",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold" },
});
