import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Compass, Menu, X, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/AuthProvider";
import { signOutMongo } from "@/lib/auth";

const navLinks = [
  { label: "Planner", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "My Trips", to: "/trips" },
  { label: "Favourites", to: "/favourites" },
  { label: "How it works", to: "/how-it-works" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const { user, loading, setUser } = useAccount();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    setSigningOut(true); setError('');
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOutMongo();
      setUser(null);
      setOpen(false);
      await navigate({ to: '/auth', replace: true });
    } catch { setError('Could not sign out. Please try again.'); }
    finally { setSigningOut(false); }
  }

  const accountControls = loading ? <span className="h-9 w-20" /> : user ? <div className="flex items-center gap-2">
    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-1.5 text-sm text-primary hover:underline" title={user.email}><UserRound className="size-4" />Profile</Link>
    <Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" disabled={signingOut} onClick={() => void signOut()}><LogOut /></Button>
  </div> : <Button asChild variant="ghost"><Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link></Button>;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </span>
          <span className="font-display text-2xl tracking-tight text-foreground">TripPilot</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {accountControls}
        </nav>

        <Button variant="ghost" size="icon"
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            {accountControls}
          </div>
        </nav>
      )}
      {error && <p role="alert" className="px-6 pb-2 text-sm text-destructive">{error}</p>}
    </header>
  );
}
