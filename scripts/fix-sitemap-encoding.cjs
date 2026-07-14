#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const sitemapPath = path.resolve(__dirname, "..", "public", "sitemap.xml");

function fixSitemapEncoding() {
  if (!fs.existsSync(sitemapPath)) {
    console.error(`Sitemap not found: ${sitemapPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(sitemapPath);
  const utf16Marker = Buffer.from("<?xml", "utf16le");
  const utf8Marker = Buffer.from("<?xml", "utf8");

  let start = raw.indexOf(utf16Marker);
  let xml;

  if (start !== -1) {
    xml = raw.slice(start).toString("utf16le");
  } else {
    start = raw.indexOf(utf8Marker);
    if (start !== -1) {
      xml = raw.slice(start).toString("utf8");
    } else {
      xml = raw.toString("utf8");
    }
  }

  xml = xml.replace(/^\uFEFF/, "");
  xml = xml.replace(/^\uFFFD+/u, "");

  if (!xml.startsWith("<?xml")) {
    const xmlIndex = xml.indexOf("<?xml");
    if (xmlIndex !== -1) {
      xml = xml.slice(xmlIndex);
    }
  }

  fs.writeFileSync(sitemapPath, xml, "utf8");
  console.log("✅ sitemap.xml reconverti en UTF-8 propre");
}

fixSitemapEncoding();