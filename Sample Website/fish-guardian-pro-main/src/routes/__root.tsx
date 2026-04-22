import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">Lost at sea</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page drifted away. Let's get you back to safer waters.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow-sm hover:scale-105 transition-transform"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AquaPulse — AI Water Intelligence for Aquaculture" },
      { name: "description", content: "Real-time water quality monitoring and AI risk prediction for aquaculture farmers. Protect your fish before disease, stress, or mortality strikes." },
      { name: "author", content: "AquaPulse" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "AquaPulse — AI Water Intelligence for Aquaculture" },
      { name: "twitter:title", content: "AquaPulse — AI Water Intelligence for Aquaculture" },
      { property: "og:description", content: "Real-time water quality monitoring and AI risk prediction for aquaculture farmers. Protect your fish before disease, stress, or mortality strikes." },
      { name: "twitter:description", content: "Real-time water quality monitoring and AI risk prediction for aquaculture farmers. Protect your fish before disease, stress, or mortality strikes." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1822ebb8-c1ce-4a9e-bb16-9d0caa8c8c18/id-preview-bb80c5ad--e7633f30-9f15-4820-a32f-5f2499e9f163.lovable.app-1776829874277.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1822ebb8-c1ce-4a9e-bb16-9d0caa8c8c18/id-preview-bb80c5ad--e7633f30-9f15-4820-a32f-5f2499e9f163.lovable.app-1776829874277.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
