import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { motion } from "framer-motion";

export const Route = createFileRoute("/species")({
  head: () => ({
    meta: [
      { title: "Species Library — AquaPulse" },
      { name: "description", content: "Safe water quality thresholds for tilapia, catfish, shrimp, salmon, carp and more aquaculture species." },
      { property: "og:title", content: "AquaPulse Species Threshold Library" },
      { property: "og:description", content: "Species-specific safe ranges for pH, dissolved oxygen, temperature, and ammonia." },
    ],
  }),
  component: Species,
});

const species = [
  { name: "Tilapia", emoji: "🐟", ph: "6.5 – 8.5", temp: "24 – 30 °C", do: "> 5 mg/L", amm: "< 0.05 ppm", note: "Hardy tropical species, tolerates wide ranges." },
  { name: "Catfish", emoji: "🐡", ph: "6.0 – 8.0", temp: "26 – 30 °C", do: "> 4 mg/L", amm: "< 0.05 ppm", note: "Bottom dweller, sensitive to oxygen drops." },
  { name: "Shrimp", emoji: "🦐", ph: "7.5 – 8.5", temp: "26 – 32 °C", do: "> 5 mg/L", amm: "< 0.03 ppm", note: "Brackish water; salinity 10–25 ppt ideal." },
  { name: "Salmon", emoji: "🐠", ph: "6.5 – 8.0", temp: "10 – 18 °C", do: "> 7 mg/L", amm: "< 0.02 ppm", note: "Cold water, high DO requirements." },
  { name: "Carp", emoji: "🐟", ph: "6.5 – 9.0", temp: "20 – 28 °C", do: "> 5 mg/L", amm: "< 0.05 ppm", note: "Extremely tolerant; ideal for beginners." },
  { name: "Trout", emoji: "🐟", ph: "6.5 – 8.0", temp: "10 – 16 °C", do: "> 8 mg/L", amm: "< 0.02 ppm", note: "Cold, oxygen-rich streams." },
];

function Species() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Reference</span>
            <h1 className="mt-3 font-display text-5xl md:text-6xl font-bold tracking-tighter">
              Species <span className="text-gradient">Threshold Library</span>
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
              Every species has its own envelope of safety. AquaPulse predictions adapt automatically — these are the science-backed reference ranges we use.
            </p>
          </motion.div>

          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {species.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="glass rounded-3xl p-7 hover:shadow-glow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{s.emoji}</div>
                  <div>
                    <h3 className="font-display text-2xl font-bold">{s.name}</h3>
                    <p className="text-sm text-muted-foreground">{s.note}</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { k: "pH", v: s.ph },
                    { k: "Temperature", v: s.temp },
                    { k: "Dissolved O₂", v: s.do },
                    { k: "Ammonia", v: s.amm },
                  ].map((r) => (
                    <div key={r.k} className="rounded-xl border border-border/60 bg-background/30 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.k}</div>
                      <div className="mt-1 font-mono text-sm font-semibold text-foreground">{r.v}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
