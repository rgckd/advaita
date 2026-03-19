import { Link } from "wouter";
import { ThemeIcon } from "@/components/ThemeIcon";
import logoImg from "@assets/logo.jpg";
import shankaraImg from "@assets/shankara.jpg";

// Logo: always render as-is — consistent across light and dark mode
function LogoImg({ className }: { className?: string }) {
  return <img src={logoImg} alt="adv.ai.ta" className={className} />;
}

const quotes = [
  { text: "Ekam evadvitiyam — One only, without a second.", source: "Chandogya Upanishad 6.2.1" },
  { text: "Brahma satyam jagan mithya jivo brahmaiva naparah — Brahman is real, the world is apparently real, the individual self is none other than Brahman.", source: "Adi Shankaracharya" },
  { text: "Prajnanam Brahma — Consciousness is Brahman.", source: "Aitareya Upanishad 3.3" },
];

export default function Landing() {
  const quote = quotes[Math.floor(Date.now() / 86400000) % quotes.length];
  return (
    <div className="min-h-screen flex flex-col mandala-bg">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16 text-center">

        {/* Logo */}
        <LogoImg className="w-32 sm:w-44 h-auto mb-6 sm:mb-8" />

        {/* Quote */}
        <blockquote className="w-full max-w-xl mx-auto mb-8 sm:mb-10 px-4 sm:px-6 py-4 sm:py-5 bg-card border border-border rounded-xl">
          <p className="font-serif text-base sm:text-lg italic text-foreground mb-2">"{quote.text}"</p>
          <cite className="text-xs text-muted-foreground not-italic">— {quote.source}</cite>
        </blockquote>

        {/* Shankara image */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto mb-8 sm:mb-10 rounded-xl overflow-hidden border border-border shadow-md">
          <img
            src={shankaraImg}
            alt="Adi Shankaracharya teaching his disciples"
            className="w-full object-cover object-top"
            style={{ height: "clamp(140px, 28vw, 192px)" }}
          />
          <div className="py-3 px-4 bg-card text-center">
            <p className="font-serif text-sm font-semibold text-primary">वन्दे गुरु परम्पराम् ॥</p>
            <p className="text-xs text-muted-foreground italic mt-0.5">Vande Guru Paramparam — I bow to the lineage of teachers</p>
          </div>
        </div>

        {/* Description */}
        <p className="w-full max-w-lg text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed px-2">
          A personalized AI companion for the study of <strong className="text-foreground">Advaita Vedanta</strong> —{" "}
          the ancient non-dual philosophy of Adi Shankaracharya. Study classical texts, reflect deeply,
          and discuss with fellow seekers.
        </p>
        <p className="w-full max-w-lg text-xs sm:text-sm text-muted-foreground mb-8 sm:mb-10 leading-relaxed px-2">
          Contents are based on the{" "}
          <a
            href="https://lists.advaita-vedanta.org/archives/advaita-l/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:opacity-80"
          >
            Advaita-l Archives
          </a>
          {" "}— a repository of scholarly discussions on Advaita Vedanta spanning decades.
        </p>

        {/* CTA */}
        <Link href="/launch">
          <button
            className="px-8 sm:px-10 py-3.5 sm:py-4 bg-primary text-primary-foreground rounded-xl text-sm sm:text-base font-medium hover:opacity-90 transition-opacity shadow-lg"
            data-testid="button-begin-inquiry"
          >
            Begin Your Inquiry
          </button>
        </Link>
      </div>

      {/* Features — Shravana / Manana / Nididhyasana */}
      <div className="bg-card border-t border-border py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: "shravana" as const, title: "Shravana — Listening", desc: "AI-guided exploration of Advaita concepts: Maya, Atman, Brahman, Avidya, and more. Texts, videos, and study maps." },
            { icon: "manana" as const, title: "Manana — Reflection", desc: "A personal diary to record your insights and reflections after each study session, building your own understanding over time." },
            { icon: "nididhyasana" as const, title: "Nididhyasana — Satsang", desc: "Discuss with fellow seekers in Satsang groups. AI companion summarizes debates and connects key arguments." },
          ].map(f => (
            <div key={f.title} className="text-center px-4 py-5 sm:p-6">
              <div className="flex justify-center mb-4 sm:mb-5">
                <ThemeIcon name={f.icon} size="lg" />
              </div>
              <h3 className="font-serif text-sm sm:text-base font-semibold mb-2 text-foreground">{f.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        <a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Created with Perplexity Computer
        </a>
      </footer>
    </div>
  );
}
