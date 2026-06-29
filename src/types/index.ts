export interface CloudXPlugin {
  iconUrl: string;
  apiVersion: number;
  repositoryUrl: string;
  fileSize: number;
  status: number;
  language: string;
  authors: string[];
  tvTypes: string[];
  version: number;
  internalName: string;
  description: string;
  url: string;
  name: string;
}

export interface CloudXRepo {
  name: string;
  description: string;
  iconUrl: string;
  manifestVersion: number;
  pluginLists: string[];
}

export type PluginCategory = "AsianDrama" | "TvSeries" | "Movie" | "Anime" | "AnimeMovie" | "OVA";

// Legacy types kept for backward compatibility if needed
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  production_companies?: ProductionCompany[];
  media_type?: "movie" | "tv";
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  episode_run_time?: number[];
  seasons?: Season[];
  media_type?: "movie" | "tv";
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  runtime: number | null;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
  episodes?: Episode[];
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MediaItem = (Movie | TVShow) & {
  media_type: "movie" | "tv";
  title?: string;
  name?: string;
};

export type MediaType = "movie" | "tv";