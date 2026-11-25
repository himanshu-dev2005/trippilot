import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { CalendarDays, Copy, ExternalLink, IndianRupee, LoaderCircle, Search, Trash2 } from 'lucide-react';
import {
  deleteTripFromMongo,
  duplicateTripInMongo,
  getSavedTripsFromMongo,
  type TripRecord,
} from '@/lib/trips';
import { useAccount } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Route = createFileRoute('/trips/')({
  head: () => ({ meta: [{ title: 'My Trips — TripPilot' }] }),
  component: MyTripsPage,
});

function MyTripsPage() {
  const { user, loading: authLoading } = useAccount();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  async function loadTrips() {
    setLoading(true);
    try {
      const res = await getSavedTripsFromMongo();
      setTrips(res.trips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trips.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    void loadTrips();
  }, [user, authLoading]);

  async function handleDuplicate(tripId: string) {
    try {
      await duplicateTripInMongo({ data: { tripId } });
      await loadTrips();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not duplicate trip.');
    }
  }

  async function handleDelete(tripId: string) {
    try {
      await deleteTripFromMongo({ data: { tripId } });
      setTrips((prev) => prev.filter((t) => t._id !== tripId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete trip.');
    }
  }

  const filtered = trips.filter((t) =>
    t.destination.toLowerCase().includes(query.trim().toLowerCase()),
  );

  if (!authLoading && !user) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl">My Saved Trips</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to view, edit, duplicate, and share your saved itineraries.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth">Sign in</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase text-primary">MongoDB Trips</p>
          <h1 className="mt-2 font-display text-4xl">My Saved Trips</h1>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by city..."
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No saved trips found.</p>
          <Button asChild className="mt-4">
            <Link to="/">Plan a new trip</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const totalStops = t.itinerary.reduce((sum, d) => sum + d.stops.length, 0);
            const totalCost = t.itinerary.reduce((sum, d) => sum + d.totalCost, 0);
            return (
              <article key={t._id} className="flex flex-col justify-between rounded-xl border border-border bg-card p-5">
                <div>
                  <h2 className="font-display text-2xl">{t.destination}</h2>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {t.numberOfDays} days · {totalStops} stops
                    </span>
                    <span className="flex items-center gap-0.5">
                      <IndianRupee className="size-3.5" />
                      {totalCost.toLocaleString('en-IN')} / ₹{t.budget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Updated {new Date(t.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => t._id && void navigate({ to: '/', search: { tripId: t._id } as never })}
                  >
                    Open in planner
                  </Button>
                  {t._id && (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/trips/$id" params={{ id: t._id }}>
                        <ExternalLink className="size-3.5" />
                        Share
                      </Link>
                    </Button>
                  )}
                  {t._id && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Duplicate trip"
                      onClick={() => void handleDuplicate(t._id!)}
                    >
                      <Copy className="size-4" />
                    </Button>
                  )}
                  {t._id && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Delete trip"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => void handleDelete(t._id!)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
