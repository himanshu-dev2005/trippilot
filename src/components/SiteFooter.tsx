import { Link } from "@tanstack/react-router";
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
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Day-by-day Indian itineraries built around real neighborhood clustering, opening hours, transparent budgets, and live weather forecasts.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium text-foreground">
              Popular destinations
            </h3>
            <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link
                    to="/"
                    search={{ city } as never}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium text-foreground">
              Navigation
            </h3>
            <ul className="mt-3.5 space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Explore India
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Saved Trips
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Favourites
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 TripPilot · India Travel Planner</p>
          <p>Always verify seasonal opening hours and monument holidays before visiting.</p>
        </div>
      </div>
    </footer>
  );
}
