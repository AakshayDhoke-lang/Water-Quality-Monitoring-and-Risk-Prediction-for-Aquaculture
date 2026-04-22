import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { MonitorBento } from "@/components/site/MonitorBento";
import { PredictionEngine } from "@/components/site/PredictionEngine";
import { HowItWorks } from "@/components/site/HowItWorks";
import { SpeciesShowcase } from "@/components/site/SpeciesShowcase";
import { Testimonials } from "@/components/site/Testimonials";
import { FinalCTA } from "@/components/site/FinalCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaPulse — Predict. Protect. Prosper." },
      { name: "description", content: "AI-powered water quality monitoring & risk prediction for aquaculture. Live sensor analytics, species-aware alerts, mortality prevention." },
      { property: "og:title", content: "AquaPulse — AI Water Intelligence for Aquaculture" },
      { property: "og:description", content: "Real-time monitoring + ML risk prediction for fish farms. Save your harvest before disaster strikes." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <MonitorBento />
        <PredictionEngine />
        <HowItWorks />
        <SpeciesShowcase />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
