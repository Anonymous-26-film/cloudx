import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { HeroBanner } from "../components/HeroBanner";
import { MovieRow } from "../components/MovieRow";
import { movieService } from "../services/tmdbService";
import { tvService } from "../services/tmdbService";

export function HomePage() {
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending", "movies"],
    queryFn: () => movieService.getTrending(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ["popular", "movies"],
    queryFn: () => movieService.getPopular(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: topRatedData, isLoading: topRatedLoading } = useQuery({
    queryKey: ["top-rated", "movies"],
    queryFn: () => movieService.getTopRated(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ["upcoming", "movies"],
    queryFn: () => movieService.getUpcoming(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: tvTrendingData, isLoading: tvTrendingLoading } = useQuery({
    queryKey: ["trending", "tv"],
    queryFn: () => tvService.getTrending(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: tvPopularData, isLoading: tvPopularLoading } = useQuery({
    queryKey: ["popular", "tv"],
    queryFn: () => tvService.getPopular(),
    staleTime: 5 * 60 * 1000,
  });

  const heroItems = trendingData?.results || [];

  return (
    <>
      <Helmet>
        <title>PortalHub Cinema — Your Gateway to Unlimited Entertainment</title>
        <meta name="description" content="Discover and watch trending movies, top-rated films, and popular TV shows. Powered by TMDB API." />
        <meta property="og:title" content="PortalHub Cinema" />
        <meta property="og:description" content="Your Gateway to Unlimited Entertainment" />
      </Helmet>

      <HeroBanner items={heroItems} isLoading={trendingLoading} mediaType="movie" />

      <div className="relative z-10 -mt-16 md:-mt-24 pb-8">
        <MovieRow title="Trending Movies" items={trendingData?.results || []} isLoading={trendingLoading} mediaType="movie" viewAllLink="/category/trending-movies" />
        <MovieRow title="Trending TV Series" items={tvTrendingData?.results || []} isLoading={tvTrendingLoading} mediaType="tv" viewAllLink="/category/trending-tv" />
        <MovieRow title="Popular Movies" items={popularData?.results || []} isLoading={popularLoading} mediaType="movie" viewAllLink="/category/popular-movies" />
        <MovieRow title="Popular TV Shows" items={tvPopularData?.results || []} isLoading={tvPopularLoading} mediaType="tv" viewAllLink="/category/popular-tv" />
        <MovieRow title="Top Rated Movies" items={topRatedData?.results || []} isLoading={topRatedLoading} mediaType="movie" viewAllLink="/category/top-rated-movies" />
        <MovieRow title="Upcoming Movies" items={upcomingData?.results || []} isLoading={upcomingLoading} mediaType="movie" viewAllLink="/category/upcoming-movies" />
      </div>
    </>
  );
}