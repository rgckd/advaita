export function AppFooter() {
  return (
    <footer className="w-full py-4 text-center text-xs text-muted-foreground border-t border-border px-4">
      <p>
        Prototype only. Information is static and details are not saved.
      </p>
      <p className="mt-1">
        Contact admin for interest, questions, or feedback:{" "}
        <a
          href="mailto:rgchandar@gmail.com"
          className="underline hover:text-foreground transition-colors"
        >
          rgchandar@gmail.com
        </a>
      </p>
    </footer>
  );
}
