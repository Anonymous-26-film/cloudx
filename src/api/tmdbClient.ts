import axios, { type AxiosRequestConfig } from "axios";
import { TMDB_BASE_URL, CLOUDX_REPO_URL } from "./endpoints";
import type { CloudXRepo, CloudXPlugin } from "../types";

// ========================================
// TMDB API Client
// ========================================
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "";
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN || "";

const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 15000,
  params: {
    language: "en-US",
  },
});

tmdbAxios.interceptors.request.use((config) => {
  if (TMDB_ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${TMDB_ACCESS_TOKEN}`;
  } else if (TMDB_API_KEY) {
    config.params = { ...config.params, api_key: TMDB_API_KEY };
  }
  return config;
});

tmdbAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.status_message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  }
);

export const tmdbClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    tmdbAxios.get(url, config) as unknown as Promise<T>,
};

// ========================================
// CloudX Plugin Client (for server sidebar)
// ========================================
const cloudxAxios = axios.create({ timeout: 15000 });
cloudxAxios.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(new Error(error.message || "An error occurred"))
);

export const pluginClient = {
  getPlugins: async (): Promise<CloudXPlugin[]> => {
    const repo = (await cloudxAxios.get<CloudXRepo>(CLOUDX_REPO_URL)) as unknown as CloudXRepo;
    if (!repo.pluginLists || repo.pluginLists.length === 0) {
      throw new Error("No plugin list found in repository manifest");
    }
    const pluginsUrl = repo.pluginLists[0];
    return (await cloudxAxios.get<CloudXPlugin[]>(pluginsUrl)) as unknown as CloudXPlugin[];
  },
  getRepo: async (): Promise<CloudXRepo> => {
    return (await cloudxAxios.get<CloudXRepo>(CLOUDX_REPO_URL)) as unknown as CloudXRepo;
  },
};