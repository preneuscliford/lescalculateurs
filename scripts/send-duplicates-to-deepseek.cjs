#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const DUPLICATES_JSON = path.join(root, "temp", "duplicates-for-deepseek.json");
const OUT_RESPONSE = path.join(
  root,
  "temp",
  "deepseek-duplicates-response.json"
);

function readEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return process.env;
  const txt = fs.readFileSync(envPath, "utf8");
  txt.split(/\r?\n/).forEach((line) => {
    const m = /^([^=]+)=(.*)$/.exec(line);
    if (m) process.env[m[1].trim()] = m[2].trim();
  });
  return process.env;
}

readEnv();

const API_URL =
  process.env.DEEPSEEK_API_URL ||
  "https://api.deepseek.com/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY || null;

if (!API_KEY) {
  console.error("DEEPSEEK_API_KEY not set");
  process.exit(1);
}

if (!fs.existsSync(DUPLICATES_JSON)) {
  console.error("Missing", DUPLICATES_JSON);
  process.exit(2);
}

const duplicates = JSON.parse(fs.readFileSync(DUPLICATES_JSON, "utf8"));

const prompt = `${duplicates.instruction}\n\n${JSON.stringify(
  duplicates.clusters,
  null,
  2
)}\n\nRespond with a JSON object where each key is the clusterId, and the value is an object with department codes as keys and unique sentence as values.`;

const payload = {
  model: "deepseek-chat",
  messages: [
    {
      role: "user",
      content: prompt,
    },
  ],
  max_tokens: 8192,
  temperature: 0.7,
};

const BATCH_SIZE = 10; // Process 10 clusters at a time

(async function main() {
  try {
    const totalClusters = duplicates.clusters.length;
    const responses = {};

    for (let i = 0; i < totalClusters; i += BATCH_SIZE) {
      const batch = duplicates.clusters.slice(i, i + BATCH_SIZE);
      const batchPrompt = `${duplicates.instruction}\n\n${JSON.stringify(
        batch,
        null,
        2
      )}\n\nRespond with a JSON object where each key is the clusterId, and the value is an object with department codes as keys and unique sentence as values.`;

      const payload = {
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: batchPrompt,
          },
        ],
        max_tokens: 8192,
        temperature: 0.7,
      };

      console.log(
        `Sending batch ${Math.floor(i / BATCH_SIZE) + 1} (${
          batch.length
        } clusters)...`
      );

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API error ${res.status}: ${txt}`);
      }

      const data = await res.json();
      const content = data.choices[0].message.content;

      // Parse the response and merge
      let cleanedContent = content
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      try {
        const batchResponse = JSON.parse(cleanedContent);
        Object.assign(responses, batchResponse);
      } catch (e) {
        console.error("Failed to parse response for batch:", cleanedContent);
        throw e;
      }

      // Wait between requests
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    fs.writeFileSync(OUT_RESPONSE, JSON.stringify(responses, null, 2), "utf8");
    console.log("All responses saved to", OUT_RESPONSE);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
