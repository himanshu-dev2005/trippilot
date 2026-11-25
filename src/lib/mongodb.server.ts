import { MongoClient, type Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __trippilotMongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getMongoDb(): Promise<Db> {
  const uri = process.env['MONGODB_URI'];
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not configured. Add your MongoDB Atlas connection string to .env (locally) or Vercel Environment Variables.',
    );
  }

  if (!globalThis.__trippilotMongoClientPromise) {
    const client = new MongoClient(uri);
    globalThis.__trippilotMongoClientPromise = client.connect();
  }

  const client = await globalThis.__trippilotMongoClientPromise;
  const dbName = process.env['MONGODB_DB'] || 'trippilot';
  return client.db(dbName);
}
