import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Switch,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { db } from "../services/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "AdminMenu">;

type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  isVipOnly?: boolean;
  isAvailable?: boolean;
};

const CATEGORIES = ["Coffee", "Tea", "Snacks", "Dessert"];

const { width } = Dimensions.get('window');

// Theme
const theme = {
  bg: '#FFFFFF',
  primary: '#FF6B35',
  accent: '#FF8C42',
  success: '#10B981',
  danger: '#EF4444',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  text: '#1F2937',
  textMuted: '#6B7280',
  inputBg: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputFocusBorder: '#FF6B35',
  formBg: '#FFF7ED',
  vipGold: '#FFD700',
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

export default function AdminMenuScreen({}: Props) {
  // All hooks at the top
  const { logout } = useContext(AuthContext);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Coffee");
  const [description, setDescription] = useState("");
  const [isVipOnly, setIsVipOnly] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

  // Load menu live
  useEffect(() => {
    const colRef = collection(db, "menuItems");

    const unsub = onSnapshot(colRef, (snap) => {
      const data: MenuItem[] = [];
      snap.forEach((d) => {
        const val = d.data() as any;
        data.push({
          id: d.id,
          name: val.name,
          price: val.price,
          category: val.category,
          description: val.description,
          isVipOnly: val.isVipOnly ?? false,
          isAvailable: val.isAvailable ?? true,
        });
      });
      setItems(data);
    });

    return unsub;
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategory("Coffee");
    setDescription("");
    setIsVipOnly(false);
    setIsAvailable(true);
  };

  const handleSave = async () => {
    if (!name || !price || isNaN(Number(price))) {
      Alert.alert("Error", "Please enter name and numeric price.");
      return;
    }

    const payload = {
      name,
      price: Number(price),
      category,
      description,
      isVipOnly,
      isAvailable,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "menuItems", editingId), payload);
        Alert.alert("Updated ✅", "Menu item updated successfully.");
      } else {
        await addDoc(collection(db, "menuItems"), payload);
        Alert.alert("Added ✅", "New menu item added to the menu.");
      }
      resetForm();
    } catch (e: any) {
      console.log("Save menu error", e);
      Alert.alert("Error", e.message || "Failed to save menu item.");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(String(item.price));
    setCategory(item.category);
    setDescription(item.description || "");
    setIsVipOnly(!!item.isVipOnly);
    setIsAvailable(item.isAvailable !== false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete item", "Are you sure you want to delete this menu item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "menuItems", id));
            Alert.alert("Deleted", "Menu item has been removed.");
          } catch (e: any) {
            console.log("Delete error", e);
            Alert.alert("Error", e.message || "Failed to delete item.");
          }
        },
      },
    ]);
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

  const renderItem = ({ item, index }: { item: MenuItem; index: number }) => (
    <Animated.View
      style={[
        styles.menuItemCard,
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
      <View style={styles.menuItemLeft}>
        <View style={styles.itemIcon}>
          <Text style={styles.itemIconText}>{getCategoryIcon(item.category)}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.itemMetaRow}>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
            <Text style={styles.itemCategory}>• {item.category}</Text>
          </View>
          <View style={styles.badgeRow}>
            {!item.isAvailable && (
              <View style={[styles.badge, styles.badgeUnavailable]}>
                <Text style={styles.badgeText}>❌ Unavailable</Text>
              </View>
            )}
            {item.isVipOnly && (
              <View style={[styles.badge, styles.badgeVip]}>
                <Text style={styles.badgeTextVip}>💎 VIP Only</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.menuItemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.editText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Floating decorations */}
      <View style={styles.decorationsContainer}>
        <FloatingDecoration char="🍕" delay={0} left={30} top={80} />
        <FloatingDecoration char="☕" delay={2} left={width - 60} top={150} />
        <FloatingDecoration char="🍰" delay={1} left={60} top={400} />
        <FloatingDecoration char="✨" delay={3} left={width - 80} top={500} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
            <Text style={styles.headerIcon}>🍕</Text>
            <View>
              <Text style={styles.title}>Menu Manager</Text>
              <Text style={styles.subtitle}>Add, edit or delete menu items</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingId ? "✏️ Edit Item" : "➕ Add New Item"}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'name' && styles.inputFocused
                ]}
                placeholder="e.g., Cappuccino"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Price (₹)</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'price' && styles.inputFocused
                  ]}
                  placeholder="99"
                  placeholderTextColor={theme.textMuted}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  onFocus={() => setFocusedInput('price')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'category' && styles.inputFocused
                  ]}
                  placeholder="Coffee"
                  placeholderTextColor={theme.textMuted}
                  value={category}
                  onChangeText={setCategory}
                  onFocus={() => setFocusedInput('category')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  focusedInput === 'description' && styles.inputFocused
                ]}
                placeholder="A delicious coffee drink..."
                placeholderTextColor={theme.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                onFocus={() => setFocusedInput('description')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchIcon}>💎</Text>
                  <Text style={styles.switchText}>VIP Only</Text>
                </View>
                <Switch
                  value={isVipOnly}
                  onValueChange={setIsVipOnly}
                  trackColor={{ false: '#D1D5DB', true: theme.accent }}
                  thumbColor={isVipOnly ? theme.primary : '#F3F4F6'}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.switchIcon}>✅</Text>
                  <Text style={styles.switchText}>Available</Text>
                </View>
                <Switch
                  value={isAvailable}
                  onValueChange={setIsAvailable}
                  trackColor={{ false: '#D1D5DB', true: theme.success }}
                  thumbColor={isAvailable ? theme.success : '#F3F4F6'}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {editingId ? "💾 Update Item" : "➕ Add to Menu"}
              </Text>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>❌ Cancel Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Menu Items List */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Menu Items ({items.length})</Text>
            </View>

            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyText}>No menu items yet</Text>
                <Text style={styles.emptySubtext}>Add your first item above</Text>
              </View>
            ) : (
              items.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.menuItemCard,
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
                  <View style={styles.menuItemLeft}>
                    <View style={styles.itemIcon}>
                      <Text style={styles.itemIconText}>{getCategoryIcon(item.category)}</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <View style={styles.itemMetaRow}>
                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                        <Text style={styles.itemCategory}>• {item.category}</Text>
                      </View>
                      <View style={styles.badgeRow}>
                        {!item.isAvailable && (
                          <View style={[styles.badge, styles.badgeUnavailable]}>
                            <Text style={styles.badgeText}>❌ Unavailable</Text>
                          </View>
                        )}
                        {item.isVipOnly && (
                          <View style={[styles.badge, styles.badgeVip]}>
                            <Text style={styles.badgeTextVip}>💎 VIP Only</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.menuItemActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editText}>✏️ Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(item.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  formCard: {
    backgroundColor: theme.formBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: theme.accent,
  },
  formHeader: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.card,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.inputBorder,
    padding: 12,
    fontSize: 15,
    color: theme.text,
  },
  inputFocused: {
    borderColor: theme.inputFocusBorder,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.card,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchIcon: {
    fontSize: 18,
  },
  switchText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: theme.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  listSection: {
    marginBottom: 20,
  },
  listHeader: {
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  menuItemCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary,
  },
  itemCategory: {
    fontSize: 13,
    color: theme.textMuted,
    marginLeft: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeUnavailable: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: theme.danger,
  },
  badgeVip: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderColor: theme.vipGold,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.danger,
  },
  badgeTextVip: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B8860B',
  },
  menuItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    alignItems: 'center',
  },
  deleteButton: {
    borderColor: theme.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  editText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.danger,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
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