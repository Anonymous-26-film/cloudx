import { Routes, Route } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { HomePage } from "../pages/HomePage";
import { SearchPage } from "../pages/SearchPage";
import { WatchPage } from "../pages/WatchPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { CategoryPage } from "../pages/CategoryPage";
import { PluginDetailPage } from "../pages/PluginDetailPage";
import { ServerManagementPage } from "../pages/ServerManagementPage";
import { MovieHubPage } from "../pages/MovieHubPage";
import { MoviesPage } from "../pages/MoviesPage";
import { DetailFilmPage } from "../pages/DetailFilmPage";

const CATEGORY_TITLES: Record<string, string> = {
  "trending-movies": "Trending Movies", "popular-movies": "Popular Movies",
  "top-rated-movies": "Top Rated Movies", "upcoming-movies": "Upcoming Movies",
  "trending-tv": "Trending TV", "popular-tv": "Popular TV", "top-rated-tv": "Top Rated TV",
  Movie: "Movie Sources", TvSeries: "TV Series Sources",
  Anime: "Anime Sources", AnimeMovie: "Anime Movie Sources",
  AsianDrama: "Asian Drama Sources", OVA: "OVA Sources", all: "All Sources",
};

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/plugin/:internalName" element={<PluginDetailPage />} />
        <Route path="/servers" element={<ServerManagementPage />} />
        <Route path="/hub" element={<MovieHubPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/category/:category" element={<CategoryRoute />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/detailfilm" element={<DetailFilmPage />} />

        {/* Legacy nav routes */}
        <Route path="/tv" element={<CategoryPage category="TvSeries" title="TV Series Sources" description="Streaming sources for TV series" />} />
        <Route path="/trending" element={<CategoryPage category="trending-movies" title="Trending Movies" description="The most trending movies this week" />} />
        <Route path="/popular" element={<CategoryPage category="popular-movies" title="Popular Movies" description="The most popular movies right now" />} />
        <Route path="/top-rated" element={<CategoryPage category="top-rated-movies" title="Top Rated Movies" description="The highest rated movies of all time" />} />
      </Route>

      <Route path="/watch/:mediaType/:id" element={<WatchPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

import { useParams } from "react-router-dom";
function CategoryRoute() {
  const { category } = useParams<{ category: string }>();
  const cat = category || "all";
  const title = CATEGORY_TITLES[cat] || `${cat}`;
  return <CategoryPage category={cat} title={title} />;
}