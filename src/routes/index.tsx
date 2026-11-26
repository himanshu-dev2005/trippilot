import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo, useCallback, useRef, type FormEvent } from 'react';
import {
  Sparkles,
  Zap,
  Compass,
  Calendar,
  Wallet,
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
  WifiOff,
  Utensils,
  AlertTriangle,
  Check,
  Car,
  TrainFront,
  Footprints,
  TrendingUp,
  KeyRound,
  Bot,
  Users,
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

const TRAVEL_STYLES = [
  { label: 'Adventure & Treks', short: 'Adventure' },
  { label: 'Nature & Parks', short: 'Relaxation' },
  { label: 'Culture & Heritage', short: 'Culture' },
  { label: 'Food & Cafés', short: 'Foodie' },
  { label: 'History & Forts', short: 'History' },
  { label: 'Spiritual & Temples', short: 'Spiritual' },
  { label: 'Museums & Art', short: 'Museums' },
  { label: 'Shopping & Markets', short: 'Shopping' },
] as const;

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
  weatherConfigured: boolean;
  aiResponseText?: string | undefined;
  budgetSummary?: string | undefined;
  dayThemes?: Record<number, { title?: string; summary?: string }> | undefined;
  modelName?: string | undefined;
  source?: string | undefined;
};

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'TripPilot — AI Itinerary Planner' },
      {
        name: 'description',
        content:
          'Craft bespoke day-by-day travel itineraries powered directly by Gemini AI, tailored to your destination, days, and budget.',
      },
    ],
  }),
  component: Index,
});

const PLANNING_STEPS = [
  { icon: Sparkles, label: 'Sending your destination, days, and budget to Gemini AI' },
  { icon: Compass, label: 'Curating real landmarks, local food, and hidden gems' },
  { icon: MapPin, label: 'Sequencing daily routes and coordinates' },
  { icon: CloudSun, label: 'Fetching live local weather forecasts' },
  { icon: Wallet, label: 'Tailoring stops and transit to fit your budget' },
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
    <div className="mx-auto my-8 flex max-w-xl flex-col items-center gap-6 px-6 py-12 text-center">
      <div className="neu-raised flex size-16 items-center justify-center rounded-2xl">
        <LoaderCircle className="size-7 animate-spin text-primary" />
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Gemini AI Architect
        </span>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
          Crafting your {destination} itinerary
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Generating personalized day-by-day recommendations directly with Gemini AI.
        </p>
      </div>

      <div className="w-full space-y-3">
        {PLANNING_STEPS.map((s, i) => {
          const Icon = s.icon;
          const isCurrent = i === step;
          const isDone = i < step;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
                isCurrent
                  ? 'neu-raised text-foreground font-semibold'
                  : isDone
                    ? 'neu-inset-sm text-muted-foreground'
                    : 'text-muted-foreground/60'
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

  const [destination, setDestination] = useState('');
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [budget, setBudget] = useState(6000);
  const [travelers, setTravelers] = useState(1);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [transportMode, setTransportMode] = useState<TransportMode>('cab');
  const [startPointQuery, setStartPointQuery] = useState('');
  const [interests, setInterests] = useState<string[]>(['Culture & Heritage', 'Adventure & Treks']);
  const [customGeminiKey, setCustomGeminiKey] = useState('');
  const [needsGeminiKey, setNeedsGeminiKey] = useState(false);

  const [loading, setLoading] = useState(false);
  const [locatingCity, setLocatingCity] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [trip, setTrip] = useState<ActiveTripState | null>(null);
  const [activeDayTab, setActiveDayTab] = useState<number | 'all'>(1);
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
      if (!targetDest) {
        setError('Please enter where you want to go.');
        return;
      }
      const targetDays = Math.min(14, Math.max(1, Number(overrides?.numberOfDays ?? numberOfDays) || 3));
      const targetBudget = Math.max(0, Number(overrides?.budget ?? budget) || 0);
      const targetInterests = overrides?.interests ?? interests;
      const targetTransport = overrides?.transportMode ?? transportMode;

      setLoading(true);
      setError('');
      setNotice('');
      setNeedsGeminiKey(false);

      try {
        const res = await generateOptimizedTrip({
          data: {
            destination: targetDest,
            numberOfDays: targetDays,
            budget: targetBudget,
            travelers: Math.max(1, Number(travelers) || 1),
            interests: targetInterests,
            startDate,
            transportMode: targetTransport,
            ...(startPointQuery.trim() ? { startPointQuery: startPointQuery.trim() } : {}),
            ...(customGeminiKey.trim() ? { geminiApiKey: customGeminiKey.trim() } : {}),
          },
        });
        setTrip({
          destination: res.destination,
          center: res.center,
          budget: targetBudget,
          numberOfDays: targetDays,
          travelers: Math.max(1, Number(travelers) || 1),
          interests: targetInterests,
          transportMode: res.transportMode,
          startPoint: res.startPoint,
          itinerary: res.itinerary,
          candidates: res.candidates,
          totalCost: res.totalCost,
          remainingBudget: res.remainingBudget,
          weatherConfigured: res.weatherConfigured,
          aiResponseText: res.aiResponseText,
          budgetSummary: res.budgetSummary,
          dayThemes: res.dayThemes,
          modelName: res.modelName,
          source: res.source,
        });
        setBudgetDraft(String(targetBudget));
        setActiveDayTab(res.itinerary[0]?.dayNumber ?? 'all');
        setCustomPlaceDay(1);
        setCheckedPacking({});
        setSelectedPlaceName(res.itinerary[0]?.stops[0]?.name ?? null);
        requestAnimationFrame(() =>
          document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to generate itinerary.';
        if (msg.includes('MISSING_GEMINI_KEY')) {
          setNeedsGeminiKey(true);
          setError(msg.replace('MISSING_GEMINI_KEY: ', ''));
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    [destination, numberOfDays, budget, interests, startDate, transportMode, startPointQuery, travelers, customGeminiKey],
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
      aiResponseText: saved.aiResponseText,
      budgetSummary: saved.budgetSummary,
      modelName: saved.modelName,
    });
    setDestination(saved.destination);
    setNumberOfDays(saved.numberOfDays);
    setBudget(saved.budget);
    setBudgetDraft(String(saved.budget));
    setActiveDayTab(saved.itinerary[0]?.dayNumber ?? 'all');
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
    if (Number.isFinite(daysParam) && daysParam >= 1 && daysParam <= 14) setNumberOfDays(daysParam);
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
        numberOfDays: Number.isFinite(daysParam) && daysParam >= 1 && daysParam <= 14 ? daysParam : 3,
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
        setBudgetDraft(String(profile.defaultBudget));
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
    setBudgetDraft(String(circuit.budget));
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
      setNotice(`Day ${dayNumber} refreshed.`);
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
          ...(trip.aiResponseText ? { aiResponseText: trip.aiResponseText } : {}),
          ...(trip.budgetSummary ? { budgetSummary: trip.budgetSummary } : {}),
          ...(trip.modelName ? { modelName: trip.modelName } : {}),
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
  const budgetUsedPct =
    trip && trip.budget > 0 ? Math.min(100, Math.round((costPerPerson / trip.budget) * 100)) : 0;

  return (
    <main className="min-h-screen w-full bg-background pb-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-10 lg:px-12">
        {/* Hero Section: Extruded Silk Neomorphic AI Planner */}
        <section
          id="destinations"
          className="no-print neu-raised relative flex flex-col gap-8 overflow-hidden rounded-3xl p-7 lg:p-12"
        >
          {/* Subtle decorative neomorphic glows */}
          <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary-container/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-tertiary-container/20 blur-3xl" />

          <div className="relative z-10 flex max-w-2xl flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                AI-Powered Journey Architect
              </span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
              Where does your imagination wander next?
            </h1>
            <p className="text-base text-muted-foreground">
              Enter where you want to go, your days, and your budget. Gemini AI builds your custom day-by-day itinerary and responds directly.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="relative z-10 flex flex-col gap-6">
            {/* Core User Inputs: Destination, Days, Budget, Travel Style */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
              {/* Destination */}
              <div className="flex flex-col gap-2 lg:col-span-5">
                <label
                  htmlFor="destination"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Where do you want to go?
                </label>
                <div className="neu-inset flex items-center gap-2 rounded-xl px-3.5 py-1.5">
                  <Compass className="size-4 shrink-0 text-outline" />
                  <CityAutocomplete
                    id="destination"
                    value={destination}
                    onChange={setDestination}
                    placeholder="Jaipur, Goa, Kyoto, Manali..."
                    inputClassName="h-10 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={detectCurrentCity}
                    disabled={locatingCity}
                    title="Use my current location"
                    aria-label="Use my current location"
                    className="neu-raised-sm flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary"
                  >
                    {locatingCity ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Days */}
              <div className="flex flex-col gap-2 lg:col-span-3">
                <label htmlFor="days-input" className="text-xs font-semibold text-muted-foreground">
                  How many days?
                </label>
                <div className="neu-inset flex h-[52px] items-center justify-between rounded-xl px-3.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 shrink-0 text-outline" />
                    <input
                      id="days-input"
                      type="number"
                      min={1}
                      max={14}
                      value={numberOfDays}
                      onChange={(e) =>
                        setNumberOfDays(Math.min(14, Math.max(1, Number(e.target.value) || 1)))
                      }
                      className="w-14 bg-transparent font-mono text-sm font-semibold tabular-nums text-foreground focus:outline-none"
                    />
                    <span className="text-xs text-muted-foreground">days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Decrease days"
                      onClick={() => setNumberOfDays((d) => Math.max(1, d - 1))}
                      className="neu-raised-sm flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Increase days"
                      onClick={() => setNumberOfDays((d) => Math.min(14, d + 1))}
                      className="neu-raised-sm flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="flex flex-col gap-2 lg:col-span-4">
                <label htmlFor="budget" className="text-xs font-semibold text-muted-foreground">
                  Budget per person (₹ INR)
                </label>
                <div className="neu-inset flex h-[52px] items-center gap-2.5 rounded-xl px-4">
                  <Wallet className="size-4 shrink-0 text-outline" />
                  <span className="font-mono text-sm font-semibold text-primary">₹</span>
                  <input
                    id="budget"
                    type="number"
                    min={0}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="e.g. 6000"
                    className="w-full bg-transparent font-mono text-sm font-semibold tabular-nums text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Travel Style Pills (Stitch style-pill pattern) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Travel Style</span>
                <button
                  type="button"
                  onClick={() => setShowOptions((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <SlidersHorizontal className="size-3.5" />
                  {showOptions ? 'Hide extra options' : 'Travelers, dates & transport'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 py-1">
                {TRAVEL_STYLES.map((style) => {
                  const active = interests.includes(style.label);
                  return (
                    <button
                      key={style.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleInterest(style.label)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-primary-container text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.14)]'
                          : 'neu-raised-sm text-foreground hover:text-primary'
                      }`}
                    >
                      <span>{style.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extra Options Panel */}
            {showOptions && (
              <div className="neu-inset-sm grid grid-cols-1 gap-4 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="travelers" className="text-xs font-semibold text-muted-foreground">
                    Travelers
                  </label>
                  <input
                    id="travelers"
                    type="number"
                    min={1}
                    max={20}
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, Number(e.target.value) || 1))}
                    className="neu-inset h-10 rounded-xl px-3.5 font-mono text-sm font-medium text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="startDate" className="text-xs font-semibold text-muted-foreground">
                    Start date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="neu-inset h-10 rounded-xl px-3.5 text-sm font-medium text-foreground focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="startPoint" className="text-xs font-semibold text-muted-foreground">
                    Starting hotel / area (optional)
                  </label>
                  <input
                    id="startPoint"
                    value={startPointQuery}
                    onChange={(e) => setStartPointQuery(e.target.value)}
                    placeholder="e.g. Connaught Place, Baga..."
                    className="neu-inset h-10 rounded-xl px-3.5 text-sm text-foreground placeholder:text-outline focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Local transport</span>
                  <div className="neu-inset flex h-10 items-center gap-1 rounded-xl p-1">
                    {TRANSPORT_OPTIONS.map(({ mode, label, icon: Icon }) => {
                      const active = transportMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setTransportMode(mode)}
                          className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-all ${
                            active
                              ? 'bg-primary text-primary-foreground shadow-sm'
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
            )}

            {/* Optional Gemini API Key prompt only if server key is not set */}
            {needsGeminiKey && (
              <div className="neu-inset-sm flex flex-col gap-3 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <KeyRound className="size-4" />
                  <span>Gemini API Key Required</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set <code className="font-mono text-foreground">GEMINI_API_KEY</code> in your server <code className="font-mono text-foreground">.env</code> file, or paste a Gemini API key below for this session to get live responses directly from Gemini AI:
                </p>
                <input
                  type="password"
                  value={customGeminiKey}
                  onChange={(e) => setCustomGeminiKey(e.target.value)}
                  placeholder="Paste Gemini API key (AIza...) for this session"
                  className="neu-inset h-11 w-full rounded-xl px-4 font-mono text-xs text-foreground placeholder:text-outline focus:outline-none"
                />
              </div>
            )}

            {/* Action Row */}
            <div className="flex flex-col items-center justify-between gap-4 pt-1 sm:flex-row">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="neu-inset-sm flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary">
                  AI
                </div>
                <span>
                  Powered directly by Gemini AI — no canned or random placeholder trips.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || !destination.trim()}
                className="neu-btn-primary flex w-full items-center justify-center gap-2.5 rounded-xl px-8 py-4 font-display text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Zap className="size-4 fill-current" />
                )}
                <span>{loading ? 'Generating with Gemini…' : 'AI Generate Itinerary'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div
              role="alert"
              className="neu-inset-sm relative z-10 rounded-xl px-4 py-3 text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}
          {notice && (
            <div
              role="status"
              className="neu-inset-sm relative z-10 rounded-xl px-4 py-3 text-sm font-medium text-primary"
            >
              {notice}
            </div>
          )}
        </section>

        {/* Saved Trips Quick Strip */}
        {savedTrips.length > 0 && (
          <section className="no-print flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Your saved trips</h2>
              <Link to="/trips" className="text-xs font-semibold text-primary hover:underline">
                Manage all trips →
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {savedTrips.slice(0, 5).map((saved) => (
                <div
                  key={saved._id}
                  className="neu-raised-sm flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleLoadSavedTrip(saved)}
                    className="font-semibold text-foreground hover:text-primary"
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

        {/* Loading View */}
        {loading && <PlanningProgressView destination={destination || 'your trip'} />}

        {/* Trending Destinations Cards (Only shown before a trip is generated) */}
        {!trip && !loading && (
          <section className="flex flex-col gap-8">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-tertiary" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-tertiary">
                    Global &amp; India Pulse
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground lg:text-3xl">
                  Trending Destinations
                </h2>
              </div>
              <Link
                to="/explore"
                className="text-sm font-semibold text-primary transition-colors hover:underline"
              >
                Explore all →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {FEATURED_CIRCUITS.slice(0, 6).map((c) => (
                <button
                  key={c.city}
                  type="button"
                  onClick={() => void handlePlanCircuit(c)}
                  className="neu-raised group flex cursor-pointer flex-col gap-4 rounded-2xl p-5 text-left transition-transform hover:-translate-y-1"
                >
                  <div className="neu-inset relative h-60 w-full overflow-hidden rounded-xl">
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-background/85 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-md shadow-sm">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      {c.rating}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary">
                        {c.title}
                      </h3>
                      <span className="shrink-0 text-xs font-semibold text-primary">
                        Budget ₹{c.budget.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{c.subtitle}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock3 className="size-3.5" /> {c.days} days recommended
                    </span>
                    <span className="text-xs font-semibold text-primary transition-transform group-hover:translate-x-1">
                      Generate with AI →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Active Itinerary Dashboard (Stitch Itineraries Dashboard + Budget Collaboration) */}
        {trip && !loading && (
          <section id="plan" className="flex scroll-mt-24 flex-col gap-8">
            {/* Itinerary Header Bar */}
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2.5">
                  <span className="neu-inset-sm rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                    Active Itinerary
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {trip.numberOfDays} {trip.numberOfDays === 1 ? 'Day' : 'Days'} • ₹
                    {trip.budget.toLocaleString('en-IN')} Budget
                    {trip.modelName ? ` • ${trip.modelName}` : ''}
                  </span>
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                  {trip.destination} — {trip.numberOfDays}-Day AI Plan
                </h2>
              </div>

              <div className="no-print flex flex-wrap items-center gap-3">
                {user ? (
                  <button
                    type="button"
                    disabled={busyAction === 'save'}
                    onClick={() => void handleSaveTrip()}
                    className="neu-btn-primary flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    <Bookmark className="size-4" />
                    <span>{trip.tripId ? 'Update Saved Trip' : 'Save Trip'}</span>
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="neu-btn-primary flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all"
                  >
                    <Bookmark className="size-4" />
                    <span>Sign in to Save</span>
                  </Link>
                )}

                {trip.tripId && (
                  <button
                    type="button"
                    onClick={() => void handleShareTrip()}
                    className="neu-raised-sm flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary transition-all"
                  >
                    <Share2 className="size-4" />
                    <span>Share</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExportIcs}
                  className="neu-raised-sm flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-all hover:text-primary"
                >
                  <CalendarPlus className="size-4 text-primary" />
                  <span>Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportOfflinePass}
                  className="neu-raised-sm flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-all hover:text-primary"
                >
                  <WifiOff className="size-4 text-primary" />
                  <span>Offline Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="neu-raised-sm flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-foreground transition-all hover:text-primary"
                >
                  <Download className="size-4 text-primary" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Direct Gemini AI Response Card */}
            {trip.aiResponseText && (
              <div className="neu-raised flex flex-col gap-4 rounded-2xl p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="neu-inset-sm flex size-9 items-center justify-center rounded-xl text-primary">
                      <Bot className="size-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Direct Gemini AI Response
                      </span>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        Personalized Plan for {trip.destination} ({trip.numberOfDays}d · ₹
                        {trip.budget.toLocaleString('en-IN')})
                      </h3>
                    </div>
                  </div>
                  {trip.modelName && (
                    <span className="neu-inset-sm rounded-full px-3 py-1 font-mono text-xs font-medium text-primary">
                      {trip.modelName}
                    </span>
                  )}
                </div>

                <div className="neu-inset rounded-xl p-5 text-sm leading-relaxed whitespace-pre-line text-foreground">
                  {trip.aiResponseText}
                </div>

                {trip.budgetSummary && (
                  <div className="neu-inset-sm flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs text-muted-foreground">
                    <Wallet className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <strong className="font-semibold text-foreground">Budget Fit: </strong>
                      {trip.budgetSummary}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Financial Overview & Controls Card (Stitch Budget Collaboration Style) */}
            <div className="neu-raised flex flex-col gap-5 rounded-2xl p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-8 tabular-nums">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                      Trip Budget / Person
                    </span>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">
                      ₹{trip.budget.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                      Estimated / Person
                    </span>
                    <p className="mt-1 font-display text-2xl font-bold text-primary">
                      ₹{costPerPerson.toLocaleString('en-IN')}
                    </p>
                  </div>
                  {trip.travelers > 1 && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                        Group ({trip.travelers} Travelers)
                      </span>
                      <p className="mt-1 font-display text-2xl font-bold text-foreground">
                        ₹{groupTotalCost.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                      Remaining
                    </span>
                    <p
                      className={`mt-1 font-display text-2xl font-bold ${
                        trip.remainingBudget < 0 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      ₹{trip.remainingBudget.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Live Travelers & Transport Switcher */}
                <div className="no-print flex flex-wrap items-center gap-3">
                  <div className="neu-inset-sm flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs">
                    <Users className="size-3.5 text-primary" />
                    <span className="font-medium text-muted-foreground">Travelers</span>
                    <button
                      type="button"
                      aria-label="Remove traveler"
                      onClick={() => handleLiveTravelersChange(-1)}
                      className="neu-raised-sm flex size-6 items-center justify-center rounded-md"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="min-w-[18px] text-center font-mono font-semibold tabular-nums">
                      {trip.travelers}
                    </span>
                    <button
                      type="button"
                      aria-label="Add traveler"
                      onClick={() => handleLiveTravelersChange(1)}
                      className="neu-raised-sm flex size-6 items-center justify-center rounded-md"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <div className="neu-inset flex items-center gap-1 rounded-xl p-1">
                    {TRANSPORT_OPTIONS.map(({ mode, label, icon: Icon }) => {
                      const active = trip.transportMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleLiveTransportChange(mode)}
                          className={`flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition-all ${
                            active
                              ? 'bg-primary text-primary-foreground shadow-sm'
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

              {/* Budget Usage Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>{budgetUsedPct}% of activity &amp; transit budget allocated</span>
                  <span>
                    {trip.remainingBudget >= 0
                      ? `₹${trip.remainingBudget.toLocaleString('en-IN')} remaining`
                      : `₹${Math.abs(trip.remainingBudget).toLocaleString('en-IN')} over budget`}
                  </span>
                </div>
                <div className="neu-inset-sm h-3.5 w-full overflow-hidden rounded-full p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      trip.remainingBudget < 0 ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${budgetUsedPct}%` }}
                  />
                </div>
              </div>

              {/* Budget Adjust Slider */}
              <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">Adjust budget:</span>
                  <input
                    type="range"
                    min={500}
                    max={50000}
                    step={500}
                    aria-label="What-if budget slider"
                    value={Math.min(50000, Math.max(500, Number(budgetDraft) || 5000))}
                    onChange={(e) => setBudgetDraft(e.target.value)}
                    className="w-36 accent-primary"
                  />
                  <input
                    type="number"
                    min={0}
                    step={100}
                    aria-label="New budget"
                    value={budgetDraft}
                    onChange={(e) => setBudgetDraft(e.target.value)}
                    className="neu-inset h-9 w-28 rounded-xl px-3 font-mono text-xs font-semibold tabular-nums text-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={busyAction === 'budget'}
                    onClick={() => void handleBudgetReplan()}
                    className="neu-raised-sm h-9 rounded-xl px-4 text-xs font-semibold text-primary transition-all disabled:opacity-50"
                  >
                    {busyAction === 'budget' ? 'Re-planning…' : 'Apply budget'}
                  </button>
                </div>
              </div>
            </div>

            {hasAnyRainAlert && (
              <div className="neu-raised flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5 text-sm">
                <div className="flex items-center gap-3">
                  <CloudRain className="size-5 shrink-0 text-amber-500" />
                  <span className="font-medium text-foreground">
                    Rain is forecast on at least one day. Swap outdoor stops on affected days for indoor museums or temples.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={busyAction === 'weather'}
                  onClick={() => void handleWeatherAdjust()}
                  className="no-print neu-raised-sm rounded-xl px-4 py-2 text-xs font-semibold text-primary transition-all"
                >
                  {busyAction === 'weather' ? 'Adjusting…' : 'Swap for indoor stops'}
                </button>
              </div>
            )}

            {/* Day Selector Tabs (Stitch Day Tabs) */}
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              <button
                type="button"
                onClick={() => setActiveDayTab('all')}
                className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  activeDayTab === 'all'
                    ? 'neu-btn-primary'
                    : 'neu-raised-sm text-muted-foreground hover:text-foreground'
                }`}
              >
                All Days
              </button>
              {trip.itinerary.map((day) => {
                const active = activeDayTab === day.dayNumber;
                return (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setActiveDayTab(day.dayNumber)}
                    className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                      active
                        ? 'neu-btn-primary'
                        : 'neu-raised-sm text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Day {day.dayNumber} ({day.stops.length})
                  </button>
                );
              })}
            </div>

            {/* Main Bento Grid: Left Timeline (8 cols) + Right Widgets (4 cols) */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Left Column: Day-by-Day Timeline */}
              <div className="flex flex-col gap-8 lg:col-span-8">
                {displayedDays.map((day) => {
                  const energy = getDayEnergyScore(day);
                  const foodSuggestions = findRouteFoodSuggestions(day, trip.candidates);
                  const dayTheme = trip.dayThemes?.[day.dayNumber];

                  return (
                    <div key={day.dayNumber} className="flex flex-col gap-5">
                      {/* Day Header */}
                      <div className="neu-raised flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-display text-2xl font-bold text-foreground">
                              Day {day.dayNumber}
                              {dayTheme?.title ? `: ${dayTheme.title}` : ''}
                            </h3>
                            <span className="neu-inset-sm rounded-full px-3 py-1 font-mono text-xs text-muted-foreground">
                              {day.date}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                energy.level === 'Intense'
                                  ? 'text-rose-500'
                                  : energy.level === 'Moderate'
                                    ? 'text-amber-500'
                                    : 'text-emerald-600'
                              }`}
                            >
                              {energy.level} pace ({energy.visitHours}h)
                            </span>
                          </div>
                          {dayTheme?.summary && (
                            <p className="mt-1 text-sm text-muted-foreground">{dayTheme.summary}</p>
                          )}
                          <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                            ₹{day.totalCost.toLocaleString('en-IN')} total (Activities ₹
                            {day.activityCost.toLocaleString('en-IN')} + Transit ₹
                            {day.transitCost.toLocaleString('en-IN')}) · {day.totalTravelTime} min travel ·{' '}
                            {day.weatherSummary}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={busyAction === `regen-${day.dayNumber}`}
                          onClick={() => void handleRegenerateDay(day.dayNumber)}
                          className="no-print neu-raised-sm flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-primary transition-all disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`size-3.5 ${busyAction === `regen-${day.dayNumber}` ? 'animate-spin' : ''}`}
                          />
                          <span>Re-order Day</span>
                        </button>
                      </div>

                      {foodSuggestions.length > 0 && (
                        <div className="no-print neu-inset-sm flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-xs">
                          <span className="inline-flex items-center gap-2 text-foreground">
                            <Utensils className="size-3.5 shrink-0 text-primary" />
                            <span>
                              Eat along route near <strong>{foodSuggestions[0]!.afterStopName}</strong>:{' '}
                              <strong>{foodSuggestions[0]!.candidate.name}</strong> ({foodSuggestions[0]!.detourKm} km detour)
                            </span>
                          </span>
                          <button
                            type="button"
                            className="font-semibold text-primary hover:underline"
                            onClick={() =>
                              handleQuickAddCandidate(foodSuggestions[0]!.candidate, day.dayNumber)
                            }
                          >
                            + Add stop
                          </button>
                        </div>
                      )}

                      {/* Stitch Timeline Container */}
                      {day.stops.length === 0 ? (
                        <div className="neu-raised rounded-2xl p-8 text-center text-sm text-muted-foreground">
                          No stops planned for this day yet. Add a stop below to build out Day {day.dayNumber}.
                        </div>
                      ) : (
                        <div className="relative flex flex-col gap-6 pl-6 before:absolute before:bottom-4 before:left-2.5 before:top-4 before:w-1 before:rounded-full before:bg-surface-high">
                          {day.stops.map((stop, idx) => {
                            const isFav = favourites.includes(`${trip.destination}::${stop.name}`);
                            const isSelected = selectedPlaceName === stop.name;
                            const globalNumber =
                              mapPlaces.findIndex((p) => p.name === stop.name) + 1 || idx + 1;
                            const timingInsight = getStopTimingInsight(stop);
                            const practicalAlerts = getIndiaPracticalAlerts(stop);

                            const dotColor =
                              idx === 0
                                ? 'bg-primary'
                                : idx === day.stops.length - 1
                                  ? 'bg-tertiary'
                                  : 'bg-primary-container';

                            return (
                              <div
                                key={`${day.dayNumber}-${stop.attractionId}-${idx}`}
                                className="relative flex items-start gap-4"
                              >
                                <div
                                  className={`absolute -left-6 top-7 size-4 rounded-full ${dotColor} ring-4 ring-background shadow-sm`}
                                />

                                <article
                                  onClick={() => {
                                    setSelectedPlaceName(stop.name);
                                    setDetailStop(stop);
                                  }}
                                  onMouseEnter={() => setSelectedPlaceName(stop.name)}
                                  className={`neu-raised flex w-full cursor-pointer flex-col gap-5 rounded-2xl p-5 transition-all md:flex-row md:items-center ${
                                    isSelected ? 'ring-2 ring-primary/40' : ''
                                  }`}
                                >
                                  <div className="relative shrink-0">
                                    <StopPhoto
                                      name={stop.name}
                                      category={stop.category}
                                      destination={trip.destination}
                                      {...(stop.photoReference
                                        ? { photoReference: stop.photoReference }
                                        : {})}
                                      className="neu-inset-sm h-36 w-full rounded-xl md:h-32 md:w-44"
                                    />
                                    <span className="absolute left-2.5 top-2.5 flex size-6 items-center justify-center rounded-lg bg-background/90 font-mono text-xs font-bold text-primary shadow-sm">
                                      {globalNumber}
                                    </span>
                                  </div>

                                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span className="text-xs font-semibold uppercase tracking-wider text-primary tabular-nums">
                                        {stop.startTime} • {stop.isOutdoor ? 'Outdoor' : 'Indoor'} •{' '}
                                        {stop.duration}h
                                        {timingInsight ? ` • ${timingInsight}` : ''}
                                      </span>
                                      <span className="rounded-full bg-tertiary-fixed px-3 py-0.5 text-xs font-semibold text-tertiary-fixed-foreground">
                                        {stop.category}
                                      </span>
                                    </div>

                                    <h4
                                      className={`font-display text-lg font-semibold ${
                                        stop.visited
                                          ? 'line-through text-muted-foreground'
                                          : 'text-foreground'
                                      }`}
                                    >
                                      {stop.name}
                                    </h4>

                                    {stop.note && (
                                      <p className="text-sm leading-relaxed text-muted-foreground">
                                        {stop.note}
                                      </p>
                                    )}

                                    {practicalAlerts.length > 0 && (
                                      <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="size-3.5 shrink-0" />
                                        <span>{practicalAlerts.join(' · ')}</span>
                                      </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
                                      <span className="font-semibold text-foreground">
                                        {stop.cost === 0 ? 'Free entry' : `Est. ₹${stop.cost}`}
                                      </span>
                                      <span>
                                        Open {formatTime24(stop.openingHours.open)}–
                                        {formatTime24(stop.openingHours.close)}
                                      </span>
                                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                        <Star className="size-3 fill-amber-500 text-amber-500" />
                                        {stop.rating.toFixed(1)}
                                      </span>
                                      {stop.travelToNext && (
                                        <span className="inline-flex items-center gap-1 text-primary">
                                          <Navigation className="size-3" />
                                          Next: {stop.travelToNext.distanceKm} km (~
                                          {stop.travelToNext.minutes}m · ₹{stop.travelToNext.cost})
                                        </span>
                                      )}
                                    </div>

                                    {/* Personal Note Input */}
                                    <div
                                      className="no-print mt-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        value={stop.userNote ?? ''}
                                        onChange={(e) =>
                                          updateStopMeta(day.dayNumber, stop.attractionId, {
                                            userNote: e.target.value,
                                          })
                                        }
                                        placeholder="Area / personal note or booking ref…"
                                        className="neu-inset h-8 w-full rounded-lg px-3 text-xs text-foreground placeholder:text-outline focus:outline-none"
                                      />
                                    </div>

                                    {/* Action Bar */}
                                    <div
                                      className="no-print mt-1 flex flex-wrap items-center justify-between gap-2 pt-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="flex items-center gap-3 text-xs">
                                        <label className="flex cursor-pointer items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground">
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
                                        <a
                                          href={stop.instagramSearchUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                        >
                                          Photos
                                          <ExternalLink className="size-3" />
                                        </a>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          aria-label={
                                            isFav ? 'Remove from favourites' : 'Add to favourites'
                                          }
                                          onClick={() => toggleFavourite(trip.destination, stop)}
                                          className="neu-raised-sm flex size-8 items-center justify-center rounded-lg"
                                        >
                                          <Heart
                                            className={`size-3.5 ${
                                              isFav
                                                ? 'fill-rose-500 text-rose-500'
                                                : 'text-muted-foreground'
                                            }`}
                                          />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          aria-label="Move stop up"
                                          onClick={() =>
                                            handleReorderStop(day.dayNumber, idx, idx - 1)
                                          }
                                          className="neu-raised-sm flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary disabled:opacity-40"
                                        >
                                          <ArrowUp className="size-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === day.stops.length - 1}
                                          aria-label="Move stop down"
                                          onClick={() =>
                                            handleReorderStop(day.dayNumber, idx, idx + 1)
                                          }
                                          className="neu-raised-sm flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary disabled:opacity-40"
                                        >
                                          <ArrowDown className="size-3.5" />
                                        </button>
                                        {trip.itinerary.length > 1 && (
                                          <select
                                            aria-label="Move to day"
                                            value={day.dayNumber}
                                            onChange={(e) =>
                                              handleMoveStop(
                                                day.dayNumber,
                                                Number(e.target.value),
                                                stop.attractionId,
                                              )
                                            }
                                            className="neu-inset-sm h-8 rounded-lg px-2 text-xs font-medium text-foreground focus:outline-none"
                                          >
                                            {trip.itinerary.map((d) => (
                                              <option key={d.dayNumber} value={d.dayNumber}>
                                                Day {d.dayNumber}
                                              </option>
                                            ))}
                                          </select>
                                        )}
                                        <button
                                          type="button"
                                          aria-label="Remove stop"
                                          onClick={() =>
                                            handleRemoveStop(day.dayNumber, stop.attractionId)
                                          }
                                          className="neu-raised-sm flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive"
                                        >
                                          <Trash2 className="size-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </article>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Custom Stop Card */}
                <div className="no-print neu-raised flex flex-col gap-4 rounded-2xl p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                    Customize Itinerary
                  </span>
                  <form onSubmit={handleAddCustomStop} className="flex flex-wrap items-center gap-3">
                    <input
                      value={customPlaceQuery}
                      onChange={(e) => setCustomPlaceQuery(e.target.value)}
                      placeholder={`Add any café, monument, or market in ${trip.destination}...`}
                      className="neu-inset h-10 min-w-[200px] flex-1 rounded-xl px-4 text-sm text-foreground placeholder:text-outline focus:outline-none"
                    />
                    <select
                      aria-label="Target day"
                      value={customPlaceDay}
                      onChange={(e) => setCustomPlaceDay(Number(e.target.value))}
                      className="neu-inset h-10 rounded-xl px-3 text-xs font-semibold text-foreground focus:outline-none"
                    >
                      {trip.itinerary.map((d) => (
                        <option key={d.dayNumber} value={d.dayNumber}>
                          Day {d.dayNumber}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={busyAction === 'custom-place' || !customPlaceQuery.trim()}
                      className="neu-btn-primary flex h-10 items-center gap-1.5 rounded-xl px-4 text-xs font-semibold disabled:opacity-50"
                    >
                      <Plus className="size-3.5" />
                      <span>{busyAction === 'custom-place' ? 'Adding…' : 'Add Stop'}</span>
                    </button>
                  </form>

                  {unusedCandidates.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="font-medium text-muted-foreground">
                        More suggestions for Day {customPlaceDay}:
                      </span>
                      {unusedCandidates.map((cand) => (
                        <button
                          key={cand.attractionId}
                          type="button"
                          onClick={() => handleQuickAddCandidate(cand, customPlaceDay)}
                          className="neu-raised-sm inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-semibold text-foreground transition-colors hover:text-primary"
                        >
                          <Plus className="size-3 text-primary" />
                          {cand.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Weather, Map, Progress, Chart & Packing (4 cols) */}
              <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-4">
                {/* Weather Widget Card (Stitch style) */}
                {trip.itinerary.some((d) => d.tempC !== undefined || d.weatherSummary !== 'Clear') && (
                  <div className="neu-raised flex flex-col gap-4 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                          Current Forecast
                        </span>
                        <h4 className="font-display text-lg font-semibold text-foreground">
                          {trip.destination}
                        </h4>
                      </div>
                      <CloudSun className="size-8 text-primary" />
                    </div>

                    {trip.itinerary[0] && (
                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="font-display text-3xl font-bold text-foreground">
                            {trip.itinerary[0].tempC !== undefined
                              ? `${trip.itinerary[0].tempC}°C`
                              : 'Clear'}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {trip.itinerary[0].weatherSummary}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground tabular-nums">
                          {trip.itinerary[0].humidity !== undefined && (
                            <p className="flex items-center justify-end gap-1">
                              <Droplets className="size-3 text-primary" />
                              Humidity: {trip.itinerary[0].humidity}%
                            </p>
                          )}
                          {trip.itinerary[0].windKmh !== undefined && (
                            <p className="flex items-center justify-end gap-1">
                              <Wind className="size-3 text-primary" />
                              Wind: {trip.itinerary[0].windKmh} km/h
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
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
                            className="neu-inset-sm flex items-center justify-between rounded-xl px-3 py-2 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-primary">Day {day.dayNumber}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {day.tempC !== undefined ? `${day.tempC}°C` : day.weatherSummary}
                              </p>
                            </div>
                            <WeatherIcon className="size-4 text-amber-500" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Route Overview Map Card */}
                <div className="no-print">
                  <DestinationMap
                    city={trip.destination}
                    center={trip.center}
                    places={mapPlaces}
                    selectedPlaceName={selectedPlaceName}
                    onSelectPlace={setSelectedPlaceName}
                  />
                </div>

                {/* Trip Completion Card (Stitch style) */}
                {(() => {
                  const totalStops = trip.itinerary.reduce((s, d) => s + d.stops.length, 0);
                  const visitedStops = trip.itinerary.reduce(
                    (s, d) => s + d.stops.filter((st) => st.visited).length,
                    0,
                  );
                  const checkedCount = packingChecklist.filter((i) => checkedPacking[i.id]).length;
                  const totalTasks = totalStops + packingChecklist.length;
                  const readinessPct =
                    totalTasks > 0
                      ? Math.round(((visitedStops + checkedCount) / totalTasks) * 100)
                      : 0;
                  return (
                    <div className="neu-raised flex flex-col gap-3 rounded-2xl p-6">
                      <span className="text-xs font-semibold uppercase tracking-wider text-outline">
                        Trip Completion
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          Stops &amp; Packing
                        </span>
                        <span className="text-sm font-bold text-primary tabular-nums">
                          {visitedStops + checkedCount} / {totalTasks} ({readinessPct}%)
                        </span>
                      </div>
                      <div className="neu-inset-sm h-3 w-full overflow-hidden rounded-full p-0.5">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${readinessPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {visitedStops}/{totalStops} stops visited · {checkedCount}/
                        {packingChecklist.length} items packed
                      </p>
                    </div>
                  );
                })()}

                {/* Expense Breakdown Chart */}
                <BudgetBreakdownChart itinerary={trip.itinerary} />

                {/* Shared Packing Checklist Card */}
                <div className="neu-raised flex flex-col gap-4 rounded-2xl p-6">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="size-4 text-primary" />
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Packing Checklist
                    </h3>
                  </div>
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {packingChecklist.map((item) => {
                      const checked = Boolean(checkedPacking[item.id]);
                      return (
                        <li key={item.id}>
                          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-surface-lowest">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setCheckedPacking((prev) => ({
                                  ...prev,
                                  [item.id]: !prev[item.id],
                                }))
                              }
                              className="mt-1 accent-primary"
                            />
                            <span className={checked ? 'line-through opacity-60' : ''}>
                              <span className="block font-medium text-foreground">
                                {item.label}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {item.reason}
                              </span>
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
      </div>

      {trip && (
        <PlaceDetailDialog
          stop={detailStop}
          destination={trip.destination}
          open={Boolean(detailStop)}
          onOpenChange={(open) => {
            if (!open) setDetailStop(null);
          }}
          isFavourite={
            detailStop ? favourites.includes(`${trip.destination}::${detailStop.name}`) : false
          }
          onToggleFavourite={() => {
            if (detailStop) toggleFavourite(trip.destination, detailStop);
          }}
        />
      )}
    </main>
  );
}
