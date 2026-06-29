import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";
import { motion } from "framer-motion";
import {
  Server, Activity, XCircle,
  Search, SlidersHorizontal, RefreshCw,
  Film, Tv, Monitor, Globe, Layers,
  HardDrive
} from "lucide-react";
import { pluginService } from "../services/pluginService";
import { ServerCard } from "../components/ServerCard";

const TYPE_LABELS: Record<string, string> = {
  Movie: "Movie",
  TvSeries: "TV Series",
  Anime: "Anime",
  AnimeMovie: "Anime Movie",
  OVA: "OVA",
  AsianDrama: "Asian Drama",
};
const TYPE_ICONS: Record<string, React.ReactNode> = {
  Movie: <Film className="w-4 h-4" />,
  TvSeries: <Tv className="w-4 h-4" />,
  Anime: <Monitor className="w-4 h-4" />,
  AnimeMovie: <Monitor className="w-4 h-4" />,
  OVA: <Monitor className="w-4 h-4" />,
  AsianDrama: <Globe className="w-4 h-4" />,
};
const TYPE_COLORS: Record<string, string> = {
  Movie: "border-blue-500/30 bg-blue-500/5 text-blue-400",
  TvSeries: "border-purple-500/30 bg-purple-500/5 text-purple-400",
  Anime: "border-pink-500/30 bg-pink-500/5 text-pink-400",
  AnimeMovie: "border-rose-500/30 bg-rose-500/5 text-rose-400",
  OVA: "border-orange-500/30 bg-orange-500/5 text-orange-400",
  AsianDrama: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
};

export function ServerManagementPage() {
  const { data: plugins, isLoading, refetch } = useQuery({
    queryKey: ["plugins", "all"],
    queryFn: () => pluginService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "size" | "version">("name");

  const allPlugins = plugins || [];

  // Dashboard stats
  const stats = useMemo(() => {
    const active = allPlugins.filter((p) => p.status === 1).length;
    const inactive = allPlugins.length - active;
    const totalSize = allPlugins.reduce((acc, p) => acc + p.fileSize, 0);
    const typeCounts: Record<string, number> = {};
    allPlugins.forEach((p) => {
      p.tvTypes.forEach((t) => {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
    });
    return { active, inactive, totalSize, typeCounts };
  }, [allPlugins]);

  // Filter + sort
  const filteredPlugins = useMemo(() => {
    let result = [...allPlugins];

    if (selectedType !== "all") {
      result = result.filter((p) => p.tvTypes.includes(selectedType));
    }
    if (statusFilter === "active") {
      result = result.filter((p) => p.status === 1);
    } else if (statusFilter === "inactive") {
      result = result.filter((p) => p.status !== 1);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.internalName.toLowerCase().includes(q) ||
          p.authors.some((a) => a.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.fileSize - a.fileSize;
      if (sortBy === "version") return b.version - a.version;
      return 0;
    });

    return result;
  }, [allPlugins, selectedType, statusFilter, searchQuery, sortBy]);

  const totalSizeMB = (stats.totalSize / 1024).toFixed(1);
  const distinctTypes = Object.keys(stats.typeCounts);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Server Management — PortalHub</title>
        <meta name="description" content="Manage and monitor CloudX streaming servers" />
      </Helmet>
      <OgMeta
        title="Server Management — PortalHub"
        description="Manage and monitor CloudX streaming servers"
      />

      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mb-1">
                Server Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Monitor and manage {allPlugins.length} streaming providers
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm text-foreground transition-colors border border-border/50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </motion.div>

          {/* Dashboard cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {/* Total */}
            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{allPlugins.length}</p>
                <p className="text-xs text-muted-foreground">Total Servers</p>
              </div>
            </div>

            {/* Active */}
            <div className="bg-secondary/30 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active Servers</p>
              </div>
            </div>

            {/* Total size */}
            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{totalSizeMB}</p>
                <p className="text-xs text-muted-foreground">Total Size (KB)</p>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-400">{distinctTypes.length}</p>
                <p className="text-xs text-muted-foreground">Content Types</p>
              </div>
            </div>
          </motion.div>

          {/* Type breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {["all", ...distinctTypes].map((type) => {
              const count =
                type === "all"
                  ? allPlugins.length
                  : allPlugins.filter((p) => p.tvTypes.includes(type)).length;
              const isActive = selectedType === type;
              const colors = TYPE_COLORS[type] || "";
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    isActive
                      ? `bg-primary/20 border-primary/40 text-primary`
                      : `bg-secondary/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-foreground/20 ${colors}`
                  }`}
                >
                  {TYPE_ICONS[type] || <Server className="w-3 h-3" />}
                  {type === "all" ? "All" : TYPE_LABELS[type] || type}
                  <span className={`text-[10px] ${isActive ? "text-primary/70" : "text-muted-foreground"}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            {/* Search */}
            <div className="flex items-center bg-secondary/50 border border-border rounded-lg overflow-hidden flex-1 max-w-md">
              <Search className="w-4 h-4 ml-3 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search servers by name, author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none flex-1"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-secondary/30 rounded-lg border border-border/50 p-1">
              {[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === opt.value
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 bg-secondary/30 rounded-lg border border-border/50 p-1">
              <SlidersHorizontal className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
              {[
                { value: "name", label: "Name" },
                { value: "size", label: "Size" },
                { value: "version", label: "Version" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as "name" | "size" | "version")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    sortBy === opt.value
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Server list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="space-y-2"
          >
            {filteredPlugins.length === 0 ? (
              <div className="text-center py-16 bg-secondary/20 rounded-xl border border-border/30">
                <Server className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No servers match your filter</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <>
                <div className="text-xs text-muted-foreground mb-2">
                  Showing {filteredPlugins.length} of {allPlugins.length} servers
                </div>
                {filteredPlugins.map((plugin, i) => (
                  <ServerCard key={plugin.internalName} plugin={plugin} index={i} />
                ))}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}