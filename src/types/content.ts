export const PLACEHOLDER_PREFIX = "⟨PLACEHOLDER:" as const;
export const PLACEHOLDER_SUFFIX = "⟩" as const;

/**
 * Helper to create a machine-detectable, human-readable placeholder string.
 * `npm run check:placeholders` scans `src/content` for `⟨PLACEHOLDER:...⟩`
 * and components render these cleanly without pretending they are final claims.
 */
export function placeholder(label: string): string {
  return `${PLACEHOLDER_PREFIX} ${label}${PLACEHOLDER_SUFFIX}`;
}

export function isPlaceholder(value: string): boolean {
  return value.includes(PLACEHOLDER_PREFIX);
}

export type WebsiteType =
  | "landing-page"
  | "portfolio"
  | "business-website"
  | "booking-website"
  | "cms-admin"
  | "ecommerce"
  | "custom-web-app";

export type ProjectCategory =
  | "Portfolio & Booking"
  | "Business Website"
  | "Landing Page"
  | "Custom Web App";

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  isPlaceholder?: boolean;
}

export interface ProjectChallenge {
  title: string;
  problem: string;
  solution: string;
}

export interface CaseStudy {
  overview: string;
  problemAndGoal: string[];
  roleSummary: string;
  deliverables: string[];
  approach: {
    step: string;
    title: string;
    detail: string;
  }[];
  challenges: ProjectChallenge[];
  gallery: ImageAsset[];
  outcome: string;
  outcomeNotes?: string;
}

export interface Project {
  slug: string;
  index: string;
  title: string;
  subtitle: string;
  featured: boolean;
  category: ProjectCategory;
  projectType: string;
  year: string;
  clientType: string;
  role: string[];
  stack: string[];
  stackConfirmed: boolean;
  summary: string;
  highlights: string[];
  cover: ImageAsset;
  liveUrl?: string;
  liveLabel?: string;
  caseStudy: CaseStudy;
}

export interface ServiceCategoryItem {
  id: WebsiteType;
  code: string;
  title: string;
  shortSummary: string;
  description: string;
  idealFor: string;
  typicalFeatures: string[];
  icon: "layout" | "spark" | "store" | "calendar" | "sliders" | "cart" | "code";
}

export interface PricingPackage {
  id: "starter" | "growth" | "custom";
  badge: string;
  name: string;
  startingPrice: string;
  priceNote: string;
  intendedCustomer: string;
  summary: string;
  includedFeatures: string[];
  excludedFeatures: string[];
  estimatedDelivery: string;
  revisionPolicy: string;
  supportPeriod: string;
  highlighted?: boolean;
  cta: {
    label: string;
    presetWebsiteType: WebsiteType;
  };
}

export interface ServiceAddOn {
  id: string;
  name: string;
  description: string;
  pricingLabel: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  durationHint: string;
  summary: string;
  clientReceives: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteConfig {
  personName: string;
  brandTitle: string;
  tagline: string;
  description: string;
  locationLabel: string;
  availabilityLabel: string;
  responseWindow: string;
  contactEmail: string;
  inquiryEndpoint: string;
  socialLinks: {
    label: string;
    href: string;
    isPlaceholder?: boolean;
  }[];
  budgetOptions: {
    value: string;
    label: string;
  }[];
  timelineOptions: {
    value: string;
    label: string;
  }[];
}
