#!/usr/bin/env node
/**
 * Health Check Complet - Execute tous les analyses en une seule commande
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runHealthCheck() {
  console.log("🏥 SITE HEALTH CHECK\n");
  console.log("=".repeat(60));

  try {
    console.log("\n1️⃣  Analyzing Word Count...\n");
    await execAsync("node scripts/analyze-wordcount.js");

    console.log("\n2️⃣  Analyzing H1 Tags...\n");
    await execAsync("node scripts/analyze-h1-tags.js");

    console.log("\n3️⃣  Analyzing Internal Links...\n");
    await execAsync("node scripts/analyze-internal-links.js");

    console.log("\n4️⃣  Analyzing Compression...\n");
    try {
      await execAsync("node scripts/analyze-compression.js");
    } catch (error) {
      console.log("⚠️  dist/ not found. Run `npm run build` first.");
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n✅ Health Check Complete!\n");
  } catch (error) {
    console.error("❌ Error during health check:", error.message);
    process.exit(1);
  }
}

runHealthCheck();
