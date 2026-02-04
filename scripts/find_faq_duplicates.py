#!/usr/bin/env python3
import os
import re

root = '.'
report = []

jsonld_re = re.compile(r'<script[^>]*type=["\']application\/ld\+json["\'][^>]*>[\s\S]*?"@type"\s*:\s*"FAQPage"[\s\S]*?<\/script>', re.I)
microdata_re = re.compile(r'itemscope[^>]*itemtype=["\']https?:\/\/schema\.org\/FAQPage["\']|itemtype=["\']https?:\/\/schema\.org\/FAQPage["\']', re.I)

for dirpath, dirnames, filenames in os.walk(root):
    # skip node_modules and .git and some build folders
    if any(p in dirpath for p in ['node_modules', '.git', '__pycache__']):
        continue
    for f in filenames:
        if not f.lower().endswith('.html'):
            continue
        path = os.path.join(dirpath, f)
        try:
            with open(path, 'r', encoding='utf-8') as fh:
                text = fh.read()
        except Exception:
            try:
                with open(path, 'r', encoding='latin-1') as fh:
                    text = fh.read()
            except Exception:
                continue
        has_jsonld = bool(jsonld_re.search(text))
        has_micro = bool(microdata_re.search(text))
        if has_jsonld or has_micro:
            report.append((path.replace('\\', '/'), 'OUI' if has_jsonld else 'NON', 'OUI' if has_micro else 'NON'))

# write CSV
out = 'faq_duplicates_report.csv'
with open(out, 'w', encoding='utf-8') as fo:
    fo.write('file,has_jsonld_faq,has_microdata_faq\n')
    for row in report:
        fo.write(','.join(row) + '\n')

print(f"Analysed HTML files, report written to {out} ({len(report)} entries)")
