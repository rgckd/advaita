import { useState } from "react";
import { store } from "@/lib/localStore";
import { Link } from "wouter";

const QUIZZES: Record<string, { q: string; opts: string[]; answer: number; explain: string }[]> = {
  Maya: [
    { q: "According to Advaita, Maya is best described as:", opts: ["Complete unreality — the world does not exist at all", "The inexplicable power that makes Brahman appear as the world", "A physical substance that creates the universe", "An evil force that must be destroyed"], answer: 1, explain: "Maya is anirvacaniya — inexplicable — neither absolutely real nor absolutely unreal. It is Brahman's own creative and concealing power." },
    { q: "Shankara's term for the mechanism by which we mistake Atman for ego and body is:", opts: ["Viveka", "Vairagya", "Adhyasa", "Moksha"], answer: 2, explain: "Adhyasa (superimposition) is the root error — projecting the properties of the not-self onto the Self, like mistaking a rope for a snake." },
    { q: "The three orders of reality in Advaita are:", opts: ["Body, mind, and spirit", "Paramarthika, Vyavaharika, and Pratibhasika", "Past, present, and future", "Waking, dream, and deep sleep"], answer: 1, explain: "Paramarthika (absolute — Brahman alone), Vyavaharika (conventional — everyday world), Pratibhasika (apparent — as in dreams or illusions)." },
  ],
  Atman: [
    { q: "The Atman in Advaita is identified with:", opts: ["The individual ego", "Brahman, the universal consciousness", "The physical body", "The intellect (buddhi)"], answer: 1, explain: "The central equation of Advaita: Atman = Brahman. The individual self, when truly known, is not different from the absolute ground of existence." },
    { q: "Which Upanishad states 'Aham Brahmasmi' (I am Brahman)?", opts: ["Mandukya Upanishad", "Chandogya Upanishad", "Brihadaranyaka Upanishad", "Kena Upanishad"], answer: 2, explain: "Aham Brahmasmi appears in the Brihadaranyaka Upanishad (1.4.10). It is one of the four Mahavakyas (great sayings)." },
    { q: "The five sheaths (Pancha Kosha) covering the Atman are, from gross to subtle:", opts: ["Anna, Prana, Mano, Vijnana, Ananda", "Waking, Dream, Sleep, Turiya, Beyond", "Sat, Chit, Ananda, Maya, Jiva", "Body, Breath, Mind, Intellect, Bliss are the same order"], answer: 0, explain: "Annamaya (food/body), Pranamaya (vital energy), Manomaya (mind), Vijnanamaya (intellect), Anandamaya (bliss) — the Atman is beyond all five." },
  ],
  Brahman: [
    { q: "Nirguna Brahman refers to:", opts: ["Brahman with attributes, as personal God", "Brahman as formless, attributeless absolute reality", "The highest state of meditation", "The creator aspect of the trinity"], answer: 1, explain: "Nirguna (nir = without, guna = quality) Brahman is the pure, undifferentiated absolute — beyond all qualities, description, and relation." },
    { q: "The Mahavakya 'Tat Tvam Asi' translates as:", opts: ["I am Brahman", "Consciousness is Brahman", "That thou art", "This self is Brahman"], answer: 2, explain: "Tat Tvam Asi from Chandogya Upanishad: Tat = That (Brahman), Tvam = Thou (Atman), Asi = Art. 'That thou art' — pointing to the identity of individual and universal." },
  ],
  Avidya: [
    { q: "The two powers of Avidya are:", opts: ["Creation and destruction", "Avarana (concealing) and Vikshepa (projecting)", "Attraction and repulsion", "Bondage and liberation"], answer: 1, explain: "Avarana shakti hides the true nature (Brahman), and Vikshepa shakti projects the apparent multiplicity in its place — like darkness hiding a rope and projecting a snake." },
    { q: "Avidya is said to be 'anaadi' meaning:", opts: ["Eternal and indestructible", "Without cause or beginning (beginningless)", "Caused by past life karma", "A product of the mind"], answer: 1, explain: "Avidya is beginningless (anaadi) — it has no traceable origin, because to find an origin would require existing in time, and time itself appears within Avidya." },
  ],
};

export default function Assessment() {
  const [selectedConcept, setSelectedConcept] = useState("Maya");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [done, setDone] = useState(false);

  const questions = QUIZZES[selectedConcept] || QUIZZES["Maya"];

  const score = answers.filter((a, i) => a === questions[i]?.answer).length;

  const next = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setDone(true);
      const sc = newAnswers.filter((a, i) => a === questions[i]?.answer).length;
      store.addQuizResult({
        concept: selectedConcept,
        score: sc,
        total: questions.length,
        userId: 1,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const reset = () => {
    setStarted(false); setCurrent(0); setSelected(null); setAnswers([]); setDone(false);
  };

  const pct = Math.round((score / questions.length) * 100);
  const feedback = pct === 100 ? "Excellent! A very clear understanding." : pct >= 66 ? "Good grasp — a few areas to revisit." : "Keep exploring — this is a deep inquiry.";

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Assessment</h1>
          <p className="text-sm text-muted-foreground">Test your understanding of Advaita concepts.</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Choose a concept to assess</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(QUIZZES).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedConcept(c)}
                  className={`px-4 py-3 text-sm rounded-lg border-2 text-left transition-all ${selectedConcept === c ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
                  data-testid={`button-concept-${c}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            <strong className="text-foreground">{questions.length} questions</strong> · Multiple choice · Explanation after each answer
          </div>
          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
            data-testid="button-start-assessment"
          >
            Begin Assessment — {selectedConcept}
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">{pct === 100 ? "🌟" : pct >= 66 ? "✨" : "🕉"}</div>
          <h2 className="font-serif text-xl font-bold text-foreground mb-1">{feedback}</h2>
          <p className="text-muted-foreground text-sm mb-4">{score} of {questions.length} correct · {pct}%</p>
          <div className="bg-muted rounded-full h-2.5 mb-6 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          {/* Review */}
          <div className="text-left space-y-3 mb-8">
            {questions.map((q, i) => {
              const correct = answers[i] === q.answer;
              return (
                <div key={i} className={`p-4 rounded-xl border ${correct ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/40" : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/40"}`} data-testid={`result-${i}`}>
                  <p className="text-xs font-medium text-foreground mb-1">{correct ? "✓" : "✗"} {q.q}</p>
                  <p className="text-xs text-muted-foreground">{q.explain}</p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="px-5 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80" data-testid="button-retake">Try Again</button>
            <Link href="/go-deeper">
              <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity" data-testid="button-go-deeper">Go Deeper →</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-lg font-bold text-foreground">{selectedConcept} Assessment</h1>
          <p className="text-xs text-muted-foreground">Question {current + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">{Math.round(((current) / questions.length) * 100)}%</div>
          <div className="w-32 bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="font-serif text-base font-semibold text-foreground leading-snug">{q.q}</h2>
        <div className="space-y-2">
          {q.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all ${selected === i ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-foreground hover:border-primary/40"}`}
              data-testid={`option-${i}`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          ))}
        </div>
        <button
          onClick={next}
          disabled={selected === null}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
          data-testid="button-next-question"
        >
          {current < questions.length - 1 ? "Next →" : "See Results"}
        </button>
      </div>
    </div>
  );
}
