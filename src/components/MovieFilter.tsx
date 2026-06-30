import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Filter, X } from "lucide-react";
import { cn } from "../lib/utils";

// ── Constants ──
const CATEGORIES = [
  { id: "trending", label: "Trending" },
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top Rated" },
  { id: "upcoming", label: "Upcoming" },
] as const;

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const STORAGE = {
  genreOpen: "portalhub-filter-genre-open",
  yearOpen: "portalhub-filter-year-open",
};

function getYears(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);
}

// ── Props ──
export interface MovieFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  selectedGenres: number[];
  onGenresChange: (genres: number[]) => void;
  selectedYear: number | null;
  onYearChange: (year: number | null) => void;
  showCategoryNav?: boolean;
}

// ── Sub-components ──
function ToggleHeader({
  open,
  label,
  onClick,
  count,
}: {
  open: boolean;
  label: string;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full text-left text-sm font-semibold text-foreground/90 hover:text-foreground transition-colors mb-3 select-none group"
    >
      <ChevronRight
        className={cn(
          "w-4 h-4 transition-transform duration-300",
          open && "rotate-90",
        )}
      />
      <span className="tracking-wide">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] bg-[#e50914] text-white font-bold rounded-full px-1.5 py-0.5 leading-none">
          {count}
        </span>
      )}
    </button>
  );
}

// ── Main Component ──
export function MovieFilter({
  activeCategory,
  onCategoryChange,
  selectedGenres,
  onGenresChange,
  selectedYear,
  onYearChange,
  showCategoryNav = true,
}: MovieFilterProps) {
  // Collapse state (persisted)
  const [genreOpen, setGenreOpen] = useState(() =>
    localStorage.getItem(STORAGE.genreOpen) !== "false",
  );
  const [yearOpen, setYearOpen] = useState(() =>
    localStorage.getItem(STORAGE.yearOpen) === "true",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE.genreOpen, String(genreOpen));
  }, [genreOpen]);

  useEffect(() => {
    localStorage.setItem(STORAGE.yearOpen, String(yearOpen));
  }, [yearOpen]);

  const years = useMemo(() => getYears(), []);

  const activeFilterCount = selectedGenres.length + (selectedYear ? 1 : 0);

  const toggleGenre = (id: number) => {
    if (selectedGenres.includes(id)) {
      onGenresChange(selectedGenres.filter((g) => g !== id));
    } else {
      onGenresChange([...selectedGenres, id]);
    }
  };

  const clearFilters = () => {
    onGenresChange([]);
    onYearChange(null);
  };

  const pillBase =
    "rounded-full px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-medium transition-all duration-[250ms] border border-transparent whitespace-nowrap shrink-0 cursor-pointer select-none";

  const categoryActive =
    "bg-gradient-to-br from-[#e50914] to-[#ff3b30] text-white font-bold shadow-[0_4px_20px_rgba(229,9,20,0.4)] scale-[1.03]";
  const categoryInactive =
    "bg-[#1f1f1f] text-[#b0b0b0] hover:scale-105 hover:text-white";

  const filterActive =
    "bg-gradient-to-br from-[#e50914] to-[#ff3b30] text-white font-bold -translate-y-0.5 shadow-[0_4px_12px_rgba(229,9,20,0.3)]";
  const filterInactive =
    "bg-[#242424] text-white hover:-translate-y-0.5 hover:bg-[#2e2e2e]";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mb-6 rounded-[20px] bg-[rgba(20,20,20,0.95)] border border-white/[0.08] backdrop-blur-[20px] p-4 md:p-6 overflow-hidden"
    >
      {/* ── Category Navigation ── */}
      {showCategoryNav && (
      <div className="mb-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(pillBase, isActive ? categoryActive : categoryInactive)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* ── Active Filters Bar ── */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-sm">
                <Filter className="w-3.5 h-3.5 text-[#e50914]" />
                <span className="text-foreground/80">
                  <span className="font-bold text-[#e50914]">
                    {activeFilterCount}
                  </span>{" "}
                  {activeFilterCount === 1 ? "Filter" : "Filters"} Active
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-xs text-foreground/50 hover:text-[#e50914] transition-colors"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Genre Filter ── */}
      <div className="mb-5">
        <ToggleHeader
          open={genreOpen}
          label="Filter by Genre"
          onClick={() => setGenreOpen((p) => !p)}
          count={selectedGenres.length}
        />
        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            genreOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-wrap gap-3 overflow-x-auto scrollbar-hide pb-1">
            {GENRES.map((genre) => {
              const isActive = selectedGenres.includes(genre.id);
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={cn(
                    pillBase,
                    isActive ? filterActive : filterInactive,
                  )}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Year Filter ── */}
      <div>
        <ToggleHeader
          open={yearOpen}
          label="Filter by Year"
          onClick={() => setYearOpen((p) => !p)}
          count={selectedYear ? 1 : undefined}
        />
        <div
          className={cn(
            "overflow-hidden transition-all duration-500 ease-in-out",
            yearOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-wrap gap-3 overflow-x-auto scrollbar-hide pb-1">
            {years.map((year) => {
              const isActive = selectedYear === year;
              return (
                <button
                  key={year}
                  onClick={() =>
                    onYearChange(isActive ? null : year)
                  }
                  className={cn(
                    pillBase,
                    isActive ? filterActive : filterInactive,
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}