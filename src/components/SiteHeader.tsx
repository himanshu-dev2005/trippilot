import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, LogOut, LogIn, UserRound, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { useAccount } from "@/components/AuthProvider";
import { signOutMongo } from "@/lib/auth";

const THEME_STORAGE_KEY = "trippilot:theme";

const navLinks = [
  { label: "Discover", to: "/" },
  { label: "Explore", to: "/explore" },
  { label: "Itineraries", to: "/trips" },
  { label: "Favourites", to: "/favourites" },
  { label: "How It Works", to: "/how-it-works" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const { user, setUser } = useAccount();
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

  const accountAction = user ? (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        to="/profile"
        onClick={() => setOpen(false)}
        className="neu-raised-sm inline-flex h-10 max-w-[160px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold text-foreground transition-all hover:text-primary"
        title={user.email}
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <UserRound className="size-3.5" />
        </span>
        <span className="truncate">{user.name?.trim() || user.email.split("@")[0] || "Profile"}</span>
      </Link>
      <button
        type="button"
        aria-label="Sign out"
        title="Sign out"
        disabled={signingOut}
        onClick={() => void signOut()}
        className="neu-raised-sm inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all hover:text-destructive active:shadow-inner disabled:opacity-50"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  ) : (
    <Link
      to="/auth"
      onClick={() => setOpen(false)}
      className="neu-btn-primary inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-all"
    >
      <LogIn className="size-4" />
      <span>Sign in</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-xl shadow-[0_1px_10px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 lg:px-12">
        <Link
          to="/"
          className="shrink-0 whitespace-nowrap transition-opacity hover:opacity-90"
          onClick={() => setOpen(false)}
        >
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{
                className:
                  "bg-primary-container text-white font-semibold rounded-xl px-4 py-2 text-sm shadow-[4px_4px_10px_rgba(99,102,241,0.22),-4px_-4px_10px_var(--neu-shadow-light)]",
              }}
              inactiveProps={{
                className:
                  "text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 px-3.5 py-2 rounded-xl",
              }}
              className="shrink-0 whitespace-nowrap transition-all"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
            className="neu-raised-sm inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all hover:text-foreground"
          >
            {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4" />}
          </button>

          {accountAction}

          <button
            type="button"
            className="neu-raised-sm inline-flex size-10 items-center justify-center rounded-xl text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="bg-surface-low px-6 py-4 shadow-inner md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-primary-container text-white font-semibold rounded-xl px-3.5 py-2.5" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground rounded-xl px-3.5 py-2.5" }}
                className="text-sm transition-all"
              >
                {l.label}
              </Link>
            ))}
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
