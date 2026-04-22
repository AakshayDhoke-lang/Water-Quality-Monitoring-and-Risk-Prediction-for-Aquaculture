import { Waves } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 mt-20">
      <svg
        className="absolute -top-px left-0 right-0 w-full text-background"
        viewBox="0 0 1440 60"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,0 L0,0 Z"
          fill="currentColor"
        />
      </svg>
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-sm">
              <Waves className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              Aqua<span className="text-gradient">Pulse</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Real-time water intelligence for the future of aquaculture.
          </p>
        </div>
        {[
          { title: "Product", items: ["Dashboard", "Species", "Sensors", "Pricing"] },
          { title: "Company", items: ["About", "Research", "Careers", "Press"] },
          { title: "Resources", items: ["Docs", "API", "Community", "Support"] },
        ].map((c) => (
          <div key={c.title}>
            <h4 className="font-display font-semibold text-foreground mb-3">{c.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.items.map((i) => (
                <li key={i} className="hover:text-primary transition-colors cursor-pointer">{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AquaPulse · Predict. Protect. Prosper.
      </div>
    </footer>
  );
}
