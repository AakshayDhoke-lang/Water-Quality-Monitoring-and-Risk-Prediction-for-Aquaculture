import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { FlaskConical, Droplets, Thermometer, Activity, Eye, Waves } from "lucide-react";

type Status = "safe" | "warn" | "danger";

function makeSeries(seed: number) {
  return Array.from({ length: 24 }).map((_, i) => ({
    x: i,
    y: 50 + Math.sin(i / 2 + seed) * 18 + Math.cos(i / 3 + seed * 2) * 10,
  }));
}

const params: {
  icon: typeof FlaskConical;
  name: string;
  value: string;
  unit: string;
  range: string;
  status: Status;
  span: string;
  seed: number;
}[] = [
  { icon: FlaskConical, name: "pH Level", value: "7.24", unit: "", range: "6.5 – 8.5", status: "safe", span: "md:col-span-2", seed: 1 },
  { icon: Droplets, name: "Dissolved Oxygen", value: "6.8", unit: "mg/L", range: "> 5.0", status: "safe", span: "", seed: 2 },
  { icon: Thermometer, name: "Temperature", value: "26.4", unit: "°C", range: "24 – 30", status: "safe", span: "", seed: 3 },
  { icon: Activity, name: "Ammonia", value: "0.18", unit: "ppm", range: "< 0.25", status: "warn", span: "", seed: 4 },
  { icon: Eye, name: "Turbidity", value: "32", unit: "NTU", range: "< 50", status: "safe", span: "", seed: 5 },
  { icon: Waves, name: "Salinity", value: "0.4", unit: "ppt", range: "0 – 1.0", status: "safe", span: "md:col-span-2", seed: 6 },
];

const statusStyles: Record<Status, { dot: string; chip: string; stroke: string; fill: string }> = {
  safe: { dot: "bg-safe", chip: "bg-safe/15 text-safe border-safe/30", stroke: "oklch(0.78 0.16 165)", fill: "oklch(0.78 0.16 165 / 0.25)" },
  warn: { dot: "bg-warn", chip: "bg-warn/15 text-warn border-warn/30", stroke: "oklch(0.82 0.16 80)", fill: "oklch(0.82 0.16 80 / 0.25)" },
  danger: { dot: "bg-danger", chip: "bg-danger/15 text-danger border-danger/30", stroke: "oklch(0.68 0.24 25)", fill: "oklch(0.68 0.24 25 / 0.25)" },
};

export function MonitorBento() {
  return (
    <section id="monitor" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">02 — Live Monitor</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Six parameters. <span className="text-gradient">One source of truth.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Continuous sensor streams analyzed every second — visualized like a flagship instrument.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {params.map((p, i) => {
            const s = statusStyles[p.status];
            const data = makeSeries(p.seed);
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className={`group glass rounded-2xl p-6 hover:shadow-glow transition-all duration-500 hover:-translate-y-1 ${p.span}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                      <p.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">Safe: {p.range}</div>
                    </div>
                  </div>
                  <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase border ${s.chip}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} animate-pulse-slow`} />
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-4xl font-bold tracking-tight text-foreground">
                      {p.value}
                      <span className="text-base text-muted-foreground ml-1">{p.unit}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-16 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`g-${p.seed}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={s.stroke} stopOpacity={0.5} />
                          <stop offset="100%" stopColor={s.stroke} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="y" stroke={s.stroke} strokeWidth={2} fill={`url(#g-${p.seed})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
