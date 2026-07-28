import type { MetadataRoute } from "next";
import { listPackages } from "@/lib/admin/store";
import { defaultPackages } from "@/lib/packages";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/packages",
    "/templates",
    "/journey",
    "/about",
    "/contact",
    "/enquire",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));

  let packages = defaultPackages;
  try {
    packages = await listPackages();
  } catch {
    /* use defaults */
  }

  const packageRoutes = packages.map((pkg) => ({
    url: `${site.url}/packages/${pkg.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...packageRoutes];
}
