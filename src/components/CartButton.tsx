import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const CartButton = () => {
  const { totalItems, setIsCheckoutOpen } = useCart();

  return (
    <button
      onClick={() => setIsCheckoutOpen(true)}
      className="relative text-muted-foreground hover:text-primary transition-colors duration-300"
      aria-label="Кошик"
    >
      <ShoppingBag className="w-5 h-5" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-body font-bold rounded-full flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </button>
  );
};

export default CartButton;
