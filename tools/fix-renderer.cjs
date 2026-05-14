const fs = require("fs");
const A = String.fromCharCode;
const AMP = A(38) + A(97, 109, 112, 59); // &
const LT = A(38) + A(108, 116, 59); // <
const GT = A(38) + A(103, 116, 59); // >
const QUOT = A(38) + A(113, 117, 111, 116, 59); // "
const APOS = A(38) + A(35, 51, 57, 59, 59); // &#39;

const src = fs.readFileSync("scripts/lib/pseo/notaire-pseo-renderer.js", "utf8");

// Replace the 5 lines of escapeHtml (currently point to bare &, <, >, ")
const fixed = src
  .replace('.replace(/&/g, "&")', '.replace(/&/g, "' + AMP + '")')
  .replace('.replace(/</g, "<")', '.replace(/</g, "' + LT + '")')
  .replace('.replace(/>/g, ">")', '.replace(/>/g, "' + GT + '")')
  .replace('.replace(/"/g, "\u0022\u0022\u0022")', '.replace(/"/g, "' + QUOT + '")');

fs.writeFileSync("scripts/lib/pseo/notaire-pseo-renderer.js", fixed, "utf8");
console.log("FIXED");
