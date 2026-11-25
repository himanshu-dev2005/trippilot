import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  applyWeatherAdjustment,
  optimizeItinerary,
  regenerateSingleDay,
  replanForBudget,
  resolveCitySpelling,
  type AttractionCandidate,
  type Coordinates,
  type ItineraryDay,
  type StartPoint,
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
  createdAt: string;
  updatedAt: string;
};

const TransportSchema = z.enum(['walking', 'transit', 'cab']).default('cab');

const GenerateSchema = z.object({
  destination: z.string().trim().min(2).max(80),
  numberOfDays: z.number().int().min(1).max(10),
  budget: z.number().min(0).max(500000),
  interests: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  transportMode: TransportSchema,
  startPointQuery: z.string().optional(),
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
});

export const generateOptimizedTrip = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => GenerateSchema.parse(raw))
  .handler(async ({ data }) => {
    const { discoverAttractions, resolveStartPoint } = await import('@/lib/places.server');
    const { getDestinationWeather } = await import('@/lib/weather.server');

    const { city: resolvedDestination, correctedFrom } = resolveCitySpelling(data.destination);

    const [{ center, attractions, source }, startPoint] = await Promise.all([
      discoverAttractions({
        destination: resolvedDestination,
        interests: data.interests,
        limit: Math.max(12, data.numberOfDays * 5),
      }),
      data.startPointQuery
        ? resolveStartPoint(data.startPointQuery, resolvedDestination)
        : Promise.resolve(undefined),
    ]);

    const weather = await getDestinationWeather({
      coordinates: center,
      numberOfDays: data.numberOfDays,
      ...(data.startDate ? { startDate: data.startDate } : {}),
    });

    const optimized = optimizeItinerary({
      destination: resolvedDestination,
      attractions,
      numberOfDays: data.numberOfDays,
      budget: data.budget,
      transportMode: data.transportMode,
      ...(startPoint ? { startPoint } : {}),
      ...(data.startDate ? { startDate: data.startDate } : {}),
      dailyWeather: weather.days,
    });

    return {
      destination: resolvedDestination,
      ...(correctedFrom ? { correctedFrom } : {}),
      center,
      source,
      transportMode: data.transportMode,
      startPoint,
      weatherConfigured: weather.configured,
      candidates: attractions,
      ...optimized,
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

export const fetchPlacePhotoDataUrl = createServerFn({ method: 'GET' })
  .inputValidator((raw: unknown) =>
    z.object({ photoReference: z.string().optional(), placeName: z.string().optional() }).parse(raw),
  )
  .handler(async ({ data }): Promise<{ dataUrl: string | null }> => {
    const googleKey = process.env['GOOGLE_PLACES_API_KEY'];

    async function fetchGoogleMediaUri(photoName: string): Promise<string | null> {
      if (!googleKey) return null;
      if (photoName.startsWith('places/')) {
        const metaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=600&skipHttpRedirect=true&key=${encodeURIComponent(googleKey)}`;
        const metaRes = await fetch(metaUrl);
        if (metaRes.ok) {
          const payload = (await metaRes.json()) as { photoUri?: string };
          if (payload.photoUri) return payload.photoUri;
        }
      } else {
        const legacyUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${encodeURIComponent(photoName)}&key=${encodeURIComponent(googleKey)}`;
        const res = await fetch(legacyUrl);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || 'image/jpeg';
          const buffer = Buffer.from(await res.arrayBuffer());
          return `data:${contentType};base64,${buffer.toString('base64')}`;
        }
      }
      return null;
    }

    if (googleKey && data.photoReference) {
      try {
        const uri = await fetchGoogleMediaUri(data.photoReference);
        if (uri) return { dataUrl: uri };
      } catch {
        // Continue to placeName lookup
      }
    }

    if (googleKey && data.placeName) {
      try {
        const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleKey,
            'X-Goog-FieldMask': 'places.photos',
          },
          body: JSON.stringify({
            textQuery: data.placeName,
            maxResultCount: 1,
          }),
        });
        if (searchRes.ok) {
          const searchJson = (await searchRes.json()) as {
            places?: Array<{ photos?: Array<{ name?: string }> }>;
          };
          const photoName = searchJson.places?.[0]?.photos?.[0]?.name;
          if (photoName) {
            const uri = await fetchGoogleMediaUri(photoName);
            if (uri) return { dataUrl: uri };
          }
        }
      } catch {
        // Fall through to Wikipedia fallback if Google Places lookup fails
      }
    }

    if (data.placeName) {
      try {
        const title = encodeURIComponent(data.placeName.trim().replace(/\s+/g, '_'));
        const summaryRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
          headers: { 'User-Agent': 'TripPilot/1.0' },
        });
        if (summaryRes.ok) {
          const summary = (await summaryRes.json()) as { thumbnail?: { source?: string } };
          if (summary.thumbnail?.source) return { dataUrl: summary.thumbnail.source };
        }
      } catch {
        // Ignore fallback failure
      }
    }

    return { dataUrl: null };
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
