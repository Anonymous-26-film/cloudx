import { useState, useCallback } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { OgMeta } from "../components/OgMeta";
import { HeroBanner } from "../components/HeroBanner";
import { MovieRow } from "../components/MovieRow";
import { PaginationBar } from "../components/PaginationBar";
import { NativeBanner } from "../components/ads";
import { movieService } from "../services/tmdbService";
import { tvService } from "../services/tmdbService";

function usePaginatedSection(
  key: string,
  fetcher: (page: number) => Promise<{ page: number; total_pages: number; results: unknown[] }>,
  staleTime = 5 * 60 * 1000
) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["home", key, page],
    queryFn: () => fetcher(page),
    placeholderData: keepPreviousData,
    staleTime,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    page,
    totalPages: data?.total_pages ?? 0,
    items: (data?.results as MovieRowItem[]) ?? [],
    isLoading,
    handlePageChange,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MovieRowItem = any;

export function HomePage() {
  const trendingMovies = usePaginatedSection("trending-movies", (p) => movieService.getTrending(p));
  const trendingTV = usePaginatedSection("trending-tv", (p) => tvService.getTrending(p));
  const popularMovies = usePaginatedSection("popular-movies", (p) => movieService.getPopular(p));
  const popularTV = usePaginatedSection("popular-tv", (p) => tvService.getPopular(p));
  const topRatedMovies = usePaginatedSection("top-rated-movies", (p) => movieService.getTopRated(p));
  const upcomingMovies = usePaginatedSection("upcoming-movies", (p) => movieService.getUpcoming(p));

  const heroItems = trendingMovies.items || [];

  const sections = [
    {
      row: (
        <MovieRow title="Trending Movies" items={trendingMovies.items} isLoading={trendingMovies.isLoading} mediaType="movie" viewAllLink="/category/trending-movies" />
      ),
      pagination: (
        <PaginationBar currentPage={trendingMovies.page} totalPages={trendingMovies.totalPages} onPageChange={trendingMovies.handlePageChange} maxVisible={5} />
      ),
    },
    {
      row: (
        <MovieRow title="Trending TV Series" items={trendingTV.items} isLoading={trendingTV.isLoading} mediaType="tv" viewAllLink="/category/trending-tv" />
      ),
      pagination: (
        <PaginationBar currentPage={trendingTV.page} totalPages={trendingTV.totalPages} onPageChange={trendingTV.handlePageChange} maxVisible={5} />
      ),
    },
    {
      row: (
        <MovieRow title="Popular Movies" items={popularMovies.items} isLoading={popularMovies.isLoading} mediaType="movie" viewAllLink="/category/popular-movies" />
      ),
      pagination: (
        <PaginationBar currentPage={popularMovies.page} totalPages={popularMovies.totalPages} onPageChange={popularMovies.handlePageChange} maxVisible={5} />
      ),
    },
    {
      row: (
        <MovieRow title="Popular TV Shows" items={popularTV.items} isLoading={popularTV.isLoading} mediaType="tv" viewAllLink="/category/popular-tv" />
      ),
      pagination: (
        <PaginationBar currentPage={popularTV.page} totalPages={popularTV.totalPages} onPageChange={popularTV.handlePageChange} maxVisible={5} />
      ),
    },
    {
      row: (
        <MovieRow title="Top Rated Movies" items={topRatedMovies.items} isLoading={topRatedMovies.isLoading} mediaType="movie" viewAllLink="/category/top-rated-movies" />
      ),
      pagination: (
        <PaginationBar currentPage={topRatedMovies.page} totalPages={topRatedMovies.totalPages} onPageChange={topRatedMovies.handlePageChange} maxVisible={5} />
      ),
    },
    {
      row: (
        <MovieRow title="Upcoming Movies" items={upcomingMovies.items} isLoading={upcomingMovies.isLoading} mediaType="movie" viewAllLink="/category/upcoming-movies" />
      ),
      pagination: (
        <PaginationBar currentPage={upcomingMovies.page} totalPages={upcomingMovies.totalPages} onPageChange={upcomingMovies.handlePageChange} maxVisible={5} />
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>PortalHub Cinema — Your Gateway to Unlimited Entertainment</title>
        <meta name="description" content="Discover and watch trending movies, top-rated films, and popular TV shows. Powered by TMDB API." />
      </Helmet>
      <OgMeta
        title="PortalHub Cinema — Your Gateway to Unlimited Entertainment"
        description="Discover and watch trending movies, top-rated films, and popular TV shows on PortalHub Cinema. Powered by TMDB API."
      />

      <HeroBanner items={heroItems} isLoading={trendingMovies.isLoading} mediaType="movie" />

      <div className="flex justify-center py-4">
        <NativeBanner />
      </div>

      <div className="relative z-10 mt-12 md:mt-16 pb-8">
        <div className="md:px-8 lg:px-12">
          {sections.map((s, i) => (
            <div key={i}>
              {s.row}
              <div className="mt-4 mb-10 sm:mb-12">
                {s.pagination}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}