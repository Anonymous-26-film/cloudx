import { useState, useEffect, useCallback } from "react";
import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";
import { motion } from "framer-motion";
import { MovieCard } from "../components/MovieCard";
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

  const [page, setPage] = useState(1);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [category]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["category", category, page],
    queryFn: () => fetcher(page),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.results || [];
  const totalPages = data?.total_pages || 0;

  return (
    <>
      <Helmet><title>{title} — PortalHub</title><meta name="description" content={description} /></Helmet>
      <OgMeta title={`${title} — PortalHub`} description={description || `Browse ${title} on PortalHub Cinema`} />
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </motion.div>
          {isLoading ? <SkeletonGrid count={20} /> : items.length === 0 ? (
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