import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { AuthContext } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "VipPerks">;

export default function VipPerksScreen({}: Props) {
  const { appUser } = useContext(AuthContext);

  if (!appUser?.premium) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>VIP Area</Text>
        <Text style={styles.text}>
          This area is only for VIP guests. Ask staff to upgrade you from the
          Admin panel.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, VIP Guest 💎</Text>
      <Text style={styles.text}>
        You now get priority service and access to exclusive dishes.
      </Text>
      <Text style={styles.text}>• VIP-only menu items are unlocked.</Text>
      <Text style={styles.text}>• Your orders show with a VIP badge.</Text>
      <Text style={styles.text}>• You may receive special discounts.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#FFF" },
  title: { fontSize: 24, fontWeight: "bold", color: "#FF8C42", marginBottom: 12 },
  text: { fontSize: 14, marginBottom: 6, color: "#444" },
});
