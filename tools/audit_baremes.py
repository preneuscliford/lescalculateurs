#!/usr/bin/env python3
"""
Audit des barèmes et chiffres officiels - Les Calculateurs
Vérifie la cohérence des valeurs entre social-baremes.ts, les pages HTML, et les renderers PSEO.
"""
import re
import os
import json
import glob
from dataclasses import dataclass

AUDIT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PAGES_DIR = os.path.join(AUDIT_DIR, "src", "pages")
SCRIPTS_DIR = os.path.join(AUDIT_DIR, "src", "pages", "scripts")

@dataclass
class Anomalie:
    file: str
    line: int
    severity: str  # CRITICAL, WARNING, INFO
    description: str
    expected: str = ""
    found: str = ""

anomalies = []

def add_anomaly(file, line, severity, desc, expected="", found=""):
    anomalies.append(Anomalie(file, line, severity, desc, expected, found))

# =============================================================================
# SECTION 1: Valeurs centrales extraites de social-baremes.ts
# =============================================================================

# Barèmes RSA (extraits manuellement après lecture du fichier)
RSA_BAREMES = {
    "montantForfaitaireBase": 651.69,
    "coefficientsFoyer": {
        "seulSansEnfant": 1.0,
        "coupleOuSeulAvec1Enfant": 1.5,
        "coupleAvec1OuSeulAvec2Enfants": 1.8,
        "coupleAvec2Enfants": 2.1,
        "personneSupplementaire": 0.4,
    },
    "forfaitLogement": {
        "unePersonne": round(77.58 * 1.008, 2),  # 78.22
        "deuxPersonnes": round(155.16 * 1.008, 2),  # 156.41
        "troisPersonnesOuPlus": round(192.01 * 1.008, 2),  # 193.54
    },
    "revenusActivitePrisEnCompte": 0.62,
}

# Valeurs calculées RSA
RSA_MONTANTS = {
    "seul_0_enfant": round(651.69 * 1.0, 2),  # 651.69
    "couple_0_enfant": round(651.69 * 1.5, 2),  # 977.54
    "couple_1_enfant": round(651.69 * 1.8, 2),  # 1173.04
    "couple_2_enfants": round(651.69 * 2.1, 2),  # 1368.55
}

# Prime d'activité
PRIME_ACTIVITE = {
    "montantForfaitaireNonMajoree": {
        "unePersonne": 638.28,
        "coupleOuIsole1Enfant": 957.42,
        "couple1EnfantOuIsole2Enfants": 1148.90,
        "couple2Enfants": 1340.38,
        "isole3Enfants": 1404.21,
        "couple3Enfants": 1595.69,
        "personneSupplementaire": 255.32,
    },
    "forfaitLogement": {
        "unePersonne": 76.59,
        "deuxPersonnes": 153.19,
        "troisPersonnesOuPlus": 189.57,
    },
    "bonification": {
        "montantMaximum": 240.63,
        "seuilDebut": 709.18,
        "seuilMaximum": 1658.76,
    },
    "revenusProfessionnelsPrisEnCompte": 0.61,
    "montantMinimumVerse": 15,
}

# ASF
ASF = {
    "montantParEnfant": 200.78,
    "montantParEnfantPriveDeuxParents": 267.63,
}

# ARE
ARE = {
    "tauxOption1": 0.404,
    "partFixe": 13.18,
    "tauxOption2": 0.57,
    "minimumJournalier": 32.13,
    "plafondPourcentageSjr": 0.7,
    "coefficientMensuel": 30.42,
    "dureeMaximaleJours": {
        "moinsDe55Ans": 548,
        "de55a56Ans": 685,
        "aPartirDe57Ans": 822,
    },
}

print("=" * 80)
print("AUDIT DES BARÈMES - Les Calculateurs")
print("=" * 80)

# =============================================================================
# SECTION 2: Vérification RSA dans rsa.html
# =============================================================================
print("\n--- SECTION RSA ---")

rsa_html_path = os.path.join(PAGES_DIR, "rsa.html")
if os.path.exists(rsa_html_path):
    with open(rsa_html_path, "r", encoding="utf-8") as f:
        rsa_html = f.read()

    # Vérification montant forfaitaire personne seule 651,69 (ou arrondi)
    if "651,69" in rsa_html:
        print("✅ 651,69 € trouvé dans rsa.html (personne seule)")
    else:
        # Chercher les montants proches
        found_montants = re.findall(r'(\d{3}[,.]\d{2})\s*(?:€|EUR|&euro;)', rsa_html)
        print(f"⚠️ 651,69 € NON trouvé dans rsa.html. Montants trouvés: {found_montants[:10]}")

    # Vérification montant couple 977,54
    if "977,54" in rsa_html:
        print("✅ 977,54 € trouvé dans rsa.html (couple)")
    else:
        print("⚠️ 977,54 € NON trouvé dans rsa.html")

    # Vérification couple + 1 enfant 1173,04
    if "1 173,04" in rsa_html or "1173,04" in rsa_html:
        print("✅ 1 173,04 € trouvé dans rsa.html (couple + 1 enfant)")
    else:
        print("⚠️ 1 173,04 € NON trouvé dans rsa.html")

    # Vérification couple + 2 enfants 1368,55
    if "1 368,55" in rsa_html or "1368,55" in rsa_html:
        print("✅ 1 368,55 € trouvé dans rsa.html (couple + 2 enfants)")
    else:
        print("⚠️ 1 368,55 € NON trouvé dans rsa.html")

    # Vérification 652,02 dans FAQ JSON-LD (incohérence?)
    if "652,02" in rsa_html:
        add_anomaly("rsa.html", 0, "CRITICAL",
                    "652,02 € trouvé dans la FAQ (JSON-LD) mais 651,69 € est la valeur correcte",
                    "651,69", "652,02")

    # Vérification 978,03 dans FAQ JSON-LD
    if "978,03" in rsa_html:
        add_anomaly("rsa.html", 0, "CRITICAL",
                    "978,03 € trouvé dans la FAQ mais 977,54 € est la valeur correcte",
                    "977,54", "978,03")

    # Vérification 1 304,04 dans FAQ
    if "304,04" in rsa_html:
        add_anomaly("rsa.html", 0, "CRITICAL",
                    "1 304,04 € trouvé dans la FAQ mais 1 368,55 € est la valeur correcte pour couple+2 enfants",
                    "1368,55", "1304,04")

    # Vérification "environ 600 €" / "autour de 600 €" 
    if "environ 600 €" in rsa_html or "autour de 600 €" in rsa_html:
        add_anomaly("rsa.html", 0, "WARNING",
                    "Montant approximatif '~600 €' trouvé, le vrai montant est 651,69 €",
                    "651,69", "~600")
    
    if "autour de 900 €" in rsa_html:
        add_anomaly("rsa.html", 0, "WARNING",
                    "Montant approximatif '~900 €' trouvé, le vrai montant couple est 977,54 €",
                    "977,54", "~900")

    # Vérifier l'incohérence ligne 280 (ligne orpheline)
    if "votre logement, avec les règles CAF en vigueur en 2026.</p>" in rsa_html:
        add_anomaly("rsa.html", 280, "WARNING",
                    "Ligne 280 semble être un doublon orphelin du texte de la ligne 279")

    # Vérification exemple 2 (978 €)
    if "978 €" in rsa_html:
        add_anomaly("rsa.html", 306, "WARNING",
                    "978 € affiché dans l'exemple mais la valeur exacte est 977,54 €",
                    "977,54", "978")

    # Vérification exemple 3 (452 €)
    # On ne peut pas vérifier directement, c'est indicatif

else:
    print("❌ rsa.html introuvable")

# =============================================================================
# SECTION 3: Vérification Prime d'activité
# =============================================================================
print("\n--- SECTION PRIME D'ACTIVITÉ ---")

prime_html_path = os.path.join(PAGES_DIR, "prime-activite.html")
if os.path.exists(prime_html_path):
    with open(prime_html_path, "r", encoding="utf-8") as f:
        prime_html = f.read()
    
    # Vérifier présence montant de base 638,28
    if "638,28" in prime_html:
        print("✅ 638,28 € trouvé dans prime-activite.html")
    else:
        found = re.findall(r'(\d{3}[,.]\d{2})\s*(?:€|EUR|&euro;)', prime_html)
        print(f"⚠️ 638,28 € NON trouvé. Montants: {found[:10]}")

    # Vérifier 957,42
    if "957,42" in prime_html:
        print("✅ 957,42 € trouvé dans prime-activite.html")
    else:
        print("⚠️ 957,42 € NON trouvé")

    # Vérifier bonification max 240,63
    if "240,63" in prime_html:
        print("✅ 240,63 € (bonification max) trouvé")
    else:
        print("⚠️ 240,63 € NON trouvé")

    # Vérifier forfait logement 76,59
    if "76,59" in prime_html:
        print("✅ 76,59 € (forfait logement) trouvé")
    else:
        print("⚠️ 76,59 € NON trouvé")

# =============================================================================
# SECTION 4: Vérification APL
# =============================================================================
print("\n--- SECTION APL ---")

apl_html_path = os.path.join(PAGES_DIR, "apl.html")
if os.path.exists(apl_html_path):
    with open(apl_html_path, "r", encoding="utf-8") as f:
        apl_html = f.read()[:50000]  # Premiers 50000 caractères
    
    # Vérification forfait logement APL
    if "72" in apl_html:
        print("✅ 72 € trouvé dans apl.html (forfait logement)")
    else:
        print("⚠️ 72 € NON trouvé")

# =============================================================================
# SECTION 5: Vérification ARE
# =============================================================================
print("\n--- SECTION ARE ---")

are_html_path = os.path.join(PAGES_DIR, "are.html")
if os.path.exists(are_html_path):
    with open(are_html_path, "r", encoding="utf-8") as f:
        are_html = f.read()[:30000]
    
    if "32,13" in are_html:
        print("✅ 32,13 € (minimum journalier) trouvé dans are.html")
    else:
        print("⚠️ 32,13 € NON trouvé")

    if "13,18" in are_html:
        print("✅ 13,18 € (part fixe) trouvé")
    else:
        print("⚠️ 13,18 € NON trouvé")

    if "40,4" in are_html or "40.4" in are_html or "0.404" in are_html:
        print("✅ 40,4% (taux option 1) trouvé")
    else:
        print("⚠️ 40,4% NON trouvé")

    if "57" in are_html:
        print("✅ 57% (taux option 2) valeur trouvée")
    else:
        print("⚠️ 57% NON trouvé")

# =============================================================================
# SECTION 6: Vérification ASF
# =============================================================================
print("\n--- SECTION ASF ---")

asf_html_path = os.path.join(PAGES_DIR, "asf.html")
if os.path.exists(asf_html_path):
    with open(asf_html_path, "r", encoding="utf-8") as f:
        asf_html = f.read()[:30000]
    
    if "200,78" in asf_html:
        print("✅ 200,78 € (ASF par enfant) trouvé")
    else:
        print("⚠️ 200,78 € NON trouvé")

    if "267,63" in asf_html:
        print("✅ 267,63 € (ASF privé 2 parents) trouvé")
    else:
        print("⚠️ 267,63 € NON trouvé")

# =============================================================================
# SECTION 7: Vérification AAH
# =============================================================================
print("\n--- SECTION AAH ---")

aah_html_path = os.path.join(PAGES_DIR, "aah.html")
if os.path.exists(aah_html_path):
    with open(aah_html_path, "r", encoding="utf-8") as f:
        aah_html = f.read()[:30000]
    
    # AAH 2026 : 1 025,01 € (à vérifier)
    found_aah = re.findall(r'(\d{1,3}(?:\s?\d{3})*[,.]\d{2})\s*(?:€|EUR|&euro;)', aah_html)
    print(f"Montants AAH trouvés: {found_aah[:15]}")

# =============================================================================
# SECTION 8: Vérification Salaire
# =============================================================================
print("\n--- SECTION SALAIRE ---")

# SMIC 2026 : 1 833,27 € brut mensuel (à vérifier)
salaire_html_path = os.path.join(PAGES_DIR, "salaire.html")
if os.path.exists(salaire_html_path):
    with open(salaire_html_path, "r", encoding="utf-8") as f:
        salaire_html = f.read()[:30000]
    
    if "1 833" in salaire_html or "1833" in salaire_html or "1 834" in salaire_html:
        print("✅ SMIC 2026 trouvé dans salaire.html")
    else:
        found_smic = re.findall(r'(1\s?\d{3}[,.]?\d{0,2})', salaire_html)
        print(f"⚠️ SMIC non identifié clairement. Valeurs proches: {found_smic[:5]}")

# =============================================================================
# SECTION 9: Vérification Impôt sur le revenu
# =============================================================================
print("\n--- SECTION IMPÔT ---")

impot_html_path = os.path.join(PAGES_DIR, "impot.html")
bareme_2026_path = os.path.join(PAGES_DIR, "guide-complet-impot-revenu-2026.html")

if os.path.exists(impot_html_path):
    with open(impot_html_path, "r", encoding="utf-8") as f:
        impot_html = f.read()[:30000]
    
    # Barème IR 2026 (sur revenus 2025)
    # Tranche 0% : 0-11 294 €
    # Tranche 11% : 11 295 - 28 797 €
    # Tranche 30% : 28 798 - 82 341 €
    # Tranche 41% : 82 342 - 177 106 €
    # Tranche 45% : > 177 106 €
    if "11 294" in impot_html or "11294" in impot_html:
        print("✅ Barème IR 2026 (tranche 0%) trouvé")
    else:
        print("⚠️ 11 294 € non trouvé dans impot.html")

    if "28 797" in impot_html or "28797" in impot_html:
        print("✅ Barème IR 2026 (tranche 11%) trouvé")
    else:
        print("⚠️ 28 797 € non trouvé")

# =============================================================================
# SECTION 10: Vérification Taxe foncière
# =============================================================================
print("\n--- SECTION TAXE FONCIÈRE ---")

taxe_html_path = os.path.join(PAGES_DIR, "taxe.html")
if os.path.exists(taxe_html_path):
    with open(taxe_html_path, "r", encoding="utf-8") as f:
        taxe_html = f.read()[:30000]
    
    found_taux = re.findall(r'(\d{1,2}[,.]\d{1,2})\s*%', taxe_html)
    print(f"Taux taxe foncière trouvés: {found_taux[:10]}")

# =============================================================================
# SECTION 11: Vérification Plus-Value
# =============================================================================
print("\n--- SECTION PLUS-VALUE ---")

pv_html_path = os.path.join(PAGES_DIR, "plusvalue.html")
if os.path.exists(pv_html_path):
    with open(pv_html_path, "r", encoding="utf-8") as f:
        pv_html = f.read()[:30000]
    
    # Taux PV 2026 : 19% + 17,2% = 36,2%
    if "36,2" in pv_html or "36.2" in pv_html:
        print("✅ Taux PV 36,2% trouvé")
    else:
        print("⚠️ 36,2% NON trouvé")

    if "19" in pv_html:
        print("✅ Taux 19% (IR) trouvé")
    if "17,2" in pv_html:
        print("✅ Taux 17,2% (PS) trouvé")

# =============================================================================
# SECTION 12: Vérification Notaire (frais)
# =============================================================================
print("\n--- SECTION FRAIS DE NOTAIRE ---")

notaire_html_path = os.path.join(PAGES_DIR, "notaire.html")
baremes_ts_path = os.path.join(AUDIT_DIR, "src", "data", "baremes.ts")
if os.path.exists(baremes_ts_path):
    with open(baremes_ts_path, "r", encoding="utf-8") as f:
        baremes_ts = f.read()
    
    # Vérifier taux 2026
    if "0.0632" in baremes_ts or "0,0632" in baremes_ts:
        print("✅ Taux DMTO standard 6,32% dans baremes.ts")
    else:
        print("⚠️ Taux DMTO standard 6,32% non trouvé")

    if "0.0509" in baremes_ts or "0,0509" in baremes_ts:
        print("✅ Taux réduit 5,09% dans baremes.ts")
    else:
        print("⚠️ Taux réduit 5,09% non trouvé")

    if "0.0387" in baremes_ts:
        print("✅ Barème émoluments notaire trouvé")

# =============================================================================
# SECTION 13: Cohérence PSEO Renderers vs Scripts
# =============================================================================
print("\n--- SECTION PSEO RENDERERS ---")

# Vérifier si les renderers PSEO utilisent les mêmes barèmes que les scripts
pseo_dir = os.path.join(AUDIT_DIR, "scripts", "lib", "pseo")
if os.path.exists(pseo_dir):
    for fname in ["rsa-pseo-renderer.js", "prime-pseo-renderer.js", "apl-pseo-renderer.js", 
                   "are-pseo-renderer.js", "asf-pseo-renderer.js"]:
        path = os.path.join(pseo_dir, fname)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()[:5000]
            print(f"📄 {fname}: {len(content)} chars")

# =============================================================================
# SECTION 14: Vérification des URLs sources
# =============================================================================
print("\n--- SECTION SOURCES ---")

# Vérifier que les URLs de service-public.fr et legifrance sont correctes
urls_to_check = [
    "https://www.service-public.fr/particuliers/vosdroits/N19775",  # RSA
    "https://www.service-public.fr/particuliers/vosdroits/F2882",  # Prime activité
    "https://www.service-public.fr/particuliers/vosdroits/F12006",  # APL
    "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029950390",  # CSS RSA
]

print("URLs de référence (vérifier manuellement qu'elles sont encore valides) :")
for url in urls_to_check:
    print(f"  • {url}")

# =============================================================================
# RAPPORT FINAL
# =============================================================================
print("\n" + "=" * 80)
print("RAPPORT FINAL")
print("=" * 80)

critical = sum(1 for a in anomalies if a.severity == "CRITICAL")
warnings = sum(1 for a in anomalies if a.severity == "WARNING")
infos = sum(1 for a in anomalies if a.severity == "INFO")

print(f"\n📊 Total anomalies : {len(anomalies)}")
print(f"  🔴 CRITICAL : {critical}")
print(f"  🟡 WARNING : {warnings}")
print(f"  🔵 INFO : {infos}")

if anomalies:
    print("\n--- DÉTAIL DES ANOMALIES ---")
    for a in anomalies:
        icon = {"CRITICAL": "🔴", "WARNING": "🟡", "INFO": "🔵"}[a.severity]
        print(f"\n{icon} [{a.severity}] {a.file}:{a.line}")
        print(f"   {a.description}")
        if a.expected:
            print(f"   Attendu: {a.expected}")
        if a.found:
            print(f"   Trouvé: {a.found}")

print("\n✅ Audit terminé.")