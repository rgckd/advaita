import { useState, useEffect, useRef } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { store, subscribe, type Note } from "@/lib/localStore";

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
    if (!draft.trim()) return;
    store.addNote(draft.trim(), context);
    setDraft("");
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

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${
          open
            ? "bg-primary text-primary-foreground"
            : "bg-card border-2 border-primary/40 text-primary hover:border-primary"
        }`}
        title="Quick Notes"
        data-testid="button-floating-notes"
      >
        {open ? "✕" : "📝"}
      </button>

      {/* Notes panel */}
      {open && (
        <div
          className="fixed bottom-20 right-5 z-50 w-80 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 flex-shrink-0">
            <div>
              <p className="text-xs font-bold text-foreground">Quick Notes</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[180px]">
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
                placeholder={`Jot a note about ${context}…\n\nCmd/Ctrl+Enter to save`}
                className="flex-1 resize-none px-4 py-3 text-sm text-foreground bg-transparent placeholder:text-muted-foreground/60 focus:outline-none border-none"
                style={{ minHeight: "140px", maxHeight: "200px" }}
                data-testid="textarea-quick-note"
              />
              <div className="px-4 pb-3 flex items-center justify-between border-t border-border pt-2 flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">⌘/Ctrl+Enter to save</span>
                <button
                  onClick={saveNote}
                  disabled={!draft.trim()}
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
          <p className="text-xs text-foreground leading-relaxed flex-1 whitespace-pre-wrap">{note.content}</p>
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
