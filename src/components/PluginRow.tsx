import { useRef, Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { PluginCard } from "./PluginCard";
import { SkeletonCard } from "./SkeletonCard";
import { AdBanner } from "./ads";
import type { CloudXPlugin } from "../types";

interface PluginRowProps {
  title: string;
  items: CloudXPlugin[];
  isLoading?: boolean;
  viewAllLink?: string;
}

export function PluginRow({ title, items, isLoading = false, viewAllLink }: PluginRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const scrollAmount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <motion.section
      className="mb-8 group/row"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3 px-4 md:px-8 lg:px-12">
        <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-wide">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-8 z-10 w-12 flex items-center justify-center
                     bg-gradient-to-r from-background to-transparent opacity-0 group-hover/row:opacity-100
                     transition-opacity duration-300 hover:from-background/90"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-8 z-10 w-12 flex items-center justify-center
                     bg-gradient-to-l from-background to-transparent opacity-0 group-hover/row:opacity-100
                     transition-opacity duration-300 hover:from-background/90"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-12 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : items.flatMap((plugin, index) => {
                const cards: JSX.Element[] = [<PluginCard key={plugin.internalName} plugin={plugin} />];
                if ((index + 1) % 6 === 0 && index + 1 < items.length) {
                  cards.push(<Fragment key={`ad-plugin-${index}`}><div className="flex-shrink-0 w-[300px]"><AdBanner type="300x250" /></div></Fragment>);
                }
                return cards;
              })}
        </div>
      </div>
    </motion.section>
  );
}