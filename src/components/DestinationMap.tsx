import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { LocateFixed, Navigation, MapPin, LoaderCircle, Plus, Minus, Clock3, IndianRupee, RotateCcw } from 'lucide-react';
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

function worldToLatLng(x: number, y: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
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

  const [viewCenter, setViewCenter] = useState<{ lat: number; lng: number }>(() =>
    selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : center,
  );
  const mapBoxRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startWorldX: number;
    startWorldY: number;
    moved: boolean;
  } | null>(null);
  const pinchDistRef = useRef<number | null>(null);
  const lastWheelAtRef = useRef<number>(0);

  useEffect(() => {
    if (selectedPlace) {
      setViewCenter({ lat: selectedPlace.lat, lng: selectedPlace.lng });
    } else {
      setViewCenter(center);
    }
  }, [selectedPlace?.lat, selectedPlace?.lng, center.lat, center.lng]);

  const mapCenter = viewCenter;

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
    <div className="neu-raised space-y-4 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-outline">
            Route Overview
          </span>
          <h3 className="mt-0.5 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <MapPin className="size-4 text-primary" />
            {city} Route Map
          </h3>
        </div>
        <button
          type="button"
          onClick={requestUserLocation}
          disabled={locating}
          className="neu-raised-sm inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-primary transition-all active:shadow-inner disabled:opacity-50"
        >
          {locating ? <LoaderCircle className="size-3.5 animate-spin" /> : <LocateFixed className="size-3.5 text-primary" />}
          {userLocation ? 'Update location' : 'My distance'}
        </button>
      </div>

      {locationError && (
        <p role="alert" className="text-xs text-destructive">
          {locationError}
        </p>
      )}

      <div
        ref={mapBoxRef}
        onWheel={(e) => {
          e.preventDefault();
          const now = Date.now();
          if (now - lastWheelAtRef.current < 120) return;
          if (Math.abs(e.deltaY) < 4) return;
          lastWheelAtRef.current = now;
          setZoom((z) => (e.deltaY < 0 ? Math.min(17, z + 1) : Math.max(9, z - 1)));
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          const world = latLngToWorld(viewCenter.lat, viewCenter.lng, zoom);
          dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWorldX: world.x,
            startWorldY: world.y,
            moved: false,
          };
        }}
        onMouseMove={(e) => {
          if (!dragRef.current) return;
          const dx = e.clientX - dragRef.current.startX;
          const dy = e.clientY - dragRef.current.startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
          const box = mapBoxRef.current;
          const scaleX = box ? MAP_WIDTH / box.clientWidth : 1;
          const scaleY = box ? MAP_HEIGHT / box.clientHeight : 1;
          setViewCenter(
            worldToLatLng(
              dragRef.current.startWorldX - dx * scaleX,
              dragRef.current.startWorldY - dy * scaleY,
              zoom,
            ),
          );
        }}
        onMouseUp={() => {
          dragRef.current = null;
        }}
        onMouseLeave={() => {
          dragRef.current = null;
        }}
        onDoubleClick={() => setZoom((z) => Math.min(17, z + 1))}
        onTouchStart={(e) => {
          if (e.touches.length === 2) {
            const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
            const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
            pinchDistRef.current = Math.hypot(dx, dy);
            dragRef.current = null;
          } else if (e.touches.length === 1) {
            const world = latLngToWorld(viewCenter.lat, viewCenter.lng, zoom);
            dragRef.current = {
              startX: e.touches[0]!.clientX,
              startY: e.touches[0]!.clientY,
              startWorldX: world.x,
              startWorldY: world.y,
              moved: false,
            };
          }
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 2 && pinchDistRef.current) {
            const dx = e.touches[0]!.clientX - e.touches[1]!.clientX;
            const dy = e.touches[0]!.clientY - e.touches[1]!.clientY;
            const dist = Math.hypot(dx, dy);
            const ratio = dist / pinchDistRef.current;
            if (ratio > 1.22) {
              setZoom((z) => Math.min(17, z + 1));
              pinchDistRef.current = dist;
            } else if (ratio < 0.82) {
              setZoom((z) => Math.max(9, z - 1));
              pinchDistRef.current = dist;
            }
          } else if (e.touches.length === 1 && dragRef.current) {
            const dx = e.touches[0]!.clientX - dragRef.current.startX;
            const dy = e.touches[0]!.clientY - dragRef.current.startY;
            const box = mapBoxRef.current;
            const scaleX = box ? MAP_WIDTH / box.clientWidth : 1;
            const scaleY = box ? MAP_HEIGHT / box.clientHeight : 1;
            setViewCenter(
              worldToLatLng(
                dragRef.current.startWorldX - dx * scaleX,
                dragRef.current.startWorldY - dy * scaleY,
                zoom,
              ),
            );
          }
        }}
        onTouchEnd={() => {
          dragRef.current = null;
          pinchDistRef.current = null;
        }}
        className="neu-inset relative h-64 w-full cursor-grab overflow-hidden rounded-xl select-none touch-none active:cursor-grabbing"
      >
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
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlace(place.name);
              }}
              aria-label={`Select stop ${index + 1}: ${place.name}`}
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              className={`group absolute -translate-x-1/2 -translate-y-full transition-all duration-150 ${
                isSelected ? 'z-30' : 'z-10 hover:z-30'
              }`}
            >
              {/* Dot pin — always visible, compact */}
              <span
                className={`flex size-6 items-center justify-center rounded-full border-2 border-white font-mono text-[10px] font-bold shadow-lg transition-all ${
                  isSelected
                    ? 'bg-accent text-accent-foreground scale-125'
                    : 'bg-primary text-primary-foreground hover:scale-110'
                }`}
              >
                {index + 1}
              </span>
              {/* Tooltip label — only visible on hover or when selected */}
              <span
                className={`pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-background/20 bg-background/95 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-lg backdrop-blur-sm transition-all ${
                  isSelected
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
                }`}
              >
                {place.name}
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
            onClick={() => setZoom((z) => Math.min(17, z + 1))}
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
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-7 shadow"
            aria-label="Re-center map"
            title="Re-center map"
            onClick={() => {
              setZoom(12);
              setViewCenter(selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : center);
            }}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>

        <div className="pointer-events-none absolute bottom-1 left-2 z-20 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          Drag to pan · Scroll or pinch to zoom
        </div>
        <div className="absolute bottom-1 right-2 z-20 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          © OpenStreetMap
        </div>
      </div>

      {selectedPlace && (
        <div className="neu-inset-sm rounded-xl p-4 text-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-card-foreground">{selectedPlace.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{selectedPlace.type}</span>
                <span className="flex items-center gap-1">
                  <Clock3 className="size-3 text-primary" />~{selectedPlace.hours}h
                </span>
                {selectedPlace.cost !== undefined && (
                  <span className="flex items-center gap-0.5">
                    <IndianRupee className="size-3 text-primary" />
                    {selectedPlace.cost}
                  </span>
                )}
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="neu-raised-sm inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-primary transition-all"
            >
              <Navigation className="size-3" />
              Directions
            </a>
          </div>
          <div className="mt-2.5 pt-2 text-xs text-muted-foreground">
            {selectedDistanceKm !== null ? (
              <span className="font-semibold text-primary">
                {selectedDistanceKm < 1
                  ? `${Math.round(selectedDistanceKm * 1000)} m`
                  : `${selectedDistanceKm.toFixed(1)} km`}{' '}
                from your current location
              </span>
            ) : (
              <span>Click “My distance” to see how far this stop is from you.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
