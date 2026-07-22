/** General life details and remedies per dasha lord, in English and Sinhala. */

import type { AreaSpec } from './areaHealth';

export const GENERAL_SPEC: Record<string, AreaSpec> = {
  Sun: {
    details: {
      en: [
        'Confidence, self-expression, and inner authority naturally increase',
        'Recognition, public appreciation, and fame are genuinely possible',
        'Spiritual growth comes powerfully through authentic self-discovery',
        'Government institutions, official matters, and authorities favor you',
        'East direction is highly auspicious for home, office, and travel',
        'Success in competitive endeavors, examinations, and leadership contests',
        'Leadership abilities emerge naturally and are recognized by others',
      ],
      si: [
        'ආත්ම විශ්වාසය, ස්වයං ප්‍රකාශනය හා අභ්‍යන්තර බලය ස්වභාවිකවම වැඩි වේ',
        'පිළිගැනීම, මහජන ප්‍රශංසාව හා කීර්තිය සැබැවින්ම ලැබිය හැක',
        'අවංක ලෙස තමන් හඳුනා ගැනීම හරහා අධ්‍යාත්මික වර්ධනය ප්‍රබලව ලැබේ',
        'රාජ්‍ය ආයතන, නිල කටයුතු හා බලධාරීන් ඔබට හිතවත් වේ',
        'නිවස, කාර්යාලය හා ගමන් සඳහා නැගෙනහිර දිශාව ඉතා සුබදායකය',
        'තරඟකාරී කටයුතු, විභාග හා නායකත්ව තරඟවලදී සාර්ථකත්වය ලැබේ',
        'නායකත්ව හැකියාවන් ස්වභාවිකවම මතු වී අන් අය විසින් පිළිගනු ලැබේ',
      ],
    },
    remedies: {
      en: [
        'Wake up before sunrise and engage in morning spiritual practice daily',
        'Practice authentic daily gratitude and appreciation for blessings',
        'Engage regularly in acts of genuine generosity and selfless service',
        'Cultivate and maintain a healthy, grounded, and positive self-image',
      ],
      si: [
        'දිනපතා හිරු උදාවට පෙර නැගිට උදෑසන අධ්‍යාත්මික පිළිවෙතක යෙදෙන්න',
        'ලැබී ඇති දෑ ගැන දිනපතා අවංක කෘතඥතාවක් හා අගය කිරීමක් පුරුදු කරන්න',
        'නොමසුරු දීමනා හා පරාර්ථකාමී සේවාවන්හි නිතිපතා යෙදෙන්න',
        'සෞඛ්‍ය සම්පන්න, යථාර්ථවාදී හා හිතකර ස්වයං ප්‍රතිරූපයක් ගොඩනඟා පවත්වා ගන්න',
      ],
    },
  },

  Moon: {
    details: {
      en: [
        'Emotional intelligence, empathy, and intuition develop strongly',
        'Travel, especially near water bodies and sacred natural sites, is favorable',
        'Public image, social reputation, and community standing improve naturally',
        'Dreams, inner visions, and intuitive insights become heightened and accurate',
        'Northwest direction is favorable for important activities and movement',
        'Feminine energy, creativity, and receptivity are at their peak',
        'Deep connection with nature, the ocean, and natural rhythms is beneficial',
      ],
      si: [
        'හැඟීම් තේරුම් ගැනීමේ හැකියාව, අනුකම්පාව හා අභ්‍යන්තර ඉව ප්‍රබලව වර්ධනය වේ',
        'ගමන් — විශේෂයෙන් ජලාශ අසලට හා පූජනීය ස්වාභාවික ස්ථානවලට — හිතකරය',
        'මහජන ප්‍රතිරූපය, සමාජ නාමය හා ප්‍රජාව තුළ ඇති තත්ත්වය ස්වභාවිකවම වැඩිදියුණු වේ',
        'සිහින, අභ්‍යන්තර දර්ශන හා ඉවෙන් ලැබෙන අවබෝධය තියුණු හා නිවැරදි වේ',
        'වැදගත් කටයුතු හා ගමන් සඳහා වයඹ දිශාව හිතකරය',
        'ස්ත්‍රී ශක්තිය, නිර්මාණශීලීත්වය හා පිළිගැනීමේ හැකියාව උච්චතම තත්ත්වයේ පවතී',
        'සොබාදහම, සාගරය හා ස්වාභාවික රිද්මය සමඟ ගැඹුරු සම්බන්ධයක් පැවැත්වීම හිතකරය',
      ],
    },
    remedies: {
      en: [
        'Practice mindfulness, present-moment awareness, and daily meditation',
        'Spend regular time near natural water bodies, rivers, lakes, or the ocean',
        'Honor, respect, and actively support the women in your life',
        'Follow and maintain a consistent, regular, and nourishing sleep schedule',
      ],
      si: [
        'සිහිය, වර්තමාන මොහොත පිළිබඳ අවබෝධය හා දිනපතා භාවනාව පුරුදු කරන්න',
        'ස්වාභාවික ජලාශ, ගංගා, වැව් හෝ මුහුද අසල නිතිපතා කාලය ගත කරන්න',
        'ඔබේ ජීවිතයේ සිටින කාන්තාවන්ට ගරු කර ඔවුන්ට සක්‍රියව සහය දෙන්න',
        'ස්ථාවර, නිත්‍ය හා පෝෂණීය නින්ද කාලසටහනක් අනුගමනය කරන්න',
      ],
    },
  },

  Mars: {
    details: {
      en: [
        'Physical energy, courage, boldness, and vital strength increase significantly',
        'Property matters, real estate, and asset-building deserve focused attention',
        'Competitions, athletic endeavors, and sports bring achievement and recognition',
        'Technical skills, engineering abilities, and mechanical aptitude sharpen',
        'South direction is auspicious for important activities and initiatives',
        'Legal or property-related disputes may require careful and skilled navigation',
        'Physical strength, stamina, and athletic performance are at their peak',
      ],
      si: [
        'ශාරීරික ශක්තිය, ධෛර්යය, නිර්භීතකම හා ජීවශක්තිය සැලකිය යුතු ලෙස වැඩි වේ',
        'දේපළ කටයුතු, ඉඩම් හා වත්කම් ගොඩනැගීම කෙරෙහි විශේෂ අවධානයක් යොමු කළ යුතුය',
        'තරඟ, මලල ක්‍රීඩා හා ක්‍රීඩා ජයග්‍රහණ හා පිළිගැනීම ගෙන දෙයි',
        'තාක්ෂණික කුසලතා, ඉංජිනේරු හැකියාවන් හා යාන්ත්‍රික දක්ෂතාව තියුණු වේ',
        'වැදගත් කටයුතු හා මුල පිරීම් සඳහා දකුණු දිශාව සුබදායකය',
        'නීතිමය හෝ දේපළ ආශ්‍රිත ආරවුල් ප්‍රවේශමෙන් හා දක්ෂ ලෙස හැසිරවීමට සිදු විය හැක',
        'ශාරීරික ශක්තිය, විඳදරාගැනීම හා ක්‍රීඩා දක්ෂතාව උච්චතම තත්ත්වයේ පවතී',
      ],
    },
    remedies: {
      en: [
        'Exercise vigorously and consistently to effectively channel high Mars energy',
        'Practice deliberate patience and calm in all disputes and conflicts',
        'Avoid unnecessary arguments and confrontations that deplete your vital energy',
        'Support and invest time and resources in brothers and male relatives',
      ],
      si: [
        'කුජගේ අධික ශක්තිය නිසි ලෙස මුදා හැරීමට තදින් හා නොකඩවා ව්‍යායාම කරන්න',
        'සියලු ආරවුල් හා ගැටුම්වලදී හිතාමතාම ඉවසීම හා සන්සුන්කම පවත්වා ගන්න',
        'ඔබේ ජීවශක්තිය හීන කරන අනවශ්‍ය තර්ක හා ගැටුම් වළක්වන්න',
        'සහෝදරයන්ට හා පිරිමි නෑදෑයන්ට සහය දී ඔවුන් වෙනුවෙන් කාලය හා සම්පත් යොදවන්න',
      ],
    },
  },

  Mercury: {
    details: {
      en: [
        'Learning, formal education, and skill acquisition are naturally emphasized',
        'Writing, communication skills, and verbal expression improve dramatically',
        'Short-distance travels prove beneficial, stimulating, and intellectually enriching',
        'Business and commercial acumen sharpen to peak performance levels',
        'North direction is highly favorable for important activities and ventures',
        'Analytical, logical, and critical thinking abilities reach their fullest potential',
        'Social circle expands productively with intellectually stimulating new connections',
      ],
      si: [
        'ඉගෙනීම, විධිමත් අධ්‍යාපනය හා නව කුසලතා ලබා ගැනීම ස්වභාවිකවම ප්‍රමුඛ වේ',
        'ලේඛන කලාව, සන්නිවේදන කුසලතා හා වාචික ප්‍රකාශනය සැලකිය යුතු ලෙස වැඩිදියුණු වේ',
        'කෙටි දුර ගමන් ප්‍රයෝජනවත්, උත්තේජනකාරී හා බුද්ධිය පෝෂණය කරන ඒවා වේ',
        'ව්‍යාපාරික හා වාණිජ දක්ෂතාව උපරිම මට්ටමට තියුණු වේ',
        'වැදගත් කටයුතු හා ව්‍යාපෘති සඳහා උතුරු දිශාව ඉතා හිතකරය',
        'විශ්ලේෂණාත්මක, තාර්කික හා විචාරශීලී චින්තන හැකියාවන් උපරිමයට පත් වේ',
        'බුද්ධිමය වශයෙන් උත්තේජනකාරී නව සම්බන්ධතා සමඟ සමාජ කවය ඵලදායී ලෙස පුළුල් වේ',
      ],
    },
    remedies: {
      en: [
        'Read diverse, challenging literature and engage in continuous active learning',
        'Practice precise, clear, compassionate, and effective communication daily',
        'Keep a detailed reflective journal or diary to process insights and track growth',
        'Actively help, mentor, and support students and young people around you',
      ],
      si: [
        'විවිධ, අභියෝගාත්මක සාහිත්‍යය කියවා නිරන්තර ක්‍රියාශීලී ඉගෙනීමේ යෙදෙන්න',
        'නිරවද්‍ය, පැහැදිලි, කරුණාවන්ත හා ඵලදායී සන්නිවේදනයක් දිනපතා පුරුදු කරන්න',
        'අවබෝධය සකසා ගැනීමට හා වර්ධනය නිරීක්ෂණය කිරීමට විස්තරාත්මක දිනපොතක් තබා ගන්න',
        'ඔබ අවට සිටින සිසුන්ට හා තරුණයන්ට උදව් කර මඟ පෙන්වා සහය දෙන්න',
      ],
    },
  },

  Jupiter: {
    details: {
      en: [
        'Spiritual growth, expanded wisdom, and philosophical understanding increase',
        'Higher education, advanced degrees, and specialized learning are strongly favored',
        'Long-distance travel, especially sacred pilgrimage, is auspicious and transformative',
        'Legal and contractual matters tend to conclude favorably and to your benefit',
        'Northeast direction is especially auspicious for all important activities',
        'Children, students, and young people become sources of genuine joy and blessing',
        'Overall fortune, life luck, and divine grace are remarkably strong',
      ],
      si: [
        'අධ්‍යාත්මික වර්ධනය, පුළුල් වූ ඥානය හා දාර්ශනික අවබෝධය වැඩි වේ',
        'උසස් අධ්‍යාපනය, උසස් උපාධි හා විශේෂඥ අධ්‍යයන බෙහෙවින් හිතකරය',
        'දිගු දුර ගමන් — විශේෂයෙන් වන්දනා ගමන් — සුබදායක හා පරිවර්තනීයය',
        'නීතිමය හා ගිවිසුම්ගත කටයුතු ඔබට හිතකර ලෙස නිම වේ',
        'සියලු වැදගත් කටයුතු සඳහා ඊසාන දිශාව විශේෂයෙන් සුබදායකය',
        'දරුවන්, සිසුන් හා තරුණයන් සැබෑ සතුටේ හා ආශිර්වාදයේ මූලාශ්‍ර වේ',
        'සමස්ත වාසනාව, ජීවිතයේ භාග්‍යය හා දේව ආශිර්වාදය කැපී පෙනෙන ලෙස ප්‍රබලය',
      ],
    },
    remedies: {
      en: [
        'Study sacred scriptures, philosophical works, and wisdom traditions systematically',
        'Teach, share knowledge generously, and mentor those who seek your guidance',
        'Visit temples, ashrams, and sacred places for spiritual inspiration and blessings',
        'Practice consistent generosity, charitable giving, and selfless service to others',
      ],
      si: [
        'පූජනීය ග්‍රන්ථ, දාර්ශනික කෘති හා ඥාන සම්ප්‍රදායන් ක්‍රමවත්ව අධ්‍යයනය කරන්න',
        'ඉගැන්වීමේ යෙදී දැනුම නොමසුරුව බෙදා දී ඔබෙන් මඟ පෙන්වීම පතන අයට උදව් කරන්න',
        'අධ්‍යාත්මික ප්‍රබෝධය හා ආශිර්වාද පිණිස පන්සල්, ආරාම හා පූජනීය ස්ථාන වන්දනා කරන්න',
        'නොකඩවා නොමසුරු බව, දන් දීම හා පරාර්ථකාමී සේවය පුරුදු කරන්න',
      ],
    },
  },

  Venus: {
    details: {
      en: [
        'Artistic expression, creative vision, and aesthetic sensitivity flourish greatly',
        'Material comfort, luxury, and sensory pleasures naturally and pleasurably increase',
        'Travel for leisure, pleasure, creative inspiration, and cultural experiences is favored',
        'Natural beauty in people, art, nature, and environments is deeply appreciated',
        'Southeast direction is auspicious for home, workspace, and important activities',
        'Social life becomes vibrant, lively, diverse, and genuinely enjoyable',
        'Material comforts, conveniences, and aesthetic pleasures become naturally abundant',
      ],
      si: [
        'කලාත්මක ප්‍රකාශනය, නිර්මාණශීලී දැක්ම හා සෞන්දර්ය සංවේදිතාව බෙහෙවින් වර්ධනය වේ',
        'භෞතික පහසුව, සුඛෝපභෝගය හා ඉන්ද්‍රිය සුඛය ස්වභාවිකවම වැඩි වේ',
        'විවේකය, විනෝදය, නිර්මාණශීලී ප්‍රබෝධය හා සංස්කෘතික අත්දැකීම් සඳහා ගමන් හිතකරය',
        'මිනිසුන්, කලාව, සොබාදහම හා පරිසරයේ ඇති ස්වාභාවික සුන්දරත්වය ගැඹුරින් අගය කෙරේ',
        'නිවස, සේවා ස්ථානය හා වැදගත් කටයුතු සඳහා අග්නි දිශාව සුබදායකය',
        'සමාජ ජීවිතය පණපිටින්, විචිත්‍රව හා සැබැවින්ම විනෝදජනක වේ',
        'භෞතික පහසුකම්, පහසුව හා සෞන්දර්යාත්මක සතුට ස්වභාවිකවම බහුල වේ',
      ],
    },
    remedies: {
      en: [
        'Actively engage in artistic, creative, musical, or aesthetic activities regularly',
        'Consciously appreciate and celebrate beauty in every dimension of daily life',
        'Maintain impeccable personal cleanliness, grooming, and aesthetic presentation',
        'Express sincere and heartfelt gratitude for all material comforts and blessings received',
      ],
      si: [
        'කලාත්මක, නිර්මාණශීලී, සංගීතමය හෝ සෞන්දර්යාත්මක කටයුතුවල නිතිපතා නිරත වන්න',
        'දෛනික ජීවිතයේ සෑම මානයකම සුන්දරත්වය දැනුවත්ව අගය කර සතුටු වන්න',
        'පෞද්ගලික පිරිසිදුකම, පෙනුම හා අලංකාරය නිර්දෝෂීව පවත්වා ගන්න',
        'ලැබී ඇති සියලු භෞතික පහසුකම් හා ආශිර්වාද ගැන අවංක හදවතින්ම කෘතඥ වන්න',
      ],
    },
  },

  Saturn: {
    details: {
      en: [
        'Profound and lasting life lessons arrive most powerfully through unavoidable challenges',
        'Discipline, structure, planning, routine, and consistency are absolutely essential',
        'Unresolved karma from the past surfaces urgently and persistently for final resolution',
        'Service to others, community, and the marginalized brings genuine spiritual growth',
        'West direction is particularly significant for activities, movement, and decisions',
        'Elderly, poor, and marginalized people especially need and deserve your active support',
        'Patience, perseverance, acceptance, and endurance are the key virtues of this entire period',
      ],
      si: [
        'ගැඹුරු හා කල් පවතින ජීවිත පාඩම් වළක්වා ගත නොහැකි අභියෝග හරහා ප්‍රබලව ලැබේ',
        'විනය, ව්‍යුහය, සැලසුම, නිත්‍ය චර්යාව හා නොකඩවා පැවැත්වීම අත්‍යවශ්‍යය',
        'අතීතයේ නොවිසඳුණු කර්මය අවසන් විසඳුම පිණිස හදිසියේ හා නොනවත්වා මතු වේ',
        'අන් අයට, ප්‍රජාවට හා කොන් වූවන්ට සේවය කිරීම සැබෑ අධ්‍යාත්මික වර්ධනයක් ගෙන දෙයි',
        'කටයුතු, ගමන් හා තීරණ සඳහා බටහිර දිශාව විශේෂයෙන් වැදගත් වේ',
        'වැඩිහිටියන්ට, දුප්පතුන්ට හා කොන් වූවන්ට ඔබේ ක්‍රියාශීලී සහය විශේෂයෙන් අවශ්‍යය',
        'ඉවසීම, නොපසුබට උත්සාහය, පිළිගැනීම හා විඳදරාගැනීම මුළු කාලයේම ප්‍රධාන ගුණාංග වේ',
      ],
    },
    remedies: {
      en: [
        'Consciously accept all challenges as powerful and necessary opportunities for growth',
        'Practice rigorous discipline and consistent structure in all areas of daily life',
        'Serve the elderly, disabled, and underprivileged with genuine dedication and compassion',
        'Completely avoid laziness, procrastination, and passive resistance to necessary action',
      ],
      si: [
        'සියලු අභියෝග වර්ධනය සඳහා ලැබෙන ප්‍රබල හා අවශ්‍ය අවස්ථා ලෙස දැනුවත්ව පිළිගන්න',
        'දෛනික ජීවිතයේ සියලු අංශවල දැඩි විනයක් හා ස්ථාවර ව්‍යුහයක් පවත්වා ගන්න',
        'වැඩිහිටියන්ට, ආබාධිතයන්ට හා අඩු පහසුකම් ලත් අයට අවංක කැපවීමෙන් හා කරුණාවෙන් සේවය කරන්න',
        'අලසකම, කල් දැමීම හා අවශ්‍ය ක්‍රියාවලට නිහඬව විරෝධය දැක්වීම සම්පූර්ණයෙන් වළක්වන්න',
      ],
    },
  },

  Rahu: {
    details: {
      en: [
        'Profoundly unconventional, surprising, and transformative experiences are likely',
        'Foreign travel, international connections, and cross-cultural experiences are highly possible',
        'Technology, innovation, research, and cutting-edge fields become increasingly important',
        'Illusions, confusion, and clarity alternate with disorienting but revealing frequency',
        'Southwest direction is particularly significant for activities and major decisions',
        'Sudden, unexpected events — both powerfully positive and challenging — are characteristic',
        'Research, investigation, and analytical deep-dive work yields surprising discoveries',
      ],
      si: [
        'සම්ප්‍රදායට හාත්පසින් වෙනස්, පුදුම සහගත හා පරිවර්තනීය අත්දැකීම් ලැබීමට ඉඩ ඇත',
        'විදේශ ගමන්, ජාත්‍යන්තර සම්බන්ධතා හා සංස්කෘතීන් අතර අත්දැකීම් ලැබීමේ ඉඩ වැඩිය',
        'තාක්ෂණය, නවෝත්පාදන, පර්යේෂණ හා නවීනතම ක්ෂේත්‍ර වඩ වඩාත් වැදගත් වේ',
        'මායාව, ව්‍යාකූලත්වය හා පැහැදිලිකම එකිනෙක මාරුවෙන් මාරුවට පැමිණේ',
        'කටයුතු හා ප්‍රධාන තීරණ සඳහා නිරිත දිශාව විශේෂයෙන් වැදගත් වේ',
        'හදිසි, අනපේක්ෂිත සිදුවීම් — ඉතා හිතකර මෙන්ම අභියෝගාත්මක ඒවා ද — මෙම කාලයේ ලක්ෂණයයි',
        'පර්යේෂණ, විමර්ශන හා ගැඹුරු විශ්ලේෂණ පුදුම සහගත සොයාගැනීම් ගෙන දෙයි',
      ],
    },
    remedies: {
      en: [
        'Maintain a grounded, humble, and authentic sense of self during rapid changes',
        'Strictly avoid all intoxicants, addictive substances, and addictive behaviors',
        'Practice unwavering truthfulness and ethical integrity in all situations',
        'Maintain consistent and grounding daily spiritual practices throughout this period',
      ],
      si: [
        'වේගවත් වෙනස්කම් අතරතුර යථාර්ථවාදී, නිහතමානී හා අවංක ස්වයං හැඟීමක් පවත්වා ගන්න',
        'සියලු මත්ද්‍රව්‍ය, ඇබ්බැහි කරවන දෑ හා ඇබ්බැහි හැසිරීම් දැඩිව වළක්වන්න',
        'සියලු තත්ත්වයන් යටතේ නොසැලෙන සත්‍යවාදිත්වයක් හා සදාචාරාත්මක අවංකභාවයක් පවත්වා ගන්න',
        'මෙම කාලය පුරාම නොකඩවා දිනපතා අධ්‍යාත්මික පිළිවෙත් පවත්වා ගන්න',
      ],
    },
  },

  Ketu: {
    details: {
      en: [
        'Profound spiritual awakening, enlightenment, and liberation actively unfold',
        'Past-life karma, patterns, and unresolved issues finally surface for permanent resolution',
        'Natural and growing detachment from the material world and its transient concerns',
        'Psychic abilities, spiritual intuition, and inner knowing increase dramatically',
        'Southwest direction is significantly connected to your important life experiences',
        'Healing abilities and gifts of intuition and perception actively develop',
        'Liberation from outdated, limiting, and no-longer-serving patterns is the primary theme',
      ],
      si: [
        'ගැඹුරු අධ්‍යාත්මික අවදිවීම, ප්‍රබෝධය හා මිදීම ක්‍රියාත්මක වේ',
        'පෙර භවවල කර්මය, රටා හා නොවිසඳුණු ගැටලු ස්ථිර විසඳුමක් පිණිස අවසානයේ මතු වේ',
        'භෞතික ලෝකයෙන් හා එහි අස්ථිර කරදරවලින් ස්වභාවිකවම වෙන් වීමක් ඇති වේ',
        'අභ්‍යන්තර දැක්ම, අධ්‍යාත්මික ඉව හා අභ්‍යන්තර දැනීම සැලකිය යුතු ලෙස වැඩි වේ',
        'නිරිත දිශාව ඔබේ වැදගත් ජීවන අත්දැකීම් සමඟ සැලකිය යුතු ලෙස බැඳී ඇත',
        'සුවකිරීමේ හැකියාව හා ඉවෙන් දැනගැනීමේ දක්ෂතාව ක්‍රියාශීලීව වර්ධනය වේ',
        'යල් පැන ගිය, සීමා කරන හා තවදුරටත් ප්‍රයෝජනවත් නොවන රටාවලින් මිදීම ප්‍රධාන තේමාවයි',
      ],
    },
    remedies: {
      en: [
        'Practice daily meditation, deep contemplation, and sustained inner awareness',
        'Consciously let go of all attachments to outcomes, possessions, and identities',
        'Serve actively and selflessly at spiritual centers, ashrams, and healing institutions',
        'Focus your energy, attention, and intentions entirely on inner transformation and liberation',
      ],
      si: [
        'දිනපතා භාවනාව, ගැඹුරු මෙනෙහි කිරීම හා අඛණ්ඩ අභ්‍යන්තර සිහිය පුරුදු කරන්න',
        'ප්‍රතිඵල, දේපළ හා අනන්‍යතා කෙරෙහි ඇති සියලු ඇල්ම දැනුවත්ව අත්හරින්න',
        'අධ්‍යාත්මික මධ්‍යස්ථාන, ආරාම හා සුවකිරීමේ ආයතනවල පරාර්ථකාමීව සේවය කරන්න',
        'ඔබේ ශක්තිය, අවධානය හා අභිප්‍රාය සම්පූර්ණයෙන්ම අභ්‍යන්තර පරිවර්තනය හා මිදීම වෙත යොමු කරන්න',
      ],
    },
  },
};
