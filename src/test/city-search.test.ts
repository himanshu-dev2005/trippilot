import { describe, expect, it } from 'vitest';
import { searchIndianCities } from '@/lib/indian-cities';
import { optimizeItinerary, recalculateItineraryTransport, type AttractionCandidate } from '@/lib/optimizer';

describe('Prefix-first Indian city autocomplete', () => {
  it('returns ONLY cities starting with "new" when user types "new"', () => {
    const results = searchIndianCities('new');
    expect(results.length).toBeGreaterThanOrEqual(4);
    expect(results[0]?.city.name).toBe('New Delhi');
    for (const r of results) {
      expect(r.city.name.toLowerCase().startsWith('new')).toBe(true);
    }
  });

  it('returns prefix-matching cities for partial prefixes like "jai" and "deh"', () => {
    const jai = searchIndianCities('jai');
    expect(jai.map((r) => r.city.name)).toContain('Jaipur');
    expect(jai.map((r) => r.city.name)).toContain('Jaisalmer');
    expect(jai.every((r) => r.city.name.toLowerCase().startsWith('jai'))).toBe(true);

    const deh = searchIndianCities('deh');
    expect(deh[0]?.city.name).toBe('Dehradun');
  });

  it('falls back to state matches when no city name starts with the query', () => {
    const kerala = searchIndianCities('kerala');
    expect(kerala.length).toBeGreaterThan(0);
    expect(kerala.some((r) => r.city.state === 'Kerala')).toBe(true);
  });

  it('recalculates transit costs when switching transport mode live', () => {
    const spots: AttractionCandidate[] = [
      {
        attractionId: 'a',
        name: "Humayun's Tomb",
        coordinates: { lat: 28.5933, lng: 77.2507 },
        category: 'History',
        isOutdoor: true,
        rating: 4.7,
        duration: 2,
        cost: 40,
        openingHours: { open: 6, close: 18 },
      },
      {
        attractionId: 'b',
        name: 'Qutub Minar',
        coordinates: { lat: 28.5245, lng: 77.1855 },
        category: 'History',
        isOutdoor: true,
        rating: 4.6,
        duration: 2,
        cost: 40,
        openingHours: { open: 7, close: 21 },
      },
    ];
    const cabPlan = optimizeItinerary({
      destination: 'New Delhi',
      attractions: spots,
      numberOfDays: 1,
      budget: 5000,
      transportMode: 'cab',
      startDate: '2026-12-01',
    });
    const walkingPlan = recalculateItineraryTransport({
      destination: 'New Delhi',
      currentItinerary: cabPlan.itinerary,
      totalBudget: 5000,
      transportMode: 'walking',
    });
    expect(cabPlan.itinerary[0]!.transitCost).toBeGreaterThan(0);
    expect(walkingPlan.itinerary[0]!.transitCost).toBe(0);
    expect(walkingPlan.totalCost).toBeLessThan(cabPlan.totalCost);
  });
});
