import React, { createContext, useContext, useState, useCallback } from "react";

export const WHOLESALE_THRESHOLD = 10000;

export type CartVariant = "small" | "large";

export interface CartItem {
  productId: string;
  variant: CartVariant;
  name: string;
  weightLabel: string;
  priceRetail: number;
  priceWholesale: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string, variant: CartVariant) => void;
  updateQuantity: (productId: string, variant: CartVariant, quantity: number) => void;
  clearCart: () => void;
  /** Retail subtotal — used to decide whether wholesale kicks in */
  subtotalRetail: number;
  /** Effective total (wholesale if subtotalRetail >= threshold) */
  totalAmount: number;
  totalItems: number;
  isWholesale: boolean;
  amountToWholesale: number;
  /** Effective unit price for a given item (retail or wholesale) */
  effectivePrice: (item: CartItem) => number;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const keyFor = (productId: string, variant: CartVariant) => `${productId}::${variant}`;

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const k = keyFor(item.productId, item.variant);
      const existing = prev.find((i) => keyFor(i.productId, i.variant) === k);
      if (existing) {
        return prev.map((i) =>
          keyFor(i.productId, i.variant) === k ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string, variant: CartVariant) => {
    setItems((prev) => prev.filter((i) => keyFor(i.productId, i.variant) !== keyFor(productId, variant)));
  }, []);

  const updateQuantity = useCallback((productId: string, variant: CartVariant, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => keyFor(i.productId, i.variant) !== keyFor(productId, variant)));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          keyFor(i.productId, i.variant) === keyFor(productId, variant) ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotalRetail = items.reduce((s, i) => s + i.priceRetail * i.quantity, 0);
  const isWholesale = subtotalRetail >= WHOLESALE_THRESHOLD;
  const totalAmount = items.reduce(
    (s, i) => s + (isWholesale ? i.priceWholesale : i.priceRetail) * i.quantity,
    0
  );
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const amountToWholesale = Math.max(0, WHOLESALE_THRESHOLD - subtotalRetail);
  const effectivePrice = (item: CartItem) => (isWholesale ? item.priceWholesale : item.priceRetail);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotalRetail,
        totalAmount,
        totalItems,
        isWholesale,
        amountToWholesale,
        effectivePrice,
        isCheckoutOpen,
        setIsCheckoutOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
