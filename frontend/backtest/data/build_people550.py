#!/usr/bin/env python3
"""
Parse famous_people_550.csv into people550.json for the backtest harness.

Same schema as build_people.py, scaled to 550 lives. Labels are assigned from
the event TEXT ALONE by the fixed keyword rules below, written and frozen before
any chart in this set was computed, so they cannot be tuned to the engine:

  M  marriage / new union          C  child born
  A  achievement, rise, award, election win, launch, release, record, founding
  U  upheaval: loss, crisis, ending (defeat, resignation, retirement, divorce,
     accident, illness, arrest, scandal, death of someone close)
  T  transition: relocation, signing, joining, ordination, identity change
  X  the person's own death or funeral restated as an event (the death date
     column covers it) — excluded
  O  anything else that has no claim to timing (anniversaries, birthdays) — excluded

The first 50 rows are the 50 lives of the earlier study; their hand labels
(people.json) are kept, and the keyword rules are scored against them as a
check on the classifier (printed at the end).

Rows are excluded from timing work when the birth date is Julian-calendar
(the ephemeris takes Gregorian dates) — flagged `julian`.

Profession groups come from the "Famous For" text by the same kind of fixed
keyword rules (first match wins, order below).
"""
import csv, json, re
from datetime import datetime, timedelta
from pathlib import Path

HERE = Path(__file__).parent

def d(s):
    s = s.strip()
    m = re.match(r'(\d\d)/(\d\d)/(\d{4})$', s)
    return f'{m[3]}-{m[2]}-{m[1]}' if m else None

def coord(s):
    m = re.match(r'(\d+)([NSEW])(\d+)$', s.strip())
    v = int(m[1]) + int(m[3]) / 60
    return -v if m[2] in 'SW' else v

def offset_min(tz):
    core = tz.split('(')[0].strip()
    m = re.match(r'(\w+)\s+(\d+)h(?:(\d+)m)?\s*([EW])?$', core)
    mins = int(m[2]) * 60 + int(m[3] or 0)
    return -mins if m[4] == 'W' else mins

# ── event classifier (order matters: first rule that matches wins) ───────────
I = re.I
KIN = r'(father|mother|wife|husband|son|daughter|sister|brother|partner|fianc\w*|grandson|granddaughter|grandmother|grandfather|mentor|friend|stepson|stepdaughter|nephew|niece|bandmate|lover|companion|parents?)'
RULES = [
    ('O', re.compile(r'\b(celebrated|marked)\b.*\b(birthday|anniversary|jubilee)\b|\b\d+(st|nd|rd|th) birthday\b', I)),
    ('X', re.compile(r'^(died|dies|death|found dead|funeral|buried|assassinated|executed|killed|murdered|shot dead|state funeral|lay in state|beheaded|guillotined)\b', I)),
    ('U', re.compile(KIN + r'\b.*\b(died|dies|killed|death|murdered|suicide|assassinated|executed|drowned|shot)\b', I)),
    ('U', re.compile(r'\b(death of|deaths of|lost (his|her|their) (wife|husband|son|daughter|father|mother))\b', I)),
    ('C', re.compile(r'\b(son|daughter|child|children|twins?|baby|first child|heir|prince|princess)\b.*\bborn\b|\bgave birth\b|\bbirth of (his|her|their) (son|daughter|child)\b|\badopted (a |his |her )?(son|daughter|child)\b', I)),
    ('U', re.compile(r'\b(divorce[ds]?|separat(ed|ion)|split from|annul(led|ment)|marriage ended)\b', I)),
    ('M', re.compile(r'\b(married|marries|marriage to|wed|weds|wedding|civil (union|partnership)|eloped)\b', I)),
    ('A', re.compile(r'^(won|wins|awarded|elected|re-?elected|inaugurated|crowned|received|inducted|named|knighted|set (a )?(world )?record|became|performed|began personal rule|defeated (?!in\b|by\b))', I)),
    ('M', re.compile(r'\bremarried\b(?!.*\b(mother|father)\b)', I)),
    ('U', re.compile(r'\b(lost|loses|defeated|resigned|resigns|resignation|fired|dismissed|sacked|ousted|overthrown|deposed|abdicat\w*|arrest\w*|convicted|imprisoned|jailed|prison|sentenced|indicted|charged|exiled|exile|fled|flight to|banned|suspended|accident|crash\w*|struck by|injur\w*|wounded|shot|stabbed|attack(ed)?|assassination attempt|survived|kidnap\w*|bankrupt\w*|scandal|impeach\w*|overdose|rehab|stroke|heart attack|cancer|diagnosed|illness|ill\b|hospitali[sz]ed|collapsed|breakdown|retire[ds]?|retirement|farewell|final (show|concert|match|game|race|performance|tour)|last (match|game|race|performance|concert)|surrendered|capitulat\w*|expelled|excommunicated|disbanded|broke up|quit|left (the )?band|cancelled|feud|trial|controvers\w*|was dropped|withdrew|outed|blacklist\w*|fire destroyed|fire at)\b', I)),
    ('T', re.compile(r'\b(moved to|moves to|emigrated|immigrated|relocated|arrived in|arrives in|settled in|enlisted|drafted|joined|signed (for|with)|transferred|converted|ordained|naturali[sz]ed|became a citizen|took (the )?name|changed (his|her) name|entered|enrolled|graduated|left for|went to|returned to|moved into)\b', I)),
    ('A', re.compile(r'\b(won|wins|win|awarded|award|prize|honou?r\w*|elected|re-?elected|inaugurated|sworn in|appointed|named|became|becomes|crowned|coronation|accession|succeeded|acceded|proclaimed|knighted|knighthood|ennobled|released|release|published|publishes|premiered|premiere|debut\w*|opened|launched|launches|unveiled|founded|founds|co-?founded|formed|established|created|invented|discovered|patent\w*|first|record|broke|set|scored|recorded|performed|starred|cast as|hosted|host|led|leads|headlined|toured|tour|exhibit\w*|show(ed)?|completed|built|signed|acquired|bought|purchased|ipo|listed|became|inducted|received|accepted|nominat\w*|landed|reached|orbited|flew|walked|climbed|crossed|conquered|victory|triumph|champion\w*|gold|medal|title|grand slam|cup|olympic\w*|super bowl|tour de france|grand prix|world series|nobel|oscar|grammy|emmy|tony|bafta|cesar|c[ée]sar|palme|golden globe|pulitzer|knight|delivered|gave|speech|address|announced|presented|read|sang|painted|sculpted|composed|wrote|written|filmed|directed|produced|issued|sold|topped|number one|no\.? ?1|hit|became|took office|took power|seized power|came to power|assumed|took over|promoted|graduated|passed|signed into law|enacted|ratified|treaty|cast|vote|reunion|comeback|returned)\b', I)),
]


# Events the keyword rules leave unclassified ("?"), labelled by hand from the
# text and the plain public meaning of the event for that person — never from
# a chart. 'O' = no clear category; excluded like 'X'.
OVERRIDE = {
 'Acquitted by the Senate': 'U', 'Pardoned Richard Nixon': 'O', 'Ordered atomic bombing of Hiroshima': 'O',
 'Asked Congress to declare war on Japan': 'O', 'Supreme Court ended Florida recount in Bush v Gore': 'U',
 'Secret trip to China': 'A', 'Stepped back from daily role at Microsoft': 'U', 'Took control of Berkshire Hathaway': 'A',
 'Pledged most of his fortune to charity': 'O', 'Left office as Prime Minister': 'U', 'Christened at St James\'s Palace': 'O',
 'Started school': 'O', 'Christened at Sandringham': 'O', 'Started nursery': 'O', 'BBC Newsnight interview broadcast': 'U',
 'Military titles and patronages removed': 'U', 'Broadcast to the nation on outbreak of war': 'U',
 'Paris terror attacks during his presidency': 'U', 'German reunification': 'A', 'Left office as Chancellor': 'U',
 'Beer Hall Putsch in Munich': 'U', 'Invaded Poland starting World War II': 'O', 'Declared war on Britain and France': 'O',
 'Canonised as a saint': 'A', 'Tax fraud conviction upheld': 'U', 'Formal investiture': 'A', 'Golden Jubilee on the throne': 'O',
 'Declared national Emergency': 'U', 'Purna Swaraj declaration of independence': 'A', 'Declined post of Prime Minister': 'O',
 'Guru Sri Ramakrishna died': 'U', "Spoke at the Parliament of the World's Religions in Chicago": 'A', 'Enthronement ceremony': 'A',
 "Broadcast Japan's surrender": 'U', 'Renounced divine status': 'U', 'Met John Lennon in London': 'O', 'John Lennon murdered': 'U',
 'Singapore independence': 'A', 'Stepped down as Prime Minister': 'U', 'Pale Blue Dot photograph taken': 'A', 'Trinity atomic test': 'A',
 'Began codebreaking at Bletchley Park': 'T', 'Arrived at Lambarene to found hospital': 'T', 'Field trials of polio vaccine began': 'A',
 'Vaccine declared safe and effective': 'A', 'Gemini 12 spacewalk mission': 'A', 'Selected as NASA astronaut': 'A', 'Second shuttle flight': 'A',
 'Challenger disaster which she later investigated': 'U', 'Mother remarried Jacques Aupick': 'U', 'Leg amputated in Marseille': 'U',
 'A Tale of Two Cities serialisation began': 'A', 'Disappeared for eleven days': 'U', 'Left England forever': 'T', 'Percy Shelley drowned': 'U',
 "Staged coup d'etat as President": 'A', 'Howl ruled not obscene': 'A', 'The Three Musketeers serialisation began': 'A',
 'The Count of Monte Cristo serialisation began': 'A', 'Reburied in the Pantheon': 'O', 'Met Robert and Clara Schumann': 'O',
 "Torchbearer at Beethoven's funeral": 'O', 'Music for Hope Easter concert in Milan Cathedral': 'A', 'Concert for Bangladesh': 'A',
 'Altamont Free Concert': 'U', 'Met Mick Jagger at Dartford station': 'O', 'Redlands drugs raid': 'U', 'Left Ike Turner': 'U',
 'Legendary Carnegie Hall concert': 'A', 'Liza with a Z broadcast': 'A', 'IRS seized his assets': 'U', 'Two sons died in house fire': 'U',
 'Breakthrough at Monterey Pop Festival': 'A', 'Miami concert incident': 'U', 'Concert in Central Park': 'A', 'Suffered brain aneurysm': 'U',
 'Surprise return at Newport Folk Festival': 'A', 'Conservatorship ended': 'T', 'One Love Manchester benefit concert': 'A',
 'Final Wham concert at Wembley': 'U', 'Consecrated in Nidaros Cathedral': 'A', 'Tore photo of the Pope on Saturday Night Live': 'U',
 'Wore the swan dress at the Oscars': 'O', 'Acquitted of murder': 'U', 'Publicly came out as gay': 'T', 'Represented Spain at Eurovision': 'A',
 'Burned a banknote on live TV': 'O', 'Concert at the Eiffel Tower': 'A', 'National tribute and procession in Paris': 'O', 'Met John Lennon': 'O',
 'Hollywood Sign restored with his sponsorship of a letter O': 'O', 'Breakthrough performance at Woodstock': 'A',
 'Involved in Oscars Best Picture envelope mixup': 'U', 'Granted Russian citizenship': 'T', 'BBC Face to Face interview broadcast': 'O',
 'Engaged to Katy Perry': 'O', 'Represented the UK at Eurovision': 'A', 'Coming out episode of Ellen aired': 'T', 'Had quintuple heart bypass': 'U',
 'Robbed at gunpoint in Paris': 'U', 'Diane Sawyer interview broadcast': 'T', 'Vanity Fair cover revealed as Caitlyn': 'T',
 'The War of the Worlds radio broadcast': 'A', 'Hand of God and Goal of the Century against England': 'A', 'Handball incident against Ireland': 'U',
 'Played final professional match': 'U', 'Deported from Australia': 'U', 'Final professional match at US Open': 'U', 'Threw The Catch to Dwight Clark': 'A',
 'Beat Roberto Duran in No Mas fight': 'A', 'Beat Thomas Hearns': 'A', 'Beat Marvelous Marvin Hagler': 'A', 'Traded to Los Angeles Kings': 'T',
 'Punched by spectator on Puy de Dome': 'U', 'Finished second to teammate Greg LeMond': 'O', 'Los Angeles crusade began': 'A',
 'Madison Square Garden crusade began': 'A', 'Family went into hiding in the Secret Annex': 'U', 'Teacher Anne Sullivan arrived': 'T',
 'Learned the word water at the pump': 'A', 'Featured on cover of Time': 'A', 'Elizabeth Hurley wore his safety pin dress': 'A',
 'Pleaded guilty to assault in New York': 'U', 'Chapel of the Rosary in Vence consecrated': 'A', 'Little Dancer Aged Fourteen shown': 'A',
 'Commissioned to create The Gates of Hell': 'A', 'Moved the court to Versailles': 'T', 'Mary Queen of Scots executed': 'O',
 'Seized the throne in a coup': 'A', 'Rebel Pugachev executed': 'O', 'Anne Boleyn executed': 'O', 'Captured Fort Donelson': 'A',
 'Commanded Allied ground forces on D Day': 'A', 'Forced to take his own life': 'X', 'Apple II introduced': 'A', 'Left full time work at Apple': 'U',
 'Turner Broadcasting merged with Time Warner': 'T', 'Pledged one billion dollars to the UN': 'O', 'Martha Stewart Living Omnimedia went public': 'A',
 'Testified to the Pujo Committee': 'U', 'Played final Test match': 'U', "Revealed Parkinson's disease diagnosis": 'U', "Revealed Parkinson's diagnosis": 'U',
 'Final regular appearance on The View': 'U', 'Breakthrough at Newport Folk Festival': 'A', 'Fell into diabetic coma': 'U',
 'Chapel at Ronchamp consecrated': 'A', 'Represented Monaco at Eurovision': 'A', 'Concert at the Royal Albert Hall': 'A',
 'Place de la Concorde concert': 'A', 'Rendez vous Houston concert': 'A', 'Paris La Defense concert with two million spectators': 'A',
 "Moscow concert for city's 850th anniversary": 'A', 'Deported to Auschwitz': 'U', 'Interred in the Pantheon': 'O',
 'Golden Boot winner in Euro 2016 final': 'A', 'Began friendship with Friedrich Schiller': 'O', 'Began Las Vegas residency': 'A',
 'Shared Best Actress at Cannes for Volver': 'A', 'Statue of Liberty with his iron frame dedicated': 'A',
 'Attempted suicide and was committed': 'U', 'Knelt at Warsaw Ghetto memorial': 'A',
 'Madame Bovary serialisation began': 'A', 'Announced she would not marry Peter Townsend': 'U',
 'Announced The Decision to join Miami': 'T', 'Martin Luther King killed on her 40th birthday': 'U',
 'Death penalty abolished in France': 'A',
 'Universal Declaration of Human Rights adopted under her leadership': 'A', 'Became President on death of Roosevelt': 'AU', 'Became Prince on death of Rainier III': 'AU',
}

def classify(text):
    if text in OVERRIDE:
        return OVERRIDE[text]
    for cat, rx in RULES:
        if rx.search(text):
            return cat
    return '?'

# ── profession groups ────────────────────────────────────────────────────────
PROF = [
    ('religion', r'\b(pope|monk|evangelist|priest|theolog\w*|guru|saint|cardinal|preach\w*|minister of religion|vedanta)\b'),
    ('royalty',  r'\b(king|queen|prince|princess|emperor|empress|duke|duchess|throne|sovereign|sun king|royal|tudor|tsar|czar)\b'),
    ('military', r'\b(field marshal|general\b|admiral|war hero|commander)\b'),
    ('politics', r'\b(president|prime minister|chancellor|senator|governor|secretary of state|attorney general|vice president|first lady|dictator|stateswoman|statesman|politician|nationalist|civil rights|minister|presidential|leader of la france|national front|congress|ambassador|diplomat|central bank|reunification)\b'),
    ('sports',   r'\b(football|footballer|tennis|cricket\w*|chess|olympic|swimmer|gymnast|basketball|nba|quarterback|super bowl|boxing|heavyweight|formula one|hockey|golf\w*|cyclist|tour de france|motogp|sprinter|decathlon|wrestler|striker|grand slam|martial artist|athlete|equestrian)\b'),
    ('science',  r'\b(physicist|chemist|mathematician|astronomer|scientist|astronaut|inventor|vaccine|penicillin|doctor|engineer|aviator|explorer|computer science|radio|telephone|educator|montessori)\b'),
    ('business', r'\b(founder of|cofounder|co-founder|investor|chairman|ceo|entrepreneur|mogul|tycoon|financier|banker|businesswoman|businessman|media manager|cosmetics|virgin group|cnn|microsoft|apple|playboy|berkshire|lvmh)\b'),
    ('art',      r'\b(painter|sculptor|surrealis\w*|fauvism|impressionist|fashion|designer|supermodel|model|architect\w*|artist(?! and)|photograph\w*)\b'),
    ('literature', r'\b(author|novelist|poet|writer|playwright|journalist|philosopher|diarist|memoirist|short story|sherlock|science fiction|horror fiction|les miserables|faust)\b'),
    ('music',    r'\b(singer|songwriter|composer|guitarist|drummer|bassist|rapper|conductor|tenor|jazz|pianist|saxophonist|trumpeter|band|beatles|rolling stones|pop|rock|soul|disco|country|punk|music|grammy|piano man|eurythmics|supremes|fugees|grateful dead|beach boys|u2|velvet underground|doors|led zeppelin|genesis|no doubt|wham|king of pop|queen of soul|lady day|satchmo|cloclo)\b'),
    ('film',     r'\b(actor|actress|film|cinema|director|filmmaker|comedian|comic|talk show|tonight show|late night|tv|television|hollywood|bollywood|oscar|star wars|james bond|reality star|crocodile hunter|dancer|egot|the king of cool|rebel film)\b'),
]
PROF = [(g, re.compile(p, I)) for g, p in PROF]

def profession(text):
    for g, rx in PROF:
        if rx.search(text):
            return g
    return 'other'

old = {p['name']: p for p in json.loads((HERE / 'people.json').read_text(encoding='utf-8'))}
rows = list(csv.DictReader(open(HERE / 'famous_people_550.csv', encoding='utf-8')))
out, agree, total = [], 0, 0
for r in rows:
    n = int(r['No'])
    bd = d(r['Birth Date (DD/MM/YYYY)'])
    hh, mm = map(int, r['Birth Time (24h local)'].split(':'))
    tz = r['Time Zone']
    off = offset_min(tz)
    y, mo, da = map(int, bd.split('-'))
    # local -> UTC as a plain minute count so LMT offsets (0h40m) stay exact
    local = datetime(y, mo, da, hh, mm)
    utc = local - timedelta(minutes=off)
    death_raw = r['Death Date'].strip()
    death = d(death_raw) or (d(death_raw.split()[-1]) if death_raw.startswith('Disappeared') else None)
    kind = 'living' if death_raw == 'Living' else 'missing' if death_raw.startswith('Disappeared') else 'died' if death else 'died-undated'
    hand = old.get(r['Name'])
    events = []
    for i in range(1, 5):
        ed = d(r[f'Event {i} Date'])
        text = r[f'Event {i}']
        auto = classify(text)
        if hand:
            cats = hand['events'][i - 1]['cats']
            total += 1
            agree += auto in cats or (auto == 'X' and not cats)
        else:
            cats = [] if auto in ('X', 'O') else list(auto)   # 'AU' = accession that followed a death
        events.append({'date': ed, 'text': text, 'cats': list(cats), 'auto': auto,
                       'posthumous': bool(death and ed > death)})
    out.append({
        'id': n, 'name': r['Name'], 'famousFor': r['Famous For'], 'profession': profession(r['Famous For']),
        'localBirth': local.strftime('%Y-%m-%dT%H:%M:00'),
        'utcBirth': utc.strftime('%Y-%m-%dT%H:%M:00'),
        'offsetMin': off, 'tzLabel': tz,
        'place': r['Birth Place'], 'country': r['Country'],
        'lat': round(coord(r['Latitude']), 4), 'lon': round(coord(r['Longitude']), 4),
        'rodden': r['Rodden Rating'], 'timeSource': r['Birth Time Source'],
        'julian': 'Julian' in tz,
        'events': events, 'death': death, 'deathKind': kind,
        'inEarlierStudy': bool(hand),
    })
(HERE / 'people550.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))

cnt, unk, prof = {}, [], {}
for p in out:
    prof[p['profession']] = prof.get(p['profession'], 0) + 1
    for e in p['events']:
        for c in e['cats'] or ['-']:
            cnt[c] = cnt.get(c, 0) + 1
        if e['auto'] == '?':
            unk.append((p['id'], e['text']))
print(len(out), 'people; label counts', dict(sorted(cnt.items())))
print('deaths', sum(1 for p in out if p['deathKind'] == 'died'), '; julian', sum(p['julian'] for p in out))
print('professions', dict(sorted(prof.items(), key=lambda x: -x[1])))
print(f'classifier vs hand labels on the earlier 50: {agree}/{total} agree')
print('unclassified', len(unk))
for u in unk:
    print('  ?', *u)
