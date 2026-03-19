import { useState, useEffect } from "react";
import { store, subscribe } from "@/lib/localStore";
import type { Reflection } from "@shared/schema";
import { Link } from "wouter";
import { CONCEPTS } from "./Explore";

export default function Diary() {
  const [reflections, setReflections] = useState<Reflection[]>(store.getReflections());
  const [content, setContent] = useState("");
  const [selectedConcept, setSelectedConcept] = useState("Maya");
  const [saved, setSaved] = useState(false);

  useEffect(() => subscribe(() => setReflections(store.getReflections())), []);

  const save = () => {
    if (!content.trim()) return;
    store.addReflection({ content, concept: selectedConcept, userId: 1, createdAt: new Date().toISOString() });
    setContent("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return iso; }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Reflection Diary</h1>
        <p className="text-sm text-muted-foreground">Your personal timeline of insights and contemplations.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-border bg-muted/20">
          <h2 className="font-serif text-sm font-semibold text-foreground">New Reflection</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Concept explored</label>
            <select value={selectedConcept} onChange={e => setSelectedConcept(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              data-testid="select-concept">
              {CONCEPTS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your reflection</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="What did you explore? What questions arose? What feels closer to clarity?"
              rows={5}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed"
              data-testid="textarea-reflection" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{content.length} characters</p>
            <button onClick={save} disabled={!content.trim()}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              data-testid="button-save-reflection">
              Save Reflection
            </button>
          </div>
          {saved && <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-lg text-xs text-green-700 dark:text-green-300">✓ Reflection saved.</div>}
        </div>
      </div>

      <div>
        <h2 className="font-serif text-base font-semibold mb-4 text-foreground">Your Diary</h2>
        {reflections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-sm">Your diary is empty. Write your first reflection above.</p>
          </div>
        )}
        <div className="space-y-4 relative">
          {reflections.length > 0 && <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />}
          {reflections.map((r, i) => (
            <div key={r.id} className="flex gap-4 relative" data-testid={`reflection-${r.id}`}>
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary flex-shrink-0 flex items-center justify-center z-10">
                <span className="text-primary text-xs font-bold">{String.fromCharCode(65 + i)}</span>
              </div>
              <div className="flex-1 bg-card border border-border rounded-xl p-4 mb-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{r.concept}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex justify-between items-center pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">Share your insights with others?</p>
        <Link href="/satsang">
          <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity">Join Satsang →</button>
        </Link>
      </div>
    </div>
  );
}
