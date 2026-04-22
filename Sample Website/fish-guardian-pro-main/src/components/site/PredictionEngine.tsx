import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, ShieldCheck } from "lucide-react";

function evaluate(ph: number, doVal: number, temp: number, ammonia: number) {
  let score = 100;
  if (ph < 6.5 || ph > 8.5) score -= 30;
  else if (ph < 6.8 || ph > 8.2) score -= 12;
  if (doVal < 4) score -= 35;
  else if (doVal < 5) score -= 15;
  if (temp < 22 || temp > 32) score -= 25;
  else if (temp < 24 || temp > 30) score -= 8;
  if (ammonia > 0.5) score -= 35;
  else if (ammonia > 0.25) score -= 15;
  score = Math.max(0, Math.min(100, score));
  let level: "Safe" | "Caution" | "Critical" = "Safe";
  if (score < 55) level = "Critical";
  else if (score < 80) level = "Caution";
  return { score, level };
}

function Slider({
  label, value, setValue, min, max, step, unit,
}: {
  label: string; value: number; setValue: (n: number) => void;
  min: number; max: number; step: number; unit: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="font-mono text-sm text-primary">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-glow-sm
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background"
      />
    </div>
  );
}

export function PredictionEngine() {
  const [ph, setPh] = useState(7.2);
  const [doVal, setDo] = useState(6.5);
  const [temp, setTemp] = useState(26);
  const [ammonia, setAmmonia] = useState(0.1);
  const { score, level } = evaluate(ph, doVal, temp, ammonia);

  const levelColor =
    level === "Safe" ? "safe" : level === "Caution" ? "warn" : "danger";

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-hero" />
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-primary">03 — Prediction Engine</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            See the <span className="text-gradient">AI think</span> in real time.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Drag the sliders. Watch the model evaluate species-specific safety thresholds instantly.
          </p>
        </motion.div>

        <div className="mt-16 grid lg:grid-cols-2 gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-3xl p-8 shadow-card"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-semibold">Risk Simulator</h3>
            </div>
            <div className="space-y-6">
              <Slider label="pH" value={ph} setValue={setPh} min={5} max={10} step={0.1} unit="" />
              <Slider label="Dissolved Oxygen" value={doVal} setValue={setDo} min={1} max={12} step={0.1} unit=" mg/L" />
              <Slider label="Temperature" value={temp} setValue={setTemp} min={15} max={38} step={0.5} unit=" °C" />
              <Slider label="Ammonia" value={ammonia} setValue={setAmmonia} min={0} max={1.5} step={0.01} unit=" ppm" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`relative glass rounded-3xl p-8 shadow-elegant overflow-hidden`}
          >
            <div
              className="absolute inset-0 -z-10 opacity-40 transition-all duration-700"
              style={{
                background:
                  level === "Safe"
                    ? "radial-gradient(circle at 50% 0%, oklch(0.78 0.16 165 / 0.4), transparent 60%)"
                    : level === "Caution"
                    ? "radial-gradient(circle at 50% 0%, oklch(0.82 0.16 80 / 0.45), transparent 60%)"
                    : "radial-gradient(circle at 50% 0%, oklch(0.68 0.24 25 / 0.5), transparent 60%)",
              }}
            />
            <div className="flex items-center gap-2 mb-6">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-display text-xl font-semibold">AI Verdict</h3>
              <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Tilapia · 0.2s
              </span>
            </div>

            <div className="text-center py-6">
              <motion.div
                key={level}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-mono uppercase border bg-${levelColor}/15 text-${levelColor} border-${levelColor}/40`}
              >
                <ShieldCheck className="h-4 w-4" /> {level}
              </motion.div>
              <div className="mt-6 font-mono text-7xl md:text-8xl font-bold tracking-tighter text-foreground">
                {score}
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Survival Confidence Score</div>

              <div className="mt-8 h-2 w-full rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className={`h-full bg-${levelColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 text-left">
                {["ML-Powered", "Real-Time", "Species-Aware"].map((t) => (
                  <div key={t} className="rounded-xl border border-border/60 px-3 py-2 text-xs text-center text-muted-foreground bg-background/30">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
