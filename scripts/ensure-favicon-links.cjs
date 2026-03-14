const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const TARGET_DIRS = [path.join(ROOT, "src", "pages")];

const FAVICON_BLOCK = `    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="manifest" href="/assets/site.webmanifest" />
    <link rel="shortcut icon" href="/assets/favicon.ico" />
`;

function walkHtmlFiles(dir, files) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, files);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!fullPath.endsWith(".html")) continue;
    if (fullPath.includes(".backup-")) continue;
    files.add(fullPath);
  }
}

function hasFaviconBlock(content) {
  return (
    content.includes('rel="apple-touch-icon"') &&
    content.includes('href="/assets/favicon-32x32.png"') &&
    content.includes('href="/assets/favicon-16x16.png"') &&
    content.includes('href="/assets/site.webmanifest"') &&
    content.includes('rel="shortcut icon"')
  );
}

function injectFaviconBlock(content) {
  if (hasFaviconBlock(content)) return content;

  const stylesheetIndex = content.indexOf('<link rel="stylesheet"');
  if (stylesheetIndex !== -1) {
    return `${content.slice(0, stylesheetIndex)}${FAVICON_BLOCK}${content.slice(stylesheetIndex)}`;
  }

  const scriptIndex = content.indexOf("<script");
  if (scriptIndex !== -1) {
    return `${content.slice(0, scriptIndex)}${FAVICON_BLOCK}${content.slice(scriptIndex)}`;
  }

  const headCloseIndex = content.indexOf("</head>");
  if (headCloseIndex !== -1) {
    return `${content.slice(0, headCloseIndex)}${FAVICON_BLOCK}${content.slice(headCloseIndex)}`;
  }

  return content;
}

const htmlFiles = new Set();
for (const dir of TARGET_DIRS) {
  walkHtmlFiles(dir, htmlFiles);
}

let updatedCount = 0;
for (const filePath of htmlFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const next = injectFaviconBlock(source);
  if (next === source) continue;
  fs.writeFileSync(filePath, next, "utf8");
  updatedCount += 1;
}

console.log(`Favicon links ensured: ${updatedCount} fichier(s) mis a jour`);
