import type { Movie, TVShow, MediaItem, Genre } from "../types";

export function getTitle(item: Movie | TVShow | MediaItem): string {
  return (item as Movie).title || (item as TVShow).name || "Unknown";
}

export function getReleaseDate(item: Movie | TVShow | MediaItem): string {
  return (
    (item as Movie).release_date || (item as TVShow).first_air_date || ""
  );
}

export function getReleaseYear(item: Movie | TVShow | MediaItem): string {
  const date = getReleaseDate(item);
  return date ? date.split("-")[0] : "N/A";
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatRuntime(minutes: number): string {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatNumber(num: number): string {
  if (!num) return "N/A";
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatCurrency(amount: number): string {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getGenreNames(
  genreIds: number[],
  genres: Genre[]
): string[] {
  return genreIds
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean) as string[];
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function getMediaType(item: MediaItem): "movie" | "tv" {
  if (item.media_type) return item.media_type;
  if ((item as Movie).title !== undefined) return "movie";
  return "tv";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
