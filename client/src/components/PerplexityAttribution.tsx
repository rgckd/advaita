export function PerplexityAttribution() {
  const buildCommit = import.meta.env.VITE_BUILD_COMMIT || "dev";
  const buildTimeUtc = import.meta.env.VITE_BUILD_TIME || "";

  return (
    <footer className="w-full py-4 text-center text-xs text-muted-foreground">
      <a
        href="https://www.perplexity.ai/computer"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors"
      >
        Created with Perplexity Computer
      </a>
      <p className="mt-1 text-[10px] text-muted-foreground/80" data-testid="build-version">
        Build {buildCommit}{buildTimeUtc ? ` · ${buildTimeUtc}` : ""}
      </p>
    </footer>
  );
}
