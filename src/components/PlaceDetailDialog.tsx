import { useEffect, useState } from 'react';
import {
  Clock,
  ExternalLink,
  Globe,
  LoaderCircle,
  MapPin,
  Star,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StopPhoto } from '@/components/StopPhoto';
import { fetchPlaceDetails, type PlaceDetailsPayload } from '@/lib/trips';
import {
  getIndiaPracticalAlerts,
  getStopTimingInsight,
  type Stop,
} from '@/lib/optimizer';

export function PlaceDetailDialog({
  stop,
  destination,
  open,
  onOpenChange,
  isFavourite,
  onToggleFavourite,
}: {
  stop: Stop | null;
  destination: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
}) {
  const [details, setDetails] = useState<PlaceDetailsPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !stop) {
      setDetails(null);
      return;
    }
    let active = true;
    setLoading(true);
    setDetails(null);
    void fetchPlaceDetails({
      data: {
        placeName: stop.name,
        destination,
      },
    })
      .then((res) => {
        if (active) setDetails(res);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, stop, destination]);

  if (!stop) return null;

  const timingInsight = getStopTimingInsight(stop);
  const practicalAlerts = getIndiaPracticalAlerts(stop);
  const mapsFallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${stop.name}, ${destination}`,
  )}`;
  const effectiveRating = details?.rating ?? stop.rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-6">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-primary">
              {stop.startTime}
            </span>
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {stop.category}
            </span>
            <span className="text-xs text-muted-foreground">
              {stop.isOutdoor ? 'Outdoor' : 'Indoor'}
            </span>
            {timingInsight && (
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  timingInsight === 'Golden Hour'
                    ? 'bg-amber-500/15 text-amber-600'
                    : 'bg-orange-500/15 text-orange-600'
                }`}
              >
                {timingInsight}
              </span>
            )}
          </div>
          <DialogTitle className="mt-1 font-display text-2xl">{stop.name}</DialogTitle>
          <DialogDescription>
            {destination} · {stop.duration}h recommended visit ·{' '}
            {stop.cost === 0 ? 'Free entry' : `Est. ₹${stop.cost}`}
          </DialogDescription>
        </DialogHeader>

        <StopPhoto
          name={stop.name}
          category={stop.category}
          destination={destination}
          {...(stop.photoReference ? { photoReference: stop.photoReference } : {})}
          className="h-52 w-full rounded-lg"
        />

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {effectiveRating.toFixed(1)}
            {details?.userRatingCount ? (
              <span className="text-xs font-normal text-muted-foreground">
                ({details.userRatingCount.toLocaleString()} reviews)
              </span>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4 text-primary" />
            Open {String(stop.openingHours.open).padStart(2, '0')}:00 –{' '}
            {String(stop.openingHours.close).padStart(2, '0')}:00
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin text-primary" />
            Loading place details…
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {(details?.summary || stop.note) && (
              <p className="leading-relaxed text-foreground">
                {details?.summary || stop.note}
              </p>
            )}

            {details?.address && (
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>{details.address}</span>
              </p>
            )}

            {details?.openingHoursText && details.openingHoursText.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-medium text-foreground">Opening Hours</p>
                <ul className="mt-1.5 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                  {details.openingHoursText.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {practicalAlerts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {practicalAlerts.map((alertText) => (
              <span
                key={alertText}
                className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-400"
              >
                <AlertTriangle className="size-3.5 shrink-0" />
                {alertText}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <a
                href={details?.googleMapsUri || mapsFallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 size-3.5" />
                Google Maps
              </a>
            </Button>
            {details?.wikipediaUrl && (
              <Button asChild size="sm" variant="outline">
                <a href={details.wikipediaUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-1.5 size-3.5" />
                  Wikipedia
                </a>
              </Button>
            )}
            {details?.websiteUri && (
              <Button asChild size="sm" variant="outline">
                <a href={details.websiteUri} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-1.5 size-3.5" />
                  Website
                </a>
              </Button>
            )}
          </div>

          {onToggleFavourite && (
            <Button size="sm" variant="secondary" onClick={onToggleFavourite}>
              <Heart
                className={`mr-1.5 size-3.5 ${
                  isFavourite ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              {isFavourite ? 'Saved' : 'Save place'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
