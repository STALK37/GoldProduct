import SEO from "@/components/SEO";
import { SITE_URL } from "@/lib/site";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import CartButton from "@/components/CartButton";
import meatSnacks from "@/assets/meat-snacks.jpg";
import fishSnacks from "@/assets/fish-snacks.jpg";

const categoryMeta: Record<string, { title: string; subtitle: string; image: string }> = {
  meat: {
    title: "М'ясні снеки",
    subtitle: "Ситні, хрусткі — ідеальні до дороги та фільму.",
    image: meatSnacks,
  },
  fish: {
    title: "Рибні снеки",
    subtitle: "Смак моря — легкі та ідеальні до напоїв.",
    image: fishSnacks,
  },
};

const CatalogPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const meta = categoryMeta[category || ""] || categoryMeta.meat;

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category!)
        .eq("in_stock", true)
        .order("price_small_retail");
      if (error) throw error;
      return data;
    },
    enabled: !!category,
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${meta.title} — каталог | GoldProduct`}
        description={`${meta.title} GoldProduct: ${meta.subtitle} Натуральний склад, преміальна якість.`}
        path={`/catalog/${category}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: meta.title,
          url: `${SITE_URL}/catalog/${category}`,
        }}
      />
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-body text-sm uppercase tracking-wider">Назад</span>
          </Link>
          <span className="font-display text-lg tracking-[0.2em] text-foreground uppercase">
            {meta.title}
          </span>
          <CartButton />
        </div>
      </div>

      <div className="relative h-56 sm:h-72 mt-[65px] overflow-hidden">
        <img src={meta.image} alt={meta.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-wide">
            {meta.title}
          </h1>
          <p className="font-body text-sm text-muted-foreground mt-2">{meta.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-6 py-10">
        {isLoading ? (
          <p className="text-center text-muted-foreground font-body">Завантаження...</p>
        ) : (
          <div className="space-y-4">
            {products?.map((product, i) => {
              const smallPrice = Number(product.price_small_retail ?? product.price);
              const largePrice = Number(product.price_large_retail ?? 0);
              const weightSmall = product.weight_small ?? product.weight ?? "";
              const weightLarge = product.weight_large ?? "0,5 кг";
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="gold-border-card rounded-lg p-5 bg-card flex items-center gap-5 cursor-pointer hover:border-primary/50 transition-all duration-300"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="shrink-0 w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl font-semibold text-foreground">{product.name}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      <span className="font-display text-base text-primary">
                        {smallPrice} ₴ <span className="text-muted-foreground text-xs font-body">/ {weightSmall}</span>
                      </span>
                      {largePrice > 0 && (
                        <span className="font-display text-base text-primary">
                          {largePrice} ₴ <span className="text-muted-foreground text-xs font-body">/ {weightLarge}</span>
                        </span>
                      )}
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

export default CatalogPage;
