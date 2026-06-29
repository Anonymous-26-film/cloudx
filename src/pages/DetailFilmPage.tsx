import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  Star,
  Clock,
  Calendar,
  Play,
  ArrowLeft,
  Tag,
  Users,
  Film,
} from "lucide-react";
import { IMAGE_URL, BACKDROP_URL } from "../api/endpoints";
import { movieService, tvService } from "../services/tmdbService";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  getTitle,
  getReleaseYear,
  getReleaseDate,
  formatRating,
  formatRuntime,
  formatDate,
  formatNumber,
  formatCurrency,
  truncateText,
} from "../utils/helpers";
import type { Cast, Crew, Genre } from "../types";

function useFilmDetail(id: number, mediaType: "movie" | "tv") {
  const detailQuery = useQuery({
    queryKey: ["film-detail", mediaType, id],
    queryFn: () =>
      mediaType === "movie"
        ? movieService.getDetail(id)
        : tvService.getDetail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const creditsQuery = useQuery({
    queryKey: ["film-credits", mediaType, id],
    queryFn: () =>
      mediaType === "movie"
        ? movieService.getCredits(id)
        : tvService.getCredits(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const videosQuery = useQuery({
    queryKey: ["film-videos", mediaType, id],
    queryFn: () =>
      mediaType === "movie"
        ? movieService.getVideos(id)
        : tvService.getVideos(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const keywordsQuery = useQuery({
    queryKey: ["film-keywords", mediaType, id],
    queryFn: () =>
      mediaType === "movie"
        ? movieService.getKeywords(id)
        : tvService.getKeywords(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const recsQuery = useQuery({
    queryKey: ["film-recs", mediaType, id],
    queryFn: () =>
      mediaType === "movie"
        ? movieService.getRecommendations(id)
        : tvService.getRecommendations(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  return { detailQuery, creditsQuery, videosQuery, keywordsQuery, recsQuery };
}

export function DetailFilmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = Number(searchParams.get("id"));
  const mediaType = (searchParams.get("type") || "movie") as "movie" | "tv";

  const { detailQuery, creditsQuery, videosQuery, keywordsQuery, recsQuery } =
    useFilmDetail(id, mediaType);

  const isLoading =
    detailQuery.isLoading || creditsQuery.isLoading || videosQuery.isLoading;
  const isError = detailQuery.isError;

  if (!id || isNaN(id)) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">&#x1F50D;</div>
        <h1 className="text-2xl font-bold text-foreground">Film Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          No film ID was provided. Please go back and select a film to view details.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !detailQuery.data) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">&#x26A0;&#xFE0F;</div>
        <h1 className="text-2xl font-bold text-foreground">Failed to Load</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Unable to fetch film details. The API may be unavailable or the content may have been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-primary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const film = detailQuery.data as Record<string, any>;
  const title = getTitle(film as any);
  const year = getReleaseYear(film as any);
  const releaseDate = getReleaseDate(film as any);
  const posterUrl = IMAGE_URL(film.poster_path, "w500");
  const backdropUrl = BACKDROP_URL(film.backdrop_path);
  const rating = formatRating(film.vote_average);
  const genres: Genre[] = film.genres || [];
  const runtime =
    mediaType === "movie"
      ? film.runtime
      : film.episode_run_time?.[0];

  const cast: Cast[] = (creditsQuery.data as any)?.cast?.slice(0, 12) || [];
  const crew: Crew[] = (creditsQuery.data as any)?.crew || [];
  const director = crew.find((c) => c.job === "Director");
  const writers = crew
    .filter((c) => c.department === "Writing")
    .slice(0, 3);
  const videos = ((videosQuery.data as any)?.results || []).filter(
    (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  ).slice(0, 3);
  const keywords = (keywordsQuery.data as any)?.keywords || (keywordsQuery.data as any)?.results || [];
  const recommendations = (recsQuery.data as any)?.results?.slice(0, 12) || [];

  return (
    <>
      <Helmet>
        <title>{title} — PortalHub Cinema</title>
        <meta name="description" content={truncateText(film.overview || "", 160)} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={truncateText(film.overview || "", 200)} />
        {posterUrl && <meta property="og:image" content={posterUrl} />}
      </Helmet>

      {/* Hero Backdrop Section */}
      <div className="relative w-full" style={{ minHeight: "50vw", maxHeight: "70vh" }}>
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : (
          <div className="w-full h-full bg-secondary absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 md:left-8 lg:left-12 z-10 flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white rounded-full px-4 py-2 backdrop-blur-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
        </button>

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-6xl mx-auto px-4 md:px-8 lg:px-12 pb-8 md:pb-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
              {/* Poster */}
              <div className="flex-shrink-0 w-36 sm:w-44 md:w-52 rounded-lg overflow-hidden shadow-2xl border-2 border-background hidden sm:block">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-secondary flex items-center justify-center">
                    <Film className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-white pb-4 md:pb-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-2">
                  {title}
                </h1>

                {film.tagline && (
                  <p className="text-sm sm:text-base text-white/60 italic mb-3">
                    {film.tagline}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-primary/30 border border-primary/40 rounded px-2 py-0.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{rating}</span>
                  </div>
                  {year && year !== "N/A" && (
                    <span className="text-sm text-white/70 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(releaseDate)}
                    </span>
                  )}
                  {runtime && (
                    <span className="text-sm text-white/70 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {formatRuntime(runtime)}
                    </span>
                  )}
                  {mediaType === "tv" && film.number_of_seasons && (
                    <span className="text-sm text-white/70">
                      {film.number_of_seasons} Season{film.number_of_seasons > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Genres */}
                {genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {genres.map((g) => (
                      <span
                        key={g.id}
                        className="text-xs font-medium bg-white/15 text-white rounded-full px-3 py-1 border border-white/10"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <Link
                    to={`/hub?play=${id}&type=${mediaType}`}
                    className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-2.5 rounded-md hover:bg-primary/80 transition-colors text-sm sm:text-base"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" /> Play
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-background pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              {film.overview && (
                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">Overview</h2>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {film.overview}
                  </p>
                </section>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                    <Users className="w-5 h-5 inline mr-2" />
                    Top Cast
                  </h2>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {cast.map((c) => (
                      <div key={c.id} className="flex-shrink-0 w-24 sm:w-28 text-center">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-secondary mx-auto mb-2">
                          {c.profile_path ? (
                            <img
                              src={IMAGE_URL(c.profile_path, "w185")!}
                              alt={c.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary">
                              <Users className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-foreground leading-tight line-clamp-1">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {c.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trailers */}
              {videos.length > 0 && (
                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                    Trailers & Videos
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((v: any) => (
                      <a
                        key={v.id}
                        href={`https://www.youtube.com/watch?v=${v.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <div className="aspect-video rounded-lg overflow-hidden bg-secondary relative">
                          <img
                            src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`}
                            alt={v.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="w-10 h-10 text-white fill-white opacity-80 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground mt-2 line-clamp-1">
                          {v.name}
                        </p>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <section>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                    Recommendations
                  </h2>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {recommendations.map((rec: any) => (
                      <Link
                        key={rec.id}
                        to={`/detailfilm?id=${rec.id}&type=${mediaType}`}
                        className="flex-shrink-0 w-32 sm:w-36 group cursor-pointer"
                      >
                        <div className="aspect-[2/3] rounded-md overflow-hidden bg-secondary">
                          {rec.poster_path ? (
                            <img
                              src={IMAGE_URL(rec.poster_path, "w185")!}
                              alt={rec.title || rec.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {formatRating(rec.vote_average)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight mt-0.5">
                          {rec.title || rec.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-6">
              {/* Director / Writers */}
              <section className="p-4 bg-card rounded-lg border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                  Crew
                </h3>
                {director && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">Director</p>
                    <p className="text-sm font-medium text-foreground">{director.name}</p>
                  </div>
                )}
                {writers.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Writers</p>
                    {writers.map((w) => (
                      <p key={w.id} className="text-sm font-medium text-foreground">
                        {w.name}
                      </p>
                    ))}
                  </div>
                )}
              </section>

              {/* Quick Facts */}
              <section className="p-4 bg-card rounded-lg border border-border space-y-3">
                <h3 className="text-sm font-semibold text-foreground mb-2 uppercase tracking-wider">
                  <Tag className="w-4 h-4 inline mr-1" /> Details
                </h3>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground">{film.status || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Release Date</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(releaseDate)}</p>
                </div>
                {mediaType === "movie" && (
                  <>
                    {film.budget > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(film.budget)}
                        </p>
                      </div>
                    )}
                    {film.revenue > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(film.revenue)}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {mediaType === "tv" && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Seasons</p>
                      <p className="text-sm font-medium text-foreground">
                        {film.number_of_seasons || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Episodes</p>
                      <p className="text-sm font-medium text-foreground">
                        {film.number_of_episodes || "N/A"}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Votes</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatNumber(film.vote_count)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Original Language</p>
                  <p className="text-sm font-medium text-foreground uppercase">
                    {film.original_language || "N/A"}
                  </p>
                </div>
              </section>

              {/* Keywords */}
              {keywords.length > 0 && (
                <section className="p-4 bg-card rounded-lg border border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                    Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {keywords.slice(0, 15).map((kw: any) => (
                      <span
                        key={kw.id}
                        className="text-xs bg-secondary text-foreground/70 rounded-full px-2.5 py-1"
                      >
                        {kw.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Production Companies */}
              {film.production_companies?.length > 0 && (
                <section className="p-4 bg-card rounded-lg border border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                    Production
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {film.production_companies.map((pc: any) => (
                      <div key={pc.id} className="flex items-center gap-2">
                        {pc.logo_path ? (
                          <img
                            src={IMAGE_URL(pc.logo_path, "w92")!}
                            alt={pc.name}
                            className="h-6 object-contain bg-white/10 rounded px-1"
                          />
                        ) : (
                          <span className="text-xs font-medium text-foreground">
                            {pc.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}