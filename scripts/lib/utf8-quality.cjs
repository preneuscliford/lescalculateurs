const chardet = require("chardet");
const iconv = require("iconv-lite");

const REPLACEMENT_CHAR = "\uFFFD";
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const MOJIBAKE_PATTERNS = [
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a9",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a8",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00aa",
  "\u00c3\u0192\u00c6\u2019 ",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a2",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00b4",
  "\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a7",
  "\u00c3\u0192\u00c6\u2019\u00c3\u00a2\u201a\u00ac\u00c2\u00b0",
  "\u00c3\u0192\u00c6\u2019\u00c3\u00a2\u20ac\u0161\u00c2\u00ac",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u20ac\u017e\u00c2\u00a2",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u2026\u201c",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u201a\u00c2\u009d",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u201a\u00ac\u00c5\u201c",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u201a\u00ac\u00c2\u009d",
  "\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u201a\u00ac\u00c5\u00a1\u00c3\u201a\u00c2\u00ac",
  "\u00c3\u0192\u00c2\u00af\u00c3\u201a\u00c2\u00bb\u00c3\u201a\u00c2\u00bf",
];
const ALLOWED_ENCODINGS = new Set(["UTF-8", "ASCII", "UTF-8-BOM"]);

function hasBom(buffer) {
  return buffer.slice(0, 3).equals(BOM);
}

function stripBom(buffer) {
  return hasBom(buffer) ? buffer.slice(3) : buffer;
}

function detectEncoding(buffer) {
  const detected = chardet.detect(buffer) || "unknown";
  if (hasBom(buffer)) return "UTF-8-BOM";
  return String(detected).toUpperCase();
}

function isValidUtf8Buffer(buffer) {
  const cleanBuffer = stripBom(buffer);
  const decoded = iconv.decode(cleanBuffer, "utf8");
  const reencoded = Buffer.from(decoded, "utf8");
  return cleanBuffer.equals(reencoded);
}

function decodeLikelyText(buffer) {
  const detected = String(chardet.detect(buffer) || "utf-8").toLowerCase();
  const cleanBuffer = stripBom(buffer);

  if (detected.includes("windows-1252")) return iconv.decode(cleanBuffer, "win1252");
  if (detected.includes("iso-8859-1")) return iconv.decode(cleanBuffer, "latin1");
  if (detected.includes("utf-16le")) return iconv.decode(cleanBuffer, "utf16-le");

  return iconv.decode(cleanBuffer, "utf8");
}

function inspectUtf8Buffer(buffer) {
  const encoding = detectEncoding(buffer);
  const decoded = iconv.decode(buffer, "utf8");
  const issues = [];

  if (!ALLOWED_ENCODINGS.has(encoding) && !isValidUtf8Buffer(buffer)) {
    issues.push(`encodage detecte: ${encoding}`);
  }

  if (hasBom(buffer)) {
    issues.push("BOM UTF-8 present");
  }

  if (decoded.includes(REPLACEMENT_CHAR)) {
    issues.push("caractere de remplacement detecte");
  }

  if (MOJIBAKE_PATTERNS.some((pattern) => decoded.includes(pattern))) {
    issues.push("sequence mojibake detectee");
  }

  return issues;
}

module.exports = {
  BOM,
  decodeLikelyText,
  detectEncoding,
  inspectUtf8Buffer,
  isValidUtf8Buffer,
  stripBom,
};
