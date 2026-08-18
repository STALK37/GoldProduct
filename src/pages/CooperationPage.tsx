import SEO from "@/components/SEO";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Utensils, Tag, ArrowRight, Phone, Mail } from "lucide-react";

const cooperationServices = [
  {
    icon: Tag,
    title: "Снеки під вашим брендом",
    description: "Розробка та фасовка снеків під вашою торговою маркою. Ми беремо на себе весь цикл — від рецептури до готового продукту на полиці з вашим лого.",
    features: ["Розробка рецептури", "Дизайн упаковки", "Виробництво під ключ", "Контроль якості"],
  },
  {
    icon: Utensils,
    title: "Індивідуальні снеки під ваш формат",
    description: "Розробка та поставка унікальних снеків, адаптованих під формат вашого закладу — пивні, ресторани, бари, магазини.",
    features: ["Адаптація під меню", "Ексклюзивні рецепти", "Гнучкі обсяги поставок", "Регулярна доставка"],
  },
  {
    icon: Package,
    title: "Фасовка за індивідуальним замовленням",
    description: "Фасовка та упаковка снекової продукції на замовлення — будь-яка вага, формат упаковки та брендування за вашими вимогами.",
    features: ["Будь-яка вага фасовки", "Індивідуальна упаковка", "Маркування та етикетка", "Мінімальні тиражі"],
  },
];

const steps = [
  { step: "01", title: "Заявка", description: "Залиште заявку або зателефонуйте нам" },
  { step: "02", title: "Обговорення", description: "Обговоримо ваші потреби та формат" },
  { step: "03", title: "Розробка", description: "Створимо рецептуру та дизайн під вас" },
  { step: "04", title: "Виробництво", description: "Запустимо виробництво та доставку" },
];

const CooperationPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Співпраця — приватна торгова марка | GoldProduct"
        description="B2B-співпраця з GoldProduct: снеки під вашим брендом, індивідуальні рецепти для закладів, фасовка під замовлення."
        path="/cooperation"
      />
      <Header />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 sm:py-24 px-6">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground uppercase tracking-wide mb-4">
                Співпраця
              </h1>
              <div className="gold-line w-16 mx-auto mb-6" />
              <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Ми пропонуємо гнучкі формати співпраці для бізнесу будь-якого масштабу — від невеликих крафтових магазинів до великих мережевих ритейлерів.
              </p>
            </motion.div>

            {/* Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {cooperationServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.15, type: "spring", stiffness: 80 }}
                  className="group relative rounded-2xl border border-border bg-card p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_12px_40px_hsl(var(--primary)/0.08)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-primary/20">
                      <service.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground mb-3">{service.title}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                          <span className="font-body text-xs text-foreground/70">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24 px-6 bg-secondary/20">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="font-body text-xs tracking-[0.3em] text-primary uppercase mb-4">Процес</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-wide mb-4">
                Як це працює
              </h2>
              <div className="gold-line w-16 mx-auto" />
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="text-center"
                >
                  <p className="font-display text-3xl sm:text-4xl font-bold text-primary/30 mb-3">{s.step}</p>
                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-2">{s.title}</h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24 px-6">
          <div className="container mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.05] to-transparent p-8 sm:p-10 text-center"
            >
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Готові до співпраці?
              </h3>
              <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
                Зв'яжіться з нами, і ми підберемо оптимальний формат співпраці для вашого бізнесу.
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 mb-8 w-full">
                <a href="mailto:hello@example.com" className="flex items-center gap-3 group w-full sm:w-auto justify-center">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors break-all">
                    hello@example.com
                  </span>
                </a>
                <a href="tel:+380441234567" className="flex items-center gap-3 group w-full sm:w-auto justify-center">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-body text-sm text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                    +380 44 123 45 67
                  </span>
                </a>
              </div>

              <Link
                to="/contacts"
                className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.2em] bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-all duration-300"
              >
                Усі контакти <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default CooperationPage;
