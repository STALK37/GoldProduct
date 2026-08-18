import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  delay?: number;
}

const ProductCard = ({ id, title, description, image, price, delay = 0 }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/product/${id}`)}
      className="gold-border-card rounded-lg overflow-hidden bg-card group cursor-pointer"
    >
      <div className="overflow-hidden relative">
        <img
          src={image}
          alt={title}
          className="w-full h-64 sm:h-72 object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="p-6 text-center">
        <h3 className="font-display text-2xl font-semibold text-foreground mb-2 uppercase tracking-wide">
          {title}
        </h3>
        <p className="font-body text-sm text-muted-foreground mb-3 leading-relaxed">
          {description}
        </p>
        <p className="font-display text-xl text-primary mb-5">від {price} ₴</p>
        <span className="inline-block font-body text-xs tracking-wider uppercase border border-border text-muted-foreground px-6 py-2.5 transition-all duration-300 group-hover:border-primary group-hover:text-primary group-hover:bg-primary/10">
          Детальніше →
        </span>
      </div>
    </motion.div>
  );
};

export default ProductCard;
