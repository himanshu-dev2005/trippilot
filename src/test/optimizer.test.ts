import { describe, expect, it } from 'vitest';
import {
  applyWeatherAdjustment,
  generatePackingChecklist,
  kMeansCluster,
  moveStopBetweenDays,
  nearestNeighbourOrder,
  optimizeItinerary,
  regenerateSingleDay,
  removeStopFromDay,
  reorderStopInDay,
  replanForBudget,
  totalRouteDistanceKm,
  twoOptImprove,
  type AttractionCandidate,
} from '@/lib/optimizer';

function makeSpot(
  id: string,
  lat: number,
  lng: number,
  overrides: Partial<AttractionCandidate> = {},
): AttractionCandidate {
  return {
    attractionId: id,
    name: `Spot ${id}`,
    coordinates: { lat, lng },
    category: 'History',
    isOutdoor: false,
    rating: 4.5,
    duration: 2,
    cost: 300,
    openingHours: { open: 9, close: 19 },
    ...overrides,
  };
}

describe('Optimization Engine', () => {
  it('Stage 1: k-means clusters geographically separated attractions into coherent day groups', () => {
    const northCluster = [makeSpot('n1', 30.35, 78.0), makeSpot('n2', 30.355, 78.005)];
    const southCluster = [makeSpot('s1', 30.2, 78.15), makeSpot('s2', 30.205, 78.155)];
    const clusters = kMeansCluster([...northCluster, ...southCluster], 2);

    expect(clusters).toHaveLength(2);
    const groupAIds = clusters[0]!.map((s) => s.attractionId).sort();
    const groupBIds = clusters[1]!.map((s) => s.attractionId).sort();
    expect([groupAIds, groupBIds]).toContainEqual(['n1', 'n2']);
    expect([groupAIds, groupBIds]).toContainEqual(['s1', 's2']);
  });

  it('Stage 2: nearest-neighbour + 2-opt produces a shorter or equal route than unoptimized order', () => {
    // Crossing path: A -> C -> B -> D vs A -> B -> C -> D
    const a = makeSpot('a', 30.30, 78.00);
    const b = makeSpot('b', 30.31, 78.01);
    const c = makeSpot('c', 30.33, 78.03);
    const d = makeSpot('d', 30.35, 78.05);

    const crossing = [a, c, b, d];
    const nn = nearestNeighbourOrder(crossing);
    const opt = twoOptImprove(nn);

    expect(totalRouteDistanceKm(opt)).toBeLessThanOrEqual(totalRouteDistanceKm(crossing));
    expect(opt).toHaveLength(4);
  });

  it('Stage 3: enforces opening hours, daily time, and total budget constraints', () => {
    const spots = [
      makeSpot('early', 30.31, 78.01, { openingHours: { open: 9, close: 12 }, cost: 500, duration: 2 }),
      makeSpot('expensive', 30.32, 78.02, { cost: 5000, duration: 2 }),
      makeSpot('late-closed', 30.33, 78.03, { openingHours: { open: 6, close: 9 }, cost: 100, duration: 2 }),
    ];

    const result = optimizeItinerary({
      destination: 'Dehradun',
      attractions: spots,
      numberOfDays: 1,
      budget: 1000,
      startDate: '2026-12-01',
    });

    expect(result.totalCost).toBeLessThanOrEqual(1000);
    const stopIds = result.itinerary[0]!.stops.map((s) => s.attractionId);
    expect(stopIds).toContain('early');
    expect(stopIds).not.toContain('expensive');
    expect(stopIds).not.toContain('late-closed');
  });

  it('regenerates a single day without altering other days', () => {
    const spots = [
      makeSpot('d1a', 30.31, 78.01),
      makeSpot('d1b', 30.315, 78.015),
      makeSpot('d2a', 30.21, 78.12),
      makeSpot('d2b', 30.215, 78.125),
      makeSpot('extra', 30.22, 78.13),
    ];

    const initial = optimizeItinerary({
      destination: 'Dehradun',
      attractions: spots,
      numberOfDays: 2,
      budget: 5000,
      startDate: '2026-12-01',
    });

    const regenerated = regenerateSingleDay({
      destination: 'Dehradun',
      currentItinerary: initial.itinerary,
      dayNumber: 2,
      allCandidates: spots,
      totalBudget: 5000,
    });

    expect(regenerated.itinerary[0]).toEqual(initial.itinerary[0]);
    expect(regenerated.itinerary[1]!.stops.map((s) => s.attractionId)).toContain('extra');
  });

  it('re-plans when budget is reduced', () => {
    const spots = [
      makeSpot('cheap', 30.31, 78.01, { cost: 200 }),
      makeSpot('pricey', 30.32, 78.02, { cost: 1500 }),
    ];

    const initial = optimizeItinerary({
      destination: 'Jaipur',
      attractions: spots,
      numberOfDays: 1,
      budget: 2000,
      startDate: '2026-12-01',
    });
    expect(initial.itinerary[0]!.activityCost).toBe(1700);
    expect(initial.totalCost).toBeGreaterThanOrEqual(1700);

    const replanned = replanForBudget({
      destination: 'Jaipur',
      currentItinerary: initial.itinerary,
      allCandidates: spots,
      newBudget: 500,
    });
    expect(replanned.totalCost).toBeLessThanOrEqual(500);
    expect(replanned.itinerary[0]!.stops.map((s) => s.attractionId)).toEqual(['cheap']);
  });

  it('swaps outdoor stops for indoor alternatives on rainy days only', () => {
    const indoorDay1 = makeSpot('fort', 30.20, 78.00, { isOutdoor: false, category: 'Museum' });
    const outdoor = makeSpot('park', 30.40, 78.20, { isOutdoor: true, category: 'Nature' });
    const indoorSpare = makeSpot('museum', 30.405, 78.205, { isOutdoor: false, category: 'Museum' });

    const initial = optimizeItinerary({
      destination: 'Dehradun',
      attractions: [indoorDay1, outdoor],
      numberOfDays: 2,
      budget: 3000,
      startDate: '2026-12-01',
      dailyWeather: [
        { hasRain: false, summary: 'Clear' },
        { hasRain: true, summary: 'Rain expected' },
      ],
    });

    const rainyDay = initial.itinerary.find((d) => d.hasRainAlert)!;
    const clearDay = initial.itinerary.find((d) => !d.hasRainAlert)!;
    expect(rainyDay).toBeDefined();

    const adjusted = applyWeatherAdjustment({
      destination: 'Dehradun',
      currentItinerary: initial.itinerary,
      allCandidates: [outdoor, indoorDay1, indoorSpare],
      totalBudget: 3000,
    });

    const adjustedRainyDay = adjusted.itinerary.find((d) => d.dayNumber === rainyDay.dayNumber)!;
    const adjustedClearDay = adjusted.itinerary.find((d) => d.dayNumber === clearDay.dayNumber)!;

    expect(adjustedClearDay).toEqual(clearDay);
    expect(adjustedRainyDay.stops.some((s) => s.isOutdoor)).toBe(false);
    expect(adjustedRainyDay.stops.map((s) => s.attractionId)).toContain('museum');
  });

  it('supports manual stop reordering, moving between days, and removal', () => {
    const spots = [
      makeSpot('s1', 30.20, 78.00),
      makeSpot('s2', 30.21, 78.01),
      makeSpot('s3', 30.40, 78.20),
    ];

    const initial = optimizeItinerary({
      destination: 'Dehradun',
      attractions: spots,
      numberOfDays: 2,
      budget: 5000,
      transportMode: 'walking',
      startDate: '2026-12-01',
    });

    const reordered = reorderStopInDay({
      destination: 'Dehradun',
      currentItinerary: initial.itinerary,
      dayNumber: 1,
      fromIndex: 0,
      toIndex: 1,
      totalBudget: 5000,
      transportMode: 'walking',
    });
    expect(reordered.itinerary[0]!.stops.map((s) => s.attractionId)).toEqual(['s2', 's1']);

    const moved = moveStopBetweenDays({
      destination: 'Dehradun',
      currentItinerary: reordered.itinerary,
      fromDay: 1,
      toDay: 2,
      attractionId: 's1',
      totalBudget: 5000,
      transportMode: 'walking',
    });
    expect(moved.itinerary[0]!.stops).toHaveLength(1);
    expect(moved.itinerary[1]!.stops).toHaveLength(2);

    const removed = removeStopFromDay({
      destination: 'Dehradun',
      currentItinerary: moved.itinerary,
      dayNumber: 2,
      attractionId: 's1',
      totalBudget: 5000,
      transportMode: 'walking',
    });
    expect(removed.itinerary[1]!.stops).toHaveLength(1);
  });

  it('generates weather-aware packing checklist items', () => {
    const initial = optimizeItinerary({
      destination: 'Dehradun',
      attractions: [makeSpot('p1', 30.3, 78.0, { isOutdoor: true, category: 'Culture' })],
      numberOfDays: 1,
      budget: 2000,
      dailyWeather: [{ hasRain: true, summary: 'Rain' }],
    });
    const checklist = generatePackingChecklist(initial.itinerary);
    expect(checklist.some((i) => i.id === 'umbrella')).toBe(true);
    expect(checklist.some((i) => i.id === 'modest')).toBe(true);
  });
});
