#!/usr/bin/env node
/**
 * Validation du sitemap.xml avec correction automatique:
 * - Domaine: https://www.lescalculateurs.fr obligatoire dans <loc>
 * - Pas d'extension .html dans <loc>
 * - Echappement XML correct dans <image:loc> (aucun & non echappe)
 * - Presence de xmlns:image sur <urlset>
 * - AUTO-CORRECTION des problemes detectes
 */
const fs = require("fs");
const path = require("path");

function main() {
  const p = path.resolve(__dirname, "../public/sitemap.xml");
  const backupPath = p.replace(".xml", ".xml.backup");
  let xml = fs.readFileSync(p, "utf8");
  const originalXml = xml;

  let ok = true;
  const issues = [];
  const fixes = [];

  console.log("\n📋 VALIDATION ET CORRECTION SITEMAP.XML\n");
  console.log("=".repeat(70));

  // 1) urlset doit contenir xmlns:image
  if (!/\bxmlns:image=/.test(xml)) {
    ok = false;
    issues.push("Manque xmlns:image sur <urlset>");
    if (/<urlset/.test(xml)) {
      xml = xml.replace(
        /<urlset/,
        '<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
      );
      fixes.push("✅ xmlns:image ajoute");
    }
  }

  // 2) Domaine www obligatoire + correction
  let locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const badDomain = locs.filter(
    (u) => !u.startsWith("https://www.lescalculateurs.fr/")
  );
  if (badDomain.length) {
    ok = false;
    issues.push(`Domaine incorrect sur ${badDomain.length} <loc>`);

    // Corriger: lescalculateurs.fr → www.lescalculateurs.fr
    xml = xml.replace(
      /https:\/\/lescalculateurs\.fr\//g,
      "https://www.lescalculateurs.fr/"
    );
    // Corriger: http:// → https://
    xml = xml.replace(
      /http:\/\/lescalculateurs\.fr\//g,
      "https://www.lescalculateurs.fr/"
    );

    fixes.push(`✅ Domaines corriges: ${badDomain.length} URLs`);
  }

  // 3) Pas d'extension .html dans loc + correction
  locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const hasHtml = locs.filter((u) => /\.html\b/i.test(u));
  if (hasHtml.length) {
    ok = false;
    issues.push(`Extensions .html trouvees dans ${hasHtml.length} <loc>`);

    // Corriger: supprimer .html des <loc>
    xml = xml.replace(/<loc>([^<]+)\.html<\/loc>/g, "<loc>$1</loc>");

    fixes.push(`✅ Extensions .html supprimees: ${hasHtml.length} URLs`);
  }

  // 4) Echappement des & dans les image:loc
  const imgLocs = [...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(
    (m) => m[1]
  );
  const badAmp = imgLocs.filter((u) => /&(?!amp;|lt;|gt;|quot;|apos;)/.test(u));
  if (badAmp.length) {
    ok = false;
    issues.push(`Caracteres & non echappes dans ${badAmp.length} <image:loc>`);

    // Corriger: echapper les & non echappes
    xml = xml.replace(
      /<image:loc>([^<]*?)&(?!amp;|lt;|gt;|quot;|apos;)([^<]*?)<\/image:loc>/g,
      "<image:loc>$1&amp;$2</image:loc>"
    );

    fixes.push(`✅ Caracteres & echappes: ${badAmp.length} URLs`);
  }

  // Si corrections ont ete faites
  if (fixes.length > 0) {
    // Sauvegarder backup
    fs.writeFileSync(backupPath, originalXml, "utf8");
    console.log("📁 Backup cree: sitemap.xml.backup\n");

    // Sauvegarder fichier corrige
    fs.writeFileSync(p, xml, "utf8");
    console.log("🔧 Corrections appliquees:");
    fixes.forEach((f) => console.log("   " + f));
  }

  // Validation finale
  console.log("\n✅ Validation finale:");
  locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const finalHtml = locs.filter((u) => /\.html\b/i.test(u));
  const finalBadDomain = locs.filter(
    (u) => !u.startsWith("https://www.lescalculateurs.fr/")
  );

  console.log(
    `   URLs sans .html: ${locs.length - finalHtml.length}/${locs.length}`
  );
  console.log(
    `   URLs avec www: ${locs.length - finalBadDomain.length}/${locs.length}`
  );
  console.log(
    `   URLs en HTTPS: ${locs.filter((u) => u.startsWith("https://")).length}/${
      locs.length
    }`
  );

  console.log("\n" + "=".repeat(70));

  if (finalHtml.length === 0 && finalBadDomain.length === 0) {
    console.log("✨ Sitemap.xml est maintenant valide!");
    console.log("");
  } else {
    console.log("⚠️ Problemes subsistants detectes");
    if (finalHtml.length > 0)
      console.log(`   ${finalHtml.length} URLs avec .html`);
    if (finalBadDomain.length > 0)
      console.log(`   ${finalBadDomain.length} URLs sans www`);
    process.exitCode = 1;
  }
}

main();
