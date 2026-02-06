#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

folders = ['content_SAFE', 'pages_YMYL_SAFE']
issues = []
files_checked = 0

for folder in folders:
    if os.path.exists(folder):
        for file in os.listdir(folder):
            if file.endswith('.html'):
                filepath = os.path.join(folder, file)
                files_checked += 1
                with open(filepath, 'rb') as f:
                    raw = f.read()
                    # Check for UTF-8 BOM
                    has_bom = raw.startswith(b'\xef\xbb\xbf')
                    
                    # Decode with error handling
                    content = raw.decode('utf-8', errors='replace')
                    
                    # Check for replacement character
                    has_replacement = '�' in content
                    
                    # Check for Latin-1 artifacts
                    has_latin1 = 'Ã©' in content or 'Ã ' in content or 'Ã´' in content or 'Ã¨' in content or 'Ãª' in content
                    
                    if has_bom or has_replacement or has_latin1:
                        issue_parts = []
                        if has_bom:
                            issue_parts.append("BOM")
                        if has_replacement:
                            # Find first occurrence
                            lines = content.split('\n')
                            for i, line in enumerate(lines, 1):
                                if '�' in line:
                                    preview = line.strip()[:80]
                                    issue_parts.append(f"� ligne {i}: {preview}")
                                    break
                        if has_latin1:
                            lines = content.split('\n')
                            for i, line in enumerate(lines, 1):
                                if 'Ã©' in line or 'Ã ' in line or 'Ã´' in line:
                                    preview = line.strip()[:80]
                                    issue_parts.append(f"Latin-1 ligne {i}: {preview}")
                                    break
                        issues.append(f"{filepath}: {', '.join(issue_parts)}")

print(f"Fichiers verifies: {files_checked}")
print(f"Problemes trouves: {len(issues)}")
print()

if issues:
    print("=== PROBLEMES DETECTES ===")
    for issue in issues:
        print(issue)
else:
    print("=== AUCUN PROBLEME UTF-8 DETECTE ===")
