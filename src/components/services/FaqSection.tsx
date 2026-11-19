import { serviceFaqs } from "@/content/faq";

export function FaqSection() {
  return (
    <div className="divide-y divide-line border-y border-ink bg-paper-card">
      {serviceFaqs.map((item, idx) => (
        <details key={item.id} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-display text-base font-semibold text-ink transition-colors hover:bg-paper-2/60 sm:px-7 sm:text-lg [&::-webkit-details-marker]:hidden">
            <span className="flex items-baseline gap-3">
              <span className="font-mono text-xs font-normal text-accent">
                0{idx + 1}
              </span>
              <span>{item.question}</span>
            </span>
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center border border-ink bg-paper font-mono text-sm leading-none text-ink transition-transform group-open:bg-ink group-open:text-paper"
            >
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">&minus;</span>
            </span>
          </summary>
          <div className="px-5 pb-5 pl-11 text-sm leading-relaxed text-ink-muted sm:px-7 sm:pb-6 sm:pl-14 sm:text-base">
            <p className="max-w-3xl">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
