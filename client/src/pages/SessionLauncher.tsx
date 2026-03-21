import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { store, subscribe, LEVELS } from "@/lib/localStore";
import type { ReflectionWithAttachment } from "@/lib/localStore";
import { ThemeIcon } from "@/components/ThemeIcon";
import { LevelCard } from "@/components/SeekerBadge";

// New menu structure — 6 core options + Go Deeper
const intents = [
  { href: "/explore",    icon: "explore"    as const, title: "Explore",      desc: "Browse Advaita concepts and dive into any topic with your AI companion." },
  { href: "/study-map",  icon: "study-map"  as const, title: "Study Maps",   desc: "Visualize how concepts connect — build your personal knowledge graph." },
  { href: "/self-study", icon: "read"       as const, title: "Self-study",   desc: "Curated texts, lectures, and your own uploaded materials — with notes." },
  { href: "/diary",      icon: "diary"      as const, title: "Reflection",   desc: "AI-assisted diary: capture insights and deepen your inquiry." },
  { href: "/assessment", icon: "assessment" as const, title: "Assessment",   desc: "Test your understanding and track your level on the path." },
  { href: "/satsang",    icon: "satsang"    as const, title: "Satsang",      desc: "Philosophical discussion with fellow seekers. Share notes and diary entries." },
];

const concepts = [
  "Maya", "Brahman", "Atman", "Avidya", "Vivartavada",
  "Pramana", "Advaita", "Jiva", "Turiya", "Nirguna",
  "Saguna", "Moksha", "Lila", "Samsara", "Karma",
  "Upanishads", "Bhashya", "Neti Neti", "Tat Tvam Asi", "Aham Brahmasmi",
];

// Learning path steps — a guide shown to the seeker
const LEARNING_PATH = [
  { step: 1, label: "Explore concepts",          href: "/explore",    desc: "Start with curiosity — any concept, any question." },
  { step: 2, label: "Build your Study Map",       href: "/study-map",  desc: "See how concepts connect. Build your own knowledge graph." },
  { step: 3, label: "Study texts & videos",       href: "/self-study", desc: "Engage with primary sources at your level. Upload your own materials." },
  { step: 4, label: "Reflect in your Diary",      href: "/diary",      desc: "Write with AI guidance. Capture what lands." },
  { step: 5, label: "Discuss in Satsang",         href: "/satsang",    desc: "Test your understanding through dialogue." },
  { step: 6, label: "Take an Assessment",         href: "/assessment", desc: "Know where you are. Advance your level." },
  { step: 7, label: "Go Deeper",                  href: "/go-deeper",  desc: "Receive curated next steps for your level." },
];

export default function SessionLauncher() {
  const [reflections, setReflections] = useState<ReflectionWithAttachment[]>(store.getReflections());
  const [seekerLevel, setSeekerLevel] = useState(store.getLevel());
  useEffect(() => subscribe(() => {
    setReflections(store.getReflections());
    setSeekerLevel(store.getLevel());
  }), []);
  const lastReflection = reflections[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [showPath, setShowPath] = useState(false);
  const [, navigate] = useLocation();

  const filteredConcepts = searchQuery.trim().length > 0
    ? concepts.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const levelInfo = LEVELS.find(l => l.id === seekerLevel)!;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Welcome back, Seeker</h1>
        <p className="text-muted-foreground text-sm">What calls you today?</p>

        {/* Search bar */}
        <div className="relative mt-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && filteredConcepts.length > 0) {
                navigate(`/explore/${filteredConcepts[0].toLowerCase()}`);
                setSearchQuery("");
              }
            }}
            placeholder="Search a concept — Maya, Brahman, Atman…"
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            data-testid="input-concept-search"
          />
          {filteredConcepts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
              {filteredConcepts.slice(0, 6).map(concept => (
                <button
                  key={concept}
                  onClick={() => { navigate(`/explore/${concept.toLowerCase()}`); setSearchQuery(""); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  data-testid={`search-result-${concept.toLowerCase()}`}
                >
                  {concept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Last reflection */}
        {lastReflection && (
          <div className="mt-4 p-4 ai-bubble rounded-lg">
            <p className="text-xs font-medium text-primary mb-1">Your last reflection — {lastReflection.concept}</p>
            <p className="text-sm text-foreground line-clamp-2">{lastReflection.content}</p>
          </div>
        )}
      </div>

      {/* Seeker level card */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your level</p>
          <Link href="/assessment">
            <button className="text-xs text-primary hover:underline">Take assessment →</button>
          </Link>
        </div>
        <LevelCard />
      </div>

      {/* Intent cards — new structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {intents.map(intent => (
          <Link key={intent.href} href={intent.href}>
            <div className="p-5 bg-card border border-border rounded-xl cursor-pointer transition-all hover:shadow-md hover:border-primary/40 group">
              <div className="flex items-start gap-4">
                <ThemeIcon name={intent.icon} size="sm" />
                <div>
                  <h3 className="font-serif text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{intent.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{intent.desc}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Learning path accordion */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <button
          onClick={() => setShowPath(p => !p)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">The learning path</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Guided by a guru, step by step — from curiosity to realization
            </p>
          </div>
          <span className="text-muted-foreground text-lg">{showPath ? "▲" : "▼"}</span>
        </button>
        {showPath && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            {/* Level badges */}
            <div className="flex gap-3 flex-wrap mb-4">
              {LEVELS.map((l, i) => (
                <div key={l.id} className="flex items-center gap-2">
                  {i > 0 && <span className="text-muted-foreground text-xs">→</span>}
                  <Link href="/assessment">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer transition-colors ${
                      l.id === seekerLevel
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    }`}>
                      {l.roman}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
            {/* Steps */}
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
              {LEARNING_PATH.map(step => (
                <Link key={step.step} href={step.href}>
                  <div className="flex gap-3 items-start mb-3 cursor-pointer group">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <span className="text-xs font-bold text-primary group-hover:text-primary-foreground">{step.step}</span>
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic pt-1">
              At every step, the AI companion serves as your guru-guide — asking, reflecting, pointing.
            </p>
          </div>
        )}
      </div>

      {/* Today's pointer */}
      <div className="p-5 bg-card border border-border rounded-xl">
        <p className="text-xs font-medium text-primary mb-2 flex items-center gap-2"><span>✨</span> Today's Pointer</p>
        <p className="font-serif text-sm italic text-foreground">"The mind that inquires into the nature of the mind dissolves — this is the direct path."</p>
        <p className="text-xs text-muted-foreground mt-1">— Ramana Maharshi</p>
      </div>
    </div>
  );
}
