import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { BACKDROP_URL } from "../api/endpoints";
import { getTitle, getReleaseYear, truncateText, formatRating } from "../utils/helpers";
import { SkeletonHero } from "./SkeletonCard";
import type { Movie, TVShow } from "../types";

interface HeroBannerProps {
  items: (Movie | TVShow)[];
  isLoading?: boolean;
  mediaType?: "movie" | "tv";
}

export function HeroBanner({ items, isLoading = false, mediaType = "movie" }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 5));
    }, 7000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, items.length]);

  if (isLoading) return <SkeletonHero />;
  if (!items.length) return null;

  const featured = items.slice(0, 5);
  const current = featured[currentIndex];
  const title = getTitle(current);
  const year = getReleaseYear(current);
  const description = truncateText(current.overview, 200);
  const backdropUrl = BACKDROP_URL(current.backdrop_path);
  const resolvedType = mediaType || ((current as Movie).title !== undefined ? "movie" : "tv");

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((i) => (i - 1 + featured.length) % featured.length);
  };
  const next = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((i) => (i + 1) % featured.length);
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "56.25vw", maxHeight: "85vh" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {backdropUrl ? (
            <img src={backdropUrl} alt={title} className="w-full h-full object-cover" loading="eager" />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 lg:px-12 pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current.id}`}
              className="max-w-xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 bg-primary/20 border border-primary/40 rounded px-2 py-0.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-foreground">{formatRating(current.vote_average)}</span>
                </div>
                <span className="text-sm text-muted-foreground">{year}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
                {title}
              </h1>
              {description && (
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-6 line-clamp-3">{description}</p>
              )}
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/hub?play=${current.id}&type=${resolvedType}`}
                  className="flex items-center gap-2 bg-white text-black font-bold px-6 py-2.5 rounded-md hover:bg-white/90 transition-colors text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" /> Play
                </Link>
                <Link
                  to={`/${resolvedType}/${current.id}`}
                  className="flex items-center gap-2 bg-white/20 text-white font-bold px-6 py-2.5 rounded-md hover:bg-white/30 transition-colors backdrop-blur-sm text-sm sm:text-base"
                >
                  <Info className="w-4 h-4 sm:w-5 sm:h-5" /> More Info
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {featured.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20 border border-white/20"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors z-20 border border-white/20"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {featured.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setIsAutoPlaying(false); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}