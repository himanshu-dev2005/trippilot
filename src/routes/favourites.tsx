import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import { getMongoFavourites, toggleMongoFavourite, type FavouritePlace } from '@/lib/profile';
import { useAccount } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';

const FAVOURITES_KEY = 'trippilot:favourites';

export const Route = createFileRoute('/favourites')({
  head: () => ({ meta: [{ title: 'Favourites — TripPilot' }] }),
  component: FavouritesPage,
});

function FavouritesPage() {
  const { user } = useAccount();
  const navigate = useNavigate();
  const [mongoFavs, setMongoFavs] = useState<FavouritePlace[]>([]);
  const [localFavs, setLocalFavs] = useState<Array<{ destination: string; name: string }>>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(FAVOURITES_KEY) || '[]') as string[];
      setLocalFavs(
        saved.map((entry) => {
          const [destination = '', name = entry] = entry.split('::');
          return { destination, name };
        }),
      );
    } catch {
      setLocalFavs([]);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setMongoFavs([]);
      return;
    }
    void getMongoFavourites()
      .then((res) => setMongoFavs(res.favourites))
      .catch(() => {});
  }, [user]);

  async function removeMongoFav(fav: FavouritePlace) {
    await toggleMongoFavourite({
      data: {
        destination: fav.destination,
        name: fav.name,
        category: fav.category,
        lat: fav.lat,
        lng: fav.lng,
      },
    });
    setMongoFavs((prev) => prev.filter((item) => !(item.destination === fav.destination && item.name === fav.name)));
  }

  function removeLocalFav(destination: string, name: string) {
    const key = `${destination}::${name}`;
    setLocalFavs((prev) => {
      const next = prev.filter((i) => `${i.destination}::${i.name}` !== key);
      try {
        window.localStorage.setItem(
          FAVOURITES_KEY,
          JSON.stringify(next.map((i) => `${i.destination}::${i.name}`)),
        );
      } catch {
        // ignore
      }
      return next;
    });
  }

  const combined =
    user && mongoFavs.length > 0
      ? mongoFavs
      : localFavs.map((f) => ({ ...f, category: 'Saved Place', lat: 0, lng: 0, createdAt: '' }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <p className="font-mono text-xs uppercase text-primary">Wishlist</p>
      <h1 className="mt-2 font-display text-4xl">Saved Places</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {user
          ? 'Synced with your MongoDB account.'
          : 'Saved locally in this browser. Sign in to sync favourites across devices.'}
      </p>

      {combined.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <Heart className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No favourite places yet. Click the heart icon on any stop in your itinerary to save it here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {combined.map((fav) => (
            <article
              key={`${fav.destination}::${fav.name}`}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5"
            >
              <div>
                <p className="font-mono text-xs uppercase text-primary">{fav.destination}</p>
                <h2 className="mt-1 font-display text-xl">{fav.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{fav.category}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void navigate({ to: '/', search: { city: fav.destination } as never })}
                  className="gap-1.5"
                >
                  <MapPin className="size-3.5" />
                  Plan {fav.destination}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${fav.name}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (user && mongoFavs.length > 0) void removeMongoFav(fav);
                    else removeLocalFav(fav.destination, fav.name);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
