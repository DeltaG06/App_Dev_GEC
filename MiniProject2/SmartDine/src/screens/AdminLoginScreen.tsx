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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { auth, db } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

type Props = NativeStackScreenProps<RootStackParamList, "AdminLogin">;

const { width } = Dimensions.get('window');

// Theme matching HomeScreen
const theme = {
  bg: '#FFFFFF',
  primary: '#FF6B35',
  primaryDark: '#E85A28',
  accent: '#FF8C42',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#1F2937',
  textMuted: '#6B7280',
  inputBg: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputFocusBorder: '#FF6B35',
};

// Floating decoration component
const FloatingDecoration = ({ delay = 0, char = '✨' }: { delay?: number; char?: string }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 3000 + delay * 100,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 3000 + delay * 100,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <Animated.Text
      style={[
        styles.floatingDecor,
        {
          transform: [{ translateY }],
          opacity: animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 1, 0.3],
          }),
        },
      ]}
    >
      {char}
    </Animated.Text>
  );
};

export default function AdminLoginScreen({ navigation }: Props) {
  // All hooks at the top
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [shakeAnim] = useState(new Animated.Value(0));

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const lockRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Lock subtle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(lockRotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(lockRotate, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleAdminLogin = async () => {
    if (!email || !password || !adminCode) {
      triggerShake();
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // fetch user doc to check role
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        triggerShake();
        Alert.alert("Access denied", "You are not an admin user.");
        return;
      }

      // Check admin code from Firestore config
      const configSnap = await getDoc(doc(db, "appConfig", "prod"));
      const config = configSnap.data();
      if (!config || config.adminCode !== adminCode) {
        triggerShake();
        Alert.alert("Invalid code", "Admin code is incorrect.");
        return;
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "AdminDashboard" }],
      });
    } catch (e: any) {
      console.log("Admin login error", e);
      triggerShake();
      Alert.alert("Login failed", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const rotate = lockRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Floating decorations */}
        <View style={styles.decorationsContainer}>
          <FloatingDecoration char="🔐" delay={0} />
          <FloatingDecoration char="✨" delay={2} />
          <FloatingDecoration char="🛡️" delay={1} />
          <FloatingDecoration char="⚡" delay={3} />
        </View>

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Header with animated lock icon */}
          <Animated.Text
            style={[
              styles.lockIcon,
              { transform: [{ rotate }] }
            ]}
          >
            🔐
          </Animated.Text>

          <Text style={styles.title}>Admin Portal</Text>
          <View style={styles.subtitleContainer}>
            <View style={styles.warningBadge}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.subtitle}>Restricted Access</Text>
            </View>
          </View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.card,
              { transform: [{ translateX: shakeAnim }] }
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Staff Login</Text>
              <Text style={styles.cardSubtitle}>Authorized personnel only</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📧 Admin Email</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused
                ]}
                placeholder="admin@smartdine.com"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔑 Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused
                ]}
                placeholder="Enter your password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🎯 Admin Code</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'code' && styles.inputFocused
                ]}
                placeholder="6-digit access code"
                placeholderTextColor={theme.textMuted}
                value={adminCode}
                onChangeText={setAdminCode}
                onFocus={() => setFocusedInput('code')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled
              ]}
              onPress={handleAdminLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? "⏳ Authenticating..." : "🚀 Access Dashboard"}
              </Text>
            </TouchableOpacity>

            <View style={styles.securityNote}>
              <Text style={styles.securityIcon}>🛡️</Text>
              <Text style={styles.securityText}>
                All login attempts are monitored and logged
              </Text>
            </View>
          </Animated.View>

          {/* Back to home */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Corner decorations */}
        <Text style={styles.cornerDecor1}>⚡</Text>
        <Text style={styles.cornerDecor2}>🔐</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  decorationsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  floatingDecor: {
    position: 'absolute',
    fontSize: 24,
    left: Math.random() * (width - 40),
    top: Math.random() * 600,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: theme.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.primary,
    gap: 6,
  },
  warningIcon: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  cardHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.inputBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.text,
    borderWidth: 2,
    borderColor: theme.inputBorder,
  },
  inputFocused: {
    borderColor: theme.inputFocusBorder,
    backgroundColor: '#FFFFFF',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.cardBorder,
    gap: 6,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.primary,
    fontWeight: '600',
  },
  cornerDecor1: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 28,
    opacity: 0.3,
  },
  cornerDecor2: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    fontSize: 28,
    opacity: 0.3,
  },
});