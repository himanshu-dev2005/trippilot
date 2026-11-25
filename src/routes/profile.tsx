import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, LoaderCircle, UserRound } from 'lucide-react';
import { getMongoProfile, saveMongoProfile } from '@/lib/profile';
import { type TransportMode } from '@/lib/optimizer';
import { useAccount } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const INTERESTS = [
  'Culture & Heritage',
  'Nature & Parks',
  'Food & Cafés',
  'History & Forts',
  'Adventure & Treks',
  'Shopping & Markets',
  'Spiritual & Temples',
  'Museums & Art',
];

export const Route = createFileRoute('/profile')({
  head: () => ({ meta: [{ title: 'Traveler Profile — TripPilot' }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading: authLoading } = useAccount();
  const [homeCity, setHomeCity] = useState('');
  const [defaultBudget, setDefaultBudget] = useState(5000);
  const [defaultDays, setDefaultDays] = useState(3);
  const [defaultTransportMode, setDefaultTransportMode] = useState<TransportMode>('cab');
  const [defaultInterests, setDefaultInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    void getMongoProfile()
      .then(({ profile }) => {
        if (profile) {
          setHomeCity(profile.homeCity);
          setDefaultBudget(profile.defaultBudget);
          setDefaultDays(profile.defaultDays);
          setDefaultTransportMode(profile.defaultTransportMode);
          setDefaultInterests(profile.defaultInterests);
        }
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setError('');
    try {
      await saveMongoProfile({
        data: {
          homeCity,
          defaultBudget: Number(defaultBudget) || 5000,
          defaultDays: Number(defaultDays) || 3,
          defaultTransportMode,
          defaultInterests,
        },
      });
      setSavedMsg('Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!authLoading && !user) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="font-display text-3xl">Traveler Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to save your default trip preferences.</p>
        <Button asChild className="mt-6">
          <Link to="/auth">Sign in</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <div className="flex items-center gap-2 text-primary">
        <UserRound className="size-5" />
        <span className="font-mono text-xs uppercase">{user?.email}</span>
      </div>
      <h1 className="mt-2 font-display text-4xl">Traveler Preferences</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Save your default travel settings to speed up planning.
      </p>

      {loading ? (
        <div className="py-12">
          <LoaderCircle className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="homeCity">Home City</Label>
            <Input
              id="homeCity"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              placeholder="e.g. Delhi, Mumbai, Bengaluru"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultBudget">Default Budget (₹)</Label>
              <Input
                id="defaultBudget"
                type="number"
                min={0}
                step={500}
                value={defaultBudget}
                onChange={(e) => setDefaultBudget(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultDays">Default Trip Days</Label>
              <Input
                id="defaultDays"
                type="number"
                min={1}
                max={10}
                value={defaultDays}
                onChange={(e) => setDefaultDays(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Default Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const active = defaultInterests.includes(interest);
                return (
                  <Button
                    key={interest}
                    type="button"
                    size="sm"
                    variant={active ? 'default' : 'outline'}
                    onClick={() =>
                      setDefaultInterests((prev) =>
                        prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
                      )
                    }
                    className="h-8 rounded-full text-xs"
                  >
                    {interest}
                  </Button>
                );
              })}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {savedMsg && (
            <p role="status" className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="size-4" />
              {savedMsg}
            </p>
          )}

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save preferences'}
          </Button>
        </form>
      )}
    </main>
  );
}
