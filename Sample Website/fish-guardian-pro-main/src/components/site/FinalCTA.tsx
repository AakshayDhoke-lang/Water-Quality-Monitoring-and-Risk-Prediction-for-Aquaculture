import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Bubbles } from "./Bubbles";

export function FinalCTA() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-aurora opacity-20" />
      <Bubbles count={14} />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]"
        >
          Your fish can't wait. <br />
          <span className="text-gradient">Neither should you.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-lg text-muted-foreground"
        >
          Join hundreds of farms using AquaPulse to protect their harvest, every minute of every day.
        </motion.p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105"
          >
            Start Monitoring Free
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 backdrop-blur-md px-8 py-4 text-base font-semibold text-foreground hover:bg-secondary/60"
          >
            Learn the Science
          </Link>
        </div>
      </div>
    </section>
  );
}
