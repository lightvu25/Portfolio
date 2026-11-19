import { Reveal } from "@/components/motion/Reveal";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { serviceAddOns } from "@/content/pricing";

export function AddOnsSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {serviceAddOns.map((addon, idx) => (
        <Reveal key={addon.id} delayMs={(idx % 3) * 50}>
          <div className="flex h-full flex-col justify-between border border-line bg-paper-card p-5 sm:p-6">
            <div className="space-y-2">
              <h3 className="font-display text-lg font-semibold text-ink">
                {addon.name}
              </h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                {addon.description}
              </p>
            </div>
            <p className="mt-4 border-t border-line pt-3 font-mono text-xs text-ink">
              <PlaceholderText text={addon.pricingLabel} compact />
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
