import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { db } from "../services/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";

type Props = NativeStackScreenProps<RootStackParamList, "KitchenOrders">;

type OrderItem = {
  id: string;
  tableNumber: string;
  total: number;
  status: "pending" | "in-kitchen" | "served" | string;
  createdAt?: any;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
};

export default function KitchenOrdersScreen({}: Props) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, "orders");
    const q = query(col, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data: OrderItem[] = [];
        snap.forEach((d) => {
          const val = d.data() as any;
          data.push({
            id: d.id,
            tableNumber: val.tableNumber,
            total: val.total,
            status: val.status,
            createdAt: val.createdAt,
            items: val.items ?? [],
          });
        });
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.log("Orders snapshot error", err);
        Alert.alert("Error", "Failed to load orders");
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  const nextStatus = (status: string) => {
    if (status === "pending") return "in-kitchen";
    if (status === "in-kitchen") return "served";
    return "served";
  };

  const handleAdvanceStatus = async (order: OrderItem) => {
    const newStatus = nextStatus(order.status);

    try {
      await updateDoc(doc(db, "orders", order.id), {
        status: newStatus,
      });
    } catch (e: any) {
      console.log("Update order status error", e);
      Alert.alert("Error", e.message || "Failed to update status");
    }
  };

  const renderOrder = ({ item }: { item: OrderItem }) => {
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.tableText}>Table {item.tableNumber}</Text>
          <Text style={styles.statusBadge}>{item.status.toUpperCase()}</Text>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((it) => (
            <Text key={it.id} style={styles.itemLine}>
              {it.quantity} × {it.name} (₹{it.price})
            </Text>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalText}>Total: ₹ {item.total}</Text>
          {item.status !== "served" && (
            <TouchableOpacity
              style={styles.statusButton}
              onPress={() => handleAdvanceStatus(item)}
            >
              <Text style={styles.statusButtonText}>
                Mark as {nextStatus(item.status).toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" />
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kitchen Orders</Text>
      <Text style={styles.subtitle}>
        Live orders for all tables. Tap to update status.
      </Text>

      {orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No active orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 16 },
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBox: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#777" },
  orderCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },
  tableText: { fontSize: 16, fontWeight: "bold" },
  statusBadge: {
    fontSize: 12,
    backgroundColor: "#FFEBCC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontWeight: "600",
  },
  itemsList: {
    marginBottom: 8,
  },
  itemLine: {
    fontSize: 13,
    color: "#444",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: { fontSize: 15, fontWeight: "bold", color: "#FF8C42" },
  statusButton: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusButtonText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
});
