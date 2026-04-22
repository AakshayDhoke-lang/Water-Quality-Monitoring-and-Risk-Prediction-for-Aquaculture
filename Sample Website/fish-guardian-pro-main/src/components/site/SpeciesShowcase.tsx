import { motion } from "framer-motion";
import { Fish } from "lucide-react";

const species = [
  { name: "Tilapia", ph: "6.5–8.5", temp: "24–30°C", do: "> 5 mg/L", emoji: "🐟" },
  { name: "Catfish", ph: "6.0–8.0", temp: "26–30°C", do: "> 4 mg/L", emoji: "🐡" },
  { name: "Shrimp", ph: "7.5–8.5", temp: "26–32°C", do: "> 5 mg/L", emoji: "🦐" },
  { name: "Salmon", ph: "6.5–8.0", temp: "10–18°C", do: "> 7 mg/L", emoji: "🐠" },
  { name: "Carp", ph: "6.5–9.0", temp: "20–28°C", do: "> 5 mg/L", emoji: "🐟" },
];

export function SpeciesShowcase() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between flex-wrap gap-4"
        >
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">05 — Species Intelligence</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
              Tuned for <span className="text-gradient">every species.</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Each species has its own safe envelope. AquaPulse adapts predictions automatically.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Fish className="h-4 w-4 text-primary" /> 50+ species supported
          </div>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {species.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group relative glass rounded-2xl p-6 hover:shadow-glow transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              <div className="text-5xl mb-3">{s.emoji}</div>
              <div className="font-display text-xl font-bold">{s.name}</div>
              <div className="mt-3 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between"><span className="text-muted-foreground">pH</span><span>{s.ph}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Temp</span><span>{s.temp}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">DO</span><span>{s.do}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
