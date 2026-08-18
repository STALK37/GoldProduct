import SEO from "@/components/SEO";
import { SITE_URL } from "@/lib/site";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import CartButton from "@/components/CartButton";
import meatSnacks from "@/assets/meat-snacks.jpg";
import fishSnacks from "@/assets/fish-snacks.jpg";

const fallbackImages: Record<string, string> = {
  meat: meatSnacks,
  fish: fishSnacks,
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const AllCatalogPage = () => {
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("in_stock", true);
      if (error) throw error;
      return shuffleArray(data);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Каталог снеків GoldProduct | м'ясо та риба"
        description="Повний асортимент натуральних м'ясних та рибних снеків GoldProduct. Преміальна якість, фасування 70 г та 0,5 кг."
        path="/catalog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Каталог снеків GoldProduct",
          url: `${SITE_URL}/catalog`,
        }}
      />
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm uppercase tracking-wider">Головна</span>
          </Link>
          <span className="font-display text-lg tracking-[0.2em] text-foreground uppercase">
            Каталог
          </span>
          <CartButton />
        </div>
      </div>

      <div className="pt-[100px] pb-6 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-body text-xs tracking-[0.3em] text-primary uppercase mb-3">Наш асортимент</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold gold-gradient-text">Усі продукти</h1>
          <div className="gold-line w-20 mx-auto mt-4" />
        </motion.div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 pb-16">
        {isLoading ? (
          <p className="text-center text-muted-foreground font-body py-20">Завантаження...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products?.map((product, i) => {
              const smallPrice = Number(product.price_small_retail ?? product.price);
              const weightSmall = product.weight_small ?? product.weight;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="group cursor-pointer"
                >
                  <div className="gold-border-card rounded-lg overflow-hidden bg-card">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image_url || fallbackImages[product.category || "meat"]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-display text-sm sm:text-base font-semibold text-foreground leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      {weightSmall && (
                        <p className="font-body text-xs text-muted-foreground mt-1">від {weightSmall}</p>
                      )}
                      <p className="font-display text-lg text-primary mt-2">від {smallPrice} ₴</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCatalogPage;
