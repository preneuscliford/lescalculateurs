#!/usr/bin/env python3
"""Analyze pages for COFIDIS affiliation integration opportunities"""

from pathlib import Path
import re

print("\n" + "="*180)
print("🔍 COFIDIS AFFILIATION - Page Integration Analysis")
print("="*180 + "\n")

pages_to_analyze = {
    'pret.html': {
        'path': 'src/pages/pret.html',
        'intent': 'Credit/Loan calculator - HIGH PRIORITY',
        'products': ['PSM (Personal Loan)', 'Rachat de Crédit'],
    },
    'financement.html': {
        'path': 'src/pages/financement.html',
        'intent': 'Financing for projects - HIGH PRIORITY',
        'products': ['PSM (Personal Loan)', 'Accessio (Revolving Credit)'],
    },
    'charges.html': {
        'path': 'src/pages/charges.html',
        'intent': 'Household expenses - MEDIUM (consolidation angle)',
        'products': ['Rachat de Crédit', 'PSM'],
    },
    'notaire.html': {
        'path': 'src/pages/notaire.html',
        'intent': 'Real estate costs - MEDIUM (down payment/fees)',
        'products': ['PSM', 'Rachat de Crédit'],
    },
}

analysis = []

for page_name, page_info in pages_to_analyze.items():
    p = Path(page_info['path'])
    
    if not p.exists():
        print(f"❌ {page_name}: Not found at {page_info['path']}")
        continue
    
    content = p.read_text(encoding='utf-8')
    
    # Extract meta info
    title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE)
    title = title_match.group(1).strip() if title_match else "N/A"
    
    # Check for forms/inputs
    has_form = bool(re.search(r'<form|<input|<button.*submit', content, re.IGNORECASE))
    form_count = len(re.findall(r'<form[^>]*id=["\']([^"\']*)["\']', content, re.IGNORECASE))
    
    # Check for calculator elements
    has_calculator = bool(re.search(r'id=["\'].*calculator|CalculatorFrame', content, re.IGNORECASE))
    
    # Check content size and depth
    content_size = len(content)
    headers = len(re.findall(r'<h[2-3]', content, re.IGNORECASE))
    
    print(f"\n{'='*180}")
    print(f"📄 {page_name.upper()}")
    print(f"{'='*180}")
    print(f"   URL: {page_info['path']}")
    print(f"   Title: {title}")
    print(f"   Intent: {page_info['intent']}")
    print(f"   COFIDIS Products: {', '.join(page_info['products'])}")
    print(f"\n   📊 ANALYSIS:")
    print(f"      • Forms/Calculators: {'✅' if has_form else '❌'} ({form_count} forms)")
    print(f"      • Calculator Component: {'✅' if has_calculator else '❌'}")
    print(f"      • Content Depth: {headers} sections | {content_size/1024:.1f}KB")
    
    # Integration opportunities
    opportunities = []
    
    if 'pret' in page_name.lower():
        opportunities = [
            "🟢 MAIN CTA: 'Comparer les meilleurs taux avec COFIDIS PSM'",
            "🟢 After calculator: 'Obtenir une offre personnalisée COFIDIS'",
            "🟢 Sidebar widget: COFIDIS lead form (3 fields: amount, duration, rate)",
        ]
    elif 'financement' in page_name.lower():
        opportunities = [
            "🟢 Project-specific CTAs: 'Financer vos travaux avec COFIDIS'",
            "🟡 Integration point: After project cost estimation",
            "🟡 Add comparison: COFIDIS vs personal savings vs banking partners",
        ]
    elif 'charges' in page_name.lower():
        opportunities = [
            "🟡 Consolidation angle: 'Réduire vos dépenses avec un rachat de crédit'",
            "🟡 After expense summary: 'Optimiser votre budget avec COFIDIS'",
        ]
    elif 'notaire' in page_name.lower():
        opportunities = [
            "🟡 Fee breakdown: Suggest COFIDIS for down payment/closing costs",
            "🟡 After cost calculator: 'Financer vos frais d\\'acquisition'",
        ]
    
    if opportunities:
        print(f"\n   🎯 INTEGRATION OPPORTUNITIES:")
        for opp in opportunities:
            print(f"      {opp}")
    
    priority = 'HIGH' if 'HIGH' in page_info['intent'] else 'MEDIUM'
    print(f"\n   ⭐ PRIORITY: {priority}")
    
    analysis.append({
        'page': page_name,
        'priority': priority,
        'forms': form_count,
        'has_calculator': has_calculator,
    })

# Summary
print("\n\n" + "="*180)
print("📋 INTEGRATION SUMMARY")
print("="*180 + "\n")

high_priority = [a for a in analysis if a['priority'] == 'HIGH']
medium_priority = [a for a in analysis if a['priority'] == 'MEDIUM']

print(f"🟢 HIGH PRIORITY ({len(high_priority)} pages):")
for item in high_priority:
    print(f"   • {item['page']}")

print(f"\n🟡 MEDIUM PRIORITY ({len(medium_priority)} pages):")
for item in medium_priority:
    print(f"   • {item['page']}")

print("\n\n" + "="*180)
print("🎯 RECOMMENDED IMPLEMENTATION PHASES")
print("="*180 + "\n")

print("""
PHASE 1 (Week 1-2): Core Integration
  • pret.html: Add COFIDIS CTA below calculator
  • financement.html: Add project-specific financing options
  • Expected leads: 20-40 leads/week

PHASE 2 (Week 3-4): Secondary Integration
  • charges.html: Consolidation messaging
  • notaire.html: Acquisition cost financing
  • Expected leads: +10-20 leads/week

PHASE 3 (Week 5+): Advanced
  • A/B test different CTA messaging
  • Track conversion by product (CR vs PSM)
  • Optimize based on performance data
  • Expected optimization: +30-50% conversion improvement
""")

print("="*180 + "\n")
