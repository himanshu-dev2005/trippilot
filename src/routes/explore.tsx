import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Calendar, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DESTINATIONS = [
  { name: 'Dehradun', state: 'Uttarakhand', season: 'Oct – Mar', dailyBudget: '₹1,500', highlights: 'Forest Research Institute, temples, nature parks' },
  { name: 'Jaipur', state: 'Rajasthan', season: 'Nov – Feb', dailyBudget: '₹2,000', highlights: 'Amber Fort, Hawa Mahal, City Palace, bazaars' },
  { name: 'Goa', state: 'Goa', season: 'Nov – Feb', dailyBudget: '₹2,500', highlights: 'Beaches, Portuguese forts, spice plantations' },
  { name: 'Manali', state: 'Himachal Pradesh', season: 'Mar – Jun, Dec', dailyBudget: '₹2,200', highlights: 'Solang Valley, Hadimba Temple, Old Manali cafés' },
  { name: 'Udaipur', state: 'Rajasthan', season: 'Oct – Mar', dailyBudget: '₹2,000', highlights: 'Lake Pichola, City Palace, Monsoon Palace' },
  { name: 'Varanasi', state: 'Uttar Pradesh', season: 'Oct – Mar', dailyBudget: '₹1,400', highlights: 'Dashashwamedh Ghat, Kashi Vishwanath, Sarnath' },
  { name: 'Rishikesh', state: 'Uttarakhand', season: 'Sep – Apr', dailyBudget: '₹1,500', highlights: 'Laxman Jhula, Ganga Aarti, rafting & cafés' },
  { name: 'Kochi', state: 'Kerala', season: 'Oct – Mar', dailyBudget: '₹1,800', highlights: 'Fort Kochi, Chinese fishing nets, spice markets' },
];

export const Route = createFileRoute('/explore')({
  head: () => ({ meta: [{ title: 'Explore India — TripPilot' }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="font-mono text-xs uppercase text-primary">Discover India</p>
      <h1 className="mt-2 font-display text-4xl">Explore Destinations</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Browse popular Indian destinations, best seasons to visit, and typical daily budgets—then jump straight into planning.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DESTINATIONS.map((d) => (
          <article key={d.name} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
            <div>
              <p className="font-mono text-xs uppercase text-primary">{d.state}</p>
              <h2 className="mt-1 font-display text-2xl">{d.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d.highlights}</p>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" /> Best: {d.season}
                </p>
                <p className="flex items-center gap-1.5">
                  <IndianRupee className="size-3.5 text-primary" /> Est. {d.dailyBudget}/day
                </p>
              </div>
            </div>

            <Button
              type="button"
              className="mt-5 w-full"
              onClick={() => void navigate({ to: '/', search: { city: d.name } as never })}
            >
              Plan {d.name}
              <ArrowRight className="size-4" />
            </Button>
          </article>
        ))}
      </div>
    </main>
  );
}
