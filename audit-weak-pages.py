#!/usr/bin/env python3
"""Audit RSA/Prime/APL pages - meta titles, descriptions, and identify fixes"""

from pathlib import Path
import re
import json

print("\n" + "="*160)
print("🔍 AUDIT: RSA/Prime d'Activité/APL Pages - Meta Tags + Structure")
print("="*160 + "\n")

# Target pages based on high-volume keywords
target_keywords = {
    'rsa': ['rsa simulation', 'simulation rsa', 'simulateur rsa'],
    'prime': ['prime activité simulation', 'simulateur prime', 'prime d\'activité simulation'],
    'apl': ['apl simulation', 'simulateur apl'],
}

pages_to_check = {
    'rsa': 'src/pages/rsa.html',
    'prime-activite': 'src/pages/prime-activite.html',
    'apl': 'src/pages/apl.html',
}

issues = []
recommendations = []

for category, page_path in pages_to_check.items():
    p = Path(page_path)
    
    if not p.exists():
        print(f"❌ {category.upper()}: Page not found at {page_path}")
        continue
    
    print(f"\n{'='*160}")
    print(f"📄 {category.upper()} - {page_path}")
    print(f"{'='*160}")
    
    content = p.read_text(encoding='utf-8')
    
    # Extract meta tags with regex
    title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE)
    title_text = title_match.group(1).strip() if title_match else "NOT FOUND"
    
    desc_match = re.search(r'<meta\s+name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', content, re.IGNORECASE)
    if not desc_match:
        desc_match = re.search(r'<meta\s+content=["\']([^"\']*)["\'][^>]*name=["\']description["\']', content, re.IGNORECASE)
    desc_text = desc_match.group(1).strip() if desc_match else "NOT FOUND"
    
    print(f"\n📝 CURRENT META:")
    print(f"   Title:       {title_text}")
    print(f"   Description: {desc_text}")
    
    # Check for keywords
    keywords_covered = {}
    for keyword in target_keywords.get(category, []):
        in_title = keyword.lower() in title_text.lower() if title_text != "NOT FOUND" else False
        in_desc = keyword.lower() in desc_text.lower() if desc_text != "NOT FOUND" else False
        keywords_covered[keyword] = {'title': in_title, 'desc': in_desc}
    
    print(f"\n🎯 KEYWORD COVERAGE:")
    for kw, coverage in keywords_covered.items():
        title_check = "✅" if coverage['title'] else "❌"
        desc_check = "✅" if coverage['desc'] else "❌"
        print(f"   \"{kw}\" → Title {title_check} | Description {desc_check}")
    
    # Check for calculator presence
    calculator = soup.find(id=f'{category}-calculator') or soup.find(class_=f'{category}-calculator')
    has_calc = "✅" if calculator else "❌"
    print(f"\n🧮 CALCULATOR: {has_calc}")
    
    # Check for quick values/presets
    quick_values = soup.find_all(class_='quick-value-btn')
    presets = soup.find_all(class_='preset-situation-btn')
    has_quick = "✅" if len(quick_values) > 0 or len(presets) > 0 else "❌"
    print(f"⚡ QUICK VALUES/PRESETS: {has_quick} ({len(quick_values)} quick + {len(presets)} presets)")
    
    # List issues
    page_issues = []
    if title_text == "NOT FOUND" or title_text == "":
        page_issues.append("Missing title tag")
    elif 'simulateur' not in title_text.lower():
        page_issues.append(f"Title missing 'simulateur' keyword")
    
    if desc_text == "NOT FOUND":
        page_issues.append("Missing meta description")
    elif not any(kw in desc_text.lower() for kw in target_keywords[category]):
        page_issues.append(f"Description missing key keywords")
    
    if not calculator:
        page_issues.append("Calculator component not found")
    
    if len(quick_values) == 0 and len(presets) == 0:
        page_issues.append("No quick values or preset buttons")
    
    if page_issues:
        print(f"\n🚨 ISSUES ({len(page_issues)}):")
        for i, issue in enumerate(page_issues, 1):
            print(f"   {i}. {issue}")
            issues.append({'page': category, 'issue': issue})
    else:
        print(f"\n✅ No major issues detected")
    
    # Recommendations
    page_recs = []
    if 'simulateur' not in title_text.lower():
        new_title = f"Simulateur {category.replace('-', ' ')} 2026 gratuit - Calcul montant instant | Les Calculateurs"
        page_recs.append(f"Update title to: \"{new_title}\"")
    
    if category == 'rsa' and 'montant' not in desc_text.lower():
        new_desc = "Calculateur RSA 2026 gratuit : simulez votre montant RSA en secondes. Estimation précise selon votre situation."
        page_recs.append(f"Update description to: \"{new_desc}\"")
    
    if category == 'prime-activite' and 'montant' not in desc_text.lower():
        new_desc = "Simulateur Prime d'activité 2026 : calcul gratuit du montant selon salaire et situation. Vérifiez votre éligibilité."
        page_recs.append(f"Update description to: \"{new_desc}\"")
    
    if category == 'apl' and 'montant' not in desc_text.lower():
        new_desc = "Calculateur APL 2026 : estimez votre montant d'aide au logement. Simulation gratuite et instantanée."
        page_recs.append(f"Update description to: \"{new_desc}\"")
    
    if page_recs:
        print(f"\n💡 RECOMMENDATIONS ({len(page_recs)}):")
        for i, rec in enumerate(page_recs, 1):
            print(f"   {i}. {rec}")
            recommendations.append({'page': category, 'recommendation': rec})

print("\n\n" + "="*160)
print(f"📊 SUMMARY: {len(issues)} issues found | {len(recommendations)} recommendations")
print("="*160 + "\n")

if issues:
    print("🚨 CRITICAL ISSUES BY PAGE:")
    issue_by_page = {}
    for issue in issues:
        page = issue['page']
        if page not in issue_by_page:
            issue_by_page[page] = []
        issue_by_page[page].append(issue['issue'])
    
    for page, issue_list in issue_by_page.items():
        print(f"\n{page.upper()}:")
        for issue in issue_list:
            print(f"  • {issue}")

if recommendations:
    print("\n\n✅ QUICK FIXES TO APPLY:")
    for rec in recommendations:
        print(f"\n{rec['page'].upper()}:")
        print(f"  → {rec['recommendation']}")
