"use client";

import type { PresetInquiryDetail } from "@/components/inquiry/InquiryForm";
import { PixelIcon } from "@/components/pixel/PixelIcon";
import { PlaceholderText } from "@/components/ui/PlaceholderText";
import { pricingPackages } from "@/content/pricing";
import type { PricingPackage } from "@/types/content";

function selectPackageForInquiry(pkg: PricingPackage) {
  if (typeof window === "undefined") return;
  const detail: PresetInquiryDetail = {
    websiteType: pkg.cta.presetWebsiteType,
    packageName: `${pkg.name} (${pkg.badge})`,
  };
  window.dispatchEvent(new CustomEvent("preset-inquiry-type", { detail }));

  const target = document.getElementById("project-inquiry");
  if (target) {
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
}

export function PricingSection() {
  return (
    <div className="space-y-8">
      {/* Scope clarity callout */}
      <div className="border border-line bg-paper-card p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-ink-muted">
          <strong className="font-semibold text-ink">
            Transparent &ldquo;Starting from&rdquo; scope model:
          </strong>{" "}
          A single-page portfolio and a multi-workflow website with live booking,
          admin controls, databases, or payments require very different
          engineering depth. Not every service category is bundled into every
          tier—review the included and excluded scope below, and replace the
          marked placeholders in{" "}
          <code className="font-mono text-xs text-ink">src/content/pricing.ts</code>{" "}
          with your commercial starting rates.
        </p>
      </div>

      {/* 3 Pricing Package Cards */}
      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        {pricingPackages.map((pkg) => (
          <article
            key={pkg.id}
            className={`relative flex flex-col justify-between border p-6 sm:p-7 ${
              pkg.highlighted
                ? "border-2 border-ink bg-paper-card"
                : "border-ink bg-paper-card/85"
            }`}
          >
            {pkg.highlighted && (
              <div className="mb-4 inline-flex self-start items-center gap-2 border border-ink bg-accent px-2.5 py-1 font-mono text-[11px] font-medium text-white">
                <span aria-hidden="true" className="h-1.5 w-1.5 bg-pixel" />
                <span>MOST COMMON STARTING POINT</span>
              </div>
            )}

            <div className="space-y-5">
              {/* Header */}
              <div className="space-y-2">
                <span className="font-pixel text-[10px] tracking-wider text-accent">
                  {pkg.badge}
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
                  {pkg.name}
                </h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {pkg.summary}
                </p>
              </div>

              {/* Starting Price Block */}
              <div className="border-y border-line py-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                  Starting from
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink">
                  <PlaceholderText text={pkg.startingPrice} />
                </p>
                <p className="mt-1 font-mono text-xs text-ink-muted">
                  {pkg.priceNote}
                </p>
              </div>

              {/* Intended Customer */}
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
                  Intended for
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink">
                  {pkg.intendedCustomer}
                </p>
              </div>

              {/* Included Features */}
              <div className="space-y-2.5">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink">
                  Included in scope
                </p>
                <ul className="space-y-2 text-sm text-ink-muted">
                  {pkg.includedFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <PixelIcon
                        name="check"
                        size={14}
                        className="mt-1 text-success"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Excluded Features */}
              <div className="space-y-2.5 border-t border-line pt-4">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
                  Not included in base tier
                </p>
                <ul className="space-y-2 text-sm text-ink-subtle">
                  {pkg.excludedFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <PixelIcon
                        name="minus"
                        size={14}
                        className="mt-1 text-line-strong"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Delivery, Revisions, Support */}
              <dl className="space-y-2 border-t border-line pt-4 font-mono text-xs">
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-ink-subtle">Estimated delivery:</dt>
                  <dd className="text-ink">
                    <PlaceholderText text={pkg.estimatedDelivery} compact />
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-ink-subtle">Revisions:</dt>
                  <dd className="text-ink">
                    <PlaceholderText text={pkg.revisionPolicy} compact />
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-ink-subtle">Post-launch support:</dt>
                  <dd className="text-ink">
                    <PlaceholderText text={pkg.supportPeriod} compact />
                  </dd>
                </div>
              </dl>
            </div>

            {/* Package CTA */}
            <div className="mt-7 pt-2">
              <a
                href="#project-inquiry"
                onClick={(e) => {
                  e.preventDefault();
                  selectPackageForInquiry(pkg);
                }}
                className={`pixel-btn flex min-h-12 w-full items-center justify-center gap-2 border border-ink px-4 py-3 font-mono text-xs font-medium ${
                  pkg.highlighted
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "pixel-btn-secondary bg-paper text-ink hover:bg-paper-2"
                }`}
              >
                <span>{pkg.cta.label}</span>
                <PixelIcon name="arrow-right" size={14} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
