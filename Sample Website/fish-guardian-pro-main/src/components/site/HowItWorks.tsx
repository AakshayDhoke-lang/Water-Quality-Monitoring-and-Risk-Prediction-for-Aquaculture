import { motion } from "framer-motion";
import { Radio, BrainCircuit, BellRing } from "lucide-react";

const steps = [
  {
    icon: Radio,
    title: "Sense",
    desc: "IoT sensors stream pH, DO, temperature, ammonia, turbidity, and salinity every second from your ponds.",
  },
  {
    icon: BrainCircuit,
    title: "Analyze",
    desc: "Our ML model fuses live readings with species thresholds and historical patterns to forecast risk windows.",
  },
  {
    icon: BellRing,
    title: "Alert",
    desc: "Get instant SMS, app, and on-site siren alerts with prescriptive actions before mortality events occur.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">04 — Workflow</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Three steps. <span className="text-gradient">Zero guesswork.</span>
          </h2>
        </motion.div>

        <div className="relative mt-16">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
          <div className="space-y-12">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex gap-6 md:gap-12 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}
              >
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow md:mx-auto">
                  <s.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className={`flex-1 glass rounded-2xl p-6 ${i % 2 === 1 ? "md:text-right" : ""}`}>
                  <div className="text-xs font-mono uppercase tracking-wider text-primary">Step {i + 1}</div>
                  <h3 className="mt-1 font-display text-2xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
