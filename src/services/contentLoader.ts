import { marked } from "marked";
import type { ContentFrontmatter, ContentItem } from "../types/content";

// Configure marked for security and proper rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

function parseFrontmatter(raw: string): { frontmatter: ContentFrontmatter; body: string } {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Frontmatter introuvable dans le fichier");
  }

  const yamlBlock = match[1];
  const body = match[2];

  const frontmatter: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentArray: string[] = [];

  const lines = yamlBlock.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Array items: "- value"
    if (trimmed.startsWith("- ") && currentKey) {
      currentArray.push(trimmed.slice(2).trim());
      continue;
    }

    // Flush previous array if any
    if (currentKey && currentArray.length > 0) {
      frontmatter[currentKey] = currentArray;
      currentArray = [];
      currentKey = null;
    }

    // Key: value pairs
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    // Detect array start (empty value after key)
    if (value === "" || !value) {
      currentKey = key;
      currentArray = [];
      continue;
    }

    // Scalar value
    frontmatter[key] = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }

  // Flush remaining array
  if (currentKey && currentArray.length > 0) {
    frontmatter[currentKey] = currentArray;
  }

  return {
    frontmatter: frontmatter as unknown as ContentFrontmatter,
    body,
  };
}

export async function loadContentFile(filePath: string): Promise<ContentItem> {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }

  const raw = await response.text();
  const { frontmatter, body } = parseFrontmatter(raw);
  const htmlBody = marked.parse(body) as string;

  const type = frontmatter.type || "actualite";
  const slug = frontmatter.slug || filePath.split("/").pop()?.replace(".md", "") || "";

  return {
    frontmatter,
    body,
    htmlBody,
    slug,
    type,
    sourcePath: filePath,
  };
}

export async function loadAllContent(): Promise<{
  actualites: ContentItem[];
  guides: ContentItem[];
  bySlug: Map<string, ContentItem>;
}> {
  // In a Vite/Rollup context, we can't dynamically scan directories at runtime
  // This function is for client-side use when content is preloaded
  // The actual content loading happens at build time via scripts/build-content.ts

  const actualites: ContentItem[] = [];
  const guides: ContentItem[] = [];
  const bySlug = new Map<string, ContentItem>();

  return { actualites, guides, bySlug };
}

/**
 * Parses a raw markdown string into a ContentItem.
 * Used at build-time (Node.js) when we read files directly.
 */
export function parseContentFile(
  raw: string,
  slug: string,
  type: "actualite" | "guide",
): ContentItem {
  const { frontmatter, body } = parseFrontmatter(raw);
  const htmlBody = marked.parse(body) as string;

  return {
    frontmatter,
    body,
    htmlBody,
    slug,
    type,
    sourcePath: `content/${type === "actualite" ? "actualites" : "guides"}/${slug}.md`,
  };
}
