# Codex FR Guardrails (pSEO)

## Bloc a coller dans les instructions Codex

```
Quand tu modifies ou generes du texte visible utilisateur en francais:
1) Le francais doit etre impeccable (accents, apostrophes, ponctuation fine, accords, formulations naturelles).
2) Ne jamais livrer de texte avec artefacts d'encodage ou formulations robotiques.
3) Appliquer une normalisation francaise sur tous les champs editoriaux avant rendu (title, description, summary, checklist, FAQ).
4) Preserver la casse lors des corrections (ex: "Impot" ne doit pas devenir "impot").
5) Avant de terminer, executer les checks texte du repo et corriger jusqu'au vert.
6) Si un check global est trop large, verifier au minimum le lot de pages genere ce jour.
7) Si une ambiguite grammaticale subsiste, preferer une reformulation simple et naturelle.
```

## Commandes minimales a executer sur un lot genere

```
node scripts/generate-pseo-are.js
node scripts/generate-pseo-prime.js
node scripts/generate-pseo-impot.js
npm run build
```

## Commandes qualite texte (option stricte)

```
npm run text:normalize:check:pseo
npm run text:languagetool:triage:site
```

## Regle de release

Ne pas publier un lot pSEO si le texte visible contient encore des formes comme:

- `scenario`, `scenarios`, `frequentes`, `verifier`, `decote`, `impot` (non accentues dans le texte FR)
- ponctuation ou apostrophes degradees
- formulations non naturelles en francais
