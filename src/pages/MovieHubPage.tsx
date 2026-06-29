import { useState, useEffect, useCallback } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";
import { motion } from "framer-motion";
import {
  Search, X, Play, Film,
  RefreshCw, PanelLeft, Server,
  Star, Clock, Calendar,
} from "lucide-react";
import { ServerSidebar } from "../components/ServerSidebar";
import { PaginationBar } from "../components/PaginationBar";
import { pluginService } from "../services/pluginService";
import { movieService, tvService } from "../services/tmdbService";
import { PageLoader } from "../components/LoadingSpinner";
import { IMAGE_URL } from "../api/endpoints";
import {
  getTitle, getReleaseYear,
  formatRating, formatRuntime,
  getReleaseDate,
} from "../utils/helpers";
import type { CloudXPlugin, Movie, TVShow } from "../types";

export function MovieHubPage() {
  const [searchParams] = useSearchParams();
  const playParam = searchParams.get("play");
  const mediaType = (searchParams.get("type") || "movie") as "movie" | "tv";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedServer, setSelectedServer] = useState<CloudXPlugin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [showPreview, setShowPreview] = useState(!playParam);
  const [playingMovieId, setPlayingMovieId] = useState<number>(Number(playParam) || 0);
  const [serverIconError, setServerIconError] = useState(false);

  useEffect(() => { setServerIconError(false); }, [selectedServer]);

  // Fetch detail when playing
  const { data: playingDetail } = useQuery({
    queryKey: ["hub-detail", mediaType, playingMovieId],
    queryFn: (): Promise<Movie | TVShow> =>
      mediaType === "movie"
        ? movieService.getDetail(playingMovieId)
        : tvService.getDetail(playingMovieId),
    enabled: playingMovieId > 0,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch YouTube trailer from TMDB when playing
  const { data: videosData } = useQuery({
    queryKey: ["hub-videos", mediaType, playingMovieId],
    queryFn: () =>
      mediaType === "movie"
        ? movieService.getVideos(playingMovieId)
        : tvService.getVideos(playingMovieId),
    enabled: playingMovieId > 0,
    staleTime: 10 * 60 * 1000,
  });

  const trailer = ((videosData as any)?.results || [])
    .filter((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
    [0];

  // Pagination state
  const [page, setPage] = useState(1);

  // Reset page on search query change
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // CloudX servers for sidebar
  const { data: plugins, isLoading: pluginsLoading } = useQuery({
    queryKey: ["plugins", "all"],
    queryFn: () => pluginService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const isSearching = searchQuery.trim().length > 0;

  // TMDB trending movies (paginated)
  const { data: trendingData } = useQuery({
    queryKey: ["hub", "trending", page],
    queryFn: () => movieService.getTrending(page),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled: !isSearching,
  });

  // TMDB search (paginated)
  const { data: searchData } = useQuery({
    queryKey: ["hub", "search", searchQuery, page],
    queryFn: () => movieService.search(searchQuery, page),
    placeholderData: keepPreviousData,
    enabled: isSearching,
    staleTime: 60 * 1000,
  });

  const currentData = isSearching ? searchData : trendingData;
  const movies = currentData?.results || [];
  const totalPages = currentData?.total_pages || 0;

  const allPlugins = plugins || [];

  if (pluginsLoading) return <PageLoader />;

  const getPlayerUrl = (movieId: number) => {
    if (selectedServer) return `https://vidsrc.to/embed/movie/${movieId}`;
    if (trailer?.key) return `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`;
    return `https://vidsrc.to/embed/movie/${movieId}`;
  };

  return (
    <>
      <Helmet>
        <title>Watch — PortalHub</title>
        <meta name="description" content="Watch movies and TV shows via multiple streaming providers" />
      </Helmet>
      <OgMeta
        title="Watch — PortalHub"
        description="Watch movies and TV shows via multiple streaming providers"
      />

      <div className="min-h-screen pt-16">
        <div className="flex">
          {/* Server Sidebar */}
          <ServerSidebar
            plugins={allPlugins}
            selectedServer={selectedServer}
            onSelectServer={(p) => {
              setSelectedServer(p);
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Main */}
          <main className="flex-1 min-w-0 transition-all duration-300">
            {/* Top bar */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 md:px-6 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors lg:hidden" title="Toggle server list">
                  <PanelLeft className="w-5 h-5" />
                </button>
                {selectedServer && (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-md overflow-hidden bg-background border border-border/30 flex-shrink-0 flex items-center justify-center">
                      {selectedServer.iconUrl && !serverIconError ? (
                        <img
                          src={selectedServer.iconUrl}
                          alt={selectedServer.name}
                          className="w-full h-full object-contain"
                          onError={() => setServerIconError(true)}
                          onLoad={() => setServerIconError(false)}
                        />
                      ) : (
                        <Film className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground truncate">{selectedServer.name}</span>
                    <div className={`w-2 h-2 rounded-full ${selectedServer.status === 1 ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                  </div>
                )}
                <div className="flex-1 max-w-lg">
                  <div className="flex items-center bg-secondary/50 border border-border rounded-lg overflow-hidden">
                    <Search className="w-4 h-4 ml-3 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search movies... (TMDB API)"
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
                <button onClick={() => setIframeKey((k) => k + 1)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Refresh player">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6">
              {/* No server selected */}
              {!selectedServer && !playingMovieId && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-center py-12 mb-6 bg-secondary/20 rounded-2xl border border-border/30">
                    <div className="text-6xl mb-4">&#x1F3AC;</div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Select a Server to Start</h2>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Choose a streaming server from the sidebar, then browse movies to watch. Content powered by TMDB.
                    </p>
                    <button onClick={() => setSidebarOpen(true)} className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                      <Server className="w-4 h-4" /> Browse Servers
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Movie grid */}
              {(!playingMovieId || showPreview) && movies.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Section header with page info */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Play className="w-5 h-5 text-primary" />
                      {isSearching ? `Search: "${searchQuery}"` : "Trending Movies"}
                    </h3>
                    {totalPages > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Page {page} of {totalPages}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
                    {movies.map((movie, i) => (
                      <motion.button
                        key={movie.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => { setPlayingMovieId(movie.id); setShowPreview(false); setIframeKey((k) => k + 1); }}
                        className="flex flex-col gap-2 p-2 bg-secondary/30 hover:bg-secondary/50 border border-border/30 hover:border-primary/30 rounded-xl transition-all group text-left"
                      >
                        <div className="w-full aspect-[2/3] rounded-lg bg-background overflow-hidden border border-border/20">
                          {movie.poster_path ? (
                            <img src={IMAGE_URL(movie.poster_path, "w342") || ""} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">&#x1F3AC;</div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{movie.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-yellow-400">&#x2605; {movie.vote_average.toFixed(1)}</span>
                            <span className="text-[10px] text-muted-foreground">{movie.release_date?.split("-")[0]}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Pagination */}
                  <PaginationBar
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    maxVisible={5}
                  />
                </motion.div>
              )}

              {/* Player */}
              {playingMovieId > 0 && !showPreview && (
                <motion.div key={iframeKey} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => setShowPreview(true)} className="px-3 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Back to Movies
                    </button>
                    {selectedServer ? (
                      <span className="text-xs text-muted-foreground">via {selectedServer.name}</span>
                    ) : trailer ? (
                      <span className="text-xs text-primary font-medium">&#9654; Official Trailer</span>
                    ) : null}
                  </div>
                    <div className="relative w-full bg-black rounded-xl overflow-hidden border border-border/30 shadow-2xl">
                      <div className="w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          key={iframeKey}
                          src={getPlayerUrl(playingMovieId)}
                          className="absolute inset-0 w-full h-full"
                          allowFullScreen
                          allow="autoplay; fullscreen; picture-in-picture"
                          style={{ border: "none" }}
                          title={selectedServer ? "Video Player" : "Official Trailer"}
                        />
                      </div>
                    </div>
                </motion.div>
              )}

              {/* Movie Detail */}
              {playingMovieId > 0 && !showPreview && playingDetail && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 p-6 bg-card rounded-xl border border-border/50"
                >
                  <div className="flex flex-row gap-4 md:gap-6">
                    {playingDetail.poster_path && (
                      <div className="flex-shrink-0 w-28 md:w-40 self-center rounded-lg overflow-hidden border border-border/30">
                        <img
                          src={IMAGE_URL(playingDetail.poster_path, "w342")!}
                          alt={getTitle(playingDetail)}
                          className="w-full aspect-[2/3] object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-foreground mb-1">
                        {getTitle(playingDetail)}
                      </h2>
                      {playingDetail.tagline && (
                        <p className="text-sm text-muted-foreground italic mb-3">
                          {playingDetail.tagline}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 rounded px-2 py-0.5 text-sm font-semibold">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          {formatRating(playingDetail.vote_average)}
                        </div>
                        {getReleaseYear(playingDetail) && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> {getReleaseDate(playingDetail)}
                          </span>
                        )}
                        {mediaType === "movie" && (playingDetail as Movie).runtime && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {formatRuntime((playingDetail as Movie).runtime!)}
                          </span>
                        )}
                      </div>
                      {playingDetail.genres && playingDetail.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {playingDetail.genres.map((g: { id: number; name: string }) => (
                            <span key={g.id} className="text-xs bg-secondary text-foreground/80 rounded-full px-3 py-1 border border-border/50">
                              {g.name}
                            </span>
                          ))}
                        </div>
                      )}
                      {playingDetail.overview && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {playingDetail.overview}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}