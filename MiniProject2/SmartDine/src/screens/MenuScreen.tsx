import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  CartContext,
  MenuItem as CartMenuItem,
} from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Menu">;

type MenuItem = CartMenuItem;

const CATEGORIES = ["All", "Coffee", "Tea", "Snacks", "Dessert"];

const { width } = Dimensions.get('window');

// Theme
const theme = {
  bg: '#FFFFFF',
  primary: '#FF6B35',
  accent: '#FF8C42',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#1F2937',
  textMuted: '#6B7280',
  vipGold: '#FFD700',
  vipBg: 'rgba(255, 215, 0, 0.15)',
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

export default function MenuScreen({ navigation }: Props) {
  // All hooks at the top
  const {
    items: cartItems,
    addToCart,
    removeFromCart,
  } = useContext(CartContext);
  const { appUser } = useContext(AuthContext);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Build quick lookup by ID → { quantity }
  const cartById = useMemo(() => {
    const map: Record<string, { quantity: number }> = {};
    cartItems.forEach((ci) => {
      map[ci.item.id] = { quantity: ci.quantity };
    });
    return map;
  }, [cartItems]);

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

  useEffect(() => {
    const colRef = collection(db, "menuItems");

    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const list: MenuItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data() as any;

          list.push({
            id: docSnap.id,
            name: d.name ?? "Untitled",
            price:
              typeof d.price === "number" && !isNaN(d.price) ? d.price : 0,
            category: d.category ?? "Other",
            description: d.description,
            imageUrl: d.imageUrl,
            isVipOnly: !!d.isVipOnly,
          });
        });
        setMenuItems(list);
        setLoading(false);
      },
      (err) => {
        console.log("Menu error:", err);
        Alert.alert("Error", "Failed to load menu");
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((m) => m.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    if (item.isVipOnly && !appUser?.premium) {
      Alert.alert(
        "VIP Item 💎",
        "This is a VIP-only item. Ask staff to upgrade you to VIP."
      );
      return;
    }
    addToCart(item);
  };

  const handleRemoveFromCart = (id: string) => {
    removeFromCart(id);
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case "Coffee": return "☕";
      case "Tea": return "🍵";
      case "Snacks": return "🍿";
      case "Dessert": return "🍰";
      default: return "🍴";
    }
  };

  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => {
    const entry = cartById[item.id];
    const quantity = entry?.quantity ?? 0;

    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30],
              })
            }]
          }
        ]}
      >
        {/* Image */}
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>{getCategoryIcon(item.category)}</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          {item.isVipOnly && (
            <View style={styles.vipBadge}>
              <Text style={styles.vipBadgeText}>💎 VIP Only</Text>
            </View>
          )}
        </View>

        {/* Quantity / Add */}
        {quantity > 0 ? (
          <View style={styles.qtyBox}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleRemoveFromCart(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qtyNumber}>{quantity}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleAddToCart(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading delicious menu… 🍽️</Text>
      </View>
    );
  }

  const totalCartItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);

  return (
    <View style={styles.container}>
      {/* Floating decorations */}
      <View style={styles.decorationsContainer}>
        <FloatingDecoration char="🍽️" delay={0} left={30} top={100} />
        <FloatingDecoration char="☕" delay={2} left={width - 60} top={180} />
        <FloatingDecoration char="✨" delay={1} left={80} top={300} />
        <FloatingDecoration char="🍰" delay={3} left={width - 70} top={400} />
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
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🍽️</Text>
            <View>
              <Text style={styles.title}>Menu</Text>
              <Text style={styles.subtitle}>
                {appUser?.premium ? "💎 VIP Experience" : "Browse & order"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("Cart")}
            activeOpacity={0.8}
          >
            <Text style={styles.cartButtonText}>🛒 Cart</Text>
            {totalCartItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && styles.categoryTextActive,
                ]}
              >
                {cat === "All" ? "🍴 All" : `${getCategoryIcon(cat)} ${cat}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No items in this category</Text>
            <Text style={styles.emptySubtext}>Try selecting a different category</Text>
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.textMuted,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: theme.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.card,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 13,
    color: theme.textMuted,
    marginBottom: 6,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.primary,
    marginBottom: 4,
  },
  vipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: theme.vipBg,
    borderWidth: 1,
    borderColor: theme.vipGold,
  },
  vipBadgeText: {
    fontSize: 11,
    color: '#B8860B',
    fontWeight: '700',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: theme.primary,
    marginLeft: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  qtyBtn: {
    backgroundColor: '#FFFFFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.primary,
  },
  qtyNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textMuted,
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