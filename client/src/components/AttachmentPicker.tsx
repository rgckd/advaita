/**
 * Reusable file attachment picker.
 * Enforces 5 MB limit, single file per item.
 * Renders a compact "Attach file" button when empty, or a chip when a file is selected.
 */
import { useRef, useState } from "react";
import type { FileAttachment } from "@/lib/localStore";

const MAX_BYTES = 5 * 1024 * 1024;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "🖼";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  return "📎";
}

interface Props {
  value: FileAttachment | null;
  onChange: (attachment: FileAttachment | null) => void;
  /** Extra classes on the root wrapper */
  className?: string;
}

export function AttachmentPicker({ value, onChange, className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_BYTES) {
      setError(`File too large (${formatBytes(file.size)}). Max 5 MB.`);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ name: file.name, size: file.size, dataUrl: reader.result as string, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp"
        onChange={handleFile}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-xs">
          <span className="text-base flex-shrink-0">{fileIcon(value.mimeType)}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{value.name}</p>
            <p className="text-muted-foreground">{formatBytes(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setError(null); }}
            className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 text-sm leading-none"
            title="Remove attachment"
          >✕</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
          title="Attach a file (max 5 MB)"
        >
          <span>📎</span>
          <span>Attach file <span className="opacity-60">— PDF, image, doc (max 5 MB)</span></span>
        </button>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

/** Renders an attached file inline inside a diary entry or discussion post */
export function AttachmentDisplay({ attachment }: { attachment: FileAttachment }) {
  if (attachment.mimeType.startsWith("image/")) {
    return (
      <a href={attachment.dataUrl} target="_blank" rel="noopener noreferrer" className="block mt-2" title="Open image">
        <img
          src={attachment.dataUrl}
          alt={attachment.name}
          className="max-w-full rounded-lg border border-border"
          style={{ maxHeight: "120px", objectFit: "cover" }}
        />
        <p className="text-[10px] text-muted-foreground mt-0.5">{attachment.name}</p>
      </a>
    );
  }
  return (
    <a
      href={attachment.dataUrl}
      download={attachment.name}
      className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1.5 bg-muted/50 border border-border rounded-lg text-xs text-foreground hover:bg-muted transition-colors"
      title={`Download ${attachment.name}`}
    >
      <span>{fileIcon(attachment.mimeType)}</span>
      <span className="font-medium">{attachment.name}</span>
      <span className="text-muted-foreground ml-1">{formatBytes(attachment.size)}</span>
    </a>
  );
}
