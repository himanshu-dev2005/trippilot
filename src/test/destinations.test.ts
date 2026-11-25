import { describe, expect, it } from 'vitest';
import { destinations, planTrip } from '@/lib/destinations';

describe('Available destinations', () => {
  it('offers only Indian destinations for now', () => {
    expect(destinations.length).toBeGreaterThan(0);
    expect(destinations.map(destination => destination.country)).toEqual(destinations.map(() => 'India'));
    expect(destinations.some(destination => destination.id === 'paris' || destination.id === 'bali')).toBe(false);
  });

  it('includes the sourced Dehradun attractions in a two-day itinerary', () => {
    const dehradun = destinations.find(destination => destination.id === 'dehradun');
    expect(dehradun?.country).toBe('India');
    expect(dehradun?.spots).toHaveLength(6);
    if (!dehradun) throw new Error('Dehradun is missing');
    const itinerary = planTrip(dehradun.spots, 2);
    expect(itinerary.flat()).toHaveLength(6);
    expect(itinerary.flat().map(spot => spot.name)).toContain('Forest Research Institute');
    expect(dehradun.spots.every(spot => spot.sourceUrl?.startsWith('https://www.tripadvisor.in/Attraction_Review-'))).toBe(true);
  });
});