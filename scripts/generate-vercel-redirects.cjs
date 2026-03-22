#!/usr/bin/env node

/**
 * Script pour generer les regles de redirection Vercel
 * Corrige tous les problemes d'indexation Google
 */

const fs = require("fs");
const path = require("path");

// Lire les redirects analyses
const redirectsData = require("./google-indexing-redirects.json");

const redirects = [];

// 1. Redirection HTTP → HTTPS (force HTTPS)
redirects.push({
  source: "/:path*",
  destination: "https://$host/:path*",
  permanent: true,
  has: [{ type: "protocol", value: "http" }],
});

// 2. Redirection Apex Domain (sans www) → www
// Pour les URLs en .html ET sans .html
redirects.push({
  source: "/:path*",
  destination: "https://www.lescalculateurs.fr/:path*",
  permanent: true,
  has: [{ type: "host", value: "^lescalculateurs\\.fr$" }],
});

// 3. Redirection des URLs avec .html → sans .html
// Cette regle doit etre AVANT la regle de clean URLs
redirects.push({
  source: "/(.*)\\.html",
  destination: "/$1",
  permanent: true,
});

// 4. Redirection speciale pour /index.html
redirects.push({
  source: "/index.html",
  destination: "/",
  permanent: true,
});

// 5. Vercel automatique avec cleanUrls: true gere aussi:
// - /pages/blog.html → /pages/blog
// - /pages/notaire.html → /pages/notaire
// - etc.

console.log("📝 Regles de redirection generees:");
console.log(JSON.stringify({ cleanUrls: true, redirects }, null, 2));

// Ecrire dans vercel.json
const vercelConfig = {
  cleanUrls: true,
  redirects: redirects,
};

fs.writeFileSync(
  path.resolve(__dirname, "../vercel.json"),
  JSON.stringify(vercelConfig, null, 2)
);

console.log("\n✅ vercel.json mis a jour avec les redirects");
console.log(`   ${redirects.length} regles de redirection configurees`);

// Resume des redirects
console.log("\n📋 RESUME DES REDIRECTS:");
console.log("1. HTTP → HTTPS (protocol redirect)");
console.log(
  "2. lescalculateurs.fr → www.lescalculateurs.fr (domain canonicalization)"
);
console.log("3. *.html → sans extension (clean URLs)");
console.log("4. /index.html → / (root canonicalization)");
console.log(
  "\n✨ Avec cleanUrls: true, Vercel gere automatiquement les variantes"
);
