#!/usr/bin/env python3
"""Actualiza únicamente la sección de historial del README desde registro_commits.csv."""
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CSV = ROOT / 'registro_commits.csv'
README = ROOT / 'README.md'
BEGIN = '<!-- HISTORIAL_MAKE_INICIO -->'
END = '<!-- HISTORIAL_MAKE_FIN -->'

def cell(s):
    return str(s or '').replace('|', r'\|').replace('\r', ' ').replace('\n', ' ').strip()

with CSV.open(encoding='utf-8-sig', newline='') as f:
    entries = list(csv.DictReader(f))
seen = set()
valid = []
for r in entries:
    sha = (r.get('sha') or '').strip().lower()
    if not re.fullmatch('[a-f0-9]{40}', sha) or sha in seen:
        continue
    if (r.get('mensaje') or '').startswith('chore(make):'):
        continue
    seen.add(sha)
    valid.append((sha, r))
valid.sort(key=lambda e: e[1].get('fecha_utc', ''), reverse=True)
lines = [
    '## Historial de commits', '',
    'Generado automáticamente a partir de [`registro_commits.csv`](registro_commits.csv).', '',
    '| Fecha UTC | Autor | Mensaje | Commit |',
    '| --- | --- | --- | --- |',
]
for sha, row in valid:
    url = f'https://github.com/NachoSLKN/Desarrollo-Web/commit/{sha}'
    lines.append(f"| {cell(row.get('fecha_utc'))} | {cell(row.get('autor'))} | {cell(row.get('mensaje'))} | [`{sha[:7]}`]({url}) |")
if not valid:
    lines.append('| — | — | Sin commits registrados | — |')
section = BEGIN + '\n' + '\n'.join(lines) + '\n' + END
old = README.read_text(encoding='utf-8')
if BEGIN in old and END in old:
    prefix, tail = old.split(BEGIN, 1)
    _, suffix = tail.split(END, 1)
    updated = prefix.rstrip() + '\n\n' + section + suffix
else:
    updated = old.rstrip() + '\n\n' + section + '\n'
if updated != old:
    README.write_text(updated, encoding='utf-8', newline='\n')
