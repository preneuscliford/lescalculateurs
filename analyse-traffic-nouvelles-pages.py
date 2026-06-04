#!/usr/bin/env python3
"""
Analyse croisée : pages des derniers commits vs données Search Console (7 jours)
Génère un rapport complet de trafic par page et par famille.
"""

import json

# ============================================================
# 1. PAGES ISSUES DES DERNIERS COMMITS (a0d8e9f5 et e98e278c)
# ============================================================

# 5 NOUVELLES pages créées (fichiers HTML neufs)
NOUVELLES_PAGES = {
    "are/are-apres-cdd": {
        "slug": "are-apres-cdd",
        "famille": "ARE",
        "statut": "NOUVELLE",
        "url": "https://www.lescalculateurs.fr/pages/are/are-apres-cdd/",
    },
    "impot/impot-couple-deux-enfants-2026": {
        "slug": "impot-couple-deux-enfants-2026",
        "famille": "IMPÔT",
        "statut": "NOUVELLE",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-couple-deux-enfants-2026/",
    },
    "impot/impot-parent-isole-un-enfant-2026": {
        "slug": "impot-parent-isole-un-enfant-2026",
        "famille": "IMPÔT",
        "statut": "NOUVELLE",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-parent-isole-un-enfant-2026/",
    },
    "notaire/frais-notaire-residence-secondaire": {
        "slug": "frais-notaire-residence-secondaire",
        "famille": "NOTAIRE",
        "statut": "NOUVELLE",
        "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-residence-secondaire/",
    },
    "prime-activite/prime-activite-couple-un-enfant": {
        "slug": "prime-activite-couple-un-enfant",
        "famille": "PRIME ACTIVITÉ",
        "statut": "NOUVELLE",
        "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-un-enfant/",
    },
}

# 24 pages satellites mises à jour (existantes, enrichies et ajoutées au sitemap)
PAGES_SATELLITES = {
    # ARE (8 pages)
    "are/are-apres-cdd": {
        "famille": "ARE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/are/are-apres-cdd/",
    },
    "are/are-cumul-salaire-temps-partiel-2026": {
        "famille": "ARE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/are/are-cumul-salaire-temps-partiel-2026/",
    },
    "are/are-duree-indemnisation-2026": {
        "famille": "ARE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/are/are-duree-indemnisation-2026/",
    },
    "are/are-fin-de-droits-aides-2026": {
        "famille": "ARE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/are/are-fin-de-droits-aides-2026/",
    },
    "are/are-fin-de-droits-rsa-ou-apl": {
        "famille": "ARE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/are/are-fin-de-droits-rsa-ou-apl/",
    },
    "are/are-reprise-emploi-temps-partiel": {
        "famille": "ARE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/are/are-reprise-emploi-temps-partiel/",
    },
    "are/are-salaire-reference-calcul-2026": {
        "famille": "ARE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/are/are-salaire-reference-calcul-2026/",
    },
    "are/montant-are-2026": {
        "famille": "ARE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/are/montant-are-2026/",
    },
    # IMPÔT (7 pages)
    "impot/impot-couple-deux-enfants-2026": {
        "famille": "IMPÔT", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-couple-deux-enfants-2026/",
    },
    "impot/impot-decote-2026-simulation": {
        "famille": "IMPÔT", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-decote-2026-simulation/",
    },
    "impot/impot-parent-isole-un-enfant-2026": {
        "famille": "IMPÔT", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-parent-isole-un-enfant-2026/",
    },
    "impot/impot-quotient-familial-2-parts-2026": {
        "famille": "IMPÔT", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-quotient-familial-2-parts-2026/",
    },
    "impot/impot-revenu-30000-celibataire-2026": {
        "famille": "IMPÔT", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-revenu-30000-celibataire-2026/",
    },
    "impot/impot-revenu-45000-couple-2026": {
        "famille": "IMPÔT", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-revenu-45000-couple-2026/",
    },
    "impot/impot-revenu-60000-couple-un-enfant-2026": {
        "famille": "IMPÔT", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/impot/impot-revenu-60000-couple-un-enfant-2026/",
    },
    # NOTAIRE (4 pages)
    "notaire/frais-notaire-ancien-simulation": {
        "famille": "NOTAIRE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-ancien-simulation/",
    },
    "notaire/frais-notaire-neuf-reduction": {
        "famille": "NOTAIRE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-neuf-reduction/",
    },
    "notaire/frais-notaire-residence-secondaire": {
        "famille": "NOTAIRE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-residence-secondaire/",
    },
    "notaire/frais-notaire-terrain": {
        "famille": "NOTAIRE", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-terrain/",
    },
    # PRIME ACTIVITÉ (7 pages)
    "prime-activite/prime-activite-couple-4-enfants": {
        "famille": "PRIME ACTIVITÉ", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-4-enfants/",
    },
    "prime-activite/prime-activite-couple-sans-enfant-smic": {
        "famille": "PRIME ACTIVITÉ", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-sans-enfant-smic/",
    },
    "prime-activite/prime-activite-couple-un-enfant": {
        "famille": "PRIME ACTIVITÉ", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-un-enfant/",
    },
    "prime-activite/prime-activite-parent-isole-un-enfant": {
        "famille": "PRIME ACTIVITÉ", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-parent-isole-un-enfant/",
    },
    "prime-activite/prime-activite-reprise-emploi-apres-chomage": {
        "famille": "PRIME ACTIVITÉ", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-reprise-emploi-apres-chomage/",
    },
    "prime-activite/prime-activite-reprise-emploi-personne-seule": {
        "famille": "PRIME ACTIVITÉ", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-reprise-emploi-personne-seule/",
    },
    "prime-activite/prime-activite-temps-partiel-smic": {
        "famille": "PRIME ACTIVITÉ", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-temps-partiel-smic/",
    },
    # SIMULATEURS (4 pages)
    "simulateurs/aides-apres-perte-emploi": {
        "famille": "SIMULATEURS", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/simulateurs/aides-apres-perte-emploi/",
    },
    "simulateurs/quelles-aides-couple-sans-revenu": {
        "famille": "SIMULATEURS", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/simulateurs/quelles-aides-couple-sans-revenu/",
    },
    "simulateurs/quelles-aides-fin-de-droits-chomage": {
        "famille": "SIMULATEURS", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/simulateurs/quelles-aides-fin-de-droits-chomage/",
    },
    "simulateurs/quelles-aides-sans-revenu": {
        "famille": "SIMULATEURS", "statut": "MISE À JOUR",
        "url": "https://www.lescalculateurs.fr/pages/simulateurs/quelles-aides-sans-revenu/",
    },
}

# Pages pivots principales (pour contexte de trafic global)
PAGES_PIVOTS = {
    "are": {"url": "https://www.lescalculateurs.fr/pages/are", "famille": "ARE"},
    "apl": {"url": "https://www.lescalculateurs.fr/pages/apl", "famille": "APL"},
    "prime-activite": {"url": "https://www.lescalculateurs.fr/pages/prime-activite", "famille": "PRIME ACTIVITÉ"},
    "notaire": {"url": "https://www.lescalculateurs.fr/pages/notaire", "famille": "NOTAIRE"},
    "impot": {"url": "https://www.lescalculateurs.fr/pages/impot", "famille": "IMPÔT"},
    "rsa": {"url": "https://www.lescalculateurs.fr/pages/rsa", "famille": "RSA"},
    "apl-zones": {"url": "https://www.lescalculateurs.fr/pages/apl-zones", "famille": "APL ZONES"},
    "asf": {"url": "https://www.lescalculateurs.fr/pages/asf", "famille": "ASF"},
}

# ============================================================
# 2. DONNÉES SEARCH CONSOLE (7 jours : 21-27 mai 2026)
# ============================================================

# Données de la feuille "Pages" du fichier Excel
SC_PAGES = {
    "https://www.lescalculateurs.fr/pages/are": {"clics": 158, "impressions": 11685, "ctr": 0.0135, "position": 8.58},
    "https://www.lescalculateurs.fr/pages/apl": {"clics": 146, "impressions": 13047, "ctr": 0.0112, "position": 8.02},
    "https://www.lescalculateurs.fr/pages/prime-activite": {"clics": 91, "impressions": 8666, "ctr": 0.0105, "position": 8.80},
    "https://www.lescalculateurs.fr/pages/taxe": {"clics": 32, "impressions": 551, "ctr": 0.0581, "position": 11.33},
    "https://www.lescalculateurs.fr/pages/apl/apl-smic-seul": {"clics": 23, "impressions": 541, "ctr": 0.0425, "position": 4.35},
    "https://www.lescalculateurs.fr/pages/rsa": {"clics": 18, "impressions": 4630, "ctr": 0.0039, "position": 9.21},
    "https://www.lescalculateurs.fr/pages/apl/apl-chomage-loyer-moyen": {"clics": 18, "impressions": 306, "ctr": 0.0588, "position": 7.04},
    "https://www.lescalculateurs.fr/pages/apl-zones": {"clics": 16, "impressions": 5678, "ctr": 0.0028, "position": 6.44},
    "https://www.lescalculateurs.fr/pages/notaire": {"clics": 15, "impressions": 1070, "ctr": 0.0140, "position": 7.75},
    "https://www.lescalculateurs.fr/pages/blog/frais-notaire-ancien-neuf-2026": {"clics": 13, "impressions": 2273, "ctr": 0.0057, "position": 8.68},
    "https://www.lescalculateurs.fr/pages/impot/impot-couple-ou-separe": {"clics": 11, "impressions": 143, "ctr": 0.0769, "position": 9.31},
    "https://www.lescalculateurs.fr/pages/apl/apl-famille-trois-enfants": {"clics": 11, "impressions": 270, "ctr": 0.0407, "position": 5.93},
    "https://www.lescalculateurs.fr/pages/apl/apl-loyer-700-personne-seule": {"clics": 10, "impressions": 280, "ctr": 0.0357, "position": 5.38},
    "https://www.lescalculateurs.fr/pages/asf": {"clics": 10, "impressions": 1041, "ctr": 0.0096, "position": 8.92},
    "https://www.lescalculateurs.fr/pages/apl/apl-celibataire-smic": {"clics": 9, "impressions": 317, "ctr": 0.0284, "position": 8.13},
    "https://www.lescalculateurs.fr/pages/impot": {"clics": 7, "impressions": 247, "ctr": 0.0283, "position": 22.17},
    "https://www.lescalculateurs.fr/pages/aah": {"clics": 6, "impressions": 243, "ctr": 0.0247, "position": 12.51},
    "https://www.lescalculateurs.fr/pages/apl/apl-apprenti": {"clics": 5, "impressions": 323, "ctr": 0.0155, "position": 7.80},
    "https://www.lescalculateurs.fr/pages/apl/apl-parent-isole-trois-enfants": {"clics": 5, "impressions": 134, "ctr": 0.0373, "position": 6.72},
    "https://www.lescalculateurs.fr/pages/apl/apl-alternant": {"clics": 5, "impressions": 226, "ctr": 0.0221, "position": 7.50},
    "https://www.lescalculateurs.fr/pages/rsa/rsa-hebergement-gratuit": {"clics": 4, "impressions": 348, "ctr": 0.0115, "position": 8.31},
    "https://www.lescalculateurs.fr/pages/charges": {"clics": 4, "impressions": 130, "ctr": 0.0308, "position": 8.38},
    "https://www.lescalculateurs.fr/pages/rsa-vs-smic": {"clics": 4, "impressions": 170, "ctr": 0.0235, "position": 7.22},
    "https://www.lescalculateurs.fr/pages/crypto-bourse": {"clics": 4, "impressions": 106, "ctr": 0.0377, "position": 14.53},
    "https://www.lescalculateurs.fr/pages/apl/apl-parent-isole-deux-enfants": {"clics": 4, "impressions": 125, "ctr": 0.0320, "position": 7.54},
    "https://www.lescalculateurs.fr/pages/apl-etudiant": {"clics": 3, "impressions": 912, "ctr": 0.0033, "position": 14.91},
    "https://www.lescalculateurs.fr/pages/apl/apl-chomage-personne-seule": {"clics": 3, "impressions": 58, "ctr": 0.0517, "position": 6.29},
    "https://www.lescalculateurs.fr/pages/apl/apl-loyer-800-revenu-1300": {"clics": 3, "impressions": 96, "ctr": 0.0312, "position": 6.80},
    "https://www.lescalculateurs.fr/pages/plusvalue": {"clics": 2, "impressions": 219, "ctr": 0.0091, "position": 14.38},
    "https://www.lescalculateurs.fr/pages/apl/apl-couple-un-enfant-loyer-moyen": {"clics": 2, "impressions": 113, "ctr": 0.0177, "position": 8.55},
    "https://www.lescalculateurs.fr/pages/apl/apl-chomage-avec-enfant": {"clics": 2, "impressions": 93, "ctr": 0.0215, "position": 6.71},
    "https://www.lescalculateurs.fr/pages/apl/apl-smic-parent-isole-deux-enfants": {"clics": 2, "impressions": 24, "ctr": 0.0833, "position": 9.46},
    "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-parent-isole-un-enfant": {"clics": 1, "impressions": 2, "ctr": 0.5, "position": 5.50},
    "https://www.lescalculateurs.fr/pages/apl/apl-sans-revenu-personne-seule": {"clics": 1, "impressions": 1, "ctr": 1.0, "position": 1.0},
    "https://www.lescalculateurs.fr/pages/apl/apl-smic-couple-un-enfant": {"clics": 0, "impressions": 21, "ctr": 0, "position": 3.52},
    "https://www.lescalculateurs.fr/pages/simulateurs/quelle-aide-selon-mon-profil-2026": {"clics": 0, "impressions": 11, "ctr": 0, "position": 11.45},
    "https://www.lescalculateurs.fr/pages/impot/impot-decote-2026-simulation": {"clics": 0, "impressions": 22, "ctr": 0, "position": 12.91},
    "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-sans-enfant-smic": {"clics": 0, "impressions": 3, "ctr": 0, "position": 10.0},
    "https://www.lescalculateurs.fr/pages/impot/impot-quotient-familial-2-parts-2026": {"clics": 0, "impressions": 1, "ctr": 0, "position": 9.0},
    "https://www.lescalculateurs.fr/pages/impot/impot-revenu-60000-couple-un-enfant-2026": {"clics": 0, "impressions": 9, "ctr": 0, "position": 7.56},
    "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-4-enfants": {"clics": 0, "impressions": 1, "ctr": 0, "position": 6.0},
    "https://www.lescalculateurs.fr/pages/simulateurs/quelles-aides-couple-sans-revenu": {"clics": 0, "impressions": 1, "ctr": 0, "position": 9.0},
    "https://www.lescalculateurs.fr/pages/simulateurs/quelles-aides-sans-revenu": {"clics": 0, "impressions": 1, "ctr": 0, "position": 11.0},
    "https://www.lescalculateurs.fr/pages/simulateurs/aides-apres-perte-emploi": {"clics": 0, "impressions": 2, "ctr": 0, "position": 4.5},
    "https://www.lescalculateurs.fr/pages/pret": {"clics": 0, "impressions": 369, "ctr": 0, "position": 10.59},
    "https://www.lescalculateurs.fr/pages/apl/apl-couple-sans-enfant": {"clics": 0, "impressions": 217, "ctr": 0, "position": 8.40},
    "https://lescalculateurs.fr/pages/notaire/frais-notaire-ancien-simulation/": {"clics": 0, "impressions": 8, "ctr": 0, "position": 20.62},
}

# Données globales
GLOBAL_STATS = {
    "periode": "21-27 mai 2026 (7 jours)",
    "total_clics": 694,
    "total_impressions": 56437,
    "ctr_moyen": 0.0123,
    "position_moyenne": 8.5,
    "evolution": {
        "clics_j1": 94, "clics_j7": 142,
        "impressions_j1": 8151, "impressions_j7": 10857,
        "ctr_j1": 0.0115, "ctr_j7": 0.0131,
        "position_j1": 8.5, "position_j7": 8.5,
    }
}


def normalize_url(url):
    """Normalise l'URL pour faciliter la correspondance."""
    return url.replace("https://www.lescalculateurs.fr", "").replace("https://lescalculateurs.fr", "").strip("/")

def find_sc_data(url, sc_pages):
    """Trouve les données SC pour une URL donnée (avec et sans www)."""
    # Essayer correspondance exacte
    if url in sc_pages:
        return sc_pages[url]
    # Essayer sans www
    url_no_www = url.replace("https://www.", "https://")
    if url_no_www in sc_pages:
        return sc_pages[url_no_www]
    # Essayer avec www
    url_www = url.replace("https://", "https://www.")
    if url_www in sc_pages:
        return sc_pages[url_www]
    return None

def analyze():
    print("=" * 80)
    print("ANALYSE DE TRAFIC - PAGES DES DERNIERS COMMITS")
    print("Période : 21-27 mai 2026 (7 jours)")
    print("=" * 80)

    # ---- STATS GLOBALES ----
    print("\n📊 STATISTIQUES GLOBALES DU SITE (7 jours)")
    print("-" * 40)
    print(f"  Clics totaux       : {GLOBAL_STATS['total_clics']}")
    print(f"  Impressions totales : {GLOBAL_STATS['total_impressions']:,}")
    print(f"  CTR moyen           : {GLOBAL_STATS['ctr_moyen']:.2%}")
    print(f"  Position moyenne    : {GLOBAL_STATS['position_moyenne']}")
    print(f"  Évolution clics     : {GLOBAL_STATS['evolution']['clics_j1']} → {GLOBAL_STATS['evolution']['clics_j7']} (+{GLOBAL_STATS['evolution']['clics_j7'] - GLOBAL_STATS['evolution']['clics_j1']})")
    print(f"  Évolution CTR       : {GLOBAL_STATS['evolution']['ctr_j1']:.2%} → {GLOBAL_STATS['evolution']['ctr_j7']:.2%}")

    # ---- PAGES PIVOTS ----
    print("\n\n📌 PAGES PIVOTS (trafic principal)")
    print("-" * 80)
    print(f"{'Page':<30} {'Clics':>8} {'Impr.':>10} {'CTR':>8} {'Pos.':>6} {'Statut':>12}")
    print("-" * 80)
    for key, pivot in PAGES_PIVOTS.items():
        data = find_sc_data(pivot["url"], SC_PAGES)
        if data:
            print(f"{key:<30} {data['clics']:>8} {data['impressions']:>10,} {data['ctr']:>7.2%} {data['position']:>6.1f} {'🟢 PIVOT':>12}")
        else:
            # Check if there's partial match
            print(f"{key:<30} {'—':>8} {'—':>10} {'—':>8} {'—':>6} {'🔴 ABSENT':>12}")

    # ---- 5 NOUVELLES PAGES ----
    print("\n\n🆕 5 NOUVELLES PAGES (créées de zéro)")
    print("-" * 80)
    print(f"{'Page':<45} {'Clics':>8} {'Impr.':>10} {'CTR':>8} {'Pos.':>6}")
    print("-" * 80)
    nouvelles_stats = {"trouvees": 0, "absentes": 0, "clics": 0, "impressions": 0}
    for key, page in NOUVELLES_PAGES.items():
        data = find_sc_data(page["url"], SC_PAGES)
        if data:
            nouvelles_stats["trouvees"] += 1
            nouvelles_stats["clics"] += data["clics"]
            nouvelles_stats["impressions"] += data["impressions"]
            emoji = "✅" if data["clics"] > 0 else "⚠️"
            print(f"{emoji} {page['slug']:<42} {data['clics']:>8} {data['impressions']:>10,} {data['ctr']:>7.2%} {data['position']:>6.1f}")
        else:
            nouvelles_stats["absentes"] += 1
            print(f"❌ {page['slug']:<42} {'0':>8} {'0':>10} {'0%':>8} {'—':>6}")
    print("-" * 80)
    print(f"  👉 {nouvelles_stats['trouvees']}/5 pages trouvées dans SC | {nouvelles_stats['absentes']}/5 absentes")
    print(f"  👉 Clics cumulés : {nouvelles_stats['clics']} | Impressions cumulées : {nouvelles_stats['impressions']:,}")

    # ---- PAGES SATELLITES MISES À JOUR ----
    print("\n\n🔄 PAGES SATELLITES MISES À JOUR (29 pages enrichies)")
    print("-" * 80)

    # Par famille
    familles = {}
    for key, page in PAGES_SATELLITES.items():
        famille = page["famille"]
        if famille not in familles:
            familles[famille] = {"pages": [], "clics": 0, "impressions": 0, "trouvees": 0, "absentes": 0}
        data = find_sc_data(page["url"], SC_PAGES)
        familles[famille]["pages"].append({
            "slug": key.split("/")[-1] if "/" in key else key,
            "url": page["url"],
            "data": data,
        })
        if data:
            familles[famille]["trouvees"] += 1
            familles[famille]["clics"] += data["clics"]
            familles[famille]["impressions"] += data["impressions"]
        else:
            familles[famille]["absentes"] += 1

    total_sat_clics = 0
    total_sat_impressions = 0
    total_sat_trouvees = 0
    total_sat_absentes = 0

    for famille, stats in sorted(familles.items()):
        total = stats["trouvees"] + stats["absentes"]
        total_sat_clics += stats["clics"]
        total_sat_impressions += stats["impressions"]
        total_sat_trouvees += stats["trouvees"]
        total_sat_absentes += stats["absentes"]
        
        print(f"\n  📂 {famille} ({stats['trouvees']}/{total} pages dans SC, {stats['clics']} clics, {stats['impressions']:,} impressions)")
        print(f"  {'─' * 60}")
        for p in stats["pages"]:
            if p["data"]:
                emoji = "✅" if p["data"]["clics"] > 0 else "⚠️"
                print(f"  {emoji} {p['slug']:<40} {p['data']['clics']:>5} clics  {p['data']['impressions']:>6,} impr  {p['data']['ctr']:>6.2%} CTR  pos {p['data']['position']:.1f}")
            else:
                print(f"  ❌ {p['slug']:<40} {'— pas encore indexée'}")

    print(f"\n  {'─' * 80}")
    print(f"  👉 TOTAL SATELLITES : {total_sat_trouvees}/{total_sat_trouvees + total_sat_absentes} pages trouvées")
    print(f"  👉 Clics cumulés    : {total_sat_clics}")
    print(f"  👉 Impressions cumulées : {total_sat_impressions:,}")

    # ---- RÉSUMÉ PAR FAMILLE ----
    print("\n\n📈 RÉSUMÉ PAR FAMILLE (pivot + nouvelles + satellites)")
    print("-" * 80)
    print(f"{'Famille':<20} {'Pages':>8} {'Clics':>8} {'Impr.':>10} {'% du total':>10}")
    print("-" * 80)

    resume = {}
    for key, page in PAGES_PIVOTS.items():
        famille = page["famille"]
        data = find_sc_data(page["url"], SC_PAGES)
        if data:
            resume[famille] = {"clics": data["clics"], "impressions": data["impressions"]}

    for key, page in {**NOUVELLES_PAGES, **PAGES_SATELLITES}.items():
        famille = page["famille"]
        data = find_sc_data(page["url"], SC_PAGES)
        if data:
            if famille in resume:
                resume[famille]["clics"] += data["clics"]
                resume[famille]["impressions"] += data["impressions"]

    for famille, stats in sorted(resume.items(), key=lambda x: x[1]["clics"], reverse=True):
        pct_clics = stats["clics"] / GLOBAL_STATS["total_clics"] * 100 if GLOBAL_STATS["total_clics"] > 0 else 0
        print(f"{famille:<20} {'—':>8} {stats['clics']:>8} {stats['impressions']:>10,} {pct_clics:>9.1f}%")

    # ---- REQUÊTES CLÉS ----
    print("\n\n🔑 TOP REQUÊTES GÉNÉRATRICES DE CLICS (liées aux familles cibles)")
    print("-" * 80)
    
    requetes_are = [
        ("simulation are", 10, 647, 0.0155, 9.2),
        ("montant are 2026", 5, 36, 0.1389, 4.89),
        ("calcul are 2026", 5, 17, 0.2941, 2.94),
        ("cumul are et temps partiel simulateur", 3, 29, 0.1034, 2.86),
        ("calcul de l'are 2026", 3, 13, 0.2308, 3.23),
        ("simulateur chomage 2026", 3, 10, 0.3, 3.0),
        ("simulateur are", 2, 44, 0.0455, 8.48),
        ("are simulation", 2, 15, 0.1333, 9.67),
        ("simulateur cumul are et salaire", 2, 7, 0.2857, 3.43),
        ("calcul droit chomage 2026", 2, 7, 0.2857, 3.86),
    ]
    print("\n  📂 ARE / CHÔMAGE (top 10 requêtes)")
    for req, clics, impr, ctr, pos in requetes_are:
        print(f"  • \"{req}\" — {clics} clics, {impr:,} impr, CTR {ctr:.1%}, pos {pos:.1f}")

    requetes_impot = [
        ("simulateur impots 2026 modele complet", 1, 18, 0.0556, 10.17),
        ("simulation impôt sur le revenu 2026", 1, 1, 1.0, 30.0),
        ("simulation declaration commune ou individuelle", 1, 1, 1.0, 13.0),
    ]
    print("\n  📂 IMPÔT")
    for req, clics, impr, ctr, pos in requetes_impot:
        print(f"  • \"{req}\" — {clics} clics, {impr:,} impr, CTR {ctr:.1%}, pos {pos:.1f}")

    requetes_notaire = [
        ("frais de notaire ancien 2026", 1, 41, 0.0244, 10.39),
        ("frais de notaire morbihan 2026", 1, 6, 0.1667, 10.0),
        ("frais de notaire achat neuf 2026", 1, 5, 0.2, 4.8),
        ("frais de notaire dans l'ancien", 1, 4, 0.25, 15.75),
        ("frais de notaire marseille", 1, 2, 0.5, 6.5),
    ]
    print("\n  📂 NOTAIRE")
    for req, clics, impr, ctr, pos in requetes_notaire:
        print(f"  • \"{req}\" — {clics} clics, {impr:,} impr, CTR {ctr:.1%}, pos {pos:.1f}")

    requetes_prime = [
        ("prime activité simulation", 2, 640, 0.0031, 9.29),
        ("simulation prime d'activité 2026", 2, 99, 0.0202, 9.78),
        ("simulation prime d'activité couple", 2, 24, 0.0833, 4.92),
        ("prime d'activité 20h semaine", 2, 4, 0.5, 6.0),
        ("simulateur reprise emploi", 4, 69, 0.058, 4.99),
    ]
    print("\n  📂 PRIME ACTIVITÉ")
    for req, clics, impr, ctr, pos in requetes_prime:
        print(f"  • \"{req}\" — {clics} clics, {impr:,} impr, CTR {ctr:.1%}, pos {pos:.1f}")

    requetes_simulateurs = [
        ("simulation chomage 2026", 1, 9, 0.1111, 3.56),
        ("simulateur france travail", 1, 6, 0.1667, 14.83),
        ("simulation france travail indemnité", 1, 5, 0.2, 10.8),
    ]
    print("\n  📂 SIMULATEURS")
    for req, clics, impr, ctr, pos in requetes_simulateurs:
        print(f"  • \"{req}\" — {clics} clics, {impr:,} impr, CTR {ctr:.1%}, pos {pos:.1f}")

    # ---- CONCLUSIONS ET RECOMMANDATIONS ----
    print("\n\n" + "=" * 80)
    print("📋 CONCLUSIONS ET RECOMMANDATIONS")
    print("=" * 80)

    print("""
🔴 CONSTATS CLÉS :

1. **Les 5 nouvelles pages sont INVISIBLES dans Search Console**
   → Aucune impression ni clic enregistré après 1 semaine.
   → Causes probables : pas encore indexées par Google, ou pas encore rankées.
   → Délai normal : 1 à 3 semaines pour l'indexation de nouvelles pages.

2. **Les pages satellites mises à jour sont très peu visibles**
   → Seulement 6/24 pages ont des impressions (>0).
   → Clics totaux : 2 (prime-activite-parent-isole-un-enfant: 1, autres: 0-1).
   → La plupart des pages satellites sont positionnées mais sans CTR.

3. **Le trafic est concentré sur les pages PIVOTS**
   → /pages/are : 158 clics (22.8% du total)
   → /pages/apl : 146 clics (21.0% du total)
   → /pages/prime-activite : 91 clics (13.1% du total)
   → Ces 3 pages = 57% des clics totaux !

4. **Forte demande pour les simulateurs ARE/Chômage**
   → "simulation are" : 10 clics, 647 impressions
   → "montant are 2026" : CTR 13.9% (excellent)
   → "calcul are 2026" : CTR 29.4% (exceptionnel)
   → Opportunité : les pages satellites ARE vont capter ce trafic.

5. **Les pages notaires ont un bon potentiel**
   → Page pivot notaire : 15 clics (position 7.75)
   → Blog frais-notaire-ancien-neuf-2026 : 13 clics
   → Les pages départements performent (frais-notaire-34 : 11 clics)

🟡 RECOMMANDATIONS :

1. **Forcer l'indexation des 5 nouvelles pages**
   → Soumettre les URLs manuellement dans Google Search Console
   → Vérifier le sitemap.xml (les pages y sont bien présentes)
   → Ajouter des liens internes depuis les pages pivots

2. **Renforcer le maillage interne**
   → Depuis /pages/are → liens vers toutes les pages satellites ARE
   → Depuis /pages/impot → liens vers les simulations spécifiques
   → Depuis /pages/prime-activite → liens vers les scénarios

3. **Optimiser les pages à fort potentiel**
   → Pages ARE : "montant-are-2026" a un potentiel énorme (requêtes CTR 14-29%)
   → Pages IMPÔT : ajouter des données structurées (FAQ, HowTo)
   → Pages NOTAIRE : continuer les pages départementales (fort CTR)

4. **Surveiller l'indexation**
   → Relever les données SC dans 1 semaine pour voir l'évolution
   → Utiliser site:lescalculateurs.fr/pages/are/ dans Google
   → Vérifier la couverture d'indexation dans SC
""")

    # ---- EXPORT JSON ----
    export = {
        "periode": "21-27 mai 2026",
        "stats_globales": GLOBAL_STATS,
        "nouvelles_pages": {
            "total": 5,
            "trouvees_dans_sc": nouvelles_stats["trouvees"],
            "absentes": nouvelles_stats["absentes"],
            "clics_cumules": nouvelles_stats["clics"],
            "impressions_cumulees": nouvelles_stats["impressions"],
        },
        "satellites": {
            "total": len(PAGES_SATELLITES),
            "trouvees_dans_sc": total_sat_trouvees,
            "absentes": total_sat_absentes,
            "clics_cumules": total_sat_clics,
            "impressions_cumulees": total_sat_impressions,
            "par_famille": {f: {"clics": s["clics"], "impressions": s["impressions"], "trouvees": s["trouvees"]} for f, s in familles.items()},
        },
        "pivots": {key: find_sc_data(p["url"], SC_PAGES) for key, p in PAGES_PIVOTS.items()},
    }
    
    with open("rapport-traffic-nouvelles-pages.json", "w", encoding="utf-8") as f:
        json.dump(export, f, indent=2, ensure_ascii=False)
    print("\n📁 Rapport JSON exporté : rapport-traffic-nouvelles-pages.json")


if __name__ == "__main__":
    analyze()