import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Server, Download, Users,
  ExternalLink, Film, Tv, Monitor, ChevronRight,
  Globe
} from "lucide-react";
import type { CloudXPlugin } from "../types";

interface ServerCardProps {
  plugin: CloudXPlugin;
  index: number;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Movie: <Film className="w-3 h-3" />,
  TvSeries: <Tv className="w-3 h-3" />,
  Anime: <Monitor className="w-3 h-3" />,
  AnimeMovie: <Monitor className="w-3 h-3" />,
  OVA: <Monitor className="w-3 h-3" />,
  AsianDrama: <Globe className="w-3 h-3" />,
};

export function ServerCard({ plugin, index }: ServerCardProps) {
  const [imgError, setImgError] = useState(false);
  const fileSizeKB = (plugin.fileSize / 1024).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="group"
    >
      <Link
        to={`/plugin/${plugin.internalName}`}
        className="flex items-center gap-4 bg-secondary/30 hover:bg-secondary/50 border border-border/40 hover:border-primary/30 rounded-xl p-4 transition-all duration-200"
      >
        {/* Status indicator */}
        <div className="flex-shrink-0">
          {plugin.status === 1 ? (
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
          )}
        </div>

        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-background border border-border/40 flex items-center justify-center">
          {plugin.iconUrl && !imgError ? (
            <img
              src={plugin.iconUrl}
              alt={plugin.name}
              className="w-full h-full object-contain p-1.5"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <Server className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {plugin.name}
            </h3>
            <span className="text-[10px] text-muted-foreground bg-background/50 rounded px-1.5 py-0.5 font-mono">
              v{plugin.version}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
            {plugin.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {fileSizeKB} KB
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {plugin.authors.length} author{plugin.authors.length > 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1">
              {plugin.tvTypes.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-0.5 text-[10px] bg-primary/10 text-primary rounded px-1 py-0.5"
                >
                  {TYPE_ICONS[t] || null}
                  {t}
                </span>
              ))}
              {plugin.tvTypes.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{plugin.tvTypes.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {plugin.url && (
            <a
              href={plugin.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg hover:bg-background/60 text-muted-foreground hover:text-primary transition-colors"
              title="Download plugin file"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}