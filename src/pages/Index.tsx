import SEO from "@/components/SEO";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FooterSection from "@/components/FooterSection";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Leaf, Shield, Star } from "lucide-react";
import logo from "@/assets/logo.png";
import { useRef } from "react";

const qualities = [
  {
    icon: Leaf,
    title: "100% натурально",
    description: "Жодних штучних добавок, барвників чи консервантів. Тільки натуральні інгредієнти найвищої якості.",
  },
  {
    icon: Award,
    title: "Преміум якість",
    description: "Суворий контроль якості на кожному етапі виробництва — від сировини до готового продукту.",
  },
  {
    icon: Shield,
    title: "Сертифіковано",
    description: "Вся продукція відповідає українським та європейським стандартам безпеки та якості харчових продуктів.",
  },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Index = () => {
  const ctaRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ctaRef, offset: ["start end", "end start"] });
  const ctaY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="GoldProduct — натуральні снеки преміум-якості"
        description="GoldProduct — українські натуральні м'ясні та рибні снеки. Без штучних добавок та консервантів. Преміальна якість, сертифіковано."
        path="/"
      />
      <Header />
      <main>
        <HeroSection />

        {/* Qualities / Why Us */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="font-body text-xs tracking-[0.3em] text-primary uppercase mb-4">Наші переваги</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground uppercase tracking-wide mb-4">
                Чому обирають нас
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="gold-line w-16 mx-auto"
              />
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {qualities.map((q) => (
                <motion.div
                  key={q.title}
                  variants={fadeUp}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group text-center p-8 rounded-2xl border border-border bg-card/30 transition-all duration-500 hover:border-primary/30 hover:bg-card/60 hover:shadow-[0_0_40px_hsl(43_72%_55%/0.08)]"
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 transition-colors duration-300 group-hover:bg-primary/20"
                  >
                    <q.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{q.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{q.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About preview */}
        <section className="py-28 px-6 relative overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[100px]" />
          </div>

          <div className="container mx-auto max-w-5xl relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <p className="font-body text-xs tracking-[0.3em] text-primary uppercase mb-4">Про компанію</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground uppercase tracking-wide mb-4">
                Якість, перевірена часом
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="gold-line w-16 mx-auto"
              />
            </motion.div>

            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, type: "spring" }}
                className="shrink-0"
              >
                <div className="relative group cursor-pointer">
                  <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="relative w-36 h-36 rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-sm flex items-center justify-center shadow-[0_4px_30px_hsl(43_72%_55%/0.08)]">
                    <img src={logo} alt="GoldProduct" className="w-22 h-22 object-contain" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center md:text-left"
              >
                <p className="font-body text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                  Ми — українська компанія з багаторічним досвідом виробництва натуральних снеків преміум-класу.
                  Наша місія — створювати продукти, які поєднують неперевершений смак та натуральний склад.
                </p>
                <Link
                  to="/about"
                  className="group relative inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] border border-primary/40 text-primary px-7 py-3 overflow-hidden transition-all duration-500 hover:bg-primary hover:text-primary-foreground"
                >
                  Дізнатися більше
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 px-6 bg-secondary/20 overflow-hidden">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300 }}
                  >
                    <Star className="w-5 h-5 text-primary fill-primary" />
                  </motion.div>
                ))}
              </div>
              <blockquote className="font-display text-2xl sm:text-3xl font-medium text-foreground italic leading-relaxed mb-6 max-w-2xl mx-auto">
                «Найкращі натуральні снеки, які ми коли-небудь куштували. Якість відчувається з першого шматочка.»
              </blockquote>
              <p className="font-body text-xs text-muted-foreground uppercase tracking-[0.2em]">
                — Наші задоволені клієнти
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA with parallax */}
        <section ref={ctaRef} className="py-24 px-6 overflow-hidden">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div style={{ y: ctaY }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground uppercase tracking-wide mb-4">
                  Готові спробувати?
                </h2>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="gold-line w-16 mx-auto mb-6"
                />
                <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
                  Знайдіть наші снеки у найближчому магазині або зв'яжіться з нами для оптового замовлення.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/where-to-buy"
                    className="group relative inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground px-8 py-3 overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_hsl(43_72%_55%/0.3)]"
                  >
                    Де купити <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/contacts"
                    className="group relative inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-primary border border-primary/40 px-8 py-3 overflow-hidden transition-all duration-500 hover:bg-primary hover:text-primary-foreground"
                  >
                    Зв'язатися з нами
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
