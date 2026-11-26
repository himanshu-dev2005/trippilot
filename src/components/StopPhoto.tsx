import { useEffect, useState } from 'react';
import { fetchPlacePhotoDataUrl } from '@/lib/trips';
import { getFallbackStopImage } from '@/lib/circuit-media';

const CLIENT_PHOTO_CACHE = new Map<string, string | null>();

export function StopPhoto({
  name,
  category,
  destination,
  photoReference,
  className,
}: {
  name: string;
  category: string;
  destination?: string;
  photoReference?: string;
  className?: string;
}) {
  const cacheKey = `${photoReference ?? ''}::${name.trim().toLowerCase()}::${(destination ?? '').trim().toLowerCase()}`;
  const cachedInitial = CLIENT_PHOTO_CACHE.has(cacheKey) ? CLIENT_PHOTO_CACHE.get(cacheKey)! : undefined;

  const [dataUrl, setDataUrl] = useState<string | null>(cachedInitial ?? null);
  const [loading, setLoading] = useState<boolean>(cachedInitial === undefined);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (CLIENT_PHOTO_CACHE.has(cacheKey)) {
      setDataUrl(CLIENT_PHOTO_CACHE.get(cacheKey) ?? null);
      setLoading(false);
      setImgError(false);
      return;
    }

    let active = true;
    setLoading(true);
    setImgError(false);
    setDataUrl(null);

    void fetchPlacePhotoDataUrl({
      data: {
        ...(photoReference ? { photoReference } : {}),
        ...(destination ? { destination } : {}),
        placeName: name,
      },
    })
      .then((res) => {
        if (!active) return;
        const resolved = res.dataUrl ?? null;
        CLIENT_PHOTO_CACHE.set(cacheKey, resolved);
        setDataUrl(resolved);
      })
      .catch(() => {
        if (!active) return;
        CLIENT_PHOTO_CACHE.set(cacheKey, null);
        setDataUrl(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cacheKey, photoReference, name, destination]);

  const sizeClass = className ?? 'h-24 w-24 shrink-0 rounded-lg sm:h-28 sm:w-28';
  const fallbackSrc = getFallbackStopImage(destination, category);

  if (loading) {
    return (
      <div
        aria-label={`Loading photo of ${name}`}
        className={`${sizeClass} relative overflow-hidden bg-muted`}
      >
        <div className="h-full w-full animate-pulse bg-muted-foreground/10" />
      </div>
    );
  }

  const effectiveSrc = !imgError && dataUrl ? dataUrl : fallbackSrc;
  const isFallback = !dataUrl || imgError;

  return (
    <div className={`${sizeClass} relative overflow-hidden bg-muted`}>
      <img
        src={effectiveSrc}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => {
          if (!imgError) {
            setImgError(true);
          }
        }}
        className="h-full w-full object-cover transition-opacity duration-200"
      />
      {isFallback && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      )}
    </div>
  );
}
