import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, LogOut, UserRound, Sun, Moon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { useAccount } from "@/components/AuthProvider";
import { signOutMongo } from "@/lib/auth";

const navLinks = [
  { label: "HOME", to: "/" },
  { label: "EXPLORE INDIA", to: "/explore" },
  { label: "MY SAVED TRIPS", to: "/trips" },
  { label: "FAVOURITES", to: "/favourites" },
  { label: "HOW IT WORKS", to: "/how-it-works" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const { user, loading, setUser } = useAccount();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  }

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
        className="inline-flex max-w-[160px] items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        title={user.email}
      >
        <UserRound className="size-3.5 shrink-0 text-primary" />
        <span className="truncate">{user.name?.trim() || user.email.split("@")[0] || "Profile"}</span>
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
      <Button asChild variant="ghost" size="sm" className="font-mono text-[11px] uppercase tracking-wider">
        <Link to="/auth" onClick={() => setOpen(false)}>
          SIGN IN
        </Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="rounded-md bg-primary px-3.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
      >
        <a href="/#destinations" onClick={() => setOpen(false)}>
          <Plus className="size-3.5" />
          PLAN A TRIP
        </a>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="transition-opacity hover:opacity-90" onClick={() => setOpen(false)}>
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{
                className: "border-b-2 border-primary text-foreground pb-1",
              }}
              inactiveProps={{
                className: "border-b-2 border-transparent text-muted-foreground hover:text-foreground pb-1",
              }}
              className="font-mono text-[11px] tracking-[0.14em] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="size-8 rounded-md border-border bg-card"
          >
            {darkMode ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5 text-foreground" />}
          </Button>
          {accountControls}
        </div>

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
                className="py-1 font-mono text-xs tracking-wider"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3">
              {accountControls}
              <Button type="button" variant="outline" size="icon" onClick={toggleTheme} className="size-8">
                {darkMode ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5" />}
              </Button>
            </div>
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
