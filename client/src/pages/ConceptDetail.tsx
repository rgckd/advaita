import { useParams, Link, useLocation } from "wouter";
import { useState } from "react";
import { store } from "@/lib/localStore";
import { CONCEPTS } from "./Explore";

export default function ConceptDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const concept = CONCEPTS.find(c => c.id === id) || CONCEPTS[0];

  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: `Namaste. Let us explore ${concept.name} together. What draws you to this concept today? Do you have a specific question, or shall we begin with an overview?` }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setIsThinking(true);
    const reply = await store.aiChat(concept.name, userMsg);
    setIsThinking(false);
    setMessages(m => [...m, { role: "ai", text: reply }]);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/explore">
        <button className="text-sm text-muted-foreground hover:text-primary mb-6 flex items-center gap-1" data-testid="button-back-explore">
          ← Back to Explore
        </button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Concept content */}
        <div className="lg:col-span-3 space-y-4">
          <div className={`p-6 border-2 rounded-xl ${concept.color}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className={`font-serif text-2xl font-bold ${concept.accent}`}>{concept.name}</h1>
                <p className="text-muted-foreground text-sm">{concept.sanskrit} — {concept.tagline}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-background/60 border border-border text-muted-foreground">{concept.level}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{concept.summary}</p>
          </div>

          {/* Key ideas */}
          <div className="p-5 bg-card border border-border rounded-xl">
            <h2 className="font-serif text-base font-semibold mb-3">Key Ideas</h2>
            {keyIdeas[concept.id as keyof typeof keyIdeas]?.map((idea, i) => (
              <div key={i} className="flex gap-3 mb-3 last:mb-0">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-foreground leading-relaxed">{idea}</p>
              </div>
            ))}
          </div>

          {/* Related concepts */}
          <div className="p-5 bg-card border border-border rounded-xl">
            <h2 className="font-serif text-base font-semibold mb-3">Related Concepts</h2>
            <div className="flex flex-wrap gap-2">
              {concept.relatedTo.map(r => {
                const rel = CONCEPTS.find(c => c.name === r);
                return rel ? (
                  <Link key={r} href={`/explore/${rel.id}`}>
                    <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" data-testid={`link-related-${r}`}>{r}</span>
                  </Link>
                ) : (
                  <span key={r} className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-full border border-border">{r}</span>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 flex-wrap">
            <Link href={`/read/${concept.id}`}>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity" data-testid="button-read-listen">
                📚 Read & Listen
              </button>
            </Link>
            <Link href="/study-map">
              <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors" data-testid="button-add-to-map">
                🗺 Add to Study Map
              </button>
            </Link>
            <Link href="/assessment">
              <button className="px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-colors" data-testid="button-take-quiz">
                📝 Take Quiz
              </button>
            </Link>
          </div>
        </div>

        {/* AI Companion panel */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-card border border-border rounded-xl flex flex-col h-[480px]">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">AI Companion</span>
              <span className="text-xs text-muted-foreground ml-auto">calm • non-dogmatic</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`text-sm ${m.role === "ai" ? "ai-bubble rounded-lg p-3" : "bg-primary/10 border border-primary/20 rounded-lg p-3 ml-4"}`}>
                  {m.role === "ai" && <span className="text-xs font-medium text-primary block mb-1">AI Companion</span>}
                  <p className="leading-relaxed text-foreground">{m.text}</p>
                </div>
              ))}
              {isThinking && (
                <div className="ai-bubble rounded-lg p-3">
                  <span className="text-xs font-medium text-primary block mb-1">AI Companion</span>
                  <span className="text-muted-foreground text-sm">Reflecting...</span>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ask or reflect..."
                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                data-testid="input-chat"
              />
              <button
                onClick={sendMessage}
                disabled={isThinking || !input.trim()}
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                data-testid="button-send-chat"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const keyIdeas: Record<string, string[]> = {
  maya: [
    "Maya has two aspects: Avarana (the power to conceal Brahman) and Vikshepa (the power to project the world in its place).",
    "The three orders of reality: Paramarthika (absolute — Brahman alone), Vyavaharika (conventional — everyday world), Pratibhasika (apparent — dream/illusion).",
    "Maya is not a substance or a being — it is inexplicable (anirvacaniya): neither real (sat) nor unreal (asat).",
  ],
  atman: [
    "Atman is the witness-consciousness (Sakshi) — it does not act, does not perceive, but is the unchanging background in which all experience arises.",
    "The five sheaths (Pancha Kosha): Annamaya, Pranamaya, Manomaya, Vijnanamaya, Anandamaya — none of these is the Atman. The Atman is prior to all of them.",
    "Atman = Brahman: the individual self and the cosmic ground are not two. This is the central realization of Advaita.",
  ],
  brahman: [
    "Nirguna Brahman: attributeless, beyond all description, known only by negation — 'neti neti' (not this, not this).",
    "Saguna Brahman: Brahman as conceived with attributes, as Ishvara (God), for purposes of devotion and understanding — this is the practical gateway.",
    "The Mahavakyas (great sayings): 'Tat Tvam Asi', 'Aham Brahmasmi', 'Prajnanam Brahma', 'Ayam Atma Brahma'.",
  ],
  avidya: [
    "Avidya is beginningless (anaadi) — it has no traceable origin, for any origin would require time, and time itself arises within Avidya.",
    "Two powers: Avarana shakti (power of concealment) hides the true nature; Vikshepa shakti (power of projection) projects multiplicity in its place.",
    "The remedy is not more knowledge but direct knowledge (aparoksha jnana) — not about the self, but as the self.",
  ],
  adhyasa: [
    "Shankara opens the Brahma Sutra Bhashya with Adhyasa — it is the starting point and the problem to be resolved.",
    "The classic example: a rope mistaken for a snake. In darkness (Avidya), the rope (Atman) appears as a snake (ego/world). Light (Jnana) removes the snake, not by destroying it, but by revealing it was never there.",
    "Self-superimposition: we project 'I am the body', 'I am the mind' — this is the root error that Vedanta inquiry is designed to undo.",
  ],
  "ajata-vada": [
    "Gaudapada (Shankara's guru's guru) teaches in Mandukya Karika: there is no creation, no bondage, no seeker, no liberation — this is the highest truth (Paramartha).",
    "Four Prakaranas (chapters): Agama (on Mandukya), Vaitathya (unreality of duality), Advaita (non-duality), and Alatasanti (extinction of the firebrand).",
    "The firebrand analogy: spin a firebrand in the dark, it appears as a circle. The circle was never created and never existed — so too with the world.",
  ],
};
