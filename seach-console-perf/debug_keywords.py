import csv

filepath = r'C:\Users\prene\Downloads\www.lescalculateurs.fr_KeywordReport_4_19_2026.csv'
with open(filepath, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    print('Fieldnames:', reader.fieldnames)
    for i, row in enumerate(reader):
        if i < 10:
            kw = row.get('Keyword', 'N/A')
            impr = row.get('Impressions', 'N/A')
            clicks = row.get('Clicks', 'N/A')
            ctr = row.get('CTR', 'N/A')
            pos = row.get('Avg. Position', 'N/A')
            print(f'Row {i}: KW={kw[:80]} | Impr={impr} | Clicks={clicks} | CTR={ctr} | Pos={pos}')