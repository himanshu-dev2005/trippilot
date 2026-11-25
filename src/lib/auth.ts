import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
};

const COOKIE_NAME = 'trippilot_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const CredentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const SignUpSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const ForgotSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

const ResetSchema = z.object({
  token: z.string().min(1, 'Reset token is missing'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

async function getCryptoHelpers() {
  const crypto = await import('node:crypto');
  const secret = process.env['AUTH_SECRET'] || 'trippilot-dev-secret-change-in-production';

  function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  function verifyPassword(password: string, stored: string): boolean {
    const [salt, keyHex] = stored.split(':');
    if (!salt || !keyHex) return false;
    const keyBuf = Buffer.from(keyHex, 'hex');
    const derived = crypto.scryptSync(password, salt, 64);
    if (keyBuf.length !== derived.length) return false;
    return crypto.timingSafeEqual(keyBuf, derived);
  }

  function signSession(user: SessionUser): string {
    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
    const payload = Buffer.from(JSON.stringify({ ...user, exp })).toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  }

  function verifySession(token: string | undefined): SessionUser | null {
    if (!token) return null;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    try {
      const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionUser & { exp: number };
      if (!parsed.id || !parsed.email || parsed.exp < Math.floor(Date.now() / 1000)) return null;
      return { id: parsed.id, email: parsed.email };
    } catch {
      return null;
    }
  }

  return { hashPassword, verifyPassword, signSession, verifySession, randomToken: () => crypto.randomBytes(24).toString('hex') };
}

export const getSessionUser = createServerFn({ method: 'GET' }).handler(async (): Promise<{ user: SessionUser | null }> => {
  const { getCookie } = await import('@tanstack/react-start/server');
  const { verifySession } = await getCryptoHelpers();
  const token = getCookie(COOKIE_NAME);
  const sessionUser = verifySession(token);
  if (!sessionUser) return { user: null };

  try {
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const db = await getMongoDb();
    const profile = await db
      .collection('profiles')
      .findOne({ userId: sessionUser.id }, { projection: { displayName: 1 } });
    const displayName = typeof profile?.['displayName'] === 'string' ? profile['displayName'].trim() : '';
    if (displayName) {
      return { user: { ...sessionUser, name: displayName } };
    }
  } catch {
    // Fall back to cookie-only session if profile lookup fails
  }

  return { user: sessionUser };
});

export const signUpWithMongo = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => SignUpSchema.parse(raw))
  .handler(async ({ data }): Promise<{ user: SessionUser }> => {
    const { setCookie, getRequestHeader, getRequestUrl } = await import('@tanstack/react-start/server');
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { hashPassword, signSession } = await getCryptoHelpers();
    const isHttps =
      getRequestHeader('x-forwarded-proto') === 'https' || getRequestUrl().protocol === 'https:';

    const db = await getMongoDb();
    const users = db.collection('users');
    const email = data.email.toLowerCase();

    const existing = await users.findOne({ email });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const insert = await users.insertOne({
      email,
      passwordHash: hashPassword(data.password),
      createdAt: new Date(),
    });

    const user: SessionUser = { id: insert.insertedId.toString(), email };
    setCookie(COOKIE_NAME, signSession(user), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: isHttps,
      maxAge: SESSION_TTL_SECONDS,
    });

    return { user };
  });

export const signInWithMongo = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => CredentialsSchema.parse(raw))
  .handler(async ({ data }): Promise<{ user: SessionUser }> => {
    const { setCookie, getRequestHeader, getRequestUrl } = await import('@tanstack/react-start/server');
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { verifyPassword, signSession } = await getCryptoHelpers();
    const isHttps =
      getRequestHeader('x-forwarded-proto') === 'https' || getRequestUrl().protocol === 'https:';

    const db = await getMongoDb();
    const users = db.collection('users');
    const email = data.email.toLowerCase();

    const doc = await users.findOne<{ _id: { toString: () => string }; email: string; passwordHash: string }>({ email });
    if (!doc || !verifyPassword(data.password, doc.passwordHash)) {
      throw new Error('Invalid email or password.');
    }

    const user: SessionUser = { id: doc._id.toString(), email: doc.email };
    setCookie(COOKIE_NAME, signSession(user), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: isHttps,
      maxAge: SESSION_TTL_SECONDS,
    });

    return { user };
  });

export const signOutMongo = createServerFn({ method: 'POST' }).handler(async () => {
  const { deleteCookie } = await import('@tanstack/react-start/server');
  deleteCookie(COOKIE_NAME, { path: '/' });
  return { ok: true };
});

export const requestPasswordResetMongo = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => ForgotSchema.parse(raw))
  .handler(async ({ data }): Promise<{ resetToken?: string }> => {
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { randomToken } = await getCryptoHelpers();

    const db = await getMongoDb();
    const email = data.email.toLowerCase();
    const user = await db.collection('users').findOne({ email });
    if (!user) return {};

    const token = randomToken();
    await db.collection('password_resets').insertOne({
      email,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return { resetToken: token };
  });

export const resetPasswordMongo = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => ResetSchema.parse(raw))
  .handler(async ({ data }) => {
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { hashPassword } = await getCryptoHelpers();

    const db = await getMongoDb();
    const resets = db.collection('password_resets');
    const record = await resets.findOne<{ email: string; expiresAt: Date }>({ token: data.token });

    if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
      throw new Error('This reset link is invalid or has expired. Request a new one.');
    }

    await db.collection('users').updateOne(
      { email: record.email },
      { $set: { passwordHash: hashPassword(data.password) } },
    );
    await resets.deleteMany({ email: record.email });

    return { ok: true };
  });

export const getGoogleOAuthUrl = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => z.object({ redirectUri: z.string().url() }).parse(raw))
  .handler(async ({ data }): Promise<{ url: string }> => {
    const clientId = process.env['GOOGLE_CLIENT_ID'];
    if (!clientId) {
      throw new Error(
        'Google sign-in is not configured yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env / Vercel Environment Variables.',
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: data.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    });

    return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` };
  });

export const exchangeGoogleCodeMongo = createServerFn({ method: 'POST' })
  .inputValidator((raw: unknown) => z.object({ code: z.string().min(1), redirectUri: z.string().url() }).parse(raw))
  .handler(async ({ data }): Promise<{ user: SessionUser }> => {
    const clientId = process.env['GOOGLE_CLIENT_ID'];
    const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
    if (!clientId || !clientSecret) {
      throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured.');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: data.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: data.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Failed to exchange Google authorization code.');
    }

    const tokens = (await tokenRes.json()) as { access_token?: string };
    if (!tokens.access_token) {
      throw new Error('Google did not return an access token.');
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) {
      throw new Error('Failed to fetch Google user profile.');
    }

    const profile = (await profileRes.json()) as { email?: string; id?: string };
    if (!profile.email) {
      throw new Error('Google account email is unavailable.');
    }

    const { setCookie, getRequestHeader, getRequestUrl } = await import('@tanstack/react-start/server');
    const { getMongoDb } = await import('@/lib/mongodb.server');
    const { signSession } = await getCryptoHelpers();
    const isHttps =
      getRequestHeader('x-forwarded-proto') === 'https' || getRequestUrl().protocol === 'https:';

    const db = await getMongoDb();
    const users = db.collection('users');
    const email = profile.email.toLowerCase();

    let existing = await users.findOne<{ _id: { toString: () => string }; email: string }>({ email });
    let userId: string;

    if (existing) {
      userId = existing._id.toString();
    } else {
      const inserted = await users.insertOne({
        email,
        googleId: profile.id,
        createdAt: new Date(),
      });
      userId = inserted.insertedId.toString();
    }

    const user: SessionUser = { id: userId, email };
    setCookie(COOKIE_NAME, signSession(user), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: isHttps,
      maxAge: SESSION_TTL_SECONDS,
    });

    return { user };
  });
