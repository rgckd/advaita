/**
 * Assessment — level-aware quiz.
 * Users can assess within their current level or attempt a higher-level test.
 * Scores update the seeker level automatically.
 */
import { useState, useEffect } from "react";
import { store, subscribe, LEVELS, type SeekerLevel } from "@/lib/localStore";
import { Link } from "wouter";
import { LevelCard } from "@/components/SeekerBadge";

// ── Questions tagged by level ─────────────────────────────────────────────────
type Question = { q: string; opts: string[]; answer: number; explain: string; level: SeekerLevel; topic: string };

const ALL_QUESTIONS: Question[] = [
  // ── Jijñāsu ──────────────────────────────────────────────────────────────
  { level: "jijnasu", topic: "Maya",
    q: "Maya in Advaita Vedanta is best described as:",
    opts: ["Complete unreality — the world does not exist", "The inexplicable power by which Brahman appears as the world", "A physical substance that creates the universe", "An evil force to be destroyed"],
    answer: 1, explain: "Maya is anirvacaniya — inexplicable — neither absolutely real nor absolutely unreal. It is Brahman's own creative and concealing power." },

  { level: "jijnasu", topic: "Atman",
    q: "The Atman in Advaita is identified with:",
    opts: ["The individual ego and personality", "Brahman, the universal consciousness", "The physical body", "The intellect (buddhi)"],
    answer: 1, explain: "The central equation of Advaita: Atman = Brahman. The individual self, when truly known, is not different from the absolute ground of existence." },

  { level: "jijnasu", topic: "Mahavakyas",
    q: "'Tat Tvam Asi' translates as:",
    opts: ["I am Brahman", "Consciousness is Brahman", "That thou art", "This self is Brahman"],
    answer: 2, explain: "Tat = That (Brahman), Tvam = Thou (Atman), Asi = Art. From Chandogya Upanishad — pointing to the identity of individual self and universal reality." },

  { level: "jijnasu", topic: "Sad Darshanas",
    q: "Which of the following is NOT one of the six classical Indian philosophical schools (Sad Darshanas)?",
    opts: ["Nyaya", "Buddhism", "Vedanta", "Mimamsa"],
    answer: 1, explain: "Buddhism (and Jainism) are considered nastika (heterodox) schools as they do not accept Vedic authority. The six astika darshanas are: Nyaya, Vaisheshika, Samkhya, Yoga, Mimamsa, Vedanta." },

  { level: "jijnasu", topic: "Moksha",
    q: "In Advaita, Moksha (liberation) is:",
    opts: ["A future state to be achieved after death", "The recognition of one's already-existing nature as Brahman", "A reward for good karma", "A merger of the soul into a personal God"],
    answer: 1, explain: "Moksha in Advaita is not an event in time — it is the removal of the ignorance that conceals the ever-present reality: 'I am Brahman'. Liberation is recognition, not achievement." },

  // ── Sādhaka ───────────────────────────────────────────────────────────────
  { level: "sadhaka", topic: "Adhyasa",
    q: "Shankara's term for the error by which we mistake the Atman for the ego-body complex is:",
    opts: ["Viveka", "Vairagya", "Adhyasa", "Apavada"],
    answer: 2, explain: "Adhyasa (superimposition) is the root error — projecting the properties of the not-self onto the Self, like mistaking a rope for a snake in dim light." },

  { level: "sadhaka", topic: "Three Realities",
    q: "The three orders of reality in Advaita (tri-vidha satta) are:",
    opts: ["Body, mind, spirit", "Paramarthika, Vyavaharika, Pratibhasika", "Waking, dream, deep sleep", "Saguna, Nirguna, Maya"],
    answer: 1, explain: "Paramarthika (absolute — Brahman alone is real), Vyavaharika (conventional — everyday transactional world), Pratibhasika (apparent — dreams, illusions). Each lower order vanishes on recognition of the higher." },

  { level: "sadhaka", topic: "Panchadashi",
    q: "The Panchadashi was composed by:",
    opts: ["Adi Shankaracharya", "Ramana Maharshi", "Vidyaranya Swami", "Gaudapada"],
    answer: 2, explain: "Panchadashi ('fifteen chapters') is the work of Vidyaranya Swami (14th century), a systematic exposition of Advaita in fifteen prakaranas covering topics from discrimination to meditation." },

  { level: "sadhaka", topic: "Mandukya",
    q: "The fourth state (Turiya) in the Mandukya Upanishad is:",
    opts: ["A deep dreamless sleep state", "The state of pure witnessing consciousness that pervades and underlies the other three", "A high meditative state to be achieved", "The state experienced during near-death"],
    answer: 1, explain: "Turiya is not a fourth sequential state — it is the witnessing awareness that is always present. It is the substratum of jagrat (waking), svapna (dream), and sushupti (deep sleep)." },

  { level: "sadhaka", topic: "Sadhana Chatushtaya",
    q: "The four qualifications (Sadhana Chatushtaya) for Vedantic inquiry are:",
    opts: ["Faith, devotion, prayer, surrender", "Discrimination, dispassion, six virtues, desire for liberation", "Study, reflection, meditation, silence", "Yama, niyama, asana, pranayama"],
    answer: 1, explain: "Viveka (discrimination), Vairagya (dispassion), Shat-sampat (six virtues: shama, dama, uparati, titiksha, shraddha, samadhana), and Mumukshutva (burning desire for liberation) — as given in Vivekachudamani v.17-30." },

  // ── Mumukṣu ───────────────────────────────────────────────────────────────
  { level: "mumukshu", topic: "Brahma Sutras",
    q: "The first sutra 'Athato Brahma Jijnasa' (Now, therefore, the inquiry into Brahman) implies 'now' refers to:",
    opts: ["The start of morning prayers", "The attainment of the four prerequisites for inquiry (Sadhana Chatushtaya)", "After completing all karma yoga", "Upon receiving initiation from a guru"],
    answer: 1, explain: "Shankara's bhashya on BS I.1.1: 'now' (atha) signals that inquiry proceeds after the fourfold qualification — discrimination, dispassion, the six virtues, and burning desire for liberation." },

  { level: "mumukshu", topic: "Ajata Vada",
    q: "Gaudapada's Ajata Vada asserts:",
    opts: ["Creation is real but temporary", "The world was created by Maya and will dissolve at Pralaya", "Nothing is ever born — neither the world nor the Jiva — absolute non-origination", "Brahman creates through Ishvara and withdraws through time"],
    answer: 2, explain: "Ajata Vada (doctrine of non-origination) from Mandukya Karika: 'There is no dissolution, no birth... this is the absolute truth.' Gaudapada goes beyond Shankara's Vivartavada, denying even apparent creation." },

  { level: "mumukshu", topic: "Naishkarmya Siddhi",
    q: "Suresvara's Naishkarmya Siddhi argues primarily that:",
    opts: ["Karma yoga alone can lead to liberation", "Knowledge (jnana) is the sole and direct means to liberation, independent of action", "Meditation is superior to textual study", "Bhakti is the highest path in Kali Yuga"],
    answer: 1, explain: "Naishkarmya Siddhi ('Accomplishment of Actionlessness') by Suresvara — Shankara's direct disciple — establishes that only Self-knowledge directly removes ignorance. Action, however pure, cannot produce the result of liberation." },

  { level: "mumukshu", topic: "Drk Drishya Viveka",
    q: "In Drk Drishya Viveka, the discrimination between seer (drk) and seen (drishya) ultimately resolves in:",
    opts: ["The seer remaining as witness, separate from all objects", "The recognition that the witness-consciousness (Sakshi) is itself Brahman and not a separate entity", "Pure emptiness with no witness and no seen", "The merger of individual consciousness into cosmic mind"],
    answer: 1, explain: "Drk Drishya Viveka traces the seer-seen discrimination through gross and subtle levels, arriving at the Sakshi (pure witness). The final resolution: even the witness-position dissolves into the recognition that pure consciousness is Brahman alone — there is no separate 'seer'." },
];

export default function Assessment() {
  const [currentLevel, setCurrentLevel] = useState(store.getLevel());
  const [testLevel, setTestLevel] = useState<SeekerLevel>(store.getLevel());
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [done, setDone] = useState(false);
  const [newLevel, setNewLevel] = useState<SeekerLevel | null>(null);

  useEffect(() => subscribe(() => setCurrentLevel(store.getLevel())), []);

  const questions = ALL_QUESTIONS.filter(q => q.level === testLevel);
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
      store.addQuizResult({ concept: testLevel, score: sc, total: questions.length, userId: 1, createdAt: new Date().toISOString() });
      const promoted = store.recalcLevelFromQuiz(sc, questions.length);
      if (promoted !== currentLevel) setNewLevel(promoted);
    }
  };

  const reset = () => {
    setStarted(false); setCurrent(0); setSelected(null); setAnswers([]); setDone(false); setNewLevel(null);
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const levelInfo = LEVELS.find(l => l.id === testLevel)!;

  // ── Setup screen ─────────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Assessment</h1>
          <p className="text-sm text-muted-foreground">Test your understanding and determine your level on the path.</p>
        </div>

        {/* Current level card */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your current level</p>
          <LevelCard />
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Choose assessment level</label>
            <div className="space-y-2">
              {LEVELS.map(l => {
                const qs = ALL_QUESTIONS.filter(q => q.level === l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => setTestLevel(l.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                      testLevel === l.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                    data-testid={`button-level-${l.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-serif text-sm font-semibold text-foreground">{l.roman}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{l.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{qs.length} questions</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{l.description.split('—')[0].trim()}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            <strong className="text-foreground">{ALL_QUESTIONS.filter(q => q.level === testLevel).length} questions</strong> · Multiple choice · 
            Explanations after each · Score ≥75% to advance level
          </div>
          <button
            onClick={() => setStarted(true)}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
            data-testid="button-start-assessment"
          >
            Begin {levelInfo.roman} Assessment
          </button>
        </div>
      </div>
    );
  }

  // ── Results screen ────────────────────────────────────────────────────────
  if (done) {
    const feedbackMsg = pct === 100 ? "Masterful clarity." : pct >= 75 ? "Strong understanding — well done." : pct >= 40 ? "Good foundation — keep inquiring." : "Keep exploring — this is a deep path.";
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{pct >= 75 ? "🌟" : pct >= 40 ? "✨" : "🕉"}</div>
            <h2 className="font-serif text-xl font-bold text-foreground mb-1">{feedbackMsg}</h2>
            <p className="text-muted-foreground text-sm">{score} of {questions.length} correct · {pct}%</p>
            <div className="bg-muted rounded-full h-2.5 mt-3 mb-1 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Level change notification */}
          {newLevel && newLevel !== currentLevel && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-xl text-center">
              <p className="text-sm font-semibold text-primary mb-1">🎉 Level advanced!</p>
              <p className="text-xs text-muted-foreground">
                You have moved from <strong>{LEVELS.find(l => l.id === currentLevel)?.roman}</strong> to{" "}
                <strong>{LEVELS.find(l => l.id === newLevel)?.roman}</strong>
              </p>
            </div>
          )}

          {/* Review */}
          <div className="space-y-3 mb-6">
            {questions.map((q, i) => {
              const correct = answers[i] === q.answer;
              return (
                <div key={i} className={`p-4 rounded-xl border ${correct ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/40" : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800/40"}`} data-testid={`result-${i}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-medium text-foreground">{correct ? "✓" : "✗"} {q.q}</p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{q.topic}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{q.explain}</p>
                </div>
              );
            })}
          </div>

          {/* Updated level */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your level</p>
            <LevelCard />
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={reset} className="px-5 py-2 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80" data-testid="button-retake">Try Again</button>
            <Link href="/self-study">
              <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity" data-testid="button-go-deeper">Continue Studying →</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz in progress ─────────────────────────────────────────────────────
  const q = questions[current];
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-serif text-lg font-bold text-foreground">{levelInfo.roman} Assessment</h1>
            <span className="text-xs text-muted-foreground">· {q.topic}</span>
          </div>
          <p className="text-xs text-muted-foreground">Question {current + 1} of {questions.length}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">{Math.round((current / questions.length) * 100)}%</div>
          <div className="w-28 sm:w-32 bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-5">
        <h2 className="font-serif text-base font-semibold text-foreground leading-snug">{q.q}</h2>
        <div className="space-y-2">
          {q.opts.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                selected === i ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-foreground hover:border-primary/40"
              }`}
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
