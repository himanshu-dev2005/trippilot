import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { TransportMode } from '@/lib/optimizer';

export type TravelerProfile = {
  displayName: string;
  homeCity: string;
  travelPace: 'relaxed' | 'balanced' | 'fast';
  dietaryPreference: 'any' | 'veg' | 'vegan' | 'jain';
  bio: string;
  defaultBudget: number;
  defaultDays: number;
  defaultTransportMode: TransportMode;
  defaultInterests: string[];
};

export type FavouritePlace = {
  _id?: string;
  destination: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  createdAt: string;
};

const ProfileSchema = z.object({
  displayName: z.string().trim().max(80).default(''),
  homeCity: z.string().trim().max(80).default(''),
  travelPace: z.enum(['relaxed', 'balanced', 'fast']).default('balanced'),
  dietaryPreference: z.enum(['any', 'veg', 'vegan', 'jain']).default('any'),
  bio: z.string().trim().max(240).default(''),
  defaultBudget: z.number().min(0).max(500000).default(5000),
  defaultDays: z.number().int().min(1).max(10).default(3),
  defaultTransportMode: z.enum(['walking', 'transit', 'cab']).default('cab'),
  defaultInterests: z.array(z.string()).default([]),
});

const FavouriteSchema = z.object({
  destination: z.string().min(1),
  name: z.string().min(1),
  category: z.string().default('Sightseeing'),
  lat: z.number().default(0),
  lng: z.number().default(0),
});

export const getMongoProfile = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ profile: TravelerProfile | null }> => {
    const { getSessionUser } = await import('@/lib/auth');
    const { getMongoDb } = await import('@/lib/mongodb.server');

    const { user } = await getSessionUser();
    if (!user) return { profile: null };

    const db = await getMongoDb();
    const doc = await db.collection('profiles').findOne({ userId: user.id });
    if (!doc) return { profile: null };

    return {
      profile: {
        displayName: String(doc['displayName'] ?? ''),
        homeCity: String(doc['homeCity'] ?? ''),
        travelPace: (doc['travelPace'] as TravelerProfile['travelPace']) || 'balanced',
        dietaryPreference: (doc['dietaryPreference'] as TravelerProfile['dietaryPreference']) || 'any',
        bio: String(doc['bio'] ?? ''),
        defaultBudget: Number(doc['defaultBudget'] ?? 5000),
        defaultDays: Number(doc['defaultDays'] ?? 3),
        defaultTransportMode: (doc['defaultTransportMode'] as TransportMode) || 'cab',
        defaultInterests: Array.isArray(doc['defaultInterests']) ? (doc['defaultInterests'] as string[]) : [],
      },
    };
  },
);

export const saveMongoProfile = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => ProfileSchema.parse(raw))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { getSessionUser } = await import('@/lib/auth');
    const { getMongoDb } = await import('@/lib/mongodb.server');

    const { user } = await getSessionUser();
    if (!user) throw new Error('Sign in to save your profile.');

    const db = await getMongoDb();
    await db.collection('profiles').updateOne(
      { userId: user.id },
      {
        $set: {
          userId: user.id,
          displayName: data.displayName,
          homeCity: data.homeCity,
          travelPace: data.travelPace,
          dietaryPreference: data.dietaryPreference,
          bio: data.bio,
          defaultBudget: data.defaultBudget,
          defaultDays: data.defaultDays,
          defaultTransportMode: data.defaultTransportMode,
          defaultInterests: data.defaultInterests,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    return { ok: true };
  });

export const getMongoFavourites = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ favourites: FavouritePlace[] }> => {
    const { getSessionUser } = await import('@/lib/auth');
    const { getMongoDb } = await import('@/lib/mongodb.server');

    const { user } = await getSessionUser();
    if (!user) return { favourites: [] };

    const db = await getMongoDb();
    const docs = await db
      .collection('favourites')
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return {
      favourites: docs.map((d) => ({
        _id: d._id.toString(),
        destination: String(d['destination'] ?? ''),
        name: String(d['name'] ?? ''),
        category: String(d['category'] ?? 'Sightseeing'),
        lat: Number(d['lat'] ?? 0),
        lng: Number(d['lng'] ?? 0),
        createdAt: String(d['createdAt'] ?? ''),
      })),
    };
  },
);

export const toggleMongoFavourite = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => FavouriteSchema.parse(raw))
  .handler(async ({ data }): Promise<{ saved: boolean }> => {
    const { getSessionUser } = await import('@/lib/auth');
    const { getMongoDb } = await import('@/lib/mongodb.server');

    const { user } = await getSessionUser();
    if (!user) throw new Error('Sign in required.');

    const db = await getMongoDb();
    const col = db.collection('favourites');
    const existing = await col.findOne({
      userId: user.id,
      destination: data.destination,
      name: data.name,
    });

    if (existing) {
      await col.deleteOne({ _id: existing._id });
      return { saved: false };
    }

    await col.insertOne({
      userId: user.id,
      destination: data.destination,
      name: data.name,
      category: data.category,
      lat: data.lat,
      lng: data.lng,
      createdAt: new Date().toISOString(),
    });
    return { saved: true };
  });
