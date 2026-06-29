import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { movieService } from "../services/tmdbService";
import { tvService } from "../services/tmdbService";
import type { Genre } from "../types";

interface GenreContextValue {
  movieGenres: Genre[];
  tvGenres: Genre[];
  getGenreName: (id: number, type?: "movie" | "tv") => string;
}

const GenreContext = createContext<GenreContextValue>({
  movieGenres: [],
  tvGenres: [],
  getGenreName: () => "",
});

export function GenreProvider({ children }: { children: React.ReactNode }) {
  const { data: movieGenreData } = useQuery({
    queryKey: ["genres", "movie"],
    queryFn: () => movieService.getGenres(),
    staleTime: Infinity,
  });
  const { data: tvGenreData } = useQuery({
    queryKey: ["genres", "tv"],
    queryFn: () => tvService.getGenres(),
    staleTime: Infinity,
  });

  const movieGenres: Genre[] = movieGenreData?.genres || [];
  const tvGenres: Genre[] = tvGenreData?.genres || [];

  const getGenreName = (id: number, type: "movie" | "tv" = "movie"): string => {
    const list = type === "movie" ? movieGenres : tvGenres;
    return list.find((g) => g.id === id)?.name || "";
  };

  return (
    <GenreContext.Provider value={{ movieGenres, tvGenres, getGenreName }}>
      {children}
    </GenreContext.Provider>
  );
}

export const useGenres = () => useContext(GenreContext);