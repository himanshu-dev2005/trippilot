import type { AttractionCandidate, Coordinates, StartPoint } from '@/lib/optimizer';
import { destinations } from '@/lib/destinations';
import { getImportedAttractionsForCity } from '@/lib/karnataka-catalog';

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

function buildCurationPrompt(destination: string, interests: string[], limit: number): string {
  return `Curate ${limit} of the best, real, non-random tourist attractions (a balanced mix of iconic sights, local culture, food spots, and indoor alternatives for bad weather) in ${destination}, India.
Traveler interests: ${interests.length ? interests.join(', ') : 'General sightseeing, culture, nature, food'}.
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
}

// Batch-enrich AI-curated attractions with real Google Places photoReference values.
// Without this, StopPhoto falls through to Wikipedia which may return unrelated images.
async function enrichWithGooglePhotos(
  attractions: AttractionCandidate[],
  destination: string,
  googleKey: string,
): Promise<AttractionCandidate[]> {
  const CONCURRENCY = 5;
  const results: AttractionCandidate[] = [];
  for (let i = 0; i < attractions.length; i += CONCURRENCY) {
    const batch = attractions.slice(i, i + CONCURRENCY);
    const enriched = await Promise.all(
      batch.map(async (a) => {
        // Skip if already has a valid photoReference from Google Places
        if (a.photoReference?.startsWith('places/')) return a;
        try {
          const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': googleKey,
              'X-Goog-FieldMask': 'places.id,places.photos,places.rating',
            },
            body: JSON.stringify({
              textQuery: `${a.name}, ${destination}, India`,
              maxResultCount: 1,
            }),
            signal: AbortSignal.timeout(3500),
          });
          if (!res.ok) return a;
          const json = (await res.json()) as {
            places?: Array<{ id?: string; photos?: Array<{ name?: string }>; rating?: number }>;
          };
          const place = json.places?.[0];
          if (!place) return a;
          return {
            ...a,
            ...(place.photos?.[0]?.name ? { photoReference: place.photos[0].name } : {}),
            ...(place.rating && !a.rating ? { rating: place.rating } : {}),
          };
        } catch {
          return a;
        }
      }),
    );
    results.push(...enriched);
  }
  return results;
}

function parseCuratedAttractions(
  rawText: string,
): { center: Coordinates; attractions: AttractionCandidate[] } | null {
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
    return { center: parsed.center, attractions: valid };
  }
  return null;
}

const VERIFIED_DEHRADUN_ATTRACTIONS: AttractionCandidate[] = [
  {
    attractionId: 'ddn-robbers-cave',
    name: "Gucchupani Robbers' Cave",
    coordinates: { lat: 30.3787, lng: 78.0635 },
    category: 'Nature',
    isOutdoor: true,
    rating: 4.6,
    duration: 2,
    cost: 40,
    openingHours: { open: 7, close: 18 },
    note: 'River cave and gorge where you wade through cold stream water between narrow rock walls; entry ₹25–₹50 (cash-only).',
  },
  {
    attractionId: 'ddn-tapkeshwar-mandir',
    name: 'Tapkeshwar Mahadev Mandir',
    coordinates: { lat: 30.3573, lng: 78.0162 },
    category: 'Culture',
    isOutdoor: false,
    rating: 4.7,
    duration: 1.5,
    cost: 0,
    openingHours: { open: 4, close: 22.5 },
    note: 'Cave shrine along the Tamsa River with natural water dripping onto the Shivling; peaceful on weekday mornings.',
  },
  {
    attractionId: 'ddn-mindrolling-monastery',
    name: 'Mindrolling Monastery',
    coordinates: { lat: 30.2618, lng: 77.9973 },
    category: 'Culture',
    isOutdoor: false,
    rating: 4.7,
    duration: 2,
    cost: 0,
    openingHours: { open: 7, close: 18 },
    note: 'Major Tibetan Buddhist center and Great Stupa complex in Clement Town.',
  },
  {
    attractionId: 'ddn-dehradun-zoo',
    name: 'Dehradun Zoo (Malsi Deer Park)',
    coordinates: { lat: 30.3902, lng: 78.0749 },
    category: 'Nature',
    isOutdoor: true,
    rating: 4.3,
    duration: 2.5,
    cost: 60,
    openingHours: { open: 9, close: 17 },
    note: 'Set in the Shivalik foothills on Mussoorie Road (closed Mondays); entry around ₹60.',
  },
  {
    attractionId: 'ddn-sahastradhara',
    name: 'Sahastradhara Ropeway & Springs',
    coordinates: { lat: 30.3853, lng: 78.1298 },
    category: 'Adventure',
    isOutdoor: true,
    rating: 4.4,
    duration: 2.5,
    cost: 200,
    openingHours: { open: 9.5, close: 19 },
    note: 'Scenic ropeway ride near sulphur springs and Doon Valley hill views.',
  },
  {
    attractionId: 'ddn-shikhar-falls',
    name: 'Shikhar Falls',
    coordinates: { lat: 30.4112, lng: 78.0981 },
    category: 'Nature',
    isOutdoor: true,
    rating: 4.5,
    duration: 2.5,
    cost: 0,
    openingHours: { open: 6, close: 18 },
    note: 'Offbeat waterfall reached via a rugged ~1 km trail; carry cash and water as there are no restrooms on site.',
  },
  {
    attractionId: 'ddn-gandhi-park',
    name: 'Gandhi Park',
    coordinates: { lat: 30.3259, lng: 78.0458 },
    category: 'Nature',
    isOutdoor: true,
    rating: 4.2,
    duration: 1.5,
    cost: 20,
    openingHours: { open: 5, close: 19 },
    note: 'Central city park off Rajpur Road with walking paths and a nominal entry fee.',
  },
  {
    attractionId: 'ddn-fri',
    name: 'Forest Research Institute',
    coordinates: { lat: 30.3438, lng: 77.9996 },
    category: 'History',
    isOutdoor: true,
    rating: 4.5,
    duration: 2.5,
    cost: 50,
    openingHours: { open: 9, close: 17.5 },
    note: "Explore the institute's colonial Greco-Roman architecture and green campus.",
  },
  {
    attractionId: 'ddn-lacchiwalla',
    name: 'Lacchiwalla Nature Park',
    coordinates: { lat: 30.2145, lng: 78.1331 },
    category: 'Nature',
    isOutdoor: true,
    rating: 4.0,
    duration: 2.5,
    cost: 50,
    openingHours: { open: 8, close: 17 },
    note: 'Forested picnic spot and stream area; check current access to water areas.',
  },
  {
    attractionId: 'ddn-oil-museum',
    name: 'Subir Raha Oil Museum',
    coordinates: { lat: 30.3358, lng: 78.0195 },
    category: 'Museum',
    isOutdoor: false,
    rating: 4.5,
    duration: 1.5,
    cost: 0,
    openingHours: { open: 10, close: 17 },
    note: 'ONGC museum showcasing petroleum and energy industry exhibits.',
  },
  {
    attractionId: 'ddn-shiv-mandir',
    name: 'Shiv Mandir',
    coordinates: { lat: 30.3911, lng: 78.0815 },
    category: 'Culture',
    isOutdoor: false,
    rating: 4.5,
    duration: 1,
    cost: 0,
    openingHours: { open: 6, close: 20 },
    note: 'Visit the hillside Shiva temple on the Dehradun–Mussoorie route.',
  },
  {
    attractionId: 'ddn-pacific-mall',
    name: 'Pacific Mall',
    coordinates: { lat: 30.3626, lng: 78.0679 },
    category: 'Shopping',
    isOutdoor: false,
    rating: 4.2,
    duration: 2,
    cost: 200,
    openingHours: { open: 10, close: 22 },
    note: 'Browse shops and stop for a meal on Rajpur Road.',
  },
];

const VERIFIED_CURATED_CITIES: Record<string, { center: Coordinates; attractions: AttractionCandidate[] }> = {
  'new delhi': {
    center: { lat: 28.6139, lng: 77.209 },
    attractions: [
      { attractionId: 'del-humayun', name: "Humayun's Tomb", coordinates: { lat: 28.5933, lng: 77.2507 }, category: 'History', isOutdoor: true, rating: 4.7, duration: 2, cost: 40, openingHours: { open: 6, close: 18 }, note: 'UNESCO Mughal garden-tomb; morning light over the red sandstone facade is unforgettable.' },
      { attractionId: 'del-qutub', name: 'Qutub Minar', coordinates: { lat: 28.5245, lng: 77.1855 }, category: 'History', isOutdoor: true, rating: 4.6, duration: 2, cost: 40, openingHours: { open: 7, close: 21 }, note: '73-metre victory tower and Iron Pillar in Mehrauli Archaeological Park.' },
      { attractionId: 'del-india-gate', name: 'India Gate', coordinates: { lat: 28.6129, lng: 77.2295 }, category: 'Sightseeing', isOutdoor: true, rating: 4.6, duration: 1.5, cost: 0, openingHours: { open: 6, close: 22 }, note: 'Iconic war memorial along Kartavya Path; lively at sunset.' },
      { attractionId: 'del-red-fort', name: 'Red Fort', coordinates: { lat: 28.6562, lng: 77.241 }, category: 'History', isOutdoor: true, rating: 4.5, duration: 2.5, cost: 50, openingHours: { open: 9.5, close: 16.5 }, note: 'Shah Jahan’s 17th-century citadel in Old Delhi (closed Mondays).' },
      { attractionId: 'del-national-museum', name: 'National Museum, New Delhi', coordinates: { lat: 28.6118, lng: 77.2193 }, category: 'Museum', isOutdoor: false, rating: 4.6, duration: 2.5, cost: 20, openingHours: { open: 10, close: 18 }, note: 'Indus Valley, Buddhist, and Mughal galleries (closed Mondays); great indoor stop.' },
      { attractionId: 'del-lodhi', name: 'Lodhi Gardens', coordinates: { lat: 28.5931, lng: 77.2197 }, category: 'Nature', isOutdoor: true, rating: 4.7, duration: 1.5, cost: 0, openingHours: { open: 6, close: 20 }, note: '15th-century Sayyid and Lodhi tombs set inside lush walking lawns.' },
      { attractionId: 'del-lotus', name: 'Lotus Temple', coordinates: { lat: 28.5535, lng: 77.2588 }, category: 'Culture', isOutdoor: false, rating: 4.6, duration: 1.5, cost: 0, openingHours: { open: 9, close: 17 }, note: 'Marble Baháʼí House of Worship (closed Mondays); quiet contemplation hall.' },
      { attractionId: 'del-chandni-chowk', name: 'Chandni Chowk', coordinates: { lat: 28.6506, lng: 77.2303 }, category: 'Food', isOutdoor: true, rating: 4.5, duration: 2, cost: 350, openingHours: { open: 10, close: 20 }, note: 'Historic spice bazaar and Old Delhi street-food trail near Jama Masjid.' },
      { attractionId: 'del-bangla-sahib', name: 'Gurudwara Bangla Sahib', coordinates: { lat: 28.6264, lng: 77.2091 }, category: 'Culture', isOutdoor: false, rating: 4.8, duration: 1.5, cost: 0, openingHours: { open: 5, close: 22 }, note: 'Golden-domed Sikh shrine with a tranquil sarovar pond and community langar.' },
      { attractionId: 'del-khan-market', name: 'Khan Market', coordinates: { lat: 28.6001, lng: 77.227 }, category: 'Shopping', isOutdoor: false, rating: 4.4, duration: 1.5, cost: 400, openingHours: { open: 10, close: 22 }, note: 'Independent bookshops, cafés, and boutiques near Lodhi Gardens.' },
      { attractionId: 'del-akshardham', name: 'Swaminarayan Akshardham', coordinates: { lat: 28.6127, lng: 77.2773 }, category: 'Culture', isOutdoor: false, rating: 4.7, duration: 2.5, cost: 0, openingHours: { open: 10, close: 18.5 }, note: 'Intricately carved sandstone temple complex (closed Mondays; phones stored in lockers).' },
      { attractionId: 'del-sunder-nursery', name: 'Sunder Nursery', coordinates: { lat: 28.5973, lng: 77.2454 }, category: 'Nature', isOutdoor: true, rating: 4.7, duration: 1.5, cost: 50, openingHours: { open: 7, close: 20 }, note: '90-acre heritage park right across from Humayun’s Tomb with Mughal pavilions.' },
    ],
  },
  varanasi: {
    center: { lat: 25.3176, lng: 83.0059 },
    attractions: [
      { attractionId: 'vns-dashashwamedh', name: 'Dashashwamedh Ghat', coordinates: { lat: 25.3068, lng: 83.0104 }, category: 'Culture', isOutdoor: true, rating: 4.8, duration: 2, cost: 0, openingHours: { open: 5, close: 21 }, note: 'Principal river ghat famous for sunrise boat rides and the evening Ganga Aarti.' },
      { attractionId: 'vns-kashi-vishwanath', name: 'Kashi Vishwanath Temple', coordinates: { lat: 25.3109, lng: 83.0107 }, category: 'Culture', isOutdoor: false, rating: 4.8, duration: 2, cost: 0, openingHours: { open: 4, close: 22 }, note: 'Gold-spired Jyotirlinga shrine connected directly to the riverfront corridor.' },
      { attractionId: 'vns-assi-ghat', name: 'Assi Ghat', coordinates: { lat: 25.2892, lng: 83.0067 }, category: 'Culture', isOutdoor: true, rating: 4.7, duration: 1.5, cost: 0, openingHours: { open: 5, close: 21 }, note: 'Southernmost ghat known for Subah-e-Banaras dawn music and riverside cafés.' },
      { attractionId: 'vns-sarnath', name: 'Sarnath', coordinates: { lat: 25.3763, lng: 83.0227 }, category: 'History', isOutdoor: true, rating: 4.7, duration: 2.5, cost: 40, openingHours: { open: 6, close: 18 }, note: 'Dhamek Stupa and archaeological park where Buddha delivered his first sermon.' },
      { attractionId: 'vns-sarnath-museum', name: 'Sarnath Archaeological Museum', coordinates: { lat: 25.3788, lng: 83.0218 }, category: 'Museum', isOutdoor: false, rating: 4.6, duration: 1.5, cost: 20, openingHours: { open: 9, close: 17 }, note: 'Houses the original Mauryan Lion Capital of Ashoka (closed Fridays).' },
      { attractionId: 'vns-ramnagar-fort', name: 'Ramnagar Fort', coordinates: { lat: 25.2699, lng: 83.0247 }, category: 'History', isOutdoor: false, rating: 4.3, duration: 2, cost: 50, openingHours: { open: 10, close: 17 }, note: '18th-century sandstone fort and museum on the eastern bank of the Ganges.' },
      { attractionId: 'vns-bhu-temple', name: 'New Vishwanath Temple', coordinates: { lat: 25.2657, lng: 82.9895 }, category: 'Culture', isOutdoor: false, rating: 4.7, duration: 1.5, cost: 0, openingHours: { open: 5, close: 20 }, note: 'Peaceful marble spire temple inside Banaras Hindu University campus.' },
      { attractionId: 'vns-bharat-kala', name: 'Bharat Kala Bhavan', coordinates: { lat: 25.2683, lng: 82.9963 }, category: 'Museum', isOutdoor: false, rating: 4.5, duration: 1.5, cost: 20, openingHours: { open: 10.5, close: 16.5 }, note: 'Fine collection of miniature paintings, textiles, and ancient Banaras sculptures.' },
      { attractionId: 'vns-blue-lassi', name: 'Kachori Gali & Local Cafés', coordinates: { lat: 25.3102, lng: 83.0112 }, category: 'Food', isOutdoor: false, rating: 4.6, duration: 1.5, cost: 250, openingHours: { open: 8, close: 21 }, note: 'Historic narrow lane near the ghats for Banarasi kachori, malaiyyo, and clay-cup lassi.' },
    ],
  },
  udaipur: {
    center: { lat: 24.5854, lng: 73.7125 },
    attractions: [
      { attractionId: 'udr-city-palace', name: 'City Palace, Udaipur', coordinates: { lat: 24.5764, lng: 73.6835 }, category: 'History', isOutdoor: false, rating: 4.7, duration: 2.5, cost: 400, openingHours: { open: 9.5, close: 17.5 }, note: 'Hilltop Mewar palace complex overlooking Lake Pichola with mirror courtyards.' },
      { attractionId: 'udr-pichola', name: 'Lake Pichola', coordinates: { lat: 24.572, lng: 73.679 }, category: 'Nature', isOutdoor: true, rating: 4.8, duration: 2, cost: 500, openingHours: { open: 9, close: 18 }, note: 'Late-afternoon boat ride past Jag Mandir and Lake Palace.' },
      { attractionId: 'udr-jagdish', name: 'Jagdish Temple', coordinates: { lat: 24.5797, lng: 73.6837 }, category: 'Culture', isOutdoor: false, rating: 4.6, duration: 1, cost: 0, openingHours: { open: 5, close: 21 }, note: '17th-century Indo-Aryan carved temple steps from City Palace.' },
      { attractionId: 'udr-saheliyon', name: 'Saheliyon-ki-Bari', coordinates: { lat: 24.6031, lng: 73.6852 }, category: 'Nature', isOutdoor: true, rating: 4.4, duration: 1.5, cost: 50, openingHours: { open: 9, close: 19 }, note: 'Royal courtyard garden with lotus pools and gravity-fed marble fountains.' },
      { attractionId: 'udr-bagore', name: 'Bagore Ki Haveli', coordinates: { lat: 24.5798, lng: 73.6808 }, category: 'Museum', isOutdoor: false, rating: 4.6, duration: 1.5, cost: 100, openingHours: { open: 9.5, close: 17.5 }, note: '18th-century waterfront haveli museum right on Gangaur Ghat.' },
      { attractionId: 'udr-sajjangarh', name: 'Monsoon Palace', coordinates: { lat: 24.5936, lng: 73.6391 }, category: 'Sightseeing', isOutdoor: true, rating: 4.4, duration: 2, cost: 150, openingHours: { open: 9, close: 18 }, note: 'Aravalli hilltop palace with panoramic views over Udaipur’s lakes at sunset.' },
      { attractionId: 'udr-fateh-sagar', name: 'Fateh Sagar Lake', coordinates: { lat: 24.6005, lng: 73.6731 }, category: 'Nature', isOutdoor: true, rating: 4.6, duration: 1.5, cost: 0, openingHours: { open: 6, close: 21 }, note: 'Breezy lakeside promenade beloved for evening walks and kulhad coffee.' },
      { attractionId: 'udr-hathi-pol', name: 'Hathi Pol Bazaar', coordinates: { lat: 24.5859, lng: 73.6854 }, category: 'Shopping', isOutdoor: false, rating: 4.4, duration: 1.5, cost: 300, openingHours: { open: 10, close: 20 }, note: 'Traditional market for Pichwai miniature paintings, mojris, and textiles.' },
    ],
  },
  alleppey: {
    center: { lat: 9.4981, lng: 76.3388 },
    attractions: [
      { attractionId: 'alp-backwaters', name: 'Alappuzha Backwaters', coordinates: { lat: 9.4956, lng: 76.3519 }, category: 'Nature', isOutdoor: true, rating: 4.8, duration: 3, cost: 1200, openingHours: { open: 7, close: 18 }, note: 'Cruise narrow palm-canopied canals on a shikara or traditional kettuvallam boat.' },
      { attractionId: 'alp-beach', name: 'Alappuzha Beach', coordinates: { lat: 9.4926, lng: 76.3183 }, category: 'Nature', isOutdoor: true, rating: 4.5, duration: 2, cost: 0, openingHours: { open: 6, close: 20 }, note: '150-year-old sea pier stretching into the Arabian Sea; best at golden hour.' },
      { attractionId: 'alp-lighthouse', name: 'Alappuzha Lighthouse', coordinates: { lat: 9.4908, lng: 76.3227 }, category: 'History', isOutdoor: false, rating: 4.5, duration: 1, cost: 50, openingHours: { open: 9, close: 17.5 }, note: '1862 coastal lighthouse with sweeping views of the sea and coconut groves.' },
      { attractionId: 'alp-marari', name: 'Marari Beach', coordinates: { lat: 9.6009, lng: 76.2981 }, category: 'Nature', isOutdoor: true, rating: 4.7, duration: 2.5, cost: 0, openingHours: { open: 6, close: 19 }, note: 'Quiet fishing-village shoreline north of Alleppey with calm turquoise surf.' },
      { attractionId: 'alp-revi-museum', name: 'Revi Karunakaran Memorial Museum', coordinates: { lat: 9.5015, lng: 76.3304 }, category: 'Museum', isOutdoor: false, rating: 4.6, duration: 1.5, cost: 150, openingHours: { open: 9, close: 17 }, note: 'Curated Swarovski crystal, ivory, and Kerala heritage collection (closed Mondays).' },
      { attractionId: 'alp-ambalapuzha', name: 'Ambalappuzha Sree Krishna Swamy Temple', coordinates: { lat: 9.3834, lng: 76.3652 }, category: 'Culture', isOutdoor: false, rating: 4.7, duration: 1.5, cost: 0, openingHours: { open: 5, close: 19.5 }, note: 'Classic Kerala-style temple famous for its sweet milk payasam offering.' },
      { attractionId: 'alp-pathiramanal', name: 'Pathiramanal Island', coordinates: { lat: 9.6186, lng: 76.3847 }, category: 'Nature', isOutdoor: true, rating: 4.5, duration: 2, cost: 300, openingHours: { open: 7, close: 17 }, note: 'Tranquil bird-watching island in the middle of Vembanad Lake.' },
      { attractionId: 'alp-toddy-food', name: 'Kuttanad Local Seafood & Sadhya', coordinates: { lat: 9.4988, lng: 76.3422 }, category: 'Food', isOutdoor: false, rating: 4.6, duration: 1.5, cost: 450, openingHours: { open: 11, close: 21 }, note: 'Taste karimeen pollichathu (banana-leaf pearl spot fish) and appam stew.' },
    ],
  },
  leh: {
    center: { lat: 34.1526, lng: 77.5771 },
    attractions: [
      { attractionId: 'leh-shanti-stupa', name: 'Shanti Stupa', coordinates: { lat: 34.1737, lng: 77.575 }, category: 'Culture', isOutdoor: true, rating: 4.8, duration: 1.5, cost: 0, openingHours: { open: 6, close: 20 }, note: 'White-domed hilltop stupa with sweeping sunrise and sunset panoramas over Leh.' },
      { attractionId: 'leh-palace', name: 'Leh Palace', coordinates: { lat: 34.1659, lng: 77.5861 }, category: 'History', isOutdoor: false, rating: 4.5, duration: 1.5, cost: 25, openingHours: { open: 7, close: 16 }, note: 'Nine-storey 17th-century royal palace towering above Leh Old Town.' },
      { attractionId: 'leh-thiksey', name: 'Thiksey Monastery', coordinates: { lat: 34.0558, lng: 77.6669 }, category: 'Culture', isOutdoor: false, rating: 4.8, duration: 2, cost: 50, openingHours: { open: 7, close: 19 }, note: 'Tiered 12-storey hilltop gompa housing the 15-metre Maitreya Buddha statue.' },
      { attractionId: 'leh-hemis', name: 'Hemis Monastery', coordinates: { lat: 33.9125, lng: 77.7031 }, category: 'Culture', isOutdoor: false, rating: 4.7, duration: 2, cost: 50, openingHours: { open: 8, close: 18 }, note: 'Largest and richest Drukpa monastery in Ladakh with an excellent museum.' },
      { attractionId: 'leh-hall-of-fame', name: 'Hall of Fame, Leh', coordinates: { lat: 34.1422, lng: 77.5471 }, category: 'Museum', isOutdoor: false, rating: 4.8, duration: 1.5, cost: 100, openingHours: { open: 9, close: 19 }, note: 'Indian Army museum honoring Ladakh’s history, culture, and high-altitude heritage.' },
      { attractionId: 'leh-sangam', name: 'Indus and Zanskar Confluence', coordinates: { lat: 34.1653, lng: 77.3315 }, category: 'Nature', isOutdoor: true, rating: 4.7, duration: 1.5, cost: 0, openingHours: { open: 7, close: 18 }, note: 'Dramatic meeting of emerald Zanskar and blue Indus rivers at Nimmu.' },
      { attractionId: 'leh-market', name: 'Leh Main Bazaar', coordinates: { lat: 34.1642, lng: 77.5848 }, category: 'Shopping', isOutdoor: true, rating: 4.5, duration: 2, cost: 350, openingHours: { open: 10, close: 21 }, note: 'Pedestrian promenade for Ladakhi apricots, pashmina, thukpa, and Tibetan cafés.' },
    ],
  },
};

function getCuratedDestinationAttractions(
  destination: string,
  interests: string[],
): { center: Coordinates; attractions: AttractionCandidate[] } | null {
  const norm = destination.trim().toLowerCase();
  if (norm === 'dehradun') {
    return {
      center: { lat: 30.3165, lng: 78.0322 },
      attractions: VERIFIED_DEHRADUN_ATTRACTIONS,
    };
  }
  if (norm === 'delhi' || norm === 'new delhi') {
    return VERIFIED_CURATED_CITIES['new delhi']!;
  }
  if (VERIFIED_CURATED_CITIES[norm]) {
    return VERIFIED_CURATED_CITIES[norm]!;
  }

  const dest = destinations.find(
    (d) => d.id.toLowerCase() === norm || d.name.toLowerCase() === norm,
  );
  if (dest) {
    const attractions: AttractionCandidate[] = dest.spots.map((s, idx) => {
      const catLower = s.type.toLowerCase();
      const isOutdoor = !['culture', 'museum', 'shopping', 'food', 'education'].includes(catLower);
      return {
        attractionId: `${dest.id}-${idx + 1}`,
        name: s.name,
        coordinates: { lat: s.lat, lng: s.lng },
        category: s.type,
        isOutdoor,
        rating: s.rating ?? 4.5,
        duration: s.hours,
        cost: catLower === 'culture' ? 0 : 200,
        openingHours: { open: 9, close: 18 },
        note: s.note,
      };
    });
    return { center: { lat: dest.lat, lng: dest.lng }, attractions };
  }

  return getImportedAttractionsForCity(destination, interests);
}

export async function discoverAttractions(params: {
  destination: string;
  interests: string[];
  limit?: number;
}): Promise<{ center: Coordinates; attractions: AttractionCandidate[]; source: 'curated' | 'gemini' | 'google_places' | 'ai_gateway' | 'openstreetmap' }> {
  const geminiKey = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'];
  const groqKey = process.env['GROQ_API_KEY'];
  const openrouterKey = process.env['OPENROUTER_API_KEY'];
  const googleKey = process.env['GOOGLE_PLACES_API_KEY'];
  const lovableKey = process.env['LOVABLE_API_KEY'];

  // Serve verified curated data first for cities with grounded coordinates
  const curated = getCuratedDestinationAttractions(params.destination, params.interests);
  const normDest = params.destination.trim().toLowerCase();
  const isGroundedStaticCity = [
    'dehradun',
    'goa',
    'jaipur',
    'manali',
    'new delhi',
    'delhi',
    'varanasi',
    'udaipur',
    'alleppey',
    'leh',
  ].includes(normDest);
  if (curated && isGroundedStaticCity) {
    const enriched = googleKey
      ? await enrichWithGooglePhotos(curated.attractions, params.destination, googleKey)
      : curated.attractions;
    return { center: curated.center, attractions: enriched, source: 'curated' };
  }

  const prompt = buildCurationPrompt(params.destination, params.interests, params.limit ?? 16);

  if (geminiKey) {
    try {
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.25,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
          signal: AbortSignal.timeout(12000),
        },
      );

      if (gemRes.ok) {
        const gemJson = (await gemRes.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const rawText = gemJson.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = rawText ? parseCuratedAttractions(rawText) : null;
        if (parsed) {
          const attractions = googleKey
            ? await enrichWithGooglePhotos(parsed.attractions, params.destination, googleKey)
            : parsed.attractions;
          return { center: parsed.center, attractions, source: 'gemini' };
        }
      }
    } catch {
      // Fall through to Groq / OpenRouter / Google Places / OpenStreetMap
    }
  }

  // OpenAI-compatible AI curation (Groq or OpenRouter — works without Google Cloud Console)
  const openAiProviders = [
    groqKey
      ? {
          url: 'https://api.groq.com/openai/v1/chat/completions',
          key: groqKey,
          model: 'llama-3.3-70b-versatile',
        }
      : null,
    openrouterKey
      ? {
          url: 'https://openrouter.ai/api/v1/chat/completions',
          key: openrouterKey,
          model: 'google/gemini-2.0-flash-exp:free',
        }
      : null,
  ].filter((p): p is { url: string; key: string; model: string } => Boolean(p));

  for (const provider of openAiProviders) {
    try {
      const aiRes = await fetch(provider.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${provider.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.25,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are an Indian travel data API returning accurate WGS84 coordinates, realistic INR costs, and opening hours in strict JSON.',
            },
            { role: 'user', content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (aiRes.ok) {
        const payload = (await aiRes.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const rawText = payload.choices?.[0]?.message?.content;
        const parsed = rawText ? parseCuratedAttractions(rawText) : null;
        if (parsed) {
          const attractions = googleKey
            ? await enrichWithGooglePhotos(parsed.attractions, params.destination, googleKey)
            : parsed.attractions;
          return { center: parsed.center, attractions, source: 'ai_gateway' };
        }
      }
    } catch {
      // Try next provider
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
        model: 'google/gemini-3.8-flash',
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
    const enrichedAttractions = googleKey
      ? await enrichWithGooglePhotos(parsed.attractions, params.destination, googleKey)
      : parsed.attractions;
    return { center: parsed.center, attractions: enrichedAttractions, source: 'ai_gateway' };
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
    const ignorePattern =
      /election|constituency|municipal|ward|tehsil|taluk|district|school|hospital|university|college|academy|institute|office|bhavan|secretariat|commission|board|council|railway station|bus stand|road|highway|nagar|colony|sector|mohalla|chowk|bypass|bridge|flyover|airport|junction|depot|bank|clinic|apartment|complex|gram panchayat|assembly|lok sabha|vidhan sabha/i;
    const destLower = params.destination.trim().toLowerCase();

    for (const item of wikiItems) {
      const titleLower = item.title.trim().toLowerCase();
      if (titleLower === destLower || titleLower === 'uttarakhand' || titleLower === 'india') continue;
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

  if (curated && curated.attractions.length > 0) {
    const existingNames = new Set(attractions.map((a) => a.name.toLowerCase()));
    const merged = [
      ...attractions,
      ...curated.attractions.filter((a) => !existingNames.has(a.name.toLowerCase())),
    ].slice(0, params.limit ?? 18);
    return { center: curated.center, attractions: merged, source: attractions.length > 0 ? 'openstreetmap' : 'curated' };
  }

  if (attractions.length === 0) {
    throw new Error(`No attractions found near "${params.destination}".`);
  }

  return { center, attractions, source: 'openstreetmap' };
}

export type GeminiItineraryStop = {
  attractionId?: string;
  name: string;
  startTime?: string;
  duration?: number;
  category?: string;
  isOutdoor?: boolean;
  rating?: number;
  cost?: number;
  coordinates: Coordinates;
  openingHours?: { open: number; close: number };
  note?: string;
  location?: string;
};

export type GeminiItineraryDay = {
  dayNumber: number;
  title?: string;
  summary?: string;
  stops: GeminiItineraryStop[];
};

export type DirectAiItineraryResult = {
  destination: string;
  center: Coordinates;
  aiResponseText: string;
  budgetSummary?: string;
  days: GeminiItineraryDay[];
  extraCandidates: AttractionCandidate[];
  modelName: string;
};

function buildDirectItineraryPrompt(params: {
  destination: string;
  numberOfDays: number;
  budget: number;
  travelers: number;
  interests: string[];
  transportMode: string;
  startDate?: string;
  startPointQuery?: string;
}): string {
  return `You are TripPilot's expert AI travel planner. Create a real, authentic, non-random ${params.numberOfDays}-day itinerary tailored specifically to the user's request below.

USER INPUT:
- Destination: ${params.destination}
- Duration: ${params.numberOfDays} day(s)
- Budget per person: ₹${params.budget.toLocaleString('en-IN')} INR (or equivalent if international)
- Travelers: ${params.travelers}
- Travel Style / Interests: ${params.interests.length > 0 ? params.interests.join(', ') : 'Balanced sightseeing, local culture, and food'}
- Preferred Local Transport: ${params.transportMode}
${params.startDate ? `- Start Date: ${params.startDate}` : ''}
${params.startPointQuery ? `- Starting Hotel / Landmark: ${params.startPointQuery}` : ''}

REQUIREMENTS:
1. Every stop MUST be a real, specific place in or near ${params.destination} with accurate WGS84 coordinates (lat, lng).
2. Respect the ${params.numberOfDays}-day duration (return exactly ${params.numberOfDays} day objects) and stay realistic for the ₹${params.budget.toLocaleString('en-IN')} per-person activity/entry budget.
3. Include 3 to 4 stops per day (Morning, Afternoon, Evening) ordered logically by geography.
4. Provide "aiResponseText": a direct, helpful, well-formatted response written straight to the traveler summarizing their ${params.numberOfDays}-day ${params.destination} trip, daily highlights, local dining picks, and practical budget tips for ₹${params.budget.toLocaleString('en-IN')}.
5. Also include 4-6 "extraCandidates" (including indoor options) so the user can swap or add spots if desired.

Return ONLY valid JSON matching this exact schema:
{
  "destination": "${params.destination}",
  "center": { "lat": 0.0, "lng": 0.0 },
  "aiResponseText": "Direct personalized Gemini AI response to the traveler...",
  "budgetSummary": "1-2 sentence summary of how this itinerary fits ₹${params.budget.toLocaleString('en-IN')} per person",
  "days": [
    {
      "dayNumber": 1,
      "title": "Short Day Theme",
      "summary": "1 sentence overview of Day 1",
      "stops": [
        {
          "attractionId": "slug-id",
          "name": "Exact Real Place Name",
          "startTime": "09:00",
          "duration": 2,
          "category": "History | Nature | Food | Culture | Museum | Shopping | Adventure | Sightseeing",
          "isOutdoor": true,
          "rating": 4.6,
          "cost": 200,
          "coordinates": { "lat": 0.0, "lng": 0.0 },
          "openingHours": { "open": 9, "close": 18 },
          "location": "Neighborhood / Ward",
          "note": "Concise 1-2 sentence local tip tailored to the user's interests"
        }
      ]
    }
  ],
  "extraCandidates": [
    {
      "attractionId": "extra-1",
      "name": "Real Nearby Place",
      "coordinates": { "lat": 0.0, "lng": 0.0 },
      "category": "Museum",
      "isOutdoor": false,
      "rating": 4.5,
      "duration": 1.5,
      "cost": 150,
      "openingHours": { "open": 10, "close": 18 },
      "note": "Great indoor alternative or bonus stop"
    }
  ]
}`;
}

function parseDirectAiItinerary(
  rawText: string,
  fallbackDestination: string,
): Omit<DirectAiItineraryResult, 'modelName'> | null {
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned) as {
      destination?: string;
      center?: Coordinates;
      aiResponseText?: string;
      budgetSummary?: string;
      days?: GeminiItineraryDay[];
      extraCandidates?: AttractionCandidate[];
    };

    const validDays = (parsed.days ?? [])
      .map((d, idx) => ({
        dayNumber: Number(d.dayNumber) || idx + 1,
        ...(d.title ? { title: d.title } : {}),
        ...(d.summary ? { summary: d.summary } : {}),
        stops: (d.stops ?? []).filter(
          (s) =>
            Boolean(s?.name) &&
            Boolean(s?.coordinates) &&
            Number.isFinite(s.coordinates.lat) &&
            Number.isFinite(s.coordinates.lng),
        ),
      }))
      .filter((d) => d.stops.length > 0);

    if (validDays.length === 0) return null;

    const firstStopCoord = validDays[0]?.stops[0]?.coordinates;
    const center =
      parsed.center && Number.isFinite(parsed.center.lat) && Number.isFinite(parsed.center.lng)
        ? parsed.center
        : firstStopCoord ?? { lat: 28.6139, lng: 77.209 };

    const extraCandidates = (parsed.extraCandidates ?? []).filter(
      (c) =>
        Boolean(c?.name) &&
        Boolean(c?.coordinates) &&
        Number.isFinite(c.coordinates.lat) &&
        Number.isFinite(c.coordinates.lng),
    );

    return {
      destination: parsed.destination?.trim() || fallbackDestination,
      center,
      aiResponseText:
        parsed.aiResponseText?.trim() ||
        `Here is your ${validDays.length}-day itinerary for ${fallbackDestination}.`,
      ...(parsed.budgetSummary ? { budgetSummary: parsed.budgetSummary } : {}),
      days: validDays,
      extraCandidates,
    };
  } catch {
    return null;
  }
}

export async function generateDirectGeminiItinerary(params: {
  destination: string;
  numberOfDays: number;
  budget: number;
  travelers: number;
  interests: string[];
  transportMode: string;
  startDate?: string;
  startPointQuery?: string;
  geminiApiKey?: string;
}): Promise<DirectAiItineraryResult> {
  const geminiKey =
    params.geminiApiKey?.trim() || process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'];
  const lovableKey = process.env['LOVABLE_API_KEY'];
  const groqKey = process.env['GROQ_API_KEY'];
  const openrouterKey = process.env['OPENROUTER_API_KEY'];
  const googleKey = process.env['GOOGLE_PLACES_API_KEY'];

  const prompt = buildDirectItineraryPrompt(params);

  if (geminiKey) {
    // 1. Try Gemini Interactions API first (gemini-3.8-flash)
    try {
      const interRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/interactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': geminiKey,
          },
          body: JSON.stringify({
            model: 'gemini-3.8-flash',
            input: prompt,
            generation_config: {
              temperature: 0.35,
            },
          }),
          signal: AbortSignal.timeout(12000),
        },
      );

      if (interRes.ok) {
        const interJson = (await interRes.json()) as {
          outputs?: Array<{ text?: string; content?: string }>;
          text?: string;
        };
        const rawText =
          interJson.outputs?.map((o) => o.text ?? o.content ?? '').find((t) => t.trim().length > 0) ||
          interJson.text;
        const parsed = rawText ? parseDirectAiItinerary(rawText, params.destination) : null;
        if (parsed) {
          if (googleKey) {
            const allStops = parsed.days.flatMap((d) => d.stops as AttractionCandidate[]);
            const enriched = await enrichWithGooglePhotos(allStops, parsed.destination, googleKey);
            let cursor = 0;
            for (const day of parsed.days) {
              day.stops = enriched.slice(cursor, cursor + day.stops.length);
              cursor += day.stops.length;
            }
          }
          return {
            ...parsed,
            modelName: 'Gemini 3.8 Flash (Interactions API)',
          };
        }
      }
    } catch {
      // Fall through to generateContent models below
    }

    // 2. Fallback to generateContent REST endpoint
    const geminiModels = ['gemini-3.8-flash', 'gemini-2.5-flash'];
    for (const model of geminiModels) {
      try {
        const gemRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(geminiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.35,
                responseMimeType: 'application/json',
              },
            }),
            signal: AbortSignal.timeout(12000),
          },
        );

        if (!gemRes.ok) {
          continue;
        }

        const gemJson = (await gemRes.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const rawText = gemJson.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = rawText ? parseDirectAiItinerary(rawText, params.destination) : null;
        if (parsed) {
          if (googleKey) {
            const allStops = parsed.days.flatMap((d) => d.stops as AttractionCandidate[]);
            const enriched = await enrichWithGooglePhotos(allStops, parsed.destination, googleKey);
            let cursor = 0;
            for (const day of parsed.days) {
              day.stops = enriched.slice(cursor, cursor + day.stops.length);
              cursor += day.stops.length;
            }
          }
          return {
            ...parsed,
            modelName: model === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Gemini 2.5 Flash',
          };
        }
      } catch {
        // Continue to next model
      }
    }
  }

  const openAiProviders = [
    lovableKey
      ? {
          url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
          key: lovableKey,
          model: 'google/gemini-3.8-flash',
          label: 'Gemini 3.8 Flash (Lovable AI)',
        }
      : null,
    openrouterKey
      ? {
          url: 'https://openrouter.ai/api/v1/chat/completions',
          key: openrouterKey,
          model: 'google/gemini-2.0-flash-exp:free',
          label: 'Gemini 2.0 Flash (OpenRouter)',
        }
      : null,
    groqKey
      ? {
          url: 'https://api.groq.com/openai/v1/chat/completions',
          key: groqKey,
          model: 'llama-3.3-70b-versatile',
          label: 'Llama 3.3 70B',
        }
      : null,
  ].filter((p): p is { url: string; key: string; model: string; label: string } => Boolean(p));

  for (const provider of openAiProviders) {
    try {
      const aiRes = await fetch(provider.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${provider.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.35,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You are TripPilot AI travel planner. Return accurate WGS84 coordinates, realistic INR costs, opening hours, and a personalized itinerary in strict JSON.',
            },
            { role: 'user', content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (!aiRes.ok) {
        continue;
      }

      const payload = (await aiRes.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const rawText = payload.choices?.[0]?.message?.content;
      const parsed = rawText ? parseDirectAiItinerary(rawText, params.destination) : null;
      if (parsed) {
        return {
          ...parsed,
          modelName: provider.label,
        };
      }
    } catch {
      // Continue to next provider
    }
  }

  // 3. Resilient fallback: curated / OpenStreetMap attractions + route optimizer
  const discovered = await discoverAttractions({
    destination: params.destination,
    interests: params.interests,
    limit: Math.max(12, params.numberOfDays * 4),
  });

  const { optimizeItinerary } = await import('@/lib/optimizer');
  const transport =
    params.transportMode === 'transit' || params.transportMode === 'walking'
      ? params.transportMode
      : 'cab';

  const optimized = optimizeItinerary({
    destination: params.destination,
    attractions: discovered.attractions,
    numberOfDays: params.numberOfDays,
    budget: params.budget,
    ...(params.startDate ? { startDate: params.startDate } : {}),
    transportMode: transport,
  });

  const usedIds = new Set(optimized.itinerary.flatMap((d) => d.stops.map((s) => s.attractionId)));
  const extraCandidates = discovered.attractions.filter((a) => !usedIds.has(a.attractionId)).slice(0, 6);

  const days: GeminiItineraryDay[] = optimized.itinerary.map((day) => ({
    dayNumber: day.dayNumber,
    title: `Day ${day.dayNumber} in ${params.destination}`,
    summary: `${day.stops.length} curated stops optimized for ${transport} travel`,
    stops: day.stops.map((s) => ({
      attractionId: s.attractionId,
      name: s.name,
      startTime: s.startTime,
      duration: s.duration,
      category: s.category,
      isOutdoor: s.isOutdoor,
      rating: s.rating,
      cost: s.cost,
      coordinates: s.coordinates,
      openingHours: s.openingHours,
      ...(s.note ? { note: s.note } : {}),
    })),
  }));

  const daySummaries = days
    .map(
      (d) =>
        `Day ${d.dayNumber}: ${d.stops.map((s) => s.name).join(' → ')}`,
    )
    .join('\n');

  return {
    destination: params.destination,
    center: discovered.center,
    aiResponseText: `Here is your ${params.numberOfDays}-day ${params.destination} itinerary tailored for ₹${params.budget.toLocaleString('en-IN')} per person (${params.travelers} ${params.travelers === 1 ? 'traveler' : 'travelers'}):\n\n${daySummaries}`,
    budgetSummary: `Estimated ₹${optimized.totalCost.toLocaleString('en-IN')} across ${params.numberOfDays} days (${optimized.remainingBudget >= 0 ? `₹${optimized.remainingBudget.toLocaleString('en-IN')} within` : `₹${Math.abs(optimized.remainingBudget).toLocaleString('en-IN')} over`} your ₹${params.budget.toLocaleString('en-IN')} budget).`,
    days,
    extraCandidates,
    modelName: geminiKey
      ? 'TripPilot Smart Route Optimizer (Fallback)'
      : 'TripPilot Smart Route Optimizer',
  };
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
