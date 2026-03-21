/**
 * MediaModal — in-app viewer for YouTube videos and PDF/text files.
 * Opens as a full-screen overlay so users never leave the application.
 */
import { useEffect } from "react";

export type MediaItem =
  | { kind: "youtube"; title: string; youtubeId: string }
  | { kind: "pdf"; title: string; dataUrl: string; mimeType?: string }
  | { kind: "url"; title: string; url: string };

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
          <>
            {item.mimeType?.startsWith("image/") ? (
              <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                <img src={item.dataUrl} alt={item.title} className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            ) : item.mimeType === "text/plain" || item.mimeType?.includes("markdown") ? (
              <div className="w-full h-full overflow-auto p-6 bg-background">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed max-w-3xl mx-auto">
                  {/* dataUrl for text is base64 — decode it */}
                  {atob(item.dataUrl.split(",")[1] || "")}
                </pre>
              </div>
            ) : (
              /* PDF — use <object> which works in all modern browsers */
              <object
                data={item.dataUrl}
                type="application/pdf"
                className="w-full h-full"
              >
                {/* Fallback if PDF embedding is blocked */}
                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                  <p className="text-sm">PDF preview is not available in this browser.</p>
                  <a
                    href={item.dataUrl}
                    download={item.title}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90"
                  >
                    Download PDF
                  </a>
                </div>
              </object>
            )}
          </>
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
