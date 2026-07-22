/** Health details and remedies per dasha lord, in English and Sinhala. */

import type { BiList } from '../i18n';

export interface AreaSpec { details: BiList; remedies: BiList }

export const HEALTH_SPEC: Record<string, AreaSpec> = {
  Sun: {
    details: {
      en: [
        'Vitality and energy levels may fluctuate with season',
        'Eye health requires periodic checkups',
        'Heart and cardiovascular system needs regular monitoring',
        'Maintain good posture to protect the spine',
        'Adequate morning sun exposure is beneficial',
      ],
      si: [
        'ඍතුව අනුව ජීවශක්තිය හා ශක්ති මට්ටම් උච්චාවචනය විය හැක',
        'ඇස්වල සෞඛ්‍යය සඳහා නිතිපතා පරීක්ෂාවක් අවශ්‍යය',
        'හෘදය හා හෘද වාහිනී පද්ධතිය නිරන්තරයෙන් පරීක්ෂා කර බැලිය යුතුය',
        'කොඳු ඇට පෙළ ආරක්ෂා කර ගැනීමට නිසි ඉරියව්වක් පවත්වා ගන්න',
        'උදෑසන හිරු එළිය ප්‍රමාණවත් ලෙස ලැබීම හිතකරය',
      ],
    },
    remedies: {
      en: [
        'Offer water to the rising Sun daily at dawn',
        'Wear ruby on Sunday in copper ring on right hand',
        'Chant Aditya Hridayam for sustained vitality',
        'Practice Surya Namaskar 12 rounds daily',
        'Increase wheat, jaggery, and saffron in diet',
      ],
      si: [
        'දිනපතා අලුයම උදාවන සූර්යයාට ජලය පූජා කරන්න',
        'ඉරිදා දිනක දකුණු අතේ තඹ මුදුවක මාණික්‍යය පැළඳ ගන්න',
        'ජීවශක්තිය රැක ගැනීමට ආදිත්‍ය හෘදයම් ජප කරන්න',
        'දිනපතා සූර්ය නමස්කාර වට 12ක් කරන්න',
        'ආහාරයට තිරිඟු, හකුරු හා කුංකුම වැඩිපුර එක් කර ගන්න',
      ],
    },
  },

  Moon: {
    details: {
      en: [
        'Mental and emotional health is the primary area to watch',
        'Sleep quality and routine directly affect all health metrics',
        'Adequate hydration and balanced fluid intake essential',
        'Women may experience stronger hormonal fluctuations',
        'Digestive system is linked to emotional state',
      ],
      si: [
        'මානසික හා හැඟීම්බර සෞඛ්‍යය ප්‍රධාන වශයෙන් අවධානය යොමු කළ යුතු ක්ෂේත්‍රයයි',
        'නින්දේ ගුණාත්මකභාවය හා නිත්‍ය රටාව සියලු සෞඛ්‍ය දර්ශකවලට කෙලින්ම බලපායි',
        'ප්‍රමාණවත් ජල පානය හා සමබර ද්‍රව ගැනීම අත්‍යවශ්‍යය',
        'කාන්තාවන්ට හෝමෝන උච්චාවචන වඩාත් තදින් දැනිය හැක',
        'ආහාර ජීර්ණ පද්ධතිය හැඟීම්බර තත්ත්වය සමඟ බැඳී පවතී',
      ],
    },
    remedies: {
      en: [
        'Wear natural pearl on Monday in silver ring on right little finger',
        'Drink water stored overnight in a silver vessel',
        'Practice nadi shodhana pranayama and yoga nidra',
        'Maintain consistent sleep-wake cycle; avoid daytime sleep',
        'Include milk, rice, white foods, and moonlit water in diet',
      ],
      si: [
        'සඳුදා දිනක දකුණු අතේ සුළැඟිල්ලේ රිදී මුදුවක ස්වාභාවික මුතු ඇටයක් පැළඳ ගන්න',
        'රිදී භාජනයක රාත්‍රිය පුරා තැන්පත් කළ ජලය පානය කරන්න',
        'නාඩි ශෝධන ප්‍රාණායාම හා යෝග නිද්‍රා පුරුදු කරන්න',
        'නිදාගැනීමේ හා අවදි වීමේ වේලාවන් ස්ථාවරව පවත්වා ගන්න; දහවල් නින්ද වළක්වන්න',
        'ආහාරයට කිරි, බත්, සුදු පැහැති ආහාර හා සඳ එළියේ තැබූ ජලය එක් කර ගන්න',
      ],
    },
  },

  Mars: {
    details: {
      en: [
        'Higher accident and injury risk — physical vigilance essential',
        'Blood pressure fluctuations and inflammation are likely',
        'Blood-related disorders need periodic monitoring',
        'Surgeries if medically necessary will proceed successfully',
        'High energy levels — must be channeled through regular exercise',
      ],
      si: [
        'අනතුරු හා තුවාල අවදානම වැඩිය — ශාරීරික ප්‍රවේශම අත්‍යවශ්‍යය',
        'රුධිර පීඩන උච්චාවචන හා දැවිලි තත්ත්ව ඇති විය හැක',
        'රුධිරය හා සම්බන්ධ ආබාධ නිතිපතා පරීක්ෂා කර බැලිය යුතුය',
        'වෛද්‍යමය වශයෙන් අවශ්‍ය නම් සැත්කම් සාර්ථකව සිදු වේ',
        'ශක්ති මට්ටම් ඉහළය — නිතිපතා ව්‍යායාම හරහා එය නිසි ලෙස මුදා හැරිය යුතුය',
      ],
    },
    remedies: {
      en: [
        'Wear red coral on Tuesday in gold ring on right ring finger',
        'Donate blood if eligible; volunteer at trauma centers',
        'Practice cooling pranayama (sheetali, sheetkari)',
        'Avoid confrontations and manage anger proactively',
        'Include red lentils, beetroot, pomegranate in diet',
      ],
      si: [
        'අඟහරුවාදා දිනක දකුණු අතේ මුදු ඇඟිල්ලේ රන් මුදුවක රතු පබළු පැළඳ ගන්න',
        'හැකි නම් රුධිර දන් දෙන්න; හදිසි ප්‍රතිකාර මධ්‍යස්ථානවල ස්වේච්ඡාවෙන් සේවය කරන්න',
        'සිසිල් කරන ප්‍රාණායාම (ශීතලී, ශීත්කාරී) පුරුදු කරන්න',
        'ගැටුම් වළක්වා කෝපය කල් තියා පාලනය කර ගන්න',
        'ආහාරයට රතු පරිප්පු, බීට්රූට් හා දෙළුම් එක් කර ගන්න',
      ],
    },
  },

  Mercury: {
    details: {
      en: [
        'Nervous system is the primary health focus',
        'Skin conditions may emerge or worsen with stress',
        'Speech, hearing, or communication issues are possible',
        'Respiratory health deserves attention, especially in cities',
        'Mental fatigue from constant thinking and multi-tasking',
      ],
      si: [
        'ස්නායු පද්ධතිය ප්‍රධාන සෞඛ්‍ය අවධානය යොමු විය යුතු තැනයි',
        'ආතතිය සමඟ සමේ රෝග මතු වීමට හෝ උග්‍ර වීමට හැක',
        'කථනය, ශ්‍රවණය හෝ සන්නිවේදනය හා සම්බන්ධ ගැටලු ඇති විය හැක',
        'ශ්වසන සෞඛ්‍යයට අවධානය යොමු කළ යුතුය, විශේෂයෙන් නගරවල',
        'නිරන්තර සිතීම හා එකවර බොහෝ දේ කිරීම නිසා මානසික වෙහෙසක් ඇති වේ',
      ],
    },
    remedies: {
      en: [
        'Wear emerald on Wednesday in gold ring on right little finger',
        'Practice oil pulling (gandusha) and tongue scraping daily',
        'Keep the mind engaged in learning to prevent stagnation',
        'Reduce excessive screen time and digital stimulation',
        'Include green vegetables, green moong dal, and mint in diet',
      ],
      si: [
        'බදාදා දිනක දකුණු අතේ සුළැඟිල්ලේ රන් මුදුවක මරකත පැළඳ ගන්න',
        'දිනපතා තෙල් ගණ්ඩූෂ හා දිව සුද්ධ කිරීම පුරුදු කරන්න',
        'මනස මොට නොවන පරිදි නිරන්තරයෙන් අලුත් දේ ඉගෙනීමේ යොදවන්න',
        'තිරය ඉදිරියේ ගත කරන කාලය හා ඩිජිටල් උත්තේජනය අඩු කරන්න',
        'ආහාරයට කොළ පැහැති එළවළු, මුං ඇට හා මින්ට් එක් කර ගන්න',
      ],
    },
  },

  Jupiter: {
    details: {
      en: [
        'Weight management becomes increasingly important',
        'Liver and digestive health requires mindful dietary choices',
        'Blood sugar levels and insulin sensitivity should be monitored',
        'Overall resilience is strong; recovery from illness is good',
        'Hip, thigh, and lower back area may develop issues',
      ],
      si: [
        'ශරීර බර පාලනය කිරීම වඩ වඩාත් වැදගත් වේ',
        'අක්මාව හා ජීර්ණ සෞඛ්‍යය සඳහා ආහාර තෝරා ගැනීමේදී සැලකිලිමත් විය යුතුය',
        'රුධිර සීනි මට්ටම හා ඉන්සියුලින් සංවේදිතාව පරීක්ෂා කර බැලිය යුතුය',
        'සමස්ත ප්‍රතිරෝධක ශක්තිය හොඳය; රෝගවලින් සුවවීම ද යහපත්ය',
        'උකුල්, කලවා හා පහළ කොන්ද ආශ්‍රිතව ගැටලු ඇති විය හැක',
      ],
    },
    remedies: {
      en: [
        'Wear yellow sapphire on Thursday in gold ring on right index finger',
        'Fast on Thursdays or practice intermittent fasting',
        'Express gratitude daily and respect teachers and elders',
        'Donate to educational or religious institutions weekly',
        'Include turmeric, yellow foods, and chickpeas in diet',
      ],
      si: [
        'බ්‍රහස්පතින්දා දිනක දකුණු අතේ දබරැඟිල්ලේ රන් මුදුවක පුෂ්පරාග පැළඳ ගන්න',
        'බ්‍රහස්පතින්දා දිනවල උපවාසයේ යෙදෙන්න හෝ කාල පරාස උපවාසය පුරුදු කරන්න',
        'දිනපතා කෘතඥතාව ප්‍රකාශ කර ගුරුවරුන්ට හා වැඩිහිටියන්ට ගරු කරන්න',
        'සතිපතා අධ්‍යාපන හෝ ආගමික ආයතනවලට දන් දෙන්න',
        'ආහාරයට කහ, කහ පැහැති ආහාර හා කඩල එක් කර ගන්න',
      ],
    },
  },

  Venus: {
    details: {
      en: [
        'Reproductive system health needs periodic attention',
        'Kidney and urinary tract infections need early treatment',
        'Skin generally remains healthy with proper self-care',
        'Overindulgence in sweets, fats, or alcohol affects health',
        'Eye and throat health should be monitored routinely',
      ],
      si: [
        'ප්‍රජනන පද්ධතියේ සෞඛ්‍යයට නිතිපතා අවධානය යොමු කළ යුතුය',
        'වකුගඩු හා මූත්‍ර මාර්ග ආසාදනවලට කල් තියා ප්‍රතිකාර ගත යුතුය',
        'නිසි ස්වයං සත්කාරයෙන් සම සාමාන්‍යයෙන් නීරෝගීව පවතී',
        'රසකැවිලි, මේද හෝ මත්පැන් අධික ලෙස ගැනීම සෞඛ්‍යයට බලපායි',
        'ඇස් හා උගුරේ සෞඛ්‍යය නිතිපතා පරීක්ෂා කර බැලිය යුතුය',
      ],
    },
    remedies: {
      en: [
        'Wear natural diamond or white sapphire on Friday in silver ring',
        'Maintain personal hygiene and cleanliness strictly',
        'Use rose water for eyes, skin toning, and cooling',
        'Reduce excessive sugar, fried foods, and alcohol',
        'Include white foods — dairy, coconut, white rice, fruits — in diet',
      ],
      si: [
        'සිකුරාදා දිනක රිදී මුදුවක ස්වාභාවික දියමන්තියක් හෝ සුදු නීලමණියක් පැළඳ ගන්න',
        'පෞද්ගලික සනීපාරක්ෂාව හා පිරිසිදුකම දැඩිව පවත්වා ගන්න',
        'ඇස්, සම නැවුම් කිරීම හා සිසිල් කිරීම සඳහා රෝස ජලය භාවිත කරන්න',
        'අධික සීනි, බැදපු ආහාර හා මත්පැන් අඩු කරන්න',
        'ආහාරයට සුදු පැහැති ආහාර — කිරි, පොල්, සුදු බත් හා පලතුරු — එක් කර ගන්න',
      ],
    },
  },

  Saturn: {
    details: {
      en: [
        'Chronic conditions may surface or worsen during this period',
        'Joint pain, arthritis, and bone density need attention',
        'Dental health requires regular professional care',
        'Mental health — depression, anxiety, and hopelessness possible',
        'Recovery from illness is slow — patience and consistency required',
      ],
      si: [
        'මෙම කාලය තුළ නිදන්ගත රෝග මතු වීමට හෝ උග්‍ර වීමට හැක',
        'සන්ධි වේදනාව, ආතරයිටිස් හා අස්ථි ඝනත්වය පිළිබඳ අවධානය අවශ්‍යය',
        'දත්වල සෞඛ්‍යය සඳහා නිතිපතා වෘත්තීය ප්‍රතිකාර අවශ්‍යය',
        'මානසික සෞඛ්‍යය — අවපීඩනය, කනස්සල්ල හා අපේක්ෂා භංගත්වය ඇති විය හැක',
        'රෝගවලින් සුවවීම මන්දගාමීය — ඉවසීම හා නොකඩවා ප්‍රතිකාර ගැනීම අවශ්‍යය',
      ],
    },
    remedies: {
      en: [
        'Wear blue sapphire on trial for 3 days before committing',
        'Serve the elderly, disabled, and underprivileged regularly',
        'Fast on Saturdays and donate sesame and black items',
        'Practice daily oil massage (abhyanga) with sesame oil',
        'Include black sesame, iron-rich and whole grain foods in diet',
      ],
      si: [
        'නීලමණියක් ස්ථිරව පැළඳීමට පෙර දින 3ක් පරීක්ෂාවක් ලෙස පැළඳ බලන්න',
        'වැඩිහිටියන්ට, ආබාධිතයන්ට හා අඩු පහසුකම් ලත් අයට නිතිපතා සේවය කරන්න',
        'සෙනසුරාදා දිනවල උපවාසයේ යෙදී තල හා කළු පැහැති දෑ දන් දෙන්න',
        'දිනපතා තල තෙලෙන් අභ්‍යංග (තෙල් ගෑම) කරන්න',
        'ආහාරයට කළු තල, යකඩ බහුල ආහාර හා සම්පූර්ණ ධාන්‍ය එක් කර ගන්න',
      ],
    },
  },

  Rahu: {
    details: {
      en: [
        'Mysterious or diagnostically difficult conditions are possible',
        'Mental health — anxiety, phobias, and obsessive thoughts',
        'Allergies and skin conditions may appear suddenly',
        'Intoxicants and addictive substances must be strictly avoided',
        'Get second medical opinions; avoid self-diagnosis',
      ],
      si: [
        'හඳුනාගැනීමට අපහසු අභිරහස් රෝග තත්ත්ව ඇති විය හැක',
        'මානසික සෞඛ්‍යය — කනස්සල්ල, භීතිකා හා ඇලී ගැලී සිතීම',
        'අසාත්මිකතා හා සමේ රෝග හදිසියේ මතු විය හැක',
        'මත්ද්‍රව්‍ය හා ඇබ්බැහි කරවන දෑ දැඩි ලෙස වළක්වා ගත යුතුය',
        'දෙවන වෛද්‍ය මතයක් ලබා ගන්න; තමන්ම රෝග විනිශ්චය කිරීමෙන් වළකින්න',
      ],
    },
    remedies: {
      en: [
        'Wear hessonite (gomed) after careful astrological consultation',
        'Chant Durga Saptashati or Rahu Beej mantra daily',
        'Avoid non-vegetarian food on Saturdays and during eclipses',
        'Keep fennel (saunf) and cloves near the bedside for sleep',
        'Practice grounding exercises and earthing techniques',
      ],
      si: [
        'ප්‍රවේශම් සහගත ජ්‍යොතිෂ උපදෙස් ලබා ගැනීමෙන් පසු ගෝමේද පැළඳ ගන්න',
        'දිනපතා දුර්ගා සප්තශතී හෝ රාහු බීජ මන්ත්‍රය ජප කරන්න',
        'සෙනසුරාදා දිනවල හා ග්‍රහණ කාලවලදී මස් මාංශ ගැනීමෙන් වළකින්න',
        'නින්ද සඳහා නිදන ඇඳ අසල මාදුරු හා කරාබුනැටි තබා ගන්න',
        'මනස බිම රඳවන ව්‍යායාම හා පොළොව සමඟ සම්බන්ධ වන ක්‍රම පුරුදු කරන්න',
      ],
    },
  },

  Ketu: {
    details: {
      en: [
        'Viral infections and mysterious ailments are more likely',
        'Accidents, especially to lower extremities and spine',
        'Surgeries if required will be necessary and often curative',
        'Spiritual practices, meditation, and yoga improve overall health',
        'Past-life karmic health patterns may surface for resolution',
      ],
      si: [
        'වෛරස ආසාදන හා හඳුනාගත නොහැකි ආබාධ ඇති වීමේ ඉඩ වැඩිය',
        'අනතුරු, විශේෂයෙන් පහළ අත් පා හා කොඳු ඇට පෙළට',
        'අවශ්‍ය නම් සිදු කරන සැත්කම් අත්‍යවශ්‍ය වන අතර බොහෝ විට සුව ගෙන දෙයි',
        'අධ්‍යාත්මික පිළිවෙත්, භාවනාව හා යෝග සමස්ත සෞඛ්‍යය වැඩිදියුණු කරයි',
        'පෙර භවවල කර්මය හා බැඳුණු සෞඛ්‍ය රටා විසඳීම සඳහා මතු විය හැක',
      ],
    },
    remedies: {
      en: [
        "Wear cat's eye (chrysoberyl) after thorough astrological consultation",
        'Worship Lord Ganesha with red flowers every Tuesday',
        'Donate blankets, sesame, and multicolored items to the needy',
        'Practice deep meditation, kriya yoga, or vipassana',
        'Include bananas, root vegetables, and turmeric in diet',
      ],
      si: [
        'සම්පූර්ණ ජ්‍යොතිෂ උපදෙස් ලබා ගැනීමෙන් පසු වෛඩූර්ය පැළඳ ගන්න',
        'සෑම අඟහරුවාදාවකම රතු මල් සමඟ ගණේෂ් දෙවියන් වඳින්න',
        'අඩු පහසුකම් ලත් අයට පොරවන, තල හා විවිධ වර්ණ දෑ දන් දෙන්න',
        'ගැඹුරු භාවනාව, ක්‍රියා යෝග හෝ විපස්සනා පුරුදු කරන්න',
        'ආහාරයට කෙසෙල්, අල වර්ග හා කහ එක් කර ගන්න',
      ],
    },
  },
};
