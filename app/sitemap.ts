import type { MetadataRoute } from "next";

const SITE_URL = "https://heitor-h9.rodrigues-fortini.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
