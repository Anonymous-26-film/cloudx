import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Search, X, Play, Film,
  RefreshCw, PanelLeft, Server,
} from "lucide-react";
import { ServerSidebar } from "../components/ServerSidebar";
import { pluginService } from "../services/pluginService";
import { movieService } from "../services/tmdbService";
import { PageLoader } from "../components/LoadingSpinner";
import { IMAGE_URL } from "../api/endpoints";
import type { CloudXPlugin } from "../types";

export function MovieHubPage() {
  const [searchParams] = useSearchParams();
  const playParam = searchParams.get("play");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedServer, setSelectedServer] = useState<CloudXPlugin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [showPreview, setShowPreview] = useState(!playParam);
  const [playingMovieId, setPlayingMovieId] = useState<number>(Number(playParam) || 0);

  // CloudX servers for sidebar
  const { data: plugins, isLoading: pluginsLoading } = useQuery({
    queryKey: ["plugins", "all"],
    queryFn: () => pluginService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  // TMDB movie data
  const { data: trendingMovies } = useQuery({
    queryKey: ["trending", "movies"],
    queryFn: () => movieService.getTrending(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: searchResults } = useQuery({
    queryKey: ["search", "movies", searchQuery],
    queryFn: () => movieService.search(searchQuery),
    enabled: searchQuery.trim().length > 0,
    staleTime: 60 * 1000,
  });

  const allPlugins = plugins || [];
  const movies = searchQuery.trim()
    ? (searchResults?.results || [])
    : (trendingMovies?.results || []);

  if (pluginsLoading) return <PageLoader />;

  const getEmbedUrl = (movieId: number) =>
    `https://vidsrc.to/embed/movie/${movieId}`;

  return (
    <>
      <Helmet>
        <title>Watch — PortalHub</title>
        <meta name="description" content="Watch movies and TV shows via multiple streaming providers" />
      </Helmet>

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
          <main className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? "lg:ml-72" : "lg:ml-0"}`}>
            {/* Top bar */}
            <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 md:px-6 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Toggle server list">
                  <PanelLeft className="w-5 h-5" />
                </button>
                {selectedServer && (
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-md overflow-hidden bg-background border border-border/30 flex-shrink-0">
                      {selectedServer.iconUrl && <img src={selectedServer.iconUrl} alt={selectedServer.name} className="w-full h-full object-contain" />}
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
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    {searchQuery ? `Search: "${searchQuery}"` : "Trending Movies"}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-8">
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
                </motion.div>
              )}

              {/* Player */}
              {playingMovieId > 0 && !showPreview && (
                <motion.div key={iframeKey} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <button onClick={() => setShowPreview(true)} className="px-3 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" /> Back to Movies
                    </button>
                    {selectedServer && (
                      <span className="text-xs text-muted-foreground">via {selectedServer.name}</span>
                    )}
                  </div>
                  <div className="relative w-full bg-black rounded-xl overflow-hidden border border-border/30 shadow-2xl">
                    <div className="w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        key={iframeKey}
                        src={getEmbedUrl(playingMovieId)}
                        className="absolute inset-0 w-full h-full"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                        style={{ border: "none" }}
                        title="Video Player"
                      />
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