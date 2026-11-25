import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
  applyWeatherAdjustment,
  optimizeItinerary,
  regenerateSingleDay,
  replanForBudget,
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

    const [{ center, attractions, source }, startPoint] = await Promise.all([
      discoverAttractions({
        destination: data.destination,
        interests: data.interests,
        limit: Math.max(12, data.numberOfDays * 5),
      }),
      data.startPointQuery ? resolveStartPoint(data.startPointQuery, data.destination) : Promise.resolve(undefined),
    ]);

    const weather = await getDestinationWeather({
      coordinates: center,
      numberOfDays: data.numberOfDays,
      ...(data.startDate ? { startDate: data.startDate } : {}),
    });

    const optimized = optimizeItinerary({
      destination: data.destination,
      attractions,
      numberOfDays: data.numberOfDays,
      budget: data.budget,
      transportMode: data.transportMode,
      ...(startPoint ? { startPoint } : {}),
      ...(data.startDate ? { startDate: data.startDate } : {}),
      dailyWeather: weather.days,
    });

    return {
      destination: data.destination,
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
  .inputValidator((raw: unknown) => z.object({ photoReference: z.string().min(1) }).parse(raw))
  .handler(async ({ data }): Promise<{ dataUrl: string | null }> => {
    const googleKey = process.env['GOOGLE_PLACES_API_KEY'];
    if (!googleKey) return { dataUrl: null };
    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${encodeURIComponent(data.photoReference)}&key=${encodeURIComponent(googleKey)}`;
    const res = await fetch(url);
    if (!res.ok) return { dataUrl: null };
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());
    return { dataUrl: `data:${contentType};base64,${buffer.toString('base64')}` };
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
