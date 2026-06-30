import { useState, useEffect, useCallback } from "react";
import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import { MovieFilter } from "../components/MovieFilter";
import { PaginationBar } from "../components/PaginationBar";
import { PluginCardGrid } from "../components/PluginCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { movieService } from "../services/tmdbService";
import { tvService } from "../services/tmdbService";
import { pluginService } from "../services/pluginService";
import type { Movie, TVShow, TMDBResponse, CloudXPlugin, PluginCategory } from "../types";

interface CategoryPageProps {
  category: string;
  title: string;
  description?: string;
}

// TMDB-powered category fetchers
const TMDB_FETCHERS: Record<string, (p: number) => Promise<TMDBResponse<Movie | TVShow>>> = {
  "trending-movies": (p) => movieService.getTrending(p),
  "popular-movies": (p) => movieService.getPopular(p),
  "top-rated-movies": (p) => movieService.getTopRated(p),
  "upcoming-movies": (p) => movieService.getUpcoming(p),
  "trending-tv": (p) => tvService.getTrending(p),
  "popular-tv": (p) => tvService.getPopular(p),
  "top-rated-tv": (p) => tvService.getTopRated(p),
  Anime: (p) => movieService.discoverAnime(p),
};

const MEDIA_TYPE_MAP: Record<string, "movie" | "tv"> = {
  "trending-movies": "movie", "popular-movies": "movie", "top-rated-movies": "movie", "upcoming-movies": "movie",
  "trending-tv": "tv", "popular-tv": "tv", "top-rated-tv": "tv",
  Anime: "movie",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Movie: "Sources that provide movie streaming content",
  TvSeries: "Sources for TV series and episodic content",
  Anime: "Anime, anime movies, and OVA streaming sources",
  AsianDrama: "Asian drama series streaming sources",
  all: "All available streaming sources in the CloudX catalog",
  "trending-movies": "The most trending movies this week",
  "popular-movies": "The most popular movies right now",
  "top-rated-movies": "The highest rated movies of all time",
  "upcoming-movies": "Movies coming soon to theaters",
  "trending-tv": "The most trending TV shows this week",
  "popular-tv": "The most popular TV shows right now",
  "top-rated-tv": "The highest rated TV shows of all time",
};

// ── Filter localStorage helpers ──
const FILTER_STORAGE = {
  genres: "portalhub-filter-genres",
  year: "portalhub-filter-year",
};

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Only apply filter for movie categories (not TV or CloudX)
const MOVIE_CATEGORIES = new Set([
  "trending-movies", "popular-movies", "top-rated-movies", "upcoming-movies", "Anime",
]);

export function CategoryPage({ category, title, description }: CategoryPageProps) {
  const desc = description || CATEGORY_DESCRIPTIONS[category] || "";

  // TMDB category (movies/TV)
  if (TMDB_FETCHERS[category]) {
    return <TMDBCategoryPage category={category} title={title} description={desc} />;
  }

  // CloudX plugin category
  return <CloudXCategoryPage category={category} title={title} description={desc} />;
}

function TMDBCategoryPage({ category, title, description }: CategoryPageProps) {
  const fetcher = TMDB_FETCHERS[category];
  const mediaType = MEDIA_TYPE_MAP[category] || "movie";
  const showFilter = MOVIE_CATEGORIES.has(category);
  const isAnime = category === "Anime";

  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    () => safeJsonParse<number[]>(localStorage.getItem(FILTER_STORAGE.genres), []),
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    () => safeJsonParse<number | null>(localStorage.getItem(FILTER_STORAGE.year), null),
  );

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = isAnime && searchQuery.trim().length > 0;

  // Persist filters
  useEffect(() => { localStorage.setItem(FILTER_STORAGE.genres, JSON.stringify(selectedGenres)); }, [selectedGenres]);
  useEffect(() => { localStorage.setItem(FILTER_STORAGE.year, JSON.stringify(selectedYear)); }, [selectedYear]);

  // Reset page when filters or category or search change
  useEffect(() => {
    setPage(1);
  }, [category, selectedGenres, selectedYear, searchQuery]);

  const isFiltering = showFilter && !isSearching && (selectedGenres.length > 0 || selectedYear !== null);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Default category data
  const { data, isLoading } = useQuery({
    queryKey: ["category", category, page],
    queryFn: () => fetcher(page),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled: !isFiltering && !isSearching,
  });

  // Discover data (filtered)
  const { data: discoverData, isLoading: discoverLoading } = useQuery({
    queryKey: ["category", category, "discover", selectedGenres, selectedYear, page],
    queryFn: () =>
      movieService.discover({
        page,
        with_genres: selectedGenres.length > 0 ? selectedGenres.join(",") : undefined,
        primary_release_year: selectedYear ?? undefined,
        with_keywords: isAnime ? "210024" : undefined,
        with_original_language: isAnime ? "ja" : undefined,
      }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled: isFiltering,
  });

  // Anime search (only for anime category)
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["category", "anime-search", searchQuery, page],
    queryFn: () => movieService.search(searchQuery, page),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    enabled: isSearching,
  });

  const currentData = isSearching ? searchData : isFiltering ? discoverData : data;
  const currentLoading = isSearching ? searchLoading : isFiltering ? discoverLoading : isLoading;
  const items = currentData?.results || [];
  const totalPages = currentData?.total_pages || 0;

  return (
    <>
      <Helmet><title>{title} — PortalHub</title><meta name="description" content={description} /></Helmet>
      <OgMeta title={`${title} — PortalHub`} description={description || `Browse ${title} on PortalHub Cinema`} />
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
            {isAnime && (
              <div className="mt-3">
                <div className="flex items-center bg-secondary/50 border border-border rounded-lg overflow-hidden max-w-md">
                  <Search className="w-4 h-4 ml-3 text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="p-2 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* MovieFilter (genre/year only, no category nav) */}
          {showFilter && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <MovieFilter
                activeCategory=""
                onCategoryChange={() => {}}
                selectedGenres={selectedGenres}
                onGenresChange={setSelectedGenres}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                showCategoryNav={false}
              />
            </motion.div>
          )}

          {currentLoading ? <SkeletonGrid count={20} /> : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">&#x1F3AC;</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No content found</h3>
              <p className="text-muted-foreground text-sm">Try a different category</p>
            </div>
          ) : (
            <>
              {/* Page info */}
              <div className="text-sm text-muted-foreground mb-4">
                Page {page} of {totalPages}
              </div>

              {/* Grid */}
              <motion.div
                key={page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6"
              >
                {items.map((item, i) => (
                  <motion.div
                    key={`${item.id}-${page}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  >
                    <MovieCard item={item} mediaType={mediaType} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              <PaginationBar
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                maxVisible={5}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function CloudXCategoryPage({ category, title, description }: CategoryPageProps) {
  const { data: plugins = [], isLoading } = useInfiniteQuery({
    queryKey: ["plugins", "category", category],
    queryFn: () =>
      category === "all"
        ? pluginService.getAll()
        : pluginService.getByCategory(category as PluginCategory),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
    staleTime: 5 * 60 * 1000,
  } as never);

  // Flatten since useInfiniteQuery wraps result
  const items = (plugins as unknown as CloudXPlugin[]) || [];

  return (
    <>
      <Helmet><title>{title} — PortalHub</title><meta name="description" content={description} /></Helmet>
      <OgMeta title={`${title} — PortalHub`} description={description || `Browse ${title} on PortalHub Cinema`} />
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </motion.div>
          {isLoading ? <SkeletonGrid count={20} /> : items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">&#x1F4E6;</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No sources in this category</h3>
              <p className="text-muted-foreground">Try browsing a different category</p>
            </div>
          ) : (
            <PluginCardGrid plugins={items} />
          )}
        </div>
      </div>
    </>
  );
}