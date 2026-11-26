import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, CloudRain, Database, MapPin, Route as RouteIcon, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAGES = [
  {
    index: '01',
    icon: MapPin,
    title: 'Geographic Day Grouping',
    description:
      'Attractions are grouped into day-wise neighborhood clusters so each day explores a coherent area instead of zig-zagging across the city.',
  },
  {
    index: '02',
    icon: RouteIcon,
    title: 'Daily Route Optimization',
    description:
      'Within each day, stops are sequenced using nearest-neighbour and 2-opt refinement to minimize travel distance and transit time, optionally anchored at your hotel.',
  },
  {
    index: '03',
    icon: ShieldCheck,
    title: 'Opening Hours & Budget Fitting',
    description:
      'Every stop is scheduled against real opening windows, sightseeing duration, and your rupee budget—accounting for both tickets and local transit.',
  },
  {
    index: '04',
    icon: CloudRain,
    title: 'Live Weather Adaptation',
    description:
      'Daily forecasts flag rain alerts automatically so you can swap outdoor parks and forts for indoor museums, palaces, or temples in one click.',
  },
  {
    index: '05',
    icon: Database,
    title: 'Saved Trips, Exports & Group Sharing',
    description:
      'Save trips to your account, share links for group voting, export stops to Calendar (.ics), or download a self-contained Offline Pocket Pass.',
  },
];

export const Route = createFileRoute('/how-it-works')({
  head: () => ({ meta: [{ title: 'How It Works — TripPilot' }] }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <div className="border-b border-border pb-8">
        <p className="text-xs font-medium text-primary">Planning Architecture</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          How TripPilot builds your route
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Every itinerary combines verified Indian coordinates, multi-stage route optimization, live weather forecasts, and interactive editing.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <article key={stage.title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary">{stage.index}</span>
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <h2 className="mt-3 font-display text-xl font-medium text-foreground">
                {stage.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {stage.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <Button asChild size="lg" className="gap-2 rounded-xl">
          <Link to="/">
            Start planning a trip
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
