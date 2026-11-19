import { Reveal } from "@/components/motion/Reveal";
import { PixelIcon } from "@/components/pixel/PixelIcon";
import { serviceCategories } from "@/content/services";

export function ServiceCategoryGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {serviceCategories.map((service, idx) => (
        <Reveal
          key={service.id}
          delayMs={(idx % 3) * 60}
          className={
            idx === serviceCategories.length - 1
              ? "md:col-span-2 lg:col-span-3"
              : ""
          }
        >
          <article className="flex h-full flex-col justify-between border border-ink bg-paper-card p-6 sm:p-7">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center border border-ink bg-paper text-accent">
                  <PixelIcon name={service.icon} size={18} />
                </span>
                <span className="font-mono text-xs text-ink-subtle">
                  {service.code}
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">
                  {service.description}
                </p>
              </div>

              <ul className="space-y-2 border-t border-line pt-4 text-sm text-ink-muted">
                {service.typicalFeatures.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent"
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border-t border-line pt-4 font-mono text-xs text-ink-subtle">
              Ideal for: <span className="text-ink">{service.idealFor}</span>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
