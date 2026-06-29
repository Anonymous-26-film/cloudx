import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Search, X, Film, TrendingUp, Star, Clock, Sparkles } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import { SkeletonGrid } from "../components/SkeletonCard";

import { PaginationBar } from "../components/PaginationBar";
import { movieService } from "../services/tmdbService";
import type { Movie, TMDBResponse } from "../types";

type MovieTab = "trending" | "popular" | "top-rated" | "upcoming";

const TABS: { key: MovieTab; label: string; icon: React.ReactNode }[] = [
  { key: "trending", label: "Trending", icon: <TrendingUp className="w-4 h-4" /> },
  { key: "popular", label: "Popular", icon: <Sparkles className="w-4 h-4" /> },
  { key: "top-rated", label: "Top Rated", icon: <Star className="w-4 h-4" /> },
  { key: "upcoming", label: "Upcoming", icon: <Clock className="w-4 h-4" /> },
];

const FETCHERS: Record<
  MovieTab,
  (page: number) => Promise<TMDBResponse<Movie>>
> = {
  trending: (p) => movieService.getTrending(p),
  popular: (p) => movieService.getPopular(p),
  "top-rated": (p) => movieService.getTopRated(p),
  upcoming: (p) => movieService.getUpcoming(p),
};

export function MoviesPage() {
  const [activeTab, setActiveTab] = useState<MovieTab>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // Reset page when tab or search changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  // Scroll to top on page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const fetcher = FETCHERS[activeTab];

  const { data, isLoading } = useQuery({
    queryKey: ["movies", activeTab, page],
    queryFn: () => fetcher(page),
    staleTime: 5 * 60 * 1000,
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["movies", "search", searchQuery, page],
    queryFn: () => movieService.search(searchQuery, page),
    enabled: searchQuery.trim().length > 0,
    staleTime: 30 * 1000,
  });

  const isSearching = searchQuery.trim().length > 0;

  const currentData = isSearching ? searchData : data;
  const currentLoading = isSearching ? searchLoading : isLoading;
  const items = currentData?.results || [];
  const totalPages = currentData?.total_pages || 0;

  // Check for env API key presence
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const hasApiKey = !!apiKey;

  return (
    <>
      <Helmet>
        <title>Movies — PortalHub</title>
        <meta
          name="description"
          content="Browse trending, popular, top-rated, and upcoming movies powered by TMDB API"
        />
      </Helmet>

      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Film className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                Movies
              </h1>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                TMDB API
              </span>
            </div>
            <p className="text-muted-foreground">
              {hasApiKey
                ? "Discover trending, popular, top-rated, and upcoming movies powered by TMDB."
                : "Missing TMDB API key — please add VITE_TMDB_API_KEY to your .env file."}
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center bg-secondary/50 border border-border rounded-lg overflow-hidden max-w-md">
              <Search className="w-4 h-4 ml-3 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search movies by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Tabs (hidden when searching) */}
          {!isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex gap-1 mb-8 overflow-x-auto pb-1"
            >
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-primary text-white"
                      : "bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </motion.div>
          )}

          {/* Content */}
          {!hasApiKey ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">&#x1F511;</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                API Key Required
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
                Add your TMDB API key to the <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">.env</code> file:
              </p>
              <pre className="bg-secondary/30 border border-border rounded-lg p-4 text-xs text-left inline-block mx-auto">
                VITE_TMDB_API_KEY=your_key_here{"\n"}
                VITE_TMDB_ACCESS_TOKEN=your_token_here
              </pre>
              <p className="text-muted-foreground text-xs mt-4">
                Get a free key at{" "}
                <a
                  href="https://www.themoviedb.org/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  themoviedb.org
                </a>
              </p>
            </motion.div>
          ) : currentLoading ? (
            <SkeletonGrid count={20} />
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">&#x1F3AC;</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isSearching
                  ? `No results for "${searchQuery}"`
                  : "No movies found"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {isSearching
                  ? "Try a different search query"
                  : "Something went wrong fetching movies"}
              </p>
            </div>
          ) : (
            <>
              {/* Results count + page info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground mb-4"
              >
                {isSearching
                  ? `Results for "${searchQuery}" — Page ${page} of ${totalPages}`
                  : `Page ${page} of ${totalPages}`}
              </motion.div>

              {/* Movie Grid */}
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
                    <MovieCard item={item} mediaType="movie" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination Bar */}
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