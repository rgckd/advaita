import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { store, subscribe, LEVELS } from "@/lib/localStore";

// Curated archive threads per concept (same set as MediaModal)
const ARCHIVE_THREADS: Record<string, { subject: string; url: string; preview: string }[]> = {
  maya: [
    { subject: "Maya and the three levels of reality", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2016-January/040130.html", preview: "The distinction between Paramarthika, Vyavaharika and Pratibhasika satta..." },
    { subject: "Is Maya real or unreal?", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2012-March/031277.html", preview: "Shankara says Maya is anirvachaniya — indescribable, neither sat nor asat..." },
  ],
  atman: [
    { subject: "The nature of the Atman as Sakshi", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2014-February/036234.html", preview: "Atman as pure witness — not an experiencer, not an agent..." },
  ],
  brahman: [
    { subject: "Nirguna and Saguna Brahman", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2015-June/038912.html", preview: "The apparent contradiction between Nirguna Brahman as the absolute and Saguna Brahman as Ishvara..." },
    { subject: "Tat Tvam Asi — mahavakya inquiry", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2017-April/044891.html", preview: "The identity statement requires jahadajahallakshana to avoid logical contradiction..." },
  ],
  avidya: [
    { subject: "Avidya and its locus", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2013-September/035456.html", preview: "The question of whether Avidya resides in the Jiva or Brahman..." },
  ],
  adhyasa: [
    { subject: "Adhyasa Bhashya — Shankara's preamble", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2009-January/021234.html", preview: "The entire Brahma Sutra commentary rests on the analysis of superimposition..." },
  ],
};

/** Inline archive search used when query doesn't match any known concept */
function ArchiveSearch({ query }: { query: string }) {
  const [results, setResults] = useState<{ subject: string; url: string; snippet: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim() || query.length < 3) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setSearched(query);
      const key = query.toLowerCase().replace(/ /g, "-");
      // First check curated threads
      const curated = ARCHIVE_THREADS[key] || ARCHIVE_THREADS[query.toLowerCase()];
      if (curated) {
        setResults(curated.map(t => ({ subject: t.subject, url: t.url, snippet: t.preview })));
        setLoading(false);
        return;
      }
      // Otherwise fetch via CORS proxy
      const searchUrl = `https://www.google.com/search?q=site:lists.advaita-vedanta.org+advaita-l+${encodeURIComponent(query)}`;
      fetch(`https://corsproxy.io/?${encodeURIComponent(searchUrl)}`)
        .then(r => r.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const anchors = Array.from(doc.querySelectorAll("a[href]")) as HTMLAnchorElement[];
          const links = anchors
            .map(a => ({ url: decodeURIComponent(a.href.replace(/^\/url\?q=/, "").split("&")[0]), subject: a.textContent?.trim() || "" }))
            .filter(r => r.url.startsWith("https://lists.advaita-vedanta.org") && r.url.endsWith(".html") && r.subject.length > 5)
            .slice(0, 6);
          setResults(links.map(l => ({ ...l, snippet: "" })));
          if (links.length === 0) setResults([{ subject: "No results found in archive for this query.", url: "", snippet: "" }]);
          setLoading(false);
        })
        .catch(() => {
          setResults([{ subject: "Could not reach archive. Try again.", url: "", snippet: "" }]);
          setLoading(false);
        });
    }, 600);
  }, [query]);

  if (!query.trim() || query.length < 3) return null;

  return (
    <div className="mt-2 bg-card border border-primary/20 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
        <p className="text-xs font-semibold text-primary">📚 Advaita-L Archive results for “{query}”</p>
        {loading && <span className="text-xs text-muted-foreground">Searching…</span>}
      </div>
      <div className="divide-y divide-border">
        {results.map((r, i) => (
          r.url ? (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 hover:bg-primary/5 transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{r.subject}</p>
                {r.snippet && <p className="text-xs text-muted-foreground/80 italic mt-0.5 line-clamp-1">{r.snippet}</p>}
              </div>
              <span className="text-xs text-primary/50 flex-shrink-0 pt-0.5">↗</span>
            </a>
          ) : (
            <p key={i} className="px-4 py-3 text-xs text-muted-foreground">{r.subject}</p>
          )
        ))}
        {!loading && results.length === 0 && (
          <p className="px-4 py-3 text-xs text-muted-foreground">Searching archive…</p>
        )}
      </div>
      <div className="px-4 py-2 border-t border-border/50">
        <a href={`https://www.google.com/search?q=site:lists.advaita-vedanta.org+advaita-l+${encodeURIComponent(query)}`}
          target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-primary/60 hover:text-primary transition-colors">
          Open full search in browser ↗
        </a>
      </div>
    </div>
  );
}

// Map concept levels (Foundation/Intermediate/Advanced) to seeker level labels
const LEVEL_LABELS: Record<string, string> = {
  "Foundation":   "Jijñāsu",
  "Intermediate": "Sādhaka",
  "Advanced":     "Mumukṣu",
  "All":          "All",
};

export const CONCEPTS = [
  {
    id: "maya",
    name: "Maya",
    sanskrit: "माया",
    tagline: "The veil of illusion",
    level: "Foundation",
    color: "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/40",
    accent: "text-orange-600 dark:text-orange-400",
    summary: "Maya is the creative and concealing power of Brahman — not mere illusion, but the cosmic appearance that veils the non-dual reality. The world is not false; mistaking it for independently real is the error.",
    relatedTo: ["Brahman", "Avidya", "Adhyasa"],
  },
  {
    id: "atman",
    name: "Atman",
    sanskrit: "आत्मन्",
    tagline: "The pure witness-self",
    level: "Foundation",
    color: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40",
    accent: "text-amber-600 dark:text-amber-400",
    summary: "Atman is the innermost self — not the body, not the mind, not the ego, but the pure consciousness that witnesses all experience. It is identical to Brahman in Advaita's central equation.",
    relatedTo: ["Brahman", "Jiva", "Turiya"],
  },
  {
    id: "brahman",
    name: "Brahman",
    sanskrit: "ब्रह्मन्",
    tagline: "The ground of all being",
    level: "Foundation",
    color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/40",
    accent: "text-yellow-600 dark:text-yellow-500",
    summary: "Brahman is the ultimate, formless, undivided ground of existence — Sat (being), Chit (consciousness), Ananda (bliss). Everything that exists is Brahman, appearing in different forms through Maya.",
    relatedTo: ["Atman", "Maya", "Nirguna"],
  },
  {
    id: "avidya",
    name: "Avidya",
    sanskrit: "अविद्या",
    tagline: "The root ignorance",
    level: "Intermediate",
    color: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/40",
    accent: "text-green-700 dark:text-green-400",
    summary: "Avidya is not ordinary ignorance but the primordial not-knowing of our own nature as Brahman. It has two powers: Avarana (veiling the real) and Vikshepa (projecting the unreal).",
    relatedTo: ["Maya", "Adhyasa", "Viveka"],
  },
  {
    id: "adhyasa",
    name: "Adhyasa",
    sanskrit: "अध्यास",
    tagline: "Superimposition — the root error",
    level: "Intermediate",
    color: "bg-stone-50 border-stone-200 dark:bg-stone-950/20 dark:border-stone-800/40",
    accent: "text-stone-600 dark:text-stone-400",
    summary: "Adhyasa is the mechanism of Avidya — projecting the qualities of one thing onto another. We superimpose the body and mind onto the Atman, and mistakenly take ourselves to be a limited, mortal person.",
    relatedTo: ["Avidya", "Maya", "Atman"],
  },
  {
    id: "ajata-vada",
    name: "Ajata Vada",
    sanskrit: "अजात वाद",
    tagline: "The doctrine of non-origination",
    level: "Advanced",
    color: "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/40",
    accent: "text-rose-600 dark:text-rose-400",
    summary: "Ajata Vada, articulated in Gaudapada's Mandukya Karika, holds that nothing was ever created — there is no birth, no death, no bondage, no liberation. Only Brahman exists; the appearance of creation is itself the final mystery.",
    relatedTo: ["Brahman", "Turiya", "Vivartavada"],
  },
];

export default function Explore() {
  const [query, setQuery] = useState("");
  const [seekerLevel, setSeekerLevel] = useState(store.getLevel());
  // Default filter to the user's current level (mapped back to concept level string)
  const levelToConceptLevel: Record<string, string> = { jijnasu: "Foundation", sadhaka: "Intermediate", mumukshu: "Advanced" };
  const [filter, setFilter] = useState(levelToConceptLevel[store.getLevel()] || "All");
  const [showIntro, setShowIntro] = useState(true);
  const [archiveQuery, setArchiveQuery] = useState(""); // separate state for explicit archive search

  useEffect(() => subscribe(() => setSeekerLevel(store.getLevel())), []);

  const filtered = CONCEPTS.filter(c => {
    const matchQ = c.name.toLowerCase().includes(query.toLowerCase()) || c.tagline.toLowerCase().includes(query.toLowerCase());
    const matchL = filter === "All" || c.level === filter;
    return matchQ && matchL;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Explore Concepts</h1>
        <p className="text-sm text-muted-foreground">Begin with a question. Follow your curiosity.</p>
      </div>

      {/* Advaita intro — dismissable */}
      {showIntro && (
        <div className="mb-6 bg-card border border-primary/20 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 bg-primary/5 flex items-start justify-between gap-3">
            <div>
              <p className="font-serif text-sm font-semibold text-foreground">What is Advaita Vedanta?</p>
              <p className="text-xs text-muted-foreground mt-0.5">A brief orientation before you dive in</p>
            </div>
            <button onClick={() => setShowIntro(false)} className="text-muted-foreground hover:text-foreground text-sm flex-shrink-0">✕</button>
          </div>
          <div className="px-5 py-4 space-y-2 text-sm text-foreground leading-relaxed">
            <p>
              <strong>Advaita</strong> means <em>non-dual</em> — the teaching that at the deepest level, the individual self (Ātman) and the ultimate reality (Brahman) are not two separate things, but one undivided consciousness.
            </p>
            <p>
              This is the central insight of <strong>Adi Shankaracharya</strong> (8th century CE), who systematized these teachings from the Upanishads, Bhagavad Gita, and Brahma Sutras (the <em>Prasthāna Trayī</em>).
            </p>
            <p className="text-muted-foreground">
              The concepts below are the building blocks of this inquiry — each one pointing, from a different angle, at the same recognition. Start anywhere curiosity leads you.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <input
          type="search"
          placeholder="Search concepts or any Vedanta topic…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          data-testid="input-concept-search"
        />
        {/* Filter pills using Sanskrit level names */}
        {(["All", "Foundation", "Intermediate", "Advanced"] as const).map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors whitespace-nowrap ${
              filter === lvl ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`button-filter-${lvl.toLowerCase()}`}
            title={lvl !== "All" ? lvl : undefined}
          >
            {LEVEL_LABELS[lvl]}
          </button>
        ))}
      </div>

      {/* Archive search — auto-triggers when query doesn't match any concept */}
      {(query.trim().length >= 3 && filtered.length === 0) || archiveQuery ? (
        <>
          <ArchiveSearch query={archiveQuery || query} />
          {archiveQuery && (
            <button onClick={() => setArchiveQuery("")}
              className="text-xs text-muted-foreground hover:text-primary mb-2">
              ← Back to concepts
            </button>
          )}
        </>
      ) : query.trim().length >= 3 && filtered.length > 0 ? (
        <div className="mb-4 px-3 py-2 bg-muted/40 border border-border/60 rounded-lg flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{filtered.length} concept{filtered.length !== 1 ? "s" : ""} found — looking for something else?</p>
          <button onClick={() => setArchiveQuery(query)}
            className="text-xs text-primary hover:underline ml-2">Search archive →</button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(concept => (
          <Link key={concept.id} href={`/explore/${concept.id}`}>
            <div
              className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${concept.color}`}
              data-testid={`card-concept-${concept.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className={`font-serif text-lg font-bold ${concept.accent}`}>{concept.name}</h2>
                    <span className="text-lg text-muted-foreground font-light">{concept.sanskrit}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 text-muted-foreground border border-border">{LEVEL_LABELS[concept.level] || concept.level}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic mb-2">{concept.tagline}</p>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-2">{concept.summary}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {concept.relatedTo.map(r => (
                      <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted-foreground">{r}</span>
                    ))}
                  </div>
                </div>
                <span className="text-muted-foreground text-lg">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
