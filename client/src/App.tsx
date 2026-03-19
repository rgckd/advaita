import { Router, Switch, Route, Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import Landing from "@/pages/Landing";
import SessionLauncher from "@/pages/SessionLauncher";
import Explore from "@/pages/Explore";
import ConceptDetail from "@/pages/ConceptDetail";
import StudyMap from "@/pages/StudyMap";
import ReadListen from "@/pages/ReadListen";
import Diary from "@/pages/Diary";
import Satsang from "@/pages/Satsang";
import Insights from "@/pages/Insights";
import Assessment from "@/pages/Assessment";
import GoDeeper from "@/pages/GoDeeper";
import NotFound from "@/pages/not-found";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { FloatingNotes } from "@/components/FloatingNotes";
import logoImg from "@assets/logo.jpg";
import shankaraImg from "@assets/shankara.jpg";

// Pages that show the full-screen layout (no sidebar)
const FULL_SCREEN_ROUTES = ["/", "/landing"];

// Logo component: mix-blend-mode:multiply removes white bg in light mode; invert for dark
function LogoImg({ className = "w-28 h-auto" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return (
    <img
      src={logoImg}
      alt="adv.ai.ta"
      className={className}
      style={isDark
        ? { filter: "invert(1) brightness(0.9)" }
        : { mixBlendMode: "multiply" }
      }
    />
  );
}

function AppShell() {
  const [location] = useHashLocation();
  const isFullScreen = FULL_SCREEN_ROUTES.includes(location);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const navItems = [
    { href: "/launch", label: "Home", icon: "🏠" },
    { href: "/explore", label: "Explore", icon: "🔍" },
    { href: "/study-map", label: "Study Map", icon: "🗺" },
    { href: "/diary", label: "Diary", icon: "📖" },
    { href: "/satsang", label: "Satsang", icon: "🕉" },
    { href: "/insights", label: "Insights", icon: "✨" },
    { href: "/assessment", label: "Assessment", icon: "🎯" },
  ];

  const journeySteps = [
    { label: "Curiosity", href: "/launch", num: 1 },
    { label: "Exploration", href: "/explore", num: 2 },
    { label: "Study Maps", href: "/study-map", num: 3 },
    { label: "Read & Listen", href: "/read/maya", num: 4 },
    { label: "Reflection", href: "/diary", num: 5 },
    { label: "Satsang", href: "/satsang", num: 6 },
    { label: "Insights", href: "/insights", num: 7 },
    { label: "Assessment", href: "/assessment", num: 8 },
  ];

  if (isFullScreen) {
    return (
      <Switch>
        <Route path="/landing" component={Landing} />
        <Route path="/" component={Landing} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-sidebar">
        <div className="px-4 py-4 border-b border-border">
          <Link href="/landing">
            <div className="flex flex-col items-center cursor-pointer">
              <LogoImg />
            </div>
          </Link>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors mb-0.5 ${
                location.startsWith(item.href)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`} data-testid={`nav-${item.label.toLowerCase()}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </div>
            </Link>
          ))}

          {/* Learning Journey mini-map */}
          <div className="mx-2 mt-4 mb-2 px-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Learning Journey</p>
            <div className="flex flex-col gap-0">
              {journeySteps.map((step, i) => (
                <Link key={step.href} href={step.href}>
                  <div className={`flex items-center gap-2 py-1 px-1 rounded cursor-pointer transition-colors ${
                    location.startsWith(step.href)
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      location.startsWith(step.href)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>{step.num}</span>
                    <span className="text-xs leading-tight">{step.label}</span>
                    {i < journeySteps.length - 1 && (
                      <span className="sr-only">→</span>
                    )}
                  </div>
                  {i < journeySteps.length - 1 && (
                    <div className="ml-2.5 w-px h-2 bg-border" />
                  )}
                </Link>
              ))}
              {/* Post-assessment fork — both are clickable */}
              <div className="ml-2.5 w-px h-2 bg-border" />
              <div className="flex flex-col gap-0.5">
                <Link href="/go-deeper">
                  <div className={`flex items-center gap-2 py-1 px-1 rounded cursor-pointer transition-colors ${
                    location.startsWith("/go-deeper") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}>
                    <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      location.startsWith("/go-deeper") ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>↺</span>
                    <span className="text-xs leading-tight">Go Deeper</span>
                  </div>
                </Link>
                <Link href="/explore">
                  <div className={`flex items-center gap-2 py-1 px-1 rounded cursor-pointer transition-colors ${
                    location === "/explore" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                  }`}>
                    <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-muted text-muted-foreground">→</span>
                    <span className="text-xs leading-tight">Explore More</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="border-t border-border">
          <img
            src={shankaraImg}
            alt="Adi Shankaracharya"
            className="w-full object-cover opacity-90"
            style={{ maxHeight: "180px", objectPosition: "top" }}
          />
          <div className="p-3">
            <p className="font-serif text-xs text-center text-primary font-semibold leading-tight">वन्दे गुरु परम्पराम् ॥</p>
            <p className="text-[10px] text-center text-muted-foreground italic leading-tight mt-0.5 mb-2">Vande Guru Paramparam — I bow to the lineage of teachers</p>
            <button
              onClick={() => setDark(d => !d)}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              data-testid="button-toggle-theme"
            >
              {dark ? "☀ Light mode" : "🌙 Dark mode"}
            </button>
          </div>
        </div>
      </aside>

      {/* Floating Notes — available on every app page */}
      <FloatingNotes />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/launch" component={SessionLauncher} />
          <Route path="/explore/:id" component={ConceptDetail} />
          <Route path="/explore" component={Explore} />
          <Route path="/study-map" component={StudyMap} />
          <Route path="/read/:id" component={ReadListen} />
          <Route path="/diary" component={Diary} />
          <Route path="/satsang" component={Satsang} />
          <Route path="/insights" component={Insights} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/go-deeper" component={GoDeeper} />
          <Route component={NotFound} />
        </Switch>
        <PerplexityAttribution />
      </main>
    </div>
  );
}

export function LotusSVG({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-label="adv.ai.ta lotus logo">
      <ellipse cx="24" cy="34" rx="6" ry="4" fill="hsl(25 82% 49%)" opacity="0.7" />
      <ellipse cx="14" cy="30" rx="7" ry="4.5" transform="rotate(-30 14 30)" fill="hsl(25 82% 55%)" opacity="0.6" />
      <ellipse cx="34" cy="30" rx="7" ry="4.5" transform="rotate(30 34 30)" fill="hsl(25 82% 55%)" opacity="0.6" />
      <ellipse cx="8" cy="24" rx="7" ry="4" transform="rotate(-55 8 24)" fill="hsl(43 85% 60%)" opacity="0.5" />
      <ellipse cx="40" cy="24" rx="7" ry="4" transform="rotate(55 40 24)" fill="hsl(43 85% 60%)" opacity="0.5" />
      <ellipse cx="24" cy="22" rx="6" ry="9" fill="hsl(25 82% 58%)" opacity="0.9" />
      <ellipse cx="16" cy="24" rx="5" ry="8" transform="rotate(-20 16 24)" fill="hsl(25 82% 62%)" opacity="0.8" />
      <ellipse cx="32" cy="24" rx="5" ry="8" transform="rotate(20 32 24)" fill="hsl(25 82% 62%)" opacity="0.8" />
      <circle cx="24" cy="20" r="4" fill="hsl(43 85% 65%)" />
      <circle cx="24" cy="20" r="2.5" fill="hsl(25 82% 49%)" />
    </svg>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <AppShell />
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
