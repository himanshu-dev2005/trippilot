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
}): Promise<{ center: Coordinates; attractions: AttractionCandidate[]; source: 'gemini' | 'google_places' | 'ai_gateway' | 'openstreetmap' }> {
  const geminiKey =
    process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'] || process.env['GOOGLE_PLACES_API_KEY'];
  const googleKey = process.env['GOOGLE_PLACES_API_KEY'];
  const lovableKey = process.env['LOVABLE_API_KEY'];

  if (geminiKey) {
    try {
      const prompt = `Curate ${params.limit ?? 16} of the best, real, non-random tourist attractions (a balanced mix of iconic sights, local culture, food spots, and indoor alternatives for bad weather) in ${params.destination}, India.
Traveler interests: ${params.interests.length ? params.interests.join(', ') : 'General sightseeing, culture, nature, food'}.
Return ONLY valid JSON matching this exact shape:
{
  "center": { "lat": 0.0, "lng": 0.0 },
  "attractions": [
    {
      "attractionId": "slug-id",
      "name": "Exact Real Place Name",
      "coordinates": { "lat": 0.0, "lng": 0.0 },
      "category": "History | Nature | Food | Culture | Museum | Shopping | Adventure | Sightseeing",
      "isOutdoor": true,
      "rating": 4.5,
      "duration": 2,
      "cost": 300,
      "openingHours": { "open": 9, "close": 18 },
      "note": "Concise 1-sentence local tip"
    }
  ]
}`;

      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.25,
              responseMimeType: 'application/json',
            },
          }),
          signal: AbortSignal.timeout(8000),
        },
      );

      if (gemRes.ok) {
        const gemJson = (await gemRes.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const rawText = gemJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(
            rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim(),
          ) as { center?: Coordinates; attractions?: AttractionCandidate[] };
          const valid = (parsed.attractions ?? []).filter(
            (a) =>
              a.name &&
              a.coordinates &&
              Number.isFinite(a.coordinates.lat) &&
              Number.isFinite(a.coordinates.lng),
          );
          if (valid.length >= 4 && parsed.center) {
            return { center: parsed.center, attractions: valid, source: 'gemini' };
          }
        }
      }
    } catch {
      // Fall through to Google Places / AI Gateway / OpenStreetMap fallback
    }
  }

  if (googleKey) {
    try {
      const query =
        params.interests.length > 0
          ? `top ${params.interests.slice(0, 3).join(' ')} attractions in ${params.destination}, India`
          : `top tourist attractions in ${params.destination}, India`;

      const rawResults = await searchPlacesNew(query, googleKey, params.limit ?? 18);
      if (rawResults.length > 0) {
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

        if (attractions.length > 0) {
          const center = attractions[0]!.coordinates;
          return { center, attractions, source: 'google_places' };
        }
      }
    } catch {
      // Fall through to AI Gateway or OpenStreetMap fallback
    }
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

  // Zero-key OpenStreetMap (Nominatim + Overpass API) + Wikipedia GeoSearch fallback
  const osmGeoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${params.destination}, India`)}`,
    {
      headers: { 'User-Agent': 'TripPilot/1.0' },
      signal: AbortSignal.timeout(5000),
    },
  );
  if (!osmGeoRes.ok) {
    throw new Error(`Could not look up "${params.destination}" on OpenStreetMap.`);
  }
  const geoList = (await osmGeoRes.json()) as Array<{ lat: string; lon: string }>;
  const cityGeo = geoList[0];
  if (!cityGeo) {
    throw new Error(`No location found for "${params.destination}, India".`);
  }

  const center: Coordinates = { lat: Number(cityGeo.lat), lng: Number(cityGeo.lon) };
  const overpassQuery = `[out:json][timeout:6];
(
  node["tourism"~"attraction|museum|viewpoint"]["name"](around:12000,${center.lat},${center.lng});
  node["historic"~"monument|fort|palace|ruins"]["name"](around:12000,${center.lat},${center.lng});
  node["leisure"~"park|garden"]["name"](around:12000,${center.lat},${center.lng});
  node["amenity"~"place_of_worship|cafe"]["name"](around:8000,${center.lat},${center.lng});
);
out ${Math.min(35, (params.limit ?? 18) * 2)};`;

  const overpassMirrors = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ];

  type OverpassResponse = {
    elements?: Array<{
      type: string;
      id: number;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }>;
  };

  async function fetchOverpass(): Promise<OverpassResponse | null> {
    for (const endpoint of overpassMirrors) {
      try {
        const overpassRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain', 'User-Agent': 'TripPilot/1.0' },
          body: overpassQuery,
          signal: AbortSignal.timeout(3500),
        });
        if (overpassRes.ok) {
          const json = (await overpassRes.json()) as OverpassResponse;
          if (json.elements?.length) return json;
        }
      } catch {
        // Try next mirror
      }
    }
    return null;
  }

  async function fetchWikiGeo(): Promise<Array<{ pageid: number; title: string; lat: number; lon: number }>> {
    try {
      const wikiRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${center.lat}|${center.lng}&gsradius=10000&gslimit=45&format=json`,
        {
          headers: { 'User-Agent': 'TripPilot/1.0' },
          signal: AbortSignal.timeout(4000),
        },
      );
      if (!wikiRes.ok) return [];
      const wikiJson = (await wikiRes.json()) as {
        query?: { geosearch?: Array<{ pageid: number; title: string; lat: number; lon: number }> };
      };
      return wikiJson.query?.geosearch ?? [];
    } catch {
      return [];
    }
  }

  const [overpassJson, wikiItems] = await Promise.all([fetchOverpass(), fetchWikiGeo()]);

  const seen = new Set<string>();
  const attractions: AttractionCandidate[] = [];

  for (const el of overpassJson?.elements ?? []) {
    const name = el.tags?.['name:en'] || el.tags?.['name'];
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!name || lat === undefined || lng === undefined) continue;
    const norm = name.trim().toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);

    const tourism = el.tags?.['tourism'] ?? '';
    const historic = el.tags?.['historic'] ?? '';
    const leisure = el.tags?.['leisure'] ?? '';
    const amenity = el.tags?.['amenity'] ?? '';

    let category = 'Sightseeing';
    let isOutdoor = true;
    let cost = 100;

    if (tourism === 'museum') {
      category = 'Museum';
      isOutdoor = false;
      cost = 200;
    } else if (historic) {
      category = 'History';
      isOutdoor = true;
      cost = 250;
    } else if (leisure === 'park' || leisure === 'garden' || tourism === 'viewpoint') {
      category = 'Nature';
      isOutdoor = true;
      cost = 50;
    } else if (amenity === 'place_of_worship') {
      category = 'Culture';
      isOutdoor = false;
      cost = 0;
    } else if (amenity === 'cafe') {
      category = 'Food';
      isOutdoor = false;
      cost = 400;
    }

    attractions.push({
      attractionId: `osm-${el.type}-${el.id}`,
      name,
      coordinates: { lat, lng },
      category,
      isOutdoor,
      rating: 4.3,
      duration: category === 'Food' ? 1.5 : 2,
      cost,
      openingHours: { open: 9, close: 19 },
      ...(el.tags?.['addr:street'] ? { note: el.tags['addr:street'] } : {}),
    });

    if (attractions.length >= (params.limit ?? 18)) break;
  }

  // Fallback to Wikipedia GeoSearch if Overpass mirrors are unavailable
  if (attractions.length === 0 && wikiItems.length > 0) {
    const ignorePattern = /election|constituency|municipal|ward|tehsil|district|school|hospital|university|college|academy/i;

    for (const item of wikiItems) {
      if (ignorePattern.test(item.title)) continue;
      const lower = item.title.toLowerCase();
      let category = 'Sightseeing';
      let isOutdoor = true;
      let cost = 150;

      if (/museum|gallery|planetarium/.test(lower)) {
        category = 'Museum';
        isOutdoor = false;
        cost = 200;
      } else if (/temple|mandir|church|mosque|masjid|gurudwara|ghat|ashram|monastery/.test(lower)) {
        category = 'Culture';
        isOutdoor = false;
        cost = 0;
      } else if (/fort|palace|mahal|tomb|memorial|gate|monument/.test(lower)) {
        category = 'History';
        isOutdoor = true;
        cost = 250;
      } else if (/park|garden|lake|falls|waterfall|hill|peak|beach|forest|zoo/.test(lower)) {
        category = 'Nature';
        isOutdoor = true;
        cost = 100;
      } else if (/market|bazaar|mall/.test(lower)) {
        category = 'Shopping';
        isOutdoor = false;
        cost = 300;
      }

      attractions.push({
        attractionId: `wiki-${item.pageid}`,
        name: item.title,
        coordinates: { lat: item.lat, lng: item.lon },
        category,
        isOutdoor,
        rating: 4.3,
        duration: 2,
        cost,
        openingHours: { open: 9, close: 19 },
      });
      if (attractions.length >= (params.limit ?? 18)) break;
    }
  }

  if (attractions.length === 0) {
    throw new Error(`No attractions found near "${params.destination}".`);
  }

  return { center, attractions, source: 'openstreetmap' };
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
  const osmRes = await fetch(osmUrl, {
    headers: { 'User-Agent': 'TripPilot/1.0' },
    signal: AbortSignal.timeout(4000),
  });
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
