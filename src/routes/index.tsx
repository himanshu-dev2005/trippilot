import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  MapPin,
  CalendarDays,
  Sparkles,
  Clock3,
  Download,
  LoaderCircle,
  Compass,
  IndianRupee,
  RefreshCw,
  CloudRain,
  Bookmark,
  Trash2,
  ExternalLink,
  Heart,
  Navigation,
  ArrowUp,
  ArrowDown,
  Share2,
  CheckSquare,
  Car,
  Hotel,
} from 'lucide-react';
import {
  adjustTripWeather,
  deleteTripFromMongo,
  generateOptimizedTrip,
  getSavedTripsFromMongo,
  regenerateTripDay,
  replanTripBudget,
  saveTripToMongo,
  type TripRecord,
} from '@/lib/trips';
import {
  formatTime24,
  generatePackingChecklist,
  moveStopBetweenDays,
  removeStopFromDay,
  reorderStopInDay,
  TRANSPORT_CONFIG,
  type AttractionCandidate,
  type Coordinates,
  type ItineraryDay,
  type StartPoint,
  type TransportMode,
} from '@/lib/optimizer';
import { useAccount } from '@/components/AuthProvider';
import { DestinationMap } from '@/components/DestinationMap';
import { BudgetBreakdownChart } from '@/components/BudgetBreakdownChart';
import { StopPhoto } from '@/components/StopPhoto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const INTEREST_OPTIONS = [
  'Culture & Heritage',
  'Nature & Parks',
  'Food & Cafés',
  'History & Forts',
  'Adventure & Treks',
  'Shopping & Markets',
  'Spiritual & Temples',
  'Museums & Art',
] as const;

const QUICK_CITIES = ['Dehradun', 'Jaipur', 'Goa', 'Manali', 'Udaipur', 'Varanasi', 'Rishikesh', 'Kochi'];
const FAVOURITES_KEY = 'trippilot:favourites';

type ActiveTripState = {
  tripId?: string | undefined;
  destination: string;
  center: Coordinates;
  budget: number;
  numberOfDays: number;
  interests: string[];
  transportMode: TransportMode;
  startPoint?: StartPoint | undefined;
  itinerary: ItineraryDay[];
  candidates: AttractionCandidate[];
  totalCost: number;
  remainingBudget: number;
  weatherConfigured: boolean;
  source?: string;
};

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'TripPilot — Intelligent Travel Itinerary Planner' },
      {
        name: 'description',
        content:
          'Plan personalized day-wise trips with smart neighborhood grouping, route planning, budget & weather adaptation, and saved itineraries.',
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAccount();

  const [destination, setDestination] = useState('Dehradun');
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [budget, setBudget] = useState(5000);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [transportMode, setTransportMode] = useState<TransportMode>('cab');
  const [startPointQuery, setStartPointQuery] = useState('');
  const [interests, setInterests] = useState<string[]>(['Culture & Heritage', 'Nature & Parks']);

  const [loading, setLoading] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [trip, setTrip] = useState<ActiveTripState | null>(null);
  const [activeDayTab, setActiveDayTab] = useState<number | 'all'>('all');
  const [budgetDraft, setBudgetDraft] = useState('5000');
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [checkedPacking, setCheckedPacking] = useState<Record<string, boolean>>({});

  const [savedTrips, setSavedTrips] = useState<TripRecord[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FAVOURITES_KEY);
      if (saved) setFavourites(JSON.parse(saved) as string[]);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedTrips([]);
      return;
    }
    void getSavedTripsFromMongo()
      .then((res) => setSavedTrips(res.trips))
      .catch(() => {});
  }, [user]);

  function toggleFavourite(dest: string, placeName: string) {
    const key = `${dest}::${placeName}`;
    setFavourites((prev) => {
      const next = prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key];
      try {
        window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    );
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!destination.trim()) return;
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const res = await generateOptimizedTrip({
        data: {
          destination: destination.trim(),
          numberOfDays,
          budget: Number(budget) || 0,
          interests,
          startDate,
          transportMode,
          ...(startPointQuery.trim() ? { startPointQuery: startPointQuery.trim() } : {}),
        },
      });
      setTrip({
        destination: res.destination,
        center: res.center,
        budget: Number(budget) || 0,
        numberOfDays,
        interests,
        transportMode: res.transportMode,
        startPoint: res.startPoint,
        itinerary: res.itinerary,
        candidates: res.candidates,
        totalCost: res.totalCost,
        remainingBudget: res.remainingBudget,
        weatherConfigured: res.weatherConfigured,
        source: res.source,
      });
      setBudgetDraft(String(budget));
      setActiveDayTab('all');
      setCheckedPacking({});
      setSelectedPlaceName(res.itinerary[0]?.stops[0]?.name ?? null);
      requestAnimationFrame(() =>
        document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate itinerary.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerateDay(dayNumber: number) {
    if (!trip) return;
    setBusyAction(`regen-${dayNumber}`);
    setError('');
    try {
      const res = await regenerateTripDay({
        data: {
          destination: trip.destination,
          currentItinerary: trip.itinerary,
          dayNumber,
          allCandidates: trip.candidates,
          totalBudget: trip.budget,
          transportMode: trip.transportMode,
          startPoint: trip.startPoint,
        },
      });
      setTrip({ ...trip, itinerary: res.itinerary, totalCost: res.totalCost, remainingBudget: res.remainingBudget });
      setNotice(`Day ${dayNumber} regenerated without changing other days.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not regenerate day.');
    } finally {
      setBusyAction('');
    }
  }

  async function handleBudgetReplan() {
    if (!trip) return;
    const nextBudget = Math.max(0, Number(budgetDraft) || 0);
    setBusyAction('budget');
    setError('');
    try {
      const res = await replanTripBudget({
        data: {
          destination: trip.destination,
          currentItinerary: trip.itinerary,
          allCandidates: trip.candidates,
          newBudget: nextBudget,
          transportMode: trip.transportMode,
          startPoint: trip.startPoint,
        },
      });
      setTrip({
        ...trip,
        budget: nextBudget,
        itinerary: res.itinerary,
        totalCost: res.totalCost,
        remainingBudget: res.remainingBudget,
      });
      setNotice(`Re-planned itinerary for ₹${nextBudget.toLocaleString('en-IN')} budget.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not re-plan budget.');
    } finally {
      setBusyAction('');
    }
  }

  async function handleWeatherAdjust() {
    if (!trip) return;
    setBusyAction('weather');
    setError('');
    try {
      const res = await adjustTripWeather({
        data: {
          destination: trip.destination,
          currentItinerary: trip.itinerary,
          allCandidates: trip.candidates,
          totalBudget: trip.budget,
          transportMode: trip.transportMode,
          startPoint: trip.startPoint,
        },
      });
      setTrip({ ...trip, itinerary: res.itinerary, totalCost: res.totalCost, remainingBudget: res.remainingBudget });
      setNotice('Outdoor stops on rainy days were swapped for indoor alternatives.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not apply weather adjustment.');
    } finally {
      setBusyAction('');
    }
  }

  function handleReorderStop(dayNumber: number, fromIndex: number, toIndex: number) {
    if (!trip) return;
    const res = reorderStopInDay({
      destination: trip.destination,
      currentItinerary: trip.itinerary,
      dayNumber,
      fromIndex,
      toIndex,
      totalBudget: trip.budget,
      transportMode: trip.transportMode,
      ...(trip.startPoint ? { startPoint: trip.startPoint } : {}),
    });
    setTrip({ ...trip, itinerary: res.itinerary, totalCost: res.totalCost, remainingBudget: res.remainingBudget });
  }

  function handleRemoveStop(dayNumber: number, attractionId: string) {
    if (!trip) return;
    const res = removeStopFromDay({
      destination: trip.destination,
      currentItinerary: trip.itinerary,
      dayNumber,
      attractionId,
      totalBudget: trip.budget,
      transportMode: trip.transportMode,
      ...(trip.startPoint ? { startPoint: trip.startPoint } : {}),
    });
    setTrip({ ...trip, itinerary: res.itinerary, totalCost: res.totalCost, remainingBudget: res.remainingBudget });
  }

  function handleMoveStop(fromDay: number, toDay: number, attractionId: string) {
    if (!trip) return;
    const res = moveStopBetweenDays({
      destination: trip.destination,
      currentItinerary: trip.itinerary,
      fromDay,
      toDay,
      attractionId,
      totalBudget: trip.budget,
      transportMode: trip.transportMode,
      ...(trip.startPoint ? { startPoint: trip.startPoint } : {}),
    });
    setTrip({ ...trip, itinerary: res.itinerary, totalCost: res.totalCost, remainingBudget: res.remainingBudget });
  }

  async function handleSaveTrip() {
    if (!trip) return;
    setBusyAction('save');
    setError('');
    setNotice('');
    try {
      const { tripId } = await saveTripToMongo({
        data: {
          tripId: trip.tripId,
          destination: trip.destination,
          center: trip.center,
          budget: trip.budget,
          numberOfDays: trip.numberOfDays,
          interests: trip.interests,
          transportMode: trip.transportMode,
          startPoint: trip.startPoint,
          itinerary: trip.itinerary,
          candidates: trip.candidates,
          weatherConfigured: trip.weatherConfigured,
        },
      });
      setTrip({ ...trip, tripId });
      setNotice('Trip saved to your MongoDB account.');
      const refreshed = await getSavedTripsFromMongo();
      setSavedTrips(refreshed.trips);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save trip.');
    } finally {
      setBusyAction('');
    }
  }

  async function handleShareTrip() {
    if (!trip?.tripId) return;
    const shareUrl = `${window.location.origin}/trips/${trip.tripId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice(`Share link copied: ${shareUrl}`);
    } catch {
      setNotice(`Shareable link: ${shareUrl}`);
    }
  }

  function handleLoadSavedTrip(saved: TripRecord) {
    const totalCost = saved.itinerary.reduce((s, d) => s + d.totalCost, 0);
    setTrip({
      tripId: saved._id,
      destination: saved.destination,
      center: saved.center,
      budget: saved.budget,
      numberOfDays: saved.numberOfDays,
      interests: saved.interests,
      transportMode: saved.transportMode ?? 'cab',
      startPoint: saved.startPoint,
      itinerary: saved.itinerary,
      candidates: saved.candidates,
      totalCost,
      remainingBudget: saved.budget - totalCost,
      weatherConfigured: saved.weatherConfigured,
    });
    setBudgetDraft(String(saved.budget));
    setActiveDayTab('all');
    setSelectedPlaceName(saved.itinerary[0]?.stops[0]?.name ?? null);
    setNotice(`Loaded saved trip to ${saved.destination}.`);
  }

  async function handleDeleteSavedTrip(tripId: string) {
    try {
      await deleteTripFromMongo({ data: { tripId } });
      setSavedTrips((prev) => prev.filter((t) => t._id !== tripId));
      if (trip?.tripId === tripId) setTrip({ ...trip, tripId: undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete trip.');
    }
  }

  const displayedDays = useMemo(() => {
    if (!trip) return [];
    if (activeDayTab === 'all') return trip.itinerary;
    return trip.itinerary.filter((d) => d.dayNumber === activeDayTab);
  }, [trip, activeDayTab]);

  const mapPlaces = useMemo(() => {
    return displayedDays.flatMap((day) =>
      day.stops.map((s) => ({
        name: s.name,
        type: s.category,
        hours: s.duration,
        lat: s.coordinates.lat,
        lng: s.coordinates.lng,
        cost: s.cost,
        startTime: s.startTime,
        ...(s.travelToNext ? { travelMinutesToNext: s.travelToNext.minutes } : {}),
        ...(s.note ? { note: s.note } : {}),
      })),
    );
  }, [displayedDays]);

  const packingChecklist = useMemo(
    () => (trip ? generatePackingChecklist(trip.itinerary) : []),
    [trip],
  );

  const hasAnyRainAlert = trip?.itinerary.some((d) => d.hasRainAlert) ?? false;

  return (
    <main className="bg-background pb-16">
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-6">
        <p className="font-mono text-xs uppercase text-primary">
          Smart Day Grouping · Route Planning · Budget &amp; Weather Aware
        </p>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">
          Intelligent Travel Itinerary Planner
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Enter a destination, trip length, budget, and interests. TripPilot groups nearby attractions by day, minimizes travel time, and adapts to opening hours, budget, and weather.
        </p>
      </section>

      <section id="destinations" className="no-print mx-auto max-w-6xl scroll-mt-24 px-6">
        <form onSubmit={handleGenerate} className="space-y-5 border-y border-border py-6">
          <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_120px_135px_145px_auto]">
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                Destination
              </Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Dehradun, Jaipur, Goa..."
                required
                className="h-11 bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="days" className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                Days
              </Label>
              <Select value={String(numberOfDays)} onValueChange={(v) => setNumberOfDays(Number(v))}>
                <SelectTrigger id="days" className="h-11 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} day{d === 1 ? '' : 's'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center gap-2">
                <IndianRupee className="size-4 text-primary" />
                Budget (₹)
              </Label>
              <Input
                id="budget"
                type="number"
                min={0}
                step={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
                className="h-11 bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11 bg-card"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !destination.trim()}
              className="h-11 bg-accent px-6 text-accent-foreground hover:bg-accent/90"
            >
              {loading ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
              {loading ? 'Planning...' : 'Generate itinerary'}
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startPoint" className="flex items-center gap-2 text-xs text-muted-foreground">
                <Hotel className="size-3.5 text-primary" />
                Hotel / Starting point (optional, for round-trip routing)
              </Label>
              <Input
                id="startPoint"
                value={startPointQuery}
                onChange={(e) => setStartPointQuery(e.target.value)}
                placeholder="e.g. Clock Tower, Railway Station, Hotel..."
                className="h-10 bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportMode" className="flex items-center gap-2 text-xs text-muted-foreground">
                <Car className="size-3.5 text-primary" />
                Local transport mode
              </Label>
              <Select value={transportMode} onValueChange={(v) => setTransportMode(v as TransportMode)}>
                <SelectTrigger id="transportMode" className="h-10 bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRANSPORT_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      {cfg.label} (~{cfg.speedKmh} km/h · ₹{cfg.costPerKm}/km)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((option) => {
                const active = interests.includes(option);
                return (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={active ? 'default' : 'outline'}
                    aria-pressed={active}
                    onClick={() => toggleInterest(option)}
                    className="h-8 rounded-full text-xs"
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Quick cities:</span>
            {QUICK_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setDestination(c)}
                className={`rounded-full border px-2.5 py-0.5 transition-colors ${
                  destination.trim().toLowerCase() === c.toLowerCase()
                    ? 'border-primary bg-secondary text-foreground'
                    : 'border-border hover:border-primary/60'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mt-4 rounded-lg border border-primary/30 bg-secondary p-3.5 text-sm text-foreground">
            {notice}
          </div>
        )}
      </section>

      {savedTrips.length > 0 && (
        <section className="no-print mx-auto max-w-6xl px-6 pt-6">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Your Saved Trips (MongoDB)
          </h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {savedTrips.map((saved) => (
              <div
                key={saved._id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <button
                  type="button"
                  onClick={() => handleLoadSavedTrip(saved)}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {saved.destination} · {saved.numberOfDays}d (₹{saved.budget.toLocaleString('en-IN')})
                </button>
                {saved._id && (
                  <button
                    type="button"
                    aria-label={`Delete ${saved.destination} trip`}
                    onClick={() => void handleDeleteSavedTrip(saved._id!)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!trip && !loading && (
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 pt-10">
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <Compass className="mx-auto size-10 text-primary" />
            <h2 className="mt-4 font-display text-2xl">Plan Smarter, Travel Better</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Pick a city, your budget, and what you love to do — we’ll group nearby sights into balanced days, minimize transit, and factor in opening hours and weather forecasts.
            </p>
          </div>
        </section>
      )}

      {trip && (
        <section id="plan" className="mx-auto max-w-6xl scroll-mt-24 px-6 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase text-primary">
                Trip Plan · {trip.destination} · {TRANSPORT_CONFIG[trip.transportMode].label}
                {trip.startPoint ? ` · From ${trip.startPoint.name}` : ''}
              </p>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl">
                {trip.numberOfDays}-Day {trip.destination} Plan
              </h2>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2">
              {user ? (
                <Button
                  type="button"
                  variant="default"
                  disabled={busyAction === 'save'}
                  onClick={() => void handleSaveTrip()}
                  className="gap-1.5"
                >
                  <Bookmark className="size-4" />
                  {trip.tripId ? 'Update saved trip' : 'Save trip'}
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/auth">Sign in to save trip</Link>
                </Button>
              )}
              {trip.tripId && (
                <Button type="button" variant="outline" onClick={() => void handleShareTrip()} className="gap-1.5">
                  <Share2 className="size-4" />
                  Share link
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => window.print()} className="gap-1.5">
                <Download className="size-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="block text-xs text-muted-foreground">Total Budget</span>
                <span className="font-mono text-base font-medium">₹{trip.budget.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">Estimated Cost (incl. transit)</span>
                <span className="font-mono text-base font-medium text-primary">
                  ₹{trip.totalCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">Remaining</span>
                <span className="font-mono text-base font-medium">
                  ₹{trip.remainingBudget.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="no-print flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={100}
                aria-label="New budget"
                value={budgetDraft}
                onChange={(e) => setBudgetDraft(e.target.value)}
                className="h-9 w-32 bg-background"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busyAction === 'budget'}
                onClick={() => void handleBudgetReplan()}
              >
                {busyAction === 'budget' ? 'Re-planning...' : 'Re-plan budget'}
              </Button>
            </div>
          </div>

          {hasAnyRainAlert && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
              <div className="flex items-center gap-2.5">
                <CloudRain className="size-5 shrink-0 text-amber-600" />
                <span>
                  Rain is forecast on at least one day of your trip. Swap outdoor stops on affected days for indoor alternatives.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busyAction === 'weather'}
                onClick={() => void handleWeatherAdjust()}
                className="no-print"
              >
                {busyAction === 'weather' ? 'Adjusting...' : 'Adjust for weather'}
              </Button>
            </div>
          )}

          <div className="no-print mt-6 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={activeDayTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveDayTab('all')}
            >
              All Days
            </Button>
            {trip.itinerary.map((day) => (
              <Button
                key={day.dayNumber}
                type="button"
                size="sm"
                variant={activeDayTab === day.dayNumber ? 'default' : 'outline'}
                onClick={() => setActiveDayTab(day.dayNumber)}
              >
                Day {day.dayNumber} ({day.stops.length})
              </Button>
            ))}
          </div>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-8">
              {displayedDays.map((day) => (
                <section key={day.dayNumber} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <h3 className="font-display text-2xl">
                        Day {day.dayNumber}{' '}
                        <span className="font-mono text-xs font-normal text-muted-foreground">({day.date})</span>
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ₹{day.totalCost.toLocaleString('en-IN')} (Activities ₹{day.activityCost.toLocaleString('en-IN')} + Transit ₹
                        {day.transitCost.toLocaleString('en-IN')}) · {day.totalTravelTime} min travel · Weather: {day.weatherSummary}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busyAction === `regen-${day.dayNumber}`}
                      onClick={() => void handleRegenerateDay(day.dayNumber)}
                      className="no-print gap-1.5"
                    >
                      <RefreshCw className={`size-3.5 ${busyAction === `regen-${day.dayNumber}` ? 'animate-spin' : ''}`} />
                      Regenerate day
                    </Button>
                  </div>

                  {day.stops.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                      No stops fit within the remaining budget and opening hours for this day.
                    </p>
                  ) : (
                    <ol className="mt-4 space-y-4">
                      {day.stops.map((stop, idx) => {
                        const isFav = favourites.includes(`${trip.destination}::${stop.name}`);
                        const isSelected = selectedPlaceName === stop.name;
                        const globalNumber =
                          mapPlaces.findIndex((p) => p.name === stop.name) + 1 || idx + 1;

                        return (
                          <li
                            key={`${day.dayNumber}-${stop.attractionId}-${idx}`}
                            onClick={() => setSelectedPlaceName(stop.name)}
                            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                              isSelected ? 'border-primary bg-secondary/40' : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                              <StopPhoto
                                name={stop.name}
                                category={stop.category}
                                {...(stop.photoReference ? { photoReference: stop.photoReference } : {})}
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">
                                      {globalNumber}
                                    </span>
                                    <h4 className="font-display text-lg text-foreground">{stop.name}</h4>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                                    className="no-print shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavourite(trip.destination, stop.name);
                                    }}
                                  >
                                    <Heart className={`size-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
                                  </Button>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <span className="font-mono text-primary">{stop.startTime}</span>
                                  <span>{stop.category}</span>
                                  <span>{stop.isOutdoor ? 'Outdoor' : 'Indoor'}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock3 className="size-3" />
                                    {stop.duration}h
                                  </span>
                                  <span>₹{stop.cost}</span>
                                  <span>
                                    Open {formatTime24(stop.openingHours.open)}–{formatTime24(stop.openingHours.close)}
                                  </span>
                                </div>

                                {stop.note && <p className="mt-2 text-sm text-muted-foreground">{stop.note}</p>}

                                <div className="no-print mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <a
                                      href={stop.instagramSearchUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1 text-primary hover:underline"
                                    >
                                      Explore on Instagram
                                      <ExternalLink className="size-3" />
                                    </a>
                                    {stop.travelToNext && (
                                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                                        <Navigation className="size-3" />
                                        Next: {stop.travelToNext.distanceKm} km (~{stop.travelToNext.minutes} min · ₹
                                        {stop.travelToNext.cost})
                                      </span>
                                    )}
                                  </div>

                                  <div
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-7"
                                      disabled={idx === 0}
                                      aria-label="Move stop up"
                                      onClick={() => handleReorderStop(day.dayNumber, idx, idx - 1)}
                                    >
                                      <ArrowUp className="size-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-7"
                                      disabled={idx === day.stops.length - 1}
                                      aria-label="Move stop down"
                                      onClick={() => handleReorderStop(day.dayNumber, idx, idx + 1)}
                                    >
                                      <ArrowDown className="size-3.5" />
                                    </Button>
                                    {trip.itinerary.length > 1 && (
                                      <select
                                        aria-label="Move to day"
                                        value={day.dayNumber}
                                        onChange={(e) =>
                                          handleMoveStop(day.dayNumber, Number(e.target.value), stop.attractionId)
                                        }
                                        className="h-7 rounded border border-border bg-background px-1.5 text-xs"
                                      >
                                        {trip.itinerary.map((d) => (
                                          <option key={d.dayNumber} value={d.dayNumber}>
                                            Day {d.dayNumber}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-7 text-muted-foreground hover:text-destructive"
                                      aria-label="Remove stop"
                                      onClick={() => handleRemoveStop(day.dayNumber, stop.attractionId)}
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              ))}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="no-print">
                <DestinationMap
                  city={trip.destination}
                  center={trip.center}
                  places={mapPlaces}
                  selectedPlaceName={selectedPlaceName}
                  onSelectPlace={setSelectedPlaceName}
                />
              </div>

              <BudgetBreakdownChart itinerary={trip.itinerary} />

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-primary" />
                  <h3 className="font-display text-lg">Packing Checklist</h3>
                </div>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {packingChecklist.map((item) => {
                    const checked = Boolean(checkedPacking[item.id]);
                    return (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setCheckedPacking((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                            }
                            className="mt-1 accent-primary"
                          />
                          <span className={checked ? 'line-through text-muted-foreground' : ''}>
                            <span className="block font-medium">{item.label}</span>
                            <span className="block text-xs text-muted-foreground">{item.reason}</span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      )}
    </main>
  );
}
