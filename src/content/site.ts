import { placeholder, type SiteConfig } from "@/types/content";

export const siteConfig: SiteConfig = {
  personName: placeholder("Your Name"),
  brandTitle: "Creative Developer",
  tagline:
    "Thoughtful websites and booking experiences for creators, independent shops, and growing businesses.",
  description:
    "Creative Developer designing and building fast, responsive websites—from focused landing pages and portfolios to booking flows and custom web systems.",
  locationLabel: placeholder("City / Timezone"),
  availabilityLabel: "Available for selected client projects",
  responseWindow: placeholder("1–2 business days"),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "",
  inquiryEndpoint: process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT?.trim() ?? "",
  socialLinks: [
    {
      label: "GitHub",
      href: placeholder("https://github.com/your-handle"),
      isPlaceholder: true,
    },
    {
      label: "LinkedIn",
      href: placeholder("https://linkedin.com/in/your-handle"),
      isPlaceholder: true,
    },
  ],
  budgetOptions: [
    { value: "unsure", label: "Not sure yet — help me scope it" },
    {
      value: "starter-tier",
      label: `Starter scope (Landing page / Portfolio — from ${placeholder("Starter price")})`,
    },
    {
      value: "business-tier",
      label: `Business scope (Multi-page / CMS — from ${placeholder("Business price")})`,
    },
    {
      value: "custom-tier",
      label: `Custom scope (Booking / E-commerce / Admin — from ${placeholder("Custom price")})`,
    },
  ],
  timelineOptions: [
    { value: "flexible", label: "Flexible — prioritizing quality" },
    { value: "2-4-weeks", label: "Target within 2–4 weeks" },
    { value: "1-2-months", label: "1–2 months" },
    { value: "2-plus-months", label: "2+ months / Phased launch" },
  ],
};

export const navLinks = [
  { href: "/web-service/", label: "Home", code: "01" },
  { href: "/web-service/work/", label: "Work", code: "02" },
  { href: "/web-service/services/", label: "Services", code: "03" },
] as const;
