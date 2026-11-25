import { createFileRoute, Link } from '@tanstack/react-router';
import { CloudRain, Compass, Database, MapPin, Route as RouteIcon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAGES = [
  {
    icon: MapPin,
    title: '1. Geographic Day Grouping',
    description:
      'Attractions are grouped into day-wise geographic clusters so each day covers a coherent neighborhood instead of zig-zagging across the city.',
  },
  {
    icon: RouteIcon,
    title: '2. Daily Route Optimization',
    description:
      'Within each day, stops are ordered to minimize travel distance and transit time, optionally starting and ending at your hotel.',
  },
  {
    icon: ShieldCheck,
    title: '3. Time, Opening Hours & Budget Fitting',
    description:
      'Every stop is scheduled against attraction opening hours, daily sightseeing windows, and your total budget including transit costs.',
  },
  {
    icon: CloudRain,
    title: '4. Live Weather Adaptation',
    description:
      'OpenWeather 5-day forecasts detect rain on specific trip days and let you swap outdoor stops for indoor alternatives without disturbing other days.',
  },
  {
    icon: Database,
    title: '5. MongoDB Persistence & Sharing',
    description:
      'User accounts, preferences, favourites, and editable itineraries are persisted in MongoDB with HTTP-only cookie sessions and shareable trip links.',
  },
];

export const Route = createFileRoute('/how-it-works')({
  head: () => ({ meta: [{ title: 'How It Works — TripPilot' }] }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center gap-2 text-primary">
        <Compass className="size-5" />
        <span className="font-mono text-xs uppercase">Architecture &amp; Workflow</span>
      </div>
      <h1 className="mt-2 font-display text-4xl">How TripPilot Plans Your Trip</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        TripPilot combines real-time attraction discovery, multi-stage route and constraint planning, weather forecasting, and MongoDB persistence.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <article key={stage.title} className="rounded-xl border border-border bg-card p-6">
              <Icon className="size-6 text-primary" />
              <h2 className="mt-3 font-display text-xl">{stage.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.description}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Button asChild size="lg">
          <Link to="/">Start Planning a Trip</Link>
        </Button>
      </div>
    </main>
  );
}
