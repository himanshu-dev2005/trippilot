import type { AttractionCandidate, Coordinates, StartPoint } from '@/lib/optimizer';

type GooglePlacesResponse = {
  status: string;
  error_message?: string;
  results?: Array<{
    place_id: string;
    name: string;
    geometry?: { location?: { lat: number; lng: number } };
    rating?: number;
    types?: string[];
    price_level?: number;
    formatted_address?: string;
    photos?: Array<{ photo_reference?: string }>;
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
]);

function inferCategoryAndOutdoor(types: string[] = []): { category: string; isOutdoor: boolean } {
  const lower = types.map((t) => t.toLowerCase());
  if (lower.includes('museum') || lower.includes('art_gallery')) return { category: 'Museum', isOutdoor: false };
  if (lower.includes('shopping_mall') || lower.includes('store')) return { category: 'Shopping', isOutdoor: false };
  if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('food')) return { category: 'Food', isOutdoor: false };
  if (lower.includes('hindu_temple') || lower.includes('place_of_worship') || lower.includes('church')) {
    return { category: 'Culture', isOutdoor: false };
  }
  if (lower.includes('park') || lower.includes('natural_feature')) return { category: 'Nature', isOutdoor: true };
  const isOutdoor = lower.some((t) => OUTDOOR_TYPES.has(t));
  return { category: 'Sightseeing', isOutdoor };
}

function priceLevelToInr(priceLevel?: number): number {
  switch (priceLevel) {
    case 0:
      return 0;
    case 1:
      return 200;
    case 2:
      return 500;
    case 3:
      return 1200;
    case 4:
      return 2500;
    default:
      return 250;
  }
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

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${encodeURIComponent(googleKey)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Places request failed (${res.status}).`);
    }
    const data = (await res.json()) as GooglePlacesResponse;
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places error: ${data.error_message || data.status}`);
    }

    const rawResults = (data.results ?? []).slice(0, params.limit ?? 18);
    if (rawResults.length === 0) {
      throw new Error(`No attractions found for "${params.destination}" via Google Places.`);
    }

    const attractions: AttractionCandidate[] = rawResults
      .filter((r) => r.geometry?.location)
      .map((r) => {
        const { category, isOutdoor } = inferCategoryAndOutdoor(r.types);
        return {
          attractionId: r.place_id,
          name: r.name,
          coordinates: {
            lat: r.geometry!.location!.lat,
            lng: r.geometry!.location!.lng,
          },
          category,
          isOutdoor,
          rating: r.rating ?? 4.2,
          duration: category === 'Museum' || category === 'Nature' ? 2.5 : 2,
          cost: priceLevelToInr(r.price_level),
          openingHours: { open: 9, close: 19 },
          ...(r.photos?.[0]?.photo_reference ? { photoReference: r.photos[0].photo_reference } : {}),
          ...(r.formatted_address ? { note: r.formatted_address } : {}),
        };
      });

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
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${query}, ${destination}, India`)}&key=${encodeURIComponent(googleKey)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as GooglePlacesResponse;
      const first = data.results?.[0];
      if (first?.geometry?.location) {
        return {
          name: first.name || query,
          coordinates: first.geometry.location,
        };
      }
    }
  }

  // Fallback to OpenStreetMap Nominatim geocoding for hotel/start point
  const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${query}, ${destination}, India`)}`;
  const osmRes = await fetch(osmUrl, { headers: { 'User-Agent': 'TripPilot/1.0' } });
  if (osmRes.ok) {
    const results = (await osmRes.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
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
