/** Career details and remedies per dasha lord, in English and Sinhala. */

import type { AreaSpec } from './areaHealth';

export const CAREER_SPEC: Record<string, AreaSpec> = {
  Sun: {
    details: {
      en: [
        'Leadership, managerial, and authority positions are strongly favored',
        'Government jobs, civil services, and political careers are at their best',
        'Recognition, promotions, and appreciation from superiors are likely',
        'Career transition into heading a team or department is very auspicious',
        'Fame, professional reputation, and public recognition grow steadily',
      ],
      si: [
        'නායකත්ව, කළමනාකරණ හා නිලබලය සහිත තනතුරු බෙහෙවින් හිතකරය',
        'රාජ්‍ය රැකියා, රාජ්‍ය සේවය හා දේශපාලන වෘත්ති හොඳම තත්ත්වයේ පවතී',
        'ඉහළ නිලධාරීන්ගෙන් පිළිගැනීම්, උසස්වීම් හා ප්‍රශංසා ලැබීමට ඉඩ ඇත',
        'කණ්ඩායමක් හෝ අංශයක් මෙහෙයවීමේ තනතුරකට මාරු වීම ඉතා සුබදායකය',
        'කීර්තිය, වෘත්තීය නාමය හා මහජන පිළිගැනීම ක්‍රමයෙන් වැඩි වේ',
      ],
    },
    remedies: {
      en: [
        'Rise before sunrise and begin work in morning for best productivity',
        'Maintain strict integrity at the workplace at all times',
        'Avoid conflicts with superiors — work with authority, not against it',
        'Seek blessings from your father or a senior mentor for career success',
      ],
      si: [
        'හිරු උදාවට පෙර නැගිට උදෑසන වැඩ ආරම්භ කිරීමෙන් හොඳම ඵලදායිතාව ලැබේ',
        'සේවා ස්ථානයේදී සැමවිටම දැඩි අවංකභාවයක් පවත්වා ගන්න',
        'ඉහළ නිලධාරීන් සමඟ ගැටුම් වළක්වන්න — බලධාරීන්ට එරෙහිව නොව ඔවුන් සමඟ වැඩ කරන්න',
        'වෘත්තීය සාර්ථකත්වය සඳහා පියාගෙන් හෝ ජ්‍යෙෂ්ඨ මඟපෙන්වන්නෙකුගෙන් ආශිර්වාද ලබා ගන්න',
      ],
    },
  },

  Moon: {
    details: {
      en: [
        'Public-facing roles, hospitality, and people-oriented careers are favored',
        'Creative, nurturing, and counseling professions are naturally suited',
        'Career changes or role shifts may happen frequently but productively',
        'Businesses in food, dairy, hospitality, or water-related sectors thrive',
        'Work environment and relationships with colleagues significantly affect output',
      ],
      si: [
        'මහජනතාව සමඟ ගනුදෙනු කරන තනතුරු, ආගන්තුක සත්කාරය හා මිනිසුන් ආශ්‍රිත වෘත්ති හිතකරය',
        'නිර්මාණශීලී, රැකබලා ගැනීමේ හා උපදේශන වෘත්ති ස්වභාවිකවම ගැළපේ',
        'වෘත්තීය වෙනස්කම් හෝ තනතුරු මාරුවීම් නිතර සිදු විය හැකි නමුත් ඒවා ඵලදායීය',
        'ආහාර, කිරි, ආගන්තුක සත්කාර හෝ ජලය ආශ්‍රිත අංශවල ව්‍යාපාර සමෘද්ධිමත් වේ',
        'සේවා පරිසරය හා සගයන් සමඟ ඇති සම්බන්ධතා ඵලදායිතාවට සැලකිය යුතු ලෙස බලපායි',
      ],
    },
    remedies: {
      en: [
        'Maintain healthy work-life balance and emotional boundaries',
        'Create an aesthetically pleasant and harmonious workspace',
        'Trust your intuition in career decisions — it is heightened now',
        "Seek your mother's blessings before important career decisions",
      ],
      si: [
        'රැකියාව හා ජීවිතය අතර සෞඛ්‍ය සම්පන්න සමතුලිතතාවක් හා හැඟීම්බර සීමා පවත්වා ගන්න',
        'සුන්දර හා සමගිකාමී සේවා පරිසරයක් සකසා ගන්න',
        'වෘත්තීය තීරණවලදී ඔබේ අභ්‍යන්තර හැඟීම විශ්වාස කරන්න — දැන් එය තියුණුය',
        'වැදගත් වෘත්තීය තීරණ ගැනීමට පෙර මවගේ ආශිර්වාදය ලබා ගන්න',
      ],
    },
  },

  Mars: {
    details: {
      en: [
        'Technical engineering, military, police, and physical careers excel significantly',
        'Real estate, construction, and property-related businesses are highly favorable',
        'Sports, athletics, and competitive professional fields bring achievement',
        'May face workplace conflicts or competition — use energy productively',
        'Action-oriented, initiative-taking approach is well-rewarded this period',
      ],
      si: [
        'තාක්ෂණික ඉංජිනේරු, හමුදා, පොලිස් හා ශාරීරික ශ්‍රමය අවශ්‍ය වෘත්ති සැලකිය යුතු ලෙස සාර්ථක වේ',
        'දේපළ, ඉදිකිරීම් හා දේපළ ආශ්‍රිත ව්‍යාපාර ඉතා හිතකරය',
        'ක්‍රීඩා, මලල ක්‍රීඩා හා තරඟකාරී වෘත්තීය ක්ෂේත්‍ර ජයග්‍රහණ ගෙන දෙයි',
        'සේවා ස්ථානයේ ගැටුම් හෝ තරඟ ඇති විය හැක — ශක්තිය ඵලදායී ලෙස යොදවන්න',
        'ක්‍රියාශීලී, මුල පිරීමේ ප්‍රවේශයට මෙම කාලයේ හොඳ ප්‍රතිඵල ලැබේ',
      ],
    },
    remedies: {
      en: [
        'Channel all surplus energy into productive work and exercise',
        'Avoid unnecessary arguments and heated confrontations at the workplace',
        'Take bold initiative in career moves but exercise patience strategically',
        'Maintain regular physical exercise to manage the high Martian energy',
      ],
      si: [
        'ඉතිරි වන සියලු ශක්තිය ඵලදායී වැඩකටයුතු හා ව්‍යායාම වෙත යොමු කරන්න',
        'සේවා ස්ථානයේ අනවශ්‍ය තර්ක හා උණුසුම් ගැටුම් වළක්වන්න',
        'වෘත්තීය තීරණවලදී නිර්භීතව මුල පුරන්න, නමුත් උපායශීලීව ඉවසීම පවත්වා ගන්න',
        'කුජගේ අධික ශක්තිය පාලනය කර ගැනීමට නිතිපතා ශාරීරික ව්‍යායාම කරන්න',
      ],
    },
  },

  Mercury: {
    details: {
      en: [
        'Communication, media, writing, and publishing careers are at their peak',
        'Business, trading, and commercial ventures see remarkable success',
        'Teaching, IT, analytics, and advisory roles bring recognition and growth',
        'May successfully juggle multiple projects or income streams simultaneously',
        'Professional networking and relationship building opens new opportunities',
      ],
      si: [
        'සන්නිවේදන, මාධ්‍ය, ලේඛන හා ප්‍රකාශන වෘත්ති උච්චතම තත්ත්වයේ පවතී',
        'ව්‍යාපාර, වෙළඳාම හා වාණිජ ව්‍යාපෘති කැපී පෙනෙන සාර්ථකත්වයක් ලබයි',
        'ඉගැන්වීම, තොරතුරු තාක්ෂණය, විශ්ලේෂණ හා උපදේශන තනතුරු පිළිගැනීම හා දියුණුව ගෙන දෙයි',
        'එකවර ව්‍යාපෘති කිහිපයක් හෝ ආදායම් මාර්ග කිහිපයක් සාර්ථකව කළමනාකරණය කළ හැක',
        'වෘත්තීය සම්බන්ධතා ජාල ගොඩනැගීම නව අවස්ථා විවර කරයි',
      ],
    },
    remedies: {
      en: [
        'Continuously learn new skills and stay updated in your field',
        'Maintain professional, clear, and precise communication always',
        'Use analytical and logical abilities to maximum professional advantage',
        'Build and nurture a strong professional network systematically',
      ],
      si: [
        'නිරන්තරයෙන් නව කුසලතා ඉගෙන ගෙන ඔබේ ක්ෂේත්‍රයේ නවතම දැනුම පවත්වා ගන්න',
        'සැමවිටම වෘත්තීය, පැහැදිලි හා නිරවද්‍ය සන්නිවේදනයක් පවත්වා ගන්න',
        'විශ්ලේෂණාත්මක හා තාර්කික හැකියාවන් උපරිම වෘත්තීය වාසිය සඳහා යොදවන්න',
        'ශක්තිමත් වෘත්තීය සම්බන්ධතා ජාලයක් ක්‍රමවත්ව ගොඩනඟා පෝෂණය කරන්න',
      ],
    },
  },

  Jupiter: {
    details: {
      en: [
        'Teaching, advisory, consulting, law, and spiritual careers are strongly favored',
        'Significant business or professional expansion is the hallmark of this period',
        'Legal, financial, and banking sectors bring success and recognition',
        'Mentoring and guiding others becomes a natural and rewarding career role',
        'International connections and opportunities open up significantly',
      ],
      si: [
        'ඉගැන්වීම, උපදේශනය, උපදේශන සේවා, නීතිය හා අධ්‍යාත්මික වෘත්ති බෙහෙවින් හිතකරය',
        'සැලකිය යුතු ව්‍යාපාරික හෝ වෘත්තීය ව්‍යාප්තියක් මෙම කාලයේ ප්‍රධාන ලක්ෂණයයි',
        'නීති, මූල්‍ය හා බැංකු අංශ සාර්ථකත්වය හා පිළිගැනීම ගෙන දෙයි',
        'අන් අයට මඟ පෙන්වීම ස්වභාවික හා තෘප්තිමත් වෘත්තීය කාර්යයක් බවට පත් වේ',
        'ජාත්‍යන්තර සම්බන්ධතා හා අවස්ථා සැලකිය යුතු ලෙස විවර වේ',
      ],
    },
    remedies: {
      en: [
        'Maintain unwavering ethics and dharma in all professional dealings',
        'Share your knowledge, skills, and resources generously with others',
        'Respect seniors, mentors, and teachers deeply and consistently',
        'Commit to continuous learning and professional development',
      ],
      si: [
        'සියලු වෘත්තීය කටයුතුවලදී නොසැලෙන සදාචාරය හා ධර්මය පවත්වා ගන්න',
        'ඔබේ දැනුම, කුසලතා හා සම්පත් අන් අය සමඟ නොමසුරුව බෙදා ගන්න',
        'ජ්‍යෙෂ්ඨයන්ට, මඟපෙන්වන්නන්ට හා ගුරුවරුන්ට ගැඹුරින් හා නොකඩවා ගරු කරන්න',
        'නිරන්තර ඉගෙනීමට හා වෘත්තීය සංවර්ධනයට කැපවන්න',
      ],
    },
  },

  Venus: {
    details: {
      en: [
        'Arts, entertainment, fashion, beauty, and creative industries are at their peak',
        'Luxury goods, hospitality, tourism, and lifestyle sectors see excellent results',
        'Professional partnerships and collaborative ventures are particularly successful',
        'Work environment becomes significantly more pleasant and aesthetically refined',
        'Creative projects and initiatives receive recognition and public appreciation',
      ],
      si: [
        'කලා, විනෝදාස්වාදය, විලාසිතා, රූපලාවණ්‍ය හා නිර්මාණශීලී කර්මාන්ත උච්චතම තත්ත්වයේ පවතී',
        'සුඛෝපභෝගී භාණ්ඩ, ආගන්තුක සත්කාරය, සංචාරක හා ජීවන රටා අංශ විශිෂ්ට ප්‍රතිඵල ලබයි',
        'වෘත්තීය හවුල්කාරිත්ව හා එක්ව කරන ව්‍යාපෘති විශේෂයෙන් සාර්ථක වේ',
        'සේවා පරිසරය සැලකිය යුතු ලෙස වඩාත් සුවපහසු හා සුන්දර වේ',
        'නිර්මාණශීලී ව්‍යාපෘති හා මුල පිරීම් පිළිගැනීම හා මහජන ප්‍රශංසාව ලබයි',
      ],
    },
    remedies: {
      en: [
        'Maintain workplace harmony and resolve conflicts with grace',
        'Present yourself professionally and dress with appropriate elegance',
        'Actively build and maintain positive professional relationships',
        'Add beauty, creativity, and elegance to the quality of your work',
      ],
      si: [
        'සේවා ස්ථානයේ සමගිය පවත්වා ගෙන ගැටුම් ඉවසිලිවන්තව විසඳා ගන්න',
        'වෘත්තීයමය ලෙස පෙනී සිට සුදුසු අලංකාරයකින් ඇඳුම් පැළඳුම් තෝරා ගන්න',
        'හිතකර වෘත්තීය සම්බන්ධතා ක්‍රියාශීලීව ගොඩනඟා පවත්වා ගන්න',
        'ඔබේ වැඩවල ගුණාත්මකභාවයට සුන්දරත්වය, නිර්මාණශීලීත්වය හා අලංකාරය එක් කරන්න',
      ],
    },
  },

  Saturn: {
    details: {
      en: [
        'Career advancement is slow but systematically built on solid foundations',
        'Hard work, discipline, long hours, and dedicated persistence are required',
        'Initial delays and obstacles in career are followed by lasting recognition',
        'Service-oriented, administrative, and detail-focused roles bring satisfaction',
        'Long-term career building, institutional work, and legacy creation are favored',
      ],
      si: [
        'වෘත්තීය දියුණුව මන්දගාමී වුවත් එය ශක්තිමත් අඩිතාලමක් මත ක්‍රමවත්ව ගොඩනැගේ',
        'වෙහෙස මහන්සිය, විනය, දිගු වැඩ පැය හා කැපවීමෙන් යුත් නොපසුබට උත්සාහය අවශ්‍යය',
        'වෘත්තියේ මුල් ප්‍රමාදයන් හා බාධක අවසානයේ කල් පවතින පිළිගැනීමක් ගෙන දෙයි',
        'සේවා ආශ්‍රිත, පරිපාලන හා සියුම් විස්තර සමඟ කරන කාර්යයන් තෘප්තිය ගෙන දෙයි',
        'දිගු කාලීන වෘත්තීය ගොඩනැගීම, ආයතනික සේවය හා උරුමයක් නිර්මාණය කිරීම හිතකරය',
      ],
    },
    remedies: {
      en: [
        'Practice patience and persistence; Saturn rewards long-term effort',
        'Complete all pending tasks, commitments, and professional obligations',
        'Avoid shortcuts, ethical compromises, and quick fixes in career',
        'Respect and treat your subordinates, workers, and peers with dignity',
      ],
      si: [
        'ඉවසීම හා නොපසුබට උත්සාහය පුරුදු කරන්න; ශනි දිගු කාලීන වෑයමට ප්‍රතිඵල දෙයි',
        'ඉතිරිව ඇති සියලු කාර්ය, බැඳීම් හා වෘත්තීය වගකීම් සම්පූර්ණ කරන්න',
        'වෘත්තියේදී කෙටි මං, සදාචාරය බිඳීම හා තාවකාලික විසඳුම් වළක්වන්න',
        'යටත් නිලධාරීන්ට, සේවකයන්ට හා සගයන්ට ගෞරවයෙන් හා අභිමානයෙන් සලකන්න',
      ],
    },
  },

  Rahu: {
    details: {
      en: [
        'Unconventional, innovative, technology-driven, or foreign careers are favored',
        'Foreign companies, international organizations, or global markets bring success',
        'Sudden and unexpected career changes can lead to surprising advancements',
        'Politics, media, technology, and research fields can bring significant fame',
        'Investigation, analysis, and behind-the-scenes professional work excels',
      ],
      si: [
        'සම්ප්‍රදායික නොවන, නවෝත්පාදන, තාක්ෂණය මත පදනම් වූ හෝ විදේශීය වෘත්ති හිතකරය',
        'විදේශ සමාගම්, ජාත්‍යන්තර සංවිධාන හෝ ගෝලීය වෙළඳපොළ සාර්ථකත්වය ගෙන දෙයි',
        'හදිසි හා අනපේක්ෂිත වෘත්තීය වෙනස්කම් පුදුම සහගත දියුණුවකට මඟ පෑදිය හැක',
        'දේශපාලනය, මාධ්‍ය, තාක්ෂණය හා පර්යේෂණ ක්ෂේත්‍ර සැලකිය යුතු කීර්තියක් ගෙන දිය හැක',
        'විමර්ශන, විශ්ලේෂණ හා තිර පිටුපස සිට කරන වෘත්තීය කටයුතු සාර්ථක වේ',
      ],
    },
    remedies: {
      en: [
        'Stay grounded, authentic, and humble despite career success and recognition',
        'Avoid office politics, manipulation, and unethical professional strategies',
        'Be completely honest in professional dealings and contract commitments',
        'Keep your long-term career vision clear and do not get distracted by shortcuts',
      ],
      si: [
        'වෘත්තීය සාර්ථකත්වය හා පිළිගැනීම ලැබුණත් යථාර්ථවාදීව, අවංකව හා නිහතමානීව සිටින්න',
        'කාර්යාල දේශපාලනය, උපායශීලී හසුරුවීම් හා සදාචාර විරෝධී වෘත්තීය උපක්‍රම වළක්වන්න',
        'වෘත්තීය ගනුදෙනු හා ගිවිසුම් බැඳීම්වලදී සම්පූර්ණයෙන්ම අවංක වන්න',
        'ඔබේ දිගු කාලීන වෘත්තීය දැක්ම පැහැදිලිව තබා ගෙන කෙටි මං නිසා අවධානය වෙනතකට යොමු නොකරන්න',
      ],
    },
  },

  Ketu: {
    details: {
      en: [
        'Spiritual, healing, research, investigative, and occult careers are well-suited',
        'Past professional skills and hidden talents resurface with new relevance',
        'May experience a gradual loss of interest in the current career trajectory',
        'Professional detachment from material success opens deeper vocational calling',
        'Research, analysis, and investigative roles bring unexpected professional success',
      ],
      si: [
        'අධ්‍යාත්මික, සුවකිරීමේ, පර්යේෂණ, විමර්ශන හා ගුප්ත විද්‍යා වෘත්ති හොඳින් ගැළපේ',
        'අතීතයේ ලද වෘත්තීය කුසලතා හා සැඟවුණු දක්ෂතා නව වැදගත්කමකින් යළි මතු වේ',
        'වර්තමාන වෘත්තීය මාර්ගය කෙරෙහි ඇති උනන්දුව ක්‍රමයෙන් අඩු වී යා හැක',
        'භෞතික සාර්ථකත්වයෙන් වෙන් වීම ගැඹුරු වෘත්තීය කැඳවීමක් විවර කරයි',
        'පර්යේෂණ, විශ්ලේෂණ හා විමර්ශන කාර්යයන් අනපේක්ෂිත වෘත්තීය සාර්ථකත්වයක් ගෙන දෙයි',
      ],
    },
    remedies: {
      en: [
        'Find authentic and deep meaning in your current professional work',
        'Consider transitioning toward a career better aligned with your deeper values',
        'Do not artificially force career ambitions that no longer resonate with you',
        'Focus on professional contribution, mastery, and service over recognition',
      ],
      si: [
        'ඔබේ වර්තමාන වෘත්තීය කටයුතුවල අවංක හා ගැඹුරු අර්ථයක් සොයා ගන්න',
        'ඔබේ ගැඹුරු සාරධර්මවලට වඩාත් ගැළපෙන වෘත්තියකට මාරු වීම ගැන සලකා බලන්න',
        'ඔබට තවදුරටත් නොගැළපෙන වෘත්තීය අභිලාෂ බලෙන් රැක ගැනීමට උත්සාහ නොකරන්න',
        'පිළිගැනීමට වඩා වෘත්තීය දායකත්වය, ප්‍රවීණත්වය හා සේවය කෙරෙහි අවධානය යොමු කරන්න',
      ],
    },
  },
};
