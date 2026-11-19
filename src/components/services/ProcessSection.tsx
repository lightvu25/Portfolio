import { Reveal } from "@/components/motion/Reveal";
import { developmentProcess } from "@/content/process";

export function ProcessSection() {
  return (
    <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
      {developmentProcess.map((step, idx) => (
        <Reveal key={step.number} as="li" delayMs={idx * 60}>
          <div className="flex h-full flex-col justify-between border border-ink bg-paper-card p-5 sm:p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="border border-ink bg-ink px-2 py-0.5 font-pixel text-[10px] text-paper">
                  {step.number}
                </span>
                <span className="font-mono text-[11px] text-ink-subtle">
                  {step.durationHint}
                </span>
              </div>

              <h3 className="font-display text-lg font-semibold leading-snug text-ink">
                {step.title}
              </h3>

              <p className="text-sm leading-relaxed text-ink-muted">
                {step.summary}
              </p>
            </div>

            <div className="mt-5 border-t border-line pt-3">
              <p className="font-mono text-[11px] uppercase tracking-wider text-accent">
                Deliverable
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink">
                {step.clientReceives}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
