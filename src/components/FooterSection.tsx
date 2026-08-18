import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const footerLinks = [
  { label: "Снеки", href: "/snacks" },
  { label: "Про нас", href: "/about" },
  { label: "Де купити", href: "/where-to-buy" },
  { label: "Співпраця", href: "/cooperation" },
  { label: "Каталог", href: "/catalog" },
  { label: "Контакти", href: "/contacts" },
];

const FooterSection = () => {
  return (
    <footer className="py-12 sm:py-16 px-6 border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="GoldProduct" className="w-8 h-8 object-contain" />
            <span className="font-display text-sm tracking-[0.2em] text-foreground uppercase">
              GoldProduct
            </span>
          </Link>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {footerLinks.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="font-body text-xs tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="font-body text-xs text-muted-foreground text-center">
            © 2026 GoldProduct. Усі права захищені.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
