import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const stories = [
  { quote: "AquaPulse warned us 6 hours before an oxygen crash. We saved 12,000 fish that night.", author: "Ravi K.", role: "Tilapia Farmer · Andhra Pradesh" },
  { quote: "Mortality dropped 73% in our first season. The AI catches things human eyes simply miss.", author: "Linh T.", role: "Shrimp Cooperative · Mekong Delta" },
  { quote: "From manual checks to a live dashboard — this is the future of small-scale aquaculture.", author: "Samuel O.", role: "Catfish Farm · Lagos" },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">06 — Trusted</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Loved by farmers <span className="text-gradient">across the world.</span>
          </h2>
        </motion.div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {stories.map((s, i) => (
            <motion.div
              key={s.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-7 hover:shadow-glow-sm transition-all"
            >
              <Quote className="h-7 w-7 text-primary/60" />
              <p className="mt-4 text-foreground/90 leading-relaxed">"{s.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm">
                  {s.author[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{s.author}</div>
                  <div className="text-xs text-muted-foreground">{s.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
