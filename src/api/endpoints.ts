// ========================================
// TMDB API Configuration
// ========================================
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const TMDB_BACKDROP_SIZE = "original";
export const TMDB_POSTER_SIZE = "w500";
export const TMDB_THUMB_SIZE = "w300";

export const IMAGE_URL = (path: string | null, size: string = TMDB_POSTER_SIZE): string | null =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

export const BACKDROP_URL = (path: string | null): string | null =>
  path ? `${TMDB_IMAGE_BASE}/${TMDB_BACKDROP_SIZE}${path}` : null;

export const ENDPOINTS = {
  // Movies
  TRENDING_MOVIES: "/trending/movie/week",
  POPULAR_MOVIES: "/movie/popular",
  TOP_RATED_MOVIES: "/movie/top_rated",
  UPCOMING_MOVIES: "/movie/upcoming",
  NOW_PLAYING: "/movie/now_playing",
  MOVIE_DETAIL: (id: number) => `/movie/${id}`,
  MOVIE_VIDEOS: (id: number) => `/movie/${id}/videos`,
  MOVIE_CREDITS: (id: number) => `/movie/${id}/credits`,
  MOVIE_RECOMMENDATIONS: (id: number) => `/movie/${id}/recommendations`,
  MOVIE_SIMILAR: (id: number) => `/movie/${id}/similar`,

  // TV Shows
  TRENDING_TV: "/trending/tv/week",
  POPULAR_TV: "/tv/popular",
  TOP_RATED_TV: "/tv/top_rated",
  ON_AIR_TV: "/tv/on_the_air",
  TV_DETAIL: (id: number) => `/tv/${id}`,
  TV_VIDEOS: (id: number) => `/tv/${id}/videos`,
  TV_CREDITS: (id: number) => `/tv/${id}/credits`,
  TV_RECOMMENDATIONS: (id: number) => `/tv/${id}/recommendations`,
  TV_SEASON: (id: number, season: number) => `/tv/${id}/season/${season}`,

  // Search
  SEARCH_MULTI: "/search/multi",
  SEARCH_MOVIE: "/search/movie",
  SEARCH_TV: "/search/tv",

  // Genres
  MOVIE_GENRES: "/genre/movie/list",
  TV_GENRES: "/genre/tv/list",

  // Keywords
  MOVIE_KEYWORDS: (id: number) => `/movie/${id}/keywords`,
  TV_KEYWORDS: (id: number) => `/tv/${id}/keywords`,
  KEYWORD_DETAIL: (id: number) => `/keyword/${id}`,

  // Certifications
  MOVIE_RELEASE_DATES: (id: number) => `/movie/${id}/release_dates`,
  TV_CONTENT_RATINGS: (id: number) => `/tv/${id}/content_ratings`,

  // Trending All
  TRENDING_ALL: "/trending/all/week",

  // Discover (genre/keyword filtered)
  DISCOVER_MOVIE: "/discover/movie",
};

// ========================================
// CloudX Repository (server list source)
// ========================================
export const CLOUDX_REPO_URL =
  "https://raw.githubusercontent.com/Asm0d3usX/CloudX/builds/repo.json";