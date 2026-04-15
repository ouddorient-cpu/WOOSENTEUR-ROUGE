import csv
with open('d:/Woosenteur/woosenteur.fr_mega_export_20260302.csv', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    for row in reader:
        url = row[0]
        issues = [headers[i] for i, val in enumerate(row) if i > 0 and val == '1']
        if issues:
            print(f'- {url}: {", ".join(issues)}')
