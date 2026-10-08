#!/usr/bin/env python3
"""
Parse famous_people.csv into people.json for the backtest harness.

Event categories were assigned by hand from the event text alone, BEFORE any
chart was computed, so the labels cannot be tuned to the engine's output:

  M  marriage / new union          C  child born
  A  achievement, rise, award, election win, launch, public recognition
  U  upheaval: loss, crisis, ending (resignation, retirement, divorce, accident,
     scandal, death of someone close, war event)
  T  transition: relocation, enlistment, affiliation or identity change

An event may carry two letters ("AU" = accession that followed a death).
Voluntary ending of a role counts as U. Anything dated after the person's
death is flagged posthumous and excluded from timing tests.
"""
import csv, json, re, sys
from pathlib import Path

HERE = Path(__file__).parent
LABELS = {
 1: ['A','A','A','T'],
 2: ['A','A','A','A'],
 3: ['M','A','A','A'],
 4: ['A','A','U','A'],
 5: ['M','AU','A','A'],
 6: ['A','M','AU','A'],
 7: ['M','C','U','U'],
 8: ['U','M','C','A'],
 9: ['M','C','U','A'],
 10:['A','M','U','A'],
 11:['M','A','A','U'],
 12:['A','A','U','U'],
 13:['A','A','U','A'],
 14:['A','A','U','U'],
 15:['A','A','A','A'],
 16:['M','A','A','A'],
 17:['A','A','A','U'],
 18:['A','A','A','A'],
 19:['A','A','A','A'],
 20:['M','M','M','A'],
 21:['A','A','T','M'],
 22:['A','A','M','U'],
 23:['A','M','C','M'],
 24:['A','U','A','A'],
 25:['T','A','A','A'],
 26:['A','M','C','A'],
 27:['A','U','M','A'],
 28:['A','A','M','A'],
 29:['A','A','T','A'],
 30:['A','A','M','A'],
 31:['A','M','A','A'],
 32:['A','M','T','M'],
 33:['T','U','U','U'],
 34:['M','A','A','U'],
 35:['A','M','A','UT'],
 36:['A','M','A','A'],
 37:['U','A','A','A'],
 38:['A','A','A','A'],
 39:['A','A','A','A'],
 40:['A','M','A','A'],
 41:['A','A','C','M'],
 42:['A','M','M','A'],
 43:['M','A','A','A'],
 44:['A','A','A','A'],
 45:['A','A','A','A'],
 46:['A','M','C','C'],
 47:['A','A','U','A'],
 48:['A','A','U','A'],
 49:['A','A','A','A'],
 50:['M','A','A','A'],
}

def d(s):
    s = s.strip()
    m = re.match(r'(\d\d)/(\d\d)/(\d{4})$', s)
    return f'{m[3]}-{m[2]}-{m[1]}' if m else None

def coord(s):
    m = re.match(r'(\d+)([NSEW])(\d+)$', s.strip())
    v = int(m[1]) + int(m[3]) / 60
    return -v if m[2] in 'SW' else v

def offset_min(tz):
    m = re.match(r'(\w+)\s+(\d+)h(?:(\d+)m)?\s*([EW])?$', tz.strip())
    mins = int(m[2]) * 60 + int(m[3] or 0)
    return -mins if m[4] == 'W' else mins

rows = list(csv.DictReader(open(HERE / 'famous_people.csv', encoding='utf-8')))
out = []
for r in rows:
    n = int(r['No'])
    bd = d(r['Birth Date (DD/MM/YYYY)'])
    hh, mm = map(int, r['Birth Time (24h local)'].split(':'))
    off = offset_min(r['Time Zone'])
    y, mo, da = map(int, bd.split('-'))
    # local -> UTC as a plain minute count so LMT offsets (0h40m) stay exact
    from datetime import datetime, timedelta
    local = datetime(y, mo, da, hh, mm)
    utc = local - timedelta(minutes=off)
    death_raw = r['Death Date'].strip()
    death = d(death_raw) or (d(death_raw.split()[-1]) if death_raw.startswith('Disappeared') else None)
    events = []
    for i in range(1, 5):
        ed = d(r[f'Event {i} Date'])
        cats = LABELS[n][i - 1]
        events.append({'date': ed, 'text': r[f'Event {i}'], 'cats': list(cats),
                       'posthumous': bool(death and ed > death)})
    out.append({
        'id': n, 'name': r['Name'], 'famousFor': r['Famous For'],
        'localBirth': local.strftime('%Y-%m-%dT%H:%M:00'),
        'utcBirth': utc.strftime('%Y-%m-%dT%H:%M:00'),
        'offsetMin': off, 'tzLabel': r['Time Zone'],
        'place': r['Birth Place'], 'country': r['Country'],
        'lat': round(coord(r['Latitude']), 4), 'lon': round(coord(r['Longitude']), 4),
        'rodden': r['Rodden Rating'], 'events': events,
        'death': death, 'deathKind': ('living' if death_raw == 'Living' else 'missing' if death_raw.startswith('Disappeared') else 'died'),
    })
(HERE / 'people.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))
cnt = {}
for p in out:
    for e in p['events']:
        for c in e['cats']:
            cnt[c] = cnt.get(c, 0) + 1
print(len(out), 'people; label counts', cnt, '; deaths', sum(1 for p in out if p['deathKind'] == 'died'))
