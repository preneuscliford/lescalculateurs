#!/bin/bash
###############################################################################
# 🔒 UTF-8 SECURITY SYSTEM - ARCHITECTURE DOCUMENTATION
###############################################################################

# COMPOSANTS
#
# 1. validate-utf8-gate.cjs
#    - Valide que un fichier est en UTF-8 correct
#    - Detecte les corruptions (emojis, caracteres mal encodes)
#    - Peut scanner un dossier complet
#    - Module exportable pour programme autre
#
# 2. safe-run.cjs
#    - Wrapper d'execution obligatoire
#    - Valide AVANT de lancer un script
#    - Bloque tout code corrompu
#    - Usage: safe-run <script.cjs> [args...]
#
# 3. check-integrity.cjs
#    - Verify tous les scripts du dossier scripts/
#    - Peut nettoyer automatiquement
#    - Idéal pour npm script ou CI/CD
#
# 4. cleanup-emergency.cjs
#    - Repare les fichiers corrompus
#    - Remplace les caracteres mal encodes
#    - Valide apres nettoyage
#
# 5. diagnose-encoding.cjs
#    - Rapport de diagnostic complet
#    - Liste les fichiers HTML problematiques
#    - Details des erreurs par fichier
#
# 6. .utf8-rules.json
#    - Configurations des regles d'encodage
#    - Patterns de corruption a bloquer
#    - Actions (BLOCK, WARN, etc)
#
###############################################################################

# WORKFLOW GLOBAL
#
#  [IA genere un script]
#        |
#        v
#  [Script cree par save-run.cjs ou l'IA]
#        |
#        v
#  [check-integrity.cjs executed automatiquement]
#        |
#  Is UTF-8 valid?
#    |         |
#   NON        OUI
#    |         |
#    v         v
# cleanup  continue
# repair   execution
#    |
#    v
# [Re-validate]

###############################################################################

# COMMANDES ESSENTIELLES

# 1. Valider UN script avant execution
node scripts/validate-utf8-gate.cjs scripts/auto-correct-seo.cjs

# 2. Lancer un script AVEC validation automatique
node scripts/safe-run.cjs scripts/auto-correct-seo.cjs

# 3. Verfier TOUS les scripts du dossier
node scripts/check-integrity.cjs

# 4. Diagnostic complet des fichiers HTML
node scripts/diagnose-encoding.cjs

# 5. Nettoyage manuel des fichiers corrompus
node scripts/cleanup-emergency.cjs

# 6. Lancer le script de correction grammaticale (avec protection PowerShell)
powershell -ExecutionPolicy Bypass -File scripts/run-auto-correct.ps1

###############################################################################

# INTEGRATION DANS package.json
#
# "scripts": {
#   "check": "node scripts/check-integrity.cjs",
#   "validate": "node scripts/validate-utf8-gate.cjs",
#   "clean": "node scripts/cleanup-emergency.cjs",
#   "correct": "node scripts/safe-run.cjs scripts/auto-correct-seo.cjs",
#   "pretest": "node scripts/check-integrity.cjs"
# }

###############################################################################

# GIT HOOK (pre-commit) - OPTIONNEL
#
# Ajouter a .git/hooks/pre-commit :
#
# #!/bin/bash
# echo "[GIT-HOOK] Validation UTF-8..."
# node scripts/check-integrity.cjs
# if [ $? -ne 0 ]; then
#   echo "[FAIL] Scripts corrompus. Commit refuse."
#   exit 1
# fi

###############################################################################

# CAS DE USAGE

# SCENARIO 1 : Script genere par l'IA
# $ node scripts/safe-run.cjs <path-to-script>
# [SECURITY] Validation UTF-8 pre-execution...
# [FAIL] Script is corrupted
# [ACTION] Run cleanup...
# $ node scripts/cleanup-emergency.cjs
# [DONE] All fixed
# $ node scripts/safe-run.cjs <path-to-script>
# [OK] Script valid. Launching...

# SCENARIO 2 : Verifier la qualite globale
# $ npm run check
# [CHECK] Verification d'integrite de tous les scripts
# [FAIL] 3 scripts corrompus
# [FIX] Nettoyage automatique lance...
# [OK] Scripts repares.

# SCENARIO 3 : CI/CD Gate
# Dans le pipeline, ajouter :
# npm run check
# npm run correct

###############################################################################

# REGLES D'ENCODAGE STRICTES

# UTF-8 est OBLIGATOIRE pour :
# - Tous les fichiers .cjs / .mjs / .js
# - Tous les fichiers .html
# - Tous les fichiers .json
# - Tous les fichiers generee par des scripts

# BLACKLIST ABSOLUE :
# - ðŸ (emoji mal decode)
# - Ã© (e mal encode)
# - Ã¢ (a tilde mal encode)
# - â€™ (apostrophe courbe)
# - â€' (tiret long mal encode)
# - ï¿½ (unknown/corrupted)
# - \x00 (caractere nul / binaire)

###############################################################################

# BEST PRACTICES

# 1. Toujours utiliser safe-run pour lancer des scripts inconnus
#    JAMAIS directement avec node <script>

# 2. Avant de committer des scripts, run check-integrity
#    npm run check

# 3. Si PowerShell genere un script, nettoyer d'abord
#    node scripts/cleanup-emergency.cjs

# 4. Ajouter des validations UTF-8 dans les scripts generees
#    process.stdout.setEncoding("utf8");

# 5. Valider apres generation, pas avant execution
#    La generation elle-meme peut corrompre

###############################################################################
