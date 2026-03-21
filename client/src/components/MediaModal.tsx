/**
 * MediaModal — in-app viewer for YouTube videos and PDF/text files.
 * Opens as a full-screen overlay so users never leave the application.
 */
import { useEffect, useState, useRef } from "react";

export type MediaItem =
  | { kind: "youtube"; title: string; youtubeId: string }
  | { kind: "pdf"; title: string; dataUrl: string; mimeType?: string }
  | { kind: "url"; title: string; url: string };

/** Converts a base64 dataUrl to a blob URL, which is not subject to CSP data: restrictions */
function PdfViewer({ item }: { item: Extract<MediaItem, { kind: "pdf" }> }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const prevUrl = useRef<string | null>(null);

  useEffect(() => {
    const mime = item.mimeType || "application/pdf";
    // Images — just show directly
    if (mime.startsWith("image/")) { setBlobUrl(item.dataUrl); return; }
    // Text — decode base64 and display as text
    if (mime === "text/plain" || mime.includes("markdown")) {
      try { setTextContent(atob(item.dataUrl.split(",")[1] || "")); } catch { setTextContent(item.dataUrl); }
      return;
    }
    // PDF — convert to blob URL to bypass CSP restrictions on data: URIs in iframes
    try {
      const base64 = item.dataUrl.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      prevUrl.current = url;
    } catch (e) {
      setBlobUrl(item.dataUrl); // fallback
    }
    return () => { if (prevUrl.current) URL.revokeObjectURL(prevUrl.current); };
  }, [item.dataUrl, item.mimeType]);

  const mime = item.mimeType || "application/pdf";

  if (mime.startsWith("image/") && blobUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center overflow-auto p-4 bg-background">
        <img src={blobUrl} alt={item.title} className="max-w-full max-h-full object-contain rounded-lg" />
      </div>
    );
  }

  if (textContent !== null) {
    return (
      <div className="w-full h-full overflow-auto p-6 bg-background">
        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed max-w-3xl mx-auto">{textContent}</pre>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <iframe
      src={blobUrl}
      title={item.title}
      className="w-full h-full border-0"
    />
  );
}

interface Props {
  item: MediaItem | null;
  onClose: () => void;
}

export function MediaModal({ item, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [item, onClose]);

  if (!item) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/95 border-b border-border flex-shrink-0">
        <p className="font-serif text-sm font-semibold text-foreground truncate mr-4">{item.title}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs hover:bg-muted/80 transition-colors"
          aria-label="Close viewer"
        >
          ✕ Close
        </button>
      </div>

      {/* Content */}
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

        {item.kind === "pdf" && (
          <PdfViewer item={item} />
        )}

        {item.kind === "url" && (
          <iframe
            src={item.url}
            title={item.title}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  );
}
