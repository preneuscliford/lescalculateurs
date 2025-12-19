#!/usr/bin/env node

/**
 * Script pour générer les règles de redirection Vercel
 * Corrige tous les problèmes d'indexation Google
 */

const fs = require("fs");
const path = require("path");

// Lire les redirects analysés
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
// Cette règle doit être AVANT la règle de clean URLs
redirects.push({
  source: "/(.*)\\.html",
  destination: "/$1",
  permanent: true,
});

// 4. Redirection spéciale pour /index.html
redirects.push({
  source: "/index.html",
  destination: "/",
  permanent: true,
});

// 5. Vercel automatique avec cleanUrls: true gère aussi:
// - /pages/blog.html → /pages/blog
// - /pages/notaire.html → /pages/notaire
// - etc.

console.log("📝 Règles de redirection générées:");
console.log(JSON.stringify({ cleanUrls: true, redirects }, null, 2));

// Écrire dans vercel.json
const vercelConfig = {
  cleanUrls: true,
  redirects: redirects,
};

fs.writeFileSync(
  path.resolve(__dirname, "../vercel.json"),
  JSON.stringify(vercelConfig, null, 2)
);

console.log("\n✅ vercel.json mis à jour avec les redirects");
console.log(`   ${redirects.length} règles de redirection configurées`);

// Résumé des redirects
console.log("\n📋 RÉSUMÉ DES REDIRECTS:");
console.log("1. HTTP → HTTPS (protocol redirect)");
console.log(
  "2. lescalculateurs.fr → www.lescalculateurs.fr (domain canonicalization)"
);
console.log("3. *.html → sans extension (clean URLs)");
console.log("4. /index.html → / (root canonicalization)");
console.log(
  "\n✨ Avec cleanUrls: true, Vercel gère automatiquement les variantes"
);
