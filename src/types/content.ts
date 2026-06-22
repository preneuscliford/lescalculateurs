export interface ContentFrontmatter {
  title: string;
  slug: string;
  category: string;
  type: "actualite" | "guide";
  publishedAt: string;
  updatedAt: string;
  description: string;
  tags: string[];
  calculateurs: string[];
  guides: string[];
  actualites: string[];
}

export interface ContentItem {
  frontmatter: ContentFrontmatter;
  body: string;
  htmlBody: string;
  slug: string;
  type: "actualite" | "guide";
  sourcePath: string;
}

export interface CategoryPage {
  slug: string;
  name: string;
  description: string;
  actualites: ContentItem[];
  guides: ContentItem[];
  calculateurs: CalculateurLink[];
}

export interface CalculateurLink {
  slug: string;
  name: string;
  url: string;
  description: string;
}
