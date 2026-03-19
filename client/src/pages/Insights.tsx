import { useState, useEffect } from "react";
import { store, subscribe } from "@/lib/localStore";
import type { Reflection, QuizResult } from "@shared/schema";
import { Link } from "wouter";
import { CONCEPTS } from "./Explore";

const weeklyInsights = [
  { icon: "🔗", title: "Emerging pattern in your study", body: "Your reflections on Maya and Avidya are converging — you repeatedly return to the question of why illusion feels so compelling. This may be pointing toward a direct inquiry into desire and identification." },
  { icon: "🕉", title: "Active in Satsang this week", body: "The thread on Ajata Vada vs. Vivartavada has seen new posts. Your perspective on the 'levels of reality' would add depth to this discussion." },
  { icon: "📚", title: "Suggested next reading", body: "Based on your diary entries, you are ready for Panchadashi Chapter 1 — Tattvaviveka. It directly addresses the questions you have been circling." },
  { icon: "✨", title: "A pointer for your contemplation", body: "You have been studying carefully. The tradition suggests: put the books down for one sitting. Ask: 'Who is aware of this moment?' — not as a question to answer, but as a living inquiry." },
];

export default function Insights() {
  const [reflections, setReflections] = useState<Reflection[]>(store.getReflections());
  const [quizResults, setQuizResults] = useState<QuizResult[]>(store.getQuizResults());

  useEffect(() => subscribe(() => {
    setReflections(store.getReflections());
    setQuizResults(store.getQuizResults());
  }), []);

  const conceptFreq = reflections.reduce<Record<string, number>>((acc, r) => {
    acc[r.concept] = (acc[r.concept] || 0) + 1; return acc;
  }, {});
  const topConcepts = Object.entries(conceptFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((acc, q) => acc + (q.score / q.total) * 100, 0) / quizResults.length)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Insights</h1>
        <p className="text-sm text-muted-foreground">AI-generated patterns and suggestions from your study journey.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Reflections", value: reflections.length, icon: "📖" },
          { label: "Concepts explored", value: Object.keys(conceptFreq).length, icon: "🔍" },
          { label: "Avg quiz score", value: avgScore !== null ? `${avgScore}%` : "—", icon: "📝" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="font-serif text-xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {topConcepts.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <h2 className="font-serif text-base font-semibold mb-3 text-foreground">Most Reflected Upon</h2>
          <div className="space-y-2">
            {topConcepts.map(([name, count]) => {
              const concept = CONCEPTS.find(c => c.name === name);
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className={`text-sm font-medium w-24 flex-shrink-0 ${concept?.accent || "text-foreground"}`}>{name}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(count / (topConcepts[0]?.[1] || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">{count}×</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-serif text-base font-semibold text-foreground">This Week's Insights</h2>
        {weeklyInsights.map((insight, i) => (
          <div key={i} className="ai-bubble rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{insight.icon}</span>
              <div>
                <p className="text-xs font-semibold text-primary mb-1">{insight.title}</p>
                <p className="text-sm text-foreground leading-relaxed">{insight.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">Test your understanding?</p>
        <Link href="/assessment">
          <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">Take Assessment →</button>
        </Link>
      </div>
    </div>
  );
}
