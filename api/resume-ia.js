/**
 * API Serverless Vercel — Résumé IA
 * Reçoit les données d'un résultat de calculateur, appelle DeepSeek,
 * et renvoie un résumé en 2-4 phrases (50-80 mots).
 *
 * POST /api/resume-ia
 * Body: { calculator: string, resultText: string, pageUrl: string }
 * Response: { summary: string }
 */

// DeepSeek API config
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

// ── System prompt (l'IA ne calcule jamais) ──────────────────
const SYSTEM_PROMPT = `Tu es un assistant qui explique des résultats de calculateurs français.
Ta mission : transformer un résultat de calcul en une explication courte, fiable et immédiatement compréhensible.

RÈGLES ABSOLUES :
- Tu ne fais AUCUN calcul. Tu reçois les chiffres déjà calculés.
- Tu n'inventes jamais de montants.
- Tu ne modifies jamais les résultats.
- Tu ne donnes jamais d'avis juridique.
- Tu n'annonces jamais une réforme comme étant en vigueur.
- Le calculateur reste LA référence. Tu ne fais qu'expliquer.

FORMAT :
- 2 à 4 phrases maximum
- 50 à 80 mots
- Langage simple, pas de jargon administratif
- Explique les CONSÉQUENCES du résultat, pas juste le résultat

TON :
- Positif si le résultat est favorable
- Neutre si l'impact est limité
- Prudent si le résultat est défavorable (suggère de comparer d'autres scénarios)

RÉPONDS UNIQUEMENT avec le texte du résumé. Pas de JSON, pas de markdown, pas d'introduction. Juste le résumé.`;

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée. Utilisez POST." });
  }

  try {
    const { calculator, resultText, pageUrl } = req.body || {};

    if (!resultText || resultText.trim().length < 10) {
      return res.status(400).json({ error: "resultText requis (min 10 caractères)" });
    }

    // Vérifie la clé API
    if (!DEEPSEEK_API_KEY) {
      // Fallback sans API : résumé basique
      return res.status(200).json({
        summary: generateFallbackSummary(calculator, resultText),
        source: "fallback",
      });
    }

    // Construit le prompt utilisateur
    const userPrompt = buildUserPrompt(calculator, resultText, pageUrl);

    // Appel DeepSeek avec timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 250,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`DeepSeek HTTP ${response.status}: ${errText.slice(0, 200)}`);
      }

      const json = await response.json();

      if (json.error) {
        throw new Error(`DeepSeek API error: ${json.error.message || JSON.stringify(json.error)}`);
      }

      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("DeepSeek response missing content");
      }

      return res.status(200).json({
        summary: content.trim(),
        source: "deepseek",
      });
    } catch (apiErr) {
      clearTimeout(timeout);
      console.error("DeepSeek API error:", apiErr.message);

      // Fallback
      return res.status(200).json({
        summary: generateFallbackSummary(calculator, resultText),
        source: "fallback",
        error: apiErr.message,
      });
    }
  } catch (err) {
    console.error("Resume IA handler error:", err.message);
    return res.status(500).json({ error: "Erreur interne du serveur" });
  }
}

// ── Prompt utilisateur ──────────────────────────────────────
function buildUserPrompt(calculator, resultText, pageUrl) {
  const calcName = calculator || "Calculateur";
  return `Calculateur : ${calcName}
Page : ${pageUrl || "lescalculateurs.fr"}

Résultat affiché à l'utilisateur :
${resultText}

Explique ce résultat en 2-4 phrases simples (50-80 mots). L'utilisateur doit comprendre l'essentiel en moins de 10 secondes.`;
}

// ── Résumé de fallback (sans IA) ────────────────────────────
function generateFallbackSummary(calculator, resultText) {
  const calcName = calculator || "ce calculateur";

  // Extrait un montant si présent
  const montantMatch = resultText.match(/(\d[\d\s,.]*)\s*€/);
  const montant = montantMatch ? montantMatch[1].replace(/\s/g, "") + " €" : null;

  if (montant) {
    return `D'après ${calcName}, le montant estimé est de ${montant}. Ce résultat est indicatif et peut varier selon votre situation exacte. Vérifiez les détails ci-dessus pour comprendre la décomposition du calcul.`;
  }

  return `Ce résultat vous donne une estimation basée sur les informations fournies à ${calcName}. Consultez le détail ci-dessus pour comprendre comment ce montant a été calculé, et n'hésitez pas à tester d'autres scénarios.`;
}
