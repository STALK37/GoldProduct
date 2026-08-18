import { motion } from "framer-motion";
import CategoryCard from "./CategoryCard";
import meatSnacks from "@/assets/meat-snacks.jpg";
import fishSnacks from "@/assets/fish-snacks.jpg";

const categories = [
  {
    title: "М'ясні снеки",
    description: "Ситні, хрусткі — ідеальні до дороги та фільму.",
    image: meatSnacks,
    category: "meat",
  },
  {
    title: "Рибні снеки",
    description: "Смак моря — легкі та ідеальні до напоїв.",
    image: fishSnacks,
    category: "fish",
  },
];

const SnacksSection = () => {
  return (
    <section id="snacks" className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground uppercase tracking-wide mb-4">
            Снеки
          </h2>
          <div className="gold-line w-16 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.category} {...cat} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SnacksSection;
