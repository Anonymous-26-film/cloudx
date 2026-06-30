import { tmdbClient } from "../api/tmdbClient";
import { ENDPOINTS } from "../api/endpoints";
import type { Movie, TVShow, TMDBResponse, MediaItem, Season } from "../types";

// ── Response shapes ──
interface MovieDetailResponse extends Movie {
  genres: { id: number; name: string }[];
}
interface TVDetailResponse extends TVShow {
  genres: { id: number; name: string }[];
  seasons: Season[];
}
interface VideosResponse {
  results: {
    id: string; key: string; name: string;
    site: string; type: string; official: boolean;
  }[];
}
interface CreditsResponse {
  cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
  crew: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
}
interface KeywordsResponse {
  keywords?: { id: number; name: string }[];
  results?: { id: number; name: string }[];
}
interface GenresResponse {
  genres: { id: number; name: string }[];
}
interface SeasonResponse extends Season {
  episodes: {
    id: number; name: string; overview: string; still_path: string | null;
    episode_number: number; season_number: number; air_date: string;
    vote_average: number; runtime: number | null;
  }[];
}

// ── Movie ──
export const movieService = {
  getTrending: (page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.TRENDING_MOVIES, { params: { page } }),
  getPopular: (page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.POPULAR_MOVIES, { params: { page } }),
  getTopRated: (page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.TOP_RATED_MOVIES, { params: { page } }),
  getUpcoming: (page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.UPCOMING_MOVIES, { params: { page } }),
  getNowPlaying: (page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.NOW_PLAYING, { params: { page } }),
  getDetail: (id: number) =>
    tmdbClient.get<MovieDetailResponse>(ENDPOINTS.MOVIE_DETAIL(id)),
  getVideos: (id: number) =>
    tmdbClient.get<VideosResponse>(ENDPOINTS.MOVIE_VIDEOS(id)),
  getCredits: (id: number) =>
    tmdbClient.get<CreditsResponse>(ENDPOINTS.MOVIE_CREDITS(id)),
  getRecommendations: (id: number, page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.MOVIE_RECOMMENDATIONS(id), { params: { page } }),
  getSimilar: (id: number, page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.MOVIE_SIMILAR(id), { params: { page } }),
  search: (query: string, page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.SEARCH_MOVIE, { params: { query, page } }),
  getGenres: () =>
    tmdbClient.get<GenresResponse>(ENDPOINTS.MOVIE_GENRES),
  getKeywords: (id: number) =>
    tmdbClient.get<KeywordsResponse>(ENDPOINTS.MOVIE_KEYWORDS(id)),
  getReleaseDates: (id: number) =>
    tmdbClient.get<any>(ENDPOINTS.MOVIE_RELEASE_DATES(id)),
  discoverAnime: (page = 1) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.DISCOVER_MOVIE, {
      params: { page, with_keywords: "210024", sort_by: "popularity.desc", with_original_language: "ja" },
    }),
  discover: (params: {
    page?: number;
    with_genres?: string;
    primary_release_year?: number;
    with_keywords?: string;
    with_original_language?: string;
  }) =>
    tmdbClient.get<TMDBResponse<Movie>>(ENDPOINTS.DISCOVER_MOVIE, {
      params: {
        page: params.page || 1,
        sort_by: "popularity.desc",
        with_genres: params.with_genres,
        primary_release_year: params.primary_release_year,
        with_keywords: params.with_keywords,
        with_original_language: params.with_original_language,
        "vote_count.gte": 50,
      },
    }),
};

// ── TV ──
export const tvService = {
  getTrending: (page = 1) =>
    tmdbClient.get<TMDBResponse<TVShow>>(ENDPOINTS.TRENDING_TV, { params: { page } }),
  getPopular: (page = 1) =>
    tmdbClient.get<TMDBResponse<TVShow>>(ENDPOINTS.POPULAR_TV, { params: { page } }),
  getTopRated: (page = 1) =>
    tmdbClient.get<TMDBResponse<TVShow>>(ENDPOINTS.TOP_RATED_TV, { params: { page } }),
  getOnAir: (page = 1) =>
    tmdbClient.get<TMDBResponse<TVShow>>(ENDPOINTS.ON_AIR_TV, { params: { page } }),
  getDetail: (id: number) =>
    tmdbClient.get<TVDetailResponse>(ENDPOINTS.TV_DETAIL(id)),
  getVideos: (id: number) =>
    tmdbClient.get<VideosResponse>(ENDPOINTS.TV_VIDEOS(id)),
  getCredits: (id: number) =>
    tmdbClient.get<CreditsResponse>(ENDPOINTS.TV_CREDITS(id)),
  getRecommendations: (id: number, page = 1) =>
    tmdbClient.get<TMDBResponse<TVShow>>(ENDPOINTS.TV_RECOMMENDATIONS(id), { params: { page } }),
  getSeason: (id: number, season: number) =>
    tmdbClient.get<SeasonResponse>(ENDPOINTS.TV_SEASON(id, season)),
  search: (query: string, page = 1) =>
    tmdbClient.get<TMDBResponse<TVShow>>(ENDPOINTS.SEARCH_TV, { params: { query, page } }),
  getGenres: () =>
    tmdbClient.get<GenresResponse>(ENDPOINTS.TV_GENRES),
  getKeywords: (id: number) =>
    tmdbClient.get<KeywordsResponse>(ENDPOINTS.TV_KEYWORDS(id)),
  getContentRatings: (id: number) =>
    tmdbClient.get<any>(ENDPOINTS.TV_CONTENT_RATINGS(id)),
};

// ── Search / Trending All ──
export const searchService = {
  searchMulti: (query: string, page = 1) =>
    tmdbClient.get<TMDBResponse<MediaItem>>(ENDPOINTS.SEARCH_MULTI, { params: { query, page } }),
  getTrendingAll: (page = 1) =>
    tmdbClient.get<TMDBResponse<MediaItem>>(ENDPOINTS.TRENDING_ALL, { params: { page } }),
};