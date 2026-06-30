import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";
import {
  Star,
  Play,
  ArrowLeft,
  Users,
  Film,
  X,
  Copy,
  Check,
} from "lucide-react";
import { IMAGE_URL, BACKDROP_URL } from "../api/endpoints";
import { movieService, tvService } from "../services/tmdbService";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AdBanner, NativeBanner } from "../components/ads";
import {
  getTitle,
  getReleaseYear,
  getReleaseDate,
  formatRating,
  formatRuntime,
  formatDate,
  truncateText,
} from "../utils/helpers";
import type { Cast, Crew, Genre, Movie, TVShow, TMDBResponse } from "../types";

function useFilmDetail(id: number, mediaType: "movie" | "tv") {
  const detailQuery = useQuery({
    queryKey: ["film-detail", mediaType, id],
    queryFn: (): Promise<Movie | TVShow> =>
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
    queryFn: (): Promise<TMDBResponse<Movie | TVShow>> =>
      mediaType === "movie"
        ? movieService.getRecommendations(id)
        : tvService.getRecommendations(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  const certQuery = useQuery({
    queryKey: ["film-cert", mediaType, id],
    queryFn: () =>
      mediaType === "movie"
        ? movieService.getReleaseDates(id)
        : tvService.getContentRatings(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });

  return { detailQuery, creditsQuery, videosQuery, keywordsQuery, recsQuery, certQuery };
}

export function DetailFilmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const id = Number(searchParams.get("id"));
  const mediaType = (searchParams.get("type") || "movie") as "movie" | "tv";

  const { detailQuery, creditsQuery, videosQuery, keywordsQuery, recsQuery, certQuery } =
    useFilmDetail(id, mediaType);

  const isLoading =
    detailQuery.isLoading || creditsQuery.isLoading || videosQuery.isLoading;
  const isError = detailQuery.isError;

  if (!id || isNaN(id)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-[#0f0f0f]">
        <div className="text-6xl">&#x1F50D;</div>
        <h1 className="text-2xl font-bold text-white">Film Not Found</h1>
        <p className="text-[#b0b0b0] text-center max-w-md">
          No film ID was provided. Please go back and select a film to view details.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-[#d90429] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#b0031f] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !detailQuery.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-[#0f0f0f]">
        <div className="text-6xl">&#x26A0;&#xFE0F;</div>
        <h1 className="text-2xl font-bold text-white">Failed to Load</h1>
        <p className="text-[#b0b0b0] text-center max-w-md">
          Unable to fetch film details. The API may be unavailable or the content may have been removed.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-[#d90429] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#b0031f] transition-colors"
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
  const runtime =
    mediaType === "movie"
      ? film.runtime
      : film.episode_run_time?.[0];

  const cast: Cast[] = (creditsQuery.data as any)?.cast?.slice(0, 12) || [];
  const crew: Crew[] = (creditsQuery.data as any)?.crew || [];
  const director = crew.find((c) => c.job === "Director");
  const writers = crew.filter((c) => c.department === "Writing").slice(0, 3);
  const producer = crew.find((c) => c.job === "Producer" || c.job === "Executive Producer");
  const composer = crew.find((c) => c.job === "Original Music Composer" || c.department === "Sound");
  const cinematographer = crew.find((c) => c.job === "Director of Photography");
  const editor = crew.find((c) => c.job === "Editor");
  const screenwriter = crew.find((c) => c.job === "Screenplay" || c.job === "Writer");
  const videos = ((videosQuery.data as any)?.results || []).filter(
    (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  ).slice(0, 3);
  const keywords = (keywordsQuery.data as any)?.keywords || (keywordsQuery.data as any)?.results || [];
  const recommendations = (recsQuery.data as any)?.results?.slice(0, 12) || [];
  const genres: Genre[] = film.genres || [];
  const countries: string[] = (film.production_countries || []).map((c: any) => c.name);
  const certData = (certQuery.data as any)?.results;
  const usCert: string | null = mediaType === "movie"
    ? (Array.isArray(certData)
        ? certData
            .find((r: any) => r.iso_3166_1 === "US")
            ?.release_dates?.find((d: any) => d.certification)?.certification
        : null)
    : (Array.isArray(certData)
        ? certData.find((r: any) => r.iso_3166_1 === "US")?.rating
        : null);
  const ageRating = usCert || (film.adult ? "17+" : "NR");
  const scorePercent = Math.round(film.vote_average * 10);
  const scoreColor = scorePercent >= 70 ? "#21d07a" : scorePercent >= 50 ? "#d2d531" : "#db2360";
  const scoreBg = scorePercent >= 70 ? "#204529" : scorePercent >= 50 ? "#423d0f" : "#571435";

  const crewItems = [
    { name: director?.name, role: "Director" },
    { name: screenwriter?.name || writers[0]?.name, role: "Screenplay" },
    { name: producer?.name, role: "Producer" },
    { name: composer?.name, role: "Music" },
    { name: cinematographer?.name, role: "Cinematography" },
    { name: editor?.name, role: "Editor" },
  ].filter((c) => c.name);

  const genreText = genres.map((g) => g.name).join(" \u2022 ");
  const countryText = countries.slice(0, 2).join(", ");
  const metadataText = [
    releaseDate && formatDate(releaseDate),
    countryText,
    genreText,
    runtime && formatRuntime(runtime),
  ].filter(Boolean).join(" \u2022 ");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = encodeURIComponent(title);

  const shareWhatsApp = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(title + " — " + shareUrl)}`, "_blank");

  const shareTwitter = () =>
    window.open(`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`, "_blank");

  const shareFacebook = () =>
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Helmet>
        <title>{title} — PortalHub</title>
        <meta name="description" content={truncateText(film.overview || "", 160)} />
      </Helmet>
      <OgMeta
        title={`${title} — PortalHub`}
        description={truncateText(film.overview || "", 200)}
        image={posterUrl || undefined}
        type="article"
      />

      <div className="relative min-h-screen bg-[#0f0f0f] font-sans">
        {/* Full-width blurred backdrop */}
        <div className="absolute top-0 left-0 w-full h-[450px] sm:h-[550px] md:h-[620px] overflow-hidden">
          {backdropUrl ? (
            <img
              src={backdropUrl}
              alt=""
              className="w-full h-full object-cover blur-md scale-110 brightness-50"
            />
          ) : (
            <div className="w-full h-full bg-[#1a1a1a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/30 via-[#0f0f0f]/80 to-[#0f0f0f]" />
        </div>

        {/* Main content */}
        <div className="relative z-10 pt-16 sm:pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Poster + Info Flex Layout */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 lg:gap-12">
              {/* ── Poster ── */}
              <div className="flex-shrink-0 mx-auto md:mx-0 w-[200px] sm:w-[250px] md:w-[300px]">
                <div
                  className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.08] relative group cursor-pointer"
                  onClick={() => navigate(`/hub?play=${id}&type=${mediaType}`)}
                >
                  {posterUrl ? (
                    <>
                      <img
                        src={posterUrl}
                        alt={title}
                        className="w-full aspect-[2/3] object-cover block group-hover:blur-[3px] group-hover:scale-105 transition-all duration-300"
                      />
                      {/* Play overlay — appears on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <div className="w-[60px] h-[60px] rounded-full bg-[#d90429]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-red-500/20">
                          <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full aspect-[2/3] bg-[#1a1a1a] flex items-center justify-center">
                      <Film className="w-12 h-12 text-[#b0b0b0]" />
                    </div>
                  )}
                </div>
                {videos.length > 0 && (
                  <p className="text-center text-xs text-[#b0b0b0] mt-1.5 md:hidden">
                    Tap poster to play trailer
                  </p>
                )}
              </div>

              {/* ── Info ── */}
              <div className="flex-1 min-w-0 pt-1">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-1">
                  {title}{" "}
                  {year && year !== "N/A" && (
                    <span className="font-normal text-white/50">({year})</span>
                  )}
                </h1>

                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[#b0b0b0] mb-5">
                  {ageRating && (
                    <span className="inline-flex items-center border border-[#b0b0b0]/40 rounded px-1.5 py-0.5 text-[11px] leading-none font-semibold">
                      {ageRating}
                    </span>
                  )}
                  <span className="hidden sm:inline">{metadataText}</span>
                  {/* Mobile metadata */}
                  <span className="sm:hidden flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    {releaseDate && formatDate(releaseDate)}
                    {countryText && <span>&bull; {countryText}</span>}
                    {genreText && <span>&bull; {genreText}</span>}
                    {runtime && <span>&bull; {formatRuntime(runtime)}</span>}
                  </span>
                </div>

                {/* Score + Vibe + Actions row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5">
                  {/* Score Circle */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-[68px] h-[68px] flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke={scoreBg} strokeWidth="4" />
                        <circle
                          cx="32" cy="32" r="28"
                          fill="none" stroke={scoreColor} strokeWidth="4"
                          strokeDasharray={`${scorePercent * 1.76} ${176 - scorePercent * 1.76}`}
                          strokeLinecap="round"
                          className="transition-all duration-700"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-lg">
                        {scorePercent}
                        <span className="text-[10px] ml-0.5 -mt-1">%</span>
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">Skor</p>
                      <p className="text-white font-bold text-sm leading-tight">Pengguna</p>
                    </div>
                  </div>

                  {/* Share buttons */}
                  <div className="flex items-center gap-2">
                    {/* WhatsApp */}
                    <button
                      onClick={shareWhatsApp}
                      className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:bg-[#1fbf57] transition-all"
                      title="Share to WhatsApp"
                    >
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                      </svg>
                    </button>

                    {/* X (Twitter) */}
                    <button
                      onClick={shareTwitter}
                      className="w-10 h-10 rounded-full bg-[#000] border border-white/15 flex items-center justify-center text-white hover:bg-[#111] transition-all"
                      title="Share to X"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={shareFacebook}
                      className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:bg-[#1666d0] transition-all"
                      title="Share to Facebook"
                    >
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={copyLink}
                      className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white hover:bg-[#252525] hover:border-white/20 transition-all"
                      title="Copy Link"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tagline */}
                {film.tagline && (
                  <p className="italic text-[#b0b0b0]/80 text-sm sm:text-base mb-4">
                    {film.tagline}
                  </p>
                )}

                {/* Kilasan Singkat */}
                <div className="mb-5">
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-2">Kilasan Singkat</h3>
                  {film.overview && (
                    <p className="text-white/75 text-sm sm:text-base leading-relaxed">
                      {film.overview}
                    </p>
                  )}
                </div>

                {/* Ad after sinopsis */}
                <div className="flex justify-center my-6">
                  <AdBanner type="300x250" />
                </div>

                {/* Crew Grid */}
                {crewItems.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                    {crewItems.map((item, idx) => (
                      <div key={idx}>
                        <p className="text-white font-bold text-sm leading-tight">{item.name}</p>
                        <p className="text-[#b0b0b0] text-xs mt-0.5">{item.role}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inline Trailer Player — centered */}
            {activeTrailerKey && (
              <div className="mt-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold text-lg sm:text-xl">&#x25B6; Trailer</h2>
                  <button
                    onClick={() => setActiveTrailerKey(null)}
                    className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" /> Close
                  </button>
                </div>
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${activeTrailerKey}?autoplay=1&rel=0`}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                    style={{ border: "none" }}
                    title="Trailer"
                  />
                </div>
              </div>
            )}

            {/* ── Cast Section ── */}
            {cast.length > 0 && (
              <section className="mt-10">
                <h2 className="text-white font-bold text-xl sm:text-2xl mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#d90429]" /> Top Cast
                </h2>
                <div
                  className="flex gap-4 overflow-x-auto pb-3"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {cast.map((c) => (
                    <div key={c.id} className="flex-shrink-0 w-[100px] sm:w-[120px] text-center group">
                      <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden bg-[#1a1a1a] mx-auto mb-2 border-2 border-transparent group-hover:border-[#d90429] transition-colors">
                        {c.profile_path ? (
                          <img
                            src={IMAGE_URL(c.profile_path, "w185")!}
                            alt={c.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-[#b0b0b0]" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white leading-tight line-clamp-1">
                        {c.name}
                      </p>
                      <p className="text-xs text-[#b0b0b0] line-clamp-1 mt-0.5">
                        {c.character}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Native Banner after Cast ── */}
            <div className="flex justify-center my-8">
              <NativeBanner />
            </div>

            {/* ── Trailers Section ── */}
            {videos.length > 1 && (
              <section className="mt-10">
                <h2 className="text-white font-bold text-xl sm:text-2xl mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#d90429]" /> Trailers & Videos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveTrailerKey(v.key)}
                      className="block group text-left cursor-pointer"
                    >
                      <div className="aspect-video rounded-lg overflow-hidden bg-[#1a1a1a] relative">
                        <img
                          src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`}
                          alt={v.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-6 group-hover:pb-7 transition-all duration-200">
                          <Play className="w-12 h-12 text-white fill-white drop-shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white mt-2 line-clamp-1">
                        {v.name}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ── Ad before Recommendations ── */}
            <div className="flex justify-center my-8">
              <AdBanner type="300x250" />
            </div>

            {/* ── Recommendations ── */}
            {recommendations.length > 0 && (
              <section className="mt-10">
                <h2 className="text-white font-bold text-xl sm:text-2xl mb-4">Rekomendasi</h2>
                <div
                  className="flex gap-4 overflow-x-auto pb-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {recommendations.map((rec: any) => (
                    <Link
                      key={rec.id}
                      to={`/detailfilm?id=${rec.id}&type=${mediaType}`}
                      className="flex-shrink-0 w-[140px] sm:w-[160px] group cursor-pointer"
                    >
                      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] shadow-md">
                        {rec.poster_path ? (
                          <img
                            src={IMAGE_URL(rec.poster_path, "w185")!}
                            alt={rec.title || rec.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-8 h-8 text-[#b0b0b0]" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <span className="text-xs text-[#b0b0b0]">
                          {formatRating(rec.vote_average)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white line-clamp-2 leading-tight mt-0.5 group-hover:text-[#d90429] transition-colors">
                        {rec.title || rec.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Keywords ── */}
            {keywords.length > 0 && (
              <section className="mt-10">
                <h2 className="text-white font-bold text-xl sm:text-2xl mb-4">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 15).map((kw: any) => (
                    <span
                      key={kw.id}
                      className="text-xs bg-[#1a1a1a] text-[#b0b0b0] rounded-full px-3 py-1.5 border border-white/[0.06] hover:border-[#d90429]/40 hover:text-white transition-colors cursor-default"
                    >
                      {kw.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}