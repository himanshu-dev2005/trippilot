import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Clock3, ExternalLink, LoaderCircle, Navigation } from 'lucide-react';
import { getPublicTripById, type TripRecord } from '@/lib/trips';
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

  useEffect(() => {
    void getPublicTripById({ data: { tripId: id } })
      .then((res) => {
        setTrip(res.trip);
        setSelectedPlaceName(res.trip?.itinerary[0]?.stops[0]?.name ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

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
          <p className="font-mono text-xs uppercase text-primary">Shared TripPilot Itinerary</p>
          <h1 className="mt-2 font-display text-4xl">
            {trip.numberOfDays}-Day {trip.destination} Plan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Budget: ₹{trip.budget.toLocaleString('en-IN')}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">Plan your own trip</Link>
        </Button>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {trip.itinerary.map((day) => (
            <section key={day.dayNumber} className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-2xl">
                Day {day.dayNumber} <span className="font-mono text-xs text-muted-foreground">({day.date})</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                ₹{day.totalCost.toLocaleString('en-IN')} · {day.totalTravelTime} min travel
              </p>
              <ol className="mt-4 space-y-3">
                {day.stops.map((stop, idx) => (
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
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <a
                        href={stop.instagramSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
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
                  </li>
                ))}
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
