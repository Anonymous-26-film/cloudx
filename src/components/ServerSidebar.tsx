import { useState } from "react";
import { motion } from "framer-motion";
import { Server, ChevronRight, Activity, Monitor, Film, Tv, Globe, X } from "lucide-react";
import type { CloudXPlugin } from "../types";

interface ServerSidebarProps {
  plugins: CloudXPlugin[];
  selectedServer: CloudXPlugin | null;
  onSelectServer: (plugin: CloudXPlugin) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Movie: <Film className="w-3 h-3" />,
  TvSeries: <Tv className="w-3 h-3" />,
  Anime: <Monitor className="w-3 h-3" />,
  AnimeMovie: <Monitor className="w-3 h-3" />,
  OVA: <Monitor className="w-3 h-3" />,
  AsianDrama: <Globe className="w-3 h-3" />,
};

export function ServerSidebar({
  plugins,
  selectedServer,
  onSelectServer,
  isOpen,
  onToggle,
}: ServerSidebarProps) {
  const [searchServer, setSearchServer] = useState("");
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const filtered = searchServer.trim()
    ? plugins.filter(
        (p) =>
          p.name.toLowerCase().includes(searchServer.toLowerCase()) ||
          p.internalName.toLowerCase().includes(searchServer.toLowerCase())
      )
    : plugins;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
          w-72 bg-background border-r border-border/50
          transition-transform duration-300 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-72 lg:min-w-72"}`}
      >
        {/* Header */}
        <div className="p-3 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Servers</h2>
            <span className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">
              {plugins.length}
            </span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search within sidebar */}
        <div className="p-2 border-b border-border/30">
          <div className="flex items-center bg-secondary/50 rounded-md border border-border/40 px-2">
            <input
              type="text"
              placeholder="Filter servers..."
              value={searchServer}
              onChange={(e) => setSearchServer(e.target.value)}
              className="bg-transparent px-1.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none flex-1"
            />
            {searchServer && (
              <button
                onClick={() => setSearchServer("")}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Server list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <div className="p-1.5 space-y-0.5">
            {filtered.map((plugin, i) => {
              const isSelected = selectedServer?.internalName === plugin.internalName;
              return (
                <motion.button
                  key={plugin.internalName}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => onSelectServer(plugin)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all group ${
                    isSelected
                      ? "bg-primary/15 border border-primary/30 shadow-sm"
                      : "hover:bg-secondary/50 border border-transparent"
                  }`}
                >
                  {/* Status indicator */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        plugin.status === 1
                          ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                          : "bg-red-500/50"
                      }`}
                    />
                  </div>

                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-background border border-border/30 flex items-center justify-center flex-shrink-0">
                    {plugin.iconUrl && !imgErrors.has(plugin.internalName) ? (
                      <img
                        src={plugin.iconUrl}
                        alt={plugin.name}
                        className="w-full h-full object-contain p-1"
                        onError={() => setImgErrors(prev => new Set(prev).add(plugin.internalName))}
                      />
                    ) : (
                      <Film className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium line-clamp-1 ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}>
                      {plugin.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {plugin.tvTypes.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-0.5 text-[9px] text-muted-foreground"
                        >
                          {TYPE_ICONS[t]}
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                      isSelected ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer stats */}
        <div className="p-2 border-t border-border/30 bg-secondary/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-green-400" />
              {plugins.filter((p) => p.status === 1).length} active
            </span>
            <span>
              {filtered.length} shown
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-4 left-4 z-30 lg:hidden w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
          isOpen ? "hidden" : ""
        }`}
      >
        <Server className="w-5 h-5" />
      </button>
    </>
  );
}