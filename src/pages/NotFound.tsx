import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="font-display text-7xl font-bold text-primary mb-4">404</h1>
        <p className="font-body text-xl text-muted-foreground mb-6">Сторінку не знайдено</p>
        <Link
          to="/"
          className="inline-block font-body text-xs uppercase tracking-[0.2em] text-primary border border-primary/40 px-8 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          На головну
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
