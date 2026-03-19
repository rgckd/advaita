import { useState, useEffect, useRef } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { store, subscribe, type Note, type FileAttachment } from "@/lib/localStore";
import { AttachmentPicker, AttachmentDisplay } from "@/components/AttachmentPicker";

// Pages that have their own built-in writing form — Notes tab is hidden there
// to avoid confusion between "Quick Notes" (private scratchpad) and the page's
// primary action (Reflection Diary entry / Satsang thread).
const SUPPRESS_ON = ["/diary", "/satsang"];

// Derive a human-readable context label from the current route
function routeLabel(location: string): string {
  if (location.startsWith("/explore/")) return `Concept: ${location.replace("/explore/", "")}`;
  if (location.startsWith("/read/")) return `Reading: ${location.replace("/read/", "")}`;
  if (location === "/launch") return "Home";
  if (location === "/study-map") return "Study Map";
  if (location === "/diary") return "Diary";
  if (location === "/satsang") return "Satsang";
  if (location === "/insights") return "Insights";
  if (location === "/assessment") return "Assessment";
  if (location === "/go-deeper") return "Go Deeper";
  if (location === "/explore") return "Explore";
  return "General";
}

export function FloatingNotes() {
  const [location] = useHashLocation();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"write" | "all">("write");
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState<Note[]>(store.getNotes());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => subscribe(() => setNotes(store.getNotes())), []);

  // Auto-focus textarea when panel opens on write tab
  useEffect(() => {
    if (open && view === "write") {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open, view]);

  const context = routeLabel(location);
  const currentNotes = notes.filter(n => n.context === context);

  function saveNote() {
    if (!draft.trim() && !attachment) return;
    store.addNote(draft.trim(), context, attachment ?? undefined);
    setDraft("");
    setAttachment(null);
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditContent(note.content);
  }

  function saveEdit(id: number) {
    store.updateNote(id, editContent.trim());
    setEditingId(null);
  }

  const allNotes = notes;
  // Group by context for "All Notes" view
  const grouped = allNotes.reduce<Record<string, Note[]>>((acc, n) => {
    acc[n.context] = acc[n.context] || [];
    acc[n.context].push(n);
    return acc;
  }, {});

  // Don't render on pages that already have their own primary writing form
  if (SUPPRESS_ON.includes(location)) return null;

  return (
    <>
      {/* Side-tab trigger — rotated label tab on right edge */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed z-50 flex items-center gap-2 shadow-lg font-semibold transition-all ${
          open
            ? "bg-primary text-primary-foreground"
            : "bg-primary/90 text-primary-foreground hover:bg-primary"
        }`}
        style={{
          right: open ? 320 : 0,
          top: "40%",
          padding: "10px 14px 10px 10px",
          borderRadius: "10px 0 0 10px",
          fontSize: "13px",
          letterSpacing: "0.01em",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        }}
        title="Quick Notes"
        data-testid="button-floating-notes"
      >
        <span style={{ fontSize: "15px" }}>{open ? "✕" : "📝"}</span>
        <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "12px", fontWeight: 700 }}>
          {open ? "Close" : "Notes"}
        </span>
      </button>

      {/* Notes panel — slides in from right edge */}
      {open && (
        <div
          className="fixed z-50 bg-card border-l border-t border-b border-border shadow-2xl flex flex-col overflow-hidden"
          style={{ right: 0, top: "10%", width: 320, maxHeight: "80vh", borderRadius: "12px 0 0 12px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 flex-shrink-0">
            <div>
              <p className="text-xs font-bold text-foreground">Quick Notes</p>
              <p className="text-[10px] text-muted-foreground/80 leading-tight mb-0.5">Private scratchpad — not saved to Diary</p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                📍 {context}
                {currentNotes.length > 0 && (
                  <span className="ml-1 text-primary">· {currentNotes.length} note{currentNotes.length !== 1 ? "s" : ""} here</span>
                )}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setView("write")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${view === "write" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Write
              </button>
              <button
                onClick={() => setView("all")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${view === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                All ({allNotes.length})
              </button>
            </div>
          </div>

          {/* Write tab */}
          {view === "write" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveNote();
                }}
                placeholder={`Jot a quick note while you study ${context}\u2026\n\nThis is a private scratchpad. Use the Diary for deeper reflections.\n\nCmd/Ctrl+Enter to save`}
                className="flex-1 resize-none px-4 py-3 text-sm text-foreground bg-transparent placeholder:text-muted-foreground/60 focus:outline-none border-none"
                style={{ minHeight: "120px", maxHeight: "180px" }}
                data-testid="textarea-quick-note"
              />

              {/* Attachment area */}
              <AttachmentPicker value={attachment} onChange={setAttachment} className="px-4 pb-2 flex-shrink-0" />

              <div className="px-4 pb-3 flex items-center justify-between border-t border-border pt-2 flex-shrink-0">
                <a href="#/diary" className="text-[10px] text-primary/70 hover:text-primary transition-colors" title="Go to Reflection Diary">
                  📖 Open Diary
                </a>
                <button
                  onClick={saveNote}
                  disabled={!draft.trim() && !attachment}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  data-testid="button-save-note"
                >
                  Save Note
                </button>
              </div>

              {/* Notes on this page */}
              {currentNotes.length > 0 && (
                <div className="border-t border-border overflow-y-auto flex-shrink-0" style={{ maxHeight: "200px" }}>
                  <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Notes on this page
                  </p>
                  {currentNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      editingId={editingId}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      onEdit={startEdit}
                      onSaveEdit={saveEdit}
                      onDelete={id => store.deleteNote(id)}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All notes tab */}
          {view === "all" && (
            <div className="flex-1 overflow-y-auto">
              {allNotes.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No notes yet. Start jotting!</p>
              ) : (
                Object.entries(grouped).map(([ctx, ctxNotes]) => (
                  <div key={ctx}>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide sticky top-0 bg-card border-b border-border/50">
                      📍 {ctx}
                    </p>
                    {ctxNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        editingId={editingId}
                        editContent={editContent}
                        setEditContent={setEditContent}
                        onEdit={startEdit}
                        onSaveEdit={saveEdit}
                        onDelete={id => store.deleteNote(id)}
                        onCancelEdit={() => setEditingId(null)}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function NoteCard({
  note, editingId, editContent, setEditContent,
  onEdit, onSaveEdit, onDelete, onCancelEdit,
}: {
  note: Note;
  editingId: number | null;
  editContent: string;
  setEditContent: (v: string) => void;
  onEdit: (n: Note) => void;
  onSaveEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCancelEdit: () => void;
}) {
  const isEditing = editingId === note.id;
  const time = new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="px-4 py-2.5 border-b border-border/50 group">
      {isEditing ? (
        <div className="flex flex-col gap-1.5">
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full text-xs text-foreground bg-muted/40 border border-border rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
            rows={3}
            autoFocus
          />
          <div className="flex gap-1.5">
            <button onClick={() => onSaveEdit(note.id)} className="text-[10px] px-2 py-0.5 bg-primary text-primary-foreground rounded font-medium">Save</button>
            <button onClick={onCancelEdit} className="text-[10px] px-2 py-0.5 text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {note.content && (
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
            )}
            {note.attachment && <AttachmentDisplay attachment={note.attachment} />}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pt-0.5">
            <button onClick={() => onEdit(note)} className="text-muted-foreground hover:text-primary transition-colors text-[11px]" title="Edit">✏</button>
            <button onClick={() => onDelete(note.id)} className="text-muted-foreground hover:text-destructive transition-colors text-[11px]" title="Delete">🗑</button>
          </div>
        </div>
      )}
      <p className="text-[9px] text-muted-foreground/60 mt-1">{time}</p>
    </div>
  );
}
