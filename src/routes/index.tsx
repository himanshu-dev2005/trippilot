import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo, type FormEvent } from 'react';
import {
  ArrowRight,
  SlidersHorizontal,
  Star,
  LocateFixed,
  CloudSun,
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
  Hotel,
  Users,
  CalendarPlus,
  Plus,
  Route as RouteIcon,
} from 'lucide-react';
import {
  adjustTripWeather,
  deleteTripFromMongo,
  generateOptimizedTrip,
  getPublicTripById,
  getSavedTripsFromMongo,
  regenerateTripDay,
  replanTripBudget,
  reverseGeocodeCity,
  saveTripToMongo,
  searchCustomPlace,
  type TripRecord,
} from '@/lib/trips';
import { getMongoProfile, toggleMongoFavourite } from '@/lib/profile';
import {
  addStopToDay,
  formatTime24,
  generateIcsCalendar,
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

const QUICK_PROMPTS = [
  { label: '4 Days in Jaipur Forts', city: 'Jaipur', days: 4, interests: ['History & Forts', 'Culture & Heritage'] },
  { label: '3 Days in Varanasi & Ghats', city: 'Varanasi', days: 3, interests: ['Spiritual & Temples', 'Culture & Heritage'] },
  { label: '5 Days Kerala Backwaters', city: 'Alleppey', days: 5, interests: ['Nature & Parks', 'Food & Cafés'] },
  { label: '3 Days in Dehradun', city: 'Dehradun', days: 3, interests: ['Nature & Parks', 'Culture & Heritage'] },
  { label: '4 Days Udaipur Lakes', city: 'Udaipur', days: 4, interests: ['History & Forts', 'Culture & Heritage'] },
];

const FEATURED_CIRCUITS = [
  { city: 'Jaipur', title: 'Jaipur, Rajasthan', region: 'RAJASTHAN', days: 4, rating: '4.9' },
  { city: 'Varanasi', title: 'Varanasi, Uttar Pradesh', region: 'UTTAR PRADESH', days: 3, rating: '4.9' },
  { city: 'Alleppey', title: 'Alleppey & Munnar, Kerala', region: 'KERALA', days: 5, rating: '4.9' },
  { city: 'Dehradun', title: 'Dehradun, Uttarakhand', region: 'UTTARAKHAND', days: 3, rating: '4.8' },
  { city: 'Manali', title: 'Manali, Himachal Pradesh', region: 'HIMACHAL PRADESH', days: 4, rating: '4.8' },
  { city: 'Goa', title: 'North & South Goa', region: 'GOA', days: 4, rating: '4.9' },
];
const FAVOURITES_KEY = 'trippilot:favourites';

type ActiveTripState = {
  tripId?: string | undefined;
  destination: string;
  center: Coordinates;
  budget: number;
  numberOfDays: number;
  travelers: number;
  interests: string[];
  transportMode: TransportMode;
  startPoint?: StartPoint | undefined;
  itinerary: ItineraryDay[];
  candidates: AttractionCandidate[];
  totalCost: number;
  remainingBudget: number;
  distanceSavedKm?: number | undefined;
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
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [transportMode, setTransportMode] = useState<TransportMode>('cab');
  const [startPointQuery, setStartPointQuery] = useState('');
  const [interests, setInterests] = useState<string[]>(['Culture & Heritage', 'Nature & Parks']);

  const [loading, setLoading] = useState(false);
  const [locatingCity, setLocatingCity] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showWeatherPanel, setShowWeatherPanel] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [trip, setTrip] = useState<ActiveTripState | null>(null);
  const [activeDayTab, setActiveDayTab] = useState<number | 'all'>('all');
  const [budgetDraft, setBudgetDraft] = useState('5000');
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [checkedPacking, setCheckedPacking] = useState<Record<string, boolean>>({});
  const [customPlaceQuery, setCustomPlaceQuery] = useState('');
  const [customPlaceDay, setCustomPlaceDay] = useState(1);

  const [savedTrips, setSavedTrips] = useState<TripRecord[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FAVOURITES_KEY);
      if (saved) setFavourites(JSON.parse(saved) as string[]);
    } catch {
      // ignore
    }

    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    const tripIdParam = params.get('tripId');
    if (cityParam) setDestination(cityParam);
    if (tripIdParam) {
      void getPublicTripById({ data: { tripId: tripIdParam } })
        .then((res) => {
          if (res.trip) handleLoadSavedTrip(res.trip);
        })
        .catch(() => {});
    }

    if (!cityParam && !tripIdParam && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void reverseGeocodeCity({
            data: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          })
            .then((res) => {
              if (res.city) setDestination(res.city);
            })
            .catch(() => {});
        },
        () => {},
        { timeout: 6000 },
      );
    }
  }, []);

  function detectCurrentCity() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }
    setLocatingCity(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void reverseGeocodeCity({
          data: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        })
          .then((res) => {
            if (res.city) {
              setDestination(res.city);
              setNotice(`Detected your current location: ${res.city}`);
            } else {
              setError('Could not determine city name from your coordinates.');
            }
          })
          .catch(() => setError('Could not look up your city.'))
          .finally(() => setLocatingCity(false));
      },
      () => {
        setLocatingCity(false);
        setError('Location permission denied. Type a city name or allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  useEffect(() => {
    if (!user) {
      setSavedTrips([]);
      return;
    }
    void getSavedTripsFromMongo()
      .then((res) => setSavedTrips(res.trips))
      .catch(() => {});
    void getMongoProfile()
      .then(({ profile }) => {
        if (!profile) return;
        setBudget(profile.defaultBudget);
        setNumberOfDays(profile.defaultDays);
        setTransportMode(profile.defaultTransportMode);
        if (profile.defaultInterests.length) setInterests(profile.defaultInterests);
      })
      .catch(() => {});
  }, [user]);

  function toggleFavourite(
    dest: string,
    stop: { name: string; category: string; coordinates: Coordinates },
  ) {
    const key = `${dest}::${stop.name}`;
    setFavourites((prev) => {
      const next = prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key];
      try {
        window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    if (user) {
      void toggleMongoFavourite({
        data: {
          destination: dest,
          name: stop.name,
          category: stop.category,
          lat: stop.coordinates.lat,
          lng: stop.coordinates.lng,
        },
      }).catch(() => {});
    }
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
        travelers: Math.max(1, Number(travelers) || 1),
        interests,
        transportMode: res.transportMode,
        startPoint: res.startPoint,
        itinerary: res.itinerary,
        candidates: res.candidates,
        totalCost: res.totalCost,
        remainingBudget: res.remainingBudget,
        distanceSavedKm: res.distanceSavedKm,
        weatherConfigured: res.weatherConfigured,
        source: res.source,
      });
      setBudgetDraft(String(budget));
      setActiveDayTab('all');
      setCustomPlaceDay(1);
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

  async function handleAddCustomStop(e: FormEvent) {
    e.preventDefault();
    if (!trip || !customPlaceQuery.trim()) return;
    setBusyAction('custom-place');
    setError('');
    try {
      const { place } = await searchCustomPlace({
        data: { query: customPlaceQuery.trim(), destination: trip.destination },
      });
      if (!place) {
        setError(`Could not find "${customPlaceQuery}" in ${trip.destination}.`);
        return;
      }
      const res = addStopToDay({
        destination: trip.destination,
        currentItinerary: trip.itinerary,
        dayNumber: customPlaceDay,
        candidate: place,
        totalBudget: trip.budget,
        transportMode: trip.transportMode,
        ...(trip.startPoint ? { startPoint: trip.startPoint } : {}),
      });
      setTrip({
        ...trip,
        itinerary: res.itinerary,
        candidates: [...trip.candidates, place],
        totalCost: res.totalCost,
        remainingBudget: res.remainingBudget,
      });
      setCustomPlaceQuery('');
      setSelectedPlaceName(place.name);
      setNotice(`Added "${place.name}" to Day ${customPlaceDay}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add custom place.');
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

  function updateStopMeta(dayNumber: number, attractionId: string, patch: { userNote?: string; visited?: boolean }) {
    if (!trip) return;
    setTrip({
      ...trip,
      itinerary: trip.itinerary.map((d) =>
        d.dayNumber !== dayNumber
          ? d
          : {
              ...d,
              stops: d.stops.map((s) => (s.attractionId === attractionId ? { ...s, ...patch } : s)),
            },
      ),
    });
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
          travelers: trip.travelers,
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

  function handleExportIcs() {
    if (!trip) return;
    const ics = generateIcsCalendar(trip.destination, trip.itinerary);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-itinerary.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLoadSavedTrip(saved: TripRecord) {
    const totalCost = saved.itinerary.reduce((s, d) => s + d.totalCost, 0);
    setTrip({
      tripId: saved._id,
      destination: saved.destination,
      center: saved.center,
      budget: saved.budget,
      numberOfDays: saved.numberOfDays,
      travelers: saved.travelers ?? 1,
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

  const totalActivityCost = trip ? trip.itinerary.reduce((s, d) => s + d.activityCost, 0) : 0;
  const totalTransitCost = trip ? trip.itinerary.reduce((s, d) => s + d.transitCost, 0) : 0;
  const groupTotalCost = trip
    ? totalActivityCost * trip.travelers +
      (trip.transportMode === 'cab' ? totalTransitCost : totalTransitCost * trip.travelers)
    : 0;
  const costPerPerson = trip ? Math.round(groupTotalCost / Math.max(1, trip.travelers)) : 0;

  return (
    <main className="bg-background pb-24">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.16),transparent_65%)]" />
        <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            TRIP PLANNER FOR INDIA
          </div>

          <h1 className="mt-7 font-display text-5xl leading-[1.05] tracking-tight text-foreground sm:text-7xl">
            Plan Your Dream Trip to India
            <br />
            in Seconds.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Tell TripPilot your destination, pacing, budget in ₹, and local interests. We sequence every hour with verified Indian coordinates and minimal transit.
          </p>

          <section id="destinations" className="no-print mx-auto mt-10 max-w-3xl scroll-mt-24 text-left">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-2xl shadow-black/40 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Sparkles className="size-4 shrink-0 text-primary" />
                  <Input
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter an Indian city (e.g. Jaipur, Varanasi, Dehradun, Goa...)"
                    required
                    className="h-11 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={detectCurrentCity}
                    disabled={locatingCity}
                    title="Use my current location"
                    aria-label="Use my current location"
                    className="h-11 w-10 text-muted-foreground hover:text-primary"
                  >
                    {locatingCity ? <LoaderCircle className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOptions((v) => !v)}
                    className="h-11 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    {numberOfDays}d · ₹{budget.toLocaleString('en-IN')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !destination.trim()}
                    className="h-11 rounded-lg bg-primary px-5 font-mono text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? <LoaderCircle className="animate-spin" /> : null}
                    {loading ? 'PLANNING...' : 'GENERATE TRIP'}
                    {!loading && <ArrowRight className="size-4" />}
                  </Button>
                </div>
              </div>

              {showOptions && (
                <div className="space-y-5 rounded-xl border border-border bg-card p-6 text-left shadow-xl">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="days" className="text-xs text-muted-foreground">Days</Label>
                      <Select value={String(numberOfDays)} onValueChange={(v) => setNumberOfDays(Number(v))}>
                        <SelectTrigger id="days" className="h-10 bg-background">
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
                      <Label htmlFor="budget" className="text-xs text-muted-foreground">Budget (₹)</Label>
                      <Input
                        id="budget"
                        type="number"
                        min={0}
                        step={100}
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="h-10 bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="travelers" className="text-xs text-muted-foreground">Travelers</Label>
                      <Input
                        id="travelers"
                        type="number"
                        min={1}
                        max={20}
                        value={travelers}
                        onChange={(e) => setTravelers(Math.max(1, Number(e.target.value) || 1))}
                        className="h-10 bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-xs text-muted-foreground">Start date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-10 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startPoint" className="text-xs text-muted-foreground">
                      Hotel / Starting point (optional)
                    </Label>
                    <Input
                      id="startPoint"
                      value={startPointQuery}
                      onChange={(e) => setStartPointQuery(e.target.value)}
                      placeholder="e.g. Clock Tower, Railway Station..."
                      className="h-10 bg-background"
                    />
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
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                <span className="font-mono text-[11px] uppercase tracking-wider">TRY:</span>
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => {
                      setDestination(q.city);
                      setNumberOfDays(q.days);
                      setInterests(q.interests);
                    }}
                    className={`rounded-full border px-3 py-1 transition-colors ${
                      destination.trim().toLowerCase() === q.city.toLowerCase()
                        ? 'border-primary bg-primary/15 text-foreground'
                        : 'border-border bg-card/70 hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </form>

            {error && (
              <div role="alert" className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
            {notice && (
              <div role="status" className="mt-5 rounded-lg border border-primary/30 bg-card p-3.5 text-sm text-foreground">
                {notice}
              </div>
            )}
          </section>
        </div>
      </section>

      {savedTrips.length > 0 && (
        <section className="no-print mx-auto max-w-6xl px-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Your Saved Trips (MongoDB)
            </h2>
            <Link to="/trips" className="text-xs font-medium text-primary hover:underline">
              Manage all trips →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {savedTrips.slice(0, 5).map((saved) => (
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
        <div id="how-it-works" className="mx-auto max-w-6xl space-y-20 px-6 pt-16">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  Featured Circuits
                </p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl">Explore India</h2>
              </div>
              <Link
                to="/explore"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
              >
                VIEW ALL CIRCUITS →
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_CIRCUITS.map((c) => (
                <button
                  key={c.title}
                  type="button"
                  onClick={() => {
                    setDestination(c.city);
                    setNumberOfDays(c.days);
                    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
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
                      <span className="font-display italic text-muted-foreground">{c.title}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {c.region}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span>{c.days} DAYS</span>
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <Star className="size-3 fill-current" />
                        {c.rating}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl text-foreground group-hover:text-primary">
                      {c.title}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {trip && (
        <section id="plan" className="mx-auto max-w-6xl scroll-mt-24 px-6 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase text-primary">
                Trip Plan · {trip.destination}
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
                  <Link to="/auth">Sign in to save</Link>
                </Button>
              )}
              {trip.tripId && (
                <Button type="button" variant="outline" onClick={() => void handleShareTrip()} className="gap-1.5">
                  <Share2 className="size-4" />
                  Share
                </Button>
              )}
              <Button
                type="button"
                variant={showWeatherPanel ? 'default' : 'outline'}
                onClick={() => setShowWeatherPanel((v) => !v)}
                className="gap-1.5"
              >
                <CloudSun className="size-4" />
                Weather
              </Button>
              <Button type="button" variant="outline" onClick={handleExportIcs} className="gap-1.5">
                <CalendarPlus className="size-4" />
                Calendar (.ics)
              </Button>
              <Button type="button" variant="outline" onClick={() => window.print()} className="gap-1.5">
                <Download className="size-4" />
                PDF
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="block text-xs text-muted-foreground">Budget (per person)</span>
                <span className="font-mono text-base font-medium">₹{trip.budget.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">Per Person Est.</span>
                <span className="font-mono text-base font-medium text-primary">
                  ₹{costPerPerson.toLocaleString('en-IN')}
                </span>
              </div>
              {trip.travelers > 1 && (
                <div>
                  <span className="block text-xs text-muted-foreground">Group ({trip.travelers} travelers)</span>
                  <span className="font-mono text-base font-medium">
                    ₹{groupTotalCost.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-xs text-muted-foreground">Remaining</span>
                <span className="font-mono text-base font-medium">
                  ₹{trip.remainingBudget.toLocaleString('en-IN')}
                </span>
              </div>
              {trip.distanceSavedKm !== undefined && trip.distanceSavedKm > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-primary">
                  <RouteIcon className="size-4" />
                  Saved {trip.distanceSavedKm} km of travel
                </div>
              )}
            </div>

            <div className="no-print flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={100}
                aria-label="New budget"
                value={budgetDraft}
                onChange={(e) => setBudgetDraft(e.target.value)}
                className="h-9 w-28 bg-background"
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

          {showWeatherPanel && (
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CloudSun className="size-4 text-primary" />
                  <h3 className="font-mono text-xs uppercase tracking-wider text-foreground">
                    Live Weather Forecast
                  </h3>
                </div>
                {!trip.weatherConfigured && (
                  <span className="text-xs text-muted-foreground">
                    Add OPENWEATHER_API_KEY in Vercel to enable live forecasts
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {trip.itinerary.map((day) => (
                  <div
                    key={`wx-${day.dayNumber}`}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                      day.hasRainAlert
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {day.hasRainAlert ? (
                      <CloudRain className="size-3.5 text-amber-400" />
                    ) : (
                      <CloudSun className="size-3.5 text-primary" />
                    )}
                    <span className="font-mono text-foreground">Day {day.dayNumber}:</span>
                    <span>{day.weatherSummary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Add Custom Place Bar */}
          <form onSubmit={handleAddCustomStop} className="no-print mt-4 flex flex-wrap items-center gap-2">
            <Input
              value={customPlaceQuery}
              onChange={(e) => setCustomPlaceQuery(e.target.value)}
              placeholder={`Add a specific café, landmark or museum in ${trip.destination}...`}
              className="h-9 max-w-sm bg-card"
            />
            <select
              aria-label="Target day"
              value={customPlaceDay}
              onChange={(e) => setCustomPlaceDay(Number(e.target.value))}
              className="h-9 rounded-md border border-border bg-card px-2 text-xs"
            >
              {trip.itinerary.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={busyAction === 'custom-place' || !customPlaceQuery.trim()}
              className="gap-1"
            >
              <Plus className="size-3.5" />
              {busyAction === 'custom-place' ? 'Adding...' : 'Add stop'}
            </Button>
          </form>

          <div className="no-print mt-5 flex flex-wrap items-center gap-2">
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

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="space-y-10">
              {displayedDays.map((day) => (
                <section key={day.dayNumber} className="rounded-xl border border-border bg-card p-6 sm:p-7">
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
                              stop.visited
                                ? 'border-emerald-500/40 bg-emerald-500/5'
                                : isSelected
                                  ? 'border-primary bg-secondary/40'
                                  : 'border-border hover:border-primary/50'
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
                                    <h4 className={`font-display text-lg ${stop.visited ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                      {stop.name}
                                    </h4>
                                  </div>

                                  <div className="no-print flex items-center gap-1">
                                    <label className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-secondary">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(stop.visited)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) =>
                                          updateStopMeta(day.dayNumber, stop.attractionId, {
                                            visited: e.target.checked,
                                          })
                                        }
                                        className="accent-primary"
                                      />
                                      Visited
                                    </label>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                                      className="shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavourite(trip.destination, stop);
                                      }}
                                    >
                                      <Heart className={`size-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} />
                                    </Button>
                                  </div>
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

                                <div className="no-print mt-2" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    value={stop.userNote ?? ''}
                                    onChange={(e) =>
                                      updateStopMeta(day.dayNumber, stop.attractionId, {
                                        userNote: e.target.value,
                                      })
                                    }
                                    placeholder="Add personal note / ticket ref..."
                                    className="h-8 bg-background text-xs"
                                  />
                                </div>

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
