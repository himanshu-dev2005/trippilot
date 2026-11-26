import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, LogOut, UserRound, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { useAccount } from "@/components/AuthProvider";
import { signOutMongo } from "@/lib/auth";

const THEME_STORAGE_KEY = "trippilot:theme";

const navLinks = [
  { label: "Plan", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "Saved Trips", to: "/trips" },
  { label: "Favourites", to: "/favourites" },
  { label: "How It Works", to: "/how-it-works" },
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
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
        return;
      }
      if (saved === "light") {
        document.documentElement.classList.remove("dark");
        setDarkMode(false);
        return;
      }
    } catch {
      // ignore storage errors
    }
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // ignore
    }
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

  const accountAction = loading ? (
    <span className="h-9 w-20 shrink-0" />
  ) : user ? (
    <div className="flex shrink-0 items-center gap-1.5">
      <Link
        to="/profile"
        onClick={() => setOpen(false)}
        className="inline-flex h-9 max-w-[160px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
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
        className="size-9 shrink-0"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  ) : (
    <Button
      asChild
      size="sm"
      className="h-9 shrink-0 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
    >
      <Link to="/auth" onClick={() => setOpen(false)}>
        Sign in
      </Link>
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <Link to="/" className="shrink-0 whitespace-nowrap transition-opacity hover:opacity-90" onClick={() => setOpen(false)}>
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{
                className: "border-b-2 border-primary text-foreground pb-1 font-medium",
              }}
              inactiveProps={{
                className: "border-b-2 border-transparent text-muted-foreground hover:text-foreground pb-1",
              }}
              className="shrink-0 whitespace-nowrap text-sm transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2.5 md:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
            className="size-9 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
          </Button>
          {accountAction}
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
                className="py-1 text-sm"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-3">
              {accountAction}
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="size-9"
              >
                {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
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
