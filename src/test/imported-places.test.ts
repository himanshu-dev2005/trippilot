import { describe, expect, it } from 'vitest';
import {
  KARNATAKA_CITY_CATALOG,
  TRAVEL_RECOMMENDATION_REPO_URL,
  findImportedCityCatalog,
  getImportedAttractionsForCity,
} from '@/lib/karnataka-catalog';
import { discoverAttractions } from '@/lib/places.server';
import { resolveCitySpelling } from '@/lib/optimizer';

describe('Imported travel-recommendation-system catalog', () => {
  it('imports all 29 Karnataka cities and 504 unique attractions with India attribution', () => {
    expect(KARNATAKA_CITY_CATALOG).toHaveLength(29);
    const totalPlaces = KARNATAKA_CITY_CATALOG.reduce((sum, city) => sum + city.places.length, 0);
    expect(totalPlaces).toBe(504);
    expect(KARNATAKA_CITY_CATALOG.every((city) => city.country === 'India')).toBe(true);
    expect(TRAVEL_RECOMMENDATION_REPO_URL).toContain('arshiyaaftab/travel-recommendation-system');
  });

  it('resolves city aliases and converts imported entries to AttractionCandidate items', () => {
    expect(findImportedCityCatalog('Mysuru')?.city).toBe('Mysore');
    expect(findImportedCityCatalog('Bengaluru')?.city).toBe('Bangalore');
    expect(findImportedCityCatalog('Hampi')?.city).toBe('Hospet');

    const mysore = getImportedAttractionsForCity('Mysuru', ['History'], 8);
    expect(mysore).not.toBeNull();
    expect(mysore?.attractions).toHaveLength(8);
    expect(mysore?.attractions[0]?.name).toBe('Mysore Palace');
    expect(mysore?.attractions[0]?.note).toContain('travel-recommendation-system');
  });

  it('recognizes imported Karnataka cities in resolveCitySpelling', () => {
    expect(resolveCitySpelling('Chikmagalur').city).toBe('Chikmagalur');
    expect(resolveCitySpelling('Udupi').city).toBe('Udupi');
  });

  it('returns curated real tourist spots for Dehradun', async () => {
    const result = await discoverAttractions({
      destination: 'Dehradun',
      interests: ['Nature', 'Culture'],
      limit: 12,
    });
    expect(result.source).toBe('curated');
    const names = result.attractions.map((a) => a.name);
    expect(names).toContain("Gucchupani Robbers' Cave");
    expect(names).toContain('Tapkeshwar Mahadev Mandir');
    expect(names).toContain('Mindrolling Monastery');
    expect(names).toContain('Dehradun Zoo (Malsi Deer Park)');
    expect(names).toContain('Sahastradhara Ropeway & Springs');
    expect(names).toContain('Shikhar Falls');
    expect(names).toContain('Gandhi Park');
  });
});
