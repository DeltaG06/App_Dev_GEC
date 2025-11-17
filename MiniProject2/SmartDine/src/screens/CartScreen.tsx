import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { CartContext } from "../context/CartContext";
import { db } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type Props = NativeStackScreenProps<RootStackParamList, "Cart">;

const { width } = Dimensions.get('window');

// Theme matching the app
const theme = {
  bg: '#FFFFFF',
  primary: '#FF6B35',
  primaryDark: '#E85A28',
  accent: '#FF8C42',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#1F2937',
  textMuted: '#6B7280',
  success: '#10B981',
  danger: '#EF4444',
  emptyBg: '#F9FAFB',
};

// Floating decoration component
const FloatingDecoration = ({ delay = 0, char = '✨', left = 0, top = 0 }: { delay?: number; char?: string; left?: number; top?: number }) => {
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
          left,
          top,
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

export default function CartScreen({ navigation }: Props) {
  // All hooks at the top
  const { items, total, removeFromCart, clearCart, tableNumber } = useContext(CartContext);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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
  }, []);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Cart is empty", "Add some items first!");
      return;
    }

    try {
      // Build a clean order object
      const orderPayload = {
        tableNumber: tableNumber ?? "UNKNOWN",
        total,
        status: "pending", // "pending" | "in-kitchen" | "served"
        createdAt: serverTimestamp(),
        items: items.map((ci) => ({
          id: ci.item.id,
          name: ci.item.name,
          price: ci.item.price,
          quantity: ci.quantity,
        })),
      };

      await addDoc(collection(db, "orders"), orderPayload);

      Alert.alert(
        "Order placed 🎉",
        `Order for table ${tableNumber ?? "N/A"} has been placed.\n(This is a demo – in a real app this would go to the kitchen.)`,
        [
          {
            text: "OK",
            onPress: () => {
              clearCart();
              navigation.navigate("Home");
            },
          },
        ]
      );
    } catch (e: any) {
      console.log("Order error", e);
      Alert.alert("Error", e.message || "Failed to place order");
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating decorations */}
      <View style={styles.decorationsContainer}>
        <FloatingDecoration char="🛒" delay={0} left={30} top={100} />
        <FloatingDecoration char="✨" delay={2} left={width - 60} top={150} />
        <FloatingDecoration char="🍽️" delay={1} left={60} top={300} />
        <FloatingDecoration char="💫" delay={3} left={width - 80} top={400} />
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛒</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Your Cart</Text>
            <View style={styles.tableInfo}>
              <Text style={styles.tableIcon}>📍</Text>
              <Text style={styles.subtitle}>
                Table: {tableNumber ? tableNumber : "Not selected"}
              </Text>
            </View>
          </View>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>Your plate is empty</Text>
              <Text style={styles.emptySubtitle}>
                Add some delicious items to get started
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate("Menu")}
                activeOpacity={0.8}
              >
                <Text style={styles.browseButtonText}>🍴 Browse Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              <View style={styles.itemsHeader}>
                <Text style={styles.itemsCount}>
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </Text>
                <TouchableOpacity onPress={clearCart}>
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={items}
                keyExtractor={(ci) => ci.item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => (
                  <Animated.View
                    style={[
                      styles.cartItemCard,
                      {
                        opacity: fadeAnim,
                        transform: [{
                          translateX: slideAnim.interpolate({
                            inputRange: [0, 30],
                            outputRange: [0, 30],
                          })
                        }]
                      }
                    ]}
                  >
                    <View style={styles.cartItemLeft}>
                      <View style={styles.itemImagePlaceholder}>
                        <Text style={styles.itemEmoji}>🍴</Text>
                      </View>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.item.name}</Text>
                        <View style={styles.quantityBadge}>
                          <Text style={styles.itemQty}>x{item.quantity}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.cartItemRight}>
                      <Text style={styles.itemPrice}>
                        ₹{item.item.price * item.quantity}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeFromCart(item.item.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.removeText}>🗑️ Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                )}
              />
            </View>

            {/* Footer with Total and Order Button */}
            <View style={styles.footer}>
              <View style={styles.totalCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalAmount}>₹{total}</Text>
                </View>
                <View style={styles.dividerDashed} />
                <View style={styles.totalRow}>
                  <Text style={styles.grandTotalLabel}>Total Amount</Text>
                  <Text style={styles.grandTotalAmount}>₹{total}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.orderButton}
                onPress={handlePlaceOrder}
                activeOpacity={0.8}
              >
                <Text style={styles.orderButtonText}>🚀 Place Order</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>

      {/* Corner decorations */}
      <Text style={styles.cornerDecor1}>🌟</Text>
      <Text style={styles.cornerDecor2}>✨</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  decorationsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  floatingDecor: {
    position: 'absolute',
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  headerIcon: {
    fontSize: 40,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: 0.5,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tableIcon: {
    fontSize: 14,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: theme.emptyBg,
    padding: 40,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.cardBorder,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  itemsContainer: {
    flex: 1,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  clearAllText: {
    fontSize: 14,
    color: theme.danger,
    fontWeight: '600',
  },
  listContent: {
    gap: 12,
  },
  cartItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cartItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  quantityBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemQty: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '700',
  },
  cartItemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.primary,
  },
  removeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeText: {
    fontSize: 12,
    color: theme.danger,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 16,
    gap: 12,
  },
  totalCard: {
    backgroundColor: theme.emptyBg,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.cardBorder,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
  },
  dividerDashed: {
    height: 1,
    backgroundColor: theme.cardBorder,
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
  },
  grandTotalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.primary,
  },
  orderButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  cornerDecor1: {
    position: 'absolute',
    top: 40,
    right: 20,
    fontSize: 28,
    opacity: 0.3,
  },
  cornerDecor2: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    fontSize: 28,
    opacity: 0.3,
  },
});