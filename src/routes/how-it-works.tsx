import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, CloudRain, Database, MapPin, Route as RouteIcon, ShieldCheck } from 'lucide-react';

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
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
      <div className="neu-raised rounded-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Planning Architecture</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
          How TripPilot builds your route
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Every itinerary sends your exact destination, days, budget, and travel style directly to Gemini AI, paired with live weather forecasts and interactive maps.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <article key={stage.title} className="neu-raised rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">{stage.index}</span>
                <Icon className="size-5 text-primary" />
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold text-foreground">
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
        <Link
          to="/"
          className="neu-btn-primary inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold"
        >
          Start planning a trip
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}
