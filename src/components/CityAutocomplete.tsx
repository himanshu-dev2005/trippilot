import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { LoaderCircle, MapPin, Search, X } from 'lucide-react';
import { searchIndianCities, type IndianCityEntry } from '@/lib/indian-cities';
import { searchIndianCitiesServer } from '@/lib/trips';

type CityAutocompleteProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectCity?: (city: IndianCityEntry) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
};

function HighlightPrefix({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const qLower = q.toLowerCase();
  if (lower.startsWith(qLower)) {
    return (
      <>
        <strong className="font-semibold text-foreground">{text.slice(0, q.length)}</strong>
        <span className="text-foreground/85">{text.slice(q.length)}</span>
      </>
    );
  }
  return <>{text}</>;
}

export function CityAutocomplete({
  id = 'destination',
  value,
  onChange,
  onSelectCity,
  placeholder = 'Search any Indian city (e.g. New Delhi, Jaipur, Dehradun...)',
  className = '',
  inputClassName = '',
  autoFocus = false,
}: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [remoteCities, setRemoteCities] = useState<IndianCityEntry[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();

  const localResults = useMemo(() => searchIndianCities(value, 8), [value]);

  // Fetch additional Indian cities starting with the typed prefix from Nominatim when local prefix matches are sparse
  useEffect(() => {
    const q = value.trim();
    const hasEnoughLocalPrefix =
      localResults.filter((r) => r.matchType === 'exact' || r.matchType === 'prefix').length >= 5;

    if (!open || q.length < 2 || hasEnoughLocalPrefix) {
      setRemoteCities([]);
      setLoadingRemote(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setLoadingRemote(true);
      void searchIndianCitiesServer({ data: { query: q } })
        .then((res) => {
          if (cancelled) return;
          setRemoteCities(
            res.cities.map((c) => ({
              name: c.name,
              state: c.state,
              vibe: c.vibe,
            })),
          );
        })
        .catch(() => {
          if (!cancelled) setRemoteCities([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingRemote(false);
        });
    }, 240);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, open, localResults]);

  // Merge local + remote while preserving strict prefix-first ordering
  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    const seen = new Set<string>();
    const combined: IndianCityEntry[] = [];

    for (const item of localResults) {
      const key = item.city.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(item.city);
      }
    }

    for (const rc of remoteCities) {
      const key = rc.name.toLowerCase();
      if (seen.has(key)) continue;
      if (q && !key.startsWith(q)) continue;
      seen.add(key);
      combined.push(rc);
    }

    // If any result starts with the typed query, keep ONLY prefix-matching cities
    if (q) {
      const prefixOnly = combined.filter(
        (c) =>
          c.name.toLowerCase().startsWith(q) ||
          Boolean(c.aliases?.some((a) => a.toLowerCase().startsWith(q))),
      );
      if (prefixOnly.length > 0) {
        return prefixOnly.slice(0, 8);
      }
    }

    return combined.slice(0, 8);
  }, [localResults, remoteCities, value]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [value, open]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function commitSelection(city: IndianCityEntry) {
    onChange(city.name);
    onSelectCity?.(city);
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      e.preventDefault();
      commitSelection(suggestions[highlightedIndex]!);
    }
  }

  const trimmed = value.trim();
  const isShowingPopular = trimmed.length === 0;

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <div className="flex items-center gap-2.5">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
          }
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required
          className={`h-11 w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none ${inputClassName}`}
        />
        {trimmed.length > 0 && (
          <button
            type="button"
            aria-label="Clear destination"
            onClick={() => {
              onChange('');
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="City suggestions"
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border/70 px-3.5 py-2 text-xs text-muted-foreground">
            <span>
              {isShowingPopular
                ? 'Popular destinations in India'
                : `Cities starting with “${trimmed}”`}
            </span>
            {loadingRemote && <LoaderCircle className="size-3.5 animate-spin text-primary" />}
          </div>

          {suggestions.length === 0 ? (
            <div className="px-4 py-3.5 text-sm text-muted-foreground">
              {loadingRemote ? (
                'Searching Indian cities…'
              ) : (
                <>
                  No preset match for “{trimmed}” — press{' '}
                  <strong className="font-medium text-foreground">Plan Trip</strong> to search
                  live across India.
                </>
              )}
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {suggestions.map((city, idx) => {
                const isActive = idx === highlightedIndex;
                return (
                  <li key={`${city.name}-${city.state}`} role="option" aria-selected={isActive}>
                    <button
                      id={`${listboxId}-opt-${idx}`}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        commitSelection(city);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-secondary text-foreground' : 'hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-2.5">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <div className="truncate text-sm">
                            <HighlightPrefix text={city.name} query={trimmed} />
                            <span className="mx-1.5 text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{city.state}</span>
                          </div>
                          <p className="truncate text-xs text-muted-foreground">{city.vibe}</p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
