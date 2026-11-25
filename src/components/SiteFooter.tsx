import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const POPULAR_CITIES = ["Jaipur", "Varanasi", "Alleppey & Munnar", "Dehradun", "Manali", "Goa"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Curated day-by-day Indian itineraries sequenced with verified coordinates, budget awareness, and live weather adaptation.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Popular Circuits
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
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Explore India
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  My Saved Trips
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Favourites
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">© 2026 TRIPPILOT · INDIA</p>
          <p className="text-xs text-muted-foreground">
            Verify local opening hours before visiting.
          </p>
        </div>
      </div>
    </footer>
  );
}
