import { Link } from "wouter";
import { useState, useEffect } from "react";
import { store, subscribe } from "@/lib/localStore";
import type { Reflection } from "@shared/schema";

const intents = [
  { href: "/explore", icon: "🔍", title: "Explore a Concept", desc: "Browse Advaita concepts and dive into any topic with your AI companion.", color: "border-primary/40 hover:border-primary" },
  { href: "/study-map", icon: "🗺", title: "Work on Study Map", desc: "Visualize how concepts connect — build your personal knowledge graph.", color: "border-secondary/60 hover:border-secondary" },
  { href: "/read/maya", icon: "📚", title: "Read & Listen", desc: "Dive into classical texts and curated videos on a concept.", color: "border-accent/40 hover:border-accent" },
  { href: "/diary", icon: "📖", title: "Write a Reflection", desc: "Record your insights, questions, and contemplations in your diary.", color: "border-primary/40 hover:border-primary" },
  { href: "/satsang", icon: "🕉", title: "Join Satsang", desc: "Engage in philosophical discussion with fellow seekers.", color: "border-secondary/60 hover:border-secondary" },
  { href: "/insights", icon: "✨", title: "Review Insights", desc: "See patterns across your reflections and AI-generated insights.", color: "border-accent/40 hover:border-accent" },
  { href: "/assessment", icon: "📝", title: "Take Assessment", desc: "Test your understanding with a focused quiz on a concept.", color: "border-primary/40 hover:border-primary" },
  { href: "/go-deeper", icon: "🌊", title: "Go Deeper", desc: "Receive curated recommendations to advance your inquiry.", color: "border-secondary/60 hover:border-secondary" },
];

export default function SessionLauncher() {
  const [reflections, setReflections] = useState<Reflection[]>(store.getReflections());
  useEffect(() => subscribe(() => setReflections(store.getReflections())), []);
  const lastReflection = reflections[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Welcome back, Seeker</h1>
        <p className="text-muted-foreground text-sm">What calls you today?</p>
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
            <div className={`p-5 bg-card border-2 ${intent.color} rounded-xl cursor-pointer transition-all hover:shadow-md group`}>
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5">{intent.icon}</span>
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
