import { useState } from "react";
import { useCart, WHOLESALE_THRESHOLD } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

/** Shape returned by the `place_order` Postgres function. */
interface PlacedOrder {
  order_id: string;
  total_amount: number;
  wholesale: boolean;
}

const customerSchema = z.object({
  full_name: z.string().trim().min(1, "Вкажіть ім'я").max(100),
  email: z.string().trim().email("Невірний email").max(255),
  phone: z.string().trim().max(20).optional(),
  city: z.string().trim().min(1, "Вкажіть місто").max(100),
  country: z.string().trim().min(1, "Вкажіть країну").max(100),
  post_code: z.string().trim().min(1, "Вкажіть поштовий індекс").max(20),
  address: z.string().trim().min(1, "Вкажіть адресу").max(300),
});

const CheckoutDialog = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount,
    subtotalRetail,
    isWholesale,
    amountToWholesale,
    effectivePrice,
    isCheckoutOpen,
    setIsCheckoutOpen,
  } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState<"cart" | "info" | "success">("cart");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    country: "Україна",
    post_code: "",
    address: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    const result = customerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // One call, one transaction. place_order() creates the customer, the order
      // and the line items, and prices the basket from the products table --
      // the browser never gets to say what an order costs. See
      // supabase/migrations/20260817090000_lock_down_orders_and_customers.sql
      const { data, error } = await supabase.rpc("place_order", {
        p_customer: {
          full_name: result.data.full_name,
          email: result.data.email,
          phone: result.data.phone || null,
          city: result.data.city,
          country: result.data.country,
          post_code: result.data.post_code,
          address: result.data.address,
        },
        p_items: items.map((item) => ({
          product_id: item.productId,
          variant: item.variant,
          quantity: item.quantity,
        })),
      });

      if (error) throw new Error(error.message);

      const placed = data as PlacedOrder | null;
      if (!placed?.order_id) throw new Error("Замовлення не створено");

      // Fire and forget: the shop owner's Telegram ping. The function reads the
      // order back from the database itself, so nothing here can influence what
      // the message says.
      supabase.functions
        .invoke("telegram-notify", { body: { order_id: placed.order_id } })
        .catch(() => {});

      setStep("success");
      clearCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Помилка",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    if (step === "success") {
      setStep("cart");
      setForm({ full_name: "", email: "", phone: "", city: "", country: "Україна", post_code: "", address: "" });
    }
  };

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border" aria-describedby={undefined}>
        {step === "cart" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-foreground flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Кошик
              </DialogTitle>
            </DialogHeader>

            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 font-body">
                Кошик порожній
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const price = effectivePrice(item);
                  return (
                    <div
                      key={`${item.productId}-${item.variant}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border"
                    >
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-foreground truncate">{item.name}</p>
                        <p className="font-body text-xs text-muted-foreground">{item.weightLabel}</p>
                        <p className="text-primary font-body text-sm mt-0.5">
                          {price} ₴
                          {isWholesale && (
                            <span className="text-muted-foreground line-through ml-2 text-xs">
                              {item.priceRetail} ₴
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variant, item.quantity - 1)}
                          aria-label={`Зменшити кількість ${item.name}`}
                          className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-body text-sm text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variant, item.quantity + 1)}
                          aria-label={`Збільшити кількість ${item.name}`}
                          className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variant)}
                        aria-label={`Видалити ${item.name} з кошика`}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                {/* Wholesale banner */}
                {isWholesale ? (
                  <div className="p-3 rounded-lg border border-primary/40 bg-primary/10 text-center">
                    <p className="font-body text-sm text-primary">
                      Діє оптова ціна (замовлення від {WHOLESALE_THRESHOLD.toLocaleString("uk-UA")} ₴)
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-border bg-muted/30 text-center">
                    <p className="font-body text-xs text-muted-foreground">
                      До оптової ціни залишилось{" "}
                      <span className="text-primary font-semibold">{amountToWholesale.toFixed(0)} ₴</span>
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-display text-lg text-foreground">Разом:</span>
                  <div className="text-right">
                    {isWholesale && (
                      <p className="font-body text-xs text-muted-foreground line-through">
                        {subtotalRetail.toFixed(2)} ₴
                      </p>
                    )}
                    <span className="font-display text-xl text-primary">{totalAmount.toFixed(2)} ₴</span>
                  </div>
                </div>

                {/* Shipping info */}
                <div className="text-xs text-muted-foreground font-body space-y-1 p-3 rounded-lg bg-muted/20 border border-border">
                  <p>• До 5 000 ₴ — доставка Новою Поштою за рахунок замовника</p>
                  <p>• 5 000 – 30 000 ₴ — доставка на відділення НП за наш рахунок</p>
                  <p>• Понад 30 000 ₴ — адресна доставка за наш рахунок</p>
                </div>

                <Button
                  onClick={() => setStep("info")}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider"
                >
                  Оформити замовлення
                </Button>
              </div>
            )}
          </>
        )}

        {step === "info" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-foreground">
                Контактна інформація
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {[
                { key: "full_name", label: "Повне ім'я *", placeholder: "Іван Петренко" },
                { key: "email", label: "Email *", placeholder: "ivan@example.com" },
                { key: "phone", label: "Телефон", placeholder: "+380 XX XXX XX XX" },
                { key: "country", label: "Країна *", placeholder: "Україна" },
                { key: "city", label: "Місто *", placeholder: "Київ" },
                { key: "post_code", label: "Поштовий індекс *", placeholder: "01001" },
                { key: "address", label: "Адреса *", placeholder: "вул. Хрещатик 1, кв. 5" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label htmlFor={`checkout-${key}`} className="text-foreground font-body text-xs uppercase tracking-wider">{label}</Label>
                  <Input
                    id={`checkout-${key}`}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={placeholder}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground font-body mt-1"
                  />
                  {errors[key] && <p className="text-destructive text-xs mt-1 font-body">{errors[key]}</p>}
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("cart")}
                  className="flex-1 border-border text-muted-foreground hover:text-foreground font-body"
                >
                  Назад
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider"
                >
                  {isSubmitting ? "Обробка..." : "Підтвердити"}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-2xl text-foreground">Дякуємо!</h3>
            <p className="text-muted-foreground font-body">
              Ваше замовлення прийнято. Ми зв'яжемось з вами найближчим часом.
            </p>
            <Button onClick={handleClose} className="bg-primary text-primary-foreground hover:bg-primary/90 font-body">
              Закрити
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
