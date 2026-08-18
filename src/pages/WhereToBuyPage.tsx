import SEO from "@/components/SEO";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Truck, Store, ShieldCheck, ArrowRight } from "lucide-react";
import partnerLogo from "@/assets/partners/partner-logo-uploaded.png";
import beerMarketLogo from "@/assets/partners/beer-market.png";
import leprekonLogo from "@/assets/partners/leprekon.png";
import pivnaPandaLogo from "@/assets/partners/pivna-panda.png";
import pivnaBochkaLogo from "@/assets/partners/pivna-bochka.jpg";

const partners = [
  { name: "Бир Маркет", initials: "БМ", logo: beerMarketLogo },
  { name: "Море Пива", initials: "МП", logo: partnerLogo },
  { name: "Леприкон", initials: "Л", logo: leprekonLogo },
  { name: "Пивна Панда", initials: "ПП", logo: pivnaPandaLogo },
  { name: "Пивна Бочка", initials: "ПБ", logo: pivnaBochkaLogo },
];

const stats = [
  { icon: Store, value: "200+", label: "Торгових точок" },
  { icon: MapPin, value: "15+", label: "Міст України" },
  { icon: Truck, value: "24/7", label: "Логістика" },
  { icon: ShieldCheck, value: "100%", label: "Офіційний партнер" },
];

const WhereToBuyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Де купити снеки GoldProduct | партнерські магазини"
        description="Знайдіть снеки GoldProduct у партнерських магазинах: Бир Маркет, Море Пива, Леприкон, Пивна Панда та Пивна Бочка."
        path="/where-to-buy"
      />
      <Header />
      <main className="pt-24">
        <section className="py-24 px-6 bg-secondary/20">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground uppercase tracking-wide mb-4">
                Де купити
              </h1>
              <div className="gold-line w-16 mx-auto mb-6" />
              <p className="font-body text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Наші снеки преміальної якості доступні у найкращих мережах магазинів по всій Україні.
                Ми співпрацюємо лише з перевіреними партнерами, щоб ви завжди отримували свіжу продукцію.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1, type: "spring", stiffness: 100 }}
                  className="text-center py-6 px-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
                >
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
                  <p className="font-display text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Partners */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="font-body text-xs text-muted-foreground uppercase tracking-[0.3em] text-center mb-8"
            >
              Наші партнери
            </motion.p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-16">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.08, type: "spring", stiffness: 80 }}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col items-center gap-4"
                >
                  <div className="relative w-28 h-28 rounded-2xl border border-border bg-card flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-primary/60 group-hover:shadow-[0_8px_30px_hsl(var(--primary)/0.12)]">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="w-20 h-20 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <span className="font-display text-2xl font-bold text-primary/60 group-hover:text-primary transition-colors duration-300 relative z-10">
                        {partner.initials}
                      </span>
                    )}
                  </div>
                  <span className="font-body text-xs text-muted-foreground uppercase tracking-wider text-center group-hover:text-foreground transition-colors duration-300">
                    {partner.name}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Link to cooperation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center pt-10 border-t border-border/40"
            >
              <p className="font-body text-sm text-muted-foreground mb-4">
                Хочете стати нашим партнером?
              </p>
              <Link
                to="/cooperation"
                className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-primary border border-primary/40 px-8 py-3 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Дізнатися про співпрацю <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default WhereToBuyPage;
