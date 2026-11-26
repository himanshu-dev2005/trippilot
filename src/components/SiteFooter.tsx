import { Link } from "@tanstack/react-router";
import { ArrowUp } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const POPULAR_CITIES = [
  "New Delhi",
  "Jaipur",
  "Varanasi",
  "Alleppey",
  "Dehradun",
  "Udaipur",
  "Manali",
  "Goa",
];

export function SiteFooter() {
  return (
    <footer className="mt-20 w-full border-t border-border bg-surface-lowest py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Route-ordered day-by-day travel planning with live weather and realistic budgets.
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">
              Destinations
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link
                    to="/"
                    search={{ city } as never}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Explore Routes
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Saved Itineraries
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Favourites
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 md:items-end">
            <div className="md:text-right">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                Contact
              </h3>
              <p className="mt-2 text-xs font-medium text-foreground">hello@trippilot.com</p>
            </div>
            <button
              type="button"
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 TripPilot. All rights reserved.</p>
          <p>Verify seasonal opening hours and local advisories before visiting.</p>
        </div>
      </div>
    </footer>
  );
}
