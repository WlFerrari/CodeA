import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-7xl md:text-8xl font-extrabold mb-6 text-foreground">
          404
        </h1>
        <p className="text-2xl text-muted-foreground mb-8">
          Oops! Página não encontrada
        </p>
        <Link
          to="/"
          className="text-primary hover:underline text-lg"
        >
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
