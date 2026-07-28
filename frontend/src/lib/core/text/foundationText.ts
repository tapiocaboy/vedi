/**
 * Bilingual sentence frames for the natal-foundation layer.
 *
 * These describe the *standing* condition of a life area in the birth chart —
 * the bhava, its lord and its karaka — as opposed to what a running dasha is
 * doing to it. Same convention as predictionFrames: functions rather than
 * templates, so Sinhala can reorder the parts.
 */

import type { Lang } from '../i18n';

type F1 = Record<Lang, (a: string) => string>;
type F2 = Record<Lang, (a: string, b: string) => string>;
type F3 = Record<Lang, (a: string, b: string, c: string) => string>;

// ─── Bhava occupants ───────────────────────────────────────────────────────

/** "Mars sits debilitated in your 10th house (career)." */
export const F_OCCUPANT_WEAK: F3 = {
  en: (planet, house, theme) =>
    `${planet} sits weakened in your ${house} (${theme}) — the effort is there but results arrive late, after a second attempt.`,
  si: (planet, house, theme) =>
    `${planet} ඔබේ ${house} (${theme}) දුර්වල ලෙස සිටී — වෑයම තිබුණත් ඵල ප්‍රමාද වී, දෙවන වර උත්සාහයෙන් පසුව ලැබේ.`,
};

export const F_OCCUPANT_STRONG: F3 = {
  en: (planet, house, theme) =>
    `${planet} is well placed in your ${house} (${theme}) — a genuine natal asset in this area.`,
  si: (planet, house, theme) =>
    `${planet} ඔබේ ${house} (${theme}) හොඳින් පිහිටා ඇත — මෙම ක්ෂේත්‍රයේ සැබෑ ජන්ම ශක්තියකි.`,
};

/** Malefic pressing a house that dislikes malefics. */
export const F_OCCUPANT_MALEFIC: F3 = {
  en: (planet, house, theme) =>
    `${planet}, a natural malefic, occupies your ${house} (${theme}) — this area is pressured and asks for patience.`,
  si: (planet, house, theme) =>
    `ස්වභාවික පාප ග්‍රහයෙකු වන ${planet} ඔබේ ${house} (${theme}) සිටී — මෙම ක්ෂේත්‍රය පීඩනයට ලක් වන අතර ඉවසීම අවශ්‍යය.`,
};

/** Malefic in an upachaya house — classically constructive. */
export const F_OCCUPANT_UPACHAYA: F3 = {
  en: (planet, house, theme) =>
    `${planet} in your ${house} (${theme}) is a growth placement — it improves with time and effort rather than arriving ready-made.`,
  si: (planet, house, theme) =>
    `${planet} ඔබේ ${house} (${theme}) පිහිටීම උපචය පිහිටීමකි — එය සූදානම්ව නොලැබී, කාලයත් වෑයමත් සමඟ ක්‍රමයෙන් දියුණු වේ.`,
};

// ─── Bhavesha (house lord) ─────────────────────────────────────────────────

export const F_LORD_STRONG: F3 = {
  en: (lord, house, where) =>
    `${lord}, the lord of your ${house}, is strong (placed in your ${where}) — the foundation of this area holds.`,
  si: (lord, house, where) =>
    `ඔබේ ${house} අධිපති ${lord} ප්‍රබලය (${where} පිහිටා ඇත) — මෙම ක්ෂේත්‍රයේ පදනම ස්ථාවරය.`,
};

export const F_LORD_WEAK: F3 = {
  en: (lord, house, where) =>
    `${lord}, the lord of your ${house}, is under strain (placed in your ${where}) — this area needs conscious work rather than luck.`,
  si: (lord, house, where) =>
    `ඔබේ ${house} අධිපති ${lord} පීඩනයට ලක්ව ඇත (${where} පිහිටා ඇත) — මෙම ක්ෂේත්‍රයට වාසනාවට වඩා දැනුවත් වෑයමක් අවශ්‍යය.`,
};

/**
 * Bhavesha well *placed* but weak by dignity. Saying "under strain (placed in
 * your 11th)" of a 2nd lord sitting in the 11th blames the placement for a
 * problem that belongs to the dignity — and the 11th is the best house a 2nd
 * lord can occupy. The two statements have to be kept apart.
 */
export const F_LORD_WEAK_DIGNITY: F3 = {
  en: (lord, house, where) =>
    `${lord}, the lord of your ${house}, is well placed in your ${where} but weak in itself — the area delivers, yet what it delivers is harder to hold on to than to obtain.`,
  si: (lord, house, where) =>
    `ඔබේ ${house} අධිපති ${lord} ${where} හොඳින් පිහිටා ඇතත් තමා දුර්වලය — මෙම ක්ෂේත්‍රය ඵල දෙයි, එහෙත් ලැබෙන දේ ලබා ගැනීමට වඩා රඳවා ගැනීම අපහසුය.`,
};

/** Bhavesha deployed into a house that classically serves this same area. */
export const F_LORD_WELL_DEPLOYED: F3 = {
  en: (lord, house, where) =>
    `${lord} rules your ${house} and sits in your ${where} — a classical placement for this area: the lord is working in territory that serves it.`,
  si: (lord, house, where) =>
    `${lord} ඔබේ ${house} අධිපති වන අතර ${where} සිටී — මෙම ක්ෂේත්‍රයට සම්භාව්‍ය පිහිටීමකි: අධිපතියා එයට උපකාරී භූමියේ ක්‍රියා කරයි.`,
};

/** A recognised classical combination (yoga) bearing on this area. */
export const F_YOGA_SUPPORT: F2 = {
  en: (name, planets) =>
    `${name} is formed in your chart (${planets}) — a recognised classical combination for this area, and it counts for more than the individual placements that make it up.`,
  si: (name, planets) =>
    `ඔබේ කේන්දරයේ ${name} සැදී ඇත (${planets}) — මෙම ක්ෂේත්‍රය සඳහා පිළිගත් සම්භාව්‍ය සංයෝගයකි, එය එය සාදන තනි පිහිටීම්වලට වඩා වැදගත් වේ.`,
};

/**
 * A yoga that pays out through adversity — Neecha Bhanga, Viparita Rajayoga.
 * The promise is real; the route to it is not comfortable, and saying only
 * "combination present" turns a hard chart into a reassuring one.
 */
export const F_YOGA_DEFERRED: F2 = {
  en: (name, planets) =>
    `${name} is formed in your chart (${planets}) — the damage here is cancelled rather than absent. Classically this converts into unusual strength late rather than early, and it tends to arrive through crisis rather than through initiative.`,
  si: (name, planets) =>
    `ඔබේ කේන්දරයේ ${name} සැදී ඇත (${planets}) — මෙහි හානිය නැති වී නොව භංග වී ඇත. සම්භාව්‍ය ලෙස මෙය මුල් කාලයේ නොව පසු කාලයේ අසාමාන්‍ය ශක්තියක් බවට හැරෙන අතර, එය ලැබෙන්නේ මුලපිරීමෙන් නොව අර්බුදයක් හරහාය.`,
};

/** Several planets crowded into one growth house. */
export const F_STELLIUM: F3 = {
  en: (count, house, theme) =>
    `${count} planets are gathered in your ${house} (${theme}) — this much weight in one growth house concentrates the chart's output here, through networks and collective structures rather than solo effort.`,
  si: (count, house, theme) =>
    `ග්‍රහයන් ${count} දෙනෙක් ඔබේ ${house} (${theme}) එක්රැස් වී ඇත — එක් උපචය භාවයක මෙපමණ බරක් කේන්දරයේ ඵලය මෙහි කේන්ද්‍රගත කරයි; තනි වෑයමට වඩා ජාල හා සාමූහික ව්‍යුහ හරහා.`,
};

/** Combustion of a wealth-significator: acquisition survives, retention does not. */
export const F_COMBUST_RETENTION: F1 = {
  en: p => `${p} is combust — burnt by proximity to the Sun. For this area that reads as retention and enjoyment rather than acquisition: what arrives does not sit still.`,
  si: p => `${p} අස්තංගතයි — සූර්යයාට ඉතා ළං වීමෙන් දැවී ඇත. මෙම ක්ෂේත්‍රයට එය අදාළ වන්නේ ලබා ගැනීමට නොව රඳවා ගැනීමට හා භුක්ති විඳීමටයි: එන දේ එහි නොනවතී.`,
};

/** The Moon at a sign junction — the mind's own foundation is knotted. */
export const F_MOON_GANDANTA: F2 = {
  en: (nakshatra, house) =>
    `Your Moon is gandanta — at the water–fire sign junction, in ${nakshatra}, in your ${house}. Classically a knot rather than a wound: emotional foundations, early home life and the bond with the mother are what this chart is here to untie, and they settle later than they do for most.`,
  si: (nakshatra, house) =>
    `ඔබේ චන්ද්‍රයා ගණ්ඩාන්තයේ සිටී — ජල–අග්නි රාශි සන්ධියේ, ${nakshatra} නැකතේ, ඔබේ ${house}. සම්භාව්‍ය ලෙස මෙය තුවාලයක් නොව ගැටයකි: චිත්ත පදනම, මුල් නිවෙස හා මව සමඟ බැඳීම මෙම කේන්දරය ලිහා ගැනීමට ඇති දෙයයි, ඒවා බොහෝ දෙනාට වඩා ප්‍රමාද වී ස්ථාවර වේ.`,
};

/** Bhavesha in 6/8/12 from the lagna — the classical weakener. */
export const F_LORD_DUSTHANA: F2 = {
  en: (lord, house) =>
    `${lord} rules your ${house} but sits in a difficult (dusthana) house — the area's results are delayed, hidden, or reached indirectly.`,
  si: (lord, house) =>
    `${lord} ඔබේ ${house} අධිපති වුවත් දුෂ්ථාන භාවයක සිටී — මෙම ක්ෂේත්‍රයේ ඵල ප්‍රමාද වී, සැඟවී හෝ වක්‍ර මාර්ගයකින් ලැබේ.`,
};

// ─── Karaka (natural significator) ─────────────────────────────────────────

export const F_KARAKA_STRONG: F2 = {
  en: (karaka, area) =>
    `${karaka}, the natural significator of ${area}, is well placed — the underlying promise here is sound.`,
  si: (karaka, area) =>
    `${area} සඳහා ස්වභාවික කාරක ${karaka} හොඳින් පිහිටා ඇත — මෙහි යටිතල පොරොන්දුව ශක්තිමත්ය.`,
};

export const F_KARAKA_WEAK: F2 = {
  en: (karaka, area) =>
    `${karaka}, the natural significator of ${area}, is weak in the birth chart — this is the area's standing soft spot, not a passing phase.`,
  si: (karaka, area) =>
    `${area} සඳහා ස්වභාවික කාරක ${karaka} ජන්ම කේන්දරයේ දුර්වලය — මෙය තාවකාලික තත්ත්වයක් නොව, මෙම ක්ෂේත්‍රයේ ස්ථිර දුර්වල ලක්ෂ්‍යයයි.`,
};

/** Karako bhava nashaya — karaka occupying its own bhava. */
export const F_KARAKA_IN_OWN_BHAVA: F2 = {
  en: (karaka, house) =>
    `${karaka} occupies the very house it signifies (your ${house}) — classically this over-charges the area and complicates it (karako bhava nashaya).`,
  si: (karaka, house) =>
    `${karaka} තමා කාරකත්වය දරන භාවයේම (ඔබේ ${house}) සිටී — සම්ප්‍රදායිකව මෙය එම ක්ෂේත්‍රය අධික ලෙස උත්තේජනය කර සංකීර්ණ කරයි (කාරකෝ භාව නාශය).`,
};

// ─── Manas (the mind) ──────────────────────────────────────────────────────

export const F_MOON_MALEFIC_CONJ: F1 = {
  en: p => `Your Moon shares its sign with ${p} — feeling and agitation are wired together, and frustration tends to turn inward as self-criticism.`,
  si: p => `ඔබේ චන්ද්‍රයා ${p} සමඟ එකම රාශියක සිටී — හැඟීම් හා නොසන්සුන්කම එකට බැඳී ඇති අතර, කලකිරීම තමාටම දොස් පැවරීමක් බවට හැරේ.`,
};

export const F_MOON_SATURN_ASPECT: Record<Lang, () => string> = {
  en: () => `Saturn aspects your Moon — a cold, heavy, isolating weight on the inner world; you can feel unnurtured even when nothing is objectively wrong.`,
  si: () => `ශනි ඔබේ චන්ද්‍රයා දෙස බලයි — අභ්‍යන්තර ලෝකයට සීතල, බර, හුදෙකලා බවක් ගෙන දෙයි; බාහිරව කිසිවක් වැරදී නැති විටෙක පවා රැකවරණයක් නැති බවක් දැනිය හැක.`,
};

export const F_MOON_MARS_ASPECT: Record<Lang, () => string> = {
  en: () => `Mars aspects your Moon — restlessness and irritability rise quickly, and the mind struggles to settle.`,
  si: () => `කුජ ඔබේ චන්ද්‍රයා දෙස බලයි — නොසන්සුන්කම හා කෝපය ඉක්මනින් ඉහළ යන අතර සිත සන්සුන් වීමට අපහසුය.`,
};

export const F_MOON_NODE: F1 = {
  en: p => `${p} sits on your Moon's axis — the mind is prone to fog, obsessive loops, and anxieties that outrun the facts.`,
  si: p => `${p} ඔබේ චන්ද්‍ර අක්ෂයේ සිටී — සිත මිදුණු බවට, නැවත නැවත එකම සිතුවිල්ලට හා යථාර්ථය ඉක්මවා යන කනස්සල්ලට නැඹුරු වේ.`,
};

export const F_MOON_UNSUPPORTED: Record<Lang, () => string> = {
  en: () => `No benefic supports your Moon by conjunction or aspect — the mind carries its weather alone and benefits greatly from deliberate outside support.`,
  si: () => `කිසිදු ශුභ ග්‍රහයෙකු එක්වීමෙන් හෝ දෘෂ්ටියෙන් ඔබේ චන්ද්‍රයාට සහාය නොදෙයි — සිත තම බර තනිවම දරන අතර, හිතාමතා ලබාගන්නා බාහිර සහායෙන් විශාල ප්‍රයෝජනයක් ලැබේ.`,
};

export const F_MOON_WANING: Record<Lang, () => string> = {
  en: () => `Your Moon is waning (weak paksha bala) — emotional reserves refill slowly, so rest and routine matter more for you than for most.`,
  si: () => `ඔබේ චන්ද්‍රයා ක්ෂීණ වෙමින් පවතී (පක්ෂ බලය අඩුය) — චිත්ත ශක්තිය නැවත පිරෙන්නේ සෙමිනි, එබැවින් විවේකය හා නිත්‍ය චර්යාව ඔබට වඩාත් වැදගත් වේ.`,
};

export const F_MOON_STRONG: Record<Lang, () => string> = {
  en: () => `Your Moon is well placed — the emotional core is fundamentally sound even when it is strained, and it recovers.`,
  si: () => `ඔබේ චන්ද්‍රයා හොඳින් පිහිටා ඇත — පීඩනයට ලක් වුවද චිත්ත මූලය මූලික වශයෙන් ශක්තිමත් වන අතර එය යළි යථා තත්ත්වයට පත් වේ.`,
};

// ─── Foundation → prose ────────────────────────────────────────────────────

/** Prefix marking a line as standing chart condition rather than dasha weather. */
export const F_FOUNDATION_PREFIX: F1 = {
  en: note => `Birth chart: ${note}`,
  si: note => `ජන්ම කේන්දරය: ${note}`,
};

/**
 * Guard placed in front of a dasha lord's generic description when this chart's
 * score for the area does not support it. The generic copy describes what the
 * lord is capable of; without this line it reads as a promise of what is
 * currently happening.
 */
export const F_POTENTIAL_ONLY: Record<Lang, () => string> = {
  en: () => `What follows is what this period is capable of, not what it is currently delivering — on your chart this area is running below that ceiling.`,
  si: () => `පහත සඳහන් වන්නේ මෙම දශාවට කළ හැකි දෙයයි, දැනට සිදු වන දෙය නොවේ — ඔබේ කේන්දරයට අනුව මෙම ක්ෂේත්‍රය එම මට්ටමට වඩා පහළින් ක්‍රියාත්මක වේ.`,
};

/** Headline when the natal foundation contradicts the running dasha. */
export const F_FOUNDATION_TENSION: F2 = {
  en: (area, dasha) =>
    `Note the tension: your ${dasha} period supports ${area}, but the birth chart's own foundation there is weak — expect the period to open doors that still need pushing.`,
  si: (area, dasha) =>
    `මෙම විරෝධය සලකන්න: ඔබේ ${dasha} දශාව ${area} සඳහා හිතකර වුවත්, ජන්ම කේන්දරයේ එම පදනම දුර්වලය — දශාව දොර විවර කළත් එය තල්ලු කිරීමට තවමත් සිදු වේ.`,
};

// ─── Separative (delay) tone ───────────────────────────────────────────────

/**
 * Saturn / Rahu / Ketu running a level of the chain. Even a dignified Saturn
 * delays; dignity governs whether the result is *durable*, not whether it is
 * *quick* or *comfortable*.
 */
export const F_SEPARATIVE_TONE: F2 = {
  en: (planet, level) =>
    `${planet} holds the ${level}. Even well placed, ${planet} works by subtraction first: doors that were open feel jammed, timelines stretch, and what does arrive arrives late but built to last.`,
  si: (planet, level) =>
    `${planet} ${level} දරයි. හොඳින් පිහිටා තිබුණත්, ${planet} මුලින්ම අඩු කිරීමෙන් ක්‍රියා කරයි: විවෘතව තිබූ දොරවල් හිර වූ බවක් දැනේ, කාල සීමා දිගු වේ, ලැබෙන දේ ප්‍රමාද වී ලැබුණත් එය කල් පවතී.`,
};

/** Level names for the separative-tone frame. */
export const LEVEL_NAME: Record<'antardasha' | 'pratyantardasha' | 'sookshma', Record<Lang, string>> = {
  antardasha:      { en: 'sub-period',           si: 'අන්තර් දශාව' },
  pratyantardasha: { en: 'sub-sub-period',       si: 'ප්‍රත්‍යන්තර් දශාව' },
  sookshma:        { en: 'current micro-period', si: 'වත්මන් සූක්ෂ්ම දශාව' },
};

// ─── Area names, for karaka sentences ──────────────────────────────────────

export const AREA_NAME: Record<string, Record<Lang, string>> = {
  career:       { en: 'career',        si: 'වෘත්තිය' },
  wealth:       { en: 'wealth',        si: 'ධනය' },
  relationship: { en: 'partnership',   si: 'සම්බන්ධතා' },
  health:       { en: 'health',        si: 'සෞඛ්‍යය' },
};
