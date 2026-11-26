import { Link } from "@tanstack/react-router";
import { ArrowUp, Compass, Mail, MapPin } from "lucide-react";
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
    <footer className="mt-20 w-full border-t border-border bg-[#F8F7FF] pt-14 pb-10 dark:bg-[#0e0b1a]">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <Link to="/" className="inline-block">
              <BrandLogo />
            </Link>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Custom day-by-day itineraries sequenced by geography, powered by Gemini AI, live local weather, and realistic INR budgets.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                to="/"
                className="neu-btn-primary inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm"
              >
                <Compass className="size-3.5" />
                Plan a Trip
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-[#6C3FE4]"
              >
                Explore Routes
              </Link>
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="md:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6C3FE4]">
              Popular Destinations
            </h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {POPULAR_CITIES.map((city) => (
                <li key={city}>
                  <Link
                    to="/"
                    search={{ city } as never}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-[#6C3FE4]"
                  >
                    <MapPin className="size-3 opacity-60" />
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6C3FE4]">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/" className="text-xs font-medium text-muted-foreground transition-colors hover:text-[#6C3FE4]">
                  Custom Itinerary Planner
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-xs font-medium text-muted-foreground transition-colors hover:text-[#6C3FE4]">
                  Destinations Directory
                </Link>
              </li>
              <li>
                <Link to="/trips" className="text-xs font-medium text-muted-foreground transition-colors hover:text-[#6C3FE4]">
                  Saved Itineraries
                </Link>
              </li>
              <li>
                <Link to="/favourites" className="text-xs font-medium text-muted-foreground transition-colors hover:text-[#6C3FE4]">
                  Saved Favourites
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-xs font-medium text-muted-foreground transition-colors hover:text-[#6C3FE4]">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Scroll to Top */}
          <div className="flex flex-col items-start justify-between gap-4 md:col-span-2 md:items-end">
            <div className="md:text-right">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#6C3FE4]">
                Support
              </h3>
              <a
                href="mailto:hello@trippilot.com"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-[#6C3FE4]"
              >
                <Mail className="size-3.5 text-[#6C3FE4]" />
                hello@trippilot.com
              </a>
            </div>
            <button
              type="button"
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex size-10 items-center justify-center rounded-full bg-[#6C3FE4] text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[#5B2FD4]"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 TripPilot Itinerary Planner. All rights reserved.</p>
          <p>Verify seasonal opening hours and local advisories before visiting.</p>
        </div>
      </div>
    </footer>
  );
}
