// src/navigation/RootNavigator.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { RootStackParamList } from "./types";
import { AuthContext } from "../context/AuthContext";

// screens
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import MenuScreen from "../screens/MenuScreen";
import CartScreen from "../screens/CartScreen";
import VipUpsellScreen from "../screens/VipUpsellScreen";
import VipPerksScreen from "../screens/VipPerksScreen";
import AdminLoginScreen from "../screens/AdminLoginScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminMenuScreen from "../screens/AdminMenuScreen";
import QrScanScreen from "../screens/QrScanScreen";
import KitchenOrdersScreen from "../screens/KitchenOrdersScreen";
import GenerateQRScreen from "../screens/GenerateQRScreen";


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* ✅ Home appears only ONCE */}
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* main app */}
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="QrScan" component={QrScanScreen} />
        <Stack.Screen name="KitchenOrders" component={KitchenOrdersScreen} />
        <Stack.Screen name="GenerateQR" component={GenerateQRScreen} />


        {/* VIP flow */}
        <Stack.Screen name="VipUpsell" component={VipUpsellScreen} />
        <Stack.Screen name="VipPerks" component={VipPerksScreen} />

        {/* Admin */}
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminMenu" component={AdminMenuScreen} />


        {/* Auth */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
