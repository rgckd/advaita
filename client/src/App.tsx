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
import SelfStudy from "@/pages/SelfStudy";
import NotFound from "@/pages/not-found";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { FloatingNotes } from "@/components/FloatingNotes";
import { SeekerBadge } from "@/components/SeekerBadge";
import { store, subscribe } from "@/lib/localStore";
import logoImg from "@assets/logo.jpg";
import shankaraImg from "@assets/shankara.jpg";

// Pages that show the full-screen layout (no sidebar)
const FULL_SCREEN_ROUTES = ["/", "/landing"];

// Logo component: always render as-is — no color shifting between modes
function LogoImg({ className = "w-28 h-auto" }: { className?: string }) {
  return (
    <img
      src={logoImg}
      alt="adv.ai.ta"
      className={className}
    />
  );
}

function AppShell() {
  const [location] = useHashLocation();
  const isFullScreen = FULL_SCREEN_ROUTES.includes(location);
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seekerLevel, setSeekerLevel] = useState(store.getLevel());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => subscribe(() => setSeekerLevel(store.getLevel())), []);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [location]);

  // Single unified nav — no separate Learning Journey section
  const navItems = [
    { href: "/launch",      label: "Home",        icon: "🏠" },
    { href: "/explore",     label: "Explore",     icon: "🔍" },
    { href: "/study-map",   label: "Study Maps",  icon: "🗺" },
    { href: "/self-study",  label: "Self-study",  icon: "📚" },
    { href: "/diary",       label: "Reflection",  icon: "🔥" },
    { href: "/assessment",  label: "Assessment",  icon: "🎯" },
    { href: "/satsang",     label: "Satsang",     icon: "🕉" },
  ];

  if (isFullScreen) {
    return (
      <Switch>
        <Route path="/landing" component={Landing} />
        <Route path="/" component={Landing} />
      </Switch>
    );
  }

  // Reusable sidebar content (shared between desktop and mobile drawer)
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <Link href="/landing">
          <div className="flex flex-col items-center cursor-pointer">
            <LogoImg />
          </div>
        </Link>
        {/* Seeker level badge under logo */}
        <div className="flex justify-center mt-2">
          <Link href="/assessment">
            <SeekerBadge size="md" />
          </Link>
        </div>
      </div>

      {/* Single unified nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(item => (
          <Link key={item.href} href={item.href}>
            <div className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors mb-0.5 ${
              location.startsWith(item.href)
                ? "bg-primary text-primary-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            }`} data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </div>
          </Link>
        ))}
        {/* Go Deeper as a footer nav item */}
        <Link href="/go-deeper">
          <div className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors mb-0.5 ${
            location.startsWith("/go-deeper")
              ? "bg-primary text-primary-foreground font-medium"
              : "text-sidebar-foreground hover:bg-sidebar-accent"
          }`}>
            <span className="text-base">↺</span>
            Go Deeper
          </div>
        </Link>
      </nav>

      {/* Shankara + dark mode */}
      <div className="border-t border-border">
        <img src={shankaraImg} alt="Adi Shankaracharya" className="w-full object-cover opacity-90" style={{ maxHeight: "140px", objectPosition: "top" }} />
        <div className="p-3">
          <p className="font-serif text-xs text-center text-primary font-semibold leading-tight">वन्दे गुरु परम्पराम् ॥</p>
          <p className="text-[10px] text-center text-muted-foreground italic leading-tight mt-0.5 mb-2">Vande Guru Paramparam — I bow to the lineage of teachers</p>
          <button onClick={() => setDark(d => !d)} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1" data-testid="button-toggle-theme">
            {dark ? "☀ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 flex-shrink-0 flex-col border-r border-border bg-sidebar">
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer (slides in from left) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-border bg-sidebar transform transition-transform duration-200 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-xl leading-none z-10"
          aria-label="Close menu"
        >✕</button>
        <SidebarContent />
      </aside>

      {/* Floating Notes — available on every app page */}
      <FloatingNotes />

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar md:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground text-xl leading-none p-1"
            aria-label="Open menu"
          >☰</button>
          <Link href="/landing" className="flex-1 flex justify-center">
            <LogoImg className="h-8 w-auto" />
          </Link>
          {/* Dark mode toggle on mobile top bar */}
          <button onClick={() => setDark(d => !d)} className="text-sm text-muted-foreground hover:text-foreground p-1">
            {dark ? "☀" : "🌙"}
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Switch>
            <Route path="/launch" component={SessionLauncher} />
            <Route path="/explore/:id" component={ConceptDetail} />
            <Route path="/explore" component={Explore} />
            <Route path="/study-map" component={StudyMap} />
            <Route path="/read/:id" component={ReadListen} />
            <Route path="/self-study/:concept" component={SelfStudy} />
            <Route path="/self-study" component={SelfStudy} />
            <Route path="/diary" component={Diary} />
            <Route path="/satsang" component={Satsang} />
            <Route path="/insights" component={Insights} />
            <Route path="/assessment" component={Assessment} />
            <Route path="/go-deeper" component={GoDeeper} />
            <Route component={NotFound} />
          </Switch>
          <PerplexityAttribution />
        </main>

        {/* ── Mobile bottom nav bar ── */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex md:hidden bg-sidebar border-t border-border">
          {navItems.slice(0, 5).map(item => ( // Home, Explore, Study Maps, Self-study, Reflection
            <Link key={item.href} href={item.href} className="flex-1">
              <div className={`flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                location.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
              }`}>
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[9px] leading-tight font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
          {/* More button — opens drawer for remaining nav items */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-lg leading-none">⋯</span>
            <span className="text-[9px] leading-tight font-medium">More</span>
          </button>
        </nav>
      </div>
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
