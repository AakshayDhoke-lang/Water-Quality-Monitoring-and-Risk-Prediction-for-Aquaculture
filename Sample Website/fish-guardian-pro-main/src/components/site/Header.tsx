import { Link } from "@tanstack/react-router";
import { Waves } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-sm">
            <Waves className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Aqua<span className="text-gradient">Pulse</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/", label: "Home" },
            { to: "/dashboard", label: "Dashboard" },
            { to: "/species", label: "Species" },
            { to: "/about", label: "About" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg transition-colors hover:text-foreground hover:bg-secondary/50"
              activeProps={{ className: "px-4 py-2 text-sm font-medium rounded-lg text-foreground bg-secondary/60" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/dashboard"
          className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow-sm transition-transform hover:scale-105"
        >
          Launch App
        </Link>
      </div>
    </header>
  );
}
