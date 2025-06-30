
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-theme-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-theme-text mb-4">
          Page Not Found
        </h2>
        <p className="text-theme-text-secondary mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block bg-theme-primary hover:bg-theme-primary/90 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;