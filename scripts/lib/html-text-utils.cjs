const ENTITY_MAP = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  agrave: "à",
  acirc: "â",
  ccedil: "ç",
  ocirc: "ô",
  ugrave: "ù",
  ucirc: "û",
  icirc: "î",
  iuml: "ï",
  Eacute: "É",
  Egrave: "È",
  Ecirc: "Ê",
  Agrave: "À",
  Ccedil: "Ç",
  OElig: "Œ",
  oelig: "œ",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  ndash: "–",
  mdash: "—",
  hellip: "…",
  euro: "€",
  copy: "©",
};

function decodeHtmlEntities(input) {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (fullMatch, entity) => {
    if (entity[0] === "#") {
      const raw = entity.slice(1);
      const codePoint = raw[0]?.toLowerCase() === "x" ? parseInt(raw.slice(1), 16) : parseInt(raw, 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : fullMatch;
    }

    return Object.prototype.hasOwnProperty.call(ENTITY_MAP, entity) ? ENTITY_MAP[entity] : fullMatch;
  });
}

function cleanExtractedText(input) {
  return decodeHtmlEntities(input)
    .replace(/\s+([,.;:!?\)])/g, "$1")
    .replace(/([,;:!?])(?![\s.,;:!?])/g, "$1 ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function extractVisibleTextFromHtml(content) {
  return cleanExtractedText(
    content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<template[^>]*>[\s\S]*?<\/template>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractSeoTextFromHtml(content) {
  const chunks = [];
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) chunks.push(titleMatch[1]);

  const metaPattern =
    /<meta[^>]+(?:name|property)=(["'])([^"']+)\1[^>]+content=(["'])([\s\S]*?)\3[^>]*>/gi;
  for (const match of content.matchAll(metaPattern)) {
    const key = String(match[2] || "").toLowerCase();
    if (["description", "keywords", "og:title", "og:description", "twitter:title", "twitter:description"].includes(key)) {
      chunks.push(match[4]);
    }
  }

  return cleanExtractedText(chunks.join(" ").replace(/\s+/g, " ").trim());
}

module.exports = {
  decodeHtmlEntities,
  extractSeoTextFromHtml,
  extractVisibleTextFromHtml,
};
