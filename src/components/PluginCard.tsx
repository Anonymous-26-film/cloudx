import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import type { CloudXPlugin } from "../types";

interface PluginCardProps {
  plugin: CloudXPlugin;
}

const PLUGIN_ICON_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='%23333'%3E%3Crect width='64' height='64' rx='8'/%3E%3Ctext x='32' y='36' text-anchor='middle' fill='%23999' font-size='28'%3E%F0%9F%93%BA%3C/text%3E%3C/svg%3E";

export function PluginCard({ plugin }: PluginCardProps) {
  const [imgError, setImgError] = useState(false);

  const iconSrc = !imgError && plugin.iconUrl ? plugin.iconUrl : PLUGIN_ICON_FALLBACK;

  return (
    <motion.div
      className="flex-shrink-0 w-40 sm:w-44 md:w-48 group cursor-pointer"
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link to={`/plugin/${plugin.internalName}`} className="block">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary border border-border/40 p-4">
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-background/50 flex-shrink-0 border border-border/30">
              <img
                src={iconSrc}
                alt={plugin.name}
                className="w-full h-full object-contain p-1"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            </div>
            <p className="text-sm font-semibold text-foreground text-center line-clamp-2 leading-tight">
              {plugin.name}
            </p>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {plugin.language === "id" ? "ID" : plugin.language}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center gap-3 p-4">
            <p className="text-xs text-white/80 text-center line-clamp-4">
              {plugin.description}
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {plugin.tvTypes.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] bg-primary/30 text-primary-foreground rounded px-1.5 py-0.5"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 px-1">
          <p className="text-sm font-medium text-foreground line-clamp-1 leading-tight">
            {plugin.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground line-clamp-1">
              {plugin.authors.join(", ")}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PluginCardGrid({ plugins }: { plugins: CloudXPlugin[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {plugins.map((plugin, i) => (
        <motion.div
          key={plugin.internalName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.03, 0.5) }}
        >
          <PluginCard plugin={plugin} />
        </motion.div>
      ))}
    </div>
  );
}