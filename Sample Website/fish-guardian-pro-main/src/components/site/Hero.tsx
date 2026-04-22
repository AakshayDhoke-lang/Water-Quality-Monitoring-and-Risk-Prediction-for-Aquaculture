import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Droplets, Thermometer, FlaskConical } from "lucide-react";
import { Bubbles } from "./Bubbles";
import heroImg from "@/assets/hero-ocean.jpg";
import { Link } from "@tanstack/react-router";

function LiveStat({
  icon: Icon,
  label,
  value,
  unit,
  status,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  unit: string;
  status: "safe" | "warn" | "danger";
}) {
  const dot =
    status === "safe" ? "bg-safe" : status === "warn" ? "bg-warn" : "bg-danger";
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2 bg-background/40 border border-border/50">
      <Icon className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-mono text-sm font-semibold">
          {value} <span className="text-muted-foreground text-xs">{unit}</span>
        </div>
      </div>
      <span className={`relative flex h-2.5 w-2.5`}>
        <span className={`absolute inset-0 rounded-full ${dot} animate-pulse-slow opacity-75`} />
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
      </span>
    </div>
  );
}

export function Hero() {
  const [ph, setPh] = useState(7.2);
  useEffect(() => {
    const id = setInterval(() => {
      setPh((p) => +(7 + Math.sin(Date.now() / 2000) * 0.4).toFixed(2));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative noise overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      <Bubbles count={22} />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary animate-pulse-slow" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live · AI Water Intelligence
          </span>

          <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tighter">
            <span className="block text-foreground">Predict.</span>
            <span className="block text-aurora">Protect.</span>
            <span className="block text-foreground">Prosper.</span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            AI-powered water intelligence that keeps your fish alive — predicting
            risk before disease, stress, or mortality strikes.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105"
            >
              Launch Dashboard
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#monitor"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur-md px-8 py-4 text-base font-semibold text-foreground hover:bg-secondary/60 transition"
            >
              Watch Demo
            </a>
          </div>
        </motion.div>

        {/* Floating live readings card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative mt-16 mx-auto max-w-4xl"
        >
          <div className="absolute inset-0 -z-10 blur-3xl bg-gradient-aurora opacity-30 rounded-full" />
          <div className="glass rounded-3xl p-6 md:p-8 shadow-elegant animate-float">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Pond #04 · Tilapia</div>
                <div className="font-display text-lg font-semibold mt-1">All systems healthy</div>
              </div>
              <div className="rounded-full px-3 py-1 text-xs font-mono bg-safe/15 text-safe border border-safe/30">
                SAFE · 98%
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <LiveStat icon={FlaskConical} label="pH" value={ph.toString()} unit="" status="safe" />
              <LiveStat icon={Droplets} label="DO" value="6.8" unit="mg/L" status="safe" />
              <LiveStat icon={Thermometer} label="Temp" value="26.4" unit="°C" status="safe" />
              <LiveStat icon={Activity} label="Ammonia" value="0.02" unit="ppm" status="safe" />
            </div>
          </div>
        </motion.div>

        {/* Stat ribbon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2"><span className="font-mono text-foreground font-semibold">2.4M</span> fish protected</div>
          <span className="hidden md:block h-1 w-1 rounded-full bg-border" />
          <div className="flex items-center gap-2"><span className="font-mono text-foreground font-semibold">850+</span> farms</div>
          <span className="hidden md:block h-1 w-1 rounded-full bg-border" />
          <div className="flex items-center gap-2"><span className="font-mono text-primary font-semibold">99.7%</span> prediction accuracy</div>
        </motion.div>
      </div>
    </section>
  );
}
