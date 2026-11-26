import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Clock3, ExternalLink, LoaderCircle, Navigation, ThumbsDown, ThumbsUp } from 'lucide-react';
import { getPublicTripById, voteTripStop, type TripRecord } from '@/lib/trips';
import { formatTime24 } from '@/lib/optimizer';
import { DestinationMap } from '@/components/DestinationMap';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/trips/$id')({
  component: SharedTripPage,
});

function SharedTripPage() {
  const { id } = Route.useParams();
  const [trip, setTrip] = useState<TripRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [votedStops, setVotedStops] = useState<Record<string, 'up' | 'down'>>({});
  const [votingKey, setVotingKey] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`trippilot:voted:${id}`);
      if (saved) setVotedStops(JSON.parse(saved) as Record<string, 'up' | 'down'>);
    } catch {
      // ignore
    }
    void getPublicTripById({ data: { tripId: id } })
      .then((res) => {
        setTrip(res.trip);
        setSelectedPlaceName(res.trip?.itinerary[0]?.stops[0]?.name ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleVote(dayNumber: number, attractionId: string, direction: 'up' | 'down') {
    const key = `${dayNumber}::${attractionId}`;
    if (!trip || votedStops[key] || votingKey === key) return;
    setVotingKey(key);
    try {
      const res = await voteTripStop({
        data: { tripId: id, dayNumber, attractionId, direction },
      });
      if (res.itinerary.length > 0) {
        setTrip({ ...trip, itinerary: res.itinerary });
      }
      const nextVoted = { ...votedStops, [key]: direction };
      setVotedStops(nextVoted);
      try {
        window.localStorage.setItem(`trippilot:voted:${id}`, JSON.stringify(nextVoted));
      } catch {
        // ignore
      }
    } finally {
      setVotingKey('');
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-4xl items-center justify-center px-6">
        <LoaderCircle className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-3xl">Trip not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This shared itinerary link is invalid or was deleted by its owner.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Plan a new trip</Link>
        </Button>
      </main>
    );
  }

  const mapPlaces = trip.itinerary.flatMap((day) =>
    day.stops.map((s) => ({
      name: s.name,
      type: s.category,
      hours: s.duration,
      lat: s.coordinates.lat,
      lng: s.coordinates.lng,
      cost: s.cost,
      startTime: s.startTime,
    })),
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs uppercase text-primary">Shared TripPilot Itinerary · Group Voting</p>
          <h1 className="mt-2 font-display text-4xl">
            {trip.numberOfDays}-Day {trip.destination} Plan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Budget: ₹{trip.budget.toLocaleString('en-IN')} · Vote 👍 or 👎 on stops with your group
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">Plan your own trip</Link>
        </Button>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {trip.itinerary.map((day) => (
            <section key={day.dayNumber} className="neu-raised rounded-2xl p-6">
              <h2 className="font-display text-2xl">
                Day {day.dayNumber} <span className="font-mono text-xs text-muted-foreground">({day.date})</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                ₹{day.totalCost.toLocaleString('en-IN')} · {day.totalTravelTime} min travel
              </p>
              <ol className="mt-4 space-y-3">
                {day.stops.map((stop, idx) => {
                  const key = `${day.dayNumber}::${stop.attractionId}`;
                  const myVote = votedStops[key];
                  const up = stop.votes?.up ?? 0;
                  const down = stop.votes?.down ?? 0;

                  return (
                    <li
                      key={`${day.dayNumber}-${stop.attractionId}-${idx}`}
                      onClick={() => setSelectedPlaceName(stop.name)}
                      className="cursor-pointer rounded-lg border border-border p-3.5 hover:border-primary/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">
                          {stop.startTime} · {stop.name}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock3 className="size-3" /> {stop.duration}h · ₹{stop.cost} · Open{' '}
                          {formatTime24(stop.openingHours.open)}–{formatTime24(stop.openingHours.close)}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={stop.instagramSearchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            Explore on Instagram <ExternalLink className="size-3" />
                          </a>
                          {stop.travelToNext && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Navigation className="size-3" /> Next: {stop.travelToNext.distanceKm} km (~
                              {stop.travelToNext.minutes} min)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            type="button"
                            size="sm"
                            variant={myVote === 'up' ? 'default' : 'outline'}
                            disabled={Boolean(myVote) || votingKey === key}
                            onClick={() => void handleVote(day.dayNumber, stop.attractionId, 'up')}
                            className="h-7 gap-1 px-2 text-xs"
                          >
                            <ThumbsUp className="size-3" />
                            {up}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={myVote === 'down' ? 'destructive' : 'outline'}
                            disabled={Boolean(myVote) || votingKey === key}
                            onClick={() => void handleVote(day.dayNumber, stop.attractionId, 'down')}
                            className="h-7 gap-1 px-2 text-xs"
                          >
                            <ThumbsDown className="size-3" />
                            {down}
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24">
          <DestinationMap
            city={trip.destination}
            center={trip.center}
            places={mapPlaces}
            selectedPlaceName={selectedPlaceName}
            onSelectPlace={setSelectedPlaceName}
          />
        </aside>
      </div>
    </main>
  );
}
