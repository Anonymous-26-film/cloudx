import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ExternalLink, ChevronLeft, Film } from "lucide-react";
import { pluginService } from "../services/pluginService";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function WatchPage() {
  const { mediaType } = useParams<{ mediaType: "movie" | "tv" }>();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const { data: plugins } = useQuery({
    queryKey: ["plugins", "all"],
    queryFn: () => pluginService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  if (!plugins) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show a list of available streaming sources
  const movieSources = plugins.filter((p) => p.tvTypes.includes(mediaType === "movie" ? "Movie" : "TvSeries"));

  return (
    <>
      <Helmet>
        <title>Watch — PortalHub</title>
      </Helmet>

      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to catalog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Available {mediaType === "movie" ? "Movie" : "TV"} Sources
            </h1>
            <p className="text-muted-foreground">
              PortalHub provides a catalog of Indonesian streaming sources. Choose a source below.
            </p>
          </motion.div>

          {movieSources.length === 0 ? (
            <div className="text-center py-12 bg-secondary/30 rounded-xl border border-border/50">
              <div className="text-6xl mb-4">&#x1F3AC;</div>
              <p className="text-muted-foreground">No sources available for this content type.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {movieSources.map((plugin) => (
                <a
                  key={plugin.internalName}
                  href={plugin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-primary/30 rounded-xl p-4 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-background border border-border/30 flex-shrink-0 flex items-center justify-center">
                    {plugin.iconUrl && !imgErrors.has(plugin.internalName) ? (
                      <img src={plugin.iconUrl} alt={plugin.name} className="w-full h-full object-contain p-1.5" onError={() => setImgErrors(prev => new Set(prev).add(plugin.internalName))} />
                    ) : (
                      <Film className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-semibold group-hover:text-primary transition-colors">
                      {plugin.name}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{plugin.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}