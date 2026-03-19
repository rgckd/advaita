/**
 * Themed icon component — saffron-to-gold gradient circle with white SVG icons.
 * Used across Landing, SessionLauncher, and any page needing consistent visual identity.
 */

const GRADIENT = "linear-gradient(135deg, hsl(25 82% 49%), hsl(43 85% 60%))";

type IconName =
  | "explore" | "study-map" | "read" | "diary"
  | "satsang" | "insights" | "assessment" | "go-deeper"
  | "shravana" | "manana" | "nididhyasana";

function IconSVG({ name }: { name: IconName }) {
  switch (name) {
    case "explore":
    case "shravana":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          {/* Magnifying glass with inner lotus hint */}
          <circle cx="14" cy="14" r="7" stroke="white" strokeWidth="2.2" />
          <line x1="19.2" y1="19.2" x2="25" y2="25" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="14" cy="14" r="3" fill="white" opacity="0.35" />
        </svg>
      );
    case "study-map":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          {/* Node graph */}
          <circle cx="8" cy="16" r="2.5" fill="white" />
          <circle cx="16" cy="8" r="2.5" fill="white" />
          <circle cx="24" cy="16" r="2.5" fill="white" />
          <circle cx="16" cy="24" r="2.5" fill="white" />
          <line x1="10" y1="14.5" x2="14" y2="9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="18" y1="9.5" x2="22" y2="14.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="22" y1="17.5" x2="18" y2="22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="22.5" x2="10" y2="17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="16" r="2" fill="white" opacity="0.7" />
        </svg>
      );
    case "read":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          {/* Open scroll */}
          <rect x="8" y="9" width="16" height="14" rx="2" stroke="white" strokeWidth="2" />
          <line x1="11" y1="13" x2="21" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="16" x2="21" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="19" x2="17" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M8 9 Q8 7 10 7 L22 7 Q24 7 24 9" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "diary":
    case "manana":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          {/* Flame of inquiry */}
          <path d="M16 26 C11 26 8 22.5 8 19 C8 14 12 11 14 8 C14 11 16 13 16 13 C16 13 15 9 18 5 C18 5 23 10 23 16 C23 21 20 24 18 25.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 26 C14.3 26 13 24.7 13 23 C13 21 14.8 20 16 19.2 C17.2 20 19 21 19 23 C19 24.7 17.7 26 16 26Z" fill="white" opacity="0.9" />
        </svg>
      );
    case "satsang":
    case "nididhyasana":
      return (
        <svg viewBox="0 0 32 32" className="w-full h-full" aria-hidden>
          <text x="5" y="24" fontFamily="serif" fontSize="22" fill="white" fontWeight="bold">ॐ</text>
        </svg>
      );
    case "insights":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          {/* Lotus bud */}
          <path d="M16 24 C16 24 10 20 10 14 C10 11 13 9 16 9 C19 9 22 11 22 14 C22 20 16 24 16 24Z" stroke="white" strokeWidth="1.8" fill="none" />
          <path d="M16 9 C16 9 12 6 10 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          <path d="M16 9 C16 9 20 6 22 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
          <line x1="16" y1="24" x2="16" y2="27" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="12" y1="27" x2="20" y2="27" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "assessment":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          {/* Target / dharma wheel simplified */}
          <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="2" />
          <circle cx="16" cy="16" r="5" stroke="white" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="2" fill="white" />
          <line x1="16" y1="7" x2="16" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="25" x2="16" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="16" x2="4" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="25" y1="16" x2="28" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "go-deeper":
      return (
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" aria-hidden>
          {/* Downward spiral / ripple */}
          <path d="M16 6 C22 6 26 10 26 16 C26 22 22 26 16 26 C10 26 6 22 6 16 C6 11 9 8 13 7" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M16 10 C19.3 10 22 12.7 22 16 C22 19.3 19.3 22 16 22 C12.7 22 10 19.3 10 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
          <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.9" />
          <path d="M13 7 L16 4 L16 10" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        </svg>
      );
    default:
      return null;
  }
}

export function ThemeIcon({ name, size = "md" }: { name: IconName; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-9 h-9" : size === "lg" ? "w-20 h-20" : "w-14 h-14";
  const inner = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-11 h-11" : "w-7 h-7";
  return (
    <div
      className={`${dims} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ background: GRADIENT }}
    >
      <div className={inner}>
        <IconSVG name={name} />
      </div>
    </div>
  );
}
