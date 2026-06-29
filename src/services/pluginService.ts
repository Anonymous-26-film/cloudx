import { pluginClient } from "../api/tmdbClient";
import type { CloudXPlugin, PluginCategory } from "../types";

export const pluginService = {
  getAll: (): Promise<CloudXPlugin[]> => pluginClient.getPlugins(),
  getByCategory: async (category: PluginCategory): Promise<CloudXPlugin[]> => {
    const all = await pluginClient.getPlugins();
    return all.filter((p) => p.tvTypes.includes(category));
  },
  getByInternalName: async (internalName: string): Promise<CloudXPlugin | undefined> => {
    const all = await pluginClient.getPlugins();
    return all.find((p) => p.internalName === internalName);
  },
  search: async (query: string): Promise<CloudXPlugin[]> => {
    const all = await pluginClient.getPlugins();
    const q = query.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.internalName.toLowerCase().includes(q) ||
        p.authors.some((a) => a.toLowerCase().includes(q))
    );
  },
  getCategories: async (): Promise<PluginCategory[]> => {
    const all = await pluginClient.getPlugins();
    const categories = new Set<string>();
    all.forEach((p) => p.tvTypes.forEach((t) => categories.add(t)));
    return Array.from(categories) as PluginCategory[];
  },
  getRepo: () => pluginClient.getRepo(),
};