import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { debounce } from "../utils/helpers";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  onSearch,
  initialValue = "",
  placeholder = "Search movies, TV shows...",
  autoFocus = false,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setValue(q);
  }, [searchParams]);

  const debouncedSearch = useRef(
    debounce((query: string) => {
      if (onSearch) {
        onSearch(query);
      }
    }, 500)
  ).current;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setValue(query);
    debouncedSearch(query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleClear = () => {
    setValue("");
    if (onSearch) onSearch("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-3 bg-secondary border border-border rounded-xl text-foreground
                     placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary
                     focus:border-primary transition-all text-base"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
