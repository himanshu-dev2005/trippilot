import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { destinations } from "@/lib/destinations";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Compass className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl tracking-tight text-foreground">TripPilot</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Pick a place, tell us how many days you have, and get a day-by-day plan of
              the best things to see and do — no spreadsheets required.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Destinations</h3>
            <ul className="mt-4 space-y-2.5">
              {destinations.map((d) => (
                <li key={d.id}>
                  <a href="/#destinations" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {d.name}, {d.country}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Product</h3>
            <ul className="mt-4 space-y-2.5">
              <li><a href="/#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a></li>
              <li><a href="/#destinations" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Plan a trip</a></li>
              <li><a href="/#plan" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Your itinerary</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2026 TripPilot. Travel well, plan less.</p>
          <p className="text-xs text-muted-foreground">Itineraries are suggestions — check local opening times before you go.</p>
        </div>
      </div>
    </footer>
  );
}
