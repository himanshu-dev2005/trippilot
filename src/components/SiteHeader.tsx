import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, LogOut, UserRound, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
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
  const [error, setError] = useState("");
  const { user, loading, setUser } = useAccount();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOutMongo();
      setUser(null);
      setOpen(false);
      await navigate({ to: "/auth", replace: true });
    } catch {
      setError("Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  const accountControls = loading ? (
    <span className="h-9 w-24" />
  ) : user ? (
    <div className="flex items-center gap-2">
      <Link
        to="/profile"
        onClick={() => setOpen(false)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        title={user.email}
      >
        <UserRound className="size-3.5 text-primary" />
        Profile
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Sign out"
        title="Sign out"
        disabled={signingOut}
        onClick={() => void signOut()}
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link to="/auth" onClick={() => setOpen(false)}>
          Sign in
        </Link>
      </Button>
      <Button asChild size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
        <Link to="/signup" onClick={() => setOpen(false)}>
          <Sparkles className="size-3.5" />
          Get started
        </Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="transition-opacity hover:opacity-90" onClick={() => setOpen(false)}>
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-secondary/50" }}
              className="rounded-full px-3.5 py-1.5 text-sm transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">{accountControls}</div>

        <Button
          variant="ghost"
          size="icon"
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
          <div className="flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-primary font-medium" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="py-1 text-sm"
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border pt-3">{accountControls}</div>
          </div>
        </nav>
      )}
      {error && (
        <p role="alert" className="px-6 pb-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </header>
  );
}
