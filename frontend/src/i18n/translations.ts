/** UI translations — English and Sinhala (සිංහල). */

export type Lang = 'en' | 'si';

const en = {
  // Tabs
  'tab.chart': 'Chart',
  'tab.timeline': 'Timeline',
  'tab.now': 'Now',
  'tab.match': 'Match',
  'tab.patterns': 'Patterns',
  'tab.vargas': 'Vargas',
  'tab.panchanga': 'Panchanga',
  'tab.insights': 'Insights',

  // Header
  'header.offline': 'Offline',
  'header.themeToDark': 'Switch to dark mode',
  'header.themeToLight': 'Switch to light mode',

  // Birth form
  'form.birthDetails': 'Birth Details',
  'form.birthDate': 'Birth Date',
  'form.birthTime': 'Birth Time',
  'form.quickLocations': 'Quick Locations',
  'form.latitude': 'Latitude',
  'form.longitude': 'Longitude',
  'form.timezone': 'Timezone',
  'form.ayanamsa': 'Ayanamsa',
  'form.generate': 'Generate Chart',
  'form.analyzing': 'Analyzing...',
  'form.error': 'Failed to generate chart',

  // Chart tab
  'chart.southIndian': 'South Indian',
  'chart.northIndian': 'North Indian',
  'chart.planetaryPositions': 'Planetary Positions',
  'chart.ayanamsaLabel': 'Ayanamsa',

  // Timeline tab
  'timeline.loading': 'Loading timeline…',

  // Patterns tab
  'patterns.title': 'Planetary Patterns',
  'patterns.subtitle': 'Significant combinations detected in this birth chart',

  // Vargas tab
  'varga.title': 'Divisional Charts (Vargas)',
  'varga.subtitle': 'Navamsa (D9) reveals marriage and inner strength · Dasamsa (D10) reveals career and public standing',
  'varga.d9Title': 'Navamsa D9',
  'varga.d10Title': 'Dasamsa D10',
  'varga.d9Subtitle': 'marriage, dharma, inner self',
  'varga.d10Subtitle': 'career, status, karma',
  'varga.lagna': 'Lagna',
  'varga.d9Hint': 'Click any section for its marriage reading',
  'varga.d10Hint': 'Click any section for its career reading',
  'varga.marriageTitle': 'Marriage & Partnership — from Navamsa',
  'varga.careerTitle': 'Career & Public Life — from Dasamsa',
  'varga.computing': 'Computing divisional charts…',
  'varga.failed': 'Failed to compute divisional charts.',
  'varga.colPlanet': 'Planet',
  'varga.colD1': 'D1 Rashi',
  'varga.colD9': 'D9 Navamsa',
  'varga.colD10': 'D10 Dasamsa',

  // Panchanga tab
  'panchanga.title': "Today's Panchanga",
  'panchanga.computing': "Computing today's Panchanga…",
  'panchanga.failed': 'Failed to compute Panchanga.',
  'panchanga.computedFor': 'computed for birth location',
  'panchanga.auspicious': 'Overall auspicious day — favourable for new beginnings',
  'panchanga.mixed': 'Mixed day — schedule important activities within the good muhurtas below',
  'panchanga.tithi': 'Tithi',
  'panchanga.vara': 'Vara',
  'panchanga.nakshatra': 'Nakshatra',
  'panchanga.yoga': 'Yoga',
  'panchanga.karana': 'Karana',
  'panchanga.keyTimings': 'Key Timings',
  'panchanga.sunrise': 'Sunrise',
  'panchanga.sunset': 'Sunset',
  'panchanga.abhijit': 'Abhijit Muhurta (best)',
  'panchanga.rahuKaal': 'Rahu Kaal (avoid)',
  'panchanga.gulikaKaal': 'Gulika Kaal (avoid)',
  'panchanga.choghadiya': 'Day Choghadiya',
  'panchanga.notAvailable': 'Not available for this location.',

  // Empty state
  'empty.title': 'Ready to Analyse Your Chart',
  'empty.body': 'Enter your birth details to generate a complete birth chart with planetary period analysis, combination patterns, and detailed life predictions.',

  // Footer
  'footer.tagline': 'Astrology predictions',
  'footer.nonCommercial': 'Non-Commercial Use Only',
  'footer.algorithms': 'Meeus algorithms · Lahiri ayanamsa',
};

const si: Record<keyof typeof en, string> = {
  // Tabs
  'tab.chart': 'කේන්දරය',
  'tab.timeline': 'කාල රේඛාව',
  'tab.now': 'දැන්',
  'tab.match': 'පොරොන්දම්',
  'tab.patterns': 'යෝග',
  'tab.vargas': 'වර්ග',
  'tab.panchanga': 'පංචාංගය',
  'tab.insights': 'විග්‍රහ',

  // Header
  'header.offline': 'නොබැඳි',
  'header.themeToDark': 'අඳුරු තේමාවට මාරු වන්න',
  'header.themeToLight': 'ආලෝක තේමාවට මාරු වන්න',

  // Birth form
  'form.birthDetails': 'උපන් විස්තර',
  'form.birthDate': 'උපන් දිනය',
  'form.birthTime': 'උපන් වේලාව',
  'form.quickLocations': 'ක්ෂණික ස්ථාන',
  'form.latitude': 'අක්ෂාංශ',
  'form.longitude': 'දේශාංශ',
  'form.timezone': 'වේලා කලාපය',
  'form.ayanamsa': 'අයනාංශය',
  'form.generate': 'කේන්දරය සාදන්න',
  'form.analyzing': 'විශ්ලේෂණය වෙමින්...',
  'form.error': 'කේන්දරය සෑදීමට නොහැකි විය',

  // Chart tab
  'chart.southIndian': 'දකුණු ඉන්දියානු',
  'chart.northIndian': 'උතුරු ඉන්දියානු',
  'chart.planetaryPositions': 'ග්‍රහ පිහිටීම්',
  'chart.ayanamsaLabel': 'අයනාංශය',

  // Timeline tab
  'timeline.loading': 'කාල රේඛාව පූරණය වෙමින්…',

  // Patterns tab
  'patterns.title': 'ග්‍රහ යෝග',
  'patterns.subtitle': 'මෙම ජන්ම කේන්දරයේ හඳුනාගත් වැදගත් ග්‍රහ සංයෝග',

  // Vargas tab
  'varga.title': 'වර්ග කේන්දර',
  'varga.subtitle': 'නවාංශක (D9) — විවාහය සහ අභ්‍යන්තර ශක්තිය · දශාංශක (D10) — වෘත්තිය සහ සමාජ තත්ත්වය',
  'varga.d9Title': 'නවාංශක D9',
  'varga.d10Title': 'දශාංශක D10',
  'varga.d9Subtitle': 'විවාහය, ධර්මය, අභ්‍යන්තර ආත්මය',
  'varga.d10Subtitle': 'වෘත්තිය, තත්ත්වය, කර්මය',
  'varga.lagna': 'ලග්නය',
  'varga.d9Hint': 'විවාහ විග්‍රහය සඳහා ඕනෑම කොටුවක් ක්ලික් කරන්න',
  'varga.d10Hint': 'වෘත්තීය විග්‍රහය සඳහා ඕනෑම කොටුවක් ක්ලික් කරන්න',
  'varga.marriageTitle': 'විවාහය සහ සහකරු — නවාංශකයෙන්',
  'varga.careerTitle': 'වෘත්තිය සහ මහජන ජීවිතය — දශාංශකයෙන්',
  'varga.computing': 'වර්ග කේන්දර ගණනය වෙමින්…',
  'varga.failed': 'වර්ග කේන්දර ගණනය කිරීමට නොහැකි විය.',
  'varga.colPlanet': 'ග්‍රහයා',
  'varga.colD1': 'D1 රාශිය',
  'varga.colD9': 'D9 නවාංශකය',
  'varga.colD10': 'D10 දශාංශකය',

  // Panchanga tab
  'panchanga.title': 'අද දින පංචාංගය',
  'panchanga.computing': 'අද දින පංචාංගය ගණනය වෙමින්…',
  'panchanga.failed': 'පංචාංගය ගණනය කිරීමට නොහැකි විය.',
  'panchanga.computedFor': 'උපන් ස්ථානය සඳහා ගණනය කර ඇත',
  'panchanga.auspicious': 'සමස්තයෙන් සුබ දිනයකි — නව ආරම්භ සඳහා හිතකරයි',
  'panchanga.mixed': 'මිශ්‍ර දිනයකි — වැදගත් කටයුතු පහත සුබ මුහුර්ත තුළ සිදු කරන්න',
  'panchanga.tithi': 'තිථිය',
  'panchanga.vara': 'වාරය',
  'panchanga.nakshatra': 'නැකත',
  'panchanga.yoga': 'යෝගය',
  'panchanga.karana': 'කරණය',
  'panchanga.keyTimings': 'ප්‍රධාන වේලාවන්',
  'panchanga.sunrise': 'හිරු උදාව',
  'panchanga.sunset': 'හිරු බැසීම',
  'panchanga.abhijit': 'අභිජිත් මුහුර්තය (ඉතා සුබයි)',
  'panchanga.rahuKaal': 'රාහු කාලය (වළකින්න)',
  'panchanga.gulikaKaal': 'ගුලික කාලය (වළකින්න)',
  'panchanga.choghadiya': 'දින චෝගඩියා',
  'panchanga.notAvailable': 'මෙම ස්ථානය සඳහා ලබා ගත නොහැක.',

  // Empty state
  'empty.title': 'ඔබේ කේන්දරය විශ්ලේෂණය කිරීමට සූදානම්',
  'empty.body': 'සම්පූර්ණ ජන්ම කේන්දරය, ග්‍රහ දශා කාල විශ්ලේෂණය, යෝග රටා සහ සවිස්තරාත්මක ජීවිත අනාවැකි ලබා ගැනීමට ඔබේ උපන් විස්තර ඇතුළත් කරන්න.',

  // Footer
  'footer.tagline': 'ජ්‍යොතිෂ අනාවැකි',
  'footer.nonCommercial': 'වාණිජ නොවන භාවිතය සඳහා පමණි',
  'footer.algorithms': 'Meeus ඇල්ගොරිතම · ලාහිරි අයනාංශය',
};

export type TranslationKey = keyof typeof en;

export const translations: Record<Lang, Record<TranslationKey, string>> = { en, si };
