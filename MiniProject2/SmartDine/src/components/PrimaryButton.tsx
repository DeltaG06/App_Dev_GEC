import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";
import { colors } from "../theme/colors";

type Props = {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  loading?: boolean;
};

export function PrimaryButton({ title, onPress, loading }: Props) {
  return (
    <TouchableOpacity
      style={[styles.btn, loading && styles.btnDisabled]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

type GhostProps = Props & { danger?: boolean };

export function GhostButton({ title, onPress, danger }: GhostProps) {
  return (
    <TouchableOpacity
      style={[styles.ghost, danger && styles.ghostDanger]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.ghostText,
          danger && { color: colors.danger, fontWeight: "600" },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginVertical: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  text: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  ghost: {
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    marginVertical: 4,
  },
  ghostDanger: {
    backgroundColor: "#FFF5F5",
  },
  ghostText: {
    color: colors.primary,
    fontSize: 14,
  },
});
