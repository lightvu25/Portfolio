import type { ServiceCategoryItem } from "@/types/content";

export const serviceCategories: ServiceCategoryItem[] = [
  {
    id: "landing-page",
    code: "S.01",
    title: "Landing Pages",
    shortSummary:
      "Focused single-page websites built around one clear offer, product launch, or service inquiry.",
    description:
      "Designed for speed and clarity when you need visitors to understand what you offer within seconds and take a single action—book a call, request a quote, or sign up.",
    idealFor: "Service launches, workshops, local promotions, and focused campaigns",
    typicalFeatures: [
      "Clear value-proposition hierarchy and call-to-action flow",
      "Responsive layout tuned for social and mobile ad traffic",
      "Lead capture or inquiry form with validation",
      "Search and social preview metadata",
    ],
    icon: "layout",
  },
  {
    id: "portfolio",
    code: "S.02",
    title: "Personal & Creative Portfolios",
    shortSummary:
      "Distinctive showcases for photographers, designers, consultants, and independent creators.",
    description:
      "Presents your work with custom visual direction, fast media galleries, and structured case studies so prospective clients understand your craft and how to hire you.",
    idealFor: "Photographers, studios, independent professionals, and creators",
    typicalFeatures: [
      "Custom art-directed layout rather than generic templates",
      "Curated galleries or project case-study pages",
      "Optimized media loading without layout shifts",
      "Integrated inquiry or commission request form",
    ],
    icon: "spark",
  },
  {
    id: "business-website",
    code: "S.03",
    title: "Small Business & SME Websites",
    shortSummary:
      "Credible multi-page websites that explain your services, build trust, and bring in qualified leads.",
    description:
      "Organizes your services, company background, FAQs, and contact routes into a clean, maintainable website that works reliably on every screen size.",
    idealFor: "Local shops, clinics, agencies, studios, and growing SMEs",
    typicalFeatures: [
      "Multi-page architecture (Home, Services, About, Contact, FAQ)",
      "Structured service breakdowns for non-technical buyers",
      "Technical SEO fundamentals, sitemap, and clean URLs",
      "Accessible navigation and fast page loads",
    ],
    icon: "store",
  },
  {
    id: "booking-website",
    code: "S.04",
    title: "Booking & Appointment Websites",
    shortSummary:
      "Websites with guided session selection, availability requests, or appointment scheduling.",
    description:
      "Replaces scattered chat messages with a structured booking flow—ideal for studios, salons, photographers, tutors, and service providers.",
    idealFor: "Photography studios, salons, clinics, consultations, and rentals",
    typicalFeatures: [
      "Service or package selection tied directly to booking forms",
      "Date/time preference capture or calendar integration",
      "Automated confirmation notifications and structured intake data",
      "Mobile-friendly multi-step or single-view booking UX",
    ],
    icon: "calendar",
  },
  {
    id: "cms-admin",
    code: "S.05",
    title: "Websites with CMS or Admin Control",
    shortSummary:
      "Self-editable websites where you or your team can publish projects, articles, prices, or schedules.",
    description:
      "Pairs a custom frontend with a clean content dashboard or admin panel so routine text, photo, and listing updates never require touching code.",
    idealFor: "Teams updating portfolios, menus, blog posts, or service catalogs regularly",
    typicalFeatures: [
      "Tailored content fields with guardrails so layouts stay intact",
      "Role-appropriate admin dashboard or headless CMS integration",
      "Media upload workflows and preview support",
      "Editor handover documentation",
    ],
    icon: "sliders",
  },
  {
    id: "ecommerce",
    code: "S.06",
    title: "E-Commerce Storefronts",
    shortSummary:
      " curated online shops with product catalogs, cart flows, and payment gateway integration.",
    description:
      "Built for independent brands and shops that want a clean, trustworthy buying experience across mobile and desktop without bloated storefront clutter.",
    idealFor: "Independent retail shops, boutique brands, and digital/physical product sellers",
    typicalFeatures: [
      "Product catalog, variants, filtering, and detail pages",
      "Cart, checkout, and payment provider integration",
      "Order management notifications and inventory structure",
      "Mobile checkout optimization",
    ],
    icon: "cart",
  },
  {
    id: "custom-web-app",
    code: "S.07",
    title: "Custom Frontend & Backend Solutions",
    shortSummary:
      "Bespoke interactive interfaces, client portals, databases, and API integrations.",
    description:
      "When off-the-shelf builders fall short—custom interactive tools, bespoke calculators, internal dashboards, or full-stack web applications.",
    idealFor: "Businesses with custom workflows, databases, or interactive product needs",
    typicalFeatures: [
      "Custom database schema, authentication, and API architecture",
      "Interactive frontend engineering and custom UI motion",
      "Third-party CRM, payment, email, or webhook integrations",
      "Performance budgeting and maintainable TypeScript codebase",
    ],
    icon: "code",
  },
];

export const homeServicesPreviewIds: ServiceCategoryItem["id"][] = [
  "landing-page",
  "portfolio",
  "business-website",
  "booking-website",
];
