/**
 * MediaModal — in-app viewer for YouTube videos and PDF/text files.
 * Split-pane: content on the left, notes panel on the right.
 * Users can take notes while watching/reading without leaving the app.
 */
import { useEffect, useState, useRef } from "react";
import { store, subscribe, type Note } from "@/lib/localStore";

export type MediaItem =
  | { kind: "youtube"; title: string; youtubeId: string }
  | { kind: "pdf"; title: string; dataUrl: string; mimeType?: string }
  | { kind: "url"; title: string; url: string }
  | { kind: "text"; title: string; content: string; source?: string; archiveQuery?: string };

/**
 * TextViewer — renders a text excerpt with proper Unicode, plus dynamic archive search.
 * The archive search uses an iframe to load the Advaita-L Google site search inline.
 */
// Curated Advaita-L archive threads per concept
const ARCHIVE_THREADS: Record<string, { subject: string; author: string; date: string; url: string; preview: string }[]> = {
  maya: [
    { subject: "Maya and the three levels of reality", author: "Srikanta Narayanaswami", date: "Jan 2016", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2016-January/040130.html", preview: "The distinction between Paramarthika, Vyavaharika and Pratibhasika satta is fundamental to Shankara's system..." },
    { subject: "Is Maya real or unreal?", author: "Vidyasankar Sundaresan", date: "Mar 2012", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2012-March/031277.html", preview: "Shankara says Maya is anirvachaniya — indescribable, neither sat nor asat..." },
    { subject: "Vivartavada vs Parinama", author: "Ramesh S.", date: "Dec 2016", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2016-December/043613.html", preview: "The distinction between apparent modification (vivarta) and real transformation (parinama) is key to Advaita..." },
  ],
  atman: [
    { subject: "The nature of the Atman as Sakshi", author: "Srinivas Nagulapalli", date: "Feb 2014", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2014-February/036234.html", preview: "Atman as pure witness — not an experiencer, not an agent — is the central insight of the Vivekachudamani..." },
    { subject: "Pancha Kosha viveka", author: "Vidyasankar Sundaresan", date: "Nov 2010", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2010-November/027845.html", preview: "The five-sheath analysis is a systematic method for discriminating the Atman from what it is not..." },
  ],
  brahman: [
    { subject: "Nirguna and Saguna Brahman", author: "Venkatesh Murthy", date: "Jun 2015", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2015-June/038912.html", preview: "The apparent contradiction between Nirguna Brahman as the absolute and Saguna Brahman as Ishvara resolves when we understand the levels of reality..." },
    { subject: "Tat Tvam Asi — mahavakya inquiry", author: "Ranjeet Sankar", date: "Apr 2017", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2017-April/044891.html", preview: "The identity statement requires a specific method of interpretation (jahadajahallakshana) to avoid logical contradiction..." },
  ],
  avidya: [
    { subject: "Avidya and its locus", author: "Srikanta Narayanaswami", date: "Sep 2013", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2013-September/035456.html", preview: "The question of whether Avidya resides in the Jiva or Brahman is one of the major post-Shankara debates..." },
  ],
  adhyasa: [
    { subject: "Adhyasa Bhashya — Shankara's preamble", author: "Vidyasankar Sundaresan", date: "Jan 2009", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2009-January/021234.html", preview: "The entire Brahma Sutra commentary rests on the analysis of superimposition in the Adhyasa Bhashya..." },
  ],
  "ajata-vada": [
    { subject: "Ajata Vada and Shankara's Vivartavada", author: "Ramesh S.", date: "Mar 2018", url: "https://lists.advaita-vedanta.org/archives/advaita-l/2018-March/046712.html", preview: "Can Gaudapada's absolute non-origination be reconciled with Shankara's apparent acceptance of creation as appearance?" },
  ],
};

/** Fetches and renders an archive thread inline using a CORS proxy */
function ArchiveThreadReader({ url, onBack }: { url: string; onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<{ subject: string; author: string; date: string; body: string } | null>(null);

  useEffect(() => {
    setLoading(true); setError(null); setContent(null);
    // Use corsproxy.io to fetch the archive page
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    fetch(proxyUrl)
      .then(r => r.text())
      .then(html => {
        // Parse the HTML to extract email content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        // Advaita-L archive pages have <pre> tags with the email body
        const pre = doc.querySelector("pre");
        const subject = doc.querySelector("h1")?.textContent?.trim() || doc.title || "Archive Thread";
        // Extract From/Date from the <ul> near the top
        const lis = Array.from(doc.querySelectorAll("ul li"));
        const fromLi = lis.find(li => li.textContent?.startsWith("From:"))?.textContent?.replace("From:", "").trim() || "";
        const dateLi = lis.find(li => li.textContent?.startsWith("Date:"))?.textContent?.replace("Date:", "").trim() || "";
        const body = pre?.textContent?.trim() || "Could not extract thread body. Please open the link directly.";
        setContent({ subject, author: fromLi, date: dateLi, body });
        setLoading(false);
      })
      .catch(err => {
        setError("Could not load the thread. Please open it directly.");
        setLoading(false);
      });
  }, [url]);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/20 flex-shrink-0">
        <button onClick={onBack} className="text-xs text-primary hover:underline">← Back to discussions</button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-muted-foreground hover:text-primary">
          Open in archive ↗
        </a>
      </div>
      <div className="flex-1 overflow-auto p-5 sm:p-7">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-2xl mb-2">...</div>
              <p className="text-sm text-muted-foreground">Loading thread from archive...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="p-4 bg-card border border-border rounded-xl">
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
              Open in archive ↗
            </a>
          </div>
        )}
        {content && (
          <div className="max-w-2xl">
            <h2 className="font-serif text-base font-semibold text-foreground mb-1 leading-snug">{content.subject}</h2>
            <div className="flex gap-4 mb-5">
              {content.author && <p className="text-xs text-muted-foreground">{content.author}</p>}
              {content.date && <p className="text-xs text-muted-foreground">{content.date}</p>}
            </div>
            <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans bg-card border border-border rounded-xl p-4">
              {content.body}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function TextViewer({ item }: { item: Extract<MediaItem, { kind: "text" }> }) {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const query = item.archiveQuery?.toLowerCase().replace(/ /g, "-") || "";
  const threads = ARCHIVE_THREADS[query] || ARCHIVE_THREADS[item.archiveQuery?.toLowerCase() || ""] || [];
  const googleSearchUrl = item.archiveQuery
    ? `https://www.google.com/search?q=site:lists.advaita-vedanta.org+advaita-l+${encodeURIComponent(item.archiveQuery)}`
    : null;

  // When a thread is active, show the inline reader (no notes panel needed — handled by parent)
  if (activeThread) {
    return <ArchiveThreadReader url={activeThread} onBack={() => setActiveThread(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-auto">
      {/* Text excerpt */}
      <div className="p-6 sm:p-8 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-lg font-semibold text-foreground mb-1">{item.title}</h2>
          {item.source && <p className="text-xs text-muted-foreground mb-5">{item.source}</p>}
          <blockquote className="font-serif text-base leading-relaxed text-foreground border-l-4 border-primary/50 pl-5 italic">
            “{item.content}”
          </blockquote>
        </div>
      </div>

      {/* Archive section — curated threads, click to read inline */}
      {item.archiveQuery && (
        <div className="p-6 sm:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-semibold text-foreground">
                📚 Advaita-L Archive — related discussions
              </h3>
              {googleSearchUrl && (
                <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex-shrink-0 ml-3">
                  Search more →
                </a>
              )}
            </div>

            {threads.length > 0 ? (
              <div className="space-y-3">
                {threads.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveThread(t.url)}
                    className="w-full text-left p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{t.subject}</p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{t.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{t.author}</p>
                    <p className="text-xs text-muted-foreground/80 italic leading-relaxed line-clamp-2">{t.preview}</p>
                    <p className="text-[10px] text-primary mt-1.5">📖 Read this thread →</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-card border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-3">
                  Curated threads not yet available for this topic. Search the full archive:
                </p>
                {googleSearchUrl && (
                  <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
                    🔍 Search Advaita-L for “{item.archiveQuery}”
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Converts a base64 dataUrl to a blob URL, bypassing CSP data: restrictions */
function PdfViewer({ item }: { item: Extract<MediaItem, { kind: "pdf" }> }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    const mime = item.mimeType || "application/pdf";
    if (mime.startsWith("image/")) { setBlobUrl(item.dataUrl); return; }
    if (mime === "text/plain" || mime.includes("markdown")) {
      try { setTextContent(atob(item.dataUrl.split(",")[1] || "")); } catch { setTextContent(item.dataUrl); }
      return;
    }
    // PDF — convert to blob URL
    try {
      const base64 = item.dataUrl.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      prevUrl.current = url;
    } catch { setBlobUrl(item.dataUrl); }
    return () => { if (prevUrl.current) URL.revokeObjectURL(prevUrl.current); };
  }, [item.dataUrl, item.mimeType]);

  const mime = item.mimeType || "application/pdf";
  if (mime.startsWith("image/") && blobUrl) {
    return <div className="w-full h-full flex items-center justify-center overflow-auto p-4 bg-background"><img src={blobUrl} alt={item.title} className="max-w-full max-h-full object-contain rounded-lg" /></div>;
  }
  if (textContent !== null) {
    return <div className="w-full h-full overflow-auto p-6 bg-background"><pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed max-w-3xl mx-auto">{textContent}</pre></div>;
  }
  if (!blobUrl) {
    return <div className="flex items-center justify-center h-full text-muted-foreground"><p className="text-sm">Loading…</p></div>;
  }
  return <iframe src={blobUrl} title={item.title} className="w-full h-full border-0" />;
}

/** Inline notes panel shown alongside the media content */
function NotesPanel({ context }: { context: string }) {
  const [draft, setDraft] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [notes, setNotes] = useState<Note[]>(store.getNotes());
  useEffect(() => subscribe(() => setNotes(store.getNotes())), []);

  const pageNotes = notes.filter(n => n.context === context);

  function save() {
    if (!draft.trim()) return;
    store.addNote(draft.trim(), context, undefined, undefined, isPublic);
    setDraft("");
  }

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      {/* Notes header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex-shrink-0">
        <p className="text-xs font-bold text-foreground">Notes</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{context}</p>
      </div>

      {/* Textarea */}
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save(); }}
        placeholder={`Take a note while you ${context.toLowerCase().includes("reading") || context.toLowerCase().includes("self-study") ? "read" : "watch"}…`}
        className="resize-none px-4 py-3 text-sm text-foreground bg-transparent placeholder:text-muted-foreground/60 focus:outline-none border-none flex-shrink-0"
        style={{ minHeight: "100px", maxHeight: "160px" }}
        autoFocus
      />

      {/* Public/private + save */}
      <div className="px-4 pb-3 border-t border-border pt-2 flex-shrink-0 space-y-2">
        <div className="flex gap-1.5">
          <button onClick={() => setIsPublic(false)}
            className={`flex-1 py-1 rounded text-[10px] font-medium border transition-colors ${!isPublic ? "bg-card text-foreground border-border" : "bg-transparent text-muted-foreground border-transparent"}`}>
            🔒 Private
          </button>
          <button onClick={() => setIsPublic(true)}
            className={`flex-1 py-1 rounded text-[10px] font-medium border transition-colors ${isPublic ? "bg-primary/10 text-primary border-primary/30" : "bg-transparent text-muted-foreground border-transparent"}`}>
            🌐 Share
          </button>
        </div>
        <button onClick={save} disabled={!draft.trim()}
          className="w-full py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-40">
          Save Note <span className="opacity-60">⌘+↩</span>
        </button>
      </div>

      {/* Saved notes */}
      <div className="flex-1 overflow-y-auto border-t border-border">
        {pageNotes.length === 0 ? (
          <p className="text-[11px] text-muted-foreground text-center py-6 px-4">No notes yet for this {context.includes(":") ? "topic" : "page"}.</p>
        ) : (
          pageNotes.map(note => (
            <div key={note.id} className="px-4 py-2.5 border-b border-border/50 group">
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/60">{note.isPublic ? "🌐 Shared" : "🔒 Private"} · {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <button onClick={() => store.deleteNote(note.id)}
                  className="text-muted-foreground hover:text-destructive text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">🗑</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface Props {
  item: MediaItem | null;
  onClose: () => void;
  /** Context label for note-taking — e.g. "Self-study: maya" */
  noteContext?: string;
}

export function MediaModal({ item, onClose, noteContext }: Props) {
  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [item, onClose]);

  if (!item) return null;

  const context = noteContext || item.title;

  return (
    /* Full-screen overlay — stays within the app, does not open a new tab */
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-card border-b border-border flex-shrink-0">
        <p className="font-serif text-sm font-semibold text-foreground truncate mr-4">{item.title}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs hover:bg-muted/80 transition-colors"
          aria-label="Close viewer"
        >
          ✕ Close
        </button>
      </div>

      {/* Split pane: content | notes */}
      <div className="flex-1 overflow-hidden flex">
        {/* Media content — takes remaining space */}
        <div className="flex-1 overflow-hidden">
          {item.kind === "youtube" && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          )}
          {item.kind === "text" && <TextViewer item={item} />}
          {item.kind === "pdf" && <PdfViewer item={item} />}
          {item.kind === "url" && (
            <iframe src={item.url} title={item.title} className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
          )}
        </div>

        {/* Notes panel — fixed 280px width */}
        <div className="w-72 flex-shrink-0 overflow-hidden">
          <NotesPanel context={context} />
        </div>
      </div>
    </div>
  );
}
