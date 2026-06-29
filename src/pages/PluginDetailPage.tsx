import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ExternalLink, Users, ChevronLeft,
  Download, Globe, Tv, FileCode
} from "lucide-react";
import { pluginService } from "../services/pluginService";
import { PluginRow } from "../components/PluginRow";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function PluginDetailPage() {
  const { internalName } = useParams<{ internalName: string }>();

  const { data: plugins } = useQuery({
    queryKey: ["plugins", "all"],
    queryFn: () => pluginService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const [pluginIconError, setPluginIconError] = useState(false);

  const plugin = plugins?.find((p) => p.internalName === internalName);

  if (!plugins) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">&#x1F50D;</div>
        <h1 className="text-2xl font-bold text-foreground">Source Not Found</h1>
        <p className="text-muted-foreground">The streaming source "{internalName}" was not found.</p>
        <Link to="/" className="text-primary hover:text-primary/80 font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  const fileSizeMB = (plugin.fileSize / 1024).toFixed(1);
  const relatedPlugins = plugins.filter(
    (p) =>
      p.internalName !== plugin.internalName &&
      p.tvTypes.some((t) => plugin.tvTypes.includes(t))
  );

  return (
    <>
      <Helmet>
        <title>{plugin.name} — PortalHub</title>
        <meta name="description" content={plugin.description} />
      </Helmet>

      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Back link */}
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
            className="bg-secondary/30 border border-border/50 rounded-2xl p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-background border border-border/50 shadow-lg flex items-center justify-center">
                  {plugin.iconUrl && !pluginIconError ? (
                    <img
                      src={plugin.iconUrl}
                      alt={plugin.name}
                      className="w-full h-full object-contain p-3"
                      onError={() => setPluginIconError(true)}
                    />
                  ) : (
                    <Tv className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-semibold bg-primary/20 text-primary border border-primary/30 rounded px-2 py-0.5 uppercase tracking-wide">
                    {plugin.language === "id" ? "Indonesian" : plugin.language}
                  </span>
                  <span className="text-xs text-muted-foreground">v{plugin.version} (API v{plugin.apiVersion})</span>
                  {plugin.status === 1 && (
                    <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded px-2 py-0.5">
                      Active
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-3">
                  {plugin.name}
                </h1>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {plugin.description}
                </p>

                {/* Content types */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {plugin.tvTypes.map((t) => (
                    <span
                      key={t}
                      className="text-sm bg-secondary text-foreground/80 rounded-full px-3 py-1 border border-border/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">Authors</span>
                    </div>
                    <p className="text-foreground font-medium">{plugin.authors.join(", ")}</p>
                  </div>

                  <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Download className="w-4 h-4" />
                      <span className="text-xs">File Size</span>
                    </div>
                    <p className="text-foreground font-medium">{fileSizeMB} KB</p>
                  </div>

                  <div className="bg-background/50 rounded-lg p-3 border border-border/30">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <FileCode className="w-4 h-4" />
                      <span className="text-xs">Internal Name</span>
                    </div>
                    <p className="text-foreground font-medium font-mono text-xs">{plugin.internalName}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {plugin.repositoryUrl && (
                    <a
                      href={plugin.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <Globe className="w-4 h-4" />
                      Repository
                    </a>
                  )}
                  {plugin.url && (
                    <a
                      href={plugin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium px-4 py-2 rounded-lg transition-colors text-sm border border-border/50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Plugin File
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Related sources */}
          {relatedPlugins.length > 0 && (
            <div className="mt-10">
              <PluginRow
                title="Related Sources"
                items={relatedPlugins.slice(0, 12)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}