/**
 * Self-study — merges Read/Listen + user uploads into one page.
 * Level-aware: shows content appropriate to the seeker's current level.
 * Supports PDF, text, and video-link uploads with context-aware notes.
 */
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { store, subscribe, LEVELS, type SeekerLevel, type UserUpload } from "@/lib/localStore";
import { CONCEPTS } from "./Explore";
import { LevelFilter } from "@/components/SeekerBadge";
import { AttachmentPicker } from "@/components/AttachmentPicker";
import { MediaModal, type MediaItem } from "@/components/MediaModal";
import { store as noteStore, subscribe as noteSubscribe } from "@/lib/localStore";

// ── Curated readings per concept, tagged by level ────────────────────────────
const READINGS: Record<string, {
  level: SeekerLevel;
  texts: { title: string; source: string; excerpt: string; level: SeekerLevel }[];
  videos: { title: string; youtubeId: string; channel: string; level: SeekerLevel }[];
}[]> = {
  maya: [
    {
      level: "jijnasu",
      texts: [
        { level: "jijnasu", title: "What is Maya? — An Introduction", source: "Advaita Vedanta Primer", excerpt: "Maya is often translated as 'illusion', but this is incomplete. It is Brahman's own creative power — the force by which the One appears as many. The world is not nonexistent; rather, its appearance as independent of Brahman is the illusion." },
        { level: "jijnasu", title: "Vivekachudamani — On Maya (vv. 108–116)", source: "Adi Shankaracharya", excerpt: "The power of the Lord, beginningless, of the nature of Avidya — it is Māyā, by which all this universe is brought forth. It is neither real (sat) nor unreal (asat) nor both — it is inexplicable (anirvacaniya). O wise one, this is the mark of Māyā." },
      ],
      videos: [
        { level: "jijnasu", title: "What is Maya? — Deep Dive into Advaita Vedanta", youtubeId: "Y5lGEBgJXCc", channel: "Swami Sarvapriyananda" },
      ],
    },
    {
      level: "sadhaka",
      texts: [
        { level: "sadhaka", title: "Brahma Sutra Bhashya — Adhyasa (Superimposition)", source: "Shankara's Commentary", excerpt: "It is a matter not requiring any proof that the object and the subject are opposed to each other as much as darkness and light. Yet owing to an inability to discriminate between these two entities, there follows a mutual superimposition — Adhyasa. The learned consider this superimposition to be Avidya, and the ascertainment of the true nature of the substrate is Vidya." },
        { level: "sadhaka", title: "Panchadashi — Maya and Ignorance", source: "Vidyaranya Swami, Chapter 1", excerpt: "As ignorance of a rope results in fear of the snake that is imagined, so ignorance of Brahman results in fear of birth and death. The removal of ignorance — through the knowledge 'I am Brahman' — removes the superimposed world just as the knowledge 'This is a rope' removes the fear of the snake." },
      ],
      videos: [
        { level: "sadhaka", title: "Maya and Consciousness — Advaita-L Discussion", youtubeId: "RxFKBiF1C5c", channel: "Advaita Academy" },
      ],
    },
    {
      level: "mumukshu",
      texts: [
        { level: "mumukshu", title: "Mandukya Karika — Alatasanti Prakarana", source: "Gaudapada (Ajata Vada)", excerpt: "There is no dissolution, no birth, none in bondage, none endeavoring for wisdom, no seeker of liberation and none liberated. This is the absolute truth. The Jivas are never born, nor does any cause exist for this. This supreme truth should be known, wherein not even the least thing is born." },
      ],
      videos: [
        { level: "mumukshu", title: "Ajata Vada — Gaudapada's Non-Creation Doctrine", youtubeId: "OB3bZvFo2Uo", channel: "Swami Sarvapriyananda" },
      ],
    },
  ],
  atman: [
    {
      level: "jijnasu",
      texts: [
        { level: "jijnasu", title: "Who am I? — Tattva Bodha Introduction", source: "Adi Shankaracharya", excerpt: "Who am I? I am not the gross body made of five elements. I am not the five vital airs. I am not the mind. I am the pure Consciousness, the witness of all — ever free, self-luminous, the Atman." },
      ],
      videos: [
        { level: "jijnasu", title: "Who am I? — Atma Vichara Explained", youtubeId: "HMbJnb3UZJQ", channel: "Swami Sarvapriyananda" },
      ],
    },
    {
      level: "sadhaka",
      texts: [
        { level: "sadhaka", title: "Mandukya Upanishad — The four states of consciousness", source: "Upanishad (Gaudapada's Karika)", excerpt: "All this is verily Brahman. This self is Brahman. This very self has four aspects: Jagrat (waking), Svapna (dream), Sushupti (deep sleep), and Turiya (the fourth) — that is pure Consciousness that witnesses all three. It is not cognizant of internal objects, not cognizant of external objects — it is the Atman and is to be realized." },
        { level: "sadhaka", title: "Vivekachudamani — Discrimination of the Self", source: "Adi Shankaracharya, vv. 154–162", excerpt: "I am not the body which is gross, nor am I the subtle body. I am none of these. I am indeed That which, when the sun of Knowledge rises in the heart's sky, dispels the darkness of ignorance — pure Consciousness, the witness of all, the ever-free, the self-luminous." },
      ],
      videos: [
        { level: "sadhaka", title: "The Four States of Consciousness — Mandukya Upanishad", youtubeId: "MqVEixAFnA0", channel: "Vedanta New York" },
      ],
    },
    {
      level: "mumukshu",
      texts: [
        { level: "mumukshu", title: "Brahma Sutras II.3 — On the nature of the Jiva", source: "Shankara Bhashya", excerpt: "The individual self (Jiva) is not different from the supreme Self (Brahman). The appearance of difference is due to superimposition. As space within a pot is not different from infinite space, the Jiva enclosed in the body is not different from Brahman. When the pot is destroyed, the enclosed space merges in infinite space — so too the Jiva at liberation." },
      ],
      videos: [],
    },
  ],
  brahman: [
    {
      level: "jijnasu",
      texts: [
        { level: "jijnasu", title: "Chandogya Upanishad 6.2 — Tat Tvam Asi", source: "Uddalaka to Shvetaketu", excerpt: "In the beginning, my dear, this was Being alone, one only without a second. It thought: 'May I be many; may I grow forth.' — 'That which is the subtle essence — in it all that exists has its self. That is Reality. That is the Self. That thou art, Shvetaketu.'" },
      ],
      videos: [
        { level: "jijnasu", title: "Nirguna and Saguna Brahman — What is God in Advaita?", youtubeId: "TlMGSEpkuSk", channel: "Swami Sarvapriyananda" },
      ],
    },
    {
      level: "sadhaka",
      texts: [
        { level: "sadhaka", title: "Brahma Sutra Bhashya I.1.1 — Athato Brahma Jijnasa", source: "Shankara's Commentary", excerpt: "Now, therefore, the inquiry into Brahman. The word 'now' indicates that what follows proceeds from what precedes — i.e., from the attainment of the four prerequisites: discrimination between the eternal and the non-eternal; renunciation of the enjoyment of the fruits of actions both here and hereafter; the group of six virtues beginning with tranquillity; and the desire for liberation." },
      ],
      videos: [],
    },
  ],
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export default function SelfStudy() {
  const { concept: conceptId } = useParams<{ concept?: string }>();
  const concept = CONCEPTS.find(c => c.id === conceptId) || null;

  const [currentLevel, setCurrentLevel] = useState(store.getLevel());
  const [filterLevel, setFilterLevel] = useState<SeekerLevel | "all">("all");
  const [tab, setTab] = useState<"texts" | "videos" | "uploads">("texts");
  const [uploads, setUploads] = useState<UserUpload[]>(store.getUploads());
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState<"pdf" | "video-link">("pdf");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadConcept, setUploadConcept] = useState(concept?.name || "");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  // Inline notes panel
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [allNotes, setAllNotes] = useState(noteStore.getNotes());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => noteSubscribe(() => setAllNotes(noteStore.getNotes())), []);

  useEffect(() => subscribe(() => {
    setCurrentLevel(store.getLevel());
    setUploads(store.getUploads());
  }), []);

  // Collect readings for the selected concept (or all if none selected)
  const conceptReadings = concept ? (READINGS[concept.id] || []) : [];
  const effectiveLevel = filterLevel === "all" ? null : filterLevel;
  const filteredReadings = effectiveLevel
    ? conceptReadings.filter(r => r.level === effectiveLevel)
    : conceptReadings;

  const allTexts = filteredReadings.flatMap(r => r.texts);
  const allVideos = filteredReadings.flatMap(r => r.videos);

  // Filtered uploads
  const shownUploads = uploads.filter(u =>
    (!concept || !u.concept || u.concept === concept.name) &&
    (filterLevel === "all" || u.level === filterLevel)
  );

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max 5 MB.`);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      store.addUpload({
        name: uploadName || file.name,
        type: "pdf",
        dataUrl: reader.result as string,
        size: file.size,
        concept: uploadConcept || undefined,
      });
      setShowUploadForm(false);
      setUploadName("");
      setUploadConcept(concept?.name || "");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleVideoLink() {
    if (!videoUrl.trim()) return;
    store.addUpload({
      name: uploadName || videoUrl,
      type: "video-link",
      url: videoUrl.trim(),
      concept: uploadConcept || undefined,
    });
    setShowUploadForm(false);
    setVideoUrl("");
    setUploadName("");
    setUploadConcept(concept?.name || "");
  }

  function youtubeId(url: string) {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m?.[1] || null;
  }

  // Notes context for this page
  const notesContext = concept ? `Self-study: ${concept.id}` : "Self-study";
  const pageNotes = allNotes.filter(n => n.context === notesContext);
  function saveStudyNote() {
    if (!noteDraft.trim()) return;
    noteStore.addNote(noteDraft.trim(), notesContext, undefined, undefined, false);
    setNoteDraft("");
  }

  const levelBadge: Record<SeekerLevel, string> = {
    jijnasu:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    sadhaka:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    mumukshu: "bg-primary/10 text-primary",
  };
  const levelLabel: Record<SeekerLevel, string> = {
    jijnasu: "Jijñāsu", sadhaka: "Sādhaka", mumukshu: "Mumukṣu",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* In-app media viewer — split pane with notes */}
      <MediaModal item={mediaItem} onClose={() => setMediaItem(null)} noteContext={notesContext} />

      {/* Inline notes side tab — visible only on Self-study */}
      <button
        onClick={() => setNotesOpen(o => !o)}
        className={`fixed z-40 flex items-center gap-2 shadow-lg font-semibold transition-all ${
          notesOpen ? "bg-primary text-primary-foreground" : "bg-primary/90 text-primary-foreground hover:bg-primary"
        }`}
        style={{ right: notesOpen ? 320 : 0, top: "40%", padding: "10px 14px 10px 10px", borderRadius: "10px 0 0 10px", fontSize: "13px" }}
        title="Study Notes"
      >
        <span style={{ fontSize: "15px" }}>{notesOpen ? "✕" : "📝"}</span>
        <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "12px", fontWeight: 700 }}>
          {notesOpen ? "Close" : `Notes${pageNotes.length > 0 ? ` (${pageNotes.length})` : ""}`}
        </span>
      </button>

      {notesOpen && (
        <div className="fixed z-40 bg-card border-l border-t border-b border-border shadow-2xl flex flex-col overflow-hidden"
          style={{ right: 0, top: "10%", width: 320, maxHeight: "80vh", borderRadius: "12px 0 0 12px" }}>
          <div className="px-4 py-3 border-b border-border bg-muted/30 flex-shrink-0">
            <p className="text-xs font-bold text-foreground">Study Notes</p>
            <p className="text-[10px] text-muted-foreground/80">
              Notes taken while studying{concept ? ` ${concept.name}` : ""} — private scratchpad
            </p>
          </div>
          <textarea
            value={noteDraft}
            onChange={e => setNoteDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveStudyNote(); }}
            placeholder={`Jot a note while you study${concept ? ` ${concept.name}` : ""}\u2026\n\nCmd/Ctrl+Enter to save`}
            className="flex-1 resize-none px-4 py-3 text-sm text-foreground bg-transparent placeholder:text-muted-foreground/60 focus:outline-none border-none"
            style={{ minHeight: "120px", maxHeight: "180px" }}
            autoFocus
          />
          <div className="px-4 pb-3 flex items-center justify-between border-t border-border pt-2 flex-shrink-0">
            <span className="text-[10px] text-muted-foreground">⌘/Ctrl+Enter to save</span>
            <button onClick={saveStudyNote} disabled={!noteDraft.trim()}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-40">
              Save Note
            </button>
          </div>
          {pageNotes.length > 0 && (
            <div className="border-t border-border overflow-y-auto" style={{ maxHeight: "240px" }}>
              <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Notes on this page
              </p>
              {pageNotes.map(note => (
                <div key={note.id} className="px-4 py-2.5 border-b border-border/50 group">
                  <div className="flex items-start gap-2">
                    <p className="text-xs text-foreground leading-relaxed flex-1 whitespace-pre-wrap">{note.content}</p>
                    <button onClick={() => noteStore.deleteNote(note.id)}
                      className="text-muted-foreground hover:text-destructive text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                      🗑
                    </button>
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">
                    {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
          <h1 className="font-serif text-2xl font-bold text-foreground">Self-study</h1>
          {concept && (
            <Link href="/self-study">
              <button className="text-xs text-muted-foreground hover:text-primary">← All topics</button>
            </Link>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {concept ? `${concept.name} — ${concept.tagline}` : "Curated texts, lectures, and your uploaded materials."}
        </p>
        {/* Concept picker if no concept selected */}
        {!concept && (
          <div className="flex flex-wrap gap-2 mb-4">
            {CONCEPTS.slice(0, 10).map(c => (
              <Link key={c.id} href={`/self-study/${c.id}`}>
                <span className="px-3 py-1 bg-card border border-border rounded-full text-xs text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        )}
        {/* Level filter */}
        <LevelFilter value={filterLevel} onChange={setFilterLevel} label="Level:" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "texts", label: "📜 Texts" },
          { key: "videos", label: "▶ Videos" },
          { key: "uploads", label: `📁 My Uploads${uploads.length > 0 ? ` (${uploads.length})` : ""}` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "texts" | "videos" | "uploads")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Texts tab */}
      {tab === "texts" && (
        <div className="space-y-5">
          {!concept && (
            <p className="text-sm text-muted-foreground bg-card border border-border rounded-xl p-4">
              Select a concept above to see curated text excerpts with level-appropriate commentary.
            </p>
          )}
          {concept && allTexts.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No texts for this level selection. Try "All levels".</p>
          )}
          {allTexts.map((text, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-serif text-sm font-semibold text-foreground">{text.title}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{text.source}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${levelBadge[text.level]}`}>
                  {levelLabel[text.level]}
                </span>
              </div>
              <div className="px-5 py-4">
                <blockquote className="font-serif text-sm italic leading-relaxed text-foreground border-l-4 border-primary/40 pl-4">
                  "{text.excerpt}"
                </blockquote>
              </div>
            </div>
          ))}
          {concept && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <strong>Archive reference:</strong>{" "}
              <a
                href={`https://www.google.com/search?q=site:lists.advaita-vedanta.org+advaita-l+${encodeURIComponent(concept.name)}`}
                target="_blank" rel="noopener noreferrer" className="underline font-medium"
              >
                Search Advaita-L discussions on {concept.name}
              </a>
              {" "}— decades of scholarly discussion.
            </div>
          )}
        </div>
      )}

      {/* Videos tab */}
      {tab === "videos" && (
        <div className="space-y-4">
          {!concept && (
            <p className="text-sm text-muted-foreground bg-card border border-border rounded-xl p-4">
              Select a concept above to see curated video lectures.
            </p>
          )}
          {concept && allVideos.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No videos for this level selection. Try "All levels".</p>
          )}
          {allVideos.map((video, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-serif text-sm font-semibold text-foreground leading-snug">{video.title}</h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${levelBadge[video.level]}`}>
                      {levelLabel[video.level]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{video.channel}</p>
                </div>
                <button
                  onClick={() => setMediaItem({ kind: "youtube", title: video.title, youtubeId: video.youtubeId })}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs hover:opacity-90 transition-opacity"
                >
                  ▶ Watch
                </button>
              </div>
              <button
                onClick={() => setMediaItem({ kind: "youtube", title: video.title, youtubeId: video.youtubeId })}
                className="block w-full relative group cursor-pointer"
              >
                <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title} className="w-full object-cover" style={{ maxHeight: "180px" }} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-4xl">▶</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploads tab */}
      {tab === "uploads" && (
        <div className="space-y-4">
          {/* Upload button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
            >
              + Add material
            </button>
          </div>

          {/* Upload form */}
          {showUploadForm && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="font-serif text-sm font-semibold text-foreground">Add study material</h3>

              {/* Type selector */}
              <div className="flex gap-2">
                {[
                  { key: "pdf", label: "📄 PDF / Text" },
                  { key: "video-link", label: "▶ Video link" },
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => setUploadType(t.key as "pdf" | "video-link")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      uploadType === t.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <input
                value={uploadName}
                onChange={e => setUploadName(e.target.value)}
                placeholder="Title (optional)"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <input
                value={uploadConcept}
                onChange={e => setUploadConcept(e.target.value)}
                placeholder="Tag to a concept (optional)"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              {uploadType === "pdf" ? (
                <>
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-2.5 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-center"
                  >
                    Click to choose PDF or text file (max 5 MB)
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="YouTube or video URL"
                    className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    onClick={handleVideoLink}
                    disabled={!videoUrl.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              )}
              {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
              <button onClick={() => setShowUploadForm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          )}

          {shownUploads.length === 0 && !showUploadForm && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-3xl mb-3">📁</p>
              <p className="text-sm">No uploaded materials yet.</p>
              <p className="text-xs mt-1">Upload PDFs, text files, or add video links to study alongside curated content.</p>
            </div>
          )}

          {shownUploads.map(upload => {
            const ytId = upload.type === "video-link" ? youtubeId(upload.url || "") : null;
            return (
              <div key={upload.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span>{upload.type === "pdf" ? "📄" : "▶"}</span>
                      <h3 className="text-sm font-medium text-foreground truncate">{upload.name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${levelBadge[upload.level]}`}>
                        {levelLabel[upload.level]}
                      </span>
                    </div>
                    {upload.concept && <p className="text-xs text-muted-foreground mt-0.5">Concept: {upload.concept}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {upload.type === "pdf" && upload.dataUrl && (
                      <button
                        onClick={() => setMediaItem({ kind: "pdf", title: upload.name, dataUrl: upload.dataUrl!, mimeType: upload.type === "pdf" ? "application/pdf" : "text/plain" })}
                        className="px-3 py-1 bg-card border border-border rounded-lg text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        Open
                      </button>
                    )}
                    {upload.type === "video-link" && upload.url && (
                      <button
                        onClick={() => {
                          const ytId = youtubeId(upload.url!);
                          if (ytId) setMediaItem({ kind: "youtube", title: upload.name, youtubeId: ytId });
                          else setMediaItem({ kind: "url", title: upload.name, url: upload.url! });
                        }}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs hover:opacity-90"
                      >
                        ▶ Watch
                      </button>
                    )}
                    <button
                      onClick={() => store.deleteUpload(upload.id)}
                      className="px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove"
                    >✕</button>
                  </div>
                </div>
                {ytId && (
                  <button
                    onClick={() => setMediaItem({ kind: "youtube", title: upload.name, youtubeId: ytId })}
                    className="block w-full relative group cursor-pointer"
                  >
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={upload.name} className="w-full object-cover" style={{ maxHeight: "160px" }} />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-4xl">▶</span>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer nav */}
      <div className="mt-10 flex justify-between items-center pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">Ready to reflect?</p>
        <Link href="/diary">
          <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity">
            Write a Reflection →
          </button>
        </Link>
      </div>
    </div>
  );
}
