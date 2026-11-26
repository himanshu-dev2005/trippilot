import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  applyWeatherAdjustment,
  buildInstagramSearchUrl,
  estimateTravel,
  regenerateSingleDay,
  replanForBudget,
  type AttractionCandidate,
  type Coordinates,
  type ItineraryDay,
  type StartPoint,
  type Stop,
  type TransportMode,
} from '@/lib/optimizer';

export type TripRecord = {
  _id?: string;
  userId: string;
  destination: string;
  center: Coordinates;
  budget: number;
  numberOfDays: number;
  travelers?: number;
  interests: string[];
  transportMode: TransportMode;
  startPoint?: StartPoint;
  itinerary: ItineraryDay[];
  candidates: AttractionCandidate[];
  weatherConfigured: boolean;
  aiResponseText?: string;
  budgetSummary?: string;
  modelName?: string;
  createdAt: string;
  updatedAt: string;
};

const TransportSchema = z.enum(['walking', 'transit', 'cab']).default('cab');

const GenerateSchema = z.object({
  destination: z.string().trim().min(2).max(80),
  numberOfDays: z.number().int().min(1).max(14),
  budget: z.number().min(0).max(5000000),
  travelers: z.number().int().min(1).max(20).default(1),
  interests: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  transportMode: TransportSchema,
  startPointQuery: z.string().optional(),
  geminiApiKey: z.string().optional(),
});

const RegenerateDaySchema = z.object({
  destination: z.string(),
  currentItinerary: z.array(z.any()),
  dayNumber: z.number().int().min(1),
  allCandidates: z.array(z.any()),
  totalBudget: z.number().min(0),
  transportMode: TransportSchema,
  startPoint: z.any().optional(),
});

const ReplanBudgetSchema = z.object({
  destination: z.string(),
  currentItinerary: z.array(z.any()),
  allCandidates: z.array(z.any()),
  newBudget: z.number().min(0),
  transportMode: TransportSchema,
  startPoint: z.any().optional(),
});

const SaveTripSchema = z.object({
  tripId: z.string().optional(),
  destination: z.string().trim().min(2),
  center: z.object({ lat: z.number(), lng: z.number() }),
  budget: z.number().min(0),
  numberOfDays: z.number().int().min(1),
  travelers: z.number().int().min(1).max(20).default(1),
  interests: z.array(z.string()),
  transportMode: TransportSchema,
  startPoint: z.any().optional(),
  itinerary: z.array(z.any()),
  candidates: z.array(z.any()),
  weatherConfigured: z.boolean().default(false),
  aiResponseText: z.string().optional(),
  budgetSummary: z.string().optional(),
  modelName: z.string().optional(),
});

function formatDayIsoDate(startDate: string | undefined, dayOffset: number): string {
  const base = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  const safeBase = Number.isNaN(base.getTime()) ? new Date() : base;
  const dt = new Date(safeBase);
  dt.setDate(dt.getDate() + dayOffset);
  return dt.toISOString().slice(0, 10);
}

export const generateOptimizedTrip = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => GenerateSchema.parse(raw))
  .handler(async ({ data }) => {
    const { generateDirectGeminiItinerary, resolveStartPoint } = await import('@/lib/places.server');
    const { getDestinationWeather } = await import('@/lib/weather.server');

    const [aiResult, startPoint] = await Promise.all([
      generateDirectGeminiItinerary({
        destination: data.destination,
        numberOfDays: data.numberOfDays,
        budget: data.budget,
        travelers: data.travelers,
        interests: data.interests,
        transportMode: data.transportMode,
        ...(data.startDate ? { startDate: data.startDate } : {}),
        ...(data.startPointQuery ? { startPointQuery: data.startPointQuery } : {}),
        ...(data.geminiApiKey ? { geminiApiKey: data.geminiApiKey } : {}),
      }),
      data.startPointQuery
        ? resolveStartPoint(data.startPointQuery, data.destination)
        : Promise.resolve(undefined),
    ]);

    const weather = await getDestinationWeather({
      coordinates: aiResult.center,
      numberOfDays: data.numberOfDays,
      ...(data.startDate ? { startDate: data.startDate } : {}),
    });

    const dayThemes: Record<number, { title?: string; summary?: string }> = {};
    const allCandidates: AttractionCandidate[] = [...aiResult.extraCandidates];

    const itinerary: ItineraryDay[] = aiResult.days.map((aiDay, dayIdx) => {
      const dayNumber = aiDay.dayNumber || dayIdx + 1;
      dayThemes[dayNumber] = {
        ...(aiDay.title ? { title: aiDay.title } : {}),
        ...(aiDay.summary ? { summary: aiDay.summary } : {}),
      };

      const weatherDay = weather.days[dayIdx];
      const hasRainAlert = weatherDay?.hasRain ?? false;

      const stops: Stop[] = aiDay.stops.map((rawStop, stopIdx) => {
        const nextStop = aiDay.stops[stopIdx + 1];
        const travelToNext = nextStop
          ? estimateTravel(rawStop.coordinates, nextStop.coordinates, data.transportMode)
          : null;

        const stopObj: Stop = {
          attractionId:
            rawStop.attractionId ||
            `gem-${dayNumber}-${stopIdx + 1}-${rawStop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`,
          name: rawStop.name,
          coordinates: rawStop.coordinates,
          category: rawStop.category || 'Sightseeing',
          isOutdoor: rawStop.isOutdoor ?? true,
          rating: Number(rawStop.rating) || 4.5,
          duration: Number(rawStop.duration) || 2,
          cost: Math.max(0, Math.round(Number(rawStop.cost) || 0)),
          openingHours: rawStop.openingHours ?? { open: 9, close: 19 },
          ...(rawStop.note ? { note: rawStop.note } : {}),
          ...(rawStop.location ? { userNote: rawStop.location } : {}),
          startTime: rawStop.startTime || `${String(9 + stopIdx * 3).padStart(2, '0')}:00`,
          travelToNext,
          weatherStatus: hasRainAlert && (rawStop.isOutdoor ?? true) ? 'rain' : 'clear',
          instagramSearchUrl: buildInstagramSearchUrl(rawStop.name, aiResult.destination),
        };

        allCandidates.push({
          attractionId: stopObj.attractionId,
          name: stopObj.name,
          coordinates: stopObj.coordinates,
          category: stopObj.category,
          isOutdoor: stopObj.isOutdoor,
          rating: stopObj.rating,
          duration: stopObj.duration,
          cost: stopObj.cost,
          openingHours: stopObj.openingHours,
          ...(stopObj.note ? { note: stopObj.note } : {}),
        });

        return stopObj;
      });

      const activityCost = stops.reduce((s, st) => s + st.cost, 0);
      const transitCost = stops.reduce((s, st) => s + (st.travelToNext?.cost ?? 0), 0);
      const totalTravelTime = stops.reduce((s, st) => s + (st.travelToNext?.minutes ?? 0), 0);

      return {
        dayNumber,
        date: weatherDay?.date || formatDayIsoDate(data.startDate, dayIdx),
        totalCost: activityCost + transitCost,
        activityCost,
        transitCost,
        totalTravelTime,
        weatherSummary: weatherDay?.summary || 'Clear',
        hasRainAlert,
        ...(weatherDay?.tempC !== undefined ? { tempC: weatherDay.tempC } : {}),
        ...(weatherDay?.tempMinC !== undefined ? { tempMinC: weatherDay.tempMinC } : {}),
        ...(weatherDay?.tempMaxC !== undefined ? { tempMaxC: weatherDay.tempMaxC } : {}),
        ...(weatherDay?.humidity !== undefined ? { humidity: weatherDay.humidity } : {}),
        ...(weatherDay?.windKmh !== undefined ? { windKmh: weatherDay.windKmh } : {}),
        ...(weatherDay?.condition ? { weatherCondition: weatherDay.condition } : {}),
        stops,
      };
    });

    const totalCost = itinerary.reduce((s, d) => s + d.totalCost, 0);

    return {
      destination: aiResult.destination,
      center: aiResult.center,
      source: 'gemini' as const,
      modelName: aiResult.modelName,
      aiResponseText: aiResult.aiResponseText,
      budgetSummary: aiResult.budgetSummary,
      dayThemes,
      transportMode: data.transportMode,
      startPoint,
      weatherConfigured: weather.configured,
      candidates: allCandidates,
      itinerary,
      totalCost,
      remainingBudget: data.budget - totalCost,
    };
  });

export const regenerateTripDay = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => RegenerateDaySchema.parse(raw))
  .handler(async ({ data }) => {
    return regenerateSingleDay({
      destination: data.destination,
      currentItinerary: data.currentItinerary as ItineraryDay[],
      dayNumber: data.dayNumber,
      allCandidates: data.allCandidates as AttractionCandidate[],
      totalBudget: data.totalBudget,
      transportMode: data.transportMode,
      ...(data.startPoint ? { startPoint: data.startPoint as StartPoint } : {}),
    });
  });

export const replanTripBudget = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => ReplanBudgetSchema.parse(raw))
  .handler(async ({ data }) => {
    return replanForBudget({
      destination: data.destination,
      currentItinerary: data.currentItinerary as ItineraryDay[],
      allCandidates: data.allCandidates as AttractionCandidate[],
      newBudget: data.newBudget,
      transportMode: data.transportMode,
      ...(data.startPoint ? { startPoint: data.startPoint as StartPoint } : {}),
    });
  });

export const adjustTripWeather = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) =>
    z
      .object({
        destination: z.string(),
        currentItinerary: z.array(z.any()),
        allCandidates: z.array(z.any()),
        totalBudget: z.number().min(0),
        transportMode: TransportSchema,
        startPoint: z.any().optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data }) => {
    return applyWeatherAdjustment({
      destination: data.destination,
      currentItinerary: data.currentItinerary as ItineraryDay[],
      allCandidates: data.allCandidates as AttractionCandidate[],
      totalBudget: data.totalBudget,
      transportMode: data.transportMode,
      ...(data.startPoint ? { startPoint: data.startPoint as StartPoint } : {}),
    });
  });

const PHOTO_CACHE = new Map<string, { dataUrl: string | null; expiresAt: number }>();
const PHOTO_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const PHOTO_NULL_TTL_MS = 1000 * 60 * 10; // 10 min

const BAD_IMAGE_PATTERN =
  /(\.svg|\.gif|\.pdf|\.tiff?|\.ogv|\.webm|\.xcf|location[_ -]?map|locator[_ -]?map|\bmap\b|flag[_ -]?of|coat[_ -]?of[_ -]?arms|\bemblem\b|seal[_ -]?of|\blogo\b|\bicon\b|diagram|chart|graph|blank|stub|signature|census|constituency|district[_ -]?in|tehsil|taluk|stamp|coin|ticket|brochure|poster|banner|plaque|signboard|wikimedia|commons-logo|question[_ -]?book|ambox|padlock|disambig|portrait[_ -]?of|headshot|election|in[_ -]?india[_ -]?map|india[_ -]?location)/i;

const GENERIC_STOP_WORDS = new Set([
  'the',
  'of',
  'in',
  'at',
  'on',
  'and',
  'to',
  'for',
  'near',
  'by',
  'old',
  'new',
  'city',
  'town',
  'road',
  'marg',
  'street',
  'india',
  'indian',
  'park',
  'garden',
  'temple',
  'mandir',
  'fort',
  'palace',
  'museum',
  'lake',
  'beach',
  'falls',
  'waterfall',
  'market',
  'bazaar',
  'mall',
  'cafe',
  'restaurant',
  'viewpoint',
  'point',
  'hill',
  'hills',
  'valley',
  'sanctuary',
  'national',
  'zoo',
  'ghat',
  'ghats',
  'church',
  'mosque',
  'masjid',
  'monastery',
  'mahal',
  'bhavan',
  'chowk',
]);

function extractPlaceTokens(name: string): { distinctive: string[]; all: string[] } {
  const cleaned = name
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);
  const distinctive = cleaned.filter((w) => !GENERIC_STOP_WORDS.has(w));
  return { distinctive: distinctive.length > 0 ? distinctive : cleaned, all: cleaned };
}

function scoreTitleRelevance(candidateText: string, placeName: string, destination?: string): number {
  const hay = candidateText
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
  const { distinctive, all } = extractPlaceTokens(placeName);
  if (distinctive.length === 0) return 0;

  let distinctiveHits = 0;
  for (const tok of distinctive) {
    if (hay.includes(tok)) distinctiveHits += 1;
  }
  if (distinctiveHits === 0) return 0;

  let score = (distinctiveHits / distinctive.length) * 10;
  if (distinctive.length >= 2 && distinctiveHits === distinctive.length) score += 4;
  for (const tok of all) {
    if (hay.includes(tok)) score += 0.5;
  }
  if (destination && hay.includes(destination.toLowerCase().split(',')[0]!.trim())) {
    score += 2;
  }
  return score;
}

function isBadPhotoCandidate(
  url: string,
  titleOrFilename = '',
  width?: number,
  height?: number,
): boolean {
  const combined = `${url} ${titleOrFilename}`;
  if (BAD_IMAGE_PATTERN.test(combined)) return true;
  if (!/\.(jpe?g|png|webp)(\?|$)/i.test(url.split('#')[0] ?? '') && !url.includes('googleusercontent.com')) {
    return true;
  }
  if (width !== undefined && height !== undefined) {
    if (width < 220 || height < 140) return true;
    const ratio = width / Math.max(1, height);
    if (ratio > 3.2 || ratio < 0.4) return true;
  }
  return false;
}

async function fetchImageAsDataUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'TripPilot/1.0 (https://trippilot.app; travel-itinerary-planner)',
        Accept: 'image/webp,image/jpeg,image/png,image/*;q=0.8',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.startsWith('image/') || contentType.includes('svg')) return null;
    const arr = await res.arrayBuffer();
    if (arr.byteLength < 3000 || arr.byteLength > 2_000_000) return null;
    const mime = contentType.split(';')[0] || 'image/jpeg';
    return `data:${mime};base64,${Buffer.from(arr).toString('base64')}`;
  } catch {
    return null;
  }
}

function setPhotoCache(key: string, dataUrl: string | null) {
  if (PHOTO_CACHE.size > 300) {
    const oldestKey = PHOTO_CACHE.keys().next().value;
    if (oldestKey) PHOTO_CACHE.delete(oldestKey);
  }
  PHOTO_CACHE.set(key, {
    dataUrl,
    expiresAt: Date.now() + (dataUrl ? PHOTO_CACHE_TTL_MS : PHOTO_NULL_TTL_MS),
  });
}

export const fetchPlacePhotoDataUrl = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) =>
    z
      .object({
        photoReference: z.string().optional(),
        placeName: z.string().optional(),
        destination: z.string().optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data }): Promise<{ dataUrl: string | null }> => {
    const cacheKey = `${data.photoReference ?? ''}::${(data.placeName ?? '').trim().toLowerCase()}::${(data.destination ?? '').trim().toLowerCase()}`;
    const cached = PHOTO_CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { dataUrl: cached.dataUrl };
    }

    const googleKey =
      process.env['GOOGLE_PLACES_API_KEY'] ||
      process.env['GOOGLE_MAPS_API_KEY'] ||
      process.env['GOOGLE_API_KEY'];

    async function fetchGoogleMediaUri(photoName: string): Promise<string | null> {
      if (!googleKey) return null;
      if (photoName.startsWith('places/')) {
        const metaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&skipHttpRedirect=true&key=${encodeURIComponent(googleKey)}`;
        const metaRes = await fetch(metaUrl, { signal: AbortSignal.timeout(4500) });
        if (metaRes.ok) {
          const payload = (await metaRes.json()) as { photoUri?: string };
          if (payload.photoUri) {
            const embedded = await fetchImageAsDataUrl(payload.photoUri);
            return embedded || payload.photoUri;
          }
        }
      } else {
        const legacyUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=640&photoreference=${encodeURIComponent(photoName)}&key=${encodeURIComponent(googleKey)}`;
        const dataUri = await fetchImageAsDataUrl(legacyUrl);
        if (dataUri) return dataUri;
      }
      return null;
    }

    if (data.photoReference && /^https?:\/\//i.test(data.photoReference)) {
      const dataUri = await fetchImageAsDataUrl(data.photoReference);
      if (dataUri) {
        setPhotoCache(cacheKey, dataUri);
        return { dataUrl: dataUri };
      }
    }

    if (googleKey && data.photoReference) {
      try {
        const uri = await fetchGoogleMediaUri(data.photoReference);
        if (uri) {
          setPhotoCache(cacheKey, uri);
          return { dataUrl: uri };
        }
      } catch {
        // Continue to placeName lookup
      }
    }

    const placeName = (data.placeName ?? '').trim();
    const destination = (data.destination ?? '').trim();
    const searchQuery = [placeName, destination].filter(Boolean).join(', ');

    if (googleKey && searchQuery) {
      try {
        const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleKey,
            'X-Goog-FieldMask': 'places.photos',
          },
          body: JSON.stringify({
            textQuery: searchQuery,
            maxResultCount: 1,
          }),
          signal: AbortSignal.timeout(4500),
        });
        if (searchRes.ok) {
          const searchJson = (await searchRes.json()) as {
            places?: Array<{ photos?: Array<{ name?: string }> }>;
          };
          const photoName = searchJson.places?.[0]?.photos?.[0]?.name;
          if (photoName) {
            const uri = await fetchGoogleMediaUri(photoName);
            if (uri) {
              setPhotoCache(cacheKey, uri);
              return { dataUrl: uri };
            }
          }
        }
      } catch {
        // Fall through to Wikipedia / Wikimedia Commons fallback
      }
    }

    if (placeName) {
      const candidateUrls: Array<{ url: string; score: number }> = [];

      // 1) Try exact Wikipedia REST summary for the place name (highest precision)
      const exactTitles = [
        placeName,
        placeName.replace(/\s*\([^)]*\)\s*/g, ' ').trim(),
        destination ? `${placeName}, ${destination}` : '',
      ].filter((t, i, arr) => Boolean(t) && arr.indexOf(t) === i);

      for (const title of exactTitles) {
        try {
          const sumRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`,
            {
              headers: { 'User-Agent': 'TripPilot/1.0 (https://trippilot.app)' },
              signal: AbortSignal.timeout(3500),
            },
          );
          if (!sumRes.ok) continue;
          const sum = (await sumRes.json()) as {
            type?: string;
            title?: string;
            description?: string;
            thumbnail?: { source?: string; width?: number; height?: number };
          };
          if (sum.type !== 'standard' || !sum.thumbnail?.source) continue;
          const desc = (sum.description ?? '').toLowerCase();
          if (/\b(politician|actor|cricketer|singer|district|state of india|census town|lok sabha)\b/.test(desc)) {
            continue;
          }
          if (
            !isBadPhotoCandidate(
              sum.thumbnail.source,
              sum.title ?? '',
              sum.thumbnail.width,
              sum.thumbnail.height,
            )
          ) {
            const upscaled = sum.thumbnail.source.replace(/\/\d+px-/, '/640px-');
            const dataUri =
              (await fetchImageAsDataUrl(upscaled)) ||
              (await fetchImageAsDataUrl(sum.thumbnail.source));
            if (dataUri) {
              setPhotoCache(cacheKey, dataUri);
              return { dataUrl: dataUri };
            }
          }
        } catch {
          // Continue
        }
      }

      // 2) Scored Wikipedia search (requires place-name token overlap + rejects maps/logos)
      const wikiQueries = [
        destination ? `${placeName} ${destination}` : placeName,
        placeName,
      ].filter((q, i, arr) => Boolean(q) && arr.indexOf(q) === i);

      for (const wikiQuery of wikiQueries) {
        if (candidateUrls.length > 0) break;
        try {
          const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(wikiQuery)}&gsrlimit=6&prop=pageimages|description&piprop=thumbnail&pithumbsize=800&format=json`;
          const wikiRes = await fetch(wikiSearchUrl, {
            headers: { 'User-Agent': 'TripPilot/1.0 (https://trippilot.app)' },
            signal: AbortSignal.timeout(4000),
          });
          if (wikiRes.ok) {
            const wikiJson = (await wikiRes.json()) as {
              query?: {
                pages?: Record<
                  string,
                  {
                    title?: string;
                    description?: string;
                    thumbnail?: { source?: string; width?: number; height?: number };
                  }
                >;
              };
            };
            for (const page of Object.values(wikiJson.query?.pages ?? {})) {
              const thumb = page.thumbnail;
              if (!thumb?.source || !page.title) continue;
              const desc = (page.description ?? '').toLowerCase();
              if (/\b(politician|actor|cricketer|singer|district|constituency|tehsil|state of india)\b/.test(desc)) {
                continue;
              }
              if (isBadPhotoCandidate(thumb.source, page.title, thumb.width, thumb.height)) continue;
              const score = scoreTitleRelevance(`${page.title} ${page.description ?? ''}`, placeName, destination);
              if (score >= 4) {
                candidateUrls.push({ url: thumb.source, score: score + 3 });
              }
            }
          }
        } catch {
          // Ignore and try next query / Wikimedia Commons
        }
      }

      // 3) Scored Wikimedia Commons file search fallback (strictly filtered to real photos matching the place)
      if (candidateUrls.length === 0) {
        try {
          const commonsQuery = destination ? `${placeName} ${destination}` : placeName;
          const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(commonsQuery)}&gsrlimit=8&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=640&format=json`;
          const commonsRes = await fetch(commonsUrl, {
            headers: { 'User-Agent': 'TripPilot/1.0 (https://trippilot.app)' },
            signal: AbortSignal.timeout(4000),
          });
          if (commonsRes.ok) {
            const commonsJson = (await commonsRes.json()) as {
              query?: {
                pages?: Record<
                  string,
                  {
                    title?: string;
                    imageinfo?: Array<{
                      thumburl?: string;
                      url?: string;
                      width?: number;
                      height?: number;
                      mime?: string;
                    }>;
                  }
                >;
              };
            };
            for (const page of Object.values(commonsJson.query?.pages ?? {})) {
              const info = page.imageinfo?.[0];
              if (!info) continue;
              if (info.mime && !/^image\/(jpeg|png|webp)$/i.test(info.mime)) continue;
              const url = info.thumburl || info.url;
              if (!url) continue;
              if (isBadPhotoCandidate(url, page.title ?? '', info.width, info.height)) continue;
              const score = scoreTitleRelevance(page.title ?? '', placeName, destination);
              if (score >= 5) {
                candidateUrls.push({ url, score });
              }
            }
          }
        } catch {
          // Ignore fallback failure
        }
      }

      candidateUrls.sort((a, b) => b.score - a.score);
      for (const candidate of candidateUrls.slice(0, 3)) {
        const dataUri = await fetchImageAsDataUrl(candidate.url);
        if (dataUri) {
          setPhotoCache(cacheKey, dataUri);
          return { dataUrl: dataUri };
        }
      }
    }

    setPhotoCache(cacheKey, null);
    return { dataUrl: null };
  });

export type PlaceDetailsPayload = {
  summary: string | null;
  address: string | null;
  rating: number | null;
  userRatingCount: number | null;
  websiteUri: string | null;
  googleMapsUri: string | null;
  wikipediaUrl: string | null;
  openingHoursText: string[];
};

export const fetchPlaceDetails = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) =>
    z
      .object({
        placeName: z.string().min(1),
        destination: z.string().optional(),
      })
      .parse(raw),
  )
  .handler(async ({ data }): Promise<PlaceDetailsPayload> => {
    const googleKey =
      process.env['GOOGLE_PLACES_API_KEY'] ||
      process.env['GOOGLE_MAPS_API_KEY'] ||
      process.env['GOOGLE_API_KEY'];
    const query = [data.placeName, data.destination].filter(Boolean).join(', ');

    let address: string | null = null;
    let rating: number | null = null;
    let userRatingCount: number | null = null;
    let websiteUri: string | null = null;
    let googleMapsUri: string | null = null;
    let openingHoursText: string[] = [];
    let summary: string | null = null;
    let wikipediaUrl: string | null = null;

    const googlePromise = (async () => {
      if (!googleKey) return;
      try {
        const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleKey,
            'X-Goog-FieldMask':
              'places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.editorialSummary,places.regularOpeningHours.weekdayDescriptions',
          },
          body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
          signal: AbortSignal.timeout(4500),
        });
        if (!res.ok) return;
        const json = (await res.json()) as {
          places?: Array<{
            formattedAddress?: string;
            rating?: number;
            userRatingCount?: number;
            websiteUri?: string;
            googleMapsUri?: string;
            editorialSummary?: { text?: string };
            regularOpeningHours?: { weekdayDescriptions?: string[] };
          }>;
        };
        const place = json.places?.[0];
        if (!place) return;
        address = place.formattedAddress ?? null;
        rating = place.rating ?? null;
        userRatingCount = place.userRatingCount ?? null;
        websiteUri = place.websiteUri ?? null;
        googleMapsUri = place.googleMapsUri ?? null;
        summary = place.editorialSummary?.text ?? null;
        openingHoursText = place.regularOpeningHours?.weekdayDescriptions ?? [];
      } catch {
        // Fall back to Wikipedia details
      }
    })();

    const wikiPromise = (async () => {
      try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json`;
        const searchRes = await fetch(searchUrl, {
          headers: { 'User-Agent': 'TripPilot/1.0' },
          signal: AbortSignal.timeout(4000),
        });
        if (!searchRes.ok) return;
        const searchJson = (await searchRes.json()) as {
          query?: { search?: Array<{ title: string }> };
        };
        const title = searchJson.query?.search?.[0]?.title;
        if (!title) return;

        const sumRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`,
          {
            headers: { 'User-Agent': 'TripPilot/1.0' },
            signal: AbortSignal.timeout(4000),
          },
        );
        if (!sumRes.ok) return;
        const sumJson = (await sumRes.json()) as {
          extract?: string;
          content_urls?: { desktop?: { page?: string } };
        };
        if (!summary && sumJson.extract) summary = sumJson.extract;
        wikipediaUrl = sumJson.content_urls?.desktop?.page ?? null;
      } catch {
        // Ignore Wikipedia detail error
      }
    })();

    await Promise.all([googlePromise, wikiPromise]);

    return {
      summary,
      address,
      rating,
      userRatingCount,
      websiteUri,
      googleMapsUri,
      wikipediaUrl,
      openingHoursText,
    };
  });

export const saveTripToMongo = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => SaveTripSchema.parse(raw))
  .handler(async ({ data }): Promise<{ tripId: string }> => {
    const { getSessionUser } = await import('@/lib/auth');
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { ObjectId } = await import('mongodb');

    const { user } = await getSessionUser();
    if (!user) {
      throw new Error('Sign in to save trips to your account.');
    }

    const db = await getMongoDb();
    const trips = db.collection('trips');
    const now = new Date().toISOString();

    if (data.tripId) {
      await trips.updateOne(
        { _id: new ObjectId(data.tripId), userId: user.id },
        {
          $set: {
            destination: data.destination,
            center: data.center,
            budget: data.budget,
            numberOfDays: data.numberOfDays,
            travelers: data.travelers,
            interests: data.interests,
            transportMode: data.transportMode,
            ...(data.startPoint ? { startPoint: data.startPoint } : {}),
            itinerary: data.itinerary,
            candidates: data.candidates,
            weatherConfigured: data.weatherConfigured,
            ...(data.aiResponseText ? { aiResponseText: data.aiResponseText } : {}),
            ...(data.budgetSummary ? { budgetSummary: data.budgetSummary } : {}),
            ...(data.modelName ? { modelName: data.modelName } : {}),
            updatedAt: now,
          },
        },
      );
      return { tripId: data.tripId };
    }

    const inserted = await trips.insertOne({
      userId: user.id,
      destination: data.destination,
      center: data.center,
      budget: data.budget,
      numberOfDays: data.numberOfDays,
      travelers: data.travelers,
      interests: data.interests,
      transportMode: data.transportMode,
      ...(data.startPoint ? { startPoint: data.startPoint } : {}),
      itinerary: data.itinerary,
      candidates: data.candidates,
      weatherConfigured: data.weatherConfigured,
      ...(data.aiResponseText ? { aiResponseText: data.aiResponseText } : {}),
      ...(data.budgetSummary ? { budgetSummary: data.budgetSummary } : {}),
      ...(data.modelName ? { modelName: data.modelName } : {}),
      createdAt: now,
      updatedAt: now,
    });

    return { tripId: inserted.insertedId.toString() };
  });

export const getSavedTripsFromMongo = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ trips: TripRecord[] }> => {
    const { getSessionUser } = await import('@/lib/auth');
    const { getMongoDb } = await import('@/lib/mongodb.server');

    const { user } = await getSessionUser();
    if (!user) return { trips: [] };

    const db = await getMongoDb();
    const docs = await db
      .collection('trips')
      .find({ userId: user.id })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    return {
      trips: docs.map((d) => ({
        ...(d as unknown as Omit<TripRecord, '_id'>),
        _id: d._id.toString(),
      })),
    };
  },
);

export const getPublicTripById = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) => z.object({ tripId: z.string().min(1) }).parse(raw))
  .handler(async ({ data }): Promise<{ trip: TripRecord | null }> => {
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { ObjectId } = await import('mongodb');

    if (!ObjectId.isValid(data.tripId)) return { trip: null };
    const db = await getMongoDb();
    const doc = await db.collection('trips').findOne({ _id: new ObjectId(data.tripId) });
    if (!doc) return { trip: null };

    return {
      trip: {
        ...(doc as unknown as Omit<TripRecord, '_id'>),
        _id: doc._id.toString(),
      },
    };
  });

export const deleteTripFromMongo = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => z.object({ tripId: z.string().min(1) }).parse(raw))
  .handler(async ({ data }) => {
    const { getSessionUser } = await import('@/lib/auth');
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { ObjectId } = await import('mongodb');

    const { user } = await getSessionUser();
    if (!user) throw new Error('Sign in required.');

    const db = await getMongoDb();
    await db.collection('trips').deleteOne({ _id: new ObjectId(data.tripId), userId: user.id });
    return { ok: true };
  });

export const duplicateTripInMongo = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => z.object({ tripId: z.string().min(1) }).parse(raw))
  .handler(async ({ data }): Promise<{ tripId: string }> => {
    const { getSessionUser } = await import('@/lib/auth');
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { ObjectId } = await import('mongodb');

    const { user } = await getSessionUser();
    if (!user) throw new Error('Sign in required.');

    const db = await getMongoDb();
    const trips = db.collection('trips');
    const doc = await trips.findOne({ _id: new ObjectId(data.tripId), userId: user.id });
    if (!doc) throw new Error('Trip not found.');

    const now = new Date().toISOString();
    const { _id: _, ...rest } = doc;
    const inserted = await trips.insertOne({
      ...rest,
      destination: `${String(doc['destination'])} (Copy)`,
      createdAt: now,
      updatedAt: now,
    });
    return { tripId: inserted.insertedId.toString() };
  });

export const searchCustomPlace = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) =>
    z.object({ query: z.string().trim().min(2), destination: z.string().trim().min(2) }).parse(raw),
  )
  .handler(async ({ data }): Promise<{ place: AttractionCandidate | null }> => {
    const { discoverAttractions } = await import('@/lib/places.server');
    const res = await discoverAttractions({
      destination: `${data.query} in ${data.destination}`,
      interests: [],
      limit: 3,
    });
    return { place: res.attractions[0] ?? null };
  });

export const reverseGeocodeCity = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) => z.object({ lat: z.number(), lng: z.number() }).parse(raw))
  .handler(async ({ data }): Promise<{ city: string | null }> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.lat}&lon=${data.lng}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'TripPilot/1.0' } });
      if (!res.ok) return { city: null };
      const json = (await res.json()) as {
        address?: {
          city?: string;
          town?: string;
          village?: string;
          state_district?: string;
          state?: string;
        };
      };
    const addr = json.address;
      const city = addr?.city || addr?.town || addr?.village || addr?.state_district || addr?.state || null;
      return { city };
    } catch {
      return { city: null };
    }
  });

export const voteTripStop = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) =>
    z
      .object({
        tripId: z.string().min(1),
        dayNumber: z.number().int().min(1),
        attractionId: z.string().min(1),
        direction: z.enum(['up', 'down']),
      })
      .parse(raw),
  )
  .handler(async ({ data }): Promise<{ itinerary: ItineraryDay[] }> => {
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { ObjectId } = await import('mongodb');

    if (!ObjectId.isValid(data.tripId)) {
      throw new Error('Invalid trip ID.');
    }

    const db = await getMongoDb();
    const trips = db.collection('trips');
    const field = data.direction === 'up' ? 'itinerary.$[d].stops.$[s].votes.up' : 'itinerary.$[d].stops.$[s].votes.down';

    await trips.updateOne(
      { _id: new ObjectId(data.tripId) },
      {
        $inc: { [field]: 1 },
        $set: { updatedAt: new Date().toISOString() },
      },
      {
        arrayFilters: [
          { 'd.dayNumber': data.dayNumber },
          { 's.attractionId': data.attractionId },
        ],
      },
    );

    const updated = await trips.findOne({ _id: new ObjectId(data.tripId) });
    return {
      itinerary: (updated?.['itinerary'] as ItineraryDay[] | undefined) ?? [],
    };
  });

export const searchIndianCitiesServer = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) => z.object({ query: z.string().trim().min(2).max(60) }).parse(raw))
  .handler(
    async ({ data }): Promise<{ cities: Array<{ name: string; state: string; vibe: string }> }> => {
      const q = data.query.trim();
      const qLower = q.toLowerCase();
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=in&featureType=city&limit=10&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'TripPilot/1.0 (https://trippilot.app)' },
          signal: AbortSignal.timeout(3500),
        });
        if (!res.ok) return { cities: [] };
        const items = (await res.json()) as Array<{
          name?: string;
          display_name?: string;
          address?: {
            city?: string;
            town?: string;
            village?: string;
            municipality?: string;
            state_district?: string;
            state?: string;
          };
        }>;
        const seen = new Set<string>();
        const results: Array<{ name: string; state: string; vibe: string }> = [];
        for (const item of items) {
          const rawName =
            item.name ||
            item.address?.city ||
            item.address?.town ||
            item.address?.municipality ||
            item.address?.village ||
            '';
          const cleanName = rawName.trim();
          if (!cleanName || !cleanName.toLowerCase().startsWith(qLower)) continue;
          const key = cleanName.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          const state = item.address?.state || item.address?.state_district || 'India';
          results.push({
            name: cleanName,
            state,
            vibe: `Explore landmarks & local culture in ${cleanName}`,
          });
          if (results.length >= 6) break;
        }
        return { cities: results };
      } catch {
        return { cities: [] };
      }
    },
  );
