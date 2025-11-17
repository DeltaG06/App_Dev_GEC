import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { db, auth } from "../services/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

type Props = NativeStackScreenProps<RootStackParamList, "AdminDashboard">;

const { width } = Dimensions.get("window");

// ---------- THEME (light / glossy) ----------
const theme = {
  bg: "#E5E9F0", // soft grey background
  panel: "rgba(255,255,255,0.9)", // main card
  border: "rgba(148,163,184,0.35)",
  shadow: "rgba(15,23,42,0.18)",
  primary: "#FF6B35",
  primarySoft: "rgba(255,107,53,0.12)",
  secondary: "#FF8C42",
  success: "#10B981",
  successSoft: "rgba(16,185,129,0.12)",
  info: "#38BDF8",
  infoSoft: "rgba(56,189,248,0.12)",
  warning: "#EAB308",
  warningSoft: "rgba(234,179,8,0.12)",
  danger: "#EF4444",
  dangerSoft: "rgba(239,68,68,0.12)",
  vipGold: "#D4AF37",
  text: "#111827",
  textMuted: "#6B7280",
};

type UserRow = {
  id: string;
  email: string;
  premium: boolean;
  role: string;
};

// Floating emoji (subtle motion in background)
const FloatingDecoration = ({
  delay = 0,
  char = "✨",
  left = 0,
  top = 0,
}: {
  delay?: number;
  char?: string;
  left?: number;
  top?: number;
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 3300 + delay * 120,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 3300 + delay * 120,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <Animated.Text
      style={[
        styles.floatingDecor,
        {
          left,
          top,
          transform: [{ translateY }],
          opacity: animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.25, 1, 0.25],
          }),
        },
      ]}
    >
      {char}
    </Animated.Text>
  );
};

export default function AdminDashboardScreen({ navigation }: Props) {
  // Search state
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUserId, setFoundUserId] = useState<string | null>(null);
  const [foundPremium, setFoundPremium] = useState<boolean | null>(null);
  const [searching, setSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Users state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Expanded user row (for accordion)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;

  // Page entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Result card animation
  useEffect(() => {
    if (foundUserId) {
      Animated.spring(resultAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    } else {
      resultAnim.setValue(0);
    }
  }, [foundUserId]);

  // Subscribe to all users from Firestore
  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsub = onSnapshot(
      usersRef,
      (snap) => {
        const list: UserRow[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          list.push({
            id: docSnap.id,
            email: data.email ?? "(no email)",
            premium: !!data.premium,
            role: data.role ?? "user",
          });
        });
        setUsers(list);
        setUsersError(null);
        setLoadingUsers(false);
      },
      (err) => {
        console.log("Users snapshot error:", err);
        setUsersError(err.message || "Failed to load users");
        setLoadingUsers(false);
      }
    );

    return () => unsub();
  }, []);

  const totalUsers = users.length;
  const totalVip = users.filter((u) => u.premium).length;

  // ---------- LOGIC ----------

  const handleSearchUser = () => {
    const trimmed = searchEmail.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert("Search", "Enter an email to search.");
      return;
    }
    setSearching(true);

    const user = users.find(
      (u) => (u.email || "").toLowerCase() === trimmed
    );

    if (!user) {
      setFoundUserId(null);
      setFoundPremium(null);
      Alert.alert("Not found", "No user with that email.");
      setSearching(false);
      return;
    }

    setFoundUserId(user.id);
    setFoundPremium(user.premium);
    setSearching(false);
  };

  const updateVipForUser = async (userId: string, isCurrentlyVip: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        premium: !isCurrentlyVip,
      });
      Alert.alert(
        "Updated",
        `User is now ${!isCurrentlyVip ? "VIP 💎" : "a normal user"}.`
      );
    } catch (e: any) {
      console.log("Toggle VIP error:", e);
      Alert.alert("Error", e.message || "Failed to update user.");
    }
  };

  const toggleVipFromSearch = async () => {
    if (!foundUserId || foundPremium === null) return;
    await updateVipForUser(foundUserId, foundPremium);
    setFoundPremium(!foundPremium);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          } catch (e: any) {
            console.log("Logout error", e);
            Alert.alert("Error", e.message || "Failed to logout");
          }
        },
      },
    ]);
  };

  const toggleExpand = (id: string) => {
    setExpandedUserId((prev) => (prev === id ? null : id));
  };

  // ---------- RENDER ----------

  return (
    <View style={styles.container}>
      {/* Background floating emojis */}
      <View style={styles.decorationsContainer}>
        <FloatingDecoration char="💎" delay={1} left={30} top={130} />
        <FloatingDecoration char="⚡" delay={2} left={width - 70} top={210} />
        <FloatingDecoration char="🍽️" delay={3} left={60} top={420} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.panel,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.appLabel}>SmartDine · Admin</Text>
              <Text style={styles.title}>Admin Dashboard</Text>
              <Text style={styles.subtitle}>
                Monitor users, manage VIP access and jump into operations.
              </Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AD</Text>
            </View>
          </View>

          {/* SUMMARY CARDS */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <Text style={styles.summaryLabel}>Total Users</Text>
              <Text style={styles.summaryValue}>{totalUsers}</Text>
              <Text style={styles.summaryHint}>Registered accounts</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardVip]}>
              <Text style={styles.summaryLabel}>VIP Members</Text>
              <Text style={styles.summaryValue}>{totalVip}</Text>
              <Text style={styles.summaryHint}>Premium diners</Text>
            </View>
          </View>

          {/* USER MANAGEMENT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Management</Text>
            <Text style={styles.sectionHint}>
              Look up a diner by email and toggle VIP access instantly.
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Search by email</Text>
              <TextInput
                style={[
                  styles.input,
                  inputFocused && styles.inputFocused,
                ]}
                placeholder="user@example.com"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={searchEmail}
                onChangeText={setSearchEmail}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleSearchUser}
                disabled={searching}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {searching ? "Searching…" : "Search User"}
                </Text>
              </TouchableOpacity>

              {/* SEARCH RESULT */}
              {foundUserId && foundPremium !== null && (
                <Animated.View
                  style={[
                    styles.resultBox,
                    {
                      opacity: resultAnim,
                      transform: [{ scale: resultAnim }],
                    },
                  ]}
                >
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultTitle}>User found</Text>
                    <View
                      style={[
                        styles.statusPill,
                        foundPremium
                          ? styles.statusPillVip
                          : styles.statusPillNormal,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          foundPremium
                            ? styles.statusPillTextVip
                            : styles.statusPillTextNormal,
                        ]}
                      >
                        {foundPremium ? "VIP" : "Normal"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>User ID</Text>
                    <Text style={styles.resultValue} numberOfLines={1}>
                      {foundUserId}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      foundPremium
                        ? styles.buttonWarning
                        : styles.buttonSuccess,
                    ]}
                    onPress={toggleVipFromSearch}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.buttonText}>
                      {foundPremium ? "Remove VIP" : "Grant VIP"}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>

          {/* ALL USERS LIST (EXPANDABLE) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All users</Text>
            <Text style={styles.sectionHint}>
              Everyone who has signed up in SmartDine.
            </Text>

            <View style={styles.card}>
              {loadingUsers ? (
                <View style={styles.centerRow}>
                  <ActivityIndicator color={theme.primary} />
                  <Text style={styles.emptyText}>Loading users…</Text>
                </View>
              ) : usersError ? (
                <Text style={styles.emptyText}>
                  Error: {usersError}
                  {"\n"}
                  (Fix Firestore rules to allow admin read access.)
                </Text>
              ) : users.length === 0 ? (
                <Text style={styles.emptyText}>
                  No users yet. Ask someone to sign up to see them here.
                </Text>
              ) : (
                <View>
                  {users.map((u, index) => {
                    const isExpanded = expandedUserId === u.id;
                    return (
                      <View key={u.id} style={styles.userRowContainer}>
                        {/* tap row */}
                        <TouchableOpacity
                          style={styles.userRow}
                          onPress={() => toggleExpand(u.id)}
                          activeOpacity={0.8}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.userEmail}>{u.email}</Text>
                            <View style={styles.userMetaRow}>
                              <Text style={styles.userRole}>
                                {u.role || "user"}
                              </Text>
                              {u.premium && (
                                <Text style={styles.userVipTag}>VIP</Text>
                              )}
                            </View>
                          </View>

                          <Text style={styles.expandIcon}>
                            {isExpanded ? "▲" : "▼"}
                          </Text>
                        </TouchableOpacity>

                        {/* expanded box */}
                        {isExpanded && (
                          <View style={styles.expandBox}>
                            <Text style={styles.idLabel}>User ID</Text>
                            <Text
                              style={styles.idValue}
                              numberOfLines={1}
                            >
                              {u.id}
                            </Text>

                            <TouchableOpacity
                              style={[
                                styles.userVipButton,
                                u.premium
                                  ? styles.userVipButtonRemove
                                  : styles.userVipButtonAdd,
                              ]}
                              onPress={() =>
                                updateVipForUser(u.id, u.premium)
                              }
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.userVipButtonText,
                                  u.premium
                                    ? styles.userVipButtonTextRemove
                                    : styles.userVipButtonTextAdd,
                                ]}
                              >
                                {u.premium ? "Remove VIP" : "Grant VIP"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {index !== users.length - 1 && (
                          <View style={styles.userRowDivider} />
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* QUICK ACTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <Text style={styles.sectionHint}>
              Shortcuts to main operational screens.
            </Text>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardOrange]}
                onPress={() => navigation.navigate("AdminMenu")}
                activeOpacity={0.85}
              >
                <Text style={styles.actionIcon}>🍕</Text>
                <Text style={styles.actionTitle}>Menu Items</Text>
                <Text style={styles.actionSubtitle}>Create & edit dishes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardGreen]}
                onPress={() => navigation.navigate("KitchenOrders")}
                activeOpacity={0.85}
              >
                <Text style={styles.actionIcon}>👨‍🍳</Text>
                <Text style={styles.actionTitle}>Kitchen</Text>
                <Text style={styles.actionSubtitle}>Live order queue</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardBlue]}
                onPress={() => navigation.navigate("GenerateQR")}
                activeOpacity={0.85}
              >
                <Text style={styles.actionIcon}>📷</Text>
                <Text style={styles.actionTitle}>QR Tables</Text>
                <Text style={styles.actionSubtitle}>Generate table codes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* LOGOUT */}
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger, { marginTop: 12 }]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ---------- STYLES ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  decorationsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  floatingDecor: {
    position: "absolute",
    fontSize: 22,
    color: "rgba(148,163,184,0.8)",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  panel: {
    backgroundColor: theme.panel,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  appLabel: {
    fontSize: 11,
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.textMuted,
    maxWidth: width * 0.65,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: theme.primarySoft,
    borderWidth: 1,
    borderColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  avatarText: {
    color: theme.primary,
    fontWeight: "800",
    fontSize: 14,
  },

  // Summary cards
  summaryRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  summaryCardPrimary: {
    marginRight: 8,
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft,
  },
  summaryCardVip: {
    borderColor: theme.vipGold,
    backgroundColor: theme.warningSoft,
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.text,
    marginVertical: 4,
  },
  summaryHint: {
    fontSize: 11,
    color: theme.textMuted,
  },

  // Sections
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.text,
    marginBottom: 2,
  },
  sectionHint: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 10,
  },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },

  // Input
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.text,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginBottom: 10,
  },
  inputFocused: {
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },

  // Buttons
  button: {
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 4,
  },
  buttonPrimary: {
    backgroundColor: theme.primary,
  },
  buttonSuccess: {
    backgroundColor: theme.success,
    marginTop: 10,
  },
  buttonWarning: {
    backgroundColor: theme.warning,
    marginTop: 10,
  },
  buttonDanger: {
    backgroundColor: theme.danger,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Search result
  resultBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.secondary,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.text,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: theme.textMuted,
  },
  resultValue: {
    fontSize: 11,
    color: theme.text,
    maxWidth: width * 0.5,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillVip: {
    borderColor: theme.vipGold,
    backgroundColor: "rgba(212,175,55,0.12)",
  },
  statusPillNormal: {
    borderColor: theme.border,
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusPillTextVip: {
    color: theme.vipGold,
  },
  statusPillTextNormal: {
    color: theme.textMuted,
  },

  // Users list
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 11,
    color: theme.textMuted,
    marginLeft: 8,
    marginTop: 4,
  },

  userRowContainer: {
    paddingVertical: 6,
  },
  userRowDivider: {
    height: 1,
    backgroundColor: "rgba(209,213,219,0.7)",
    marginTop: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.text,
  },
  userMetaRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  userRole: {
    fontSize: 11,
    color: theme.textMuted,
    marginRight: 8,
  },
  userVipTag: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.vipGold,
  },
  expandIcon: {
    fontSize: 14,
    color: theme.textMuted,
    marginLeft: 8,
  },
  expandBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(209,213,219,0.9)",
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4,
  },
  idLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.textMuted,
  },
  idValue: {
    fontSize: 11,
    color: theme.text,
    marginBottom: 8,
  },

  userVipButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  userVipButtonAdd: {
    borderColor: theme.success,
    backgroundColor: theme.successSoft,
  },
  userVipButtonRemove: {
    borderColor: theme.danger,
    backgroundColor: theme.dangerSoft,
  },
  userVipButtonText: {
    fontSize: 11,
    fontWeight: "700",
  },
  userVipButtonTextAdd: {
    color: theme.success,
  },
  userVipButtonTextRemove: {
    color: theme.danger,
  },

  // Quick actions
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    marginRight: 8,
  },
  actionCardOrange: {
    backgroundColor: theme.primarySoft,
  },
  actionCardGreen: {
    backgroundColor: theme.successSoft,
  },
  actionCardBlue: {
    backgroundColor: theme.infoSoft,
    marginRight: 0,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.text,
  },
  actionSubtitle: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 2,
  },
});
