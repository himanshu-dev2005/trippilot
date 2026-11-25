import type { AttractionCandidate, Coordinates, StartPoint } from '@/lib/optimizer';

type GooglePlacesNewResponse = {
  error?: { message?: string; status?: string };
  places?: Array<{
    id: string;
    displayName?: { text?: string };
    location?: { latitude: number; longitude: number };
    rating?: number;
    types?: string[];
    priceLevel?:
      | 'PRICE_LEVEL_FREE'
      | 'PRICE_LEVEL_INEXPENSIVE'
      | 'PRICE_LEVEL_MODERATE'
      | 'PRICE_LEVEL_EXPENSIVE'
      | 'PRICE_LEVEL_VERY_EXPENSIVE';
    formattedAddress?: string;
    photos?: Array<{ name?: string }>;
  }>;
};

const OUTDOOR_TYPES = new Set([
  'park',
  'natural_feature',
  'campground',
  'zoo',
  'tourist_attraction',
  'amusement_park',
  'beach',
  'national_park',
  'hiking_area',
]);

function inferCategoryAndOutdoor(types: string[] = []): { category: string; isOutdoor: boolean } {
  const lower = types.map((t) => t.toLowerCase());
  if (lower.includes('museum') || lower.includes('art_gallery')) return { category: 'Museum', isOutdoor: false };
  if (lower.includes('shopping_mall') || lower.includes('store')) return { category: 'Shopping', isOutdoor: false };
  if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('food')) return { category: 'Food', isOutdoor: false };
  if (lower.includes('hindu_temple') || lower.includes('place_of_worship') || lower.includes('church')) {
    return { category: 'Culture', isOutdoor: false };
  }
  if (lower.includes('park') || lower.includes('natural_feature') || lower.includes('national_park')) {
    return { category: 'Nature', isOutdoor: true };
  }
  const isOutdoor = lower.some((t) => OUTDOOR_TYPES.has(t));
  return { category: 'Sightseeing', isOutdoor };
}

function priceLevelToInr(priceLevel?: string): number {
  switch (priceLevel) {
    case 'PRICE_LEVEL_FREE':
      return 0;
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 200;
    case 'PRICE_LEVEL_MODERATE':
      return 500;
    case 'PRICE_LEVEL_EXPENSIVE':
      return 1200;
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 2500;
    default:
      return 250;
  }
}

async function searchPlacesNew(
  query: string,
  googleKey: string,
  maxResultCount = 20,
): Promise<NonNullable<GooglePlacesNewResponse['places']>> {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.location,places.rating,places.types,places.priceLevel,places.formattedAddress,places.photos',
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: Math.min(20, maxResultCount),
    }),
  });

  const data = (await res.json()) as GooglePlacesNewResponse;
  if (!res.ok || data.error) {
    throw new Error(`Google Places error: ${data.error?.message || res.statusText}`);
  }
  return data.places ?? [];
}

export async function discoverAttractions(params: {
  destination: string;
  interests: string[];
  limit?: number;
}): Promise<{ center: Coordinates; attractions: AttractionCandidate[]; source: 'google_places' | 'ai_gateway' }> {
  const googleKey = process.env['GOOGLE_PLACES_API_KEY'];
  const lovableKey = process.env['LOVABLE_API_KEY'];

  if (googleKey) {
    const query =
      params.interests.length > 0
        ? `top ${params.interests.slice(0, 3).join(' ')} attractions in ${params.destination}, India`
        : `top tourist attractions in ${params.destination}, India`;

    const rawResults = await searchPlacesNew(query, googleKey, params.limit ?? 18);
    if (rawResults.length === 0) {
      throw new Error(`No attractions found for "${params.destination}" via Google Places.`);
    }

    const attractions: AttractionCandidate[] = rawResults
      .filter((r) => r.location && r.displayName?.text)
      .map((r) => {
        const { category, isOutdoor } = inferCategoryAndOutdoor(r.types);
        const photoName = r.photos?.[0]?.name;
        return {
          attractionId: r.id,
          name: r.displayName!.text!,
          coordinates: {
            lat: r.location!.latitude,
            lng: r.location!.longitude,
          },
          category,
          isOutdoor,
          rating: r.rating ?? 4.2,
          duration: category === 'Museum' || category === 'Nature' ? 2.5 : 2,
          cost: priceLevelToInr(r.priceLevel),
          openingHours: { open: 9, close: 19 },
          ...(photoName ? { photoReference: photoName } : {}),
          ...(r.formattedAddress ? { note: r.formattedAddress } : {}),
        };
      });

    if (attractions.length === 0) {
      throw new Error(`No attractions with valid coordinates found for "${params.destination}".`);
    }

    const center = attractions[0]!.coordinates;
    return { center, attractions, source: 'google_places' };
  }

  if (lovableKey) {
    const prompt = `Provide ${params.limit ?? 16} real tourist attractions (both outdoor and indoor alternatives like museums, temples, malls, cafés) in ${params.destination}, India.
Interests: ${params.interests.length ? params.interests.join(', ') : 'General sightseeing, culture, nature, food'}.
Return ONLY valid JSON:
{
  "center": { "lat": 0.0, "lng": 0.0 },
  "attractions": [
    {
      "attractionId": "slug-id",
      "name": "Place Name",
      "coordinates": { "lat": 0.0, "lng": 0.0 },
      "category": "History | Nature | Food | Culture | Museum | Shopping | Adventure",
      "isOutdoor": true,
      "rating": 4.5,
      "duration": 2,
      "cost": 300,
      "openingHours": { "open": 9, "close": 18 },
      "note": "Concise 1-sentence tip"
    }
  ]
}`;

    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are an Indian travel data API returning accurate WGS84 coordinates, realistic INR entry/activity costs, and opening hours.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Attraction discovery failed (${res.status}).`);
    }
    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = payload.choices?.[0]?.message?.content;
    if (!raw) throw new Error('Empty attraction discovery response.');
    const parsed = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()) as {
      center: Coordinates;
      attractions: AttractionCandidate[];
    };
    return { ...parsed, source: 'ai_gateway' };
  }

  throw new Error(
    'No attraction provider is configured. Set GOOGLE_PLACES_API_KEY (or LOVABLE_API_KEY) in .env / Vercel Environment Variables.',
  );
}

export async function resolveStartPoint(
  hotelOrStart: string,
  destination: string,
): Promise<StartPoint | undefined> {
  const query = hotelOrStart.trim();
  if (!query) return undefined;

  const googleKey = process.env['GOOGLE_PLACES_API_KEY'];
  if (googleKey) {
    try {
      const results = await searchPlacesNew(`${query}, ${destination}, India`, googleKey, 1);
      const first = results[0];
      if (first?.location) {
        return {
          name: first.displayName?.text || query,
          coordinates: { lat: first.location.latitude, lng: first.location.longitude },
        };
      }
    } catch {
      // Fallback to Nominatim below
    }
  }

  const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${query}, ${destination}, India`)}`;
  const osmRes = await fetch(osmUrl, { headers: { 'User-Agent': 'TripPilot/1.0' } });
  if (osmRes.ok) {
    const results = (await osmRes.json()) as Array<{ lat: string; lon: string }>;
    const first = results[0];
    if (first) {
      return {
        name: query,
        coordinates: { lat: Number(first.lat), lng: Number(first.lon) },
      };
    }
  }

  return undefined;
}
