const fs = require("fs");
const path = require("path");
const https = require("https");
const { loadEnvFile } = require("./lib/load-env.cjs");

// ============================================================================
// FORCE UTF-8 AU NIVEAU NODE.JS (bloque les corruptions PowerShell)
// ============================================================================
process.stdout.setEncoding("utf8");
process.stderr.setEncoding("utf8");

// On charge l'API KEY depuis le .env
const env = loadEnvFile(path.resolve(__dirname, "../.env"));
const apiKey = env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("ERREUR : OPENAI_API_KEY non trouvee dans le fichier .env");
  process.exit(1);
}

// Les fichiers HTML a corriger
const filesToCorrect = [
  "content_SAFE/are.html",
  "content_SAFE/apl.html",
  "content_SAFE/rsa.html",
  "content_SAFE/prime-activite.html",
  "content_SAFE/asf.html",
  "content_SAFE/charges.html",
  "content_SAFE/notaire.html",
  "content_SAFE/impot.html",
  "content_SAFE/crypto-bourse.html",
  "content_SAFE/pret.html",
];

// ============================================================================
// DIAGNOSTIC D'ENCODAGE (detecte les fichiers corrompus par PowerShell)
// ============================================================================

function hasEncodingIssue(text) {
  // Chercher SEULEMENT les vraies corruptions UTF-8 (double-decode)
  // Pas les caracteres corrects Unicode comme les apostrophes courbes
  const trueCorruptions = [
    /[\xc3][\xa9]/g, // e mal decode
    /[\xc3][\xa0]/g, // a mal decode
    /[\xc3][\xb8]/g, // ø mal decode
    /[\xef][\xbf][\xbd]/g, // REPLACEMENT CHARACTER
    /[\xc3][\xb0][\xc2][\x9f]/g, // emoji corrompu
  ];

  return trueCorruptions.some((pattern) => pattern.test(text));
}

function reportEncodingIssue(filePath, hasIssue) {
  if (hasIssue) {
    console.error(`[ENCODING_ISSUE] ${filePath} : detecte`);
    return true;
  }
  return false;
}

// ============================================================================
// 1. RÈGLES HEURISTIQUES LOCALES (detection ultra rapide, sans API)
// ============================================================================

function detectBadFrench(text) {
  const issues = [];

  // Repetitions
  if (/(tres tres|important important|tres important)/i.test(text)) {
    issues.push("repetition");
  }

  // Ponctuation cassee
  if (/[.!?]{2,}/.test(text)) {
    issues.push("ponctuation_double");
  }

  // Phrase mal coupee (majuscule au milieu)
  if (/[a-z] [A-Z]/.test(text)) {
    issues.push("majuscule_mal_placee");
  }

  // Termes mal encodes UTF-8
  if (
    /[\xc3][\xa9]|[\xc3][\xa0]|[\xe2][\x80]|[\xef][\xbf][\xbd]|[\xc3][\xb9]|[\xc3][\xb4]|[\xc3][\xaa]/.test(
      text,
    )
  ) {
    issues.push("encoding_utf8");
  }

  // Accents mal places
  if (/[A-Z] [a-z]/.test(text)) {
    issues.push("accent_majuscule");
  }

  return issues;
}

// ============================================================================
// 2. FIX UTF-8 SIMPLE (100% local)
// ============================================================================

function fixUTF8(text) {
  let corrected = text;

  // Corrections de caracteres mal encodes - utiliser UNIQUEMENT escaped sequences
  // Chaque pattern est lisible et sans risque de corruption
  const replacements = [
    // Accents mal decodes (UTF-8 double-decode)
    [/[\xc3][\xa9]/g, "e"], // e -> e
    [/[\xc3][\xa0]/g, "a"], // a -> a
    [/[\xc3][\xa8]/g, "e"], // e -> e
    [/[\xc3][\xaa]/g, "e"], // e -> e
    [/[\xc3][\xa7]/g, "c"], // c -> c
    [/[\xc3][\xb9]/g, "u"], // u -> u
    [/[\xc3][\xb4]/g, "o"], // o -> o
    [/[\xc3][\xb2]/g, "o"], // o -> o
    [/[\xc3][\xac]/g, "i"], // i -> i
    [/[\xc3][\x89]/g, "E"], // E -> E
    [/[\xc3][\x80]/g, "A"], // A -> A
    // Unicode quotes corruptus
    [/[\xe2][\x80][\x99]/g, "'"], // ' -> '
    [/[\xe2][\x80][\x98]/g, "'"], // ' -> '
    [/[\xe2][\x80][\x9c]/g, '"'], // " -> "
    [/[\xe2][\x80][\x9d]/g, '"'], // " -> "
    [/[\xe2][\x80][\x93]/g, "-"], // - -> -
    [/[\xe2][\x80][\x94]/g, "-"], // - -> -
    // Autres caracteres bizarres
    [/[\xc2][\xa0]/g, " "], // nbsp -> space
    [/[\xef][\xbf][\xbd]/g, "?"], // REPLACEMENT CHAR -> ?
  ];

  for (const [pattern, replacement] of replacements) {
    corrected = corrected.replace(pattern, replacement);
  }

  return corrected;
}

// ============================================================================
// 3. RÈGLES SIMPLES REGEX (grammaire basique)
// ============================================================================

function applySimpleRules(text) {
  let corrected = text;

  // Espaces avant ponctuation (francais)
  corrected = corrected.replace(/ ([!?;:])/g, " $1");

  // a au lieu de A (sauf debut de phrase)
  corrected = corrected.replace(/A ([a-z])/g, "a $1");

  // Apostrophes droites au lieu de courbes
  corrected = corrected.replace(/[\u2019]/g, "'");

  // Tirets longs mal encodes (remplacer par tiret court)
  corrected = corrected.replace(/[\u2013]|[\u2014]/g, "-");

  // Majuscules mal placees (a partir -> a partir)
  corrected = corrected.replace(/([Aa]) [Pp]artir/g, "$1 partir");

  // Accents manquants (a jour -> a jour)
  corrected = corrected.replace(/a jour/g, "a jour");

  return corrected;
}

// ============================================================================
// 4. DECOUPAGE EN BLOCS INTELLIGENTS (ne corriger que les blocs problematiques)
// ============================================================================

function extractTextBlocks(html) {
  // IMPORTANT: Extraire SEULEMENT le contenu texte visible et lisible
  // PAS le code, les fonctions, les donnees, les attributs

  let cleaned = html;

  // 1. Supprimer TOUS les elements non-textuels
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<meta[^>]*>/gi, "");
  cleaned = cleaned.replace(/<link[^>]*>/gi, "");
  cleaned = cleaned.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/gi, "");
  cleaned = cleaned.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
  cleaned = cleaned.replace(/<!--.*?-->/gs, "");

  // 2. Extraire SEULEMENT le texte entre les balises HTML
  const textRegex = />([^<]+)</g;
  const blocks = [];
  let match;

  while ((match = textRegex.exec(cleaned)) !== null) {
    let text = match[1].trim();

    // Filtrer les faux textes (code, JSON, donnees)
    if (
      // Minimum 15 caracteres de contenu reel
      text.length >= 15 &&
      // Ignorer les lignes avec du code/syntaxe
      !/{|%|==|&&|\[\]|function|\$\{|=>|import|export|const |let |var |this\./.test(text) &&
      // Ignorer les URL et chemins de fichiers
      !/^https?:|^\/|^\.\/|^\.\.\/|\.js|\.css|\.html/.test(text) &&
      // Doit avoir au moins quelques caracteres alphabetiques francais/anglais
      (text.match(/[a-zaâäæceeeëîïoöœuûüœñýA-Z0-9]/gi) || []).length >= 10 &&
      // Ignorer les attributs HTML
      !/^[a-z-]+=["|']/.test(text)
    ) {
      blocks.push({
        original: text,
        index: match.index,
      });
    }
  }

  return blocks;
}

// ============================================================================
// 5. SCORE DE QUALITY (decider si OpenAI est necessaire)
// ============================================================================

function computeQualityScore(text, heuristicIssues) {
  let score = 0;

  // Problemes detectes
  score += heuristicIssues.length * 2;

  // Caracteres suspects globaux
  if (/Ã|'|ðŸ||Ù|û|ï/.test(text)) {
    score += 5;
  }

  // Texte tres court = moins fiable
  if (text.length < 100) {
    score += 1;
  }

  // Trop peu de mots
  if (text.split(" ").length < 30) {
    score += 1;
  }

  return score;
}

function shouldUseAI(text) {
  const issues = detectBadFrench(text);
  const score = computeQualityScore(text, issues);

  return score >= 5; // Seuil augmente : seulement les cas serieux
}

// ============================================================================
// 6. APPEL OPENAI (SEULEMENT SI NECESSAIRE)
// ============================================================================

async function callOpenAI(content) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Corrige uniquement les fautes de francais dans ce texte. Ne reformule pas. Ne change pas la structure. Ne touche pas aux chiffres et codes HTML.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const options = {
      hostname: "api.openai.com",
      port: 443,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(responseBody);
            resolve(json.choices[0].message.content);
          } catch (e) {
            reject(new Error("Erreur de parsing OpenAI : " + e.message));
          }
        } else {
          reject(new Error(`Erreur API OpenAI (${res.statusCode}) : ${responseBody}`));
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

// ============================================================================
// 7. VALIDATION AVANT/APRÈS (filet de securite)
// ============================================================================

function isSafeCorrection(original, corrected) {
  const lengthDiff = Math.abs(original.length - corrected.length);
  const maxDiff = Math.max(30, original.length * 0.1); // 10% de tolerance

  return lengthDiff < maxDiff;
}

// ============================================================================
// 8. PIPELINE PRINCIPAL (hybride)
// ============================================================================

async function correctFile(filePath) {
  const html = fs.readFileSync(filePath, "utf-8");
  let corrected = html;

  console.log(`[1/5] UTF-8 fix...`);
  // UTF-8 fix est safe : patterns tres specifiques de corruption
  corrected = fixUTF8(corrected);

  console.log(`[2/5] Extraction textes a corriger...`);
  // Extraction des blocs texte AVANT d'appliquer les regles
  const blocks = extractTextBlocks(corrected);

  // Appliquer les regles simples SEULEMENT sur les blocs texte extraits
  // (pas sur tout l'HTML pour eviter de modifier le code/structure)
  const correctedBlocks = [];
  for (const block of blocks) {
    let blockCorrected = block.original;
    blockCorrected = applySimpleRules(blockCorrected);

    if (blockCorrected !== block.original) {
      correctedBlocks.push({
        original: block.original,
        corrected: blockCorrected,
      });
      corrected = corrected.replaceAll(block.original, blockCorrected);
    }
  }

  console.log(`[3/5] Analyse qualite pour OpenAI...`);
  let aiCallsNeeded = 0;

  for (const block of blocks) {
    const issues = detectBadFrench(block.original);
    const needsAI = shouldUseAI(block.original);

    if (needsAI) {
      aiCallsNeeded++;
    }
  }

  console.log(`[4/5] Regles simples appliquees: ${correctedBlocks.length} bloc(s)`);
  console.log(`[5/6] Analyse OpenAI: ${aiCallsNeeded} blocs necessitent API`);

  if (aiCallsNeeded > 0) {
    console.log(`[6/7] Appel OpenAI (${aiCallsNeeded} blocs)...`);

    for (const block of blocks) {
      if (!shouldUseAI(block.original)) continue;

      try {
        const aiCorrected = await callOpenAI(block.original);

        if (isSafeCorrection(block.original, aiCorrected)) {
          // Utiliser replaceAll() pour remplacer TOUTES les occurrences
          // Pas juste la premiere (plus sûr)
          corrected = corrected.replaceAll(block.original, aiCorrected);
        } else {
          console.warn(
            `⚠️ Correction rejetee (trop differente): ${block.original.substring(0, 50)}...`,
          );
        }

        await new Promise((r) => setTimeout(r, 300)); // Rate limiting
      } catch (err) {
        console.error(`❌ Erreur OpenAI sur bloc: ${err.message}`);
      }
    }
  }

  console.log(`[7/7] Validation finale...`);

  return corrected;
}

async function run() {
  console.log("[INIT] Verification des fichiers HTML...\n");

  // ETAPE 0 : Diagnostic initial
  const brokenFiles = [];
  for (const relativePath of filesToCorrect) {
    const fullPath = path.resolve(__dirname, "../", relativePath);
    if (fs.existsSync(fullPath)) {
      const originalContent = fs.readFileSync(fullPath, "utf-8");
      if (hasEncodingIssue(originalContent)) {
        brokenFiles.push(relativePath);
        reportEncodingIssue(relativePath, true);
      }
    }
  }

  if (brokenFiles.length > 0) {
    console.log(`\n[ALERT] ${brokenFiles.length} fichier(s) avec encodage casse detecte`);
    console.log("STOP : correction requise avant traitement\n");
    process.exit(1);
  }

  console.log("[OK] Tous les fichiers sont en UTF-8 correct\n");

  // ETAPE 1 : Correction
  for (const relativePath of filesToCorrect) {
    const fullPath = path.resolve(__dirname, "../", relativePath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`[SKIP] ${relativePath}`);
      continue;
    }

    console.log(`\n[FILE] ${relativePath}:`);
    try {
      const corrected = await correctFile(fullPath);

      // Protection : verifier que UTF-8 n'a pas ete casse
      if (hasEncodingIssue(corrected)) {
        console.error(`[FAIL] Fichier corrompu apres correction (encodage casse)`);
        process.exit(1);
      }

      // Ecriture avec encodage explicite UTF-8
      fs.writeFileSync(fullPath, corrected, "utf-8");
      console.log(`✅ Termine\n`);
    } catch (err) {
      console.error(`❌ Echec : ${err.message}\n`);
    }
  }
}

run().catch(console.error);
