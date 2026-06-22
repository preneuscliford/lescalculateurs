        #!/usr/bin/env python3
"""
Vérification complète : URLs sources et valeurs des barèmes
Compare nos données (social-baremes.ts) avec les vrais sites officiels.
"""
import urllib.request
import urllib.error
import ssl
import re
import sys
import json
from datetime import datetime

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'

def fetch(url, timeout=15):
    """Fetch URL and return decoded text."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout, context=ssl_ctx) as resp:
            content = resp.read()
            # Try UTF-8 first, then latin-1
            try:
                return resp.status, content.decode('utf-8')
            except UnicodeDecodeError:
                return resp.status, content.decode('latin-1', errors='replace')
    except urllib.error.HTTPError as e:
        return e.code, f"HTTP {e.code}"
    except urllib.error.URLError as e:
        return 0, f"URL Error: {e.reason}"
    except Exception as e:
        return 0, f"ERROR: {type(e).__name__}: {e}"

def extract_numbers(text):
    """Extract money amounts (X XXX,XX or X.XX) from text."""
    nums = re.findall(r'(\d{1,3}(?:\s?\d{3})*[,.]\d{2})\s*(?:€|EUR|euro)', text)
    clean = []
    for n in nums:
        clean.append(n.replace(' ', ''))
    return clean

def extract_percent(text):
    """Extract percentage values."""
    return re.findall(r'(\d{1,2}[,.]\d{1,2})\s*%', text)

# =============================================================================
# DÉFINITION DES TESTS
# =============================================================================
TESTS = [
    {
        "name": "RSA - montant personne seule",
        "url": "https://www.service-public.fr/particuliers/vosdroits/N19775",
        "our_value": "651,69",
        "search_terms": ["RSA", "socle", "forfaitaire", "651"],
    },
    {
        "name": "RSA - CAF page nationale",
        "url": "https://www.caf.fr/allocataires/aides-et-demarches/mes-aides/fiches-aides/le-revenu-de-solidarite-active-rsa",
        "our_value": "651,69",
        "search_terms": ["650", "651", "652", "RSA", "socle"],
    },
    {
        "name": "RSA - Code de la sécurité sociale (Legifrance)",
        "url": "https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000029950390",
        "our_value": "651,69",
        "search_terms": ["RSA", "socle", "forfait", "coefficient"],
    },
    {
        "name": "RSA - Revalorisation 2026",
        "url": "https://solidarites.gouv.fr/revalorisation-annuelle-des-prestations-sociales-au-1er-avril-2026",
        "our_value": "0,8%",
        "search_terms": ["0,8", "revalorisation", "prestation"],
    },
    {
        "name": "Prime activité - service-public",
        "url": "https://www.service-public.fr/particuliers/vosdroits/F2882",
        "our_value": "638,28",
        "search_terms": ["638", "prime", "activité", "forfaitaire"],
    },
    {
        "name": "Prime activité - barème CAF",
        "url": "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-d-activite",
        "our_value": "638,28",
        "search_terms": ["638", "prime", "forfait", "barème"],
    },
    {
        "name": "ASF - service-public",
        "url": "https://www.service-public.fr/particuliers/vosdroits/F33647",
        "our_value": "200,78",
        "search_terms": ["200", "ASF", "soutien", "familial", "enfant"],
    },
    {
        "name": "ASF - CAF",
        "url": "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/l-allocation-de-soutien-familial-asf",
        "our_value": "200,78",
        "search_terms": ["200", "ASF", "soutien"],
    },
    {
        "name": "ARE - France Travail",
        "url": "https://www.francetravail.fr/faq/candidat/mes-allocations---mes-aides/lallocation-chomage-lessentiel-a/montant-allocation-france-travai.html",
        "our_value": "32,13",
        "search_terms": ["32,13", "allocation", "ARE", "minimum"],
    },
    {
        "name": "ARE - service-public",
        "url": "https://www.service-public.fr/particuliers/vosdroits/F38881",
        "our_value": "32,13",
        "search_terms": ["32,13", "allocation", "chômage", "ARE"],
    },
    {
        "name": "APL - service-public",
        "url": "https://www.service-public.fr/particuliers/vosdroits/F12006",
        "our_value": "72,00",
        "search_terms": ["APL", "aide", "logement", "forfait", "72"],
    },
    {
        "name": "Impôt - barème 2026 (revenus 2025)",
        "url": "https://www.service-public.fr/particuliers/vosdroits/F1419",
        "our_value": "11 294",
        "search_terms": ["barème", "impôt", "11 294", "tranche", "revenu"],
    },
    {
        "name": "AAH - service-public",
        "url": "https://www.service-public.fr/particuliers/vosdroits/N12230",
        "our_value": "1016,05",
        "search_terms": ["AAH", "handicapé", "1016", "allocation"],
    },
    {
        "name": "SMIC 2026",
        "url": "https://www.service-public.fr/particuliers/actualites/A17594",
        "our_value": "1833",
        "search_terms": ["SMIC", "1 833", "salaire", "minimum"],
    },
]

print("=" * 80)
print("VÉRIFICATION DES URLS SOURCES ET VALEURS OFFICIELLES")
print(f"Date : {datetime.now().strftime('%d/%m/%Y %H:%M')}")
print("=" * 80)

results = []
ok_urls = 0
ko_urls = 0
value_matches = 0
value_misses = 0

for i, test in enumerate(TESTS):
    print(f"\n📋 Test {i+1}/{len(TESTS)} : {test['name']}")
    print(f"   URL : {test['url']}")
    print(f"   Notre valeur : {test['our_value']}")

    status, content = fetch(test['url'])

    if status and status != 200 and isinstance(status, int):
        if status >= 400:
            print(f"   ⚠️ Statut HTTP: {status} - URL possiblement invalide ou redirigée")
            ko_urls += 1
        else:
            print(f"   ℹ️ Statut HTTP: {status}")
            ok_urls += 1
    elif isinstance(content, str) and content.startswith("ERROR"):
        print(f"   ❌ Erreur accès: {content}")
        ko_urls += 1
    else:
        print(f"   ✅ Page accessible ({len(content)} caractères)")

        # Extraire les nombres
        numbers = extract_numbers(content)
        if numbers:
            print(f"   💰 Montants extraits : {numbers[:10]}...")

        # Vérifier si notre valeur est présente
        search_val = test["our_value"].replace(" ", "").replace(",", ",")
        if search_val in content:
            print(f"   ✅ Notre valeur {test['our_value']} trouvée dans la page !")
            value_matches += 1
        else:
            # Chercher valeurs proches
            found_terms = []
            for term in test["search_terms"]:
                if term in content.lower() or term in content:
                    found_terms.append(term)
            if found_terms:
                print(f"   🔍 Termes trouvés : {found_terms} (valeur exacte non confirmée)")
                value_misses += 1
            else:
                print(f"   ⚠️ Aucun terme recherché trouvé - la page a peut-être changé")
                value_misses += 1
        
        results.append({
            "name": test["name"],
            "url": test["url"],
            "status": "OK",
            "numbers_found": numbers[:10] if numbers else [],
            "value_confirmed": search_val in content,
        })

# =============================================================================
# RAPPORT
# =============================================================================
print("\n" + "=" * 80)
print("RAPPORT FINAL")
print("=" * 80)
print(f"URLs accessibles : {ok_urls}/{len(TESTS)}")
print(f"URLs en erreur   : {ko_urls}/{len(TESTS)}")
print(f"Valeurs confirmées : {value_matches}")
print(f"Valeurs non confirmées : {value_misses}")

if ko_urls > 0:
    print("\n⚠️ URLs à vérifier/corriger :")
    for test in TESTS:
        status, _ = fetch(test["url"])
        if isinstance(status, int) and status >= 400:
            print(f"   • {test['name']} → {test['url']} (HTTP {status})")
        elif isinstance(status, int) and status == 0:
            print(f"   • {test['name']} → {test['url']} (inaccessible)")

print("\n📌 Note : Les sites gouvernementaux français peuvent bloquer les requêtes automatiques.")
print("   Si des URLs sont inaccessibles, vérifiez-les manuellement dans un navigateur.")
print("   L'essentiel est que les URLs pointent vers les bonnes pages (IDs corrects).")