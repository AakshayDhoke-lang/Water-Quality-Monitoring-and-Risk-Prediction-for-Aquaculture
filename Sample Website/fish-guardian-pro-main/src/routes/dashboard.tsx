import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, Droplets, FlaskConical, Thermometer, Eye, Waves, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — AquaPulse Live Monitoring" },
      { name: "description", content: "Live aquaculture dashboard: pH, dissolved oxygen, temperature, ammonia, turbidity in real time with AI risk scoring." },
      { property: "og:title", content: "AquaPulse Live Dashboard" },
      { property: "og:description", content: "Real-time water quality monitoring and AI alerts for fish farms." },
    ],
  }),
  component: Dashboard,
});

function makeTrend(base: number, variance: number) {
  return Array.from({ length: 30 }).map((_, i) => ({
    t: `${i}:00`,
    v: +(base + Math.sin(i / 3) * variance + (Math.random() - 0.5) * variance * 0.4).toFixed(2),
  }));
}

function MetricCard({
  icon: Icon, label, value, unit, trend, color,
}: {
  icon: typeof Activity; label: string; value: string; unit: string;
  trend: { t: string; v: number }[]; color: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
      <div className="mt-3 font-mono text-3xl font-bold">
        {value} <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-3 h-14 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend}>
            <defs>
              <linearGradient id={`d-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#d-${label})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Dashboard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const phTrend = makeTrend(7.3 + Math.sin(tick / 5) * 0.1, 0.3);
  const doTrend = makeTrend(6.5 + Math.cos(tick / 4) * 0.2, 0.6);
  const tempTrend = makeTrend(26.5, 1.2);
  const ammoniaTrend = makeTrend(0.18, 0.08);
  const turbTrend = makeTrend(32, 6);
  const salTrend = makeTrend(0.4, 0.1);

  const mainTrend = Array.from({ length: 48 }).map((_, i) => ({
    t: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
    pH: +(7.2 + Math.sin(i / 5) * 0.3 + (Math.random() - 0.5) * 0.1).toFixed(2),
    DO: +(6.5 + Math.cos(i / 6) * 0.5 + (Math.random() - 0.5) * 0.2).toFixed(2),
    Temp: +(26 + Math.sin(i / 8) * 1.5).toFixed(2),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-safe animate-pulse-slow" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
                </span>
                <span className="text-xs font-mono uppercase tracking-wider text-safe">Live · Pond #04</span>
              </div>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
                Tilapia Farm <span className="text-gradient">Dashboard</span>
              </h1>
            </div>
            <div className="glass rounded-2xl px-5 py-3 flex items-center gap-4">
              <ShieldCheck className="h-6 w-6 text-safe" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">AI Risk Score</div>
                <div className="font-mono text-2xl font-bold text-safe">94<span className="text-xs text-muted-foreground">/100</span></div>
              </div>
            </div>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard icon={FlaskConical} label="pH" value="7.24" unit="" trend={phTrend} color="oklch(0.78 0.18 195)" />
            <MetricCard icon={Droplets} label="DO" value="6.8" unit="mg/L" trend={doTrend} color="oklch(0.78 0.16 165)" />
            <MetricCard icon={Thermometer} label="Temp" value="26.4" unit="°C" trend={tempTrend} color="oklch(0.85 0.16 190)" />
            <MetricCard icon={Activity} label="Ammonia" value="0.18" unit="ppm" trend={ammoniaTrend} color="oklch(0.82 0.16 80)" />
            <MetricCard icon={Eye} label="Turbidity" value="32" unit="NTU" trend={turbTrend} color="oklch(0.78 0.18 195)" />
            <MetricCard icon={Waves} label="Salinity" value="0.4" unit="ppt" trend={salTrend} color="oklch(0.6 0.18 280)" />
          </div>

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">24-Hour Trend</h3>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> pH</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-safe" /> DO</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warn" /> Temp</span>
                </div>
              </div>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mainTrend}>
                    <defs>
                      <linearGradient id="gPh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.78 0.18 195)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="oklch(0.78 0.18 195)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gDo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.78 0.16 165)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="oklch(0.78 0.16 165)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="oklch(0.78 0.18 195 / 0.08)" vertical={false} />
                    <XAxis dataKey="t" stroke="oklch(0.7 0.04 210)" fontSize={10} tickLine={false} axisLine={false} interval={5} />
                    <YAxis stroke="oklch(0.7 0.04 210)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.22 0.04 215)",
                        border: "1px solid oklch(0.78 0.18 195 / 0.3)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="pH" stroke="oklch(0.78 0.18 195)" strokeWidth={2} fill="url(#gPh)" />
                    <Area type="monotone" dataKey="DO" stroke="oklch(0.78 0.16 165)" strokeWidth={2} fill="url(#gDo)" />
                    <Area type="monotone" dataKey="Temp" stroke="oklch(0.82 0.16 80)" strokeWidth={2} fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warn" />
                <h3 className="font-display text-lg font-semibold">AI Alerts</h3>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { lvl: "warn", title: "Ammonia rising", desc: "Forecast: 0.3ppm in 4h. Consider water change.", time: "2m ago" },
                  { lvl: "safe", title: "Optimal feeding window", desc: "DO + temp ideal for next 90 min.", time: "12m ago" },
                  { lvl: "safe", title: "Daily report ready", desc: "View pond summary →", time: "1h ago" },
                  { lvl: "warn", title: "Sensor calibration due", desc: "pH probe #2 in 3 days.", time: "3h ago" },
                ].map((a, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-background/30 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${a.lvl === "warn" ? "bg-warn" : "bg-safe"} animate-pulse-slow`} />
                      <span className="text-sm font-semibold">{a.title}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground font-mono">{a.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
