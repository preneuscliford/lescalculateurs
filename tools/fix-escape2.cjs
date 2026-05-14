const fs = require("fs");

let src = fs.readFileSync("scripts/lib/pseo/notaire-pseo-renderer.js", "utf8");

// Fix escapeHtml - the " etc. were decoded
src = src.replace(
  `function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "\"")
    .replace(/'/g, "&#39;");
}`,
  `function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """)
    .replace(/'/g, "&#39;");
}`,
);

fs.writeFileSync("scripts/lib/pseo/notaire-pseo-renderer.js", src, "utf8");
console.log("escapeHtml fixed.");

// Verify
const check = fs.readFileSync("scripts/lib/pseo/notaire-pseo-renderer.js", "utf8");
if (check.includes(`.replace(/&/g, "&")`)) {
  console.log("STILL BROKEN!");
} else if (check.includes(`.replace(/&/g, "&")`)) {
  console.log("FIXED - & present");
} else {
  console.log("UNEXPECTED STATE");
  // print the relevant lines
  const lines = check.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(".replace(/&/g")) console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}
