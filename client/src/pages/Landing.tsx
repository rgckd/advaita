import { Link } from "wouter";
import { useEffect, useState } from "react";
import logoImg from "@assets/logo.jpg";
import shankaraImg from "@assets/shankara.jpg";

// Renders logo correctly in light mode (multiply removes white bg) and dark mode (invert)
function LogoImg({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return (
    <img
      src={logoImg}
      alt="adv.ai.ta"
      className={className}
      style={isDark
        ? { filter: "invert(1) brightness(0.9)" }
        : { mixBlendMode: "multiply" }
      }
    />
  );
}

const quotes = [
  { text: "Ekam evadvitiyam — One only, without a second.", source: "Chandogya Upanishad 6.2.1" },
  { text: "Brahma satyam jagan mithya jivo brahmaiva naparah — Brahman is real, the world is apparently real, the individual self is none other than Brahman.", source: "Adi Shankaracharya" },
  { text: "Prajnanam Brahma — Consciousness is Brahman.", source: "Aitareya Upanishad 3.3" },
];

// Journey steps with circular flow: post-Assessment → two paths
const journeySteps = [
  { label: "Curiosity", href: "/launch" },
  { label: "Exploration", href: "/explore" },
  { label: "Study Maps", href: "/study-map" },
  { label: "Reading & Listening", href: "/read/maya" },
  { label: "Reflection", href: "/diary" },
  { label: "Satsang", href: "/satsang" },
  { label: "Insights", href: "/insights" },
  { label: "Assessment", href: "/assessment" },
];

export default function Landing() {
  const quote = quotes[Math.floor(Date.now() / 86400000) % quotes.length];
  return (
    <div className="min-h-screen flex flex-col mandala-bg">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">

        {/* Logo — multiply blends away white bg on light bg; dark mode inverts to light */}
        <LogoImg className="w-48 h-auto mb-8" />

        <blockquote className="max-w-xl mx-auto mb-10 px-6 py-5 bg-card border border-border rounded-xl">
          <p className="font-serif text-lg italic text-foreground mb-2">"{quote.text}"</p>
          <cite className="text-xs text-muted-foreground not-italic">— {quote.source}</cite>
        </blockquote>

        {/* Shankara image */}
        <div className="max-w-sm w-full mx-auto mb-10 rounded-xl overflow-hidden border border-border shadow-md">
          <img src={shankaraImg} alt="Adi Shankaracharya teaching his disciples" className="w-full h-48 object-cover object-top" />
          <div className="py-3 px-4 bg-card text-center">
            <p className="font-serif text-sm font-semibold text-primary">वन्दे गुरु परम्पराम् ॥</p>
            <p className="text-xs text-muted-foreground italic mt-0.5">Vande Guru Paramparam — I bow to the lineage of teachers</p>
          </div>
        </div>

        <p className="max-w-lg text-base text-muted-foreground mb-4 leading-relaxed">
          A personalized AI companion for the study of <strong className="text-foreground">Advaita Vedanta</strong> — 
          the ancient non-dual philosophy of Adi Shankaracharya. Study classical texts, reflect deeply, 
          and discuss with fellow seekers.
        </p>
        <p className="max-w-lg text-sm text-muted-foreground mb-10 leading-relaxed">
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

        <Link href="/launch">
          <button
            className="px-10 py-4 bg-primary text-primary-foreground rounded-xl text-base font-medium hover:opacity-90 transition-opacity shadow-lg"
            data-testid="button-begin-inquiry"
          >
            Begin Your Inquiry
          </button>
        </Link>

        {/* Journey steps — circular flow diagram */}
        <div className="mt-16 max-w-3xl w-full">
          <h2 className="font-serif text-xl text-foreground mb-6">The Learning Journey</h2>
          {/* Linear steps 1–8 */}
          <div className="flex flex-wrap justify-center gap-3 text-sm mb-4">
            {journeySteps.map((step, i) => (
              <span key={step.label} className="flex items-center gap-2">
                <Link href={step.href}>
                  <span className="px-3 py-1.5 bg-card border border-border rounded-full text-foreground hover:bg-primary/10 hover:border-primary/40 transition-colors cursor-pointer">
                    {step.label}
                  </span>
                </Link>
                {i < journeySteps.length - 1 && <span className="text-muted-foreground">→</span>}
              </span>
            ))}
          </div>

          {/* Post-Assessment fork */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="text-muted-foreground text-sm">↓ After Assessment, two paths:</span>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/go-deeper">
                <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary/40 rounded-full text-primary text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                  Go Deeper → Study Maps ↺
                </span>
              </Link>
              <span className="text-muted-foreground text-xs">or</span>
              <Link href="/explore">
                <span className="flex items-center gap-2 px-4 py-2 bg-card border-2 border-border rounded-full text-foreground text-sm hover:bg-muted transition-colors cursor-pointer">
                  Explore More Concepts →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-card border-t border-border py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🔍", title: "Shravana — Listening", desc: "AI-guided exploration of Advaita concepts: Maya, Atman, Brahman, Avidya, and more. Texts, videos, and study maps." },
            { icon: "📖", title: "Manana — Reflection", desc: "A personal diary to record your insights and reflections after each study session, building your own understanding over time." },
            { icon: "🕉", title: "Nididhyasana — Satsang", desc: "Discuss with fellow seekers in Satsang groups. AI companion summarizes debates and connects key arguments." },
          ].map(f => (
            <div key={f.title} className="text-center p-6">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-serif text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
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
