import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { CartProvider, useCart, WHOLESALE_THRESHOLD } from "@/contexts/CartContext";

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;
const setup = () => renderHook(() => useCart(), { wrapper });

// Real prices from migration 20260519164719.
const chipsSmall = {
  productId: "p-chips",
  variant: "small" as const,
  name: "Чипси індички",
  weightLabel: "70 г",
  priceRetail: 92,
  priceWholesale: 83,
  image: "/chips.jpg",
};

const chipsLarge = { ...chipsSmall, variant: "large" as const, weightLabel: "0,5 кг", priceRetail: 385, priceWholesale: 350 };

const shrimp = {
  productId: "p-shrimp",
  variant: "small" as const,
  name: "Креветочка",
  weightLabel: "40 г",
  priceRetail: 90,
  priceWholesale: 81,
  image: "/shrimp.jpg",
};

describe("CartContext", () => {
  it("starts empty", () => {
    const { result } = setup();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalAmount).toBe(0);
    expect(result.current.isWholesale).toBe(false);
  });

  it("adds an item with quantity 1", () => {
    const { result } = setup();
    act(() => result.current.addItem(chipsSmall));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({ productId: "p-chips", variant: "small", quantity: 1 });
  });

  it("merges a repeat add into the existing line", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsSmall);
      result.current.addItem(chipsSmall);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
  });

  // The 70 g and 0,5 kg packs of one product are different things at different
  // prices. Keying the cart on product id alone would collapse them.
  it("keeps the two pack sizes of one product on separate lines", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsSmall);
      result.current.addItem(chipsLarge);
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalAmount).toBe(92 + 385);
  });

  it("removes only the variant it was asked to remove", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsSmall);
      result.current.addItem(chipsLarge);
      result.current.removeItem("p-chips", "small");
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].variant).toBe("large");
  });

  it("sets an explicit quantity", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsSmall);
      result.current.updateQuantity("p-chips", "small", 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalAmount).toBe(92 * 5);
  });

  // Regression guard: a stepper clicked down to zero must drop the line, not
  // leave a ghost item sitting in the cart at quantity 0.
  it("drops the line when quantity reaches zero or below", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsSmall);
      result.current.updateQuantity("p-chips", "small", 0);
    });
    expect(result.current.items).toHaveLength(0);

    act(() => {
      result.current.addItem(shrimp);
      result.current.updateQuantity("p-shrimp", "small", -3);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it("clears everything", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsSmall);
      result.current.addItem(shrimp);
      result.current.clearCart();
    });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalAmount).toBe(0);
  });

  it("toggles the checkout dialog", () => {
    const { result } = setup();
    expect(result.current.isCheckoutOpen).toBe(false);
    act(() => result.current.setIsCheckoutOpen(true));
    expect(result.current.isCheckoutOpen).toBe(true);
  });
});

describe("wholesale pricing", () => {
  it("stays retail below the threshold and reports the shortfall", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsLarge);
      result.current.updateQuantity("p-chips", "large", 10); // 3 850
    });
    expect(result.current.isWholesale).toBe(false);
    expect(result.current.totalAmount).toBe(385 * 10);
    expect(result.current.amountToWholesale).toBe(WHOLESALE_THRESHOLD - 3850);
    expect(result.current.effectivePrice(result.current.items[0])).toBe(385);
  });

  // The switch is decided on the *retail* subtotal. Deciding it on the
  // discounted total would make a basket flip back and forth around the line.
  it("switches the whole basket to wholesale once the retail subtotal reaches the threshold", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsLarge);
      result.current.updateQuantity("p-chips", "large", 26); // 10 010 retail
    });
    expect(result.current.subtotalRetail).toBe(385 * 26);
    expect(result.current.isWholesale).toBe(true);
    expect(result.current.totalAmount).toBe(350 * 26);
    expect(result.current.amountToWholesale).toBe(0);
    expect(result.current.effectivePrice(result.current.items[0])).toBe(350);
  });

  it("treats exactly the threshold as wholesale", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem({ ...chipsSmall, priceRetail: WHOLESALE_THRESHOLD, priceWholesale: 1 });
    });
    expect(result.current.subtotalRetail).toBe(WHOLESALE_THRESHOLD);
    expect(result.current.isWholesale).toBe(true);
  });

  it("prices a mixed basket at wholesale across every line", () => {
    const { result } = setup();
    act(() => {
      result.current.addItem(chipsLarge);
      result.current.updateQuantity("p-chips", "large", 25); // 9 625
      result.current.addItem(shrimp);
      result.current.updateQuantity("p-shrimp", "small", 5); // + 450 = 10 075
    });
    expect(result.current.isWholesale).toBe(true);
    expect(result.current.totalAmount).toBe(350 * 25 + 81 * 5);
  });
});
