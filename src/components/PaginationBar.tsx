import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];

  if (totalPages <= maxVisible) {
    // Show all pages if total fits within maxVisible
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Calculate window: try to center currentPage
    const half = Math.floor(maxVisible / 2); // 2 when maxVisible=5
    let start = Math.max(1, currentPage - half);
    let end = start + maxVisible - 1;

    // Adjust if window goes beyond totalPages
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    // Add ellipsis at start if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add visible page numbers
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis at end if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }
  }

  const btnBase =
    "inline-flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-md text-sm font-medium transition-colors";

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-10"
    >
      {/* Previous Button */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className={cn(
          btnBase,
          "gap-1 px-3",
          currentPage <= 1
            ? "text-muted-foreground/40 cursor-not-allowed"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page Numbers */}
      {pages.map((p) => {
        if (typeof p === "string") {
          return (
            <span
              key={p}
              className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-1 text-muted-foreground select-none"
              aria-hidden="true"
            >
              ...
            </span>
          );
        }

        const isActive = p === currentPage;

        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Page ${p}`}
            disabled={isActive}
            className={cn(
              btnBase,
              isActive
                ? "bg-primary text-primary-foreground shadow-sm cursor-default"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className={cn(
          btnBase,
          "gap-1 px-3",
          currentPage >= totalPages
            ? "text-muted-foreground/40 cursor-not-allowed"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        )}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}