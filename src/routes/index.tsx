import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo, useCallback, useRef, type FormEvent } from 'react';
import {
  ArrowRight,
  SlidersHorizontal,
  Star,
  LocateFixed,
  CloudSun,
  Sun,
  Cloud,
  Droplets,
  Wind,
  MapPin,
  Clock3,
  Download,
  LoaderCircle,
  Compass,
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
  CalendarPlus,
  Plus,
  Minus,
  Route as RouteIcon,
  WifiOff,
  Utensils,
  AlertTriangle,
  Check,
  Car,
  TrainFront,
  Footprints,
  Wallet,
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
  findRouteFoodSuggestions,
  formatTime24,
  generateIcsCalendar,
  generateOfflinePocketPassHtml,
  generatePackingChecklist,
  getDayEnergyScore,
  getIndiaPracticalAlerts,
  getStopTimingInsight,
  moveStopBetweenDays,
  recalculateItineraryTransport,
  removeStopFromDay,
  reorderStopInDay,
  TRANSPORT_CONFIG,
  type AttractionCandidate,
  type Coordinates,
  type ItineraryDay,
  type StartPoint,
  type Stop,
  type TransportMode,
} from '@/lib/optimizer';
import { FEATURED_CIRCUITS, type FeaturedCircuit } from '@/lib/circuit-media';
import { useAccount } from '@/components/AuthProvider';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import { DestinationMap } from '@/components/DestinationMap';
import { BudgetBreakdownChart } from '@/components/BudgetBreakdownChart';
import { StopPhoto } from '@/components/StopPhoto';
import { PlaceDetailDialog } from '@/components/PlaceDetailDialog';
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
  { label: 'New Delhi · 3d', city: 'New Delhi', days: 3, budget: 6000, interests: ['History & Forts', 'Culture & Heritage', 'Food & Cafés'] },
  { label: 'Jaipur · 4d', city: 'Jaipur', days: 4, budget: 8000, interests: ['History & Forts', 'Culture & Heritage'] },
  { label: 'Varanasi · 3d', city: 'Varanasi', days: 3, budget: 5000, interests: ['Spiritual & Temples', 'Culture & Heritage'] },
  { label: 'Dehradun · 3d', city: 'Dehradun', days: 3, budget: 5000, interests: ['Nature & Parks', 'Culture & Heritage'] },
  { label: 'Udaipur · 4d', city: 'Udaipur', days: 4, budget: 8500, interests: ['History & Forts', 'Culture & Heritage'] },
  { label: 'Alleppey · 5d', city: 'Alleppey', days: 5, budget: 10000, interests: ['Nature & Parks', 'Food & Cafés'] },
];

const TRANSPORT_OPTIONS: Array<{ mode: TransportMode; label: string; icon: typeof Car }> = [
  { mode: 'cab', label: 'Cab / Auto', icon: Car },
  { mode: 'transit', label: 'Transit', icon: TrainFront },
  { mode: 'walking', label: 'Walking', icon: Footprints },
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
      { title: 'TripPilot — India Travel Itinerary Planner' },
      {
        name: 'description',
        content:
          'Plan personalized day-wise trips across India with neighborhood grouping, route optimization, live weather, and budget fitting.',
      },
    ],
  }),
  component: Index,
});

const PLANNING_STEPS = [
  { icon: Compass, label: 'Curating landmarks and neighborhood highlights' },
  { icon: MapPin, label: 'Grouping stops by proximity to reduce transit' },
  { icon: RouteIcon, label: 'Sequencing daily routes around opening hours' },
  { icon: CloudSun, label: 'Checking live local weather forecasts' },
  { icon: Wallet, label: 'Fitting activities and transit within your budget' },
];

function PlanningProgressView({ destination }: { destination: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % PLANNING_STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-8 px-6 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
        <LoaderCircle className="size-7 animate-spin text-primary" />
      </div>

      <div>
        <p className="text-xs font-medium text-primary">Building itinerary</p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
          Planning your {destination} trip
        </h2>
        <p className="mt-2.5 text-sm text-muted-foreground">
          Sequencing verified Indian landmarks, opening windows, and optimal daily routes.
        </p>
      </div>

      <div className="w-full space-y-2">
        {PLANNING_STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCurrent = i === step;
          const isDone = i < step;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors duration-200 ${
                isCurrent
                  ? 'border-primary/40 bg-card text-foreground'
                  : isDone
                    ? 'border-border/60 bg-muted/40 text-muted-foreground'
                    : 'border-border/40 bg-transparent text-muted-foreground/60'
              }`}
            >
              <Icon className={`size-4 shrink-0 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="flex-1 text-left">{s.label}</span>
              {isDone && <Check className="size-4 text-primary" />}
              {isCurrent && <LoaderCircle className="size-3.5 animate-spin text-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Index() {
  const { user } = useAccount();

  const [destination, setDestination] = useState('New Delhi');
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [budget, setBudget] = useState(6000);
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [transportMode, setTransportMode] = useState<TransportMode>('cab');
  const [startPointQuery, setStartPointQuery] = useState('');
  const [interests, setInterests] = useState<string[]>(['Culture & Heritage', 'History & Forts']);

  const [loading, setLoading] = useState(false);
  const [locatingCity, setLocatingCity] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showWeatherPanel, setShowWeatherPanel] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [trip, setTrip] = useState<ActiveTripState | null>(null);
  const [activeDayTab, setActiveDayTab] = useState<number | 'all'>('all');
  const [budgetDraft, setBudgetDraft] = useState('6000');
  const [selectedPlaceName, setSelectedPlaceName] = useState<string | null>(null);
  const [detailStop, setDetailStop] = useState<Stop | null>(null);
  const [checkedPacking, setCheckedPacking] = useState<Record<string, boolean>>({});
  const [customPlaceQuery, setCustomPlaceQuery] = useState('');
  const [customPlaceDay, setCustomPlaceDay] = useState(1);

  const [savedTrips, setSavedTrips] = useState<TripRecord[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const autoTriggeredRef = useRef(false);

  const runTripGeneration = useCallback(
    async (overrides?: {
      destination?: string;
      numberOfDays?: number;
      budget?: number;
      interests?: string[];
      transportMode?: TransportMode;
    }) => {
      const targetDest = (overrides?.destination ?? destination).trim();
      if (!targetDest) return;
      const targetDays = overrides?.numberOfDays ?? numberOfDays;
      const targetBudget = overrides?.budget ?? budget;
      const targetInterests = overrides?.interests ?? interests;
      const targetTransport = overrides?.transportMode ?? transportMode;

      setLoading(true);
      setError('');
      setNotice('');

      try {
        const res = await generateOptimizedTrip({
          data: {
            destination: targetDest,
            numberOfDays: targetDays,
            budget: Number(targetBudget) || 0,
            interests: targetInterests,
            startDate,
            transportMode: targetTransport,
            ...(startPointQuery.trim() ? { startPointQuery: startPointQuery.trim() } : {}),
          },
        });
        setTrip({
          destination: res.destination,
          center: res.center,
          budget: Number(targetBudget) || 0,
          numberOfDays: targetDays,
          travelers: Math.max(1, Number(travelers) || 1),
          interests: targetInterests,
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
        setBudgetDraft(String(targetBudget));
        setActiveDayTab('all');
        setCustomPlaceDay(1);
        setCheckedPacking({});
        setSelectedPlaceName(res.itinerary[0]?.stops[0]?.name ?? null);
        if ('correctedFrom' in res && res.correctedFrom) {
          setDestination(res.destination);
          setNotice(`Showing itinerary for "${res.destination}" (corrected from "${res.correctedFrom}").`);
        }
        requestAnimationFrame(() =>
          document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate itinerary.');
      } finally {
        setLoading(false);
      }
    },
    [destination, numberOfDays, budget, interests, startDate, transportMode, startPointQuery, travelers],
  );

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
    setDestination(saved.destination);
    setNumberOfDays(saved.numberOfDays);
    setBudget(saved.budget);
    setBudgetDraft(String(saved.budget));
    setActiveDayTab('all');
    setSelectedPlaceName(saved.itinerary[0]?.stops[0]?.name ?? null);
    setNotice(`Loaded saved trip to ${saved.destination}.`);
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FAVOURITES_KEY);
      if (saved) setFavourites(JSON.parse(saved) as string[]);
    } catch {
      // ignore
    }

    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    const daysParam = Number(params.get('days'));
    const budgetParam = Number(params.get('budget'));
    const autoParam = params.get('auto');
    const tripIdParam = params.get('tripId');

    if (cityParam) setDestination(cityParam);
    if (Number.isFinite(daysParam) && daysParam >= 1 && daysParam <= 10) setNumberOfDays(daysParam);
    if (Number.isFinite(budgetParam) && budgetParam > 0) {
      setBudget(budgetParam);
      setBudgetDraft(String(budgetParam));
    }

    if (tripIdParam) {
      void getPublicTripById({ data: { tripId: tripIdParam } })
        .then((res) => {
          if (res.trip) handleLoadSavedTrip(res.trip);
        })
        .catch(() => {});
      return;
    }

    if (cityParam && autoParam === '1' && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      void runTripGeneration({
        destination: cityParam,
        numberOfDays: Number.isFinite(daysParam) && daysParam >= 1 && daysParam <= 10 ? daysParam : 3,
        budget: Number.isFinite(budgetParam) && budgetParam > 0 ? budgetParam : 6000,
      });
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
    await runTripGeneration();
  }

  async function handlePlanCircuit(circuit: FeaturedCircuit) {
    setDestination(circuit.city);
    setNumberOfDays(circuit.days);
    setBudget(circuit.budget);
    setInterests(circuit.interests);
    await runTripGeneration({
      destination: circuit.city,
      numberOfDays: circuit.days,
      budget: circuit.budget,
      interests: circuit.interests,
    });
  }

  function handleLiveTransportChange(nextMode: TransportMode) {
    setTransportMode(nextMode);
    if (!trip) return;
    const res = recalculateItineraryTransport({
      destination: trip.destination,
      currentItinerary: trip.itinerary,
      totalBudget: trip.budget,
      transportMode: nextMode,
      ...(trip.startPoint ? { startPoint: trip.startPoint } : {}),
    });
    setTrip({
      ...trip,
      transportMode: nextMode,
      itinerary: res.itinerary,
      totalCost: res.totalCost,
      remainingBudget: res.remainingBudget,
    });
    setNotice(`Switched travel mode to ${TRANSPORT_CONFIG[nextMode].label} and recalculated transit times.`);
  }

  function handleLiveTravelersChange(delta: number) {
    if (!trip) return;
    const nextCount = Math.min(20, Math.max(1, trip.travelers + delta));
    setTravelers(nextCount);
    setTrip({ ...trip, travelers: nextCount });
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

  function handleQuickAddCandidate(candidate: AttractionCandidate, dayNum: number) {
    if (!trip) return;
    const res = addStopToDay({
      destination: trip.destination,
      currentItinerary: trip.itinerary,
      dayNumber: dayNum,
      candidate,
      totalBudget: trip.budget,
      transportMode: trip.transportMode,
      ...(trip.startPoint ? { startPoint: trip.startPoint } : {}),
    });
    setTrip({
      ...trip,
      itinerary: res.itinerary,
      totalCost: res.totalCost,
      remainingBudget: res.remainingBudget,
    });
    setSelectedPlaceName(candidate.name);
    setNotice(`Added "${candidate.name}" to Day ${dayNum}.`);
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
      setNotice('Trip saved to your account.');
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

  function handleExportOfflinePass() {
    if (!trip) return;
    const html = generateOfflinePocketPassHtml({
      destination: trip.destination,
      budget: trip.budget,
      itinerary: trip.itinerary,
    });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.destination.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-pocket-pass.html`;
    a.click();
    URL.revokeObjectURL(url);
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

  const unusedCandidates = useMemo(() => {
    if (!trip) return [];
    const usedIds = new Set(trip.itinerary.flatMap((d) => d.stops.map((s) => s.attractionId)));
    return trip.candidates.filter((c) => !usedIds.has(c.attractionId)).slice(0, 6);
  }, [trip]);

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
      <section className="border-b border-border/80 bg-card/40">
        <div className="mx-auto max-w-6xl px-6 pt-14 pb-16 sm:pt-20 sm:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium text-primary">
              India Day-by-Day Route Planner
            </p>

            <h1 className="mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground text-balance sm:text-6xl">
              Thoughtful Indian itineraries, sequenced around real travel time.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Type any Indian city, choose your days and rupee budget, and get a neighborhood-clustered itinerary with opening hours, live weather, and interactive maps.
            </p>
          </div>

          <section id="destinations" className="no-print mx-auto mt-10 max-w-4xl scroll-mt-24 text-left">
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-sm sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center px-2.5">
                  <CityAutocomplete
                    id="destination"
                    value={destination}
                    onChange={setDestination}
                    placeholder="Type a city (e.g. New Delhi, Jaipur, Dehradun, Goa...)"
                  />
                </div>

                <div className="hidden h-7 w-px bg-border sm:block" aria-hidden="true" />

                <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                  <div className="flex items-center gap-1 rounded-lg bg-muted/60 px-2 py-1 text-xs">
                    <button
                      type="button"
                      aria-label="Decrease days"
                      onClick={() => setNumberOfDays((d) => Math.max(1, d - 1))}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-[44px] text-center font-mono font-medium tabular-nums text-foreground">
                      {numberOfDays}d
                    </span>
                    <button
                      type="button"
                      aria-label="Increase days"
                      onClick={() => setNumberOfDays((d) => Math.min(10, d + 1))}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={detectCurrentCity}
                    disabled={locatingCity}
                    title="Use my current location"
                    aria-label="Use my current location"
                    className="h-10 w-10 text-muted-foreground hover:text-primary"
                  >
                    {locatingCity ? <LoaderCircle className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
                  </Button>

                  <Button
                    type="button"
                    variant={showOptions ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setShowOptions((v) => !v)}
                    className="h-10 gap-1.5 whitespace-nowrap text-xs text-muted-foreground hover:text-foreground"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span className="font-mono tabular-nums">₹{budget.toLocaleString('en-IN')}</span>
                    <span>· Options</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={loading || !destination.trim()}
                    className="h-10 shrink-0 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
                    {loading ? 'Planning…' : 'Plan Trip'}
                    {!loading && <ArrowRight className="size-4" />}
                  </Button>
                </div>
              </div>

              {showOptions && (
                <div className="space-y-6 rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="days" className="text-xs text-muted-foreground">Trip length</Label>
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

                    <div className="space-y-1.5">
                      <Label htmlFor="budget" className="text-xs text-muted-foreground">Budget per person (₹)</Label>
                      <Input
                        id="budget"
                        type="number"
                        min={0}
                        step={500}
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="h-10 bg-background font-mono tabular-nums"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="travelers" className="text-xs text-muted-foreground">Travelers</Label>
                      <Input
                        id="travelers"
                        type="number"
                        min={1}
                        max={20}
                        value={travelers}
                        onChange={(e) => setTravelers(Math.max(1, Number(e.target.value) || 1))}
                        className="h-10 bg-background font-mono tabular-nums"
                      />
                    </div>

                    <div className="space-y-1.5">
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="startPoint" className="text-xs text-muted-foreground">
                        Hotel or starting landmark (optional)
                      </Label>
                      <Input
                        id="startPoint"
                        value={startPointQuery}
                        onChange={(e) => setStartPointQuery(e.target.value)}
                        placeholder="e.g. Connaught Place, Clock Tower, Railway Station..."
                        className="h-10 bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Local transport</Label>
                      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                        {TRANSPORT_OPTIONS.map(({ mode, label, icon: Icon }) => {
                          const active = transportMode === mode;
                          return (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setTransportMode(mode)}
                              className={`flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-medium transition-colors ${
                                active
                                  ? 'bg-card text-foreground shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <Icon className="size-3.5" />
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_OPTIONS.map((option) => {
                        const active = interests.includes(option);
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleInterest(option)}
                            className={`h-8 whitespace-nowrap rounded-lg border px-3 text-xs font-medium transition-colors ${
                              active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-1 text-xs text-muted-foreground">
                <span>Quick starts:</span>
                {QUICK_PROMPTS.map((q) => {
                  const active = destination.trim().toLowerCase() === q.city.toLowerCase();
                  return (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => {
                        setDestination(q.city);
                        setNumberOfDays(q.days);
                        setBudget(q.budget);
                        setInterests(q.interests);
                        void runTripGeneration({
                          destination: q.city,
                          numberOfDays: q.days,
                          budget: q.budget,
                          interests: q.interests,
                        });
                      }}
                      className={`whitespace-nowrap rounded-md px-2.5 py-1 transition-colors ${
                        active
                          ? 'bg-secondary font-medium text-foreground'
                          : 'hover:bg-secondary/60 hover:text-foreground'
                      }`}
                    >
                      {q.label}
                    </button>
                  );
                })}
              </div>
            </form>

            {error && (
              <div role="alert" className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
            {notice && (
              <div role="status" className="mt-5 rounded-xl border border-primary/25 bg-card p-3.5 text-sm text-foreground">
                {notice}
              </div>
            )}
          </section>
        </div>
      </section>

      {savedTrips.length > 0 && (
        <section className="no-print mx-auto max-w-6xl px-6 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Your saved trips</h2>
            <Link to="/trips" className="text-xs font-medium text-primary hover:underline">
              Manage all trips →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {savedTrips.slice(0, 5).map((saved) => (
              <div
                key={saved._id}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm"
              >
                <button
                  type="button"
                  onClick={() => handleLoadSavedTrip(saved)}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {saved.destination} · {saved.numberOfDays}d · ₹{saved.budget.toLocaleString('en-IN')}
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

      {!trip && loading && <PlanningProgressView destination={destination} />}

      {!trip && !loading && (
        <div id="how-it-works" className="mx-auto max-w-6xl space-y-20 px-6 pt-16">
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="text-xs font-medium text-primary">Curated Indian Circuits</p>
                <h2 className="mt-1.5 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                  Start from a proven route
                </h2>
              </div>
              <Link
                to="/explore"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Explore all circuits →
              </Link>
            </div>

            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_CIRCUITS.slice(0, 6).map((c) => (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => void handlePlanCircuit(c)}
                  className="group overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground tabular-nums">
                      <span>
                        {c.region} · {c.days} days · ₹{c.budget.toLocaleString('en-IN')}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        {c.rating}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-medium text-foreground transition-colors group-hover:text-primary">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                      Build {c.days}-day plan
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-8 border-t border-border pt-14 md:grid-cols-3">
            <div>
              <p className="font-mono text-xs text-primary">01</p>
              <h3 className="mt-2 font-display text-xl font-medium text-foreground">
                Neighborhood clustering
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Stops are grouped geographically per day and ordered with 2-opt route refinement so you spend hours exploring instead of sitting in traffic.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-primary">02</p>
              <h3 className="mt-2 font-display text-xl font-medium text-foreground">
                Live budget &amp; weather fitting
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Adjust rupee budgets, switch between cab, public transit, or walking, and swap outdoor stops for indoor museums whenever rain is forecast.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-primary">03</p>
              <h3 className="mt-2 font-display text-xl font-medium text-foreground">
                Ready for offline travel
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Export schedules straight to Calendar (.ics), download a self-contained HTML Pocket Pass for low-signal zones, or share a group voting link.
              </p>
            </div>
          </section>
        </div>
      )}

      {trip && (
        <section id="plan" className="mx-auto max-w-6xl scroll-mt-24 px-6 pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="text-xs font-medium text-primary">
                Itinerary · {trip.destination}
                {trip.startPoint ? ` · Starting from ${trip.startPoint.name}` : ''}
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-medium tracking-tight sm:text-4xl">
                {trip.numberOfDays}-Day {trip.destination} Plan
              </h2>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2">
              {user ? (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={busyAction === 'save'}
                  onClick={() => void handleSaveTrip()}
                  className="gap-1.5 whitespace-nowrap"
                >
                  <Bookmark className="size-4" />
                  {trip.tripId ? 'Update saved trip' : 'Save trip'}
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline" className="whitespace-nowrap">
                  <Link to="/auth">Sign in to save</Link>
                </Button>
              )}
              {trip.tripId && (
                <Button type="button" size="sm" variant="outline" onClick={() => void handleShareTrip()} className="gap-1.5 whitespace-nowrap">
                  <Share2 className="size-4" />
                  Share
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant={showWeatherPanel ? 'secondary' : 'outline'}
                onClick={() => setShowWeatherPanel((v) => !v)}
                className="gap-1.5 whitespace-nowrap"
              >
                <CloudSun className="size-4" />
                Weather
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleExportIcs} className="gap-1.5 whitespace-nowrap">
                <CalendarPlus className="size-4" />
                Calendar
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleExportOfflinePass} className="gap-1.5 whitespace-nowrap">
                <WifiOff className="size-4" />
                Offline Pass
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => window.print()} className="gap-1.5 whitespace-nowrap">
                <Download className="size-4" />
                PDF
              </Button>
            </div>
          </div>

          {/* Summary Strip: Budget, Travelers, Transport Mode & What-if Replan */}
          <div className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-6 text-sm tabular-nums">
                <div>
                  <span className="block text-xs text-muted-foreground">Budget / person</span>
                  <span className="font-mono text-lg font-medium text-foreground">
                    ₹{trip.budget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Estimated / person</span>
                  <span className="font-mono text-lg font-medium text-primary">
                    ₹{costPerPerson.toLocaleString('en-IN')}
                  </span>
                </div>
                {trip.travelers > 1 && (
                  <div>
                    <span className="block text-xs text-muted-foreground">
                      Group ({trip.travelers} travelers)
                    </span>
                    <span className="font-mono text-lg font-medium text-foreground">
                      ₹{groupTotalCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block text-xs text-muted-foreground">Remaining</span>
                  <span
                    className={`font-mono text-lg font-medium ${
                      trip.remainingBudget < 0 ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    ₹{trip.remainingBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                {trip.distanceSavedKm !== undefined && trip.distanceSavedKm > 0 && (
                  <div className="border-l border-border pl-6">
                    <span className="block text-xs text-muted-foreground">Route optimized</span>
                    <span className="font-mono text-sm font-medium text-primary">
                      {trip.distanceSavedKm} km saved
                    </span>
                  </div>
                )}
              </div>

              <div className="no-print flex flex-wrap items-center gap-3">
                {/* Live Traveler Counter */}
                <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-1.5 py-1 text-xs">
                  <span className="px-1.5 text-muted-foreground">Travelers</span>
                  <button
                    type="button"
                    aria-label="Remove traveler"
                    onClick={() => handleLiveTravelersChange(-1)}
                    className="flex size-6 items-center justify-center rounded hover:bg-muted"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="min-w-[20px] text-center font-mono font-medium tabular-nums">
                    {trip.travelers}
                  </span>
                  <button
                    type="button"
                    aria-label="Add traveler"
                    onClick={() => handleLiveTravelersChange(1)}
                    className="flex size-6 items-center justify-center rounded hover:bg-muted"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                {/* Live Transport Mode Switcher */}
                <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                  {TRANSPORT_OPTIONS.map(({ mode, label, icon: Icon }) => {
                    const active = trip.transportMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleLiveTransportChange(mode)}
                        className={`flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-card text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted-foreground">Adjust budget:</span>
                <input
                  type="range"
                  min={500}
                  max={25000}
                  step={500}
                  aria-label="What-if budget slider"
                  value={Math.min(25000, Math.max(500, Number(budgetDraft) || 5000))}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  className="w-32 accent-primary"
                />
                <Input
                  type="number"
                  min={0}
                  step={100}
                  aria-label="New budget"
                  value={budgetDraft}
                  onChange={(e) => setBudgetDraft(e.target.value)}
                  className="h-8 w-28 bg-background font-mono text-xs tabular-nums"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busyAction === 'budget'}
                  onClick={() => void handleBudgetReplan()}
                  className="h-8 text-xs"
                >
                  {busyAction === 'budget' ? 'Re-planning…' : 'Apply budget'}
                </Button>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setActiveDayTab('all')}
                  className={`h-7 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors ${
                    activeDayTab === 'all'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Days
                </button>
                {trip.itinerary.map((day) => (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setActiveDayTab(day.dayNumber)}
                    className={`h-7 whitespace-nowrap rounded-md px-3 text-xs font-medium tabular-nums transition-colors ${
                      activeDayTab === day.dayNumber
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Day {day.dayNumber} ({day.stops.length})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showWeatherPanel && trip.itinerary.some((d) => d.tempC !== undefined || d.weatherSummary !== 'Clear') && (
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <CloudSun className="size-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">
                    Weather forecast · {trip.destination}
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">Live daily outlook</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trip.itinerary.map((day) => {
                  const cond = (day.weatherCondition || '').toLowerCase();
                  const WeatherIcon = day.hasRainAlert
                    ? CloudRain
                    : cond.includes('cloud')
                      ? Cloud
                      : Sun;
                  return (
                    <div
                      key={`wx-${day.dayNumber}`}
                      className={`flex flex-col justify-between rounded-lg border p-3.5 ${
                        day.hasRainAlert
                          ? 'border-amber-500/40 bg-amber-500/10'
                          : 'border-border/80 bg-background/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-medium text-primary">Day {day.dayNumber}</p>
                          <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                            {day.date}
                          </p>
                        </div>
                        <WeatherIcon className="size-5 text-amber-500" />
                      </div>
                      <div className="mt-3">
                        <div className="flex items-baseline gap-2 tabular-nums">
                          <span className="font-display text-2xl font-medium text-foreground">
                            {day.tempC !== undefined ? `${day.tempC}°C` : '—'}
                          </span>
                          {day.tempMinC !== undefined && day.tempMaxC !== undefined && (
                            <span className="font-mono text-xs text-muted-foreground">
                              {day.tempMinC}° / {day.tempMaxC}°
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{day.weatherSummary}</p>
                      </div>
                      {(day.humidity !== undefined || day.windKmh !== undefined) && (
                        <div className="mt-3 flex items-center gap-3 border-t border-border/60 pt-2 font-mono text-[11px] tabular-nums text-muted-foreground">
                          {day.humidity !== undefined && (
                            <span className="inline-flex items-center gap-1">
                              <Droplets className="size-3 text-primary" />
                              {day.humidity}%
                            </span>
                          )}
                          {day.windKmh !== undefined && (
                            <span className="inline-flex items-center gap-1">
                              <Wind className="size-3 text-primary" />
                              {day.windKmh} km/h
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hasAnyRainAlert && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
              <div className="flex items-center gap-2.5">
                <CloudRain className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Rain is forecast on at least one day. Swap outdoor stops on affected days for indoor museums or temples.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busyAction === 'weather'}
                onClick={() => void handleWeatherAdjust()}
                className="no-print whitespace-nowrap"
              >
                {busyAction === 'weather' ? 'Adjusting…' : 'Swap for indoor stops'}
              </Button>
            </div>
          )}

          {/* Add Custom Place + Suggested Unused Landmarks */}
          <div className="no-print mt-5 space-y-3 rounded-xl border border-border bg-card p-4">
            <form onSubmit={handleAddCustomStop} className="flex flex-wrap items-center gap-2">
              <Input
                value={customPlaceQuery}
                onChange={(e) => setCustomPlaceQuery(e.target.value)}
                placeholder={`Add any café, monument, or market in ${trip.destination}...`}
                className="h-9 max-w-sm flex-1 bg-background"
              />
              <select
                aria-label="Target day"
                value={customPlaceDay}
                onChange={(e) => setCustomPlaceDay(Number(e.target.value))}
                className="h-9 rounded-md border border-border bg-background px-2.5 text-xs"
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
                className="h-9 gap-1 whitespace-nowrap"
              >
                <Plus className="size-3.5" />
                {busyAction === 'custom-place' ? 'Adding…' : 'Add stop'}
              </Button>
            </form>

            {unusedCandidates.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3 text-xs">
                <span className="text-muted-foreground">More spots to add to Day {customPlaceDay}:</span>
                {unusedCandidates.map((cand) => (
                  <button
                    key={cand.attractionId}
                    type="button"
                    onClick={() => handleQuickAddCandidate(cand, customPlaceDay)}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus className="size-3" />
                    {cand.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-8">
              {displayedDays.map((day) => {
                const energy = getDayEnergyScore(day);
                const foodSuggestions = findRouteFoodSuggestions(day, trip.candidates);
                return (
                  <section key={day.dayNumber} className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2.5">
                          <h3 className="font-display text-2xl font-medium text-foreground">
                            Day {day.dayNumber}
                          </h3>
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">
                            {day.date}
                          </span>
                          <span aria-hidden="true" className="text-muted-foreground">·</span>
                          <span
                            className={`text-xs font-medium tabular-nums ${
                              energy.level === 'Intense'
                                ? 'text-rose-600 dark:text-rose-400'
                                : energy.level === 'Moderate'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {energy.level} pace ({energy.visitHours}h)
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                          ₹{day.totalCost.toLocaleString('en-IN')} total (Activities ₹
                          {day.activityCost.toLocaleString('en-IN')} + Transit ₹
                          {day.transitCost.toLocaleString('en-IN')}) · {day.totalTravelTime} min travel ·{' '}
                          {day.weatherSummary}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={busyAction === `regen-${day.dayNumber}`}
                        onClick={() => void handleRegenerateDay(day.dayNumber)}
                        className="no-print gap-1.5 whitespace-nowrap"
                      >
                        <RefreshCw
                          className={`size-3.5 ${busyAction === `regen-${day.dayNumber}` ? 'animate-spin' : ''}`}
                        />
                        Regenerate day
                      </Button>
                    </div>

                    {day.stops.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-border/60 pb-3.5 text-xs">
                        {day.stops.map((st, sIdx) => (
                          <span key={`metro-${st.attractionId}-${sIdx}`} className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedPlaceName(st.name)}
                              className="text-foreground transition-colors hover:text-primary"
                            >
                              <span className="font-mono tabular-nums text-primary">{st.startTime}</span>{' '}
                              <span className="font-medium">{st.name}</span>
                            </button>
                            {st.travelToNext && (
                              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                                → {st.travelToNext.minutes}m →
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {foodSuggestions.length > 0 && (
                      <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-xs">
                        <span className="inline-flex items-center gap-2 text-foreground">
                          <Utensils className="size-3.5 shrink-0 text-primary" />
                          <span>
                            Eat along route near <strong>{foodSuggestions[0]!.afterStopName}</strong>:{' '}
                            <strong>{foodSuggestions[0]!.candidate.name}</strong> ({foodSuggestions[0]!.detourKm} km detour)
                          </span>
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2.5 text-xs text-primary"
                          onClick={() => handleQuickAddCandidate(foodSuggestions[0]!.candidate, day.dayNumber)}
                        >
                          + Add stop
                        </Button>
                      </div>
                    )}

                    {day.stops.length === 0 ? (
                      <p className="mt-5 text-sm text-muted-foreground">
                        No stops fit within the remaining budget and opening hours for this day. Try raising the budget or adding a stop above.
                      </p>
                    ) : (
                      <ol className="mt-5 divide-y divide-border/70">
                        {day.stops.map((stop, idx) => {
                          const isFav = favourites.includes(`${trip.destination}::${stop.name}`);
                          const isSelected = selectedPlaceName === stop.name;
                          const globalNumber =
                            mapPlaces.findIndex((p) => p.name === stop.name) + 1 || idx + 1;
                          const timingInsight = getStopTimingInsight(stop);
                          const practicalAlerts = getIndiaPracticalAlerts(stop);

                          return (
                            <li
                              key={`${day.dayNumber}-${stop.attractionId}-${idx}`}
                              onClick={() => {
                                setSelectedPlaceName(stop.name);
                                setDetailStop(stop);
                              }}
                              onMouseEnter={() => setSelectedPlaceName(stop.name)}
                              className={`cursor-pointer py-5 first:pt-1 last:pb-1 transition-colors ${
                                isSelected ? 'rounded-lg bg-secondary/45 px-3 -mx-3' : 'hover:bg-secondary/25 hover:rounded-lg hover:px-3 hover:-mx-3'
                              }`}
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                <div className="relative shrink-0">
                                  <StopPhoto
                                    name={stop.name}
                                    category={stop.category}
                                    destination={trip.destination}
                                    {...(stop.photoReference ? { photoReference: stop.photoReference } : {})}
                                    className="h-28 w-full rounded-lg sm:h-28 sm:w-32"
                                  />
                                  <span className="absolute left-2 top-2 flex size-6 items-center justify-center rounded-md bg-background/90 font-mono text-[11px] font-medium tabular-nums text-foreground shadow-xs">
                                    {globalNumber}
                                  </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums">
                                        <span className="font-mono font-medium text-primary">
                                          {stop.startTime}
                                        </span>
                                        <span aria-hidden="true">·</span>
                                        <span>{stop.category}</span>
                                        <span aria-hidden="true">·</span>
                                        <span>{stop.isOutdoor ? 'Outdoor' : 'Indoor'}</span>
                                        {timingInsight && (
                                          <>
                                            <span aria-hidden="true">·</span>
                                            <span className="font-medium text-amber-600 dark:text-amber-400">
                                              {timingInsight}
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      <h4
                                        className={`mt-1 font-display text-xl font-medium ${
                                          stop.visited ? 'line-through text-muted-foreground' : 'text-foreground'
                                        }`}
                                      >
                                        {stop.name}
                                      </h4>
                                    </div>

                                    <div className="no-print flex shrink-0 items-center gap-1">
                                      <label
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={Boolean(stop.visited)}
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
                                        className="size-8 shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavourite(trip.destination, stop);
                                        }}
                                      >
                                        <Heart
                                          className={`size-4 ${
                                            isFav ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
                                          }`}
                                        />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock3 className="size-3 text-primary" />
                                      {stop.duration}h visit
                                    </span>
                                    <span>{stop.cost === 0 ? 'Free entry' : `₹${stop.cost}`}</span>
                                    <span>
                                      Open {formatTime24(stop.openingHours.open)}–{formatTime24(stop.openingHours.close)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                      <Star className="size-3 fill-amber-500 text-amber-500" />
                                      {stop.rating.toFixed(1)}
                                    </span>
                                  </div>

                                  {stop.note && (
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                      {stop.note}
                                    </p>
                                  )}

                                  {practicalAlerts.length > 0 && (
                                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                                      <AlertTriangle className="size-3.5 shrink-0" />
                                      <span>{practicalAlerts.join(' · ')}</span>
                                    </p>
                                  )}

                                  <div className="no-print mt-2.5" onClick={(e) => e.stopPropagation()}>
                                    <Input
                                      value={stop.userNote ?? ''}
                                      onChange={(e) =>
                                        updateStopMeta(day.dayNumber, stop.attractionId, {
                                          userNote: e.target.value,
                                        })
                                      }
                                      placeholder="Add personal note or booking ref…"
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
                                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                      >
                                        Photos on Instagram
                                        <ExternalLink className="size-3" />
                                      </a>
                                      {stop.travelToNext && (
                                        <span className="inline-flex items-center gap-1 tabular-nums text-muted-foreground">
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
                                          className="h-7 rounded-md border border-border bg-background px-1.5 text-xs"
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
                );
              })}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              {(() => {
                const totalStops = trip.itinerary.reduce((s, d) => s + d.stops.length, 0);
                const visitedStops = trip.itinerary.reduce(
                  (s, d) => s + d.stops.filter((st) => st.visited).length,
                  0,
                );
                const checkedCount = packingChecklist.filter((i) => checkedPacking[i.id]).length;
                const totalTasks = totalStops + packingChecklist.length;
                const readinessPct =
                  totalTasks > 0 ? Math.round(((visitedStops + checkedCount) / totalTasks) * 100) : 0;
                const dashOffset = 113.1 - (113.1 * readinessPct) / 100;
                return (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                    <div>
                      <p className="text-xs font-medium text-primary">Trip progress</p>
                      <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                        {visitedStops}/{totalStops} stops · {checkedCount}/{packingChecklist.length} packed
                      </p>
                    </div>
                    <div className="relative flex size-12 items-center justify-center">
                      <svg className="size-12 -rotate-90" viewBox="0 0 44 44">
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-muted"
                        />
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray="113.1"
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          className="text-primary transition-all"
                        />
                      </svg>
                      <span className="absolute font-mono text-[10px] font-medium tabular-nums">
                        {readinessPct}%
                      </span>
                    </div>
                  </div>
                );
              })()}

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

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-primary" />
                  <h3 className="font-display text-lg font-medium">Packing Checklist</h3>
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

      {trip && (
        <PlaceDetailDialog
          stop={detailStop}
          destination={trip.destination}
          open={Boolean(detailStop)}
          onOpenChange={(open) => {
            if (!open) setDetailStop(null);
          }}
          isFavourite={detailStop ? favourites.includes(`${trip.destination}::${detailStop.name}`) : false}
          onToggleFavourite={() => {
            if (detailStop) toggleFavourite(trip.destination, detailStop);
          }}
        />
      )}
    </main>
  );
}
