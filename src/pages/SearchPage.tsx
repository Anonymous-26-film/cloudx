import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";
import { motion } from "framer-motion";
import { MovieCard } from "../components/MovieCard";
import { SkeletonGrid } from "../components/SkeletonCard";
import { PageLoader } from "../components/LoadingSpinner";
import { searchService } from "../services/tmdbService";
import type { MediaItem } from "../types";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchService.searchMulti(query),
    enabled: query.trim().length > 0,
    staleTime: 30 * 1000,
  });
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-all"],
    queryFn: () => searchService.getTrendingAll(),
    enabled: !query,
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    if (q.trim()) setSearchParams({ q: q.trim() });
    else setSearchParams({});
  }, [setSearchParams]);

  const results: MediaItem[] = (data?.results || []).filter(
    (r: MediaItem) => r.media_type === "movie" || r.media_type === "tv"
  );
  const displayItems = query.trim() ? results : (trendingData?.results || []).map(
    (r: MediaItem) => ({ ...r, media_type: r.media_type || "movie" })
  );
  const isShowingResults = query.trim().length > 0;
  const isLoadingState = isLoading || (isFetching && results.length === 0);

  return (
    <>
      <Helmet>
        <title>{query ? `Search: "${query}"` : "Search"} — PortalHub</title>
        <meta name="description" content="Search movies and TV shows on PortalHub" />
      </Helmet>
      <OgMeta
        title={query ? `Search: "${query}"` : "Search — PortalHub"}
        description={query ? `Search results for "${query}" on PortalHub Cinema` : "Search movies and TV shows on PortalHub Cinema"}
      />
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">{isShowingResults ? "Search Results" : "Discover"}</h1>
            <div className="flex items-center bg-secondary/50 border border-border rounded-lg overflow-hidden max-w-lg">
              <input
                type="text"
                placeholder="Search movies & TV shows..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
                autoFocus={!initialQuery}
              />
            </div>
          </div>
          {isShowingResults && data && (
            <p className="text-muted-foreground text-sm mb-6">
              Found <span className="text-foreground font-semibold">{results.length}</span> results for <span className="text-primary font-semibold">"{query}"</span>
            </p>
          )}
          {!isShowingResults && !query && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">Trending Now</h2>
              <p className="text-muted-foreground text-sm">Popular movies and TV shows this week</p>
            </div>
          )}
          {isLoadingState || trendingLoading ? (
            query ? <SkeletonGrid count={20} /> : <PageLoader />
          ) : displayItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <div className="text-6xl mb-4">&#x1F50D;</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">Try different keywords or browse by category</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayItems.map((item: MediaItem) => (
                <div key={`${item.media_type}-${item.id}`}>
                  <MovieCard item={item} mediaType={item.media_type as "movie" | "tv"} />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}