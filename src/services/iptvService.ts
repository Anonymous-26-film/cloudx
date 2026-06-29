import axios from "axios";
import type { IPTVChannel } from "../types";

const IPTV_INDEX_URL = "https://iptv-org.github.io/iptv/index.m3u";
const IPTV_CC_URL = "https://raw.githubusercontent.com/hnnyo/cct/refs/heads/main/aku.m3u";

const IPTV_SOURCES = [IPTV_INDEX_URL, IPTV_CC_URL];

/**
 * Parse raw M3U content into IPTVChannel array.
 */
function parseM3U(content: string): IPTVChannel[] {
  const lines = content.split(/\r?\n/);
  const channels: IPTVChannel[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("#EXTINF:")) {
      // Extract attributes from #EXTINF line
      const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupTitleMatch = line.match(/group-title="([^"]*)"/);

      // Channel name is after the last comma on the #EXTINF line
      const commaIndex = line.lastIndexOf(",");
      const displayName =
        commaIndex !== -1
          ? line.substring(commaIndex + 1).trim()
          : "Unknown Channel";

      const id = tvgIdMatch?.[1] || `${displayName}-${i}`;
      const name = tvgNameMatch?.[1] || displayName;
      const logo = tvgLogoMatch?.[1] || null;
      const group = groupTitleMatch?.[1] || "Other";

      // Next non-empty line should be the stream URL
      let url = "";
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine && !nextLine.startsWith("#")) {
          url = nextLine;
          i = j;
          break;
        }
      }

      if (url) {
        channels.push({ id, name, logo, group, url });
      }
    }
  }

  return channels;
}

/**
 * Fetch the IPTV index file; if it's a playlist-of-playlists,
 * follow it recursively up to `maxDepth` levels to collect channels.
 */
async function fetchChannels(
  url: string,
  maxDepth: number = 3
): Promise<IPTVChannel[]> {
  const response = await axios.get<string>(url, {
    timeout: 30000,
    responseType: "text",
  });
  const content = response.data;
  const channels = parseM3U(content);

  // If we got channels, return them
  if (channels.length > 0) return channels;

  // Otherwise, look for nested.m3u references in the parsed content
  const m3uLinks = content.match(/https?:\/\/[^\s"'<>]+\.m3u8?\b/gi) || [];
  if (m3uLinks.length > 0 && maxDepth > 0) {
    // Follow the first set of links (region playlists)
    const allChannels: IPTVChannel[] = [];
    const uniqueUrls = [...new Set(m3uLinks)].slice(0, 20); // limit sub-playlists
    const results = await Promise.allSettled(
      uniqueUrls.map(async (subUrl) => {
        const subResponse = await axios.get<string>(subUrl, {
          timeout: 30000,
          responseType: "text",
        });
        return parseM3U(subResponse.data);
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled") {
        allChannels.push(...r.value);
      }
    }
    return allChannels;
  }

  return [];
}

/**
 * Resolve IPTV source URLs from env var or fallback to defaults.
 */
function getSources(): string[] {
  const envSources = import.meta.env.VITE_IPTV_SOURCES as string | undefined;
  if (envSources) {
    return envSources.split(",").map((s: string) => s.trim()).filter(Boolean);
  }
  return IPTV_SOURCES;
}

export const iptvService = {
  /**
   * Get all IPTV channels from all configured playlists.
   * Merges results and deduplicates by stream URL.
   */
  getAll: async (): Promise<IPTVChannel[]> => {
    const sources = getSources();
    const results = await Promise.allSettled(
      sources.map((url) => fetchChannels(url))
    );
    const allChannels: IPTVChannel[] = [];
    const seen = new Set<string>();

    for (const r of results) {
      if (r.status === "fulfilled") {
        for (const ch of r.value) {
          if (!seen.has(ch.url)) {
            seen.add(ch.url);
            allChannels.push(ch);
          }
        }
      }
    }
    return allChannels;
  },

  /**
   * Get unique group titles from channels.
   */
  getCategories: (channels: IPTVChannel[]): string[] => {
    const groups = new Set(channels.map((c) => c.group));
    return Array.from(groups).sort();
  },

  /**
   * Filter channels by group.
   */
  filterByGroup: (channels: IPTVChannel[], group: string): IPTVChannel[] => {
    return channels.filter((c) => c.group === group);
  },

  /**
   * Search channels by name.
   */
  search: (channels: IPTVChannel[], query: string): IPTVChannel[] => {
    const q = query.toLowerCase();
    return channels.filter((c) => c.name.toLowerCase().includes(q));
  },
};