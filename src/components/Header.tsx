import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import CartButton from "./CartButton";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Снеки", href: "/snacks" },
  { label: "Каталог", href: "/catalog" },
  { label: "Про\u00A0нас", href: "/about" },
  { label: "Де\u00A0купити", href: "/where-to-buy" },
  { label: "Співпраця", href: "/cooperation" },
  { label: "Контакти", href: "/contacts" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const NavItem = ({ item }: { item: (typeof navItems)[0] }) => (
    <Link
      to={item.href}
      className="font-body text-xs tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors duration-300 uppercase"
    >
      {item.label}
    </Link>
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4 sm:px-6 lg:grid lg:grid-cols-3">
        {/* Logo - left */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 lg:justify-self-start">
          <img src={logo} alt="GoldProduct" className="w-10 h-10 sm:w-14 sm:h-14 object-contain" />
          <span className="font-display text-sm tracking-[0.2em] text-foreground uppercase hidden sm:block">
            GoldProduct
          </span>
        </Link>

        {/* Desktop nav - centered (only on lg+) */}
        <nav className="hidden lg:flex items-center justify-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        {/* Cart + mobile toggle - right */}
        <div className="flex items-center gap-3 sm:gap-4 lg:justify-self-end">
          <CartButton />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-foreground p-1"
            aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile/tablet nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border overflow-hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-6 py-3 font-body text-sm tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase"
              >
                {item.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
