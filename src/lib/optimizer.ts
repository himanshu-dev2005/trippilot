import { haversineKm } from '@/lib/destinations';

export type Coordinates = {
  lat: number;
  lng: number;
};

export type OpeningHours = {
  /** Opening hour in 24h decimal (e.g. 9 = 9:00 AM, 9.5 = 9:30 AM) */
  open: number;
  /** Closing hour in 24h decimal (e.g. 18 = 6:00 PM) */
  close: number;
};

export type TransportMode = 'walking' | 'transit' | 'cab';

export const TRANSPORT_CONFIG: Record<TransportMode, { label: string; speedKmh: number; costPerKm: number }> = {
  walking: { label: 'Walking', speedKmh: 5, costPerKm: 0 },
  transit: { label: 'Public Transit', speedKmh: 18, costPerKm: 8 },
  cab: { label: 'Cab / Auto', speedKmh: 25, costPerKm: 18 },
};

export type StartPoint = {
  name: string;
  coordinates: Coordinates;
};

export type AttractionCandidate = {
  attractionId: string;
  name: string;
  coordinates: Coordinates;
  category: string;
  isOutdoor: boolean;
  rating: number;
  duration: number; // hours
  cost: number; // INR
  openingHours: OpeningHours;
  photoReference?: string;
  note?: string;
};

export type TravelSegment = {
  distanceKm: number;
  minutes: number;
  cost: number;
};

export type Stop = AttractionCandidate & {
  startTime: string; // e.g. "09:00"
  travelToNext: TravelSegment | null;
  weatherStatus: 'clear' | 'rain' | 'adjusted';
  instagramSearchUrl: string;
  userNote?: string;
  visited?: boolean;
  votes?: { up: number; down: number };
};

export type ItineraryDay = {
  dayNumber: number;
  date: string;
  totalCost: number;
  activityCost: number;
  transitCost: number;
  totalTravelTime: number; // minutes
  weatherSummary: string;
  hasRainAlert: boolean;
  tempC?: number;
  tempMinC?: number;
  tempMaxC?: number;
  humidity?: number;
  windKmh?: number;
  weatherCondition?: string;
  stops: Stop[];
};

export type OptimizationResult = {
  itinerary: ItineraryDay[];
  totalCost: number;
  remainingBudget: number;
  optimizedDistanceKm?: number;
  unoptimizedDistanceKm?: number;
  distanceSavedKm?: number;
};

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 20;

export function formatTime24(decimalHour: number): string {
  const totalMinutes = Math.round(decimalHour * 60);
  const hh = Math.floor(totalMinutes / 60) % 24;
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function buildInstagramSearchUrl(placeName: string, destination: string): string {
  const tag = `${placeName} ${destination}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 40);
  return `https://www.instagram.com/explore/tags/${encodeURIComponent(tag || 'travelindia')}/`;
}

export function estimateTravel(
  a: Coordinates,
  b: Coordinates,
  mode: TransportMode = 'cab',
): TravelSegment {
  const cfg = TRANSPORT_CONFIG[mode];
  const distanceKm = Number(haversineKm(a.lat, a.lng, b.lat, b.lng).toFixed(2));
  const minutes = Math.max(5, Math.round((distanceKm / cfg.speedKmh) * 60));
  const cost = Math.round(distanceKm * cfg.costPerKm);
  return { distanceKm, minutes, cost };
}

/**
 * Stage 1: Deterministic K-means geographic clustering.
 */
export function kMeansCluster(
  attractions: AttractionCandidate[],
  k: number,
  maxIterations = 25,
): AttractionCandidate[][] {
  if (k <= 0) return [];
  if (attractions.length === 0) return Array.from({ length: k }, () => []);
  if (k === 1) return [[...attractions]];

  const sorted = [...attractions].sort(
    (a, b) => a.coordinates.lat + a.coordinates.lng - (b.coordinates.lat + b.coordinates.lng),
  );
  const effectiveK = Math.min(k, sorted.length);
  let centroids: Coordinates[] = Array.from({ length: effectiveK }, (_, i) => {
    const idx = Math.floor((i * sorted.length) / effectiveK);
    return { ...sorted[idx]!.coordinates };
  });

  let assignments = new Array<number>(attractions.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    const nextAssignments = attractions.map((item, idx) => {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = haversineKm(
          item.coordinates.lat,
          item.coordinates.lng,
          centroids[c]!.lat,
          centroids[c]!.lng,
        );
        if (d < bestDist) {
          bestDist = d;
          bestCluster = c;
        }
      }
      if (assignments[idx] !== bestCluster) changed = true;
      return bestCluster;
    });

    assignments = nextAssignments;
    if (!changed) break;

    centroids = centroids.map((prev, c) => {
      const members = attractions.filter((_, idx) => assignments[idx] === c);
      if (members.length === 0) return prev;
      const lat = members.reduce((s, m) => s + m.coordinates.lat, 0) / members.length;
      const lng = members.reduce((s, m) => s + m.coordinates.lng, 0) / members.length;
      return { lat, lng };
    });
  }

  const clusters: AttractionCandidate[][] = Array.from({ length: k }, () => []);
  attractions.forEach((item, idx) => {
    const c = assignments[idx] ?? 0;
    clusters[c]?.push(item);
  });

  for (let d = 0; d < k; d++) {
    if (clusters[d]!.length === 0) {
      let largestIdx = 0;
      for (let j = 1; j < k; j++) {
        if (clusters[j]!.length > clusters[largestIdx]!.length) largestIdx = j;
      }
      if (clusters[largestIdx]!.length > 1) {
        const moved = clusters[largestIdx]!.pop();
        if (moved) clusters[d]!.push(moved);
      }
    }
  }

  return clusters;
}

/**
 * Stage 2a: Nearest-Neighbour TSP heuristic for initial day route ordering.
 */
export function nearestNeighbourOrder(
  stops: AttractionCandidate[],
  startPoint?: StartPoint,
): AttractionCandidate[] {
  if (stops.length <= 1) return [...stops];
  const remaining = [...stops].sort(
    (a, b) => a.openingHours.open - b.openingHours.open || b.rating - a.rating,
  );

  let route: AttractionCandidate[];
  if (startPoint) {
    let firstIdx = 0;
    let firstDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(
        startPoint.coordinates.lat,
        startPoint.coordinates.lng,
        remaining[i]!.coordinates.lat,
        remaining[i]!.coordinates.lng,
      );
      if (d < firstDist) {
        firstDist = d;
        firstIdx = i;
      }
    }
    route = [remaining.splice(firstIdx, 1)[0]!];
  } else {
    route = [remaining.shift()!];
  }

  while (remaining.length > 0) {
    const current = route[route.length - 1]!;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(
        current.coordinates.lat,
        current.coordinates.lng,
        remaining[i]!.coordinates.lat,
        remaining[i]!.coordinates.lng,
      );
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    route.push(remaining.splice(bestIdx, 1)[0]!);
  }
  return route;
}

export function totalRouteDistanceKm(stops: AttractionCandidate[]): number {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += haversineKm(
      stops[i]!.coordinates.lat,
      stops[i]!.coordinates.lng,
      stops[i + 1]!.coordinates.lat,
      stops[i + 1]!.coordinates.lng,
    );
  }
  return total;
}

/**
 * Stage 2b: 2-opt local search improvement on an ordered route.
 */
export function twoOptImprove(initialRoute: AttractionCandidate[]): AttractionCandidate[] {
  if (initialRoute.length <= 3) return [...initialRoute];
  let route = [...initialRoute];
  let improved = true;

  while (improved) {
    improved = false;
    let bestDist = totalRouteDistanceKm(route);
    for (let i = 1; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const candidate = [
          ...route.slice(0, i),
          ...route.slice(i, j + 1).reverse(),
          ...route.slice(j + 1),
        ];
        const candidateDist = totalRouteDistanceKm(candidate);
        if (candidateDist + 1e-6 < bestDist) {
          route = candidate;
          bestDist = candidateDist;
          improved = true;
        }
      }
    }
  }
  return route;
}

function buildTimedDay(
  ordered: AttractionCandidate[],
  destination: string,
  dayNumber: number,
  date: string,
  hasRainAlert: boolean,
  weatherSummary: string,
  transportMode: TransportMode,
  startPoint?: StartPoint,
): ItineraryDay {
  const stops: Stop[] = [];
  let clock = DAY_START_HOUR;
  let totalTravelTime = 0;
  let activityCost = 0;
  let transitCost = 0;

  if (startPoint && ordered.length > 0) {
    const firstLeg = estimateTravel(startPoint.coordinates, ordered[0]!.coordinates, transportMode);
    clock += firstLeg.minutes / 60;
    totalTravelTime += firstLeg.minutes;
    transitCost += firstLeg.cost;
  }

  for (let i = 0; i < ordered.length; i++) {
    const spot = ordered[i]!;
    if (i > 0) {
      const seg = estimateTravel(ordered[i - 1]!.coordinates, spot.coordinates, transportMode);
      clock += seg.minutes / 60;
    }
    const start = Math.max(clock, spot.openingHours.open);
    const travelToNext =
      i < ordered.length - 1
        ? estimateTravel(spot.coordinates, ordered[i + 1]!.coordinates, transportMode)
        : null;
    if (travelToNext) {
      totalTravelTime += travelToNext.minutes;
      transitCost += travelToNext.cost;
    }
    activityCost += spot.cost;
    clock = start + spot.duration;

    stops.push({
      ...spot,
      startTime: formatTime24(start),
      travelToNext,
      weatherStatus: hasRainAlert && spot.isOutdoor ? 'rain' : 'clear',
      instagramSearchUrl: buildInstagramSearchUrl(spot.name, destination),
    });
  }

  if (startPoint && ordered.length > 0) {
    const returnLeg = estimateTravel(
      ordered[ordered.length - 1]!.coordinates,
      startPoint.coordinates,
      transportMode,
    );
    totalTravelTime += returnLeg.minutes;
    transitCost += returnLeg.cost;
  }

  return {
    dayNumber,
    date,
    totalCost: activityCost + transitCost,
    activityCost,
    transitCost,
    totalTravelTime,
    weatherSummary,
    hasRainAlert,
    stops,
  };
}

/**
 * Stage 3: Greedy knapsack-style constraint fitting for time, opening hours, and budget.
 */
export function scheduleAndFitDay(
  orderedCandidates: AttractionCandidate[],
  destination: string,
  remainingBudget: number,
  dayNumber: number,
  date: string,
  hasRainAlert = false,
  weatherSummary = 'Clear',
  transportMode: TransportMode = 'cab',
  startPoint?: StartPoint,
): { day: ItineraryDay; budgetUsed: number } {
  const selected: AttractionCandidate[] = [];
  let budgetLeft = remainingBudget;
  let currentTime = DAY_START_HOUR;

  for (const spot of orderedCandidates) {
    const prevCoord =
      selected.length > 0
        ? selected[selected.length - 1]!.coordinates
        : startPoint?.coordinates;
    const seg = prevCoord ? estimateTravel(prevCoord, spot.coordinates, transportMode) : { minutes: 0, cost: 0 };

    if (spot.cost + seg.cost > budgetLeft) continue;

    const arrival = currentTime + seg.minutes / 60;
    const start = Math.max(arrival, spot.openingHours.open);
    const finish = start + spot.duration;

    if (finish <= spot.openingHours.close && finish <= DAY_END_HOUR) {
      selected.push(spot);
      budgetLeft -= spot.cost + seg.cost;
      currentTime = finish;
    }
  }

  const finalOrdered = twoOptImprove(selected);
  const day = buildTimedDay(
    finalOrdered,
    destination,
    dayNumber,
    date,
    hasRainAlert,
    weatherSummary,
    transportMode,
    startPoint,
  );

  return { day, budgetUsed: day.totalCost };
}

/**
 * Full 3-stage optimization pipeline.
 */
export function optimizeItinerary(params: {
  destination: string;
  attractions: AttractionCandidate[];
  numberOfDays: number;
  budget: number;
  startDate?: string;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
  dailyWeather?: Array<{
    hasRain: boolean;
    summary: string;
    tempC?: number;
    tempMinC?: number;
    tempMaxC?: number;
    humidity?: number;
    windKmh?: number;
    condition?: string;
  }>;
}): OptimizationResult {
  const {
    destination,
    attractions,
    numberOfDays,
    budget,
    startDate,
    transportMode = 'cab',
    startPoint,
    dailyWeather,
  } = params;
  const baseDate = startDate ? new Date(startDate) : new Date();

  const clusters = kMeansCluster(attractions, numberOfDays);
  const itinerary: ItineraryDay[] = [];
  let remainingBudget = budget;
  let unoptimizedDistanceKm = 0;
  let optimizedDistanceKm = 0;

  for (let i = 0; i < numberOfDays; i++) {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + i);
    const dateStr = dayDate.toISOString().slice(0, 10);

    const cluster = clusters[i] ?? [];
    unoptimizedDistanceKm += totalRouteDistanceKm(cluster);
    const nnRoute = nearestNeighbourOrder(cluster, startPoint);
    const optimizedRoute = twoOptImprove(nnRoute);
    const weather = dailyWeather?.[i];

    const { day, budgetUsed } = scheduleAndFitDay(
      optimizedRoute,
      destination,
      remainingBudget,
      i + 1,
      dateStr,
      weather?.hasRain ?? false,
      weather?.summary ?? 'Clear',
      transportMode,
      startPoint,
    );

    optimizedDistanceKm += totalRouteDistanceKm(day.stops);
    remainingBudget -= budgetUsed;
    itinerary.push({
      ...day,
      ...(weather?.tempC !== undefined ? { tempC: weather.tempC } : {}),
      ...(weather?.tempMinC !== undefined ? { tempMinC: weather.tempMinC } : {}),
      ...(weather?.tempMaxC !== undefined ? { tempMaxC: weather.tempMaxC } : {}),
      ...(weather?.humidity !== undefined ? { humidity: weather.humidity } : {}),
      ...(weather?.windKmh !== undefined ? { windKmh: weather.windKmh } : {}),
      ...(weather?.condition ? { weatherCondition: weather.condition } : {}),
    });
  }

  const totalCost = itinerary.reduce((sum, d) => sum + d.totalCost, 0);
  const roundedUnopt = Number(unoptimizedDistanceKm.toFixed(1));
  const roundedOpt = Number(optimizedDistanceKm.toFixed(1));
  const distanceSavedKm = Number(Math.max(0, roundedUnopt - roundedOpt).toFixed(1));
  return {
    itinerary,
    totalCost,
    remainingBudget: budget - totalCost,
    unoptimizedDistanceKm: roundedUnopt,
    optimizedDistanceKm: roundedOpt,
    distanceSavedKm,
  };
}

export function regenerateSingleDay(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  dayNumber: number;
  allCandidates: AttractionCandidate[];
  totalBudget: number;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, dayNumber, allCandidates, totalBudget, transportMode = 'cab', startPoint } = params;

  const usedElsewhere = new Set<string>();
  let budgetUsedElsewhere = 0;

  for (const day of currentItinerary) {
    if (day.dayNumber === dayNumber) continue;
    budgetUsedElsewhere += day.totalCost;
    for (const stop of day.stops) usedElsewhere.add(stop.attractionId);
  }

  const targetDay = currentItinerary.find((d) => d.dayNumber === dayNumber);
  if (!targetDay) {
    const totalCost = currentItinerary.reduce((s, d) => s + d.totalCost, 0);
    return { itinerary: currentItinerary, totalCost, remainingBudget: totalBudget - totalCost };
  }

  const availablePool = allCandidates.filter((c) => !usedElsewhere.has(c.attractionId));
  const currentIds = new Set(targetDay.stops.map((s) => s.attractionId));
  const rotatedPool = [
    ...availablePool.filter((c) => !currentIds.has(c.attractionId)),
    ...availablePool.filter((c) => currentIds.has(c.attractionId)),
  ];

  const ordered = twoOptImprove(nearestNeighbourOrder(rotatedPool, startPoint));
  const { day: rebuiltDay } = scheduleAndFitDay(
    ordered,
    destination,
    Math.max(0, totalBudget - budgetUsedElsewhere),
    targetDay.dayNumber,
    targetDay.date,
    targetDay.hasRainAlert,
    targetDay.weatherSummary,
    transportMode,
    startPoint,
  );

  const nextItinerary = currentItinerary.map((d) => (d.dayNumber === dayNumber ? rebuiltDay : d));
  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: totalBudget - totalCost };
}

export function replanForBudget(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  allCandidates: AttractionCandidate[];
  newBudget: number;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, allCandidates, newBudget, transportMode = 'cab', startPoint } = params;
  const candidateMap = new Map(allCandidates.map((c) => [c.attractionId, c]));

  let remainingBudget = newBudget;
  const nextItinerary: ItineraryDay[] = [];

  for (const day of currentItinerary) {
    const dayCandidates = day.stops.map((s) => candidateMap.get(s.attractionId) ?? s);
    const usedIds = new Set(nextItinerary.flatMap((d) => d.stops.map((s) => s.attractionId)));
    const extras = allCandidates.filter(
      (c) => !usedIds.has(c.attractionId) && !dayCandidates.some((dc) => dc.attractionId === c.attractionId),
    );
    const pool = [...dayCandidates, ...extras.slice(0, 2)];
    const ordered = twoOptImprove(nearestNeighbourOrder(pool, startPoint));

    const { day: fitted, budgetUsed } = scheduleAndFitDay(
      ordered,
      destination,
      remainingBudget,
      day.dayNumber,
      day.date,
      day.hasRainAlert,
      day.weatherSummary,
      transportMode,
      startPoint,
    );
    remainingBudget -= budgetUsed;
    nextItinerary.push(fitted);
  }

  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: newBudget - totalCost };
}

export function applyWeatherAdjustment(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  allCandidates: AttractionCandidate[];
  totalBudget: number;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, allCandidates, totalBudget, transportMode = 'cab', startPoint } = params;
  const usedIds = new Set(currentItinerary.flatMap((d) => d.stops.map((s) => s.attractionId)));
  const unusedIndoor = allCandidates.filter((c) => !c.isOutdoor && !usedIds.has(c.attractionId));

  let budgetUsedTotal = currentItinerary.reduce((s, d) => s + d.totalCost, 0);

  const nextItinerary = currentItinerary.map((day) => {
    if (!day.hasRainAlert) return day;

    const remainingBudgetForDay = Math.max(0, totalBudget - (budgetUsedTotal - day.totalCost));
    const adjustedCandidates: AttractionCandidate[] = [];

    for (const stop of day.stops) {
      if (!stop.isOutdoor) {
        adjustedCandidates.push(stop);
        continue;
      }
      const replacementIdx = unusedIndoor.findIndex((indoor) => indoor.cost <= stop.cost + 500);
      if (replacementIdx >= 0) {
        const replacement = unusedIndoor.splice(replacementIdx, 1)[0]!;
        adjustedCandidates.push(replacement);
      }
    }

    const ordered = twoOptImprove(nearestNeighbourOrder(adjustedCandidates, startPoint));
    const { day: rebuilt } = scheduleAndFitDay(
      ordered,
      destination,
      remainingBudgetForDay,
      day.dayNumber,
      day.date,
      day.hasRainAlert,
      day.weatherSummary,
      transportMode,
      startPoint,
    );
    rebuilt.stops = rebuilt.stops.map((s) => ({
      ...s,
      weatherStatus: !s.isOutdoor ? 'adjusted' : s.weatherStatus,
    }));

    budgetUsedTotal = budgetUsedTotal - day.totalCost + rebuilt.totalCost;
    return rebuilt;
  });

  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: totalBudget - totalCost };
}

/** Manual stop editing: reorder a stop up or down within a day and recalculate timings/costs. */
export function reorderStopInDay(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  dayNumber: number;
  fromIndex: number;
  toIndex: number;
  totalBudget: number;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, dayNumber, fromIndex, toIndex, totalBudget, transportMode = 'cab', startPoint } = params;
  const nextItinerary = currentItinerary.map((day) => {
    if (day.dayNumber !== dayNumber) return day;
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= day.stops.length || toIndex >= day.stops.length) return day;
    const updated = [...day.stops];
    const [moved] = updated.splice(fromIndex, 1);
    if (!moved) return day;
    updated.splice(toIndex, 0, moved);
    return buildTimedDay(updated, destination, day.dayNumber, day.date, day.hasRainAlert, day.weatherSummary, transportMode, startPoint);
  });
  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: totalBudget - totalCost };
}

/** Manual stop editing: remove a stop from a day and recalculate timings/costs. */
export function removeStopFromDay(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  dayNumber: number;
  attractionId: string;
  totalBudget: number;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, dayNumber, attractionId, totalBudget, transportMode = 'cab', startPoint } = params;
  const nextItinerary = currentItinerary.map((day) => {
    if (day.dayNumber !== dayNumber) return day;
    const filtered = day.stops.filter((s) => s.attractionId !== attractionId);
    return buildTimedDay(filtered, destination, day.dayNumber, day.date, day.hasRainAlert, day.weatherSummary, transportMode, startPoint);
  });
  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: totalBudget - totalCost };
}

/** Manual stop editing: move a stop from one day to another and recalculate both days. */
export function moveStopBetweenDays(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  fromDay: number;
  toDay: number;
  attractionId: string;
  totalBudget: number;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, fromDay, toDay, attractionId, totalBudget, transportMode = 'cab', startPoint } = params;
  if (fromDay === toDay) {
    const totalCost = currentItinerary.reduce((s, d) => s + d.totalCost, 0);
    return { itinerary: currentItinerary, totalCost, remainingBudget: totalBudget - totalCost };
  }

  const sourceDay = currentItinerary.find((d) => d.dayNumber === fromDay);
  const movingStop = sourceDay?.stops.find((s) => s.attractionId === attractionId);
  if (!movingStop) {
    const totalCost = currentItinerary.reduce((s, d) => s + d.totalCost, 0);
    return { itinerary: currentItinerary, totalCost, remainingBudget: totalBudget - totalCost };
  }

  const nextItinerary = currentItinerary.map((day) => {
    if (day.dayNumber === fromDay) {
      const remaining = day.stops.filter((s) => s.attractionId !== attractionId);
      return buildTimedDay(remaining, destination, day.dayNumber, day.date, day.hasRainAlert, day.weatherSummary, transportMode, startPoint);
    }
    if (day.dayNumber === toDay) {
      const combined = [...day.stops, movingStop];
      return buildTimedDay(combined, destination, day.dayNumber, day.date, day.hasRainAlert, day.weatherSummary, transportMode, startPoint);
    }
    return day;
  });

  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: totalBudget - totalCost };
}

/** Recalculate travel times, transit costs, and totals when the user switches transport mode. */
export function recalculateItineraryTransport(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  totalBudget: number;
  transportMode: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, totalBudget, transportMode, startPoint } = params;
  const nextItinerary = currentItinerary.map((day) => {
    const rebuilt = buildTimedDay(
      day.stops,
      destination,
      day.dayNumber,
      day.date,
      day.hasRainAlert,
      day.weatherSummary,
      transportMode,
      startPoint,
    );
    return {
      ...day,
      ...rebuilt,
      stops: rebuilt.stops.map((st, idx) => ({
        ...st,
        ...(day.stops[idx]?.userNote !== undefined ? { userNote: day.stops[idx]!.userNote } : {}),
        ...(day.stops[idx]?.visited !== undefined ? { visited: day.stops[idx]!.visited } : {}),
        ...(day.stops[idx]?.votes !== undefined ? { votes: day.stops[idx]!.votes } : {}),
      })),
    };
  });
  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: totalBudget - totalCost };
}

export type ChecklistItem = {
  id: string;
  label: string;
  reason: string;
};

/** Generate weather-aware and category-aware packing checklist. */
export function generatePackingChecklist(itinerary: ItineraryDay[]): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { id: 'id-cards', label: 'Government ID & digital tickets', reason: 'Required for monument/hotel entry' },
    { id: 'powerbank', label: 'Power bank & charging cable', reason: 'Keeps maps and GPS active all day' },
    { id: 'shoes', label: 'Comfortable walking shoes', reason: 'Multi-stop city exploration' },
  ];

  const hasRain = itinerary.some((d) => d.hasRainAlert);
  const hasOutdoor = itinerary.some((d) => d.stops.some((s) => s.isOutdoor));
  const hasTempleOrCulture = itinerary.some((d) =>
    d.stops.some((s) => /culture|temple|spiritual|history/i.test(s.category)),
  );

  if (hasRain) {
    items.push({ id: 'umbrella', label: 'Compact umbrella or raincoat', reason: 'Rain is forecast during your trip' });
  }
  if (hasOutdoor) {
    items.push({ id: 'sun', label: 'Sunglasses, sunscreen & water bottle', reason: 'Scheduled outdoor sightseeing stops' });
  }
  if (hasTempleOrCulture) {
    items.push({ id: 'modest', label: 'Shawl or modest attire & easy-slip footwear', reason: 'Helpful for temples & heritage sites' });
  }

  return items;
}

/** Insert a custom attraction into a specific day and recalculate timings/costs. */
export function addStopToDay(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  dayNumber: number;
  candidate: AttractionCandidate;
  totalBudget: number;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, dayNumber, candidate, totalBudget, transportMode = 'cab', startPoint } = params;
  const nextItinerary = currentItinerary.map((day) => {
    if (day.dayNumber !== dayNumber) return day;
    const combined = [...day.stops, candidate];
    return buildTimedDay(combined, destination, day.dayNumber, day.date, day.hasRainAlert, day.weatherSummary, transportMode, startPoint);
  });
  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: totalBudget - totalCost };
}

/** Export itinerary as an iCalendar (.ics) string for Google/Apple Calendar import. */
export function generateIcsCalendar(destination: string, itinerary: ItineraryDay[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripPilot//Travel Itinerary//EN',
    'CALSCALE:GREGORIAN',
  ];

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatIcsDateTime = (dateStr: string, timeStr: string, addHours = 0) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    const dt = new Date(y || 2026, (m || 1) - 1, d || 1, hh || 9, mm || 0);
    dt.setMinutes(dt.getMinutes() + Math.round(addHours * 60));
    return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
  };

  for (const day of itinerary) {
    for (const stop of day.stops) {
      const dtStart = formatIcsDateTime(day.date, stop.startTime, 0);
      const dtEnd = formatIcsDateTime(day.date, stop.startTime, stop.duration);
      lines.push(
        'BEGIN:VEVENT',
        `UID:${stop.attractionId}-day${day.dayNumber}@trippilot`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${stop.name} (${destination})`,
        `LOCATION:${destination}, India`,
        `DESCRIPTION:${stop.category} · Est. cost INR ${stop.cost}${stop.userNote ? ` · Note: ${stop.userNote}` : ''}`,
        'END:VEVENT',
      );
    }
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export type DayEnergy = {
  level: 'Light' | 'Moderate' | 'Intense';
  score: number;
  visitHours: number;
};

/** Compute daily fatigue/energy score from visit duration, outdoor exposure, and transit time. */
export function getDayEnergyScore(day: ItineraryDay): DayEnergy {
  const visitHours = Number(day.stops.reduce((s, st) => s + st.duration, 0).toFixed(1));
  const outdoorHours = day.stops.filter((s) => s.isOutdoor).reduce((s, st) => s + st.duration, 0);
  const raw = visitHours * 11 + outdoorHours * 5 + day.totalTravelTime * 0.25;
  const score = Math.min(100, Math.round(raw));
  const level: DayEnergy['level'] = score >= 75 ? 'Intense' : score >= 45 ? 'Moderate' : 'Light';
  return { level, score, visitHours };
}

/** Detect Golden Hour or Midday Heat windows for a scheduled stop. */
export function getStopTimingInsight(stop: Stop): 'Golden Hour' | 'Midday Heat' | null {
  const [hhStr = '9', mmStr = '0'] = stop.startTime.split(':');
  const startDec = Number(hhStr) + Number(mmStr) / 60;
  if (!stop.isOutdoor) return null;
  if (startDec <= 9.5 || startDec >= 16.5) return 'Golden Hour';
  if (startDec >= 12 && startDec <= 15.25) return 'Midday Heat';
  return null;
}

/** Return India-specific practical reminders for a stop (dress code, closures, permits). */
export function getIndiaPracticalAlerts(stop: Stop): string[] {
  const alerts: string[] = [];
  const text = `${stop.name} ${stop.category}`.toLowerCase();
  if (/temple|mandir|gurudwara|mosque|masjid|ghat|spiritual/.test(text)) {
    alerts.push('Modest attire · remove footwear');
  }
  if (/museum|palace|fort/.test(text)) {
    alerts.push('Verify Monday/holiday closure');
  }
  if (/pass|tunnel|falls|trek|wildlife|national park/.test(text)) {
    alerts.push('Check permit & daylight cutoff');
  }
  return alerts;
}

export type RouteFoodSuggestion = {
  candidate: AttractionCandidate;
  afterStopName: string;
  detourKm: number;
};

/** Find food/café spots that lie near the existing route between consecutive stops. */
export function findRouteFoodSuggestions(
  day: ItineraryDay,
  allCandidates: AttractionCandidate[],
  maxDetourKm = 2.5,
): RouteFoodSuggestion[] {
  if (day.stops.length === 0) return [];
  const usedIds = new Set(day.stops.map((s) => s.attractionId));
  const foodPool = allCandidates.filter(
    (c) => !usedIds.has(c.attractionId) && /food|caf|restaurant|market|bazaar/i.test(`${c.category} ${c.name}`),
  );
  if (foodPool.length === 0) return [];

  const suggestions: RouteFoodSuggestion[] = [];
  for (const food of foodPool) {
    let bestDetour = Infinity;
    let afterStop = day.stops[0]!.name;
    for (let i = 0; i < day.stops.length; i++) {
      const a = day.stops[i]!;
      const b = day.stops[i + 1];
      if (!b) {
        const d = haversineKm(a.coordinates.lat, a.coordinates.lng, food.coordinates.lat, food.coordinates.lng);
        if (d < bestDetour) {
          bestDetour = d;
          afterStop = a.name;
        }
      } else {
        const direct = haversineKm(a.coordinates.lat, a.coordinates.lng, b.coordinates.lat, b.coordinates.lng);
        const viaFood =
          haversineKm(a.coordinates.lat, a.coordinates.lng, food.coordinates.lat, food.coordinates.lng) +
          haversineKm(food.coordinates.lat, food.coordinates.lng, b.coordinates.lat, b.coordinates.lng);
        const detour = Math.max(0, viaFood - direct);
        if (detour < bestDetour) {
          bestDetour = detour;
          afterStop = a.name;
        }
      }
    }
    if (bestDetour <= maxDetourKm) {
      suggestions.push({
        candidate: food,
        afterStopName: afterStop,
        detourKm: Number(bestDetour.toFixed(1)),
      });
    }
  }

  return suggestions.sort((a, b) => a.detourKm - b.detourKm).slice(0, 2);
}

/** Generate a self-contained offline HTML Pocket Pass for low/no-signal areas. */
export function generateOfflinePocketPassHtml(params: {
  destination: string;
  budget: number;
  itinerary: ItineraryDay[];
}): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const daysHtml = params.itinerary
    .map(
      (day) => `
    <section style="margin-bottom:24px;border:1px solid #ddd;border-radius:10px;padding:16px;">
      <h2 style="margin:0 0 6px;">Day ${day.dayNumber} (${esc(day.date)})</h2>
      <p style="margin:0 0 12px;color:#555;font-size:13px;">Cost: ₹${day.totalCost} · Travel: ${day.totalTravelTime} min · Weather: ${esc(day.weatherSummary)}</p>
      <ol style="padding-left:18px;margin:0;">
        ${day.stops
          .map(
            (s) => `<li style="margin-bottom:10px;">
              <strong>${esc(s.startTime)} — ${esc(s.name)}</strong> (${esc(s.category)}, ${s.duration}h, ₹${s.cost})<br/>
              <small style="color:#666;">Coords: ${s.coordinates.lat.toFixed(4)}, ${s.coordinates.lng.toFixed(4)} · Open ${formatTime24(s.openingHours.open)}–${formatTime24(s.openingHours.close)}</small>
              ${s.userNote ? `<br/><small style="color:#4c1d95;">Note: ${esc(s.userNote)}</small>` : ''}
            </li>`,
          )
          .join('')}
      </ol>
    </section>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(params.destination)} — TripPilot Offline Pocket Pass</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:24px auto;padding:0 16px;color:#111;">
  <h1 style="margin-bottom:4px;">${esc(params.destination)} Offline Pocket Pass</h1>
  <p style="margin-top:0;color:#555;font-size:14px;">Budget: ₹${params.budget.toLocaleString('en-IN')} · Emergency (India): <strong>112</strong> · Tourist Helpline: <strong>1363</strong></p>
  ${daysHtml}
</body>
</html>`;
}

const KNOWN_INDIAN_CITIES = [
  'Agra', 'Ahmedabad', 'Alleppey', 'Amritsar', 'Ayodhya', 'Ballari', 'Bangalore', 'Belagavi',
  'Belgaum', 'Bellary', 'Bengaluru', 'Bhopal', 'Bidar', 'Bijapur', 'Chamarajanagar',
  'Chandigarh', 'Chennai', 'Chikballapur', 'Chikkaballapur', 'Chikmagalur', 'Chitradurga',
  'Coorg', 'Dandeli', 'Darjeeling', 'Davanagere', 'Dehradun', 'Delhi', 'Dharamshala',
  'Dharwad', 'Gadag', 'Gangtok', 'Goa', 'Gokarna', 'Gulbarga', 'Guwahati', 'Hampi',
  'Haridwar', 'Hassan', 'Haveri', 'Hospet', 'Hyderabad', 'Jaipur', 'Jaisalmer', 'Jodhpur',
  'Kalaburagi', 'Kanyakumari', 'Karwar', 'Kochi', 'Kodaikanal', 'Kodagu', 'Kolkata',
  'Kolar', 'Koppal', 'Kovalam', 'Leh', 'Lucknow', 'Madurai', 'Manali', 'Mandya',
  'Mangalore', 'Mangaluru', 'Mumbai', 'Munnar', 'Mussoorie', 'Mysore', 'Mysuru',
  'Nainital', 'Navi Mumbai', 'New Delhi', 'New Digha', 'New Jalpaiguri', 'New Raipur',
  'New Tehri', 'New Town', 'Ooty', 'Pondicherry', 'Pune', 'Pushkar', 'Raichur',
  'Ramanagara', 'Ramnagaram', 'Rishikesh', 'Shillong', 'Shimla', 'Shimoga', 'Shivamogga',
  'Srinagar', 'Tumakuru', 'Tumkur', 'Udaipur', 'Udupi', 'Varanasi', 'Varkala', 'Vijayapura',
  'Wayanad',
];

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[a.length]![b.length]!;
}

/** Auto-correct minor typos in common Indian city names (edit distance <= 2). */
export function resolveCitySpelling(input: string): { city: string; correctedFrom?: string } {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();
  if (lower.length < 4) return { city: trimmed };

  const exact = KNOWN_INDIAN_CITIES.find((c) => c.toLowerCase() === lower);
  if (exact) return { city: exact };

  let bestCity: string | null = null;
  let bestDist = Infinity;
  for (const candidate of KNOWN_INDIAN_CITIES) {
    const dist = levenshtein(lower, candidate.toLowerCase());
    if (dist < bestDist) {
      bestDist = dist;
      bestCity = candidate;
    }
  }

  if (bestCity && bestDist <= 2) {
    return { city: bestCity, correctedFrom: trimmed };
  }
  return { city: trimmed };
}

/** Re-sequence each day's stops to catch morning/sunset Golden Hour outdoors and avoid midday heat/crowds. */
export function applyGoldenHourMode(params: {
  destination: string;
  currentItinerary: ItineraryDay[];
  totalBudget: number;
  transportMode?: TransportMode;
  startPoint?: StartPoint;
}): OptimizationResult {
  const { destination, currentItinerary, totalBudget, transportMode = 'cab', startPoint } = params;
  const nextItinerary = currentItinerary.map((day) => {
    if (day.stops.length <= 1) return day;
    const outdoor = day.stops.filter((s) => s.isOutdoor);
    const indoor = day.stops.filter((s) => !s.isOutdoor);
    const ordered: Stop[] = [];
    if (outdoor.length > 0) ordered.push(outdoor[0]!);
    ordered.push(...indoor);
    if (outdoor.length > 1) ordered.push(...outdoor.slice(1));
    return buildTimedDay(
      ordered,
      destination,
      day.dayNumber,
      day.date,
      day.hasRainAlert,
      day.weatherSummary,
      transportMode,
      startPoint,
    );
  });
  const totalCost = nextItinerary.reduce((s, d) => s + d.totalCost, 0);
  return { itinerary: nextItinerary, totalCost, remainingBudget: totalBudget - totalCost };
}
