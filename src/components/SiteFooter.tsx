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
    <footer className="mt-16 w-full bg-surface-low py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              AI-powered journey architect crafting personalized day-by-day itineraries tailored to your exact destination, budget, and pace.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h3>
            <ul className="mt-3.5 space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Discover &amp; AI Planner
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  Itineraries
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 TripPilot. All rights reserved.</p>
          <p>Verify seasonal opening hours and local advisories before visiting.</p>
        </div>
      </div>
    </footer>
  );
}
