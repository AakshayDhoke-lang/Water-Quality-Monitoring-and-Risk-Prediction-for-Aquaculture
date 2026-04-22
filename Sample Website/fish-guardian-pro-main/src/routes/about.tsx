import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { motion } from "framer-motion";
import { Cpu, Database, LineChart, Microscope } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The Science Behind AquaPulse" },
      { name: "description", content: "How AquaPulse uses IoT sensors and machine learning to forecast aquaculture water quality risk." },
      { property: "og:title", content: "About AquaPulse — The Science of Living Water" },
      { property: "og:description", content: "Built for small-scale fish farmers. Powered by sensors, statistics, and species-aware AI." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Mission</span>
            <h1 className="mt-3 font-display text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
              Built for the <br /><span className="text-gradient">silent guardians</span> of fish.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Globally, small-scale aquaculture loses billions every year to preventable
              mortality events. AquaPulse exists to close that gap — making research-grade
              water intelligence accessible to every farmer with a phone.
            </p>
          </motion.div>

          <div className="mt-16 grid md:grid-cols-2 gap-5">
            {[
              { icon: Microscope, title: "Sensor-grade data", desc: "Industrial IoT probes sample pH, DO, temperature, ammonia, turbidity, and salinity at 1 Hz." },
              { icon: Database, title: "Time-series engine", desc: "Every reading is timestamped and persisted, building a high-resolution history of every pond." },
              { icon: Cpu, title: "Species-aware ML", desc: "Gradient-boosted models are tuned per species using published lethal/safe thresholds." },
              { icon: LineChart, title: "Predictive horizons", desc: "Forecasts up to 12 hours ahead so you can act, not react." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-sm">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 glass rounded-3xl p-8 md:p-12 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Designed with farmers. <span className="text-gradient">Validated by biologists.</span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              AquaPulse is built in collaboration with small-scale producers across India, Vietnam,
              and Nigeria — and validated against academic threshold ranges from FAO and peer-reviewed aquaculture journals.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
