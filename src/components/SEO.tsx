import { useEffect } from "react";

type SEOProps = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  schema?: Record<string, unknown> | Record<string, unknown>[];
};

const SITE_URL = "https://www.fintechschema.com";
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", url);
}

function upsertJsonLd(schema: Record<string, unknown> | Record<string, unknown>[]) {
  let element = document.head.querySelector<HTMLScriptElement>(
    'script[data-fintechschema-seo="true"]'
  );

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.setAttribute("data-fintechschema-seo", "true");
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
}

function SEO({ title, description, path, noindex = false, schema }: SEOProps) {
  useEffect(() => {
    const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
    const canonicalUrl = `${SITE_URL}${normalizedPath}`;

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:site_name", "FintechSchema");
    upsertMeta("property", "og:image", DEFAULT_IMAGE);
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", DEFAULT_IMAGE);
    upsertCanonical(canonicalUrl);

    const pageSchema: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonicalUrl,
      isPartOf: {
        "@type": "WebSite",
        name: "FintechSchema",
        url: SITE_URL,
      },
    };

    upsertJsonLd(
      schema
        ? [pageSchema, ...(Array.isArray(schema) ? schema : [schema])]
        : pageSchema
    );
  }, [description, noindex, path, schema, title]);

  return null;
}

export default SEO;
