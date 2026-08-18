import SEO from "@/components/SEO";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, Smile, Database, FlaskConical } from "lucide-react";
import { useRef } from "react";

import aboutHero from "@/assets/about/about-hero.jpg";
import aboutPrinciple from "@/assets/about/about-principle.jpg";
import aboutTimeline from "@/assets/about/about-timeline.jpg";
import aboutCertificates from "@/assets/about/about-certificates.jpg";
import aboutTechnology from "@/assets/about/about-technology.jpg";
import aboutPhilosophy from "@/assets/about/about-philosophy.jpg";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const principles = [
  {
    icon: CheckCircle,
    title: "Якість",
    description: "Суворий контроль на кожному етапі виробництва",
  },
  {
    icon: Smile,
    title: "Смак",
    description: "Унікальні рецептури, що вражають з першого шматочка",
  },
  {
    icon: Database,
    title: "Ціна",
    description: "Доступна преміальна якість без компромісів",
  },
];

const philosophy = [
  {
    number: "1",
    title: "Гнучкість під обсяги та формати",
    description: "Індивідуальний підхід до кожного замовлення — від малих партій до великих поставок.",
  },
  {
    number: "2",
    title: "Стандартизація процесів",
    description: "Єдині стандарти якості та виробництва на всіх етапах.",
  },
  {
    number: "3",
    title: "Контроль сировини",
    description: "Ретельний відбір інгредієнтів від перевірених постачальників.",
  },
];

const timeline = [
  { year: "2015", event: "Заснування компанії" },
  { year: "2017", event: "Перша лінія м'ясних снеків" },
  { year: "2019", event: "Запуск рибної продукції" },
  { year: "2021", event: "Розширення дистрибуції" },
  { year: "2023", event: "Сертифікація за європейськими стандартами" },
  { year: "2025", event: "50+ продуктів у портфоліо" },
];

const AboutPage = () => {
  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Про нас — GoldProduct | історія та якість"
        description="GoldProduct — українська компанія з виробництва натуральних снеків. Дізнайтесь про наші принципи, технології та сертифікати якості."
        path="/about"
      />
      <Header />
      <main className="pt-[65px]">
        {/* Hero section */}
        <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden flex items-end">
          <div className="absolute inset-0">
            <img
              src={aboutHero}
              alt="GoldProduct — українська виробничо-дистриб'юторська компанія"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-background/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          </div>
          <div className="relative z-10 w-full px-6 pb-12 sm:pb-16">
            <div className="container mx-auto max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-2xl"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="font-body text-xs tracking-[0.3em] text-primary uppercase mb-4"
                >
                  Про компанію
                </motion.p>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold gold-gradient-text uppercase tracking-wide mb-5">
                  Про нас
                </h1>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="gold-line w-20 mb-5 origin-left"
                />
                <p className="font-body text-sm sm:text-base text-foreground/70 max-w-xl leading-relaxed">
                  Українська виробничо-дистриб'юторська FMCG-компанія, що спеціалізується на виробництві снекової продукції преміальної якості.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="py-12 sm:py-16 px-6 bg-secondary/20">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8"
            >
              {[
                { value: "10+", label: "Років досвіду" },
                { value: "50+", label: "Продуктів" },
                { value: "200+", label: "Торгових точок" },
                { value: "100%", label: "Натурально" },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeUp} className="text-center">
                  <p className="font-display text-3xl sm:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Key principle */}
        <section className="py-16 sm:py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="font-body text-xs tracking-[0.3em] text-primary uppercase mb-4">Наш ключовий принцип</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Баланс між смаком, якістю та ціною
              </h2>
              <div className="gold-line w-16 mx-auto" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {principles.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="text-center p-8 rounded-2xl border border-border bg-card/30 hover:border-primary/30 hover:bg-card/60 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <p.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{p.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl overflow-hidden"
            >
              <img
                src={aboutPrinciple}
                alt="Наш ключовий принцип — баланс між смаком, якістю та ціною"
                className="w-full h-auto"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section ref={parallaxRef} className="py-16 sm:py-24 px-6 bg-secondary/20 overflow-hidden">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="font-body text-xs tracking-[0.3em] text-primary uppercase mb-4">Наша історія</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                Виробництво з <span className="text-primary">2015 року</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                За цей період розробили снеки преміальної якості з найкращої сировини.
              </p>
            </motion.div>

            {/* Timeline dots */}
            <div className="relative mb-12">
              {/* Line */}
              <div className="hidden sm:block absolute top-4 left-0 right-0 h-px bg-border" />
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
              >
                {timeline.map((item) => (
                  <motion.div key={item.year} variants={fadeUp} className="text-center">
                    <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-4 shadow-[0_0_12px_hsl(43_72%_55%/0.4)]" />
                    <p className="font-display text-lg font-bold text-primary">{item.year}</p>
                    <p className="font-body text-xs text-muted-foreground mt-1 leading-relaxed">{item.event}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              style={{ y: imgY }}
              className="rounded-2xl overflow-hidden"
            >
              <img
                src={aboutTimeline}
                alt="Історія GoldProduct з 2015 року"
                className="w-full h-auto"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>

        {/* Certificates */}
        <section className="py-16 sm:py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="font-body text-xs tracking-[0.3em] text-primary uppercase">Сертифікація</p>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Наші снеки мають <span className="text-primary">усі</span> відповідні сертифікати якості
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                  Вся продукція відповідає українським та європейським стандартам безпеки та якості харчових продуктів. Ми гарантуємо найвищий рівень контролю.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["ДСТУ", "ISO 22000", "HACCP"].map((cert) => (
                    <span
                      key={cert}
                      className="font-body text-xs uppercase tracking-wider border border-primary/30 text-primary px-4 py-2 rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-2xl overflow-hidden"
              >
                <img
                  src={aboutCertificates}
                  alt="Сертифікати якості GoldProduct"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="py-16 sm:py-24 px-6 bg-secondary/20">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl overflow-hidden order-2 lg:order-1"
              >
                <img
                  src={aboutTechnology}
                  alt="Сучасні технології виробництва GoldProduct"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="order-1 lg:order-2"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="font-body text-xs tracking-[0.3em] text-primary uppercase">Технології</p>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Використовуємо <span className="text-primary">сучасні</span> технології
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                  Постійно вдосконалюємо індивідуальні рецептури та впроваджуємо новітні методи виробництва для забезпечення найвищої якості продукції.
                </p>
                <ul className="space-y-3">
                  {[
                    "Сучасне обладнання для сушки та дегідратації",
                    "Вакуумне пакування для свіжості",
                    "Лабораторний контроль якості",
                    "Автоматизовані лінії фасування",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="font-body text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Production philosophy */}
        <section className="py-16 sm:py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="font-body text-xs tracking-[0.3em] text-primary uppercase mb-4">Філософія</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                Наша виробнича філософія заснована на <span className="text-primary">трьох принципах</span>
              </h2>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
            >
              {philosophy.map((p) => (
                <motion.div
                  key={p.number}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="relative p-8 rounded-2xl border border-border bg-card/30 hover:border-primary/30 transition-all duration-500 overflow-hidden"
                >
                  <span className="absolute -bottom-4 -right-2 font-display text-[8rem] font-bold text-primary/5 leading-none select-none">
                    {p.number}
                  </span>
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mb-5">
                      <span className="font-display text-xl font-bold text-primary-foreground">{p.number}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">{p.title}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{p.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl overflow-hidden"
            >
              <img
                src={aboutPhilosophy}
                alt="Виробнича філософія GoldProduct"
                className="w-full h-auto"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24 px-6 bg-secondary/20">
          <div className="container mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-wide mb-4">
                Готові спробувати наші снеки?
              </h2>
              <div className="gold-line w-16 mx-auto mb-6" />
              <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
                Перегляньте каталог або зв'яжіться з нами для оптового замовлення.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 transition-all duration-300"
                >
                  Каталог <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/cooperation"
                  className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] text-primary border border-primary/40 px-8 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  Співпраця
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default AboutPage;
