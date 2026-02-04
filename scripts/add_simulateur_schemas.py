#!/usr/bin/env python3
"""
Script SEO : Ajout de HowTo + BreadcrumbList + liens internes
sur toutes les pages du cluster "Simulateurs"
"""
import os
import re
import csv
import json
from pathlib import Path
from typing import Dict, List, Tuple

# ---------- CONFIG ----------
SRC_DIR = Path("pages_YMYL_FINAL_V2")  # Dossier source principal
OUT_DIR = Path("pages_SIMULATEURS_PLUS")
REPORT_CSV = Path("SIMULATEURS_PLUS_REPORT.csv")

# Mots-clés pour identifier les simulateurs
SIMULATEUR_PATTERNS = [
    r'simulateur', r'calculateur', r'estimation', r'calculez', r'simulez',
    r'calculatrice', r'outil de calcul', r'estimateur'
]

# Mapping des types de simulateurs
SIMULATEUR_TYPES = {
    r'apl|aide.*logement': 'APL',
    r'impôt|impot|revenu': 'Impôt sur le revenu',
    r'notaire|frais.*notaire': 'Frais de notaire',
    r'prime.*activite|prime.*activité': 'Prime d\'activité',
    r'rsa': 'RSA',
    r'ik|kilométrique|kilometrique|indemnité.*km': 'Indemnités kilométriques',
    r'plus.value|plusvalue': 'Plus-value immobilière',
    r'taxe.*foncière|taxe.*fonciere': 'Taxe foncière',
    r'prêt|pret.*immobilier': 'Prêt immobilier',
    r'salaire|brut.*net': 'Salaire brut/net',
    r'charge.*copropriété|charge.*copropriete': 'Charges de copropriété',
    r'are|chômage|chomage': 'Allocation chômage',
    r'aah|handicap': 'AAH',
    r'asf|familiale': 'Allocation familiale',
    r'crypto|bitcoin|plus.value.*crypto': 'Plus-value crypto',
    r'foncier|foncière': 'Revenu foncier',
}

# Liens internes à ajouter (rotatifs selon le type)
CLUSTER_LINKS = {
    'default': [
        ('/pages/pret', 'Simulez votre prêt immobilier'),
        ('/pages/taxe', 'Estimez votre taxe foncière'),
        ('/pages/prime-activite', 'Vérifiez votre prime d\'activité'),
    ],
    'APL': [
        ('/pages/pret', 'Simulez votre prêt immobilier'),
        ('/pages/taxe', 'Estimez votre taxe foncière'),
        ('/pages/rsa', 'Calculez votre RSA'),
    ],
    'Impôt': [
        ('/pages/salaire', 'Convertissez brut/net'),
        ('/pages/ik', 'Calculez vos indemnités kilométriques'),
        ('/pages/prime-activite', 'Vérifiez votre prime d\'activité'),
    ],
    'Notaire': [
        ('/pages/pret', 'Simulez votre prêt'),
        ('/pages/plusvalue', 'Calculez la plus-value'),
        ('/pages/taxe', 'Estimez la taxe foncière'),
    ],
    'Prêt': [
        ('/pages/notaire', 'Estimez les frais de notaire'),
        ('/pages/taxe', 'Calculez la taxe foncière'),
        ('/pages/apl', 'Vérifiez vos APL'),
    ],
}


def detect_simulateur_type(content: str, filename: str) -> str:
    """Détecte le type de simulateur selon le contenu et le nom de fichier"""
    content_lower = content.lower()
    filename_lower = filename.lower()
    
    for pattern, sim_type in SIMULATEUR_TYPES.items():
        if re.search(pattern, content_lower) or re.search(pattern, filename_lower):
            return sim_type
    return 'Simulateur'


def extract_page_title(content: str) -> str:
    """Extrait le title de la page"""
    match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
    return match.group(1).strip() if match else "Simulateur 2026"


def extract_canonical_url(content: str) -> str:
    """Extrait l'URL canonique de la page"""
    match = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if match:
        return match.group(1)
    # Essayer avec meta og:url
    match = re.search(r'<meta[^>]*property=["\']og:url["\'][^>]*content=["\']([^"\']+)["\']', content, re.IGNORECASE)
    if match:
        return match.group(1)
    return ""


def has_schema_type(content: str, schema_type: str) -> bool:
    """Vérifie si un type de schéma existe déjà"""
    pattern = rf'"@type"\s*:\s*"{schema_type}"'
    return bool(re.search(pattern, content))


def has_breadcrumb(content: str) -> bool:
    """Vérifie si BreadcrumbList existe déjà"""
    return has_schema_type(content, 'BreadcrumbList')


def has_howto(content: str) -> bool:
    """Vérifie si HowTo existe déjà"""
    return has_schema_type(content, 'HowTo')


def generate_howto(sim_type: str, title: str) -> str:
    """Génère le schéma HowTo personnalisé"""
    # Adapter le nom selon le type
    name_map = {
        'APL': f"Comment estimer mon aide au logement (APL) en 2026 ?",
        'Impôt sur le revenu': f"Comment calculer mon impôt sur le revenu 2026 ?",
        'Frais de notaire': f"Comment estimer les frais de notaire 2026 ?",
        "Prime d'activité": f"Comment calculer ma prime d'activité 2026 ?",
        'RSA': f"Comment estimer mon RSA 2026 ?",
        'Indemnités kilométriques': f"Comment calculer mes indemnités kilométriques 2026 ?",
        'Plus-value immobilière': f"Comment estimer ma plus-value immobilière 2026 ?",
        'Taxe foncière': f"Comment estimer ma taxe foncière 2026 ?",
        'Prêt immobilier': f"Comment simuler mon prêt immobilier 2026 ?",
        'Salaire brut/net': f"Comment convertir mon salaire brut en net 2026 ?",
        'Charges de copropriété': f"Comment estimer mes charges de copropriété 2026 ?",
    }
    
    name = name_map.get(sim_type, f"Comment utiliser le simulateur {sim_type} en 2026 ?")
    
    howto = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": name,
        "step": [
            {
                "@type": "HowToStep",
                "position": 1,
                "text": "Renseignez vos critères personnels dans le formulaire"
            },
            {
                "@type": "HowToStep",
                "position": 2,
                "text": "Cliquez sur le bouton 'Estimer' ou 'Calculer'"
            },
            {
                "@type": "HowToStep",
                "position": 3,
                "text": "Consultez le résultat détaillé et les explications"
            }
        ]
    }
    
    return f'''\n<!-- Schema.org HowTo -->
<script type="application/ld+json">
{json.dumps(howto, ensure_ascii=False, indent=2)}
</script>'''


def generate_breadcrumb(sim_type: str, canonical_url: str) -> str:
    """Génère le schéma BreadcrumbList"""
    # Déterminer le nom de la page selon le type
    page_names = {
        'APL': 'APL 2026',
        'Impôt sur le revenu': 'Impôt sur le revenu',
        'Frais de notaire': 'Frais de notaire',
        "Prime d'activité": 'Prime d\'activité',
        'RSA': 'RSA',
        'Indemnités kilométriques': 'Indemnités kilométriques',
        'Plus-value immobilière': 'Plus-value immobilière',
        'Taxe foncière': 'Taxe foncière',
        'Prêt immobilier': 'Prêt immobilier',
        'Salaire brut/net': 'Salaire brut/net',
        'Charges de copropriété': 'Charges de copropriété',
    }
    
    page_name = page_names.get(sim_type, sim_type)
    
    # Si pas d'URL canonique, construire une par défaut
    if not canonical_url:
        slug = sim_type.lower().replace(' ', '-').replace("'", '').replace('/', '-')
        canonical_url = f"https://www.lescalculateurs.fr/pages/{slug}"
    
    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Accueil",
                "item": "https://www.lescalculateurs.fr"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Simulateurs",
                "item": "https://www.lescalculateurs.fr/pages/simulateurs"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": page_name,
                "item": canonical_url
            }
        ]
    }
    
    return f'''\n<!-- Schema.org BreadcrumbList -->
<script type="application/ld+json">
{json.dumps(breadcrumb, ensure_ascii=False, indent=2)}
</script>'''


def generate_internal_links(sim_type: str) -> str:
    """Génère les liens internes du cluster"""
    # Choisir le bon ensemble de liens
    links = CLUSTER_LINKS.get('default')
    
    for key, link_set in CLUSTER_LINKS.items():
        if key in sim_type or key.lower() in sim_type.lower():
            links = link_set
            break
    
    # Éviter l'auto-lien
    links_html = '\n'.join([
        f'  <a href="{url}">{text}</a>'
        for url, text in links
    ])
    
    return f'''\n<!-- Liens internes cluster -->
<div class="cluster-links" style="margin-top: 2rem; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
  <p style="font-weight: 600; margin-bottom: 0.5rem;">🔄 Continuez votre simulation :</p>
{links_html}
</div>'''


def is_simulateur_file(file: Path) -> bool:
    """Détermine si un fichier est un simulateur"""
    try:
        content = file.read_text(encoding='utf-8').lower()
        # Vérifier les patterns de simulateur
        for pattern in SIMULATEUR_PATTERNS:
            if re.search(pattern, content):
                # Vérifier qu'il contient un formulaire ou des inputs
                if re.search(r'<input|type=["\']number["\']|calculator|simulateur', content):
                    return True
        # Vérifier aussi selon le nom de fichier
        filename = file.name.lower()
        for pattern in SIMULATEUR_TYPES.keys():
            if re.search(pattern, filename):
                return True
        return False
    except Exception:
        return False


def process_file(file: Path) -> Tuple[str, str, str, str, str]:
    """
    Traite un fichier simulateur
    Retourne: (status, howto_added, breadcrumb_added, internal_links_added, message)
    """
    try:
        content = file.read_text(encoding='utf-8')
        original_content = content
        
        # Détecter le type de simulateur
        sim_type = detect_simulateur_type(content, file.name)
        title = extract_page_title(content)
        canonical_url = extract_canonical_url(content)
        
        howto_added = 'NON'
        breadcrumb_added = 'NON'
        internal_links_added = 'NON'
        
        # 1. Ajouter HowTo s'il n'existe pas
        if not has_howto(content):
            howto_schema = generate_howto(sim_type, title)
            # Insérer avant </head>
            content = re.sub(r'(</head>)', howto_schema + r'\n\1', content, flags=re.IGNORECASE)
            howto_added = 'OUI'
        
        # 2. Ajouter BreadcrumbList s'il n'existe pas
        if not has_breadcrumb(content):
            breadcrumb_schema = generate_breadcrumb(sim_type, canonical_url)
            content = re.sub(r'(</head>)', breadcrumb_schema + r'\n\1', content, flags=re.IGNORECASE)
            breadcrumb_added = 'OUI'
        
        # 3. Ajouter les liens internes avant </body> ou </main> ou </article>
        links_html = generate_internal_links(sim_type)
        
        # Essayer d'insérer avant </body>, sinon avant </main>, sinon à la fin
        if '</body>' in content.lower():
            content = re.sub(r'(</body>)', links_html + r'\n\1', content, flags=re.IGNORECASE)
            internal_links_added = 'OUI'
        elif '</main>' in content.lower():
            content = re.sub(r'(</main>)', links_html + r'\n\1', content, flags=re.IGNORECASE)
            internal_links_added = 'OUI'
        else:
            # Ajouter à la fin du fichier
            content = content.rstrip() + '\n' + links_html + '\n'
            internal_links_added = 'OUI'
        
        # Vérifier si des changements ont été faits
        if content == original_content:
            return ('NO_CHANGE', 'NON', 'NON', 'NON', 'Aucun changement nécessaire')
        
        return ('OK', howto_added, breadcrumb_added, internal_links_added, f'Type: {sim_type}')
        
    except Exception as e:
        return ('ERROR', 'NON', 'NON', 'NON', str(e))


def main():
    """Fonction principale"""
    print("=" * 60)
    print("🔧 SEO ENGINE - Enrichissement des simulateurs")
    print("=" * 60)
    
    # Créer le dossier de sortie
    OUT_DIR.mkdir(exist_ok=True)
    
    # Scanner les fichiers
    print(f"\n📁 Scan de {SRC_DIR}...")
    
    all_files = list(SRC_DIR.rglob('*.html'))
    simulateur_files = [f for f in all_files if is_simulateur_file(f)]
    
    print(f"   Total fichiers HTML: {len(all_files)}")
    print(f"   Simulateurs détectés: {len(simulateur_files)}")
    
    # Traiter chaque fichier
    csv_rows: List[Dict] = []
    stats = {
        'total': 0,
        'ok': 0,
        'error': 0,
        'no_change': 0,
        'howto_added': 0,
        'breadcrumb_added': 0,
        'links_added': 0,
    }
    
    for file in simulateur_files:
        stats['total'] += 1
        rel_path = str(file.relative_to(SRC_DIR))
        
        print(f"\n🔍 Traitement: {rel_path}")
        
        # Traiter le fichier
        status, howto, breadcrumb, links, message = process_file(file)
        
        # Recopier le fichier traité dans le dossier de sortie
        try:
            content = file.read_text(encoding='utf-8')
            
            # Ré-appliquer les modifications pour la copie
            sim_type = detect_simulateur_type(content, file.name)
            title = extract_page_title(content)
            canonical_url = extract_canonical_url(content)
            
            # Appliquer les modifications
            if not has_howto(content):
                howto_schema = generate_howto(sim_type, title)
                content = re.sub(r'(</head>)', howto_schema + r'\n\1', content, flags=re.IGNORECASE)
            
            if not has_breadcrumb(content):
                breadcrumb_schema = generate_breadcrumb(sim_type, canonical_url)
                content = re.sub(r'(</head>)', breadcrumb_schema + r'\n\1', content, flags=re.IGNORECASE)
            
            links_html = generate_internal_links(sim_type)
            if '</body>' in content.lower():
                content = re.sub(r'(</body>)', links_html + r'\n\1', content, flags=re.IGNORECASE)
            elif '</main>' in content.lower():
                content = re.sub(r'(</main>)', links_html + r'\n\1', content, flags=re.IGNORECASE)
            else:
                content = content.rstrip() + '\n' + links_html + '\n'
            
            # Créer le chemin de sortie en conservant la structure
            out_file = OUT_DIR / file.relative_to(SRC_DIR)
            out_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Renommer avec suffixe
            new_name = out_file.stem + "_SIMULATEURS_PLUS.html"
            out_file = out_file.parent / new_name
            
            out_file.write_text(content, encoding='utf-8')
            print(f"   ✅ Écrit: {out_file}")
            
        except Exception as e:
            print(f"   ❌ Erreur copie: {e}")
            status = 'ERROR'
            message = str(e)
        
        # Mettre à jour les stats
        if status == 'OK':
            stats['ok'] += 1
            if howto == 'OUI':
                stats['howto_added'] += 1
            if breadcrumb == 'OUI':
                stats['breadcrumb_added'] += 1
            if links == 'OUI':
                stats['links_added'] += 1
        elif status == 'ERROR':
            stats['error'] += 1
        else:
            stats['no_change'] += 1
        
        # Ajouter au CSV
        csv_rows.append({
            'fichier': rel_path,
            'howto_added': howto if status != 'ERROR' else 'NON',
            'breadcrumb_added': breadcrumb if status != 'ERROR' else 'NON',
            'internal_links_added': links if status != 'ERROR' else 'NON',
            'status': status,
            'message': message
        })
    
    # Générer le rapport CSV
    with REPORT_CSV.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'fichier', 'howto_added', 'breadcrumb_added', 
            'internal_links_added', 'status', 'message'
        ])
        writer.writeheader()
        writer.writerows(csv_rows)
    
    # Récapitulatif
    print("\n" + "=" * 60)
    print("📊 RÉCAPITULATIF")
    print("=" * 60)
    print(f"Pages analysées : {stats['total']}")
    print(f"Pages corrigées : {stats['ok']}")
    print(f"HowTo ajoutés : {stats['howto_added']}")
    print(f"BreadcrumbList ajoutés : {stats['breadcrumb_added']}")
    print(f"Liens internes ajoutés : {stats['links_added'] * 3} (3 liens × {stats['links_added']} pages)")
    print(f"Erreurs : {stats['error']}")
    print(f"Sans changement : {stats['no_change']}")
    
    print("\n" + "=" * 60)
    print("📄 3 LIGNES CLÉS DU RAPPORT CSV")
    print("=" * 60)
    print("fichier;howto_added;breadcrumb_added;internal_links_added;status")
    for row in csv_rows[:3]:
        print(f"{row['fichier']};{row['howto_added']};{row['breadcrumb_added']};{row['internal_links_added']};{row['status']}")
    
    if len(csv_rows) > 3:
        print(f"... et {len(csv_rows) - 3} autres lignes")
    
    print(f"\n✅ Fichiers générés dans : {OUT_DIR.absolute()}")
    print(f"✅ Rapport CSV : {REPORT_CSV.absolute()}")


if __name__ == '__main__':
    main()
