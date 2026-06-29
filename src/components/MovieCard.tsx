import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Play, Info } from "lucide-react";
import { IMAGE_URL } from "../api/endpoints";
import { GenreBadge } from "./GenreBadge";
import { useGenres } from "../context/GenreContext";
import { getTitle, getReleaseYear, formatRating } from "../utils/helpers";
import type { Movie, TVShow } from "../types";

interface MovieCardProps {
  item: Movie | TVShow;
  mediaType?: "movie" | "tv";
}

export function MovieCard({ item, mediaType = "movie" }: MovieCardProps) {
  const [imgError, setImgError] = useState(false);
  const { getGenreName } = useGenres();
  const title = getTitle(item);
  const year = getReleaseYear(item);
  const rating = formatRating(item.vote_average);
  const posterUrl = !imgError && item.poster_path ? IMAGE_URL(item.poster_path, "w342") : null;
  const type = (item as Movie).title !== undefined ? "movie" : "tv";
  const resolvedType = mediaType || type;
  const detailPath = `/detailfilm?id=${item.id}&type=${resolvedType}`;
  const genreNames = (item.genre_ids || []).slice(0, 2).map((id) => getGenreName(id, resolvedType)).filter(Boolean);

  return (
    <motion.div
      className="flex-shrink-0 w-40 sm:w-44 md:w-52 group cursor-pointer"
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link to={detailPath} className="block">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-muted-foreground text-[10px] sm:text-xs text-center px-2 leading-tight">{title}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
            <div>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center gap-0.5 bg-black/60 rounded px-1.5 py-0.5">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-[10px] sm:text-xs font-medium text-white">{rating}</span>
                </div>
              </div>
              {genreNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {genreNames.map((name) => (
                    <GenreBadge key={name} name={name} className="text-[9px] sm:text-[10px] px-1.5 py-0" />
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                <Link
                  to={`/hub?play=${item.id}&type=${resolvedType}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 bg-white text-black rounded-md px-2 py-1 text-[11px] sm:text-xs font-semibold hover:bg-white/90 transition-colors"
                >
                  <Play className="w-3 h-3 fill-black flex-shrink-0" /> Play
                </Link>
                <Link
                  to={detailPath}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 bg-white/15 text-white rounded-md px-2 py-1 text-[11px] sm:text-xs font-semibold hover:bg-white/25 transition-colors border border-white/10"
                >
                  <Info className="w-3 h-3 flex-shrink-0" /> Info
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Title row */}
        <div className="mt-2 px-0.5">
          <p className="text-[13px] sm:text-sm font-medium text-foreground line-clamp-2 leading-tight">{title}</p>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{year}</p>
        </div>
      </Link>
    </motion.div>
  );
}