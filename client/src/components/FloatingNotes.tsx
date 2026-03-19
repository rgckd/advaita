import { useState, useEffect, useRef } from "react";
import { useHashLocation } from "wouter/use-hash-location";
import { store, subscribe, type Note, type NoteAttachment } from "@/lib/localStore";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "🖼";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  return "📎";
}

export function FloatingNotes() {
  const [location] = useHashLocation();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"write" | "all">("write");
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState<Note[]>(store.getNotes());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [attachment, setAttachment] = useState<NoteAttachment | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribe(() => setNotes(store.getNotes())), []);

  // Auto-focus textarea when panel opens on write tab
  useEffect(() => {
    if (open && view === "write") {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open, view]);

  const context = routeLabel(location);
  const currentNotes = notes.filter(n => n.context === context);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachError(null);
    if (file.size > MAX_FILE_BYTES) {
      setAttachError(`File too large (${formatBytes(file.size)}). Max 5 MB.`);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        dataUrl: reader.result as string,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
    // reset input so the same file can be re-selected after removal
    e.target.value = "";
  }

  function saveNote() {
    if (!draft.trim() && !attachment) return;
    store.addNote(draft.trim(), context, attachment ?? undefined);
    setDraft("");
    setAttachment(null);
    setAttachError(null);
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
                style={{ minHeight: "120px", maxHeight: "180px" }}
                data-testid="textarea-quick-note"
              />

              {/* Attachment area */}
              <div className="px-4 pb-2 flex-shrink-0">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-note-attachment"
                />

                {attachment ? (
                  /* Attachment preview chip */
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs">
                    <span className="text-base flex-shrink-0">{fileIcon(attachment.mimeType)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{attachment.name}</p>
                      <p className="text-muted-foreground">{formatBytes(attachment.size)}</p>
                    </div>
                    <button
                      onClick={() => setAttachment(null)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 text-sm"
                      title="Remove attachment"
                    >✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors py-1"
                    title="Attach a file (max 5 MB)"
                  >
                    <span>📎</span>
                    <span>Attach file <span className="opacity-60">— PDF, image, doc (max 5 MB)</span></span>
                  </button>
                )}

                {attachError && (
                  <p className="text-[10px] text-destructive mt-1">{attachError}</p>
                )}
              </div>

              <div className="px-4 pb-3 flex items-center justify-between border-t border-border pt-2 flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">⌘/Ctrl+Enter to save</span>
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
            {/* Attachment display */}
            {note.attachment && (
              <div className="mt-1.5">
                {note.attachment.mimeType.startsWith("image/") ? (
                  <a href={note.attachment.dataUrl} target="_blank" rel="noopener noreferrer" title="Open image">
                    <img
                      src={note.attachment.dataUrl}
                      alt={note.attachment.name}
                      className="max-w-full rounded border border-border"
                      style={{ maxHeight: "80px", objectFit: "cover" }}
                    />
                  </a>
                ) : (
                  <a
                    href={note.attachment.dataUrl}
                    download={note.attachment.name}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-muted/50 border border-border rounded-md text-[10px] text-foreground hover:bg-muted transition-colors"
                    title={`Download ${note.attachment.name}`}
                  >
                    <span className="text-sm">{fileIcon(note.attachment.mimeType)}</span>
                    <span className="truncate font-medium">{note.attachment.name}</span>
                    <span className="text-muted-foreground flex-shrink-0">{formatBytes(note.attachment.size)}</span>
                  </a>
                )}
              </div>
            )}
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
