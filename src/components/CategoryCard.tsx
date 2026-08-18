import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  category: string;
  delay?: number;
}

const CategoryCard = ({ title, description, image, category, delay = 0 }: CategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/catalog/${category}`)}
      className="gold-border-card rounded-lg overflow-hidden bg-card group cursor-pointer"
    >
      <div className="overflow-hidden relative">
        <img
          src={image}
          alt={title}
          className="w-full h-64 sm:h-72 object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-6 text-center">
        <h3 className="font-display text-2xl font-semibold text-foreground mb-2 uppercase tracking-wide">
          {title}
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed">
          {description}
        </p>
        <span className="group relative inline-block font-body text-xs tracking-wider uppercase border border-border text-muted-foreground px-6 py-2.5 overflow-hidden transition-colors duration-500 group-hover:border-primary group-hover:text-primary">
          Дивитись каталог →
        </span>
      </div>
    </motion.div>
  );
};

export default CategoryCard;
