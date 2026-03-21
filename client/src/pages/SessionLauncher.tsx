import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { store, subscribe, LEVELS, type SeekerLevel } from "@/lib/localStore";
import type { ReflectionWithAttachment } from "@/lib/localStore";
import { ThemeIcon } from "@/components/ThemeIcon";
import { LevelCard } from "@/components/SeekerBadge";

// Level-differentiated descriptions for each intent card
type IntentDesc = Record<SeekerLevel, string>;
const intents: {
  href: string;
  icon: "explore" | "study-map" | "read" | "diary" | "assessment" | "satsang";
  title: string;
  desc: IntentDesc;
}[] = [
  {
    href: "/explore", icon: "explore", title: "Explore",
    desc: {
      jijnasu:  "Discover what Advaita Vedanta is — explore key concepts like Maya, Atman, Brahman with your AI companion.",
      sadhaka:  "Deepen your engagement with primary texts and Shankara's commentaries on each concept.",
      mumukshu: "Engage with Brahma Sutras, Mandukya Karika, and advanced prakarana granthas through direct inquiry.",
    },
  },
  {
    href: "/study-map", icon: "study-map", title: "Study Maps",
    desc: {
      jijnasu:  "See how foundational concepts like Brahman, Atman, and Maya connect — build your first knowledge graph.",
      sadhaka:  "Map relationships across Vivekachudamani, Panchadashi, and the Upanishads you are studying.",
      mumukshu: "Navigate the advanced conceptual terrain — Brahma Sutras, Ajata Vada, and the Bhashya literature.",
    },
  },
  {
    href: "/self-study", icon: "read", title: "Self-study",
    desc: {
      jijnasu:  "Curated introductory texts, Swami Sarvapriyananda lectures, and upload your own materials.",
      sadhaka:  "Primary texts with Shankara Bhashya, Panchadashi chapters, and Upanishad commentaries.",
      mumukshu: "Brahma Sutras, Naishkarmya Siddhi, Vichara Sagara — with cross-referencing across the tradition.",
    },
  },
  {
    href: "/diary", icon: "diary", title: "Reflection",
    desc: {
      jijnasu:  "Write about what you are discovering. The AI companion helps you go deeper into each concept.",
      sadhaka:  "Capture your understanding of the texts. The AI prompts you with questions a guru might ask.",
      mumukshu: "Record the subtlest insights. The AI engages with the precision the advanced texts demand.",
    },
  },
  {
    href: "/assessment", icon: "assessment", title: "Assessment",
    desc: {
      jijnasu:  "Test your understanding of introductory concepts. Score ≥75% to advance to Sādhaka.",
      sadhaka:  "Assess your grasp of Bhashya texts, the Upanishads, and Shankara's methodology.",
      mumukshu: "Deep assessment across Brahma Sutras, Ajata Vada, and advanced Advaita literature.",
    },
  },
  {
    href: "/satsang", icon: "satsang", title: "Satsang",
    desc: {
      jijnasu:  "Ask questions, explore doubts, and discuss foundational concepts with fellow seekers.",
      sadhaka:  "Engage in deeper philosophical dialogue on texts and their interpretations.",
      mumukshu: "Discuss the subtlest points of Advaita — reconcile apparent contradictions across the tradition.",
    },
  },
];

const concepts = [
  "Maya", "Brahman", "Atman", "Avidya", "Vivartavada",
  "Pramana", "Advaita", "Jiva", "Turiya", "Nirguna",
  "Saguna", "Moksha", "Lila", "Samsara", "Karma",
  "Upanishads", "Bhashya", "Neti Neti", "Tat Tvam Asi", "Aham Brahmasmi",
];

const LEARNING_PATH = [
  { step: 1, label: "Explore concepts",       href: "/explore",    desc: "Start with curiosity — any concept, any question." },
  { step: 2, label: "Build your Study Map",    href: "/study-map",  desc: "See how concepts connect. Build your own knowledge graph." },
  { step: 3, label: "Study texts & videos",    href: "/self-study", desc: "Engage with primary sources at your level. Upload your own materials." },
  { step: 4, label: "Reflect in your Diary",   href: "/diary",      desc: "Write with AI guidance. Capture what lands." },
  { step: 5, label: "Discuss in Satsang",      href: "/satsang",    desc: "Test your understanding through dialogue." },
  { step: 6, label: "Take an Assessment",      href: "/assessment", desc: "Know where you are. Advance your level." },
];

export default function SessionLauncher() {
  const [reflections, setReflections] = useState<ReflectionWithAttachment[]>(store.getReflections());
  const [seekerLevel, setSeekerLevel] = useState<SeekerLevel>(store.getLevel());
  const [showIntro, setShowIntro] = useState(true);
  const [showPath, setShowPath] = useState(false);

  useEffect(() => subscribe(() => {
    setReflections(store.getReflections());
    setSeekerLevel(store.getLevel());
  }), []);

  const lastReflection = reflections[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const filteredConcepts = searchQuery.trim().length > 0
    ? concepts.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const levelInfo = LEVELS.find(l => l.id === seekerLevel)!;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

      {/* Advaita + levels intro — dismissable */}
      {showIntro && (
        <div className="mb-6 bg-card border border-primary/20 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 bg-primary/5 flex items-start justify-between gap-3">
            <div>
              <p className="font-serif text-sm font-semibold text-foreground">Welcome to adv.ai.ta</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your AI companion for Advaita Vedanta</p>
            </div>
            <button onClick={() => setShowIntro(false)} className="text-muted-foreground hover:text-foreground text-sm flex-shrink-0">✕</button>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm text-foreground leading-relaxed">
            <p>
              <strong>Advaita Vedanta</strong> is the ancient non-dual philosophy of India — the teaching that the individual self (Ātman) and ultimate reality (Brahman) are not two separate things, but one undivided consciousness. This is the central insight of <strong>Adi Shankaracharya</strong> (8th century CE).
            </p>
            {/* Level explanations */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LEVELS.map((l, i) => (
                <div key={l.id} className={`rounded-lg p-3 border ${seekerLevel === l.id ? "border-primary/50 bg-primary/5" : "border-border bg-muted/20"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {i < 2 && <span className="text-[10px] text-muted-foreground">{"→".repeat(i)}</span>}
                    <span className="font-serif text-xs font-bold text-foreground">{l.roman}</span>
                    <span className="text-xs text-muted-foreground">({l.label})</span>
                    {seekerLevel === l.id && <span className="ml-auto text-[10px] text-primary font-bold">← You</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{l.description.split("—")[1]?.trim() || l.description}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Your level advances through <Link href="/assessment"><span className="text-primary underline cursor-pointer">assessments</span></Link>. Content across Explore, Study Maps, Self-study, and Reflection is tailored to your current level — you can always choose to view any level.
            </p>
          </div>
        </div>
      )}

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Welcome back, Seeker</h1>
        <p className="text-muted-foreground text-sm">What calls you today?</p>

        {/* Search */}
        <div className="relative mt-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none">🔍</span>
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
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
                <button key={concept} onClick={() => { navigate(`/explore/${concept.toLowerCase()}`); setSearchQuery(""); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  data-testid={`search-result-${concept.toLowerCase()}`}
                >{concept}</button>
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

      {/* Level card */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your level</p>
          <Link href="/assessment"><button className="text-xs text-primary hover:underline">Take assessment →</button></Link>
        </div>
        <LevelCard />
      </div>

      {/* Intent cards — level-differentiated descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {intents.map(intent => (
          <Link key={intent.href} href={intent.href}>
            <div className="p-5 bg-card border border-border rounded-xl cursor-pointer transition-all hover:shadow-md hover:border-primary/40 group">
              <div className="flex items-start gap-4">
                <ThemeIcon name={intent.icon} size="sm" />
                <div>
                  <h3 className="font-serif text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{intent.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{intent.desc[seekerLevel]}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Learning path accordion */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
        <button onClick={() => setShowPath(p => !p)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors">
          <div>
            <p className="text-sm font-semibold text-foreground">The learning path</p>
            <p className="text-xs text-muted-foreground mt-0.5">Guided by a guru, step by step — from curiosity to realization</p>
          </div>
          <span className="text-muted-foreground text-lg">{showPath ? "▲" : "▼"}</span>
        </button>
        {showPath && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex gap-3 flex-wrap mb-4">
              {LEVELS.map((l, i) => (
                <div key={l.id} className="flex items-center gap-2">
                  {i > 0 && <span className="text-muted-foreground text-xs">→</span>}
                  <Link href="/assessment">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border cursor-pointer transition-colors ${
                      l.id === seekerLevel ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"
                    }`}>{l.roman}</span>
                  </Link>
                </div>
              ))}
            </div>
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
            <p className="text-xs text-muted-foreground italic pt-1">At every step, the AI companion serves as your guru-guide — asking, reflecting, pointing.</p>
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
