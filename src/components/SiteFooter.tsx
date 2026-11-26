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
    <footer className="mt-16 w-full border-t border-border bg-white py-14 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Custom day-by-day travel itineraries powered by Gemini AI and verified local routes.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Popular Destinations
            </h3>
            <ul className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link
                    to="/"
                    search={{ city } as never}
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Explore
            </h3>
            <ul className="mt-3.5 space-y-2">
              <li>
                <Link to="/" className="text-xs text-muted-foreground transition-colors hover:text-primary">
                  Build Custom Plans
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-xs text-muted-foreground transition-colors hover:text-primary">
                  Destinations Directory
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-xs text-muted-foreground transition-colors hover:text-primary">
                  Saved Itineraries
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="text-xs text-muted-foreground transition-colors hover:text-primary">
                  Favourites
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-xs text-muted-foreground transition-colors hover:text-primary">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 md:items-end">
            <div className="md:text-right">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Contact
              </h3>
              <p className="mt-2 text-xs font-medium text-primary">hello@trippilot.com</p>
            </div>
            <button
              type="button"
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:-translate-y-0.5"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 TripPilot. All rights reserved.</p>
          <p>Verify seasonal opening hours and local advisories before visiting.</p>
        </div>
      </div>
    </footer>
  );
}
