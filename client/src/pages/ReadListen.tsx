import { useParams, Link } from "wouter";
import { useState } from "react";
import { CONCEPTS } from "./Explore";

const READINGS: Record<string, {
  texts: { title: string; source: string; excerpt: string }[];
  videos: { title: string; youtubeId: string; channel: string }[];
}> = {
  maya: {
    texts: [
      {
        title: "Vivekachudamani — On Maya (vv. 108–116)",
        source: "Adi Shankaracharya",
        excerpt: "The power of the Lord, beginningless, of the nature of Avidya — it is Māyā, by which all this universe is brought forth. It is neither real (sat) nor unreal (asat) nor both — it is inexplicable (anirvacaniya). It is not darkness, not light alone; its nature baffles all description. O wise one, this is the mark of Māyā."
      },
      {
        title: "Brahma Sutra Bhashya — Introduction",
        source: "Shankara's Commentary",
        excerpt: "It is a matter not requiring any proof that the object and the subject — whose respective natures are the not-Self and the Self — are opposed to each other as much as darkness and light; and hence it is impossible that they can be identified. Yet owing to an inability to discriminate between these two entities of totally opposed characteristics, there follows a mutual superimposition — Adhyasa."
      },
    ],
    videos: [
      { title: "What is Maya? — Deep Dive into Advaita Vedanta", youtubeId: "Y5lGEBgJXCc", channel: "Swami Sarvapriyananda" },
      { title: "Maya and Consciousness — Advaita-L Discussion", youtubeId: "RxFKBiF1C5c", channel: "Advaita Academy" },
    ],
  },
  atman: {
    texts: [
      {
        title: "Mandukya Upanishad — The four states",
        source: "Upanishad (Gaudapada's Karika)",
        excerpt: "All this is verily Brahman. This self is Brahman. This very self has four aspects: Jagrat (waking), Svapna (dream), Sushupti (deep sleep), and Turiya (the fourth) — that is the pure Consciousness that witnesses all three. It is not cognizant of internal objects, not cognizant of external objects, not cognizant of both. It is unseen, un-inferable, ungraspable — it is the Atman and is to be realized."
      },
      {
        title: "Vivekachudamani — Who am I?",
        source: "Adi Shankaracharya, vv. 154–162",
        excerpt: "I am not the body which is gross, nor am I the subtle body. I am not hunger and thirst. I am not grief and delusion. I am none of these. I am indeed That which, when the sun of Knowledge rises in the heart's sky, dispels the darkness of ignorance — pure Consciousness, the witness of all, the ever-free, the self-luminous."
      },
    ],
    videos: [
      { title: "Who am I? — Atma Vichara Explained", youtubeId: "HMbJnb3UZJQ", channel: "Swami Sarvapriyananda" },
      { title: "The Four States of Consciousness — Mandukya Upanishad", youtubeId: "MqVEixAFnA0", channel: "Vedanta New York" },
    ],
  },
  brahman: {
    texts: [
      {
        title: "Chandogya Upanishad 6.2 — Tat Tvam Asi",
        source: "Uddalaka to Shvetaketu",
        excerpt: "In the beginning, my dear, this was Being alone, one only without a second. It thought: 'May I be many; may I grow forth.' It sent forth fire... 'That which is the subtle essence — in it all that exists has its self. That is Reality. That is the Self. That thou art, Shvetaketu.'"
      },
    ],
    videos: [
      { title: "Nirguna and Saguna Brahman — What is God in Advaita?", youtubeId: "TlMGSEpkuSk", channel: "Swami Sarvapriyananda" },
    ],
  },
  avidya: {
    texts: [
      {
        title: "Panchadashi — The lamp of knowledge",
        source: "Vidyaranya Swami",
        excerpt: "As ignorance of a rope results in fear of the snake that is imagined, so ignorance of Brahman results in fear of birth and death. The removal of ignorance — through the knowledge 'I am Brahman' — removes the superimposed world just as the knowledge 'This is a rope' removes the fear of the snake."
      },
    ],
    videos: [
      { title: "Avidya — The Root of Suffering in Advaita", youtubeId: "r3bnFkZHXS0", channel: "Vedanta New York" },
    ],
  },
  adhyasa: {
    texts: [
      {
        title: "Brahma Sutra Bhashya — Adhyasa Bhashya",
        source: "Adi Shankaracharya",
        excerpt: "This superimposition (Adhyasa) the learned consider to be Avidya, and the ascertainment of the true nature of that which is the object of superimposition is called Vidya. That being so, whenever there is superimposition of one thing on another, the substrate of superimposition is not affected in the least by any merit or demerit of the thing superimposed."
      },
    ],
    videos: [
      { title: "Adhyasa — The Mechanism of Maya", youtubeId: "klC4Y3sLRoA", channel: "Advaita Academy" },
    ],
  },
  "ajata-vada": {
    texts: [
      {
        title: "Mandukya Karika — Alatasanti Prakarana",
        source: "Gaudapada",
        excerpt: "There is no dissolution, no birth, none in bondage, none endeavoring for wisdom, no seeker of liberation and none liberated. This is the absolute truth. The Jivas (souls) are never born, nor does any cause exist for this. This supreme truth should be known, wherein not even the least thing is born."
      },
    ],
    videos: [
      { title: "Ajata Vada — Gaudapada's Non-Creation Doctrine", youtubeId: "OB3bZvFo2Uo", channel: "Swami Sarvapriyananda" },
    ],
  },
};

export default function ReadListen() {
  const { id } = useParams<{ id: string }>();
  const concept = CONCEPTS.find(c => c.id === id) || CONCEPTS[0];
  const content = READINGS[id || "maya"] || READINGS["maya"];
  const [tab, setTab] = useState<"texts" | "videos">("texts");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href={`/explore/${concept.id}`}>
        <button className="text-sm text-muted-foreground hover:text-primary mb-6 flex items-center gap-1" data-testid="button-back-concept">
          ← Back to {concept.name}
        </button>
      </Link>

      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-1">Reading & Listening</h1>
        <p className={`text-sm font-medium ${concept.accent}`}>{concept.name} — {concept.tagline}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: "texts", label: "📜 Texts" }, { key: "videos", label: "▶ Videos" }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "texts" | "videos")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            data-testid={`tab-${t.key}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "texts" && (
        <div className="space-y-5">
          {content.texts.map((text, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-muted/30">
                <h2 className="font-serif text-sm font-semibold text-foreground">{text.title}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{text.source}</p>
              </div>
              <div className="px-5 py-4">
                <blockquote className="font-serif text-sm italic leading-relaxed text-foreground border-l-4 border-primary/40 pl-4">
                  "{text.excerpt}"
                </blockquote>
              </div>
            </div>
          ))}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            <strong>Source:</strong> These are excerpts for study purposes. Full texts are available at <a href="https://lists.advaita-vedanta.org/archives/advaita-l/" target="_blank" rel="noopener noreferrer" className="underline">Advaita-L Archive</a>.
          </div>
        </div>
      )}

      {tab === "videos" && (
        <div className="space-y-5">
          {content.videos.map((video, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-sm font-semibold text-foreground">{video.title}</h2>
                  <p className="text-xs text-muted-foreground">{video.channel}</p>
                </div>
                <button
                  onClick={() => setActiveVideo(activeVideo === video.youtubeId ? null : video.youtubeId)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs hover:opacity-90 transition-opacity"
                  data-testid={`button-play-${video.youtubeId}`}
                >
                  {activeVideo === video.youtubeId ? "Close" : "▶ Play"}
                </button>
              </div>
              {activeVideo === video.youtubeId && (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.title}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Navigate forward */}
      <div className="mt-10 flex justify-between items-center pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">Ready to capture your thoughts?</p>
        <Link href="/diary">
          <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity" data-testid="button-go-to-diary">
            Write a Reflection →
          </button>
        </Link>
      </div>
    </div>
  );
}
