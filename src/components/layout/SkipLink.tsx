export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:border-2 focus:border-ink focus:bg-accent focus:px-4 focus:py-2.5 focus:font-mono focus:text-xs focus:font-medium focus:text-white"
    >
      Skip to main content
    </a>
  );
}
