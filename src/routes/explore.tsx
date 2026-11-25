import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Star } from 'lucide-react';
import { StopPhoto } from '@/components/StopPhoto';
import { BrandLogo } from '@/components/BrandLogo';

const CIRCUITS = [
  {
    city: 'Jaipur',
    title: 'Jaipur, Rajasthan',
    subtitle: 'Jaipur, Rajasthan',
    region: 'RAJASTHAN',
    days: 4,
    rating: '4.9',
    budget: '₹8,000',
  },
  {
    city: 'Varanasi',
    title: 'Varanasi, Uttar Pradesh',
    subtitle: 'Varanasi, Uttar Pradesh',
    region: 'UTTAR PRADESH',
    days: 3,
    rating: '4.9',
    budget: '₹5,000',
  },
  {
    city: 'Alleppey',
    title: 'Alleppey & Munnar, Kerala',
    subtitle: 'Alleppey & Munnar, Kerala',
    region: 'KERALA',
    days: 5,
    rating: '4.9',
    budget: '₹10,000',
  },
  {
    city: 'Leh',
    title: 'Leh & Ladakh',
    subtitle: 'High Passes & Monasteries',
    region: 'LADAKH',
    days: 6,
    rating: '4.9',
    budget: '₹15,000',
  },
  {
    city: 'Udaipur',
    title: 'Udaipur, Rajasthan',
    subtitle: 'Lakes & Heritage Havelis',
    region: 'RAJASTHAN',
    days: 4,
    rating: '4.8',
    budget: '₹8,500',
  },
  {
    city: 'Dehradun',
    title: 'Dehradun, Uttarakhand',
    subtitle: 'Foothills, Temples & Forests',
    region: 'UTTARAKHAND',
    days: 3,
    rating: '4.8',
    budget: '₹5,000',
  },
];

export const Route = createFileRoute('/explore')({
  head: () => ({ meta: [{ title: 'Explore India — TripPilot' }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="flex flex-wrap items-center gap-3">
        <BrandLogo size="sm" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          INDIA EXPEDITION ARCHIVE
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <h1 className="font-display text-5xl tracking-tight text-foreground sm:text-6xl">
            Explore India
          </h1>
          <p className="mt-3 max-w-xl font-display text-base italic text-muted-foreground">
            Curated day-by-day itineraries across Rajasthan, Uttar Pradesh, Kerala, Ladakh, and Uttarakhand — sequenced with minimal transit time.
          </p>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {CIRCUITS.length} FEATURED CIRCUITS · ALL REGIONS VERIFIED
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CIRCUITS.map((c) => (
          <button
            key={c.title}
            type="button"
            onClick={() => void navigate({ to: '/', search: { city: c.city } as never })}
            className="group overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="overflow-hidden rounded-lg">
              <StopPhoto
                name={`${c.city}, India`}
                category={c.region}
                className="h-52 w-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="px-1 pt-4 pb-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-display italic text-muted-foreground">{c.subtitle}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.region}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <span>{c.days} DAYS · {c.budget}</span>
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <Star className="size-3 fill-current" />
                  {c.rating}
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl text-foreground group-hover:text-primary">
                {c.title}
              </h2>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
