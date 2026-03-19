import { Link } from "wouter";
import { useState } from "react";

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
  const [filter, setFilter] = useState("All");

  const filtered = CONCEPTS.filter(c => {
    const matchQ = c.name.toLowerCase().includes(query.toLowerCase()) || c.tagline.toLowerCase().includes(query.toLowerCase());
    const matchL = filter === "All" || c.level === filter;
    return matchQ && matchL;
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Explore Concepts</h1>
        <p className="text-sm text-muted-foreground">Begin with a question. Follow your curiosity.</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="search"
          placeholder="Search concepts..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          data-testid="input-concept-search"
        />
        {["All", "Foundation", "Intermediate", "Advanced"].map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${filter === lvl ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
            data-testid={`button-filter-${lvl.toLowerCase()}`}
          >
            {lvl}
          </button>
        ))}
      </div>

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
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 text-muted-foreground border border-border">{concept.level}</span>
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
