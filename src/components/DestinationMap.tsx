import { useState, useMemo, useEffect, useCallback } from 'react';
import { LocateFixed, Navigation, MapPin, LoaderCircle, Plus, Minus, Clock3, IndianRupee } from 'lucide-react';
import { haversineKm } from '@/lib/destinations';
import { Button } from '@/components/ui/button';

export type MapPlace = {
  name: string;
  type: string;
  hours: number;
  lat: number;
  lng: number;
  cost?: number;
  startTime?: string;
  travelMinutesToNext?: number;
  note?: string;
};

type Props = {
  city: string;
  center: { lat: number; lng: number };
  places: MapPlace[];
  selectedPlaceName: string | null;
  onSelectPlace: (name: string) => void;
};

const TILE_SIZE = 256;
const MAP_WIDTH = 640;
const MAP_HEIGHT = 380;

function latLngToWorld(lat: number, lng: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const x = ((lng + 180) / 360) * scale;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const clamped = Math.min(0.9999, Math.max(-0.9999, sinLat));
  const y = (0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI)) * scale;
  return { x, y };
}

export function DestinationMap({ city, center, places, selectedPlaceName, onSelectPlace }: Props) {
  const [zoom, setZoom] = useState(12);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const selectedPlace = useMemo(
    () => places.find((p) => p.name === selectedPlaceName) ?? places[0] ?? null,
    [places, selectedPlaceName],
  );

  const mapCenter = useMemo(() => {
    if (selectedPlace) return { lat: selectedPlace.lat, lng: selectedPlace.lng };
    return center;
  }, [selectedPlace, center]);

  const centerWorld = useMemo(
    () => latLngToWorld(mapCenter.lat, mapCenter.lng, zoom),
    [mapCenter.lat, mapCenter.lng, zoom],
  );

  const tiles = useMemo(() => {
    const maxTile = 2 ** zoom;
    const minX = Math.floor((centerWorld.x - MAP_WIDTH / 2) / TILE_SIZE);
    const maxX = Math.floor((centerWorld.x + MAP_WIDTH / 2) / TILE_SIZE);
    const minY = Math.floor((centerWorld.y - MAP_HEIGHT / 2) / TILE_SIZE);
    const maxY = Math.floor((centerWorld.y + MAP_HEIGHT / 2) / TILE_SIZE);
    const list: Array<{ x: number; y: number; left: number; top: number; url: string }> = [];

    for (let ty = minY; ty <= maxY; ty++) {
      if (ty < 0 || ty >= maxTile) continue;
      for (let tx = minX; tx <= maxX; tx++) {
        const wrappedX = ((tx % maxTile) + maxTile) % maxTile;
        list.push({
          x: tx,
          y: ty,
          left: tx * TILE_SIZE - (centerWorld.x - MAP_WIDTH / 2),
          top: ty * TILE_SIZE - (centerWorld.y - MAP_HEIGHT / 2),
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${ty}.png`,
        });
      }
    }
    return list;
  }, [centerWorld, zoom]);

  function projectToView(lat: number, lng: number) {
    const world = latLngToWorld(lat, lng, zoom);
    return {
      left: world.x - (centerWorld.x - MAP_WIDTH / 2),
      top: world.y - (centerWorld.y - MAP_HEIGHT / 2),
    };
  }

  const polylinePoints = useMemo(() => {
    return places
      .map((p) => {
        const pt = projectToView(p.lat, p.lng);
        return `${(pt.left / MAP_WIDTH) * 100},${(pt.top / MAP_HEIGHT) * 100}`;
      })
      .join(' ');
  }, [places, centerWorld, zoom]);

  const requestUserLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Allow location access in your browser to see distances.'
            : 'Unable to determine your current location.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  const selectedDistanceKm =
    userLocation && selectedPlace
      ? haversineKm(userLocation.lat, userLocation.lng, selectedPlace.lat, selectedPlace.lng)
      : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          <h3 className="font-display text-xl">{city} Route Map</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={requestUserLocation}
          disabled={locating}
          className="gap-1.5"
        >
          {locating ? <LoaderCircle className="size-3.5 animate-spin" /> : <LocateFixed className="size-3.5 text-primary" />}
          {userLocation ? 'Update location' : 'My location & distance'}
        </Button>
      </div>

      {locationError && (
        <p role="alert" className="text-xs text-destructive">
          {locationError}
        </p>
      )}

      <div className="relative h-80 w-full overflow-hidden rounded-lg border border-border bg-muted select-none">
        {tiles.map((tile) => (
          <img
            key={`${zoom}-${tile.x}-${tile.y}`}
            src={tile.url}
            alt=""
            draggable={false}
            className="pointer-events-none absolute max-w-none"
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: `${(tile.left / MAP_WIDTH) * 100}%`,
              top: `${(tile.top / MAP_HEIGHT) * 100}%`,
            }}
          />
        ))}

        {places.length > 1 && (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="0.7"
              strokeDasharray="1.5 1"
              className="text-primary"
              points={polylinePoints}
            />
          </svg>
        )}

        {places.map((place, index) => {
          const pos = projectToView(place.lat, place.lng);
          const isSelected = selectedPlace?.name === place.name;
          const leftPct = (pos.left / MAP_WIDTH) * 100;
          const topPct = (pos.top / MAP_HEIGHT) * 100;
          if (leftPct < -5 || leftPct > 105 || topPct < -5 || topPct > 105) return null;

          return (
            <button
              key={`${place.name}-${index}`}
              type="button"
              onClick={() => onSelectPlace(place.name)}
              title={`${index + 1}. ${place.name}`}
              aria-label={`Select stop ${index + 1}: ${place.name}`}
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              className={`absolute -translate-x-1/2 -translate-y-full transition-transform ${
                isSelected ? 'z-20 scale-115' : 'z-10 hover:scale-110'
              }`}
            >
              <span
                className={`flex h-7 min-w-7 items-center justify-center rounded-full border-2 px-1.5 font-mono text-xs font-medium shadow-md ${
                  isSelected
                    ? 'border-background bg-accent text-accent-foreground'
                    : 'border-background bg-primary text-primary-foreground'
                }`}
              >
                {index + 1}
              </span>
            </button>
          );
        })}

        {userLocation && (() => {
          const pos = projectToView(userLocation.lat, userLocation.lng);
          const leftPct = (pos.left / MAP_WIDTH) * 100;
          const topPct = (pos.top / MAP_HEIGHT) * 100;
          if (leftPct < 0 || leftPct > 100 || topPct < 0 || topPct > 100) return null;
          return (
            <div
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              title="Your location"
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="block size-4 rounded-full border-2 border-white bg-blue-600 shadow" />
            </div>
          );
        })()}

        <div className="absolute right-2 top-2 z-30 flex flex-col gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-7 shadow"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(16, z + 1))}
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-7 shadow"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(9, z - 1))}
          >
            <Minus className="size-3.5" />
          </Button>
        </div>

        <div className="absolute bottom-1 right-2 z-20 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          © OpenStreetMap
        </div>
      </div>

      {selectedPlace && (
        <div className="rounded-lg border border-border bg-card p-3.5 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-card-foreground">{selectedPlace.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{selectedPlace.type}</span>
                <span className="flex items-center gap-1">
                  <Clock3 className="size-3" />~{selectedPlace.hours}h
                </span>
                {selectedPlace.cost !== undefined && (
                  <span className="flex items-center gap-0.5">
                    <IndianRupee className="size-3" />
                    {selectedPlace.cost}
                  </span>
                )}
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="size-3" />
                Directions
              </a>
            </Button>
          </div>
          <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
            {selectedDistanceKm !== null ? (
              <span className="font-medium text-primary">
                {selectedDistanceKm < 1
                  ? `${Math.round(selectedDistanceKm * 1000)} m`
                  : `${selectedDistanceKm.toFixed(1)} km`}{' '}
                from your current location
              </span>
            ) : (
              <span>Click “My location &amp; distance” to see how far this stop is from you.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
