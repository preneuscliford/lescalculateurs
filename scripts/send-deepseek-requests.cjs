const fs = require("fs");
const path = require("path");
const os = require("os");

// Simple .env loader (fallback if dotenv not installed)
function loadDotenv(envPath) {
  try {
    const raw = fs.readFileSync(envPath, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) {
        const key = m[1];
        let val = m[2] || "";
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    });
  } catch (_) {}
}

const repoRoot = path.resolve(__dirname, "..");
const envPath = path.resolve(repoRoot, ".env");
if (fs.existsSync(envPath)) loadDotenv(envPath);

const API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL =
  process.env.DEEPSEEK_API_URL ||
  "https://api.deepseek.com/v1/chat/completions";

if (!API_KEY) {
  console.error(
    "Missing DEEPSEEK_API_KEY in environment or .env file. Aborting."
  );
  console.error("Set DEEPSEEK_API_KEY or run with environment var.");
  process.exit(1);
}

const requestsDir = path.resolve(repoRoot, "reports", "deepseek-requests");
const responsesDir = path.resolve(repoRoot, "reports", "deepseek-responses");

async function sendOne(depCode, filePath) {
  const prompt = fs.readFileSync(filePath, "utf8");
  const name = path.basename(filePath, ".txt");
  const outDir = path.join(responsesDir, depCode);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, name + ".html");

  // Build payload for chat completions (DeepSeek uses Chat completions endpoint)
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const maxTokens = Number(process.env.DEEPSEEK_MAX_TOKENS || 800);
  const temperature = Number(process.env.DEEPSEEK_TEMPERATURE || 0.7);
  const payload = {
    model,
    messages: [
      {
        role: "system",
        content:
          "You are an expert content writer. Return a short HTML fragment only, without <html> or <script> tags.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
    temperature,
  };

  if (process.argv.includes("--dry-run")) {
    fs.writeFileSync(
      outPath,
      "<!-- dry-run: response not fetched -->\n" + prompt,
      "utf8"
    );
    console.log(`(dry) wrote ${outPath}`);
    return;
  }
  // Log endpoint and masked key for debugging
  try {
    console.log("DEBUG: DeepSeek API call to", API_URL);
    console.log(
      "DEBUG: using API_KEY prefix",
      API_KEY && API_KEY.slice ? API_KEY.slice(0, 8) + "..." : "n/a"
    );
  } catch (_) {}

  // Resolve a fetch function: prefer global.fetch, then try node-fetch
  let fetchFn =
    typeof globalThis.fetch === "function" ? globalThis.fetch : undefined;
  if (!fetchFn) {
    try {
      const nf = require("node-fetch");
      fetchFn = nf && nf.default ? nf.default : nf;
    } catch (e) {
      fetchFn = undefined;
    }
  }

  if (!fetchFn) {
    console.error(
      "No fetch available in this environment; writing fallback response"
    );
    fs.writeFileSync(
      outPath,
      "<!-- fallback: fetch not available -->\n" + prompt,
      "utf8"
    );
    console.log("wrote (fallback)", outPath);
    return;
  }

  let res;
  try {
    res = await fetchFn(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (fetchErr) {
    console.error(
      "Fetch failed:",
      fetchErr && fetchErr.message ? fetchErr.message : fetchErr
    );
    fs.writeFileSync(
      outPath,
      "<!-- fetch failed: " +
        String(fetchErr && fetchErr.message ? fetchErr.message : fetchErr) +
        " -->\n" +
        prompt,
      "utf8"
    );
    console.log("wrote (fetch-failed)", outPath);
    return;
  }

  if (!res.ok) {
    let txtBody = "";
    try {
      txtBody = await res.text();
    } catch (e) {
      txtBody = "<could not read body>";
    }
    console.error(`HTTP ${res.status} ${res.statusText}: ${txtBody}`);
    // Save the HTTP error body for inspection
    fs.writeFileSync(
      outPath,
      "<!-- HTTP " +
        res.status +
        " " +
        res.statusText +
        " -->\n" +
        txtBody +
        "\n\n<!-- original prompt -->\n" +
        prompt,
      "utf8"
    );
    console.log("wrote (http-error)", outPath);
    return;
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    const txt = await res.text().catch(() => "<no-body>");
    console.warn("Response JSON parse failed, saving raw body");
    fs.writeFileSync(
      outPath,
      "<!-- raw response -->\n" +
        txt +
        "\n\n<!-- original prompt -->\n" +
        prompt,
      "utf8"
    );
    console.log("wrote (raw)", outPath);
    return;
  }

  // Extract text from chat completion response
  let text = "";
  if (json.choices && Array.isArray(json.choices) && json.choices[0]) {
    const choice = json.choices[0];
    if (choice.message && typeof choice.message.content === "string") {
      text = choice.message.content;
    } else if (typeof choice.text === "string") {
      text = choice.text;
    }
  }
  if (!text) text = JSON.stringify(json, null, 2);

  // Save response
  fs.writeFileSync(outPath, text, "utf8");
  console.log("wrote", outPath);
}

async function main() {
  if (!fs.existsSync(requestsDir)) {
    console.error("No requests dir:", requestsDir);
    process.exit(1);
  }

  const deps = fs
    .readdirSync(requestsDir)
    .filter((d) => fs.statSync(path.join(requestsDir, d)).isDirectory());
  const limit = Number(process.env.SAMPLE_COUNT) || deps.length;
  const selected = deps.slice(0, limit);

  console.log(
    "Will process",
    selected.length,
    "departments (limit",
    limit + ")"
  );

  for (const dep of selected) {
    const depDir = path.join(requestsDir, dep);
    const files = fs.readdirSync(depDir).filter((f) => f.endsWith(".txt"));
    for (const f of files) {
      const fp = path.join(depDir, f);
      try {
        await sendOne(dep, fp);
      } catch (e) {
        console.error("Error sending", fp, e && e.message);
      }
      // small delay to avoid bursts
      await new Promise((r) =>
        setTimeout(r, Number(process.env.DEEPSEEK_RATE_MS || 300))
      );
    }
  }

  console.log("Done. Responses are under", responsesDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
