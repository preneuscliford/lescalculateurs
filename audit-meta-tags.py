#!/usr/bin/env python3
"""Audit Meta Tags (title, description) for problem pages"""

import re
from pathlib import Path

# Define pages to audit
pages_to_audit = {
    "ARE - Cumul": "src/pages/are/are-cumul-salaire-temps-partiel-2026.html",
    "ARE - Fin de droits": "src/pages/are/are-fin-de-droits-aides-2026.html",
    "ARE - Durée": "src/pages/are/are-duree-indemnisation-2026.html",
    
    "Prime - Reprise emploi": "src/pages/prime-activite/prime-activite-reprise-emploi-personne-seule.html",
    "Prime - Temps partiel": "src/pages/prime-activite/prime-activite-temps-partiel-smic.html",
    "Prime - Couple": "src/pages/prime-activite/prime-activite-couple-sans-enfant-smic.html",
    "Prime - Parent isolé": "src/pages/prime-activite/prime-activite-parent-isole-un-enfant.html",
    
    "Impôt - 30k célibataire": "src/pages/impot/impot-revenu-30000-celibataire-2026.html",
    "Impôt - 45k couple": "src/pages/impot/impot-revenu-45000-couple-2026.html",
    "Impôt - 60k couple 1 enfant": "src/pages/impot/impot-revenu-60000-couple-un-enfant-2026.html",
    "Impôt - QF 2 parts": "src/pages/impot/impot-quotient-familial-2-parts-2026.html",
    "Impôt - Décote": "src/pages/impot/impot-decote-2026-simulation.html",
}

print("\n" + "="*140)
print("🔍 META TAGS AUDIT - Problem Pages")
print("="*140 + "\n")

for name, filepath in pages_to_audit.items():
    file = Path(filepath)
    
    if not file.exists():
        print(f"❌ {name:35s} | FILE NOT FOUND: {filepath}")
        continue
    
    try:
        content = file.read_text(encoding='utf-8')
        
        # Extract title
        title_match = re.search(r'<title>([^<]+)</title>', content)
        title = title_match.group(1) if title_match else "NOT FOUND"
        
        # Extract meta description
        desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']', content)
        description = desc_match.group(1) if desc_match else "NOT FOUND"
        
        # Check for noindex
        noindex_match = re.search(r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']*noindex[^"\']*)["\']', content)
        noindex = "🚨 NOINDEX DETECTED!" if noindex_match else "✓ Indexed"
        
        print(f"📄 {name:35s}")
        print(f"   Title: {title[:95]}")
        print(f"   Desc:  {description[:95]}")
        print(f"   Status: {noindex}")
        print()
        
    except Exception as e:
        print(f"⚠️  {name:35s} | ERROR: {e}")
        print()

print("="*140)
print("✓ Audit complete!\n")
