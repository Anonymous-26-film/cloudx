import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";
import { motion } from "framer-motion";
import { Home, Search, Film } from "lucide-react";

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found — PortalHub Cinema</title>
        <meta name="description" content="The page you are looking for does not exist or has been moved." />
      </Helmet>
      <OgMeta
        title="404 — Page Not Found — PortalHub Cinema"
        description="The page you are looking for does not exist or has been moved."
      />

      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-4 max-w-xl relative z-10"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-10">
            <Film className="w-8 h-8 text-primary" />
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-primary">Portal</span>
              <span className="text-foreground">Hub</span>
            </span>
          </Link>

          {/* 404 display */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative mb-6">
              <span
                className="text-[140px] sm:text-[180px] font-extrabold leading-none select-none"
                style={{
                  background: "linear-gradient(135deg, #E50914 0%, #b20710 50%, #E50914 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "none",
                }}
              >
                404
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Lost in the Reel
            </h1>
            <p className="text-muted-foreground text-base mb-8 leading-relaxed">
              The page you're looking for seems to have gone off-screen. It may have been moved, deleted, or never existed.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              to="/search"
              className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-bold px-6 py-3 rounded-lg transition-colors border border-border"
            >
              <Search className="w-4 h-4" />
              Search Content
            </Link>
          </motion.div>

          {/* Quick links */}
          <div className="mt-10 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">Or browse these categories:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "Movies", to: "/movies" },
                { label: "TV Shows", to: "/tv" },
                { label: "Trending", to: "/trending" },
                { label: "Popular", to: "/popular" },
                { label: "Top Rated", to: "/top-rated" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 border border-border/50 rounded-full px-4 py-1.5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
