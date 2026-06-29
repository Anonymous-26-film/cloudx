import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Play, Plus } from "lucide-react";
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
  const detailPath = `/${resolvedType}/${item.id}`;
  const genreNames = (item.genre_ids || []).slice(0, 2).map((id) => getGenreName(id, resolvedType)).filter(Boolean);

  return (
    <motion.div
      className="flex-shrink-0 w-36 sm:w-40 md:w-44 group cursor-pointer"
      whileHover={{ scale: 1.05, zIndex: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Link to={`/hub?play=${item.id}&type=${resolvedType}`} className="block">
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-secondary">
          {posterUrl ? (
            <img src={posterUrl} alt={title} className="w-full h-full object-cover transition-opacity duration-300" loading="lazy" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <span className="text-muted-foreground text-xs text-center px-2">{title}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
            <div className="flex justify-end">
              <div className="flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-white">{rating}</span>
              </div>
            </div>
            <div>
              {genreNames.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {genreNames.map((name) => (
                    <GenreBadge key={name} name={name} className="text-[10px] px-1.5 py-0" />
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                <Link
                  to={`/hub?play=${item.id}&type=${resolvedType}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 bg-white text-black rounded px-2 py-1 text-xs font-semibold hover:bg-white/80 transition-colors"
                >
                  <Play className="w-3 h-3 fill-black" /> Play
                </Link>
                <Link to={detailPath} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-white/20 text-white rounded px-2 py-1 text-xs font-semibold hover:bg-white/30 transition-colors">
                  <Plus className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-1.5 px-0.5">
          <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{year}</p>
        </div>
      </Link>
    </motion.div>
  );
}