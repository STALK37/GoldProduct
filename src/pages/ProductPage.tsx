import SEO from "@/components/SEO";
import { SITE_URL } from "@/lib/site";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart, CartVariant } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import CartButton from "@/components/CartButton";
import { useState } from "react";
import meatSnacks from "@/assets/meat-snacks.jpg";
import fishSnacks from "@/assets/fish-snacks.jpg";

const fallbackImages: Record<string, string> = {
  meat: meatSnacks,
  fish: fishSnacks,
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState<CartVariant>("small");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: images } = useQuery({
    queryKey: ["product-images", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id!)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const priceSmallRetail = Number(product?.price_small_retail ?? product?.price ?? 0);
  const priceSmallWholesale = Number(product?.price_small_wholesale ?? priceSmallRetail);
  const priceLargeRetail = Number(product?.price_large_retail ?? 0);
  const priceLargeWholesale = Number(product?.price_large_wholesale ?? priceLargeRetail);
  const weightSmall = product?.weight_small ?? product?.weight ?? "";
  const weightLarge = product?.weight_large ?? "0,5 кг";
  const hasLarge = priceLargeRetail > 0;

  const currentRetail = variant === "small" ? priceSmallRetail : priceLargeRetail;
  const currentWholesale = variant === "small" ? priceSmallWholesale : priceLargeWholesale;
  const currentWeight = variant === "small" ? weightSmall : weightLarge;

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        variant,
        name: product.name,
        weightLabel: currentWeight,
        priceRetail: currentRetail,
        priceWholesale: currentWholesale,
        image: product.image_url || fallbackImages[product.category || "meat"],
      });
    }
    toast({ title: "Додано до кошика", description: `${product.name} (${currentWeight}) × ${quantity}` });
  };

  const allImages = images && images.length > 0
    ? images.map((img) => img.image_url)
    : product?.image_url
      ? [product.image_url]
      : [fallbackImages[product?.category || "meat"]];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Завантаження...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Продукт не знайдено</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${product.name} — купити | GoldProduct`}
        description={(product.description || `${product.name} GoldProduct — натуральний снек преміальної якості.`).slice(0, 160)}
        path={`/product/${product.id}`}
        image={product.image_url || undefined}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || undefined,
          image: product.image_url || undefined,
          brand: { "@type": "Brand", name: "GoldProduct" },
          offers: {
            "@type": "Offer",
            price: priceSmallRetail,
            priceCurrency: "UAH",
            availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${SITE_URL}/product/${product.id}`,
          },
        }}
      />
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6">
          <Link
            to={`/catalog/${product.category}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm uppercase tracking-wider">Назад</span>
          </Link>
          <span className="font-display text-lg tracking-[0.2em] text-foreground uppercase truncate max-w-[200px]">
            {product.name}
          </span>
          <CartButton />
        </div>
      </div>

      <div className="pt-[80px] pb-16">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="gold-border-card rounded-lg overflow-hidden bg-card">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={allImages[activeImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        activeImage === i
                          ? "border-primary shadow-lg"
                          : "border-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-wide">
                {product.name}
              </h1>

              <p className="font-body text-base text-muted-foreground mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Variant selector */}
              {hasLarge ? (
                <div className="mt-6">
                  <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Розмір упаковки:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVariant("small")}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        variant === "small"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-display text-lg text-foreground">{weightSmall}</p>
                      <p className="font-body text-sm text-primary mt-1">{priceSmallRetail} ₴</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        опт: {priceSmallWholesale} ₴
                      </p>
                    </button>
                    <button
                      onClick={() => setVariant("large")}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        variant === "large"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="font-display text-lg text-foreground">{weightLarge}</p>
                      <p className="font-body text-sm text-primary mt-1">{priceLargeRetail} ₴</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">
                        опт: {priceLargeWholesale} ₴
                      </p>
                    </button>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-3 italic">
                    Оптова ціна діє при замовленні від 10 000 ₴
                  </p>
                </div>
              ) : (
                <p className="font-display text-3xl text-primary mt-6">
                  {priceSmallRetail} ₴ <span className="text-base text-muted-foreground font-body">/ {weightSmall}</span>
                </p>
              )}

              <div className="flex items-center gap-4 mt-8">
                <span className="font-body text-sm text-muted-foreground uppercase tracking-wider">
                  Кількість:
                </span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Зменшити кількість"
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-display text-lg text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Збільшити кількість"
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="mt-8 flex items-center justify-center gap-3 font-body text-sm tracking-wider uppercase border border-border text-foreground px-8 py-4 hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Додати до кошика — {currentRetail * quantity} ₴
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
