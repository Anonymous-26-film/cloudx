import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Tv,
  Play,
  Monitor,
  Globe,
  Music,
  Film,
  Gamepad2,
  Newspaper,
  Heart,
  Zap,
  Filter,
  Loader2Icon,
} from "lucide-react";
import { iptvService } from "../services/iptvService";
import { PageLoader } from "../components/LoadingSpinner";
import type { IPTVChannel } from "../types";

const GROUP_ICONS: Record<string, React.ReactNode> = {
  News: <Newspaper className="w-4 h-4" />,
  Sports: <Tv className="w-4 h-4" />,
  Entertainment: <Play className="w-4 h-4" />,
  Music: <Music className="w-4 h-4" />,
  Movies: <Film className="w-4 h-4" />,
  Gaming: <Gamepad2 className="w-4 h-4" />,
  Kids: <Heart className="w-4 h-4" />,
  General: <Monitor className="w-4 h-4" />,
  Documentary: <Globe className="w-4 h-4" />,
};

function getGroupIcon(group: string): React.ReactNode {
  for (const [key, icon] of Object.entries(GROUP_ICONS)) {
    if (group.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return <Zap className="w-4 h-4" />;
}

export function TvChannelPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const {
    data: channels = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["iptv", "channels"],
    queryFn: () => iptvService.getAll(),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  const categories = useMemo(
    () => iptvService.getCategories(channels),
    [channels]
  );

  const filtered = useMemo(() => {
    let result = channels;
    if (selectedGroup) {
      result = iptvService.filterByGroup(result, selectedGroup);
    }
    if (searchQuery.trim()) {
      result = iptvService.search(result, searchQuery.trim());
    }
    return result;
  }, [channels, selectedGroup, searchQuery]);

  const handlePlay = (channel: IPTVChannel) => {
    setSelectedChannel(channel);
    setIsPlaying(true);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setSelectedChannel(null);
  };

  if (isLoading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>TV Channel — PortalHub</title>
        <meta
          name="description"
          content="Watch live TV channels from around the world"
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
                <Tv className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                TV Channels
              </h1>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                {channels.length.toLocaleString()} channels
              </span>
            </div>
            <p className="text-muted-foreground">
              Live TV channels powered by IPTV-org — browse by category or
              search your favorite channel.
            </p>
          </motion.div>

          {/* Search & Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <div className="flex items-center bg-secondary/50 border border-border rounded-lg overflow-hidden flex-1 max-w-md">
              <Search className="w-4 h-4 ml-3 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search channels..."
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
            {selectedGroup && (
              <button
                onClick={() => setSelectedGroup(null)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" /> {selectedGroup}
                <X className="w-3 h-3" />
              </button>
            )}
          </motion.div>

          {/* Player area */}
          <AnimatePresence>
            {isPlaying && selectedChannel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-black rounded-xl border border-border/30 shadow-2xl overflow-hidden relative">
                  <div className="flex items-center justify-between px-4 py-3 bg-secondary/20 border-b border-border/20">
                    <div className="flex items-center gap-2">
                      {selectedChannel.logo ? (
                        <img
                          src={selectedChannel.logo}
                          alt={selectedChannel.name}
                          className="w-6 h-6 object-contain rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                          <Tv className="w-3 h-3 text-primary" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                        {selectedChannel.name}
                      </span>
                    </div>
                    <button
                      onClick={handleClosePlayer}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    className="w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <VideoPlayer
                      key={selectedChannel.url}
                      src={selectedChannel.url}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error state */}
          {isError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">&#x26A0;</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Failed to load channels
              </h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {error instanceof Error
                  ? error.message
                  : "Could not fetch IPTV channel list. Please try again later."}
              </p>
            </motion.div>
          )}

          {/* Categories */}
          {!isError && (
            <>
              {/* Category pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {categories.slice(0, 30).map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedGroup(
                        selectedGroup === cat ? null : cat
                      )
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedGroup === cat
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-secondary/30 text-muted-foreground border-border/30 hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    {getGroupIcon(cat)}
                    {cat}
                    <span className="text-[10px] opacity-70 ml-0.5">
                      (
                      {
                        iptvService.filterByGroup(channels, cat)
                          .length
                      }
                      )
                    </span>
                  </button>
                ))}
              </motion.div>

              {/* Channel grid */}
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">&#x1F4FA;</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No channels found
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Try a different search query or category filter
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3"
                >
                  {filtered.map((channel, i) => (
                    <motion.button
                      key={channel.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.01, 0.3) }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePlay(channel)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all group text-left w-full ${
                        selectedChannel?.id === channel.id && isPlaying
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-secondary/10 hover:bg-secondary/20 border border-transparent hover:border-border/50"
                      }`}
                    >
                      {/* Channel logo */}
                      <div className="w-full aspect-[16/9] rounded-lg bg-background/50 border border-border/20 flex items-center justify-center overflow-hidden relative">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                            onError={(e) => {
                              (
                                e.target as HTMLImageElement
                              ).style.display = "none";
                              (
                                (e.target as HTMLImageElement)
                                  .nextElementSibling as HTMLElement
                              )?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            channel.logo ? "hidden" : ""
                          }`}
                        >
                          <span className="text-2xl font-bold text-muted-foreground/40">
                            {channel.name.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors rounded-lg flex items-center justify-center">
                          <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" />
                        </div>
                      </div>

                      {/* Channel info */}
                      <div className="w-full">
                        <p className="text-xs font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {channel.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {channel.group}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {filtered.length > 0 && (
                <p className="text-center text-muted-foreground text-xs mt-8">
                  Showing {filtered.length.toLocaleString()} of{" "}
                  {channels.length.toLocaleString()} channels
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Video player that handles both regular video URLs and HLS (.m3u8) streams.
 */
function VideoPlayer({ src }: { src: string }) {
  const isHLS = src.endsWith(".m3u8");

  return (
    <div className="absolute inset-0 w-full h-full">
      {isHLS ? (
        <HLSPlayer src={src} />
      ) : (
        <video
          src={src}
          controls
          autoPlay
          className="w-full h-full"
          style={{ background: "#000" }}
          playsInline
        >
          <p>
            Your browser doesn't support this stream.{" "}
            <a href={src} target="_blank" rel="noopener noreferrer">
              Open stream directly
            </a>
          </p>
        </video>
      )}
    </div>
  );
}

function HLSPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsError, setHlsError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: import("hls.js").default | null = null;
    let destroyed = false;

    const setupHLS = async () => {
      try {
        const Hls = (await import("hls.js")).default;
        if (destroyed) return;

        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              setHlsError(
                `Stream error: ${
                  data.type
                } — the stream may be offline.`
              );
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Native HLS support (Safari)
          video.src = src;
          video.addEventListener("loadedmetadata", () => {
            video.play().catch(() => {});
          });
        }
      } catch {
        // hls.js import fallback
      }
    };

    setupHLS();

    return () => {
      destroyed = true;
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  if (hlsError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white gap-3">
        <Loader2Icon className="w-8 h-8 text-muted-foreground animate-spin" />
        <p className="text-sm text-muted-foreground">{hlsError}</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Open in external player
        </a>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="w-full h-full"
      style={{ background: "#000" }}
      playsInline
    />
  );
}