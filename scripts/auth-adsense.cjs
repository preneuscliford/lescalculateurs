#!/usr/bin/env node
/**
 * Authentification OAuth pour l'API AdSense
 * Obtient un refresh_token et le stocke dans .env
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { loadEnvFile } = require("./lib/load-env.cjs");
const { google } = require("google-auth-library") || {};

loadEnvFile();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_PORT = 3123;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET manquants dans .env");
  process.exit(1);
}

// Utiliser google-auth-library
const { OAuth2Client } = require("google-auth-library");

async function main() {
  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/adsense.readonly"],
    prompt: "consent",
  });

  console.log("\n=== Authentification AdSense ===");
  console.log("\n1. Ouvre ce lien dans ton navigateur :");
  console.log(`\n${authUrl}\n`);
  console.log("2. Accepte l'accès à AdSense");
  console.log("3. Copie le code de la page de redirection (dans l'URL après 'code=')");
  console.log(`   (serveur en écoute sur le port ${REDIRECT_PORT}...)\n`);

  // Créer un petit serveur HTTP pour récupérer le code automatiquement
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", REDIRECT_URI);
    const code = url.searchParams.get("code");

    if (code) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "<html><body><h1>✅ Authentification réussie !</h1><p>Tu peux fermer cette page.</p></body></html>",
      );

      server.close();

      try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log("\n✅ Tokens obtenus !");

        if (tokens.refresh_token) {
          // Mettre à jour le .env
          const envPath = path.resolve(__dirname, "..", ".env");
          let env = fs.readFileSync(envPath, "utf8");

          if (env.includes("ADSENSE_REFRESH_TOKEN=")) {
            env = env.replace(
              /ADSENSE_REFRESH_TOKEN=.*/,
              `ADSENSE_REFRESH_TOKEN=${tokens.refresh_token}`,
            );
          } else {
            env += `\nADSENSE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
          }

          fs.writeFileSync(envPath, env, "utf8");
          console.log("✅ Refresh token sauvegardé dans .env (ADSENSE_REFRESH_TOKEN)");

          // Test : lister les comptes
          console.log("\n🔍 Test d'accès aux comptes AdSense...");
          oauth2Client.setCredentials(tokens);
          try {
            const res = await oauth2Client.request({
              url: "https://adsense.googleapis.com/v2/accounts",
              method: "GET",
            });
            console.log("Comptes AdSense :", JSON.stringify(res.data, null, 2));
          } catch (e) {
            console.log("Erreur liste comptes:", e.message);
            if (e.response) console.log("Status:", e.response.status);
          }
        } else {
          console.log("⚠ Aucun refresh_token retourné (peut déjà exister)");
          console.log("Access token:", tokens.access_token?.slice(0, 20) + "...");
        }
      } catch (err) {
        console.error("❌ Erreur échange token:", err.message);
      }
    } else {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Code manquant dans l'URL");
    }
  });

  server.listen(REDIRECT_PORT, () => {
    console.log(
      `Serveur en écoute sur http://localhost:${REDIRECT_PORT} - attends la redirection OAuth...`,
    );
  });
}

main().catch((e) => console.error("Erreur:", e.message));
