import { useMemo, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowRight, MapPin, Search, Star, X } from 'lucide-react';
import { FEATURED_CIRCUITS, type FeaturedCircuit } from '@/lib/circuit-media';
import { searchIndianCities } from '@/lib/indian-cities';

const REGION_TABS: Array<'All' | FeaturedCircuit['regionGroup']> = [
  'All',
  'North & Himalayas',
  'Rajasthan',
  'Coast & Backwaters',
  'Heritage & Spiritual',
];

export const Route = createFileRoute('/explore')({
  head: () => ({ meta: [{ title: 'Explore India — TripPilot' }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate();
  const [regionFilter, setRegionFilter] = useState<'All' | FeaturedCircuit['regionGroup']>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCircuits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FEATURED_CIRCUITS.filter((c) => {
      if (regionFilter !== 'All' && c.regionGroup !== regionFilter) return false;
      if (!q) return true;
      return c.city.toLowerCase().startsWith(q) || c.title.toLowerCase().startsWith(q);
    });
  }, [regionFilter, searchQuery]);

  // Also show prefix-matching Indian cities from the full 140+ city directory when searching
  const directoryPrefixMatches = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    const circuitCityNames = new Set(filteredCircuits.map((c) => c.city.toLowerCase()));
    return searchIndianCities(q, 8)
      .filter((r) => r.matchType === 'exact' || r.matchType === 'prefix')
      .map((r) => r.city)
      .filter((city) => !circuitCityNames.has(city.name.toLowerCase()));
  }, [searchQuery, filteredCircuits]);

  function openCircuitInPlanner(city: string, days = 3, budget = 6000) {
    void navigate({
      to: '/',
      search: { city, days: String(days), budget: String(budget), auto: '1' } as never,
    });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <div className="border-b border-border pb-8">
        <p className="text-xs font-medium text-primary">India Destination Atlas</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              Explore India
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Browse curated regional circuits or filter by any Indian city name to jump straight into an optimized day-by-day plan.
            </p>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {FEATURED_CIRCUITS.length} curated circuits · 140+ Indian cities indexed
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter cities by starting letters (e.g. New, Jai, Man)..."
              className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted p-1">
            {REGION_TABS.map((tab) => {
              const active = regionFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRegionFilter(tab)}
                  className={`h-8 whitespace-nowrap rounded-lg px-3 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredCircuits.length > 0 && (
        <section className="mt-10">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCircuits.map((c) => (
              <button
                key={c.city}
                type="button"
                onClick={() => openCircuitInPlanner(c.city, c.days, c.budget)}
                className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-200 hover:border-primary/50 hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                    <span>
                      {c.region} · {c.days} days · ₹{c.budget.toLocaleString('en-IN')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      {c.rating}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-medium text-foreground transition-colors group-hover:text-primary">
                    {c.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    Plan {c.days}-day itinerary
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {directoryPrefixMatches.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="font-display text-2xl font-medium text-foreground">
            More Indian cities starting with “{searchQuery.trim()}”
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {directoryPrefixMatches.map((city) => (
              <button
                key={`${city.name}-${city.state}`}
                type="button"
                onClick={() => openCircuitInPlanner(city.name, 3, 6000)}
                className="group flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-primary" />
                    <span>{city.state}</span>
                  </div>
                  <h3 className="mt-1 font-display text-xl font-medium text-foreground group-hover:text-primary">
                    {city.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{city.vibe}</p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
        </section>
      )}

      {filteredCircuits.length === 0 && directoryPrefixMatches.length === 0 && (
        <div className="mt-12 rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-base font-medium text-foreground">
            No preset circuits start with “{searchQuery.trim()}”
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            TripPilot can still plan any Indian town or city live in the main planner.
          </p>
          <button
            type="button"
            onClick={() => openCircuitInPlanner(searchQuery.trim(), 3, 6000)}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Plan {searchQuery.trim()} live
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </main>
  );
}
