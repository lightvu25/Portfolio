import type { ProcessStep } from "@/types/content";

export const developmentProcess: ProcessStep[] = [
  {
    number: "01",
    title: "Discovery & Scope Alignment",
    durationHint: "Days 1–3",
    summary:
      "We clarify who your visitors are, what action the website needs them to take, and which features are essential now versus later.",
    clientReceives: "Written scope summary, sitemap, timeline range, and fixed or starting quote.",
  },
  {
    number: "02",
    title: "Structure & Visual Direction",
    durationHint: "Week 1–2",
    summary:
      "Page hierarchy, content flow, typography, and interaction direction are mapped out before full engineering begins.",
    clientReceives: "Interactive layout preview or visual direction boards for review.",
  },
  {
    number: "03",
    title: "Frontend & System Implementation",
    durationHint: "Core build",
    summary:
      "Clean, responsive components, animations, forms, and any CMS or booking integrations are built on a private preview link.",
    clientReceives: "Live staging URL to test on your own phone and laptop.",
  },
  {
    number: "04",
    title: "Verification & Content Polish",
    durationHint: "Pre-launch",
    summary:
      "Every breakpoint, keyboard path, form validation state, and loading metric is checked before connecting your domain.",
    clientReceives: "Responsive, accessibility, and SEO pre-launch checklist sign-off.",
  },
  {
    number: "05",
    title: "Launch & Handover",
    durationHint: "Deployment + support",
    summary:
      "Your website goes live with analytics/search basics configured, full ownership of your domain/accounts, and clear handover notes.",
    clientReceives: "Production deployment, editing guide, and post-launch support window.",
  },
];
