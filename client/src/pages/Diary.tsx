import { useState, useEffect, useRef } from "react";
import { store, subscribe, type ReflectionWithAttachment, type FileAttachment } from "@/lib/localStore";
import { Link } from "wouter";
import { CONCEPTS } from "./Explore";
import { AttachmentPicker, AttachmentDisplay } from "@/components/AttachmentPicker";

// Opening prompts per concept — shown as soon as the user selects a concept
const OPENING_PROMPTS: Record<string, string> = {
  Maya:       "What does Maya mean to you right now — not as a concept, but as something you notice in your own experience?",
  Atman:      "When you turn attention toward the one who is reading this — what do you find? Start there.",
  Brahman:    "If Brahman is the ground of all being, what does that mean for the one asking this question?",
  Avidya:     "What is the one assumption about yourself that feels most solid, most certain — and what if that is Avidya?",
  Adhyasa:    "Where do you notice yourself superimposing a story onto something neutral today?",
  "Ajata Vada": "If nothing was ever truly born — what changes? What remains? Let this sit and write what arises.",
  General:    "What is the question that won't leave you alone right now? Start with that.",
};

function getOpeningPrompt(concept: string): string {
  return OPENING_PROMPTS[concept] || `What is alive in you around ${concept} today? Begin anywhere.`;
}

export default function Diary() {
  const [reflections, setReflections] = useState<ReflectionWithAttachment[]>(store.getReflections());
  const [content, setContent] = useState("");
  const [selectedConcept, setSelectedConcept] = useState("Maya");
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [saved, setSaved] = useState(false);

  // AI assistance state
  const [aiMessages, setAiMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(true);
  const aiEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribe(() => setReflections(store.getReflections())), []);

  // When concept changes, reset AI with an opening prompt
  useEffect(() => {
    setAiMessages([{ role: "ai", text: getOpeningPrompt(selectedConcept) }]);
  }, [selectedConcept]);

  // Auto-scroll AI messages
  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const askAi = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    const reply = await store.aiDiaryPrompt(selectedConcept, content);
    setAiMessages(prev => [...prev, { role: "ai", text: reply }]);
    setAiLoading(false);
  };

  const save = () => {
    if (!content.trim() && !attachment) return;
    store.addReflection(
      { content, concept: selectedConcept, userId: 1, createdAt: new Date().toISOString() },
      attachment ?? undefined
    );
    setContent("");
    setAttachment(null);
    setSaved(true);
    setAiMessages([{ role: "ai", text: getOpeningPrompt(selectedConcept) }]);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return iso; }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Reflection Diary</h1>
        <p className="text-sm text-muted-foreground">Your personal timeline of insights and contemplations.</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="font-serif text-sm font-semibold text-foreground">New Reflection</h2>
          <button
            onClick={() => setShowAi(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showAi ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <span>✨</span> AI Guide {showAi ? "on" : "off"}
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Concept selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Concept explored</label>
            <select value={selectedConcept} onChange={e => setSelectedConcept(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              data-testid="select-concept">
              {CONCEPTS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              <option value="General">General</option>
            </select>
          </div>

          {/* Reflection textarea with inline AI guidance */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your reflection</label>

            {/* AI opening prompt — shown above textarea, dismissable */}
            {showAi && aiMessages.length > 0 && (
              <div className="mb-2 px-3 py-2.5 rounded-lg bg-primary/8 border border-primary/20 flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] text-primary-foreground font-bold">AI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="space-y-1.5 max-h-28 overflow-y-auto" ref={aiEndRef}>
                    {aiMessages.map((msg, i) => (
                      <p key={i} className="text-xs font-serif italic text-foreground/90 leading-relaxed">
                        {msg.text}
                      </p>
                    ))}
                    {aiLoading && <p className="text-xs text-muted-foreground italic">reflecting…</p>}
                  </div>
                </div>
              </div>
            )}

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write here — let the question above guide you..."
              rows={6}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed"
              data-testid="textarea-reflection"
            />

            {/* Ask AI — inline below textarea */}
            {showAi && (
              <div className="flex items-center justify-end mt-1.5">
                <button
                  onClick={askAi}
                  disabled={aiLoading || content.length < 10}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/10 disabled:opacity-40 transition-colors"
                >
                  {aiLoading ? "⌛" : "✨"} Ask AI to go deeper
                </button>
              </div>
            )}
          </div>

          {/* Attachment */}
          <AttachmentPicker value={attachment} onChange={setAttachment} />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{content.length} characters</p>
            <button
              onClick={save}
              disabled={!content.trim() && !attachment}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
              data-testid="button-save-reflection"
            >
              Save Reflection
            </button>
          </div>
          {saved && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-lg text-xs text-green-700 dark:text-green-300">
              ✓ Reflection saved.
            </div>
          )}
        </div>
      </div>

      {/* Diary timeline */}
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
                {r.attachment && <AttachmentDisplay attachment={r.attachment} />}
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
