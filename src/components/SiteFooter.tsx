import { Link } from "@tanstack/react-router";
import { MapPin, CloudRain, IndianRupee, Route as RouteIcon } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const POPULAR_CITIES = ["Dehradun", "Jaipur", "Goa", "Manali", "Udaipur", "Varanasi"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Intelligent day-by-day travel planning for Indian cities. Group nearby attractions, minimize daily transit, and adapt automatically to your budget and live weather.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1">
                <RouteIcon className="size-3 text-primary" /> Smart Routes
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1">
                <IndianRupee className="size-3 text-primary" /> Budget Aware
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1">
                <CloudRain className="size-3 text-primary" /> Weather Adaptive
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Popular Cities
            </h3>
            <ul className="mt-4 space-y-2.5">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link
                    to="/"
                    search={{ city } as never}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <MapPin className="size-3 text-primary" />
                    {city}, India
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  My Saved Trips
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Saved Places
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Traveler Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 TripPilot. Plan smarter, travel better.</p>
          <p className="text-xs text-muted-foreground">
            Itineraries adapt to opening hours, budget, and weather — verify local timings before visiting.
          </p>
        </div>
      </div>
    </footer>
  );
}
