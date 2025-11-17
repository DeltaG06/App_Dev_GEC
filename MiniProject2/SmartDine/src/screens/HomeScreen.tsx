import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";
import { AuthStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { PrimaryButton, GhostButton } from "../components/PrimaryButton";
import { CartContext } from "../context/CartContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Home">;

const { width, height } = Dimensions.get('window');

// Enhanced color theme
const theme = {
  bg: '#FFFFFF', // White background
  bgGradientStart: '#FFFFFF',
  bgGradientEnd: '#F8F9FA',
  primary: '#FF6B35', // Vibrant orange
  primaryDark: '#E85A28',
  secondary: '#C0C0C0', // Silver
  accent: '#FF8C42', // Light orange
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#1F2937',
  textMuted: '#6B7280',
  vip: '#FFD700',
  vipBg: 'rgba(255, 107, 53, 0.1)',
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

export default function HomeScreen({ navigation }: Props) {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY CONDITIONAL LOGIC
  const { appUser, logout } = useContext(AuthContext);
  const { tableNumber } = useContext(CartContext);

  // Animation values - must be declared before any conditionals
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  
  // Easter egg state - must be declared before any conditionals
  const [logoTaps, setLogoTaps] = useState(0);
  const [secretMode, setSecretMode] = useState(false);

  // NOW we can derive values from props/context
  const role = appUser?.role ?? "guest";
  const email = appUser?.email ?? "Guest";
  const isVip = !!appUser?.premium;
  const isGuest = role === "guest";

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

    // Logo subtle rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Easter egg: tap logo 7 times
  const handleLogoTap = () => {
    const newTaps = logoTaps + 1;
    setLogoTaps(newTaps);
    
    if (newTaps === 7) {
      setSecretMode(true);
      setLogoTaps(0);
      // Shake animation
      Animated.sequence([
        Animated.timing(logoRotate, { toValue: 0.1, duration: 50, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: -0.1, duration: 50, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 0.1, duration: 50, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
    
    // Reset after 3 seconds of no taps
    setTimeout(() => {
      if (newTaps === logoTaps) setLogoTaps(0);
    }, 3000);
  };

  const rotate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated gradient background effect */}
      <View style={styles.bgGradient} />
      
      {/* Floating decorations */}
      <View style={styles.decorationsContainer}>
        <FloatingDecoration char="🌸" delay={0} />
        <FloatingDecoration char="✨" delay={2} />
        <FloatingDecoration char="🍃" delay={4} />
        <FloatingDecoration char="💫" delay={1} />
        <FloatingDecoration char="🌺" delay={3} />
        {secretMode && <FloatingDecoration char="🦄" delay={0} />}
        {secretMode && <FloatingDecoration char="🎮" delay={2} />}
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
        {/* Logo with easter egg */}
        <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.8}>
          <Animated.Text
            style={[
              styles.logo,
              { transform: [{ rotate }] },
              secretMode && styles.secretLogo,
            ]}
          >
            {secretMode ? '🎮' : '🍽️'}
          </Animated.Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Smart<Text style={styles.titleAccent}>Dine</Text>
        </Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Your smart restaurant companion</Text>
          {secretMode && <Text style={styles.easterEgg}> 👾 Dev Mode</Text>}
        </View>

        {/* Info Card with glassmorphism effect */}
        <View style={styles.card}>
          <View style={styles.cardGlow} />
          
          <Text style={styles.info}>
            Logged in as: <Text style={styles.bold}>{email}</Text>
          </Text>
          
          <View style={styles.roleRow}>
            <Text style={styles.info}>
              Role: <Text style={styles.bold}>{role.toUpperCase()}</Text>
            </Text>
            {isVip && (
              <View style={styles.vipBadge}>
                <Text style={styles.vipText}>💎 VIP</Text>
              </View>
            )}
          </View>

          {isGuest ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageIcon}>🌟</Text>
              <Text style={styles.message}>
                You're browsing as a guest. Create an account to save orders and
                unlock VIP perks.
              </Text>
            </View>
          ) : (
            <View style={styles.messageContainer}>
              <Text style={styles.messageIcon}>👋</Text>
              <Text style={styles.message}>Welcome back to SmartDine!</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Main actions */}
          {isGuest ? (
            <>
              <PrimaryButton
                title="Create Account"
                onPress={() => navigation.navigate("Signup")}
              />
              <PrimaryButton
                title="Login"
                onPress={() => navigation.navigate("Login")}
              />
              <GhostButton
                title="Continue as Guest → View Menu"
                onPress={() => navigation.navigate("Menu")}
              />
              <GhostButton
                title="📍 Enter Table Number"
                onPress={() => navigation.navigate("QrScan")}
              />
            </>
          ) : (
            <>
              <PrimaryButton
                title="🍴 View Menu"
                onPress={() => navigation.navigate("Menu")}
              />
              <GhostButton
                title="🛒 View Cart"
                onPress={() => navigation.navigate("Cart")}
              />
              {!isVip && (
                <GhostButton
                  title="See VIP Benefits 💎"
                  onPress={() => navigation.navigate("VipUpsell")}
                />
              )}
              {isVip && (
                <GhostButton
                  title="View VIP Perks 💎"
                  onPress={() => navigation.navigate("VipPerks")}
                />
              )}
              <GhostButton title="Logout 🚪" onPress={logout} danger />
            </>
          )}
        </View>

        {/* Staff section */}
        <View style={styles.adminSection}>
          <View style={styles.adminDivider} />
          <Text style={styles.adminText}>🔐 Staff only</Text>
          <GhostButton
            title="Admin Login"
            onPress={() => navigation.navigate("AdminLogin")}
          />
        </View>
      </Animated.View>

      {/* Corner decorations */}
      <Text style={styles.cornerDecor1}>🌸</Text>
      <Text style={styles.cornerDecor2}>✨</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.bg,
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
    top: Math.random() * (height * 0.8),
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: theme.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  secretLogo: {
    textShadowColor: '#00ff00',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: theme.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  titleAccent: {
    color: theme.primary,
    textShadowColor: theme.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.textMuted,
    fontSize: 15,
  },
  easterEgg: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.primary,
    opacity: 0.05,
  },
  info: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 6,
  },
  bold: {
    fontWeight: '700',
    color: theme.accent,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  vipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.vipBg,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  vipText: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: '700',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  messageIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.cardBorder,
    marginVertical: 16,
    opacity: 0.5,
  },
  adminSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  adminDivider: {
    width: 60,
    height: 2,
    backgroundColor: theme.cardBorder,
    marginBottom: 12,
    borderRadius: 2,
  },
  adminText: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  cornerDecor1: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 32,
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