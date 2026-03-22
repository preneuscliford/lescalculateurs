import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

async function correctFile(filePath) {
  console.log(`Processing ${filePath}...`);
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(absolutePath, "utf-8");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en langue francaise et en encodage UTF-8. Ta mission est de corriger les erreurs de francais (orthographe, grammaire, ponctuation, accents) dans le code HTML fourni, TOUT EN PRESERVANT STRICTEMENT la structure HTML, les balises, les attributs et le sens des phrases. Corrige egalement les caracteres mal encodes (ex: ðŸ§® -> emoji correct ou entite HTML). Ne change pas le style CSS ni la logique du code. Retourne UNIQUEMENT le code corrige sans aucun commentaire.",
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0,
    });

    const correctedContent = response.choices[0].message.content;

    // basic sanitization to remove markdown code blocks if AI included them
    const cleanContent = correctedContent.replace(/^```html\n?/, "").replace(/\n?```$/, "");

    fs.writeFileSync(absolutePath, cleanContent, "utf-8");
    console.log(`Successfully corrected ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function run() {
  for (const file of filesToCorrect) {
    await correctFile(file);
  }
}

run();
