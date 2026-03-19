import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { store, subscribe } from "@/lib/localStore";
import type { Reflection } from "@shared/schema";
import { ThemeIcon } from "@/components/ThemeIcon";

const intents = [
  { href: "/explore",    icon: "explore"     as const, title: "Explore a Concept",  desc: "Browse Advaita concepts and dive into any topic with your AI companion." },
  { href: "/study-map",  icon: "study-map"   as const, title: "Work on Study Map",  desc: "Visualize how concepts connect — build your personal knowledge graph." },
  { href: "/read/maya",  icon: "read"        as const, title: "Read & Listen",       desc: "Dive into classical texts and curated videos on a concept." },
  { href: "/diary",      icon: "diary"       as const, title: "Write a Reflection",  desc: "Record your insights, questions, and contemplations in your diary." },
  { href: "/satsang",    icon: "satsang"     as const, title: "Join Satsang",        desc: "Engage in philosophical discussion with fellow seekers." },
  { href: "/insights",   icon: "insights"    as const, title: "Review Insights",     desc: "See patterns across your reflections and AI-generated insights." },
  { href: "/assessment", icon: "assessment"  as const, title: "Take Assessment",     desc: "Test your understanding with a focused quiz on a concept." },
  { href: "/go-deeper",  icon: "go-deeper"   as const, title: "Go Deeper",           desc: "Receive curated recommendations to advance your inquiry." },
];

const concepts = [
  "Maya", "Brahman", "Atman", "Avidya", "Vivartavada",
  "Pramana", "Advaita", "Jiva", "Turiya", "Nirguna",
  "Saguna", "Moksha", "Lila", "Samsara", "Karma",
  "Upanishads", "Bhashya", "Neti Neti", "Tat Tvam Asi", "Aham Brahmasmi",
];

export default function SessionLauncher() {
  const [reflections, setReflections] = useState<Reflection[]>(store.getReflections());
  useEffect(() => subscribe(() => setReflections(store.getReflections())), []);
  const lastReflection = reflections[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const filteredConcepts = searchQuery.trim().length > 0
    ? concepts.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
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
                  onClick={() => {
                    navigate(`/explore/${concept.toLowerCase()}`);
                    setSearchQuery("");
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  data-testid={`search-result-${concept.toLowerCase()}`}
                >
                  {concept}
                </button>
              ))}
            </div>
          )}
        </div>
        {lastReflection && (
          <div className="mt-4 p-4 ai-bubble rounded-lg">
            <p className="text-xs font-medium text-primary mb-1">Your last reflection — {lastReflection.concept}</p>
            <p className="text-sm text-foreground line-clamp-2">{lastReflection.content}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="mt-8 p-5 bg-card border border-border rounded-xl">
        <p className="text-xs font-medium text-primary mb-2 flex items-center gap-2"><span>✨</span> Today's Pointer</p>
        <p className="font-serif text-sm italic text-foreground">"The mind that inquires into the nature of the mind dissolves — this is the direct path."</p>
        <p className="text-xs text-muted-foreground mt-1">— Ramana Maharshi</p>
      </div>
    </div>
  );
}
