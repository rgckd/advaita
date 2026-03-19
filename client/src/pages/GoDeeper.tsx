import { Link } from "wouter";
import { store } from "@/lib/localStore";
import { CONCEPTS } from "./Explore";

const paths = [
  {
    title: "Deepen: Brahman and the Mahavakyas",
    type: "study",
    icon: "📖",
    desc: "Study the four great sayings that point to the identity of Atman and Brahman. Explore how each comes from a different Upanishad and addresses a different angle.",
    action: "/read/brahman",
    actionLabel: "Read Texts",
    concept: "brahman",
    archiveSearch: "Mahavakyas Brahman Tat Tvam Asi",
  },
  {
    title: "Practice: Neti Neti Inquiry",
    type: "practice",
    icon: "🧘",
    desc: "Sit quietly for 15 minutes. With each thought, sensation, or perception, note: 'not this.' Continue until what remains is not something new — but the ever-present witness.",
    action: "/diary",
    actionLabel: "Write Reflection",
    concept: null,
    archiveSearch: "Neti Neti inquiry Atman",
  },
  {
    title: "Explore: Gaudapada's Mandukya Karika",
    type: "advanced",
    icon: "🔬",
    desc: "Ready to go deeper? Gaudapada's Mandukya Karika (pre-Shankara) is the most radical non-dual text in the tradition. Begin with the Alatasanti Prakarana.",
    action: "/explore/ajata-vada",
    actionLabel: "Explore Ajata Vada",
    concept: "ajata-vada",
    archiveSearch: "Gaudapada Mandukya Karika Ajata Vada",
  },
  {
    title: "Discuss: Is liberation an event or a recognition?",
    type: "satsang",
    icon: "🕉",
    desc: "Shankara and Ramana Maharshi have slightly different emphases. For one, liberation is the removal of Avidya; for the other, we were never bound. Explore this in Satsang.",
    action: "/satsang",
    actionLabel: "Join Satsang",
    concept: null,
    archiveSearch: "Moksha liberation Avidya Shankara",
  },
  {
    title: "Map: Connect Adhyasa to your new insights",
    type: "map",
    icon: "🗺",
    desc: "You have explored Maya and Avidya. Now add Adhyasa to your study map — see how it serves as the practical link between ignorance (Avidya) and suffering (Samsara).",
    action: "/study-map",
    actionLabel: "Open Study Map",
    concept: null,
    archiveSearch: "Adhyasa superimposition Maya Avidya",
  },
];

const typeColors: Record<string, string> = {
  study: "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800/40",
  practice: "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/40",
  advanced: "border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800/40",
  satsang: "border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800/40",
  map: "border-stone-200 bg-stone-50 dark:bg-stone-950/20 dark:border-stone-800/40",
};

export default function GoDeeper() {
  const quizResults = store.getQuizResults();
  const reflections = store.getReflections();

  const totalReflections = reflections.length;
  const lastQuiz = quizResults.length > 0 ? quizResults[quizResults.length - 1] : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Go Deeper</h1>
        <p className="text-sm text-muted-foreground">Curated next steps based on your inquiry journey.</p>
      </div>

      {/* Journey summary */}
      <div className="ai-bubble rounded-xl p-5 mb-8">
        <p className="text-xs font-medium text-primary mb-2">✨ Your AI Companion's Observation</p>
        <p className="text-sm text-foreground leading-relaxed">
          You have written {totalReflections} reflection{totalReflections !== 1 ? "s" : ""} and explored the core concepts of Advaita.
          {lastQuiz ? ` Your most recent assessment on ${lastQuiz.concept} scored ${lastQuiz.score}/${lastQuiz.total}.` : ""}
          {" "}The journey from Curiosity to Exploration is well underway. The next phase — genuine Manana (reflection without grasping) — is what awaits. The paths below are not prescriptions but invitations.
        </p>
      </div>

      {/* Recommended paths */}
      <div className="space-y-4">
        {paths.map((path, i) => (
          <div
            key={i}
            className={`border-2 rounded-xl overflow-hidden ${typeColors[path.type]}`}
            data-testid={`path-${i}`}
          >
            <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl flex-shrink-0">{path.icon}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-serif text-sm font-bold text-foreground leading-snug">{path.title}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground capitalize flex-shrink-0">{path.type}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mt-1.5">{path.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Link href={path.action}>
                  <button
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                    data-testid={`button-path-${i}`}
                  >
                    {path.actionLabel} →
                  </button>
                </Link>
                {path.concept && (
                  <Link href={`/explore/${path.concept}`}>
                    <span className="text-xs text-primary hover:underline cursor-pointer">Explore concept</span>
                  </Link>
                )}
                <a
                  href={`https://www.google.com/search?q=site:lists.advaita-vedanta.org+${encodeURIComponent(path.archiveSearch)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                >
                  📌 Advaita-L threads
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Community links */}
      <div className="mt-8 p-5 bg-card border border-border rounded-xl">
        <h2 className="font-serif text-sm font-semibold mb-3 text-foreground">External Resources</h2>
        <div className="space-y-2 text-sm">
          <a
            href="https://www.google.com/search?q=site:lists.advaita-vedanta.org+advaita-l+Advaita+Vedanta+Shankara"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
            data-testid="link-advaita-l"
          >
            📋 Search Advaita-L Archives (Google site search)
          </a>
          <a
            href="https://lists.advaita-vedanta.org/archives/advaita-l/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            🗂 Advaita-L Full Archive Index
          </a>
          <a
            href="https://www.vedantasociety-chicago.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
            data-testid="link-vedanta-society"
          >
            🏛 Vedanta Society — Study Resources
          </a>
        </div>
      </div>

      {/* Full circle */}
      <div className="mt-8 p-5 bg-primary/5 border border-primary/20 rounded-xl text-center">
        <p className="font-serif text-sm italic text-foreground mb-3">
          "The mind that is purified by inquiry naturally turns back on itself — and in that turning, finds what was never lost."
        </p>
        <Link href="/explore">
          <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity" data-testid="button-explore-again">
            ↺ Begin a New Exploration
          </button>
        </Link>
      </div>
    </div>
  );
}
