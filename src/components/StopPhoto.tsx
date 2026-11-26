import { useEffect, useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { fetchPlacePhotoDataUrl } from '@/lib/trips';

const CLIENT_PHOTO_CACHE = new Map<string, string | null>();

export function StopPhoto({
  name,
  category: _category,
  destination,
  photoReference,
  coordinates,
  className,
}: {
  name: string;
  category: string;
  destination?: string;
  photoReference?: string;
  coordinates?: { lat: number; lng: number };
  className?: string;
}) {
  const cacheKey = `${photoReference ?? ''}::${name.trim().toLowerCase()}::${(destination ?? '').trim().toLowerCase()}`;
  const cachedInitial = CLIENT_PHOTO_CACHE.has(cacheKey) ? CLIENT_PHOTO_CACHE.get(cacheKey)! : undefined;

  const [dataUrl, setDataUrl] = useState<string | null>(cachedInitial ?? null);
  const [loading, setLoading] = useState<boolean>(cachedInitial === undefined);
  const [imgError, setImgError] = useState(false);
  const [showMap, setShowMap] = useState(false);

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
  const mapQuery = encodeURIComponent([name, destination].filter(Boolean).join(', '));
  const googleMapsEmbedUrl = coordinates
    ? `https://maps.google.com/maps?q=${mapQuery}&ll=${coordinates.lat},${coordinates.lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`;
  const googleMapsDirectUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  if (loading) {
    return (
      <div
        aria-label={`Loading ${name}`}
        className={`${sizeClass} relative overflow-hidden bg-muted`}
      >
        <div className="h-full w-full animate-pulse bg-muted-foreground/10" />
      </div>
    );
  }

  const hasPhoto = Boolean(!imgError && dataUrl);
  const renderMap = !hasPhoto || showMap;

  if (renderMap) {
    return (
      <div className={`${sizeClass} relative overflow-hidden bg-muted`}>
        <iframe
          title={`Google Maps location for ${name}`}
          src={googleMapsEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
        <a
          href={googleMapsDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Open in Google Maps"
          className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-zinc-900 shadow-sm hover:bg-white"
        >
          <MapPin className="size-2.5 text-[#6C3FE4]" />
          <span>Maps</span>
          <ExternalLink className="size-2.5 opacity-70" />
        </a>
        {hasPhoto && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMap(false);
            }}
            className="absolute bottom-1.5 left-1.5 rounded-md bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-zinc-900"
          >
            Photo
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} relative overflow-hidden bg-muted`}>
      <img
        src={dataUrl!}
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
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowMap(true);
        }}
        title="View on Google Maps"
        className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-zinc-900 shadow-sm hover:bg-white"
      >
        <MapPin className="size-2.5 text-[#6C3FE4]" />
        <span>Map</span>
      </button>
    </div>
  );
}
