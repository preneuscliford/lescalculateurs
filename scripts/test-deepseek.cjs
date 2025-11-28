#!/usr/bin/env node
const fs = require("fs");

function readEnvKey() {
  const envPath = "./.env";
  if (!fs.existsSync(envPath)) return process.env.DEEPSEEK_API_KEY || null;
  const txt = fs.readFileSync(envPath, "utf8");
  const m = txt.match(/^DEEPSEEK_API_KEY=(.*)$/m);
  return m ? m[1].trim() : process.env.DEEPSEEK_API_KEY || null;
}

const key = readEnvKey();
if (!key) {
  console.error("DEEPSEEK_API_KEY not found in .env or environment");
  process.exit(2);
}

(async () => {
  try {
    console.log("Testing DeepSeek API with provided key...");
    const payload = {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are DeepSeek." },
        { role: "user", content: "ping" },
      ],
      max_tokens: 10,
    };

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("HTTP status:", res.status);
    const text = await res.text();
    console.log("Response body:\n", text);
  } catch (err) {
    console.error("Fetch error:");
    console.error(err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
