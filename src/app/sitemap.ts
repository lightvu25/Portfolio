import type { MetadataRoute } from "next";

import { projects } from "@/content/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://example.com"
  ).replace(/\/+$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/web-service/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/web-service/work/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/web-service/services/`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/web-service/work/${project.slug}/`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
