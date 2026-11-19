import { placeholder, type PricingPackage, type ServiceAddOn } from "@/types/content";

/**
 * Editable starting-price model.
 * Replace `placeholder(...)` values in this file with real figures and policies
 * before publishing commercial pricing claims.
 */
export const pricingPackages: PricingPackage[] = [
  {
    id: "starter",
    badge: "TIER 01",
    name: "Focused Launch",
    startingPrice: placeholder("Starter starting price"),
    priceNote: "Starting from — single-page or compact personal site",
    intendedCustomer:
      "Individuals, freelancers, and creators needing a sharp landing page or concise personal portfolio.",
    summary:
      "A custom-designed, responsive single-page website or compact portfolio focused on clarity, fast loading, and direct inquiries.",
    includedFeatures: [
      "Custom responsive UI (up to 1 long-form page or 2–3 compact views)",
      "Mobile, tablet, and desktop layout adaptation",
      "Contact or project inquiry form integration",
      "Core technical SEO setup (metadata, Open Graph, sitemap)",
      "Deployment setup on modern hosting",
    ],
    excludedFeatures: [
      "Content management system (CMS) or admin login",
      "Real-time booking calendars or database storage",
      "Online payments, cart, or e-commerce catalog",
      "Complex custom backend APIs",
    ],
    estimatedDelivery: placeholder("1–2 weeks"),
    revisionPolicy: placeholder("2 structured design/build revision rounds"),
    supportPeriod: placeholder("14 days post-launch bug-fix support"),
    cta: {
      label: "Inquire about Focused Launch",
      presetWebsiteType: "landing-page",
    },
  },
  {
    id: "growth",
    badge: "TIER 02",
    name: "Studio & Business",
    startingPrice: placeholder("Business starting price"),
    priceNote: "Starting from — multi-page business or portfolio + inquiry flow",
    intendedCustomer:
      "Small businesses, photography/creative studios, and shops needing multiple pages and structured lead capture.",
    summary:
      "A complete multi-page website explaining your services, showcasing past work, and guiding visitors through a tailored inquiry or booking request.",
    includedFeatures: [
      "Custom multi-page design & frontend architecture (e.g., 4–7 core pages)",
      "Interactive portfolio gallery or structured service catalog",
      "Guided inquiry or session request form with validation",
      "Optional lightweight CMS setup for editing projects or posts",
      "Purposeful scroll, hover, and responsive micro-interactions",
      "Performance, accessibility, and cross-device verification",
    ],
    excludedFeatures: [
      "Full e-commerce cart, inventory, and payment gateway checkout",
      "Multi-user custom admin portals or complex role permissions",
      "Custom database-backed business logic beyond CMS/forms",
    ],
    estimatedDelivery: placeholder("3–5 weeks"),
    revisionPolicy: placeholder("2–3 milestone-based revision rounds"),
    supportPeriod: placeholder("30 days post-launch support & handover"),
    highlighted: true,
    cta: {
      label: "Inquire about Studio & Business",
      presetWebsiteType: "business-website",
    },
  },
  {
    id: "custom",
    badge: "TIER 03",
    name: "Booking, Commerce & Custom Systems",
    startingPrice: placeholder("Custom starting price"),
    priceNote: "Starting from — scoped individually based on workflows & integrations",
    intendedCustomer:
      "SMEs and growing brands requiring live booking calendars, admin dashboards, databases, or online payments.",
    summary:
      "End-to-end architecture for websites with operational workflows—appointment management, custom admin panels, e-commerce checkouts, or bespoke web apps.",
    includedFeatures: [
      "Technical discovery and written architecture specification",
      "Custom booking engine, e-commerce checkout, or database integration",
      "Admin dashboard or CMS tailored to staff workflows",
      "Payment gateway, email notification, or third-party API hooks",
      "Staging environment review, security checks, and team onboarding",
    ],
    excludedFeatures: [
      "Third-party SaaS subscription fees, domain renewals, or payment processing fees",
      "Unscoped post-launch feature expansions (quoted separately or via retainer)",
    ],
    estimatedDelivery: placeholder("5–10+ weeks depending on scope"),
    revisionPolicy: placeholder("Iterative milestone sign-offs per phase"),
    supportPeriod: placeholder("30–60 days post-launch stabilization support"),
    cta: {
      label: "Discuss a Custom Scope",
      presetWebsiteType: "booking-website",
    },
  },
];

export const serviceAddOns: ServiceAddOn[] = [
  {
    id: "cms-integration",
    name: "Self-Editable CMS Setup",
    description:
      "Add an easy editor interface so you can publish new portfolio albums, service updates, or articles yourself.",
    pricingLabel: `From ${placeholder("CMS add-on price")}`,
  },
  {
    id: "booking-module",
    name: "Session / Appointment Booking Flow",
    description:
      "Structured package picker, date/time slot request or calendar sync, and automated email confirmations.",
    pricingLabel: `From ${placeholder("Booking add-on price")}`,
  },
  {
    id: "multilingual",
    name: "Bilingual / Multi-Language Support",
    description:
      "Localized routing, language switcher, and translated content structure (e.g., Vietnamese + English).",
    pricingLabel: `From ${placeholder("Multilingual add-on price")}`,
  },
  {
    id: "payment-checkout",
    name: "Deposit or Payment Integration",
    description:
      "Collect booking deposits or product payments via established local or international payment providers.",
    pricingLabel: `Scoped on request (${placeholder("Payment add-on starting price")})`,
  },
  {
    id: "content-structuring",
    name: "Page Structure & Copy Editing",
    description:
      "Help organizing rough notes into clear headlines, service descriptions, and FAQs for non-technical readers.",
    pricingLabel: `From ${placeholder("Copy structuring price")}`,
  },
  {
    id: "care-plan",
    name: "Ongoing Maintenance & Updates",
    description:
      "Periodic dependency updates, backups, small content adjustments, and priority technical support.",
    pricingLabel: `${placeholder("Monthly / quarterly care price")}`,
  },
];
