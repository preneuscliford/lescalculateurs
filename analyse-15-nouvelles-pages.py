#!/usr/bin/env python3
"""
Analyse ciblée : uniquement les pages FRÂCHEMENT CRÉÉES (nouveaux fichiers HTML)
vs données Search Console (21-27 mai 2026)
"""

# ============================================================
# PAGES FRÂCHEMENT CRÉÉES (fichiers HTML nouveaux, dédupliqués)
# ============================================================
# Chaque page a 2 fichiers (page.html + page/index.html), on garde 1 slug unique

PAGES_CREEES = [
    # --- Commit a0d8e9f5 : "pseo: generate scenarios and pages" ---
    {"slug": "are-apres-cdd", "famille": "ARE", "url": "https://www.lescalculateurs.fr/pages/are/are-apres-cdd/"},
    {"slug": "impot-couple-deux-enfants-2026", "famille": "IMPÔT", "url": "https://www.lescalculateurs.fr/pages/impot/impot-couple-deux-enfants-2026/"},
    {"slug": "impot-parent-isole-un-enfant-2026", "famille": "IMPÔT", "url": "https://www.lescalculateurs.fr/pages/impot/impot-parent-isole-un-enfant-2026/"},
    {"slug": "frais-notaire-residence-secondaire", "famille": "NOTAIRE", "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-residence-secondaire/"},
    {"slug": "prime-activite-couple-un-enfant", "famille": "PRIME ACTIVITÉ", "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-un-enfant/"},
    
    # --- Commit f7d43b28 : "add ARE pseo pages" ---
    {"slug": "are-fin-de-droits-rsa-ou-apl", "famille": "ARE", "url": "https://www.lescalculateurs.fr/pages/are/are-fin-de-droits-rsa-ou-apl/"},
    {"slug": "are-reprise-emploi-temps-partiel", "famille": "ARE", "url": "https://www.lescalculateurs.fr/pages/are/are-reprise-emploi-temps-partiel/"},
    
    # --- Commit 2ab9791d : "Integrate notaire pSEO build" ---
    {"slug": "comparaison-ancien-neuf-250k", "famille": "NOTAIRE", "url": "https://www.lescalculateurs.fr/pages/notaire/comparaison-ancien-neuf-250k/"},
    {"slug": "comparaison-neuf-ancien-200k", "famille": "NOTAIRE", "url": "https://www.lescalculateurs.fr/pages/notaire/comparaison-neuf-ancien-200k/"},
    {"slug": "comparaison-terrain-ancien-100k", "famille": "NOTAIRE", "url": "https://www.lescalculateurs.fr/pages/notaire/comparaison-terrain-ancien-100k/"},
    {"slug": "frais-notaire-ancien-simulation", "famille": "NOTAIRE", "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-ancien-simulation/"},
    {"slug": "frais-notaire-neuf-reduction", "famille": "NOTAIRE", "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-neuf-reduction/"},
    {"slug": "frais-notaire-terrain", "famille": "NOTAIRE", "url": "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-terrain/"},
    
    # --- Commit 94670258 : "prime-activite-couple-4-enfants" ---
    {"slug": "prime-activite-couple-4-enfants", "famille": "PRIME ACTIVITÉ", "url": "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-4-enfants/"},
    
    # --- Commit 6da7071c : "city-specific nuances" + 1e76bb47 : "VDF income city pages" ---
    {"slug": "niveau-de-vie-par-ville", "famille": "REVENUS", "url": "https://www.lescalculateurs.fr/pages/revenus/niveau-de-vie-par-ville/"},
    {"slug": "reste-a-vivre-apres-loyer-700-a-lyon", "famille": "REVENUS", "url": "https://www.lescalculateurs.fr/pages/revenus/reste-a-vivre-apres-loyer-700-a-lyon/"},
    {"slug": "reste-a-vivre-apres-loyer-700-a-marseille", "famille": "REVENUS", "url": "https://www.lescalculateurs.fr/pages/revenus/reste-a-vivre-apres-loyer-700-a-marseille/"},
    {"slug": "reste-a-vivre-apres-loyer-700-a-paris", "famille": "REVENUS", "url": "https://www.lescalculateurs.fr/pages/revenus/reste-a-vivre-apres-loyer-700-a-paris/"},
    {"slug": "vivre-avec-1800-net-a-lyon", "famille": "REVENUS", "url": "https://www.lescalculateurs.fr/pages/revenus/vivre-avec-1800-net-a-lyon/"},
    {"slug": "vivre-avec-1800-net-a-marseille", "famille": "REVENUS", "url": "https://www.lescalculateurs.fr/pages/revenus/vivre-avec-1800-net-a-marseille/"},
    {"slug": "vivre-avec-1800-net-a-paris", "famille": "REVENUS", "url": "https://www.lescalculateurs.fr/pages/revenus/vivre-avec-1800-net-a-paris/"},
    {"slug": "revenu-median-commune", "famille": "REVENUS", "url": "https://www.lescalculateurs.fr/pages/revenu-median-commune/"},
]

# Données Search Console extraites du fichier Excel
SC_DATA = {
    # Format: url -> {clics, impressions, ctr, position}
    "https://www.lescalculateurs.fr/pages/are": (158, 11685, 0.0135, 8.58),
    "https://www.lescalculateurs.fr/pages/apl": (146, 13047, 0.0112, 8.02),
    "https://www.lescalculateurs.fr/pages/prime-activite": (91, 8666, 0.0105, 8.80),
    "https://www.lescalculateurs.fr/pages/notaire": (15, 1070, 0.0140, 7.75),
    "https://www.lescalculateurs.fr/pages/impot": (7, 247, 0.0283, 22.17),
    "https://www.lescalculateurs.fr/pages/rsa": (18, 4630, 0.0039, 9.21),
    "https://www.lescalculateurs.fr/pages/are/are-apres-cdd/": None,
    "https://www.lescalculateurs.fr/pages/impot/impot-couple-deux-enfants-2026/": None,
    "https://www.lescalculateurs.fr/pages/impot/impot-parent-isole-un-enfant-2026/": None,
    "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-residence-secondaire/": None,
    "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-un-enfant/": None,
    "https://www.lescalculateurs.fr/pages/notaire/frais-notaire-ancien-simulation/": (0, 8, 0, 20.62),
    "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-couple-4-enfants/": (0, 1, 0, 6.0),
    "https://www.lescalculateurs.fr/pages/prime-activite/prime-activite-parent-isole-un-enfant/": (1, 2, 0.5, 5.5),
    "https://www.lescalculateurs.fr/pages/revenu-median-commune/": (1, 38, 0.0263, 7.5),
    "https://www.lescalculateurs.fr/pages/reste-a-vivre/": (0, 8, 0, 7.88),
    "https://www.lescalculateurs.fr/pages/salaire-net-apres-impot/": (0, 4, 0, 10.75),
    "https://www.lescalculateurs.fr/pages/cout-reel-voiture/": (0, 7, 0, 7.71),
    "https://www.lescalculateurs.fr/pages/revenus/nantes/": (1, 20, 0.05, 4.65),
    "https://www.lescalculateurs.fr/pages/revenus/toulouse/": (1, 14, 0.0714, 6.5),
    "https://www.lescalculateurs.fr/pages/revenus/paris/": (0, 27, 0, 8.37),
    "https://www.lescalculateurs.fr/pages/revenus/montpellier/": (0, 25, 0, 6.0),
    "https://www.lescalculateurs.fr/pages/revenus/bordeaux/": (0, 24, 0, 5.67),
    "https://www.lescalculateurs.fr/pages/revenus/nice/": (0, 10, 0, 5.4),
    "https://www.lescalculateurs.fr/pages/revenus/marseille/": (0, 10, 0, 6.0),
    "https://www.lescalculateurs.fr/pages/revenus/lille/": (0, 9, 0, 6.67),
    "https://www.lescalculateurs.fr/pages/revenus/lyon/": (0, 7, 0, 7.14),
    "https://www.lescalculateurs.fr/pages/revenus/strasbourg/": (0, 3, 0, 4.67),
}


def main():
    print("=" * 70)
    print("ANALYSE DES PAGES FRÂCHEMENT CRÉÉES (nouveaux fichiers HTML)")
    print("Période Search Console : 21-27 mai 2026 (7 jours)")
    print("=" * 70)
    
    # Stats par statut
    stats = {"✅ INDEXÉE + CLICS": [], "⚠️ INDEXÉE (0 clic)": [], "❌ NON INDEXÉE": []}
    total_clics = 0
    total_impressions = 0
    
    print(f"\n{'#':<3} {'Page':<45} {'Clics':>6} {'Impr.':>8} {'CTR':>7} {'Pos.':>6} {'Statut'}")
    print("-" * 95)
    
    for i, page in enumerate(PAGES_CREEES, 1):
        url = page["url"]
        data = SC_DATA.get(url)
        
        if data is None:
            # Pas trouvée du tout
            stats["❌ NON INDEXÉE"].append(page)
            print(f"{i:<3} {page['slug']:<45} {'—':>6} {'—':>8} {'—':>7} {'—':>6} ❌ NON INDEXÉE")
        elif data[0] > 0:
            # Indexée avec clics
            total_clics += data[0]
            total_impressions += data[1]
            stats["✅ INDEXÉE + CLICS"].append(page)
            print(f"{i:<3} {page['slug']:<45} {data[0]:>6} {data[1]:>8,} {data[2]:>6.1%} {data[3]:>5.1f} ✅ CLICS")
        else:
            # Indexée sans clics
            total_impressions += data[1]
            stats["⚠️ INDEXÉE (0 clic)"].append(page)
            print(f"{i:<3} {page['slug']:<45} {data[0]:>6} {data[1]:>8,} {data[2]:>6.1%} {data[3]:>5.1f} ⚠️ IMPR.")
    
    # ----- RÉSUMÉ -----
    print("\n" + "=" * 70)
    print("RÉSUMÉ")
    print("=" * 70)
    
    total = len(PAGES_CREEES)
    idx_clics = len(stats["✅ INDEXÉE + CLICS"])
    idx_impression = len(stats["⚠️ INDEXÉE (0 clic)"])
    non_idx = len(stats["❌ NON INDEXÉE"])
    
    print(f"  Total pages créées      : {total}")
    print(f"  ✅ Indexées + clics     : {idx_clics} ({idx_clics/total*100:.0f}%)")
    print(f"  ⚠️ Indexées (0 clic)   : {idx_impression} ({idx_impression/total*100:.0f}%)")
    print(f"  ❌ Non indexées         : {non_idx} ({non_idx/total*100:.0f}%)")
    print(f"  → Clics totaux          : {total_clics}")
    print(f"  → Impressions totales   : {total_impressions:,}")
    
    # ----- PAR FAMILLE -----
    print("\n" + "=" * 70)
    print("PAR FAMILLE")
    print("=" * 70)
    familles = {}
    for page in PAGES_CREEES:
        f = page["famille"]
        if f not in familles:
            familles[f] = {"total": 0, "clics": 0, "impressions": 0, "indexees": 0}
        familles[f]["total"] += 1
        data = SC_DATA.get(page["url"])
        if data:
            familles[f]["indexees"] += 1
            familles[f]["clics"] += data[0]
            familles[f]["impressions"] += data[1]
    
    print(f"{'Famille':<20} {'Pages':>6} {'Indexées':>9} {'Clics':>6} {'Impr.':>8}")
    print("-" * 55)
    for f, s in sorted(familles.items(), key=lambda x: x[1]["clics"], reverse=True):
        print(f"{f:<20} {s['total']:>6} {s['indexees']:>8}/{s['total']} {s['clics']:>6} {s['impressions']:>8,}")
    
    # ----- PAGES AVEC CLICS (top performers) -----
    if stats["✅ INDEXÉE + CLICS"]:
        print("\n" + "=" * 70)
        print("🏆 PAGES QUI GÉNÈRENT DÉJÀ DU TRAFIC")
        print("=" * 70)
        for page in stats["✅ INDEXÉE + CLICS"]:
            data = SC_DATA.get(page["url"])
            if data:
                print(f"  ✅ {page['slug']} ({page['famille']})")
                print(f"     → {data[0]} clics | {data[1]:,} impressions | CTR {data[2]:.1%} | pos {data[3]:.1f}")
    
    # ----- PAGES INDEXÉES SANS CLICS -----
    if stats["⚠️ INDEXÉE (0 clic)"]:
        print("\n" + "=" * 70)
        print("🔍 PAGES INDEXÉES MAIS SANS CLIC (à optimiser)")
        print("=" * 70)
        for page in stats["⚠️ INDEXÉE (0 clic)"]:
            data = SC_DATA.get(page["url"])
            if data:
                print(f"  ⚠️ {page['slug']} ({page['famille']})")
                print(f"     → {data[1]:,} impressions | pos {data[3]:.1f} — position trop basse ou titre/meta à revoir")
    
    # ----- PAGES NON INDEXÉES -----
    if stats["❌ NON INDEXÉE"]:
        print("\n" + "=" * 70)
        print("❌ PAGES NON INDEXÉES (invisibles dans Google)")
        print("=" * 70)
        for page in stats["❌ NON INDEXÉE"]:
            print(f"  ❌ {page['slug']} ({page['famille']}) — à soumettre dans Search Console")
    
    # ----- RECOMMANDATIONS -----
    print("\n" + "=" * 70)
    print("📋 RECOMMANDATIONS")
    print("=" * 70)
    
    if non_idx > 0:
        print(f"""
🔴 {non_idx} pages NON INDEXÉES → Action prioritaire :
   1. Vérifier que ces pages sont bien dans le sitemap.xml
   2. Les soumettre manuellement dans Google Search Console
   3. Ajouter des backlinks internes depuis les pages pivots
   4. Vérifier que les balises meta robots n'ont pas de noindex
""")
    
    if idx_impression > 0:
        print(f"""
🟡 {idx_impression} pages indexées mais 0 clic → À améliorer :
   1. Optimiser les balises title/meta description (CTR trop faible)
   2. Vérifier la position moyenne (>10 = invisible)
   3. Enrichir le contenu avec des données structurées (FAQ, HowTo)
   4. Ajouter des liens internes pour transmettre du PageRank
""")
    
    if idx_clics > 0:
        print(f"""
🟢 {idx_clics} pages génèrent déjà du trafic → À protéger et amplifier :
   1. Continuer à enrichir le contenu
   2. Suivre l'évolution des positions semaine après semaine
   3. Créer des backlinks vers ces pages
""")


if __name__ == "__main__":
    main()