import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import BackButton from "@/components/BackButton";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        <div className="flex items-center justify-center gap-3">
          <BackButton fallback="/" />
          <Link to="/" className="text-primary underline hover:text-primary/90">Go Home</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
