import React, { createContext, useState, ReactNode } from "react";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  isVipOnly?: boolean;
};

export type CartItem = {
  item: MenuItem;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
  tableNumber: string | null;
  setTableNumber: (table: string | null) => void;
};

export const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  total: 0,
  tableNumber: null,
  setTableNumber: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  const addToCart = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => {
      const found = prev.find((ci) => ci.item.id === id);
      if (!found) return prev;

      if (found.quantity > 1) {
        return prev.map((ci) =>
          ci.item.id === id
            ? { ...ci, quantity: ci.quantity - 1 }
            : ci
        );
      }
      return prev.filter((ci) => ci.item.id !== id);
    });
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        tableNumber,
        setTableNumber,   // 👈 IMPORTANT: included in provider value
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
