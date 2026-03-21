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
  | { kind: "url"; title: string; url: string };

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
