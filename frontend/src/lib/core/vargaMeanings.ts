/**
 * Plain-language meanings for the divisional charts.
 *
 * The generic reading ("Mars acts on career & status within siblings, courage
 * and co-borns") is technically derived but useless to a reader who does not
 * already know the system. A house means something *different* inside each
 * varga: the 5th of the Saptamsa is your children, the 5th of the Chaturvimsamsa
 * is how you learn, the 5th of the Trimsamsa is where you are reckless. This
 * module states that difference in ordinary words.
 *
 * Every string here is written to be understood with no prior knowledge of
 * Vedic astrology.
 */

import type { DignityLevel } from './planetaryAnalysis';
import type { VargaCode } from './vargas';
import { type Lang, joinAnd } from './i18n';

export interface VargaPlainMeaning {
  /** Everyday name for the chart. */
  plainName: string;
  /** The single question this chart answers. */
  question: string;
  /** What the chart is, in one sentence, for someone new to this. */
  intro: string;
  /** What the rising sign of this chart sets up. */
  lagnaMeaning: string;
  /** Plain meaning of each of the twelve houses, inside this chart's domain. */
  houses: Record<number, string>;
  /**
   * Headline for each verdict band, written per chart. Generic phrasing breaks
   * down here: "Weak spots is a well-supported area for you" is both
   * ungrammatical and backwards — in the adversity chart, strength means less
   * trouble, not more.
   */
  verdicts: { strong: string; workable: string; needsEffort: string };
  /**
   * The noun to use inside sentences like "supports ___" and "progress in ___".
   * Usually the plain name, but the adversity chart needs inverting: planets
   * there support your *resilience*, not your weak spots.
   */
  reasonArea: string;
}

// Only the extra vargas need this; D9 and D10 already have bespoke readings.
export const VARGA_PLAIN: Partial<Record<VargaCode, VargaPlainMeaning>> = {
  D2: {
    plainName: 'Money chart',
    question: 'How does money actually behave in your life?',
    intro: 'Splits every sign in two to look purely at earning, holding and losing money — separate from career.',
    lagnaMeaning: 'Sets your basic relationship with money: whether you are a natural earner, saver, spender or provider.',
    houses: {
      1: 'Your instinct with money — how you personally handle it before anyone advises you.',
      2: 'What you actually accumulate and keep. Savings, valuables, the balance that survives the month.',
      3: 'Money you make through your own effort and hustle — side work, small deals, initiative.',
      4: 'Money tied up in home, land and vehicles. The comfort your income buys.',
      5: 'Speculative money — investments, markets, bets, and windfalls from creative work.',
      6: 'Debt, loans and money lost to disputes or bills. Also money earned by grinding service work.',
      7: 'Money that comes through partners, spouses and joint ventures.',
      8: 'Money you do not control: inheritance, insurance, tax, other people\'s funds, sudden loss or gain.',
      9: 'Lucky money — fortune, support from elders, gains from travel or teaching.',
      10: 'Money that arrives because of your reputation and position.',
      11: 'Income and profit. The clearest indicator of what actually lands in your hands.',
      12: 'Where money leaks — expenses, foreign spending, and what you give away.',
    },
    verdicts: {
      strong: 'Money tends to work in your favour',
      workable: 'Money is workable, with some friction',
      needsEffort: 'Money is an area that asks for effort',
    },
    reasonArea: 'your money life',
  },
  D3: {
    plainName: 'Siblings & courage chart',
    question: 'How much drive do you have, and how do your siblings and peers figure in your life?',
    intro: 'Splits every sign in three to examine nerve, initiative, and your relationships with brothers, sisters and close peers.',
    lagnaMeaning: 'Sets your baseline nerve — how readily you start things, push back, and back yourself.',
    houses: {
      1: 'Your own courage and self-starting energy.',
      2: 'How you speak up for yourself, and the resources your siblings bring.',
      3: 'Younger siblings, and your raw appetite for effort and risk.',
      4: 'Whether home life supports or dampens your drive.',
      5: 'Creative nerve — the confidence to make something and show it.',
      6: 'Rivalry and conflict, including friction with siblings.',
      7: 'How your drive plays out with partners — collaborative or competitive.',
      8: 'Where your courage gets tested by crisis, and hidden strain with siblings.',
      9: 'Elder siblings, mentors, and courage that comes from belief.',
      10: 'How your initiative shows up in work and public life.',
      11: 'What your effort gains you, and the peer network you build.',
      12: 'Where drive drains away — burnout, isolation, or distance from siblings.',
    },
    verdicts: {
      strong: 'You have solid drive, and good backing from those around you',
      workable: 'Your drive is workable, with some friction',
      needsEffort: 'Drive and sibling support ask for effort',
    },
    reasonArea: 'your drive and sibling ties',
  },
  D4: {
    plainName: 'Home & property chart',
    question: 'What kind of home, land and inner security do you build?',
    intro: 'Splits every sign in four to look at property, roots, and the settled contentment a home provides.',
    lagnaMeaning: 'Sets how naturally you find a place that feels like yours.',
    houses: {
      1: 'Your sense of being settled — whether you feel rooted or perpetually temporary.',
      2: 'Property held as an asset, and what the home contributes to your finances.',
      3: 'Moving house, short relocations, and property dealings that take effort.',
      4: 'The main indicator: your actual home, land, and peace of mind within it.',
      5: 'Property that grows in value, and the joy your home brings.',
      6: 'Property disputes, mortgages, repairs and the burdens of ownership.',
      7: 'Property held jointly, and how a partner shapes where you live.',
      8: 'Inherited property, and sudden upheavals to where you live.',
      9: 'Fortunate property, ancestral land, and homes far from where you started.',
      10: 'Property connected to your work, and the status your address confers.',
      11: 'Gains from property — rent, sale, appreciation.',
      12: 'Property abroad, homes let go, and what maintaining a home costs you.',
    },
    verdicts: {
      strong: 'Home and property tend to work in your favour',
      workable: 'Home and property are workable, with some friction',
      needsEffort: 'Home and property ask for effort',
    },
    reasonArea: 'home and property',
  },
  D7: {
    plainName: 'Children chart',
    question: 'What is your relationship with children and with what you create?',
    intro: 'Splits every sign in seven to examine children, fertility, and the things you bring into being and nurture.',
    lagnaMeaning: 'Sets how central children and creative output are to your life.',
    houses: {
      1: 'Your own capacity and appetite for raising or creating something.',
      2: 'What children add to family life and resources.',
      3: 'The effort of raising children, and relations between them.',
      4: 'The emotional home you give a child, and your own mothering instinct.',
      5: 'The main indicator: children themselves, conception, and creative output.',
      6: 'Difficulties around children — health worries, strain, delayed conception.',
      7: 'How a partner figures in having and raising children.',
      8: 'Hidden or difficult chapters around children; interruptions and losses.',
      9: 'The values you pass down, and a child\'s good fortune.',
      10: 'A child\'s standing in the world, and children\'s effect on your work.',
      11: 'Fulfilment through children, and what they eventually bring you.',
      12: 'Distance from children, children abroad, and what raising them costs.',
    },
    verdicts: {
      strong: 'Children and creative output are well supported',
      workable: 'Children and creative output are workable, with some friction',
      needsEffort: 'Children and creative output ask for effort',
    },
    reasonArea: 'children and what you create',
  },
  D12: {
    plainName: 'Parents & ancestry chart',
    question: 'What did you inherit from your parents and the generations behind them?',
    intro: 'Splits every sign in twelve to examine parents, family lineage, and the patterns handed down to you.',
    lagnaMeaning: 'Sets how strongly your family of origin shapes who you became.',
    houses: {
      1: 'How much you carry your parents in your own character.',
      2: 'Family wealth, values and what was materially handed down.',
      3: 'The family\'s appetite for effort, and your parents\' siblings.',
      4: 'Your mother, and the emotional climate of your childhood home.',
      5: 'Inherited talent and intelligence; what runs in the family.',
      6: 'Family friction, inherited health patterns and old obligations.',
      7: 'How your parents\' relationship shaped what you expect from partnership.',
      8: 'Hidden family history, secrets, and inheritance matters.',
      9: 'Your father, the family\'s beliefs, and ancestral fortune.',
      10: 'The family name, and how your parents\' standing affects yours.',
      11: 'What the family network gains you.',
      12: 'Family distance, migration, and what you have let go of from your lineage.',
    },
    verdicts: {
      strong: 'Your family inheritance is a source of strength',
      workable: 'Your family inheritance is mixed',
      needsEffort: 'Your family inheritance carries some weight to work through',
    },
    reasonArea: 'what your family passes on',
  },
  D24: {
    plainName: 'Learning chart',
    question: 'How do you actually learn, and how far does formal study take you?',
    intro: 'Splits every sign in twenty-four to examine study, qualifications, and how your mind takes in knowledge.',
    lagnaMeaning: 'Sets your natural learning style and how easily study comes to you.',
    houses: {
      1: 'Your raw aptitude and how you prefer to learn.',
      2: 'Retention — what you actually remember and can use.',
      3: 'Self-teaching, skills picked up by doing, short courses.',
      4: 'Schooling and the environment you studied in.',
      5: 'The main indicator: intelligence, quick grasp, exam ability.',
      6: 'Competitive study, entrance exams, and where learning is a grind.',
      7: 'Learning with others — tutors, study partners, collaboration.',
      8: 'Research, hidden subjects, and study that gets interrupted.',
      9: 'Higher education, degrees, teachers and study abroad.',
      10: 'Qualifications that convert into a career.',
      11: 'What your education gains you — networks, credentials, income.',
      12: 'Study far from home, solitary learning, and knowledge pursued for its own sake.',
    },
    verdicts: {
      strong: 'Study and learning come readily to you',
      workable: 'Study is workable, with some friction',
      needsEffort: 'Study and learning ask for effort',
    },
    reasonArea: 'your learning',
  },
  D30: {
    plainName: 'Weak spots chart',
    question: 'Where are you most likely to run into trouble, and what kind?',
    intro: 'Splits every sign in thirty to expose vulnerabilities — the recurring difficulties and moral pressure points in a life. It is a map of what to watch, not a verdict.',
    lagnaMeaning: 'Sets the kind of trouble that tends to find you, and your basic resilience to it.',
    houses: {
      1: 'Trouble that comes from your own temperament and choices.',
      2: 'Money trouble, and words that get you into difficulty.',
      3: 'Trouble from impulsiveness, and friction with those close in age.',
      4: 'Domestic unrest and lack of peace at home.',
      5: 'Trouble from risk-taking, romance, or speculation.',
      6: 'Illness, enemies, debt and legal difficulty — the classic problem house.',
      7: 'Trouble arriving through partners and close relationships.',
      8: 'Crisis, upheaval and the things that arrive without warning.',
      9: 'Trouble from misplaced belief, bad advice, or travel.',
      10: 'Professional setbacks and damage to reputation.',
      11: 'Trouble from the wrong crowd, or from wanting too much.',
      12: 'Losses, isolation, and self-undermining habits.',
    },
    verdicts: {
      strong: 'You are well defended against the troubles this chart tracks',
      workable: 'You have moderate resistance to the troubles this chart tracks',
      needsEffort: 'This chart\'s troubles find you more easily than most',
    },
    reasonArea: 'your resilience',
  },
  D60: {
    plainName: 'Deep karma chart',
    question: 'What underlying pattern is running beneath everything else?',
    intro: 'Splits every sign into sixty — the finest division classical astrology uses. It is treated as the deepest layer, and needs an exact birth time to be reliable.',
    lagnaMeaning: 'Sets the underlying theme your life keeps returning to, whatever the surface circumstances.',
    houses: {
      1: 'The core pattern you were born carrying.',
      2: 'Deep patterns around security, worth and what you hold onto.',
      3: 'Deep patterns around effort, will and self-assertion.',
      4: 'Deep patterns around belonging and emotional safety.',
      5: 'Deep patterns around creativity, children and self-expression.',
      6: 'Long-running obligations, debts and service you owe.',
      7: 'Deep patterns in how you bond with others.',
      8: 'The transformations your life keeps putting you through.',
      9: 'Your underlying beliefs and the fortune that follows them.',
      10: 'The work you are, at bottom, here to do.',
      11: 'What ultimately comes to you, and why.',
      12: 'What you are meant to release rather than hold.',
    },
    verdicts: {
      strong: 'The deep pattern under your life runs in your favour',
      workable: 'The deep pattern under your life is mixed',
      needsEffort: 'The deep pattern under your life asks for conscious work',
    },
    reasonArea: 'the deep pattern under your life',
  },
};

/**
 * Translated overlays for `VARGA_PLAIN`, one whole `VargaPlainMeaning` per
 * varga per language — not per-field, so a translation is a single
 * self-contained block that can be added independently of every other
 * language, and a varga/language pair with no entry here simply falls back
 * to the English in `VARGA_PLAIN` above.
 */
const VARGA_PLAIN_TR: Partial<Record<Exclude<Lang, 'en'>, Partial<Record<VargaCode, VargaPlainMeaning>>>> = {
  ml: {
  D2: {
    plainName: 'ധന ചാർട്ട്',
    question: 'നിങ്ങളുടെ ജീവിതത്തിൽ പണം യഥാർത്ഥത്തിൽ എങ്ങനെ പെരുമാറുന്നു?',
    intro: 'ഓരോ രാശിയെയും രണ്ടായി വിഭജിച്ച്, തൊഴിലിൽ നിന്ന് വേറിട്ട്, സമ്പാദിക്കൽ, സൂക്ഷിക്കൽ, നഷ്ടപ്പെടുത്തൽ എന്നിവ മാത്രം നോക്കുന്നു.',
    lagnaMeaning: 'പണവുമായുള്ള നിങ്ങളുടെ അടിസ്ഥാന ബന്ധം നിശ്ചയിക്കുന്നു — നിങ്ങൾ സ്വാഭാവികമായി സമ്പാദിക്കുന്നയാളോ, സൂക്ഷിക്കുന്നയാളോ, ചെലവഴിക്കുന്നയാളോ, നൽകുന്നയാളോ ആണോ എന്ന്.',
    houses: {
      1: 'നിങ്ങളുടെ പണത്തോടുള്ള സഹജവാസന — ആരും ഉപദേശിക്കുന്നതിനു മുമ്പ് നിങ്ങൾ അത് വ്യക്തിപരമായി എങ്ങനെ കൈകാര്യം ചെയ്യുന്നു.',
      2: 'നിങ്ങൾ യഥാർത്ഥത്തിൽ സ്വരൂപിച്ച് സൂക്ഷിക്കുന്നത്. സമ്പാദ്യം, വിലപിടിപ്പുള്ള വസ്തുക്കൾ, മാസാവസാനം ബാക്കിയാകുന്ന ബാലൻസ്.',
      3: 'നിങ്ങളുടെ സ്വന്തം പരിശ്രമത്തിലൂടെയും ഉത്സാഹത്തിലൂടെയും നേടുന്ന പണം — സൈഡ് ജോലി, ചെറിയ ഇടപാടുകൾ, മുൻകൈ.',
      4: 'വീട്, ഭൂമി, വാഹനങ്ങൾ എന്നിവയിൽ കുടുങ്ങിക്കിടക്കുന്ന പണം. നിങ്ങളുടെ വരുമാനം വാങ്ങുന്ന സൗകര്യം.',
      5: 'ഊഹക്കച്ചവട പണം — നിക്ഷേപങ്ങൾ, മാർക്കറ്റുകൾ, വാതുവെപ്പുകൾ, സൃഷ്ടിപരമായ ജോലിയിൽ നിന്നുള്ള അപ്രതീക്ഷിത ലാഭം.',
      6: 'കടം, വായ്പകൾ, തർക്കങ്ങൾക്കോ ബില്ലുകൾക്കോ നഷ്ടപ്പെടുന്ന പണം. കഠിനമായ സേവന ജോലിയിലൂടെ സമ്പാദിക്കുന്ന പണവും.',
      7: 'പങ്കാളികൾ, ജീവിതപങ്കാളികൾ, സംയുക്ത സംരംഭങ്ങൾ എന്നിവയിലൂടെ വരുന്ന പണം.',
      8: 'നിങ്ങൾ നിയന്ത്രിക്കാത്ത പണം: അനന്തരാവകാശം, ഇൻഷുറൻസ്, നികുതി, മറ്റുള്ളവരുടെ ഫണ്ടുകൾ, പെട്ടെന്നുള്ള നഷ്ടമോ നേട്ടമോ.',
      9: 'ഭാഗ്യമുള്ള പണം — സൗഭാഗ്യം, മുതിർന്നവരുടെ പിന്തുണ, യാത്രയിൽ നിന്നോ അധ്യാപനത്തിൽ നിന്നോ ഉള്ള നേട്ടങ്ങൾ.',
      10: 'നിങ്ങളുടെ പ്രശസ്തിയും സ്ഥാനവും കാരണം എത്തുന്ന പണം.',
      11: 'വരുമാനവും ലാഭവും. നിങ്ങളുടെ കൈകളിൽ യഥാർത്ഥത്തിൽ എത്തുന്നതിന്റെ ഏറ്റവും വ്യക്തമായ സൂചകം.',
      12: 'പണം ചോർന്നുപോകുന്നിടം — ചെലവുകൾ, വിദേശ ചെലവ്, നിങ്ങൾ ദാനം ചെയ്യുന്നത്.',
    },
    verdicts: {
      strong: 'പണം സാധാരണയായി നിങ്ങൾക്ക് അനുകൂലമായി പ്രവർത്തിക്കുന്നു',
      workable: 'പണം അൽപ്പം ഘർഷണത്തോടെ പ്രായോഗികമാണ്',
      needsEffort: 'പണം പരിശ്രമം ആവശ്യമുള്ള ഒരു മേഖലയാണ്',
    },
    reasonArea: 'നിങ്ങളുടെ സാമ്പത്തിക ജീവിതം',
  },
  D3: {
    plainName: 'സഹോദരങ്ങളും ധൈര്യവും ചാർട്ട്',
    question: 'നിങ്ങൾക്ക് എത്രത്തോളം ചാലകശക്തിയുണ്ട്, നിങ്ങളുടെ സഹോദരങ്ങളും സമപ്രായക്കാരും നിങ്ങളുടെ ജീവിതത്തിൽ എങ്ങനെ ഇടപെടുന്നു?',
    intro: 'ഓരോ രാശിയെയും മൂന്നായി വിഭജിച്ച്, ധൈര്യം, മുൻകൈ, സഹോദരങ്ങളുമായും അടുത്ത സമപ്രായക്കാരുമായുമുള്ള ബന്ധങ്ങൾ എന്നിവ പരിശോധിക്കുന്നു.',
    lagnaMeaning: 'നിങ്ങളുടെ അടിസ്ഥാന ധൈര്യം നിശ്ചയിക്കുന്നു — എത്ര എളുപ്പത്തിൽ നിങ്ങൾ കാര്യങ്ങൾ ആരംഭിക്കുന്നു, തിരിച്ചടിക്കുന്നു, സ്വയം പിന്തുണയ്ക്കുന്നു.',
    houses: {
      1: 'നിങ്ങളുടെ സ്വന്തം ധൈര്യവും സ്വയം-ആരംഭിക്കാനുള്ള ഊർജ്ജവും.',
      2: 'നിങ്ങൾ സ്വയം എങ്ങനെ സംസാരിക്കുന്നു, നിങ്ങളുടെ സഹോദരങ്ങൾ കൊണ്ടുവരുന്ന വിഭവങ്ങൾ.',
      3: 'ഇളയ സഹോദരങ്ങൾ, പരിശ്രമത്തിനും അപകടസാധ്യതയ്ക്കുമുള്ള നിങ്ങളുടെ അസംസ്കൃത വിശപ്പ്.',
      4: 'ഗൃഹജീവിതം നിങ്ങളുടെ ചാലകശക്തിയെ പിന്തുണയ്ക്കുന്നുണ്ടോ അതോ കുറയ്ക്കുന്നുണ്ടോ.',
      5: 'സൃഷ്ടിപരമായ ധൈര്യം — എന്തെങ്കിലും ഉണ്ടാക്കി അത് കാണിക്കാനുള്ള ആത്മവിശ്വാസം.',
      6: 'മത്സരവും സംഘർഷവും, സഹോദരങ്ങളുമായുള്ള ഘർഷണം ഉൾപ്പെടെ.',
      7: 'നിങ്ങളുടെ ചാലകശക്തി പങ്കാളികളുമായി എങ്ങനെ പ്രകടമാകുന്നു — സഹകരണപരമോ മത്സരപരമോ.',
      8: 'പ്രതിസന്ധിയിലൂടെ നിങ്ങളുടെ ധൈര്യം പരീക്ഷിക്കപ്പെടുന്നിടം, സഹോദരങ്ങളുമായുള്ള മറഞ്ഞ പിരിമുറുക്കം.',
      9: 'മുതിർന്ന സഹോദരങ്ങൾ, ഗുരുക്കന്മാർ, വിശ്വാസത്തിൽ നിന്ന് വരുന്ന ധൈര്യം.',
      10: 'നിങ്ങളുടെ മുൻകൈ ജോലിയിലും പൊതുജീവിതത്തിലും എങ്ങനെ പ്രകടമാകുന്നു.',
      11: 'നിങ്ങളുടെ പരിശ്രമം നിങ്ങൾക്ക് നേടിത്തരുന്നത്, നിങ്ങൾ കെട്ടിപ്പടുക്കുന്ന സമപ്രായ ശൃംഖല.',
      12: 'ചാലകശക്തി ചോർന്നുപോകുന്നിടം — ബേൺഔട്ട്, ഒറ്റപ്പെടൽ, സഹോദരങ്ങളിൽ നിന്നുള്ള അകൽച്ച.',
    },
    verdicts: {
      strong: 'നിങ്ങൾക്ക് ശക്തമായ ചാലകശക്തിയും ചുറ്റുമുള്ളവരിൽ നിന്ന് നല്ല പിന്തുണയുമുണ്ട്',
      workable: 'നിങ്ങളുടെ ചാലകശക്തി അൽപ്പം ഘർഷണത്തോടെ പ്രായോഗികമാണ്',
      needsEffort: 'ചാലകശക്തിക്കും സഹോദര പിന്തുണയ്ക്കും പരിശ്രമം ആവശ്യമാണ്',
    },
    reasonArea: 'നിങ്ങളുടെ ചാലകശക്തിയും സഹോദര ബന്ധങ്ങളും',
  },
  D4: {
    plainName: 'വീടും സ്വത്തും ചാർട്ട്',
    question: 'നിങ്ങൾ എന്ത് തരം വീട്, ഭൂമി, ആന്തരിക സുരക്ഷിതത്വം എന്നിവയാണ് കെട്ടിപ്പടുക്കുന്നത്?',
    intro: 'ഓരോ രാശിയെയും നാലായി വിഭജിച്ച്, സ്വത്ത്, വേരുകൾ, ഒരു വീട് നൽകുന്ന സ്ഥിരതയുള്ള സംതൃപ്തി എന്നിവ പരിശോധിക്കുന്നു.',
    lagnaMeaning: 'നിങ്ങളുടേതെന്ന് തോന്നുന്ന ഒരു സ്ഥലം സ്വാഭാവികമായി കണ്ടെത്താൻ നിങ്ങൾക്ക് എത്ര എളുപ്പമാണെന്ന് നിശ്ചയിക്കുന്നു.',
    houses: {
      1: 'നിങ്ങൾ സ്ഥിരതയുള്ളവനാണെന്ന തോന്നൽ — വേരൂന്നിയതോ എന്നും താൽക്കാലികമോ ആയി തോന്നുന്നുണ്ടോ.',
      2: 'ഒരു ആസ്തിയായി കൈവശം വച്ചിരിക്കുന്ന സ്വത്ത്, വീട് നിങ്ങളുടെ സാമ്പത്തികസ്ഥിതിക്ക് നൽകുന്ന സംഭാവന.',
      3: 'വീട് മാറൽ, ഹ്രസ്വ സ്ഥലംമാറ്റങ്ങൾ, പരിശ്രമം വേണ്ട സ്വത്ത് ഇടപാടുകൾ.',
      4: 'പ്രധാന സൂചകം: നിങ്ങളുടെ യഥാർത്ഥ വീട്, ഭൂമി, അതിനുള്ളിലെ മനഃസമാധാനം.',
      5: 'മൂല്യം വർദ്ധിക്കുന്ന സ്വത്ത്, നിങ്ങളുടെ വീട് നൽകുന്ന സന്തോഷം.',
      6: 'സ്വത്ത് തർക്കങ്ങൾ, മോർട്ട്ഗേജുകൾ, അറ്റകുറ്റപ്പണികൾ, ഉടമസ്ഥതയുടെ ഭാരങ്ങൾ.',
      7: 'സംയുക്തമായി കൈവശം വച്ചിരിക്കുന്ന സ്വത്ത്, ഒരു പങ്കാളി നിങ്ങൾ എവിടെ താമസിക്കുന്നു എന്നത് എങ്ങനെ രൂപപ്പെടുത്തുന്നു.',
      8: 'അനന്തരാവകാശമായി ലഭിച്ച സ്വത്ത്, നിങ്ങൾ താമസിക്കുന്നിടത്ത് പെട്ടെന്നുള്ള കോളിളക്കങ്ങൾ.',
      9: 'ഭാഗ്യമുള്ള സ്വത്ത്, പൈതൃക ഭൂമി, നിങ്ങൾ ആരംഭിച്ചിടത്തുനിന്ന് അകലെയുള്ള വീടുകൾ.',
      10: 'നിങ്ങളുടെ ജോലിയുമായി ബന്ധപ്പെട്ട സ്വത്ത്, നിങ്ങളുടെ വിലാസം നൽകുന്ന പദവി.',
      11: 'സ്വത്തിൽ നിന്നുള്ള നേട്ടങ്ങൾ — വാടക, വിൽപ്പന, മൂല്യവർദ്ധന.',
      12: 'വിദേശത്തുള്ള സ്വത്ത്, ഉപേക്ഷിച്ച വീടുകൾ, ഒരു വീട് പരിപാലിക്കാൻ നിങ്ങൾക്ക് ചെലവാകുന്നത്.',
    },
    verdicts: {
      strong: 'വീടും സ്വത്തും സാധാരണയായി നിങ്ങൾക്ക് അനുകൂലമായി പ്രവർത്തിക്കുന്നു',
      workable: 'വീടും സ്വത്തും അൽപ്പം ഘർഷണത്തോടെ പ്രായോഗികമാണ്',
      needsEffort: 'വീടിനും സ്വത്തിനും പരിശ്രമം ആവശ്യമാണ്',
    },
    reasonArea: 'വീടും സ്വത്തും',
  },
  D7: {
    plainName: 'കുട്ടികളുടെ ചാർട്ട്',
    question: 'കുട്ടികളുമായും നിങ്ങൾ സൃഷ്ടിക്കുന്നതുമായും നിങ്ങളുടെ ബന്ധം എന്താണ്?',
    intro: 'ഓരോ രാശിയെയും ഏഴായി വിഭജിച്ച്, കുട്ടികൾ, ഫലഭൂയിഷ്ഠത, നിങ്ങൾ നിലവിൽ കൊണ്ടുവന്ന് പരിപോഷിപ്പിക്കുന്ന കാര്യങ്ങൾ എന്നിവ പരിശോധിക്കുന്നു.',
    lagnaMeaning: 'കുട്ടികളും സൃഷ്ടിപരമായ ഉൽപാദനവും നിങ്ങളുടെ ജീവിതത്തിന് എത്ര പ്രധാനമാണെന്ന് നിശ്ചയിക്കുന്നു.',
    houses: {
      1: 'എന്തെങ്കിലും വളർത്താനോ സൃഷ്ടിക്കാനോ ഉള്ള നിങ്ങളുടെ സ്വന്തം ശേഷിയും ആഗ്രഹവും.',
      2: 'കുട്ടികൾ കുടുംബജീവിതത്തിനും വിഭവങ്ങൾക്കും നൽകുന്ന സംഭാവന.',
      3: 'കുട്ടികളെ വളർത്തുന്നതിന്റെ പരിശ്രമം, അവർ തമ്മിലുള്ള ബന്ധങ്ങൾ.',
      4: 'നിങ്ങൾ ഒരു കുട്ടിക്ക് നൽകുന്ന വൈകാരിക ഭവനം, നിങ്ങളുടെ സ്വന്തം മാതൃസഹജവാസന.',
      5: 'പ്രധാന സൂചകം: കുട്ടികൾ തന്നെ, ഗർഭധാരണം, സൃഷ്ടിപരമായ ഉൽപാദനം.',
      6: 'കുട്ടികളെക്കുറിച്ചുള്ള ബുദ്ധിമുട്ടുകൾ — ആരോഗ്യ ആശങ്കകൾ, പിരിമുറുക്കം, വൈകിയ ഗർഭധാരണം.',
      7: 'കുട്ടികളെ ഉണ്ടാക്കുന്നതിലും വളർത്തുന്നതിലും ഒരു പങ്കാളി എങ്ങനെ ഇടപെടുന്നു.',
      8: 'കുട്ടികളെക്കുറിച്ചുള്ള മറഞ്ഞതോ ബുദ്ധിമുട്ടുള്ളതോ ആയ അധ്യായങ്ങൾ; തടസ്സങ്ങളും നഷ്ടങ്ങളും.',
      9: 'നിങ്ങൾ കൈമാറുന്ന മൂല്യങ്ങൾ, ഒരു കുട്ടിയുടെ സൗഭാഗ്യം.',
      10: 'ലോകത്തിലെ ഒരു കുട്ടിയുടെ നിലയും, കുട്ടികൾ നിങ്ങളുടെ ജോലിയിൽ ചെലുത്തുന്ന സ്വാധീനവും.',
      11: 'കുട്ടികളിലൂടെയുള്ള സംതൃപ്തി, അവർ ഒടുവിൽ നിങ്ങൾക്ക് നൽകുന്നത്.',
      12: 'കുട്ടികളിൽ നിന്നുള്ള അകലം, വിദേശത്തുള്ള കുട്ടികൾ, അവരെ വളർത്താൻ ചെലവാകുന്നത്.',
    },
    verdicts: {
      strong: 'കുട്ടികളും സൃഷ്ടിപരമായ ഉൽപാദനവും നന്നായി പിന്തുണയ്ക്കപ്പെടുന്നു',
      workable: 'കുട്ടികളും സൃഷ്ടിപരമായ ഉൽപാദനവും അൽപ്പം ഘർഷണത്തോടെ പ്രായോഗികമാണ്',
      needsEffort: 'കുട്ടികൾക്കും സൃഷ്ടിപരമായ ഉൽപാദനത്തിനും പരിശ്രമം ആവശ്യമാണ്',
    },
    reasonArea: 'കുട്ടികളും നിങ്ങൾ സൃഷ്ടിക്കുന്നതും',
  },
  D12: {
    plainName: 'മാതാപിതാക്കളും പിതൃപരമ്പരയും ചാർട്ട്',
    question: 'നിങ്ങളുടെ മാതാപിതാക്കളിൽ നിന്നും അവർക്ക് പിന്നിലുള്ള തലമുറകളിൽ നിന്നും നിങ്ങൾക്ക് എന്ത് പാരമ്പര്യമായി ലഭിച്ചു?',
    intro: 'ഓരോ രാശിയെയും പന്ത്രണ്ടായി വിഭജിച്ച്, മാതാപിതാക്കൾ, കുടുംബ പരമ്പര, നിങ്ങൾക്ക് കൈമാറിയ മാതൃകകൾ എന്നിവ പരിശോധിക്കുന്നു.',
    lagnaMeaning: 'നിങ്ങളുടെ ജന്മകുടുംബം നിങ്ങൾ ആരാണെന്നത് എത്ര ശക്തമായി രൂപപ്പെടുത്തുന്നു എന്ന് നിശ്ചയിക്കുന്നു.',
    houses: {
      1: 'നിങ്ങളുടെ സ്വന്തം സ്വഭാവത്തിൽ നിങ്ങൾ എത്രത്തോളം മാതാപിതാക്കളെ വഹിക്കുന്നു.',
      2: 'കുടുംബ സമ്പത്ത്, മൂല്യങ്ങൾ, ഭൗതികമായി കൈമാറിയത്.',
      3: 'കുടുംബത്തിന്റെ പരിശ്രമത്തോടുള്ള താൽപര്യം, നിങ്ങളുടെ മാതാപിതാക്കളുടെ സഹോദരങ്ങൾ.',
      4: 'നിങ്ങളുടെ അമ്മ, നിങ്ങളുടെ ബാല്യകാല വീടിന്റെ വൈകാരിക അന്തരീക്ഷം.',
      5: 'പാരമ്പര്യമായി ലഭിച്ച കഴിവും ബുദ്ധിയും; കുടുംബത്തിൽ പതിവായുള്ളത്.',
      6: 'കുടുംബ ഘർഷണം, പാരമ്പര്യമായി ലഭിച്ച ആരോഗ്യ മാതൃകകൾ, പഴയ ബാധ്യതകൾ.',
      7: 'നിങ്ങളുടെ മാതാപിതാക്കളുടെ ബന്ധം പങ്കാളിത്തത്തിൽ നിന്ന് നിങ്ങൾ പ്രതീക്ഷിക്കുന്നതിനെ എങ്ങനെ രൂപപ്പെടുത്തി.',
      8: 'മറഞ്ഞ കുടുംബ ചരിത്രം, രഹസ്യങ്ങൾ, അനന്തരാവകാശ കാര്യങ്ങൾ.',
      9: 'നിങ്ങളുടെ അച്ഛൻ, കുടുംബത്തിന്റെ വിശ്വാസങ്ങൾ, പിതൃപരമ്പര സൗഭാഗ്യം.',
      10: 'കുടുംബപ്പേര്, നിങ്ങളുടെ മാതാപിതാക്കളുടെ നില നിങ്ങളുടേതിനെ എങ്ങനെ ബാധിക്കുന്നു.',
      11: 'കുടുംബ ശൃംഖല നിങ്ങൾക്ക് നേടിത്തരുന്നത്.',
      12: 'കുടുംബ അകലം, കുടിയേറ്റം, നിങ്ങളുടെ പരമ്പരയിൽ നിന്ന് നിങ്ങൾ ഉപേക്ഷിച്ചത്.',
    },
    verdicts: {
      strong: 'നിങ്ങളുടെ കുടുംബ പാരമ്പര്യം ശക്തിയുടെ ഉറവിടമാണ്',
      workable: 'നിങ്ങളുടെ കുടുംബ പാരമ്പര്യം സമ്മിശ്രമാണ്',
      needsEffort: 'നിങ്ങളുടെ കുടുംബ പാരമ്പര്യത്തിന് പരിഹരിക്കാൻ കുറച്ച് ഭാരമുണ്ട്',
    },
    reasonArea: 'നിങ്ങളുടെ കുടുംബം കൈമാറുന്നത്',
  },
  D24: {
    plainName: 'പഠന ചാർട്ട്',
    question: 'നിങ്ങൾ യഥാർത്ഥത്തിൽ എങ്ങനെ പഠിക്കുന്നു, ഔപചാരിക പഠനം നിങ്ങളെ എത്രത്തോളം കൊണ്ടെത്തിക്കുന്നു?',
    intro: 'ഓരോ രാശിയെയും ഇരുപത്തിനാലായി വിഭജിച്ച്, പഠനം, യോഗ്യതകൾ, നിങ്ങളുടെ മനസ്സ് അറിവ് സ്വീകരിക്കുന്ന രീതി എന്നിവ പരിശോധിക്കുന്നു.',
    lagnaMeaning: 'നിങ്ങളുടെ സ്വാഭാവിക പഠന ശൈലിയും പഠനം നിങ്ങൾക്ക് എത്ര എളുപ്പത്തിൽ വരുന്നു എന്നതും നിശ്ചയിക്കുന്നു.',
    houses: {
      1: 'നിങ്ങളുടെ അസംസ്കൃത കഴിവും നിങ്ങൾ ഇഷ്ടപ്പെടുന്ന പഠന രീതിയും.',
      2: 'ഓർമ്മശക്തി — നിങ്ങൾ യഥാർത്ഥത്തിൽ ഓർക്കുന്നതും ഉപയോഗിക്കാൻ കഴിയുന്നതും.',
      3: 'സ്വയം പഠനം, ചെയ്തുകൊണ്ട് നേടിയ കഴിവുകൾ, ഹ്രസ്വ കോഴ്സുകൾ.',
      4: 'സ്കൂൾ വിദ്യാഭ്യാസവും നിങ്ങൾ പഠിച്ച അന്തരീക്ഷവും.',
      5: 'പ്രധാന സൂചകം: ബുദ്ധി, വേഗത്തിലുള്ള ഗ്രാഹ്യം, പരീക്ഷാ കഴിവ്.',
      6: 'മത്സര പഠനം, പ്രവേശന പരീക്ഷകൾ, പഠനം ഒരു കഠിനാധ്വാനമായ ഇടം.',
      7: 'മറ്റുള്ളവരോടൊപ്പം പഠനം — അധ്യാപകർ, പഠന പങ്കാളികൾ, സഹകരണം.',
      8: 'ഗവേഷണം, മറഞ്ഞ വിഷയങ്ങൾ, തടസ്സപ്പെടുന്ന പഠനം.',
      9: 'ഉന്നത വിദ്യാഭ്യാസം, ബിരുദങ്ങൾ, അധ്യാപകർ, വിദേശ പഠനം.',
      10: 'കരിയറാക്കി മാറുന്ന യോഗ്യതകൾ.',
      11: 'നിങ്ങളുടെ വിദ്യാഭ്യാസം നേടിത്തരുന്നത് — ശൃംഖലകൾ, യോഗ്യതാപത്രങ്ങൾ, വരുമാനം.',
      12: 'വീട്ടിൽ നിന്ന് അകലെയുള്ള പഠനം, ഏകാന്ത പഠനം, അതിനുവേണ്ടി മാത്രം തേടുന്ന അറിവ്.',
    },
    verdicts: {
      strong: 'പഠനവും വിദ്യാഭ്യാസവും നിങ്ങൾക്ക് എളുപ്പത്തിൽ വരുന്നു',
      workable: 'പഠനം അൽപ്പം ഘർഷണത്തോടെ പ്രായോഗികമാണ്',
      needsEffort: 'പഠനത്തിനും വിദ്യാഭ്യാസത്തിനും പരിശ്രമം ആവശ്യമാണ്',
    },
    reasonArea: 'നിങ്ങളുടെ പഠനം',
  },
  D30: {
    plainName: 'ദുർബല മേഖലകളുടെ ചാർട്ട്',
    question: 'നിങ്ങൾക്ക് ഏറ്റവും കൂടുതൽ പ്രശ്നത്തിലാകാൻ സാധ്യതയുള്ളത് എവിടെയാണ്, എന്ത് തരത്തിലാണ്?',
    intro: 'ഓരോ രാശിയെയും മുപ്പതായി വിഭജിച്ച് ദുർബലതകൾ വെളിപ്പെടുത്തുന്നു — ജീവിതത്തിലെ ആവർത്തിക്കുന്ന ബുദ്ധിമുട്ടുകളും ധാർമ്മിക സമ്മർദ്ദ പോയിന്റുകളും. ഇത് ശ്രദ്ധിക്കേണ്ടതിന്റെ ഒരു മാപ്പാണ്, ഒരു വിധിയല്ല.',
    lagnaMeaning: 'നിങ്ങളെ കണ്ടെത്താൻ പ്രവണതയുള്ള പ്രശ്നത്തിന്റെ തരവും അതിനോടുള്ള നിങ്ങളുടെ അടിസ്ഥാന പ്രതിരോധശേഷിയും നിശ്ചയിക്കുന്നു.',
    houses: {
      1: 'നിങ്ങളുടെ സ്വന്തം സ്വഭാവത്തിൽ നിന്നും തിരഞ്ഞെടുപ്പുകളിൽ നിന്നും വരുന്ന പ്രശ്നം.',
      2: 'പണ പ്രശ്നം, നിങ്ങളെ ബുദ്ധിമുട്ടിലാക്കുന്ന വാക്കുകൾ.',
      3: 'അധീരതയിൽ നിന്നുള്ള പ്രശ്നം, പ്രായത്തിൽ അടുത്തുള്ളവരുമായുള്ള ഘർഷണം.',
      4: 'ഗാർഹിക അസ്വസ്ഥതയും വീട്ടിൽ സമാധാനക്കുറവും.',
      5: 'അപകടസാധ്യത എടുക്കൽ, പ്രണയം, അല്ലെങ്കിൽ ഊഹക്കച്ചവടത്തിൽ നിന്നുള്ള പ്രശ്നം.',
      6: 'രോഗം, ശത്രുക്കൾ, കടം, നിയമപരമായ ബുദ്ധിമുട്ട് — ക്ലാസിക് പ്രശ്ന ഭാവം.',
      7: 'പങ്കാളികളിലൂടെയും അടുത്ത ബന്ധങ്ങളിലൂടെയും വരുന്ന പ്രശ്നം.',
      8: 'പ്രതിസന്ധി, കോളിളക്കം, മുന്നറിയിപ്പില്ലാതെ വരുന്ന കാര്യങ്ങൾ.',
      9: 'തെറ്റായ വിശ്വാസം, മോശം ഉപദേശം, അല്ലെങ്കിൽ യാത്രയിൽ നിന്നുള്ള പ്രശ്നം.',
      10: 'തൊഴിൽപരമായ തിരിച്ചടികളും പ്രശസ്തിക്ക് കേടുപാടും.',
      11: 'തെറ്റായ കൂട്ടത്തിൽ നിന്നോ, അമിതമായി ആഗ്രഹിക്കുന്നതിൽ നിന്നോ ഉള്ള പ്രശ്നം.',
      12: 'നഷ്ടങ്ങൾ, ഒറ്റപ്പെടൽ, സ്വയം തകർക്കുന്ന ശീലങ്ങൾ.',
    },
    verdicts: {
      strong: 'ഈ ചാർട്ട് ട്രാക്ക് ചെയ്യുന്ന പ്രശ്നങ്ങൾക്കെതിരെ നിങ്ങൾ നന്നായി പ്രതിരോധിക്കപ്പെട്ടിരിക്കുന്നു',
      workable: 'ഈ ചാർട്ട് ട്രാക്ക് ചെയ്യുന്ന പ്രശ്നങ്ങൾക്ക് നിങ്ങൾക്ക് മിതമായ പ്രതിരോധമുണ്ട്',
      needsEffort: 'ഈ ചാർട്ടിന്റെ പ്രശ്നങ്ങൾ മറ്റുള്ളവരെക്കാൾ എളുപ്പത്തിൽ നിങ്ങളെ കണ്ടെത്തുന്നു',
    },
    reasonArea: 'നിങ്ങളുടെ പ്രതിരോധശേഷി',
  },
  D60: {
    plainName: 'ആഴമേറിയ കർമ്മ ചാർട്ട്',
    question: 'മറ്റെല്ലാറ്റിനും അടിയിൽ ഏത് അടിസ്ഥാന മാതൃകയാണ് പ്രവർത്തിക്കുന്നത്?',
    intro: 'ഓരോ രാശിയെയും അറുപതായി വിഭജിക്കുന്നു — ക്ലാസിക്കൽ ജ്യോതിഷം ഉപയോഗിക്കുന്ന ഏറ്റവും സൂക്ഷ്മമായ വിഭജനം. ഇത് ഏറ്റവും ആഴമേറിയ പാളിയായി കണക്കാക്കപ്പെടുന്നു, വിശ്വസനീയമാകാൻ കൃത്യമായ ജനന സമയം ആവശ്യമാണ്.',
    lagnaMeaning: 'ഉപരിതല സാഹചര്യങ്ങൾ എന്തുതന്നെയായാലും, നിങ്ങളുടെ ജീവിതം എപ്പോഴും തിരികെ വരുന്ന അടിസ്ഥാന പ്രമേയം നിശ്ചയിക്കുന്നു.',
    houses: {
      1: 'നിങ്ങൾ ജനിച്ചപ്പോൾ വഹിച്ചിരുന്ന കാതൽ മാതൃക.',
      2: 'സുരക്ഷിതത്വം, മൂല്യം, നിങ്ങൾ മുറുകെപ്പിടിക്കുന്നത് എന്നിവയെക്കുറിച്ചുള്ള ആഴമേറിയ മാതൃകകൾ.',
      3: 'പരിശ്രമം, ഇച്ഛാശക്തി, സ്വയം സ്ഥാപനം എന്നിവയെക്കുറിച്ചുള്ള ആഴമേറിയ മാതൃകകൾ.',
      4: 'ഉൾപ്പെടലും വൈകാരിക സുരക്ഷിതത്വവും സംബന്ധിച്ച ആഴമേറിയ മാതൃകകൾ.',
      5: 'സർഗ്ഗാത്മകത, കുട്ടികൾ, സ്വയം പ്രകടനം എന്നിവയെക്കുറിച്ചുള്ള ആഴമേറിയ മാതൃകകൾ.',
      6: 'ദീർഘകാല ബാധ്യതകൾ, കടങ്ങൾ, നിങ്ങൾ കടപ്പെട്ട സേവനം.',
      7: 'മറ്റുള്ളവരുമായി നിങ്ങൾ എങ്ങനെ ബന്ധം സ്ഥാപിക്കുന്നു എന്നതിലെ ആഴമേറിയ മാതൃകകൾ.',
      8: 'നിങ്ങളുടെ ജീവിതം നിരന്തരം നിങ്ങളെ കടത്തിവിടുന്ന പരിവർത്തനങ്ങൾ.',
      9: 'നിങ്ങളുടെ അടിസ്ഥാന വിശ്വാസങ്ങളും അവയെ പിന്തുടരുന്ന സൗഭാഗ്യവും.',
      10: 'അടിസ്ഥാനപരമായി നിങ്ങൾ ഇവിടെ ചെയ്യാനുള്ള ജോലി.',
      11: 'ആത്യന്തികമായി നിങ്ങൾക്ക് വരുന്നത്, എന്തുകൊണ്ട്.',
      12: 'നിങ്ങൾ പിടിച്ചുവയ്ക്കുന്നതിന് പകരം വിട്ടയക്കേണ്ടത്.',
    },
    verdicts: {
      strong: 'നിങ്ങളുടെ ജീവിതത്തിന് അടിയിലുള്ള ആഴമേറിയ മാതൃക നിങ്ങൾക്ക് അനുകൂലമായി പ്രവർത്തിക്കുന്നു',
      workable: 'നിങ്ങളുടെ ജീവിതത്തിന് അടിയിലുള്ള ആഴമേറിയ മാതൃക സമ്മിശ്രമാണ്',
      needsEffort: 'നിങ്ങളുടെ ജീവിതത്തിന് അടിയിലുള്ള ആഴമേറിയ മാതൃകയ്ക്ക് ബോധപൂർവമായ പ്രവർത്തനം ആവശ്യമാണ്',
    },
    reasonArea: 'നിങ്ങളുടെ ജീവിതത്തിന് അടിയിലുള്ള ആഴമേറിയ മാതൃക',
  },
},
  ja: {
  D2: {
    plainName: '金運チャート',
    question: 'お金は実際のところ、あなたの人生でどう動くのか？',
    intro: '各サインを2つに分割し、収入・保持・損失というお金の側面だけを見る — キャリアとは切り離して。',
    lagnaMeaning: 'お金との基本的な関係を決める：あなたが生まれつき稼ぐタイプか、貯めるタイプか、使うタイプか、与えるタイプかを示す。',
    houses: {
      1: 'お金に対するあなたの直感 — 誰かに助言される前に、自分自身でどう扱うか。',
      2: '実際に蓄積し、保持するもの。貯蓄、貴重品、月末まで残る残高。',
      3: '自分自身の努力とハッスルで稼ぐお金 — 副業、小さな取引、主体性。',
      4: '住宅、土地、車両に結びついたお金。あなたの収入が買う快適さ。',
      5: '投機的なお金 — 投資、市場、賭け、創造的な仕事からの思いがけない収入。',
      6: '負債、ローン、争いや請求書で失うお金。また、地道なサービス業で稼ぐお金でもある。',
      7: 'パートナー、配偶者、共同事業を通じて入ってくるお金。',
      8: 'あなたがコントロールできないお金：相続、保険、税金、他人の資金、突然の損失や利益。',
      9: '幸運なお金 — 幸運、年長者からの支援、旅行や教育からの利益。',
      10: 'あなたの評判と地位のために入ってくるお金。',
      11: '収入と利益。実際に手元に入るものの最も明確な指標。',
      12: 'お金が漏れる場所 — 経費、海外での出費、あなたが手放すもの。',
    },
    verdicts: {
      strong: 'お金はあなたに有利に働く傾向があります',
      workable: 'お金は多少の摩擦はありますが実用的です',
      needsEffort: 'お金は努力を必要とする分野です',
    },
    reasonArea: 'あなたのお金にまつわる生活',
  },
  D3: {
    plainName: '兄弟姉妹と勇気のチャート',
    question: 'あなたにはどれだけの活力があり、兄弟姉妹や仲間はあなたの人生にどう関わっているか？',
    intro: '各サインを3つに分割し、度胸、主体性、兄弟姉妹や親しい仲間との関係を調べる。',
    lagnaMeaning: 'あなたの基本的な度胸を決める — どれだけ積極的に物事を始め、押し返し、自分を信じるか。',
    houses: {
      1: 'あなた自身の勇気と自発的なエネルギー。',
      2: '自分のために声を上げる方法、そして兄弟姉妹がもたらす資源。',
      3: '年下の兄弟姉妹、そして努力とリスクへの生来の意欲。',
      4: '家庭生活があなたの活力を支えるか弱めるか。',
      5: '創造的な度胸 — 何かを作り、それを見せる自信。',
      6: 'ライバル関係と対立、兄弟姉妹との摩擦を含む。',
      7: 'あなたの活力がパートナーとどう表れるか — 協力的か競争的か。',
      8: 'あなたの勇気が危機によって試される場所、そして兄弟姉妹との隠れた緊張。',
      9: '年上の兄弟姉妹、メンター、信念から来る勇気。',
      10: 'あなたの主体性が仕事と社会生活でどう表れるか。',
      11: 'あなたの努力が何をもたらすか、そして築く仲間のネットワーク。',
      12: '活力が失われる場所 — 燃え尽き、孤立、兄弟姉妹との距離。',
    },
    verdicts: {
      strong: 'あなたには確かな活力があり、周囲からの良い支えがあります',
      workable: 'あなたの活力は多少の摩擦はありますが実用的です',
      needsEffort: '活力と兄弟姉妹の支援には努力が必要です',
    },
    reasonArea: 'あなたの活力と兄弟姉妹との絆',
  },
  D4: {
    plainName: '家と不動産のチャート',
    question: 'あなたはどんな家、土地、内なる安心感を築くのか？',
    intro: '各サインを4つに分割し、不動産、ルーツ、家がもたらす落ち着いた満足感を見る。',
    lagnaMeaning: '自分の居場所だと感じられる場所を、どれだけ自然に見つけられるかを決める。',
    houses: {
      1: '落ち着いているという感覚 — 根を張っていると感じるか、常に一時的だと感じるか。',
      2: '資産として保有する不動産、そして家があなたの財政に貢献するもの。',
      3: '引っ越し、短期の転居、努力を要する不動産取引。',
      4: '主要な指標：あなたの実際の家、土地、そしてその中での心の平安。',
      5: '価値が上がる不動産、そしてあなたの家がもたらす喜び。',
      6: '不動産をめぐる争い、住宅ローン、修繕、所有の負担。',
      7: '共同で保有する不動産、そしてパートナーがあなたの住む場所をどう形作るか。',
      8: '相続した不動産、そして住む場所への突然の激変。',
      9: '幸運な不動産、先祖代々の土地、そして出発点から遠く離れた家。',
      10: 'あなたの仕事に関連する不動産、そしてあなたの住所が与える地位。',
      11: '不動産からの利益 — 賃貸、売却、値上がり。',
      12: '海外の不動産、手放した家、そして家を維持するために払う代償。',
    },
    verdicts: {
      strong: '家と不動産はあなたに有利に働く傾向があります',
      workable: '家と不動産は多少の摩擦はありますが実用的です',
      needsEffort: '家と不動産は努力を必要とします',
    },
    reasonArea: '家と不動産',
  },
  D7: {
    plainName: '子どものチャート',
    question: 'あなたと子ども、そしてあなたが創造するものとの関係は？',
    intro: '各サインを7つに分割し、子ども、妊娠力、そしてあなたが生み出し育てるものを調べる。',
    lagnaMeaning: '子どもと創造的な成果があなたの人生にとってどれだけ中心的かを決める。',
    houses: {
      1: '何かを育て、または創造する、あなた自身の能力と意欲。',
      2: '子どもが家庭生活と資源にもたらすもの。',
      3: '子育ての努力、そして子ども同士の関係。',
      4: 'あなたが子どもに与える情緒的な家庭、そしてあなた自身の母性本能。',
      5: '主要な指標：子ども自身、妊娠、そして創造的な成果。',
      6: '子どもをめぐる困難 — 健康の心配、負担、妊娠の遅れ。',
      7: '子どもを持ち育てる上でパートナーがどう関わるか。',
      8: '子どもをめぐる隠れた、または困難な出来事、中断や喪失。',
      9: 'あなたが受け継ぐ価値観、そして子どもの幸運。',
      10: '世界における子どもの地位、そして子どもがあなたの仕事に与える影響。',
      11: '子どもを通じた充足感、そして最終的に子どもがもたらすもの。',
      12: '子どもとの距離、海外にいる子ども、そして育てることの代償。',
    },
    verdicts: {
      strong: '子どもと創造的な成果はよく支えられています',
      workable: '子どもと創造的な成果は多少の摩擦はありますが実用的です',
      needsEffort: '子どもと創造的な成果には努力が必要です',
    },
    reasonArea: '子どもとあなたが創造するもの',
  },
  D12: {
    plainName: '両親と先祖のチャート',
    question: 'あなたは両親とその前の世代から何を受け継いだのか？',
    intro: '各サインを12に分割し、両親、家系、そしてあなたに受け継がれたパターンを調べる。',
    lagnaMeaning: '生まれ育った家族があなたの人格をどれだけ強く形作ったかを決める。',
    houses: {
      1: 'あなた自身の性格の中に、どれだけ両親を受け継いでいるか。',
      2: '家族の富、価値観、そして物質的に受け継いだもの。',
      3: '家族の努力への意欲、そしてあなたの両親の兄弟姉妹。',
      4: 'あなたの母親、そして子ども時代の家庭の情緒的な雰囲気。',
      5: '受け継いだ才能と知性；家系に流れるもの。',
      6: '家族間の摩擦、受け継いだ健康パターン、そして古い義務。',
      7: 'あなたの両親の関係が、パートナーシップへの期待をどう形作ったか。',
      8: '隠された家族の歴史、秘密、そして相続にまつわる事柄。',
      9: 'あなたの父親、家族の信念、そして先祖代々の幸運。',
      10: '家名、そしてあなたの両親の地位があなたにどう影響するか。',
      11: '家族のネットワークがあなたにもたらすもの。',
      12: '家族との距離、移住、そしてあなたが家系から手放したもの。',
    },
    verdicts: {
      strong: 'あなたの家族の遺産は強さの源です',
      workable: 'あなたの家族の遺産は混在しています',
      needsEffort: 'あなたの家族の遺産には取り組むべき重みがあります',
    },
    reasonArea: 'あなたの家族が受け継がせるもの',
  },
  D24: {
    plainName: '学びのチャート',
    question: 'あなたは実際どう学ぶのか、そして正規の学習はどこまであなたを連れて行くのか？',
    intro: '各サインを24に分割し、学習、資格、そしてあなたの心がどう知識を取り入れるかを調べる。',
    lagnaMeaning: 'あなたの自然な学習スタイルと、学習がどれだけ容易に身につくかを決める。',
    houses: {
      1: 'あなたの生来の適性、そして学ぶことを好むスタイル。',
      2: '定着 — 実際に覚えて活用できるもの。',
      3: '独学、実践で身につけたスキル、短期講座。',
      4: '学校教育、そして学んだ環境。',
      5: '主要な指標：知性、理解の速さ、試験能力。',
      6: '競争的な学習、入学試験、そして学びが苦役になる場所。',
      7: '他者との学び — 家庭教師、勉強仲間、共同作業。',
      8: '研究、隠れた分野、そして中断される学び。',
      9: '高等教育、学位、教師、そして留学。',
      10: 'キャリアに転換される資格。',
      11: 'あなたの教育がもたらすもの — 人脈、資格、収入。',
      12: '故郷から遠く離れた学び、孤独な学習、そしてそれ自体のために追求される知識。',
    },
    verdicts: {
      strong: '学習はあなたにとって容易に身につきます',
      workable: '学習は多少の摩擦はありますが実用的です',
      needsEffort: '学習には努力が必要です',
    },
    reasonArea: 'あなたの学び',
  },
  D30: {
    plainName: '弱点のチャート',
    question: 'あなたはどこで、どんな種類のトラブルに遭遇しやすいのか？',
    intro: '各サインを30に分割し、脆弱性を明らかにする — 人生で繰り返される困難と道徳的な圧力点。これは裁定ではなく、注意すべき点の地図です。',
    lagnaMeaning: 'あなたに見つかりやすいトラブルの種類、そしてそれに対する基本的なレジリエンスを決める。',
    houses: {
      1: '自分自身の気質と選択から来るトラブル。',
      2: 'お金のトラブル、そして困難を招く言葉。',
      3: '衝動性からのトラブル、そして年齢の近い人との摩擦。',
      4: '家庭内の不和と家庭の平和の欠如。',
      5: 'リスクを取ること、恋愛、または投機からのトラブル。',
      6: '病気、敵、負債、法的な困難 — 典型的な問題のハウス。',
      7: 'パートナーや親しい関係を通じてもたらされるトラブル。',
      8: '危機、激変、そして予告なくやってくるもの。',
      9: '見当違いの信念、悪い助言、または旅行からのトラブル。',
      10: '職業上の挫折と評判への損害。',
      11: '間違った仲間からのトラブル、または望みすぎることから。',
      12: '喪失、孤立、そして自己を蝕む習慣。',
    },
    verdicts: {
      strong: 'あなたはこのチャートが追跡するトラブルからよく守られています',
      workable: 'あなたはこのチャートが追跡するトラブルに対して中程度の耐性があります',
      needsEffort: 'このチャートのトラブルは、多くの人よりもあなたを見つけやすいです',
    },
    reasonArea: 'あなたのレジリエンス',
  },
  D60: {
    plainName: '深いカルマのチャート',
    question: '他のすべての根底にある、どんなパターンが働いているのか？',
    intro: '各サインを60に分割する — 古典占星術が使う最も細かい区分。これは最も深い層として扱われ、信頼できるものにするには正確な出生時刻が必要です。',
    lagnaMeaning: '表面的な状況が何であれ、あなたの人生が繰り返し立ち返る根底のテーマを決める。',
    houses: {
      1: 'あなたが生まれながらに背負っている核となるパターン。',
      2: '安心感、価値、そしてあなたが手放さないものをめぐる深いパターン。',
      3: '努力、意志、自己主張をめぐる深いパターン。',
      4: '帰属意識と情緒的な安全をめぐる深いパターン。',
      5: '創造性、子ども、自己表現をめぐる深いパターン。',
      6: '長く続く義務、負債、そしてあなたが負っている奉仕。',
      7: '他者との絆の結び方における深いパターン。',
      8: 'あなたの人生が繰り返しあなたを通過させる変容。',
      9: 'あなたの根底にある信念、そしてそれに続く幸運。',
      10: '根底において、あなたがここで行うべき仕事。',
      11: '最終的にあなたにもたらされるもの、そしてその理由。',
      12: 'あなたが保持するのではなく、手放すべきもの。',
    },
    verdicts: {
      strong: 'あなたの人生の根底にある深いパターンはあなたに有利に働いています',
      workable: 'あなたの人生の根底にある深いパターンは混在しています',
      needsEffort: 'あなたの人生の根底にある深いパターンは意識的な取り組みを求めています',
    },
    reasonArea: 'あなたの人生の根底にある深いパターン',
  },
},
  ar: {
  D2: {
    plainName: 'مخطط المال',
    question: 'كيف يتصرف المال فعليًا في حياتك؟',
    intro: 'يقسّم كل برج إلى قسمين للنظر بحتة في كسب المال، الاحتفاظ به وخسارته — بمعزل عن المسيرة المهنية.',
    lagnaMeaning: 'يحدد علاقتك الأساسية بالمال: هل أنت كاسب بطبيعتك، مدّخر، منفق، أم معيل.',
    houses: {
      1: 'غريزتك مع المال — كيف تتعامل معه شخصيًا قبل أن ينصحك أحد.',
      2: 'ما تجمعه وتحتفظ به فعليًا. المدخرات، المقتنيات الثمينة، الرصيد الذي يصمد حتى نهاية الشهر.',
      3: 'المال الذي تكسبه بجهدك واجتهادك الخاص — عمل جانبي، صفقات صغيرة، مبادرة.',
      4: 'المال المرتبط بالمنزل، الأرض والمركبات. الراحة التي يشتريها دخلك.',
      5: 'المال المضارِب — الاستثمارات، الأسواق، الرهانات، والمكاسب المفاجئة من العمل الإبداعي.',
      6: 'الديون، القروض والمال المفقود في النزاعات أو الفواتير. أيضًا المال المكتسب من عمل خدمي شاق.',
      7: 'المال الذي يأتي عبر الشركاء، الأزواج والمشاريع المشتركة.',
      8: 'المال الذي لا تتحكم فيه: الميراث، التأمين، الضرائب، أموال الآخرين، خسارة أو مكسب مفاجئ.',
      9: 'المال المحظوظ — الثروة، دعم الكبار، مكاسب من السفر أو التدريس.',
      10: 'المال الذي يصل بسبب سمعتك ومكانتك.',
      11: 'الدخل والربح. المؤشر الأوضح لما يصل إلى يديك فعليًا.',
      12: 'أين يتسرب المال — النفقات، الإنفاق في الخارج، وما تتبرع به.',
    },
    verdicts: {
      strong: 'يميل المال إلى العمل لصالحك',
      workable: 'المال قابل للعمل، مع بعض الاحتكاك',
      needsEffort: 'المال مجال يتطلب جهدًا',
    },
    reasonArea: 'حياتك المالية',
  },
  D3: {
    plainName: 'مخطط الإخوة والشجاعة',
    question: 'كم من الدافع لديك، وكيف يظهر إخوتك وأقرانك في حياتك؟',
    intro: 'يقسّم كل برج إلى ثلاثة أقسام لفحص الجرأة، المبادرة، وعلاقاتك بالإخوة والأخوات والأقران المقربين.',
    lagnaMeaning: 'يحدد جرأتك الأساسية — مدى استعدادك لبدء الأمور، والرد، ودعم نفسك.',
    houses: {
      1: 'شجاعتك الخاصة وطاقتك على بدء الأمور.',
      2: 'كيف تدافع عن نفسك، والموارد التي يجلبها إخوتك.',
      3: 'الإخوة الأصغر، وشهيتك الخام للجهد والمخاطرة.',
      4: 'ما إذا كانت الحياة المنزلية تدعم دافعك أو تخمده.',
      5: 'الجرأة الإبداعية — الثقة في صنع شيء وعرضه.',
      6: 'التنافس والصراع، بما في ذلك الاحتكاك مع الإخوة.',
      7: 'كيف يظهر دافعك مع الشركاء — تعاونيًا أو تنافسيًا.',
      8: 'أين تُختبر شجاعتك بالأزمات، والتوتر الخفي مع الإخوة.',
      9: 'الإخوة الأكبر، المرشدون، والشجاعة النابعة من الإيمان.',
      10: 'كيف تظهر مبادرتك في العمل والحياة العامة.',
      11: 'ما يكسبه لك جهدك، وشبكة الأقران التي تبنيها.',
      12: 'أين يستنزف الدافع — الإرهاق، العزلة، أو البعد عن الإخوة.',
    },
    verdicts: {
      strong: 'لديك دافع متين، ودعم جيد ممن حولك',
      workable: 'دافعك قابل للعمل، مع بعض الاحتكاك',
      needsEffort: 'الدافع ودعم الإخوة يتطلبان جهدًا',
    },
    reasonArea: 'دافعك وروابطك الأخوية',
  },
  D4: {
    plainName: 'مخطط المنزل والممتلكات',
    question: 'أي نوع من المنزل، الأرض والأمان الداخلي تبنيه؟',
    intro: 'يقسّم كل برج إلى أربعة أقسام للنظر في الممتلكات، الجذور، والرضا المستقر الذي يوفره المنزل.',
    lagnaMeaning: 'يحدد مدى سهولة إيجادك لمكان يشعرك بأنه ملكك.',
    houses: {
      1: 'إحساسك بالاستقرار — هل تشعر بالتجذر أم بالمؤقت الدائم.',
      2: 'الممتلكات كأصل، وما يسهم به المنزل في أموالك.',
      3: 'الانتقال بين المنازل، التنقلات القصيرة، وصفقات الممتلكات التي تتطلب جهدًا.',
      4: 'المؤشر الرئيسي: منزلك الفعلي، أرضك، وراحة بالك فيه.',
      5: 'الممتلكات التي تزداد قيمتها، والفرح الذي يجلبه منزلك.',
      6: 'نزاعات الممتلكات، الرهون العقارية، الإصلاحات وأعباء الملكية.',
      7: 'الممتلكات المملوكة بشكل مشترك، وكيف يشكّل الشريك مكان إقامتك.',
      8: 'الممتلكات الموروثة، والاضطرابات المفاجئة في مكان إقامتك.',
      9: 'الممتلكات المحظوظة، الأرض الموروثة عن الأجداد، والمنازل البعيدة عن نقطة انطلاقك.',
      10: 'الممتلكات المرتبطة بعملك، والمكانة التي يمنحها عنوانك.',
      11: 'المكاسب من الممتلكات — الإيجار، البيع، ارتفاع القيمة.',
      12: 'الممتلكات في الخارج، المنازل التي تُركت، وما تكلفه صيانة المنزل.',
    },
    verdicts: {
      strong: 'يميل المنزل والممتلكات إلى العمل لصالحك',
      workable: 'المنزل والممتلكات قابلان للعمل، مع بعض الاحتكاك',
      needsEffort: 'المنزل والممتلكات يتطلبان جهدًا',
    },
    reasonArea: 'المنزل والممتلكات',
  },
  D7: {
    plainName: 'مخطط الأطفال',
    question: 'ما علاقتك بالأطفال وبما تبدعه؟',
    intro: 'يقسّم كل برج إلى سبعة أقسام لفحص الأطفال، الخصوبة، والأشياء التي تُحضرها إلى الوجود وترعاها.',
    lagnaMeaning: 'يحدد مدى محورية الأطفال والإنتاج الإبداعي في حياتك.',
    houses: {
      1: 'قدرتك وشهيتك الخاصة لتربية أو خلق شيء ما.',
      2: 'ما يضيفه الأطفال إلى حياة الأسرة ومواردها.',
      3: 'جهد تربية الأطفال، والعلاقات بينهم.',
      4: 'البيت العاطفي الذي تمنحه لطفل، وغريزتك الأمومية الخاصة.',
      5: 'المؤشر الرئيسي: الأطفال أنفسهم، الحمل، والإنتاج الإبداعي.',
      6: 'صعوبات تتعلق بالأطفال — مخاوف صحية، توتر، تأخر الحمل.',
      7: 'كيف يظهر الشريك في إنجاب الأطفال وتربيتهم.',
      8: 'فصول خفية أو صعبة تتعلق بالأطفال؛ انقطاعات وخسائر.',
      9: 'القيم التي تورّثها، وحظ الطفل الجيد.',
      10: 'مكانة الطفل في العالم، وتأثير الأطفال على عملك.',
      11: 'الإشباع من خلال الأطفال، وما يجلبونه لك في النهاية.',
      12: 'البعد عن الأطفال، الأطفال في الخارج، وتكلفة تربيتهم.',
    },
    verdicts: {
      strong: 'الأطفال والإنتاج الإبداعي مدعومان جيدًا',
      workable: 'الأطفال والإنتاج الإبداعي قابلان للعمل، مع بعض الاحتكاك',
      needsEffort: 'الأطفال والإنتاج الإبداعي يتطلبان جهدًا',
    },
    reasonArea: 'الأطفال وما تبدعه',
  },
  D12: {
    plainName: 'مخطط الوالدين والأجداد',
    question: 'ماذا ورثت من والديك والأجيال التي سبقتهم؟',
    intro: 'يقسّم كل برج إلى اثني عشر قسمًا لفحص الوالدين، النسب العائلي، والأنماط الموروثة إليك.',
    lagnaMeaning: 'يحدد مدى قوة تشكيل أسرتك الأصلية لمن أصبحت عليه.',
    houses: {
      1: 'مدى حملك لوالديك في شخصيتك الخاصة.',
      2: 'ثروة الأسرة، قيمها، وما وُرِّث ماديًا.',
      3: 'شهية الأسرة للجهد، وإخوة والديك.',
      4: 'أمك، والمناخ العاطفي لبيت طفولتك.',
      5: 'الموهبة والذكاء الموروثان؛ ما يسري في الأسرة.',
      6: 'احتكاك الأسرة، الأنماط الصحية الموروثة، والالتزامات القديمة.',
      7: 'كيف شكّلت علاقة والديك ما تتوقعه من الشراكة.',
      8: 'تاريخ العائلة الخفي، الأسرار، ومسائل الميراث.',
      9: 'أبوك، معتقدات الأسرة، والحظ الموروث عن الأجداد.',
      10: 'اسم العائلة، وكيف تؤثر مكانة والديك على مكانتك.',
      11: 'ما تكسبه لك شبكة العائلة.',
      12: 'بعد العائلة، الهجرة، وما تخليت عنه من نسبك.',
    },
    verdicts: {
      strong: 'إرثك العائلي مصدر قوة',
      workable: 'إرثك العائلي مختلط',
      needsEffort: 'إرثك العائلي يحمل بعض الثقل الذي يجب العمل عليه',
    },
    reasonArea: 'ما تورّثه عائلتك',
  },
  D24: {
    plainName: 'مخطط التعلّم',
    question: 'كيف تتعلم فعليًا، وإلى أي مدى يأخذك التعليم الرسمي؟',
    intro: 'يقسّم كل برج إلى أربعة وعشرين قسمًا لفحص الدراسة، المؤهلات، وكيف يستوعب عقلك المعرفة.',
    lagnaMeaning: 'يحدد أسلوب تعلمك الطبيعي ومدى سهولة الدراسة بالنسبة لك.',
    houses: {
      1: 'قدرتك الخام وكيف تفضل التعلم.',
      2: 'الاستيعاب — ما تتذكره فعليًا ويمكنك استخدامه.',
      3: 'التعلّم الذاتي، المهارات المكتسَبة بالممارسة، الدورات القصيرة.',
      4: 'التعليم المدرسي والبيئة التي درست فيها.',
      5: 'المؤشر الرئيسي: الذكاء، سرعة الفهم، القدرة على الامتحانات.',
      6: 'الدراسة التنافسية، امتحانات القبول، وحيث يكون التعلم شاقًا.',
      7: 'التعلّم مع الآخرين — المعلمون الخصوصيون، رفقاء الدراسة، التعاون.',
      8: 'البحث، المواضيع الخفية، والدراسة التي تتعرض للانقطاع.',
      9: 'التعليم العالي، الشهادات، المعلمون والدراسة في الخارج.',
      10: 'المؤهلات التي تتحول إلى مسيرة مهنية.',
      11: 'ما يكسبه لك تعليمك — الشبكات، الاعتمادات، الدخل.',
      12: 'الدراسة بعيدًا عن الوطن، التعلم الانفرادي، والمعرفة المسعية لذاتها.',
    },
    verdicts: {
      strong: 'تأتيك الدراسة والتعلم بسهولة',
      workable: 'الدراسة قابلة للعمل، مع بعض الاحتكاك',
      needsEffort: 'الدراسة والتعلم يتطلبان جهدًا',
    },
    reasonArea: 'تعلّمك',
  },
  D30: {
    plainName: 'مخطط نقاط الضعف',
    question: 'أين من المرجح أن تواجه مشكلة، وأي نوع؟',
    intro: 'يقسّم كل برج إلى ثلاثين قسمًا لكشف نقاط الضعف — الصعوبات المتكررة ونقاط الضغط الأخلاقي في الحياة. إنه خريطة لما يجب مراقبته، وليس حكمًا نهائيًا.',
    lagnaMeaning: 'يحدد نوع المشكلة التي تميل إلى إيجادك، ومرونتك الأساسية تجاهها.',
    houses: {
      1: 'المشكلة النابعة من مزاجك وخياراتك الخاصة.',
      2: 'مشاكل مالية، وكلمات تُوقعك في صعوبة.',
      3: 'مشاكل الاندفاعية، والاحتكاك مع الأقرب إليك سنًا.',
      4: 'اضطراب منزلي وغياب السلام في البيت.',
      5: 'مشاكل من المخاطرة، الرومانسية، أو المضاربة.',
      6: 'المرض، الأعداء، الديون والصعوبات القانونية — بيت المشاكل الكلاسيكي.',
      7: 'مشاكل تصل عبر الشركاء والعلاقات الوثيقة.',
      8: 'الأزمات، الاضطرابات، والأمور التي تصل بلا سابق إنذار.',
      9: 'مشاكل من إيمان في غير محله، نصيحة سيئة، أو السفر.',
      10: 'نكسات مهنية وضرر بالسمعة.',
      11: 'مشاكل من رفقة سيئة، أو من الرغبة في الكثير.',
      12: 'خسائر، عزلة، وعادات تقوّض الذات.',
    },
    verdicts: {
      strong: 'أنت محصّن جيدًا ضد المشاكل التي يتتبعها هذا المخطط',
      workable: 'لديك مقاومة معتدلة للمشاكل التي يتتبعها هذا المخطط',
      needsEffort: 'مشاكل هذا المخطط تجدك أسهل من معظم الناس',
    },
    reasonArea: 'مرونتك',
  },
  D60: {
    plainName: 'مخطط الكارما العميقة',
    question: 'ما النمط الكامن الذي يجري تحت كل شيء آخر؟',
    intro: 'يقسّم كل برج إلى ستين قسمًا — أدق تقسيم يستخدمه التنجيم الكلاسيكي. يُعامَل كأعمق طبقة، ويحتاج وقت ميلاد دقيق ليكون موثوقًا.',
    lagnaMeaning: 'يحدد الموضوع الكامن الذي تعود إليه حياتك دائمًا، مهما كانت الظروف السطحية.',
    houses: {
      1: 'النمط الجوهري الذي وُلدت حاملاً إياه.',
      2: 'أنماط عميقة حول الأمان، القيمة، وما تتشبث به.',
      3: 'أنماط عميقة حول الجهد، الإرادة، وتأكيد الذات.',
      4: 'أنماط عميقة حول الانتماء والأمان العاطفي.',
      5: 'أنماط عميقة حول الإبداع، الأطفال، والتعبير عن الذات.',
      6: 'التزامات طويلة الأمد، ديون وخدمة مستحقة عليك.',
      7: 'أنماط عميقة في كيفية ارتباطك بالآخرين.',
      8: 'التحولات التي تستمر حياتك في دفعك خلالها.',
      9: 'معتقداتك الكامنة والحظ الذي يتبعها.',
      10: 'العمل الذي أنت، في العمق، هنا لتؤديه.',
      11: 'ما يصلك في النهاية، ولماذا.',
      12: 'ما يُفترض أن تتركه بدلاً من التمسك به.',
    },
    verdicts: {
      strong: 'النمط العميق تحت حياتك يجري لصالحك',
      workable: 'النمط العميق تحت حياتك مختلط',
      needsEffort: 'النمط العميق تحت حياتك يتطلب عملاً واعيًا',
    },
    reasonArea: 'النمط العميق تحت حياتك',
  },
},
  ko: {
  D2: {
    plainName: '재물 차트',
    question: '실제로 당신의 삶에서 돈은 어떻게 작용하나요?',
    intro: '모든 별자리를 둘로 나누어 경력과는 별개로 순수하게 돈을 벌고, 지키고, 잃는 것을 살펴봅니다.',
    lagnaMeaning: '돈에 대한 당신의 기본적인 관계를 정합니다: 타고난 소득자, 저축가, 소비자, 또는 부양자인지.',
    houses: {
      1: '돈에 대한 당신의 본능 — 누군가 조언하기 전에 당신이 직접 그것을 다루는 방식.',
      2: '실제로 축적하고 지키는 것. 저축, 귀중품, 한 달을 버티는 잔고.',
      3: '스스로의 노력과 부지런함으로 버는 돈 — 부업, 소소한 거래, 주도성.',
      4: '집, 땅, 차량에 묶인 돈. 당신의 소득이 사주는 안락함.',
      5: '투기적인 돈 — 투자, 시장, 도박, 창작 활동에서 오는 뜻밖의 수입.',
      6: '부채, 대출, 분쟁이나 청구서로 잃는 돈. 또한 고된 서비스 노동으로 버는 돈.',
      7: '파트너, 배우자, 공동 사업을 통해 들어오는 돈.',
      8: '당신이 통제할 수 없는 돈: 상속, 보험, 세금, 타인의 자금, 갑작스러운 손실이나 이득.',
      9: '행운의 돈 — 행운, 손윗사람의 지원, 여행이나 가르침에서 오는 이익.',
      10: '당신의 평판과 지위 때문에 들어오는 돈.',
      11: '소득과 이익. 실제로 손에 들어오는 것을 가장 명확하게 보여주는 지표.',
      12: '돈이 새어나가는 곳 — 지출, 해외 소비, 그리고 나눠주는 것.',
    },
    verdicts: {
      strong: '돈이 당신에게 유리하게 작용하는 경향이 있습니다',
      workable: '돈은 다룰 만하며, 약간의 마찰이 있습니다',
      needsEffort: '돈은 노력이 필요한 영역입니다',
    },
    reasonArea: '당신의 금전 생활',
  },
  D3: {
    plainName: '형제자매와 용기 차트',
    question: '당신은 얼마나 많은 추진력을 가지고 있으며, 형제자매와 동료들이 당신의 삶에서 어떤 역할을 하나요?',
    intro: '모든 별자리를 셋으로 나누어 담력, 주도성, 그리고 형제자매와 가까운 동료와의 관계를 살펴봅니다.',
    lagnaMeaning: '당신의 기본적인 담력을 정합니다 — 얼마나 쉽게 일을 시작하고, 맞서고, 스스로를 뒷받침하는지.',
    houses: {
      1: '당신 자신의 용기와 자발적인 에너지.',
      2: '자신을 위해 목소리를 내는 방식과, 형제자매가 가져다주는 자원.',
      3: '손아래 형제자매, 그리고 노력과 위험에 대한 당신의 원초적인 욕구.',
      4: '가정생활이 당신의 추진력을 지지하는지 억누르는지.',
      5: '창의적인 담력 — 무언가를 만들어 보여줄 수 있는 자신감.',
      6: '경쟁과 갈등, 형제자매와의 마찰을 포함.',
      7: '당신의 추진력이 파트너와 어떻게 나타나는지 — 협력적인지 경쟁적인지.',
      8: '당신의 용기가 위기로 시험받는 곳, 그리고 형제자매와의 숨겨진 긴장.',
      9: '손위 형제자매, 멘토, 그리고 믿음에서 오는 용기.',
      10: '당신의 주도성이 일과 공적인 삶에서 어떻게 드러나는지.',
      11: '당신의 노력이 얻게 해주는 것, 그리고 당신이 쌓는 동료 네트워크.',
      12: '추진력이 소진되는 곳 — 번아웃, 고립, 또는 형제자매와의 거리.',
    },
    verdicts: {
      strong: '당신은 탄탄한 추진력을 가지고 있으며, 주변 사람들의 좋은 지지를 받습니다',
      workable: '당신의 추진력은 다룰 만하며, 약간의 마찰이 있습니다',
      needsEffort: '추진력과 형제자매의 지지에 노력이 필요합니다',
    },
    reasonArea: '당신의 추진력과 형제자매 관계',
  },
  D4: {
    plainName: '집과 부동산 차트',
    question: '당신은 어떤 종류의 집, 땅, 내면의 안정을 만들어가나요?',
    intro: '모든 별자리를 넷으로 나누어 부동산, 뿌리, 그리고 집이 주는 정착된 만족감을 살펴봅니다.',
    lagnaMeaning: '자신의 것처럼 느껴지는 장소를 얼마나 자연스럽게 찾는지를 정합니다.',
    houses: {
      1: '정착되어 있다는 느낌 — 뿌리내렸다고 느끼는지 계속 임시적이라고 느끼는지.',
      2: '자산으로서 보유한 부동산, 그리고 집이 당신의 재정에 기여하는 것.',
      3: '이사, 짧은 이전, 그리고 노력이 필요한 부동산 거래.',
      4: '주요 지표: 당신의 실제 집, 땅, 그리고 그 안에서의 마음의 평화.',
      5: '가치가 오르는 부동산, 그리고 집이 주는 기쁨.',
      6: '부동산 분쟁, 대출, 수리, 그리고 소유의 부담.',
      7: '공동으로 보유한 부동산, 그리고 파트너가 사는 곳을 어떻게 형성하는지.',
      8: '상속받은 부동산, 그리고 사는 곳의 갑작스러운 격변.',
      9: '행운의 부동산, 조상의 땅, 그리고 출발점에서 먼 집.',
      10: '당신의 일과 연결된 부동산, 그리고 주소가 부여하는 지위.',
      11: '부동산에서 오는 이득 — 임대료, 매각, 가치 상승.',
      12: '해외 부동산, 손에서 놓은 집, 그리고 집을 유지하는 데 드는 비용.',
    },
    verdicts: {
      strong: '집과 부동산이 당신에게 유리하게 작용하는 경향이 있습니다',
      workable: '집과 부동산은 다룰 만하며, 약간의 마찰이 있습니다',
      needsEffort: '집과 부동산은 노력이 필요합니다',
    },
    reasonArea: '집과 부동산',
  },
  D7: {
    plainName: '자녀 차트',
    question: '자녀와, 당신이 창조하는 것과의 관계는 어떤가요?',
    intro: '모든 별자리를 일곱으로 나누어 자녀, 생식력, 그리고 당신이 존재하게 하고 길러내는 것들을 살펴봅니다.',
    lagnaMeaning: '자녀와 창조적 결과물이 당신의 삶에서 얼마나 중심적인지를 정합니다.',
    houses: {
      1: '무언가를 기르거나 창조하는 당신 자신의 능력과 욕구.',
      2: '자녀가 가정생활과 자원에 더하는 것.',
      3: '자녀를 기르는 노력, 그리고 그들 사이의 관계.',
      4: '당신이 자녀에게 주는 정서적 안식처, 그리고 당신 자신의 모성 본능.',
      5: '주요 지표: 자녀 자체, 임신, 그리고 창조적 결과물.',
      6: '자녀를 둘러싼 어려움 — 건강 걱정, 긴장, 지연된 임신.',
      7: '파트너가 자녀를 갖고 기르는 데 어떻게 관여하는지.',
      8: '자녀를 둘러싼 숨겨지거나 어려운 장; 중단과 상실.',
      9: '당신이 물려주는 가치, 그리고 자녀의 행운.',
      10: '세상에서의 자녀의 위치, 그리고 자녀가 당신의 일에 미치는 영향.',
      11: '자녀를 통한 성취감, 그리고 그들이 결국 당신에게 가져다주는 것.',
      12: '자녀와의 거리, 해외에 있는 자녀, 그리고 그들을 기르는 데 드는 비용.',
    },
    verdicts: {
      strong: '자녀와 창조적 결과물이 잘 지지받고 있습니다',
      workable: '자녀와 창조적 결과물은 다룰 만하며, 약간의 마찰이 있습니다',
      needsEffort: '자녀와 창조적 결과물에 노력이 필요합니다',
    },
    reasonArea: '자녀와 당신이 창조하는 것',
  },
  D12: {
    plainName: '부모와 조상 차트',
    question: '당신은 부모와 그 이전 세대로부터 무엇을 물려받았나요?',
    intro: '모든 별자리를 열둘로 나누어 부모, 가문의 혈통, 그리고 당신에게 전해진 패턴을 살펴봅니다.',
    lagnaMeaning: '당신의 원가족이 지금의 당신을 얼마나 강하게 형성했는지를 정합니다.',
    houses: {
      1: '당신 자신의 성격에 부모를 얼마나 담고 있는지.',
      2: '가문의 재산, 가치관, 그리고 물질적으로 전해진 것.',
      3: '노력에 대한 가문의 욕구, 그리고 부모의 형제자매.',
      4: '당신의 어머니, 그리고 어린 시절 가정의 정서적 분위기.',
      5: '물려받은 재능과 지능; 가문에 흐르는 것.',
      6: '가문의 마찰, 물려받은 건강 패턴, 그리고 오래된 의무.',
      7: '부모의 관계가 파트너십에 대한 당신의 기대를 어떻게 형성했는지.',
      8: '숨겨진 가족사, 비밀, 그리고 상속 문제.',
      9: '당신의 아버지, 가문의 신념, 그리고 조상의 행운.',
      10: '가문의 이름, 그리고 부모의 지위가 당신에게 미치는 영향.',
      11: '가문의 네트워크가 당신에게 얻게 해주는 것.',
      12: '가족과의 거리, 이주, 그리고 당신이 혈통에서 놓아버린 것.',
    },
    verdicts: {
      strong: '당신의 가문의 유산은 힘의 원천입니다',
      workable: '당신의 가문의 유산은 혼합적입니다',
      needsEffort: '당신의 가문의 유산은 헤쳐나가야 할 무게를 지니고 있습니다',
    },
    reasonArea: '당신의 가문이 물려주는 것',
  },
  D24: {
    plainName: '학습 차트',
    question: '당신은 실제로 어떻게 배우며, 정규 학업은 당신을 얼마나 멀리 데려가나요?',
    intro: '모든 별자리를 스물넷으로 나누어 학업, 자격, 그리고 당신의 마음이 지식을 받아들이는 방식을 살펴봅니다.',
    lagnaMeaning: '당신의 타고난 학습 스타일과 학업이 얼마나 쉽게 다가오는지를 정합니다.',
    houses: {
      1: '당신의 원초적인 적성과 선호하는 학습 방식.',
      2: '기억력 — 실제로 기억하고 활용할 수 있는 것.',
      3: '독학, 실행하며 익힌 기술, 단기 과정.',
      4: '학교 교육과 배웠던 환경.',
      5: '주요 지표: 지능, 빠른 이해력, 시험 능력.',
      6: '경쟁적인 학업, 입학 시험, 그리고 학습이 고된 곳.',
      7: '다른 사람과 함께하는 학습 — 튜터, 스터디 파트너, 협업.',
      8: '연구, 숨겨진 과목, 그리고 중단되는 학업.',
      9: '고등 교육, 학위, 스승, 그리고 해외 유학.',
      10: '경력으로 이어지는 자격.',
      11: '교육이 당신에게 얻게 해주는 것 — 네트워크, 자격증, 소득.',
      12: '집에서 먼 곳에서의 학업, 고독한 학습, 그리고 그 자체를 위해 추구하는 지식.',
    },
    verdicts: {
      strong: '학업과 배움이 당신에게 쉽게 다가옵니다',
      workable: '학업은 다룰 만하며, 약간의 마찰이 있습니다',
      needsEffort: '학업과 배움에 노력이 필요합니다',
    },
    reasonArea: '당신의 학업',
  },
  D30: {
    plainName: '약점 차트',
    question: '당신은 어디서 어떤 종류의 어려움을 겪기 가장 쉬운가요?',
    intro: '모든 별자리를 서른으로 나누어 취약점 — 삶에서 반복되는 어려움과 도덕적 압박 지점을 드러냅니다. 이것은 판결이 아니라 주시해야 할 것들의 지도입니다.',
    lagnaMeaning: '당신을 찾아오는 경향이 있는 어려움의 종류와, 그것에 대한 당신의 기본적인 회복력을 정합니다.',
    houses: {
      1: '당신 자신의 기질과 선택에서 오는 어려움.',
      2: '금전 문제, 그리고 당신을 곤란하게 만드는 말.',
      3: '충동에서 오는 어려움, 그리고 나이가 비슷한 사람들과의 마찰.',
      4: '가정의 불안과 집에서의 평화 부족.',
      5: '위험 감수, 연애, 또는 투기에서 오는 어려움.',
      6: '질병, 적, 부채, 법적 어려움 — 전형적인 문제 하우스.',
      7: '파트너와 가까운 관계를 통해 오는 어려움.',
      8: '위기, 격변, 그리고 예고 없이 찾아오는 것들.',
      9: '잘못된 믿음, 나쁜 조언, 또는 여행에서 오는 어려움.',
      10: '직업적 좌절과 평판 손상.',
      11: '잘못된 무리에서 오는 어려움, 또는 너무 많은 것을 원하는 데서 오는 어려움.',
      12: '손실, 고립, 그리고 자기 파괴적인 습관.',
    },
    verdicts: {
      strong: '당신은 이 차트가 추적하는 어려움들로부터 잘 방어되어 있습니다',
      workable: '당신은 이 차트가 추적하는 어려움들에 대해 어느 정도의 저항력을 가지고 있습니다',
      needsEffort: '이 차트의 어려움들이 대부분의 사람보다 당신을 더 쉽게 찾아옵니다',
    },
    reasonArea: '당신의 회복력',
  },
  D60: {
    plainName: '깊은 카르마 차트',
    question: '다른 모든 것 아래에서 어떤 근본적인 패턴이 흐르고 있나요?',
    intro: '모든 별자리를 예순으로 나눕니다 — 고전 점성술이 사용하는 가장 세밀한 분할입니다. 가장 깊은 층으로 다뤄지며, 신뢰할 수 있으려면 정확한 출생 시각이 필요합니다.',
    lagnaMeaning: '표면적인 상황이 어떻든 당신의 삶이 계속 돌아오는 근본적인 주제를 정합니다.',
    houses: {
      1: '당신이 태어날 때부터 지니고 있던 핵심 패턴.',
      2: '안정, 가치, 그리고 당신이 붙잡고 있는 것에 관한 깊은 패턴.',
      3: '노력, 의지, 자기주장에 관한 깊은 패턴.',
      4: '소속감과 정서적 안전에 관한 깊은 패턴.',
      5: '창의성, 자녀, 자기표현에 관한 깊은 패턴.',
      6: '오래 지속되는 의무, 부채, 그리고 당신이 갚아야 할 봉사.',
      7: '다른 사람과 유대를 맺는 방식에 관한 깊은 패턴.',
      8: '당신의 삶이 계속해서 겪게 하는 변형들.',
      9: '당신의 근본적인 신념과 그것을 따르는 행운.',
      10: '근본적으로 당신이 여기서 하도록 되어 있는 일.',
      11: '궁극적으로 당신에게 오는 것과 그 이유.',
      12: '붙잡기보다 놓아버리도록 되어 있는 것.',
    },
    verdicts: {
      strong: '당신 삶 아래의 깊은 패턴이 당신에게 유리하게 흐릅니다',
      workable: '당신 삶 아래의 깊은 패턴은 혼합적입니다',
      needsEffort: '당신 삶 아래의 깊은 패턴은 의식적인 노력을 요구합니다',
    },
    reasonArea: '당신 삶 아래의 깊은 패턴',
  },
},
};

/** `VARGA_PLAIN[code]`, overlaid with a translation for `lang` when one exists. */
export function plainMeaningFor(code: VargaCode, lang: Lang): VargaPlainMeaning | undefined {
  if (lang === 'en') return VARGA_PLAIN[code];
  return VARGA_PLAIN_TR[lang]?.[code] ?? VARGA_PLAIN[code];
}

// ─── Plain-language planet effects ─────────────────────────────────────────

/** What each planet does, in ordinary words. */
const PLANET_PLAIN: Record<string, Record<Lang, string>> = {
  Sun: {
    en: 'drive, authority and the wish to be recognised', si: 'උත්සාහය, අධිකාරය හා පිළිගැනීමට ඇති ආශාව',
    ta: 'உந்துதல், அதிகாரம் மற்றும் அங்கீகாரம் பெற வேண்டும் என்ற ஆசை', zh: '干劲、权威与渴望被认可',
    hi: 'प्रेरणा, अधिकार और पहचान पाने की चाह', ja: '推進力、権威、そして認められたいという願望',
    ko: '추진력, 권위, 그리고 인정받고 싶은 욕구', ar: 'الدافع، السلطة، والرغبة في التقدير',
    ml: 'പ്രചോദനം, അധികാരം, അംഗീകാരം ലഭിക്കാനുള്ള ആഗ്രഹം',
  },
  Moon: {
    en: 'feelings, comfort-seeking and the need for security', si: 'හැඟීම්, සුවපහසුව සෙවීම හා ආරක්ෂාව සඳහා ඇති අවශ්‍යතාව',
    ta: 'உணர்வுகள், ஆறுதல் தேடல் மற்றும் பாதுகாப்பு தேவை', zh: '情感、寻求安逸与安全感的需要',
    hi: 'भावनाएँ, सुख की तलाश और सुरक्षा की आवश्यकता', ja: '感情、安らぎを求める気持ち、そして安心の必要性',
    ko: '감정, 안락함을 찾는 마음, 그리고 안정에 대한 필요', ar: 'المشاعر، البحث عن الراحة، والحاجة إلى الأمان',
    ml: 'വികാരങ്ങൾ, സുഖം തേടൽ, സുരക്ഷിതത്വത്തിന്റെ ആവശ്യം',
  },
  Mars: {
    en: 'energy, push and a willingness to fight for it', si: 'ශක්තිය, තල්ලුව හා ඒ සඳහා සටන් කිරීමට ඇති කැමැත්ත',
    ta: 'சக்தி, முன்னேற்றம் மற்றும் அதற்காகப் போராடும் மனநிலை', zh: '精力、冲劲与为之奋战的意志',
    hi: 'ऊर्जा, जोश और उसके लिए लड़ने की इच्छा', ja: 'エネルギー、推進力、そしてそのために戦う意志',
    ko: '에너지, 추진력, 그리고 그것을 위해 싸우려는 의지', ar: 'الطاقة، الاندفاع، والاستعداد للنضال من أجل ما يريد',
    ml: 'ഊർജ്ജം, മുന്നേറ്റം, അതിനായി പോരാടാനുള്ള സന്നദ്ധത',
  },
  Mercury: {
    en: 'thinking, talking and dealmaking', si: 'සිතීම, කතාබහ හා ගනුදෙනු කිරීම',
    ta: 'சிந்தனை, பேச்சு மற்றும் பேரம் பேசுதல்', zh: '思考、言谈与交易磋商',
    hi: 'सोच, बातचीत और सौदेबाज़ी', ja: '思考、会話、そして駆け引き',
    ko: '사고, 대화, 그리고 거래 성사', ar: 'التفكير، الحديث، وعقد الصفقات',
    ml: 'ചിന്ത, സംസാരം, ഇടപാടുകൾ',
  },
  Jupiter: {
    en: 'growth, generosity and good judgement', si: 'වර්ධනය, ත්‍යාගශීලීත්වය හා යහපත් තීන්දුව',
    ta: 'வளர்ச்சி, தாராள மனப்பான்மை மற்றும் நல்ல தீர்மானம்', zh: '成长、慷慨与良好的判断力',
    hi: 'विकास, उदारता और अच्छा निर्णय', ja: '成長、寛大さ、そして良識ある判断',
    ko: '성장, 관대함, 그리고 좋은 판단력', ar: 'النمو، الكرم، وحسن التقدير',
    ml: 'വളർച്ച, ഔദാര്യം, നല്ല വിവേചനബുദ്ധി',
  },
  Venus: {
    en: 'enjoyment, taste and the pull towards ease and beauty', si: 'ප්‍රීතිය, රුචිය හා පහසුව සහ සුන්දරත්වය කරා ඇති ඇදීම',
    ta: 'இன்பம், ரசனை மற்றும் எளிமை மற்றும் அழகின் மீதான ஈர்ப்பு', zh: '享受、品味与对舒适和美的向往',
    hi: 'आनंद, अभिरुचि और सहजता व सुंदरता की ओर खिंचाव', ja: '楽しみ、審美眼、そして安らぎと美への傾き',
    ko: '즐거움, 취향, 그리고 편안함과 아름다움에 대한 끌림', ar: 'المتعة، الذوق، والانجذاب نحو الراحة والجمال',
    ml: 'ആസ്വാദനം, അഭിരുചി, സൗകര്യത്തിലേക്കും സൗന്ദര്യത്തിലേക്കുമുള്ള ആകർഷണം',
  },
  Saturn: {
    en: 'patience, restriction and the long slow grind', si: 'ඉවසීම, සීමා කිරීම හා දිගු මන්දගාමී වෙහෙස',
    ta: 'பொறுமை, கட்டுப்பாடு மற்றும் நீண்ட மெதுவான உழைப்பு', zh: '耐心、约束与漫长而缓慢的磨砺',
    hi: 'धैर्य, संयम और लंबा धीमा परिश्रम', ja: '忍耐、制約、そして長く緩やかな努力',
    ko: '인내, 제약, 그리고 길고 느린 노력', ar: 'الصبر، التقييد، والكدح البطيء الطويل',
    ml: 'ക്ഷമ, നിയന്ത്രണം, ദീർഘവും മന്ദഗതിയിലുള്ളതുമായ അധ്വാനം',
  },
  Rahu: {
    en: 'hunger, ambition and a pull towards the unconventional', si: 'තෘෂ්ණාව, අභිලාෂය හා සම්ප්‍රදායට වෙනස් දෑ කරා ඇදීම',
    ta: 'பேராசை, லட்சியம் மற்றும் வழக்கத்திற்கு மாறான ஈர்ப்பு', zh: '渴望、野心与对非常规事物的吸引',
    hi: 'लालसा, महत्वाकांक्षा और अपरंपरागत की ओर खिंचाव', ja: '渇望、野心、そして型破りなものへの引力',
    ko: '갈망, 야망, 그리고 비관습적인 것에 대한 끌림', ar: 'التوق، الطموح، والانجذاب نحو غير المألوف',
    ml: 'ആർത്തി, മോഹം, പാരമ്പര്യേതരമായതിലേക്കുള്ള ആകർഷണം',
  },
  Ketu: {
    en: 'detachment, specialisation and a tendency to lose interest', si: 'වෙන්වීම, විශේෂීකරණය හා උනන්දුව නැති කරගැනීමේ ප්‍රවණතාව',
    ta: 'பற்றின்மை, சிறப்பு வாய்ந்த ஈடுபாடு மற்றும் ஆர்வம் இழக்கும் போக்கு', zh: '超然、专精与容易失去兴趣的倾向',
    hi: 'वैराग्य, विशेषज्ञता और रुचि खोने की प्रवृत्ति', ja: '執着のなさ、専門性、そして興味を失いやすい傾向',
    ko: '초연함, 전문화, 그리고 흥미를 쉽게 잃는 경향', ar: 'اللامبالاة، التخصص، والميل إلى فقدان الاهتمام',
    ml: 'വിരക്തി, പ്രത്യേകവൽക്കരണം, താൽപര്യം നഷ്ടപ്പെടാനുള്ള പ്രവണത',
  },
};

/** How well the planet can express itself where it sits. */
const DIGNITY_PLAIN: Record<DignityLevel, Record<Lang, string>> = {
  'exalted': {
    en: 'It is at full strength here, so this works unusually well for you.',
    si: 'මෙහි එය පූර්ණ ශක්තියෙන් සිටී, එබැවින් මෙය ඔබට විශිෂ්ට ලෙස ක්‍රියා කරයි.',
    ta: 'இங்கு முழு பலத்துடன் உள்ளது, எனவே இது உங்களுக்கு விதிவிலக்காக நன்றாக வேலை செய்கிறது.',
    zh: '在此处力量达到巅峰，因此这方面对你格外有利。',
    hi: 'यहाँ यह पूरी शक्ति में है, इसलिए यह आपके लिए असाधारण रूप से अच्छा काम करता है.',
    ja: 'ここでは最大の力を発揮しており、そのためこの面は驚くほどうまく働く。',
    ko: '여기서 최고조의 힘을 발휘하므로, 이 부분은 유난히 잘 풀린다.',
    ar: 'هنا في أوج قوته، لذا يعمل هذا الجانب لصالحك بشكل استثنائي.',
    ml: 'ഇവിടെ പൂർണ്ണ ശക്തിയിലാണ്, അതിനാൽ ഇത് നിങ്ങൾക്ക് അസാധാരണമാം വിധം നന്നായി പ്രവർത്തിക്കുന്നു.',
  },
  'own-sign': {
    en: 'It is on home ground here, so this works steadily and reliably.',
    si: 'මෙහි එය තමන්ගේම බිමේ සිටී, එබැවින් මෙය ස්ථාවරව හා විශ්වාසදායක ලෙස ක්‍රියා කරයි.',
    ta: 'இங்கு தன் சொந்த இடத்தில் உள்ளது, எனவே இது நிலையாகவும் நம்பகமாகவும் வேலை செய்கிறது.',
    zh: '在此处如同回到本宫，因此这方面稳定可靠。',
    hi: 'यहाँ यह अपने घर में है, इसलिए यह स्थिर और भरोसेमंद ढंग से काम करता है.',
    ja: 'ここでは本拠地にいるようなもので、そのためこの面は安定して確実に働く。',
    ko: '여기서 제자리를 찾은 듯 안정적이고 신뢰할 수 있게 작용한다.',
    ar: 'هنا في دياره، لذا يعمل هذا الجانب بثبات وموثوقية.',
    ml: 'ഇവിടെ സ്വന്തം നിലയിലാണ്, അതിനാൽ ഇത് സ്ഥിരതയോടെയും വിശ്വസനീയമായും പ്രവർത്തിക്കുന്നു.',
  },
  'friend-sign': {
    en: 'It is well supported here, so this generally goes your way.',
    si: 'මෙහි එයට හොඳ සහාය ලැබේ, එබැවින් මෙය සාමාන්‍යයෙන් ඔබට හිතකර වේ.',
    ta: 'இங்கு நல்ல ஆதரவுடன் உள்ளது, எனவே இது பொதுவாக உங்களுக்குச் சாதகமாக அமையும்.',
    zh: '在此处获得良好支持，因此这方面通常对你有利。',
    hi: 'यहाँ इसे अच्छा सहारा मिलता है, इसलिए यह आम तौर पर आपके पक्ष में जाता है.',
    ja: 'ここでは良い支えを得ており、そのためこの面はおおむね有利に運ぶ。',
    ko: '여기서 좋은 지지를 받아 대체로 유리하게 흘러간다.',
    ar: 'هنا يحظى بدعم جيد، لذا يميل هذا الجانب عمومًا لصالحك.',
    ml: 'ഇവിടെ നല്ല പിന്തുണയുണ്ട്, അതിനാൽ ഇത് പൊതുവെ നിങ്ങൾക്ക് അനുകൂലമാകും.',
  },
  'neutral-sign': {
    en: 'It is neither helped nor hindered here — results are about average.',
    si: 'මෙහි එයට උපකාරයක් හෝ බාධාවක් නොමැත — ප්‍රතිඵල දළ වශයෙන් සාමාන්‍යයි.',
    ta: 'இங்கு உதவியும் தடையும் இல்லை — முடிவுகள் சராசரியாக இருக்கும்.',
    zh: '在此处既无助力也无阻力——结果大致平平。',
    hi: 'यहाँ इसे न मदद मिलती है न बाधा — परिणाम औसत रहते हैं.',
    ja: 'ここでは助けも妨げもなく——結果は平均的なものになる。',
    ko: '여기서는 돕지도 방해하지도 않아 — 결과는 평범한 수준이다.',
    ar: 'هنا لا يُعان ولا يُعرقل — تأتي النتائج متوسطة.',
    ml: 'ഇവിടെ സഹായവുമില്ല തടസ്സവുമില്ല — ഫലങ്ങൾ ശരാശരിയാണ്.',
  },
  'enemy-sign': {
    en: 'It is under strain here, so results need more effort than they should.',
    si: 'මෙහි එය පීඩනයට ලක්ව ඇත, එබැවින් ප්‍රතිඵලවලට තිබිය යුතුවාට වඩා වෙහෙසක් අවශ්‍යයි.',
    ta: 'இங்கு அழுத்தத்தில் உள்ளது, எனவே முடிவுகளுக்கு தேவைக்கு அதிகமான முயற்சி தேவை.',
    zh: '在此处承受压力，因此结果需要付出比预期更多的努力。',
    hi: 'यहाँ यह दबाव में है, इसलिए परिणामों के लिए ज़रूरत से अधिक प्रयास चाहिए.',
    ja: 'ここでは緊張を受けており、そのため結果には想定以上の努力が必要になる。',
    ko: '여기서 압박을 받아, 결과를 얻으려면 예상보다 더 많은 노력이 필요하다.',
    ar: 'هنا تحت ضغط، لذا تحتاج النتائج جهدًا أكبر مما ينبغي.',
    ml: 'ഇവിടെ സമ്മർദ്ദത്തിലാണ്, അതിനാൽ ഫലങ്ങൾക്ക് വേണ്ടതിലും കൂടുതൽ പരിശ്രമം ആവശ്യമാണ്.',
  },
  'debilitated': {
    en: 'It is weakened here. This is a sore spot, and it improves only with conscious work.',
    si: 'මෙහි එය දුර්වල වේ. මෙය වේදනාකාරී තැනකි, එය දියුණු වන්නේ සවිඥානික උත්සාහයෙන් පමණි.',
    ta: 'இங்கு பலவீனமாக உள்ளது. இது ஒரு பாதிக்கப்பட்ட பகுதி, உணர்வுபூர்வமான முயற்சியால் மட்டுமே மேம்படும்.',
    zh: '在此处力量被削弱。这是一个薄弱环节，只有通过自觉的努力才能改善。',
    hi: 'यहाँ यह कमज़ोर पड़ जाता है. यह एक संवेदनशील बिंदु है, और सचेत प्रयास से ही सुधरता है.',
    ja: 'ここでは弱められている。これは弱点であり、意識的な努力によってのみ改善する。',
    ko: '여기서 약화된다. 이는 취약한 지점이며, 의식적인 노력을 통해서만 개선된다.',
    ar: 'هنا يضعف. هذه نقطة حساسة، ولا تتحسن إلا بجهد واعٍ.',
    ml: 'ഇവിടെ ദുർബലമാകുന്നു. ഇതൊരു വേദനാജനകമായ പോയിന്റാണ്, ബോധപൂർവമായ പ്രയത്നത്തിലൂടെ മാത്രമേ ഇത് മെച്ചപ്പെടൂ.',
  },
};

const DIGNITY_RANK: Record<DignityLevel, number> = {
  'exalted': 2, 'own-sign': 1.5, 'friend-sign': 0.75,
  'neutral-sign': 0, 'enemy-sign': -1, 'debilitated': -2,
};

/**
 * A plain sentence for one planet sitting in a house of a varga.
 *
 * Deliberately says nothing about what the house means — the panel states that
 * once, above the planet list. Repeating it per planet is how the old reading
 * became unreadable.
 */
const BRINGS_FRAME: Record<Lang, (planet: string, role: string) => string> = {
  en: (p, r) => `${p} brings ${r}.`,
  si: (p, r) => `${p} ${r} ගෙන එයි.`,
  ta: (p, r) => `${p} ${r} ஐக் கொண்டுவருகிறது.`,
  zh: (p, r) => `${p} 带来${r}。`,
  hi: (p, r) => `${p} ${r} लाता है.`,
  ja: (p, r) => `${p}は${r}をもたらす。`,
  ko: (p, r) => `${p}은 ${r}을 가져온다.`,
  ar: (p, r) => `${p} يجلب ${r}.`,
  ml: (p, r) => `${p} ${r} കൊണ്ടുവരുന്നു.`,
};

const RETRO_NOTE: Record<Lang, string> = {
  en: ' Being retrograde, its results tend to arrive late, or on a second attempt.',
  si: ' වක්‍රව ගමන් කරන බැවින්, එහි ප්‍රතිඵල ප්‍රමාද වී හෝ දෙවන උත්සාහයේදී පැමිණේ.',
  ta: ' வக்கிரமாக இருப்பதால், அதன் முடிவுகள் தாமதமாக அல்லது இரண்டாவது முயற்சியில் வரக்கூடும்.',
  zh: '由于逆行，其结果往往会延迟到来，或需在第二次尝试时才实现。',
  hi: ' वक्री होने के कारण, इसके परिणाम देर से या दूसरे प्रयास में मिलते हैं.',
  ja: '逆行しているため、その結果は遅れて、あるいは二度目の試みで訪れる傾向がある。',
  ko: '역행 중이므로, 그 결과는 늦게 오거나 두 번째 시도에서 찾아오는 경향이 있다.',
  ar: ' كونه راجعًا، تميل نتائجه إلى الوصول متأخرة، أو في المحاولة الثانية.',
  ml: ' വക്രഗതിയിലായതിനാൽ, അതിന്റെ ഫലങ്ങൾ വൈകിയോ രണ്ടാം ശ്രമത്തിലോ എത്താൻ സാധ്യതയുണ്ട്.',
};

const KARAKA_NOTE: Record<Lang, (role: string) => string> = {
  en: role => ` This is the key planet for this chart — it stands for ${role}, so its condition here counts for more than any other placement.`,
  si: role => ` මෙය මෙම කේන්දරයේ ප්‍රධාන ග්‍රහයාය — එය ${role} නියෝජනය කරයි, එබැවින් මෙහි එහි තත්ත්වය වෙනත් ඕනෑම පිහිටීමකට වඩා වැදගත් වේ.`,
  ta: role => ` இது இந்த ஜாதகத்தின் முக்கிய கிரகம் — இது ${role} ஐக் குறிக்கிறது, எனவே இங்குள்ள அதன் நிலை மற்ற எந்த அமைவையும் விட முக்கியமானது.`,
  zh: role => `这是这张图的关键行星——它代表着${role}，因此它在此处的状态比任何其他配置都更重要。`,
  hi: role => ` यह इस कुंडली का प्रमुख ग्रह है — यह ${role} का प्रतिनिधित्व करता है, इसलिए यहाँ इसकी स्थिति किसी भी अन्य स्थिति से अधिक मायने रखती है.`,
  ja: role => `これはこのチャートの鍵となる惑星である——${role}を象徴しており、ここでのその状態は他のどの配置よりも重要である。`,
  ko: role => `이것은 이 차트의 핵심 행성이다 — ${role}을 상징하며, 여기서의 상태는 다른 어떤 배치보다 더 중요하다.`,
  ar: role => ` هذا هو الكوكب الرئيسي لهذا المخطط — يمثل ${role}، لذا حالته هنا أهم من أي وضع آخر.`,
  ml: role => ` ഇത് ഈ ജാതകത്തിന്റെ പ്രധാന ഗ്രഹമാണ് — ഇത് ${role} നെ പ്രതിനിധീകരിക്കുന്നു, അതിനാൽ ഇവിടെയുള്ള അതിന്റെ അവസ്ഥ മറ്റേതൊരു സ്ഥാനത്തേക്കാളും പ്രധാനമാണ്.`,
};

export function plainPlanetEffect(
  planet: string,
  dignity: DignityLevel,
  isRetrograde: boolean,
  /** When given, flags the planet if it is this chart's significator. */
  code?: VargaCode,
  lang: Lang = 'en',
): string {
  const role = PLANET_PLAIN[planet]?.[lang] ?? PLANET_PLAIN[planet]?.en ?? 'its own significations';
  const retroNote = isRetrograde ? RETRO_NOTE[lang] : '';

  // The chart's karaka carries more weight than any other planet in it, and a
  // reader has no way to know that unless it is said.
  const karakaRole = code ? karakaRoleFor(code, planet, lang) : null;
  const karakaNote = karakaRole ? KARAKA_NOTE[lang](karakaRole) : '';

  return `${BRINGS_FRAME[lang](planet, role)} ${DIGNITY_PLAIN[dignity][lang]}${retroNote}${karakaNote}`;
}

// ─── Karakas — each chart's significator planet ────────────────────────────

export interface VargaKaraka {
  planet: string;
  /** What this planet stands for inside this chart, in plain words. */
  role: Record<Lang, string>;
}

/**
 * The classical significator(s) for each divisional chart. Judging a varga
 * begins with its karaka: Jupiter's condition in the Saptamsa says more about
 * children than any single house does. Weighted above ordinary placements in
 * the verdict, and flagged in the house readings.
 */
export const VARGA_KARAKAS: Partial<Record<VargaCode, VargaKaraka[]>> = {
  D2: [{ planet: 'Jupiter', role: {
    en: 'wealth and abundance', si: 'ධනය හා සමෘද්ධිය', ta: 'செல்வம் மற்றும் வளம்', zh: '财富与丰盛',
    hi: 'धन और समृद्धि', ja: '富と豊かさ', ko: '부와 풍요', ar: 'الثروة والوفرة', ml: 'സമ്പത്തും സമൃദ്ധിയും',
  } }],
  D3: [{ planet: 'Mars', role: {
    en: 'courage and siblings', si: 'ධෛර්යය හා සහෝදර සහෝදරියන්', ta: 'தைரியம் மற்றும் உடன்பிறப்புகள்', zh: '勇气与兄弟姐妹',
    hi: 'साहस और भाई-बहन', ja: '勇気と兄弟姉妹', ko: '용기와 형제자매', ar: 'الشجاعة والإخوة', ml: 'ധൈര്യവും സഹോദരങ്ങളും',
  } }],
  D4: [
    { planet: 'Moon', role: {
      en: 'home and contentment', si: 'නිවස හා තෘප්තිය', ta: 'வீடு மற்றும் மனநிறைவு', zh: '家与满足感',
      hi: 'घर और संतोष', ja: '家庭と満足感', ko: '가정과 만족감', ar: 'المنزل والرضا', ml: 'വീടും സംതൃപ്തിയും',
    } },
    { planet: 'Mars', role: {
      en: 'land and property', si: 'ඉඩම් හා දේපළ', ta: 'நிலம் மற்றும் சொத்து', zh: '土地与产业',
      hi: 'भूमि और संपत्ति', ja: '土地と不動産', ko: '토지와 재산', ar: 'الأرض والممتلكات', ml: 'ഭൂമിയും സ്വത്തും',
    } },
  ],
  D7: [{ planet: 'Jupiter', role: {
    en: 'children and fertility', si: 'දරුවන් හා සරුභාවය', ta: 'குழந்தைகள் மற்றும் கருவுறுதிறன்', zh: '子女与生育力',
    hi: 'संतान और प्रजनन क्षमता', ja: '子供と妊娠力', ko: '자녀와 임신 능력', ar: 'الأطفال والخصوبة', ml: 'കുട്ടികളും ഫലഭൂയിഷ്ഠതയും',
  } }],
  D12: [
    { planet: 'Sun', role: {
      en: 'your father', si: 'ඔබේ පියා', ta: 'உங்கள் தந்தை', zh: '你的父亲',
      hi: 'आपके पिता', ja: 'あなたの父親', ko: '당신의 아버지', ar: 'والدك', ml: 'നിങ്ങളുടെ അച്ഛൻ',
    } },
    { planet: 'Moon', role: {
      en: 'your mother', si: 'ඔබේ මව', ta: 'உங்கள் தாய்', zh: '你的母亲',
      hi: 'आपकी माँ', ja: 'あなたの母親', ko: '당신의 어머니', ar: 'والدتك', ml: 'നിങ്ങളുടെ അമ്മ',
    } },
  ],
  D24: [
    { planet: 'Mercury', role: {
      en: 'intellect and study', si: 'බුද්ධිය හා අධ්‍යයනය', ta: 'அறிவு மற்றும் கல்வி', zh: '才智与学习',
      hi: 'बुद्धि और अध्ययन', ja: '知性と学問', ko: '지성과 학업', ar: 'الفكر والدراسة', ml: 'ബുദ്ധിയും പഠനവും',
    } },
    { planet: 'Jupiter', role: {
      en: 'wisdom and higher learning', si: 'ප්‍රඥාව හා උසස් අධ්‍යාපනය', ta: 'ஞானம் மற்றும் உயர்கல்வி', zh: '智慧与高等教育',
      hi: 'बुद्धिमत्ता और उच्च शिक्षा', ja: '知恵と高等教育', ko: '지혜와 고등 교육', ar: 'الحكمة والتعليم العالي', ml: 'ജ്ഞാനവും ഉന്നത വിദ്യാഭ്യാസവും',
    } },
  ],
  D30: [{ planet: 'Saturn', role: {
    en: 'endurance under adversity', si: 'දුෂ්කරතා යටතේ ඉවසීම', ta: 'துன்பத்தில் தாங்கிக்கொள்ளும் தன்மை', zh: '逆境中的坚韧',
    hi: 'विपरीत परिस्थितियों में सहनशीलता', ja: '逆境における忍耐力', ko: '역경 속의 인내력', ar: 'الصمود في الشدائد', ml: 'പ്രതികൂല സാഹചര്യങ്ങളിലെ സഹനശക്തി',
  } }],
  D60: [{ planet: 'Jupiter', role: {
    en: 'accumulated karma', si: 'සමුච්චිත කර්මය', ta: 'குவிந்த கர்மா', zh: '累积的业力',
    hi: 'संचित कर्म', ja: '蓄積されたカルマ', ko: '축적된 카르마', ar: 'الكارما المتراكمة', ml: 'സഞ്ചിത കർമ്മം',
  } }],
};

export function karakaRoleFor(code: VargaCode, planet: string, lang: Lang = 'en'): string | null {
  const role = VARGA_KARAKAS[code]?.find(k => k.planet === planet)?.role;
  return role ? (role[lang] ?? role.en) : null;
}

// ─── Overall verdict for a whole divisional chart ──────────────────────────

export type VargaStanding = 'strong' | 'workable' | 'needs-effort';

export interface VargaVerdict {
  standing: VargaStanding;
  /** Plain headline, e.g. "Money is a well-supported area for you". */
  headline: string;
  /** Two or three plain sentences explaining the headline. */
  summary: string;
  /** The specific placements the verdict rests on. */
  reasons: string[];
}

export interface VerdictPlanet {
  planet: string;
  dignity: DignityLevel;
  /** House this planet occupies in this varga (1–12). */
  house: number;
}

/** Sentence frames for `vargaVerdict`'s reasons, headline fallback and summary. */
const VERDICT_TEXT = {
  karakaStrong: (planet: string, role: string, atFullStrength: boolean, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${planet} — මෙම කේන්දරයේ ${role} නියෝජනය කරන ග්‍රහයා — මෙහි ${atFullStrength ? 'පූර්ණ ශක්තියෙන්' : 'තමන්ගේම බිමේ'} සිටී. මෙය මෙම කේන්දරයට දැක්විය හැකි හොඳම ලකුණයි.`;
      case 'ta': return `${planet} — இந்த ஜாதகத்தில் ${role} ஐக் குறிக்கும் கிரகம் — இங்கு ${atFullStrength ? 'முழு பலத்துடன்' : 'சொந்த இடத்தில்'} உள்ளது. இது இந்த ஜாதகம் காட்டக்கூடிய சிறந்த அடையாளம்.`;
      case 'zh': return `${planet}——这张图中代表${role}的行星——在此处${atFullStrength ? '力量达到巅峰' : '如同回到本宫'}。这是这份星盘所能展现的最好迹象。`;
      case 'hi': return `${planet} — इस कुंडली में ${role} का प्रतिनिधित्व करने वाला ग्रह — यहाँ ${atFullStrength ? 'पूरी शक्ति में' : 'अपने घर में'} है. यह इस कुंडली का सबसे अच्छा संकेत है.`;
      case 'ja': return `${planet}——このチャートで${role}を象徴する惑星——はここで${atFullStrength ? '最大の力を発揮して' : '本拠地にいるように'}いる。これはこのチャートが示せる最良の兆しである。`;
      case 'ko': return `${planet} — 이 차트에서 ${role}을 상징하는 행성 — 은 여기서 ${atFullStrength ? '최고조의 힘을 발휘하고' : '제자리를 찾고'} 있다. 이는 이 차트가 보여줄 수 있는 최고의 징표다.`;
      case 'ar': return `${planet} — الكوكب الذي يمثل ${role} في هذا المخطط — في ${atFullStrength ? 'أوج قوته' : 'دياره'} هنا. هذه أفضل إشارة يمكن أن تُظهرها هذه الخريطة.`;
      case 'ml': return `${planet} — ഈ ജാതകത്തിൽ ${role} നെ പ്രതിനിധീകരിക്കുന്ന ഗ്രഹം — ഇവിടെ ${atFullStrength ? 'പൂർണ്ണ ശക്തിയിലാണ്' : 'സ്വന്തം നിലയിലാണ്'}. ഈ ജാതകത്തിന് കാണിക്കാൻ കഴിയുന്ന ഏറ്റവും നല്ല സൂചനയാണിത്.`;
      default: return `${planet} — the planet that stands for ${role} in this chart — is ${atFullStrength ? 'at full strength' : 'on home ground'} here. That is the single best sign this chart can show.`;
    }
  },
  karakaWeak: (planet: string, role: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${planet} — මෙම කේන්දරයේ ${role} නියෝජනය කරන ග්‍රහයා — මෙහි දුර්වල වේ. මෙය වෙනත් ඕනෑම පිහිටීමකට වඩා වැදගත් වේ: මෙම අංශය ප්‍රමාද වී හෝ සැබෑ උත්සාහයෙන් වර්ධනය වේ යැයි අපේක්ෂා කරන්න, සම්පූර්ණයෙන් ප්‍රතික්ෂේප වේ යැයි නොව.`;
      case 'ta': return `${planet} — இந்த ஜாதகத்தில் ${role} ஐக் குறிக்கும் கிரகம் — இங்கு பலவீனமாக உள்ளது. இது மற்ற எந்த அமைவையும் விட முக்கியமானது: இந்தப் பகுதி தாமதமாக அல்லது உண்மையான முயற்சியால் வளரும் என எதிர்பாருங்கள், முற்றிலும் மறுக்கப்படும் என்று அல்ல.`;
      case 'zh': return `${planet}——这张图中代表${role}的行星——在此处被削弱。这比任何其他配置都更重要：预计这方面会较晚发展，或需通过真正的努力才能实现，而不是被彻底否定。`;
      case 'hi': return `${planet} — इस कुंडली में ${role} का प्रतिनिधित्व करने वाला ग्रह — यहाँ कमज़ोर है. यह किसी भी अन्य स्थिति से अधिक मायने रखता है: उम्मीद करें कि यह क्षेत्र देर से या वास्तविक प्रयास से विकसित होगा, पूरी तरह नकारा नहीं जाएगा.`;
      case 'ja': return `${planet}——このチャートで${role}を象徴する惑星——はここで弱められている。これは他のどの配置よりも重要である：この分野は遅れて、あるいは本当の努力を通じて発展すると考えるべきで、完全に否定されるわけではない。`;
      case 'ko': return `${planet} — 이 차트에서 ${role}을 상징하는 행성 — 은 여기서 약화되어 있다. 이는 다른 어떤 배치보다 중요하다: 이 영역은 늦게, 또는 진정한 노력을 통해 발전할 것으로 예상해야 하며, 완전히 부정되는 것은 아니다.`;
      case 'ar': return `${planet} — الكوكب الذي يمثل ${role} في هذا المخطط — ضعيف هنا. هذا أهم من أي وضع آخر: توقع أن يتطور هذا الجانب متأخرًا أو بجهد حقيقي، لا أن يُحرم منه كليًا.`;
      case 'ml': return `${planet} — ഈ ജാതകത്തിൽ ${role} നെ പ്രതിനിധീകരിക്കുന്ന ഗ്രഹം — ഇവിടെ ദുർബലമാണ്. ഇത് മറ്റേതൊരു സ്ഥാനത്തേക്കാളും പ്രധാനമാണ്: ഈ മേഖല വൈകിയോ യഥാർത്ഥ പരിശ്രമത്തിലൂടെയോ വളരുമെന്ന് പ്രതീക്ഷിക്കുക, പൂർണ്ണമായി നിഷേധിക്കപ്പെടില്ല.`;
      default: return `${planet} — the planet that stands for ${role} in this chart — is weakened here. This matters more than any other placement: expect this area to develop late or through real effort, not to be denied outright.`;
    }
  },
  karakaTrouble: (planet: string, role: string, area: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${planet}, ${role} නියෝජනය කරන, මෙම කේන්දරයේ දුෂ්කර භාවයන්ගෙන් එකක වැටේ — ${area} සාමාන්‍යයෙන් විසඳීමට වඩා කළමනාකරණය කළ යුතු අඛණ්ඩ සංකූලතාවක් උසුලයි.`;
      case 'ta': return `${role} ஐக் குறிக்கும் ${planet}, இந்த ஜாதகத்தின் கடினமான வீடுகளில் ஒன்றில் விழுகிறது — ${area} பொதுவாக தீர்க்கப்பட வேண்டியதை விட நிர்வகிக்கப்பட வேண்டிய தொடர்ச்சியான சிக்கலைக் கொண்டு வருகிறது.`;
      case 'zh': return `代表${role}的${planet}落在这张图的困难宫位之一——${area}往往伴随着需要持续管理而非彻底解决的复杂状况。`;
      case 'hi': return `${role} का प्रतिनिधित्व करने वाला ${planet} इस कुंडली के कठिन भावों में से एक में गिरता है — ${area} में अक्सर एक चलती हुई जटिलता होती है जिसे सुलझाने के बजाय संभालने की ज़रूरत होती है.`;
      case 'ja': return `${role}を象徴する${planet}は、このチャートの困難な室の一つに位置している——${area}は解決すべきというより、管理し続けるべき複雑さを伴う傾向がある。`;
      case 'ko': return `${role}을 상징하는 ${planet}은 이 차트의 어려운 하우스 중 하나에 위치한다 — ${area}는 해결하기보다는 관리해야 하는 지속적인 복잡함을 동반하는 경향이 있다.`;
      case 'ar': return `${planet}، الذي يمثل ${role}، يقع في أحد البيوت الصعبة لهذا المخطط — يميل ${area} إلى حمل تعقيد مستمر يحتاج إلى إدارة أكثر من حله.`;
      case 'ml': return `${role} നെ പ്രതിനിധീകരിക്കുന്ന ${planet}, ഈ ജാതകത്തിലെ പ്രയാസകരമായ ഭാവങ്ങളിലൊന്നിൽ വീഴുന്നു — ${area} പരിഹരിക്കുന്നതിനേക്കാൾ കൈകാര്യം ചെയ്യേണ്ട തുടർച്ചയായ സങ്കീർണത വഹിക്കുന്നു.`;
      default: return `${planet}, which stands for ${role}, falls in one of this chart's difficult houses — ${area} tends to carry an ongoing complication that needs managing rather than solving.`;
    }
  },
  anchorStrong: (planet: string, area: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${planet}, එහි ලග්න අධිපති ලෙස මෙම මුළු කේන්දරයම නංගුරයේ තබන, ප්‍රබලව ස්ථානගත වී ඇත — තනි කොටස් වෙව්ලුවත් ${area} යටතේ ඇති පදනම ස්ථිරයි.`;
      case 'ta': return `${planet}, இந்த முழு ஜாதகத்தையும் அதன் லக்ன அதிபதியாக நங்கூரமிடும், வலுவாக நிலைநிறுத்தப்பட்டுள்ளது — தனிப்பட்ட பகுதிகள் அசைந்தாலும் ${area} இன் அடித்தளம் உறுதியானது.`;
      case 'zh': return `${planet}作为这张图上升点的主宰、锚定整张星图，处于强势位置——即使个别部分有所动摇，${area}的根基依然稳固。`;
      case 'hi': return `${planet}, जो इस पूरी कुंडली को अपने लग्न स्वामी के रूप में स्थिर करता है, प्रबल स्थिति में है — भले ही अलग-अलग हिस्से डगमगाएँ, ${area} की नींव मज़बूत है.`;
      case 'ja': return `このチャート全体のラグナロードとして支柱となる${planet}は強く配置されている——個々の部分が揺らいでも、${area}の土台は堅固である。`;
      case 'ko': return `이 차트 전체를 라그나 로드로서 지탱하는 ${planet}은 강하게 배치되어 있다 — 개별 부분이 흔들려도 ${area}의 토대는 견고하다.`;
      case 'ar': return `${planet}، الذي يُرسي هذا المخطط بأكمله بوصفه رب الطالع، في وضع قوي — أساس ${area} متين حتى عندما تتزعزع أجزاء فردية.`;
      case 'ml': return `ഈ മുഴുവൻ ജാതകത്തെയും ലഗ്ന അധിപനായി ഉറപ്പിക്കുന്ന ${planet}, ശക്തമായി സ്ഥാനം പിടിച്ചിരിക്കുന്നു — വ്യക്തിഗത ഭാഗങ്ങൾ ഉലഞ്ഞാലും ${area} ന്റെ അടിത്തറ ഭദ്രമാണ്.`;
      default: return `${planet}, which anchors this whole chart as its rising-sign ruler, is strongly placed — the foundation under ${area} is solid even when individual parts wobble.`;
    }
  },
  anchorWeak: (planet: string, area: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${planet}, එහි ලග්න අධිපති ලෙස මෙම මුළු කේන්දරයම නංගුරයේ තබන, පීඩනයට ලක්ව ඇත — ${area} ගොඩනැගීමට පෙර ශක්තිමත් කළ යුතු පදනමක් මත රඳා පවතී.`;
      case 'ta': return `${planet}, இந்த முழு ஜாதகத்தையும் அதன் லக்ன அதிபதியாக நங்கூரமிடும், அழுத்தத்தில் உள்ளது — ${area} கட்டமைப்பதற்கு முன் பலப்படுத்த வேண்டிய அடித்தளத்தில் தங்கியுள்ளது.`;
      case 'zh': return `${planet}作为这张图上升点的主宰、锚定整张星图，正承受压力——${area}所依托的根基需要先加固，才能在其上继续建设。`;
      case 'hi': return `${planet}, जो इस पूरी कुंडली को अपने लग्न स्वामी के रूप में स्थिर करता है, दबाव में है — ${area} एक ऐसी नींव पर टिका है जिसे मज़बूत बनाने की ज़रूरत है, इससे पहले कि उस पर आगे निर्माण हो.`;
      case 'ja': return `このチャート全体のラグナロードとして支柱となる${planet}は圧力を受けている——${area}はその上に築く前に補強が必要な土台の上に成り立っている。`;
      case 'ko': return `이 차트 전체를 라그나 로드로서 지탱하는 ${planet}은 압박을 받고 있다 — ${area}는 그 위에 쌓아 올리기 전에 보강이 필요한 토대 위에 놓여 있다.`;
      case 'ar': return `${planet}، الذي يُرسي هذا المخطط بأكمله بوصفه رب الطالع، تحت ضغط — يقوم ${area} على أساس يحتاج إلى تدعيم قبل البناء عليه.`;
      case 'ml': return `ഈ മുഴുവൻ ജാതകത്തെയും ലഗ്ന അധിപനായി ഉറപ്പിക്കുന്ന ${planet}, സമ്മർദ്ദത്തിലാണ് — ${area} കെട്ടിപ്പടുക്കുന്നതിന് മുമ്പ് ബലപ്പെടുത്തേണ്ട ഒരു അടിത്തറയിലാണ് നിലകൊള്ളുന്നത്.`;
      default: return `${planet}, which anchors this whole chart as its rising-sign ruler, is under pressure — ${area} rests on a foundation that needs shoring up before building on it.`;
    }
  },
  alsoStrong: (list: string, plural: boolean, area: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${list} ද මෙහි ප්‍රබලව ස්ථානගත වේ, එය ${area} තවදුරටත් සහාය කරයි.`;
      case 'ta': return `${list} இங்கும் வலுவாக நிலைநிறுத்தப்பட்டுள்ள${plural ? 'ன' : 'து'}, இது ${area} ஐ மேலும் ஆதரிக்கிறது.`;
      case 'zh': return `${list}在此处也处于强势位置，进一步支持着${area}。`;
      case 'hi': return `${list} भी यहाँ प्रबल स्थिति में ${plural ? 'हैं' : 'है'}, जो ${area} को और सहारा देत${plural ? 'े हैं' : 'ा है'}.`;
      case 'ja': return `${list}もここで強く配置されており、${area}をさらに支えている。`;
      case 'ko': return `${list}도 여기서 강하게 배치되어 있어, ${area}를 더욱 뒷받침한다.`;
      case 'ar': return `${list} أيضًا في وضع قوي هنا، مما يدعم ${area} أكثر.`;
      case 'ml': return `${list} ഇവിടെയും ശക്തമായി സ്ഥാനം പിടിച്ചിരിക്കുന്നു, ഇത് ${area} നെ കൂടുതൽ പിന്തുണയ്ക്കുന്നു.`;
      default: return `${list} ${plural ? 'are' : 'is'} also strongly placed here, which supports ${area} further.`;
    }
  },
  alsoWeak: (list: string, plural: boolean, area: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${list} මෙහි දුර්වල වේ — ${area} අතරින් එය පාලනය කරන කොටසට හිතාමතාම අවධානය අවශ්‍යයි.`;
      case 'ta': return `${list} இங்கு பலவீனமா${plural ? 'ன' : ''}க உள்ள${plural ? 'ன' : 'து'} — ${area} இல் அது நிர்வகிக்கும் பகுதிக்கு வேண்டுமென்றே கவனம் தேவை.`;
      case 'zh': return `${list}在此处被削弱——${area}中由其掌管的部分需要刻意关注。`;
      case 'hi': return `${list} यहाँ कमज़ोर ${plural ? 'हैं' : 'है'} — ${area} का जो हिस्सा ${plural ? 'ये संभालते हैं' : 'यह संभालता है'} उसे सोच-समझकर ध्यान देने की ज़रूरत है.`;
      case 'ja': return `${list}はここで弱められている——${area}のうちそれが司る部分には意識的な注意が必要である。`;
      case 'ko': return `${list}는 여기서 약화되어 있다 — ${area} 중 그것이 관장하는 부분에는 의도적인 관심이 필요하다.`;
      case 'ar': return `${list} ضعيف هنا — الجزء الذي يحكمه من ${area} يحتاج إلى اهتمام واعٍ.`;
      case 'ml': return `${list} ഇവിടെ ദുർബലമാണ് — ${area} ൽ അത് ഭരിക്കുന്ന ഭാഗത്തിന് ബോധപൂർവമായ ശ്രദ്ധ ആവശ്യമാണ്.`;
      default: return `${list} ${plural ? 'are' : 'is'} weakened here — the part of ${area} ${plural ? 'they govern needs' : 'it governs needs'} deliberate attention.`;
    }
  },
  underStrain: (list: string, plural: boolean, area: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `${list} මෙහි යම් පීඩනයකට ලක්ව ඇත, එබැවින් ${area} හි ප්‍රගතියට තිබිය යුතුවාට වඩා වෙහෙසක් වැය වේ.`;
      case 'ta': return `${list} இங்கு சிறிது அழுத்தத்தில் உள்ள${plural ? 'ன' : 'து'}, எனவே ${area} இல் முன்னேற்றத்திற்கு தேவைக்கு அதிகமான முயற்சி செலவாகிறது.`;
      case 'zh': return `${list}在此处承受一定压力，因此${area}方面的进展需要付出比预期更多的努力。`;
      case 'hi': return `${list} यहाँ कुछ दबाव में ${plural ? 'हैं' : 'है'}, इसलिए ${area} में प्रगति के लिए ज़रूरत से अधिक प्रयास लगता है.`;
      case 'ja': return `${list}はここでいくらか緊張を受けており、そのため${area}における前進には想定以上の努力が必要になる。`;
      case 'ko': return `${list}는 여기서 다소 압박을 받고 있어, ${area}에서의 진전에는 예상보다 더 많은 노력이 든다.`;
      case 'ar': return `${list} تحت بعض الضغط هنا، لذا يكلف التقدم في ${area} جهدًا أكبر مما ينبغي.`;
      case 'ml': return `${list} ഇവിടെ അൽപ്പം സമ്മർദ്ദത്തിലാണ്, അതിനാൽ ${area} ലെ പുരോഗതിക്ക് വേണ്ടതിലും കൂടുതൽ പരിശ്രമം വേണ്ടിവരും.`;
      default: return `${list} ${plural ? 'sit' : 'sits'} under some strain here, so progress in ${area} costs more effort than it should.`;
    }
  },
  troubleHouses: (count: number, area: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `මෙම කේන්දරයේ දුෂ්කර භාවයන්හි ග්‍රහයන් ${count} ක් වැටේ, එබැවින් ${area} සංකූලතා සමඟ පැමිණීමට නැඹුරු වේ.`;
      case 'ta': return `இந்த ஜாதகத்தின் கடினமான வீடுகளில் ${count} கிரகங்கள் விழுகின்றன, எனவே ${area} சிக்கல்களுடன் வர வாய்ப்புள்ளது.`;
      case 'zh': return `这张图中有 ${count} 颗行星落在困难宫位，这正是${area}往往伴随复杂状况的原因。`;
      case 'hi': return `इस कुंडली के कठिन भावों में ${count} ग्रह आते हैं, यही कारण है कि ${area} में अक्सर जटिलताएँ जुड़ी रहती हैं.`;
      case 'ja': return `このチャートの困難な室に ${count} の惑星が位置しており、これが${area}に複雑さが伴いやすい理由である。`;
      case 'ko': return `이 차트의 어려운 하우스에 ${count}개의 행성이 위치해 있어, ${area}에 복잡함이 따르기 쉬운 이유가 된다.`;
      case 'ar': return `يقع ${count} كواكب في البيوت الصعبة لهذا المخطط، ولهذا يميل ${area} إلى المجيء مصحوبًا بتعقيدات.`;
      case 'ml': return `ഈ ജാതകത്തിലെ പ്രയാസകരമായ ഭാവങ്ങളിൽ ${count} ഗ്രഹങ്ങൾ വീഴുന്നു, അതിനാലാണ് ${area} സങ്കീർണതകളോടെ വരാൻ പ്രവണത കാണിക്കുന്നത്.`;
      default: return `${count} planets fall in the difficult houses of this chart, which is why ${area} tends to come with complications attached.`;
    }
  },
  nothingStandsOut: (area: string, lang: Lang): string => {
    switch (lang) {
      case 'si': return `මෙම කේන්දරයේ කිසිවක් තියුනු ලෙස කැපී නොපෙනේ — ${area} ඔබ වෙනුවෙන් සාමාන්‍ය මට්ටමට ආසන්නව ක්‍රියාත්මක වේ.`;
      case 'ta': return `இந்த ஜாதகத்தில் எதுவும் கூர்மையாக வேறுபடவில்லை — ${area} உங்களுக்கு சராசரிக்கு அருகில் இயங்குகிறது.`;
      case 'zh': return `这张图中没有哪一点特别突出——${area}对你而言大致处于平均水平。`;
      case 'hi': return `इस कुंडली में कुछ भी तीखे रूप से अलग नहीं दिखता — ${area} आपके लिए लगभग औसत स्तर पर चलता है.`;
      case 'ja': return `このチャートには際立って目立つものはない——${area}はあなたにとって平均に近い形で進む。`;
      case 'ko': return `이 차트에는 뚜렷하게 두드러지는 부분이 없다 — ${area}는 당신에게 평균에 가깝게 흘러간다.`;
      case 'ar': return `لا شيء يبرز بوضوح في هذا المخطط — يسير ${area} بالنسبة لك قريبًا من المتوسط.`;
      case 'ml': return `ഈ ജാതകത്തിൽ ഒന്നും മൂർച്ചയായി വേറിട്ടുനിൽക്കുന്നില്ല — ${area} നിങ്ങൾക്ക് ശരാശരിയോട് അടുത്ത് പ്രവർത്തിക്കുന്നു.`;
      default: return `Nothing in this chart stands out sharply either way — ${area} runs close to average for you.`;
    }
  },
  headlineFallback: (standing: VargaStanding, area: string, lang: Lang): string => {
    const cap = (s: string) => (lang === 'en' ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    switch (lang) {
      case 'si': return standing === 'strong' ? `${area} ඔබට හිතකර ලෙස සහාය ලද අංශයකි` : standing === 'needs-effort' ? `${area} වෙහෙසක් ඉල්ලා සිටින අංශයකි` : `${area} සුළු ගැටුම් සමඟ ක්‍රියාත්මක වේ`;
      case 'ta': return standing === 'strong' ? `${area} உங்களுக்கு நன்கு ஆதரிக்கப்படும் பகுதி` : standing === 'needs-effort' ? `${area} முயற்சி தேவைப்படும் பகுதி` : `${area} சிறிது தடையுடன் இயங்கக்கூடியது`;
      case 'zh': return standing === 'strong' ? `${area}对你而言是一个受到良好支持的领域` : standing === 'needs-effort' ? `${area}是需要付出努力的领域` : `${area}基本可行，伴有一些摩擦`;
      case 'hi': return standing === 'strong' ? `${area} आपके लिए एक अच्छी तरह समर्थित क्षेत्र है` : standing === 'needs-effort' ? `${area} एक ऐसा क्षेत्र है जिसे प्रयास चाहिए` : `${area} कुछ घर्षण के साथ व्यावहारिक है`;
      case 'ja': return standing === 'strong' ? `${area}はあなたにとってよく支えられた分野である` : standing === 'needs-effort' ? `${area}は努力を必要とする分野である` : `${area}は多少の摩擦はあるが十分に成り立つ`;
      case 'ko': return standing === 'strong' ? `${area}는 당신에게 잘 뒷받침되는 영역이다` : standing === 'needs-effort' ? `${area}는 노력이 필요한 영역이다` : `${area}는 약간의 마찰과 함께 무난하다`;
      case 'ar': return standing === 'strong' ? `${area} مجال مدعوم جيدًا بالنسبة لك` : standing === 'needs-effort' ? `${area} مجال يتطلب جهدًا` : `${area} قابل للتطبيق مع بعض الاحتكاك`;
      case 'ml': return standing === 'strong' ? `${area} നിങ്ങൾക്ക് നന്നായി പിന്തുണയ്ക്കപ്പെടുന്ന ഒരു മേഖലയാണ്` : standing === 'needs-effort' ? `${area} പരിശ്രമം ആവശ്യമുള്ള ഒരു മേഖലയാണ്` : `${area} കുറച്ച് ഘർഷണത്തോടെ പ്രായോഗികമാണ്`;
      default: return standing === 'strong' ? `${cap(area)} is a well-supported area for you` : standing === 'needs-effort' ? `${cap(area)} is an area that asks for effort` : `${cap(area)} is workable, with some friction`;
    }
  },
  summary: (standing: VargaStanding, area: string, lang: Lang): string => {
    switch (lang) {
      case 'si':
        return standing === 'strong'
          ? `${area} පාලනය කරන ග්‍රහයන් මෙම වර්ගයේ බොහෝ දුරට හොඳින් ස්ථානගත වී ඇත. මෙම අංශය සම්බන්ධයෙන් ඔබ දමන දේට සාධාරණ ප්‍රතිලාභයක් ලබයි, පසුබෑම් ඉක්මනින් යථා තත්ත්වයට පත් වේ.`
          : standing === 'needs-effort'
            ? `${area} පාලනය කරන ග්‍රහයන් මෙම වර්ගයේ බොහෝ දුරට පීඩනයට ලක්ව ඇත. මෙය අසමත්වීමේ තීන්දුවක් නොවේ — එහි අර්ථය නම් මෙහි ප්‍රතිඵල වාසනාවෙන් නොව සවිඥානික, අඛණ්ඩ වෑයමකින් ලැබෙන බවත්, දේවල් තමන්ටම සකස් වේ යැයි අපේක්ෂා කිරීම ඔබව අසතුටට පත් කරන බවත්ය.`
            : `${area} පාලනය කරන ග්‍රහයන් මෙම වර්ගයේ මිශ්‍ර වේ. එහි කොටස් සුමටව ක්‍රියාත්මක වන අතර කොටස් ප්‍රතිරෝධය දක්වයි, එබැවින් ප්‍රතිඵල ඔබ කටයුතු කරන එහි විශේෂිත අංශය මත බොහෝ දුරට රඳා පවතී.`;
      case 'ta':
        return standing === 'strong'
          ? `${area} ஐ ஆளும் கிரகங்கள் இந்த வர்கத்தில் பெரும்பாலும் நன்கு நிலைநிறுத்தப்பட்டுள்ளன. இந்தப் பகுதியில் நீங்கள் போடுவதற்கு நியாயமான பலனைப் பெறுகிறீர்கள், பின்னடைவுகள் விரைவாக மீள்கின்றன.`
          : standing === 'needs-effort'
            ? `${area} ஐ ஆளும் கிரகங்கள் இந்த வர்கத்தில் பெரும்பாலும் அழுத்தத்தில் உள்ளன. இது தோல்வியின் தீர்ப்பு அல்ல — இங்குள்ள முடிவுகள் அதிர்ஷ்டத்தால் அல்ல, வேண்டுமென்றே தொடர்ச்சியான உழைப்பால் வருகின்றன என்பதே பொருள், மேலும் விஷயங்கள் தானாகவே அமையும் என எதிர்பார்ப்பது உங்களை ஏமாற்றும்.`
            : `${area} ஐ ஆளும் கிரகங்கள் இந்த வர்கத்தில் கலவையானவை. அதன் சில பகுதிகள் மென்மையாக இயங்குகின்றன, சில எதிர்க்கின்றன, எனவே முடிவுகள் நீங்கள் கையாளும் குறிப்பிட்ட அம்சத்தைப் பொறுத்து அமையும்.`;
      case 'zh':
        return standing === 'strong'
          ? `掌管${area}的行星在这一分宫图中大多处于良好位置。在这方面，你的付出往往能得到公平的回报，挫折也能很快恢复。`
          : standing === 'needs-effort'
            ? `掌管${area}的行星在这一分宫图中大多承受压力。这并非失败的判决——它意味着这方面的成果来自有意识的持续努力，而非运气，若指望事情自然而然地水到渠成，只会令人失望。`
            : `掌管${area}的行星在这一分宫图中喜忧参半。部分运行顺畅，部分则遇到阻力，因此结果在很大程度上取决于你面对的具体方面。`;
      case 'hi':
        return standing === 'strong'
          ? `${area} पर शासन करने वाले ग्रह इस वर्ग में ज़्यादातर अच्छी स्थिति में हैं. इस क्षेत्र में आपको जो लगाते हैं उसका उचित प्रतिफल मिलता है, और असफलताएँ जल्दी संभल जाती हैं.`
          : standing === 'needs-effort'
            ? `${area} पर शासन करने वाले ग्रह इस वर्ग में ज़्यादातर दबाव में हैं. यह असफलता का फ़ैसला नहीं है — इसका मतलब है कि यहाँ परिणाम भाग्य से नहीं बल्कि सोच-समझकर किए गए निरंतर प्रयास से मिलते हैं, और यह उम्मीद करना कि चीज़ें अपने आप ठीक हो जाएँगी, आपको निराश करेगा.`
            : `${area} पर शासन करने वाले ग्रह इस वर्ग में मिले-जुले हैं. इसके कुछ हिस्से आसानी से चलते हैं और कुछ अवरोध करते हैं, इसलिए परिणाम काफ़ी हद तक इस बात पर निर्भर करते हैं कि आप इसके किस विशेष पहलू से जूझ रहे हैं.`;
      case 'ja':
        return standing === 'strong'
          ? `${area}を司る惑星は、この分割図の多くで良い位置にある。この分野に関しては、注いだ努力に見合った成果が得られ、挫折があっても早く立ち直る。`
          : standing === 'needs-effort'
            ? `${area}を司る惑星は、この分割図の多くで圧力を受けている。これは失敗の判定ではない——ここでの成果は運ではなく、意識的で持続的な努力から生まれるということであり、物事が自然に収まると期待すると失望することになる。`
            : `${area}を司る惑星は、この分割図の中で入り混じっている。順調に進む部分もあれば、抵抗を受ける部分もあるため、結果はどの具体的な側面に取り組んでいるかに大きく左右される。`;
      case 'ko':
        return standing === 'strong'
          ? `${area}를 관장하는 행성들은 이 바르가에서 대체로 좋은 위치에 있다. 이 영역에서는 들인 노력에 걸맞은 결실을 얻으며, 좌절도 빠르게 회복된다.`
          : standing === 'needs-effort'
            ? `${area}를 관장하는 행성들은 이 바르가에서 대체로 압박을 받고 있다. 이는 실패의 판정이 아니다 — 여기서의 결과는 운이 아니라 의식적이고 지속적인 노력에서 온다는 뜻이며, 저절로 풀리기를 기대하면 실망하게 될 것이다.`
            : `${area}를 관장하는 행성들은 이 바르가에서 엇갈린 모습을 보인다. 일부는 순조롭게 진행되고 일부는 저항하므로, 결과는 당신이 다루는 구체적인 측면에 크게 좌우된다.`;
      case 'ar':
        return standing === 'strong'
          ? `الكواكب الحاكمة لـ${area} في وضع جيد في الغالب ضمن هذا البرج الفرعي. فيما يخص هذا الجانب، تحصل عادة على عائد عادل مقابل ما تبذله، وتتعافى الانتكاسات بسرعة.`
          : standing === 'needs-effort'
            ? `الكواكب الحاكمة لـ${area} تحت ضغط في الغالب ضمن هذا البرج الفرعي. هذا ليس حكمًا بالفشل — بل يعني أن النتائج هنا تأتي من عمل واعٍ ومستمر لا من الحظ، وتوقع أن تستقر الأمور من تلقاء نفسها سيخيب أملك.`
            : `الكواكب الحاكمة لـ${area} متفاوتة ضمن هذا البرج الفرعي. تسير أجزاء منها بسلاسة وتقاوم أجزاء أخرى، لذا تعتمد النتائج إلى حد كبير على الجانب المحدد الذي تتعامل معه.`;
      case 'ml':
        return standing === 'strong'
          ? `${area} ഭരിക്കുന്ന ഗ്രഹങ്ങൾ ഈ വർഗത്തിൽ കൂടുതലും നല്ല സ്ഥാനത്താണ്. ഈ മേഖലയിൽ നിങ്ങൾ ചെലുത്തുന്നതിന് ന്യായമായ പ്രതിഫലം ലഭിക്കും, തിരിച്ചടികൾ വേഗം മറികടക്കും.`
          : standing === 'needs-effort'
            ? `${area} ഭരിക്കുന്ന ഗ്രഹങ്ങൾ ഈ വർഗത്തിൽ കൂടുതലും സമ്മർദ്ദത്തിലാണ്. ഇത് പരാജയത്തിന്റെ വിധിയല്ല — ഇവിടെ ഫലങ്ങൾ ഭാഗ്യത്തിൽ നിന്നല്ല, ബോധപൂർവവും തുടർച്ചയായതുമായ പ്രയത്നത്തിൽ നിന്നാണ് വരുന്നത് എന്നാണ് അർത്ഥം, കാര്യങ്ങൾ സ്വയം ശരിയാകുമെന്ന് പ്രതീക്ഷിക്കുന്നത് നിരാശപ്പെടുത്തും.`
            : `${area} ഭരിക്കുന്ന ഗ്രഹങ്ങൾ ഈ വർഗത്തിൽ സമ്മിശ്രമാണ്. ചില ഭാഗങ്ങൾ സുഗമമായി പോകുന്നു, ചിലത് പ്രതിരോധിക്കുന്നു, അതിനാൽ ഫലങ്ങൾ നിങ്ങൾ കൈകാര്യം ചെയ്യുന്ന നിർദ്ദിഷ്ട വശത്തെ ഏറെ ആശ്രയിച്ചിരിക്കുന്നു.`;
      default:
        return standing === 'strong'
          ? `The planets governing ${area} are mostly well placed in this division. Where this area is concerned you tend to get a fair return on what you put in, and setbacks recover quickly.`
          : standing === 'needs-effort'
            ? `The planets governing ${area} are mostly under pressure in this division. This is not a verdict of failure — it means results here come from deliberate, sustained work rather than from luck, and that expecting things to simply fall into place will disappoint you.`
            : `The planets governing ${area} are mixed in this division. Parts of it run smoothly and parts of it resist, so outcomes depend a good deal on which specific aspect of it you are dealing with.`;
    }
  },
};

/**
 * A whole-chart read: how well supported this area of life is, judged the
 * classical way — the karaka first, the varga lagna lord second, and the
 * general spread of dignities and houses after that. Deliberately coarse —
 * three bands — because a finer number would imply precision this does not have.
 */
export function vargaVerdict(
  code: VargaCode,
  planets: VerdictPlanet[],
  /** Lord of this varga's rising sign — anchors the whole chart when given. */
  lagnaLord?: string,
  lang: Lang = 'en',
): VargaVerdict {
  const meaning = plainMeaningFor(code, lang);
  const area = meaning?.reasonArea ?? (meaning ? meaning.plainName.replace(/ chart$/, '').toLowerCase() : 'this area');

  const strong = planets.filter(p => p.dignity === 'exalted' || p.dignity === 'own-sign');
  const weak = planets.filter(p => p.dignity === 'debilitated');
  const strained = planets.filter(p => p.dignity === 'enemy-sign');

  // Planets in the 6th, 8th and 12th of a varga drag on its affairs.
  const inTroubleHouses = planets.filter(p => [6, 8, 12].includes(p.house));
  const inGoodHouses = planets.filter(p => [1, 4, 5, 7, 9, 10, 11].includes(p.house));

  let score =
    planets.reduce((sum, p) => sum + DIGNITY_RANK[p.dignity], 0) / Math.max(1, planets.length) +
    (inGoodHouses.length - inTroubleHouses.length) * 0.15;

  const reasons: string[] = [];
  // Planets already explained by a more specific rule; the generic dignity
  // lists below skip them rather than saying the same thing twice.
  const covered = new Set<string>();

  // ── The karaka — the planet the whole chart is judged by ──
  const karakas = (VARGA_KARAKAS[code] ?? [])
    .map(k => ({ ...k, placed: planets.find(p => p.planet === k.planet) }))
    .filter(k => k.placed);
  for (const k of karakas) {
    const p = k.placed!;
    const rank = DIGNITY_RANK[p.dignity];
    const houseMod = [6, 8, 12].includes(p.house) ? -0.5 : [1, 5, 9, 10, 11].includes(p.house) ? 0.3 : 0;
    // Karaka condition weighs more than any single ordinary placement.
    score += (rank * 0.45 + houseMod) / karakas.length;

    const role = k.role[lang] ?? k.role.en;
    if (rank >= 1.5) {
      covered.add(p.planet);
      reasons.unshift(VERDICT_TEXT.karakaStrong(p.planet, role, p.dignity === 'exalted', lang));
    } else if (rank <= -2) {
      covered.add(p.planet);
      reasons.unshift(VERDICT_TEXT.karakaWeak(p.planet, role, lang));
    } else if ([6, 8, 12].includes(p.house)) {
      covered.add(p.planet);
      reasons.unshift(VERDICT_TEXT.karakaTrouble(p.planet, role, area, lang));
    }
  }

  // ── The varga lagna lord — the anchor of the chart itself ──
  const anchor = lagnaLord ? planets.find(p => p.planet === lagnaLord) : undefined;
  if (anchor) {
    const rank = DIGNITY_RANK[anchor.dignity];
    score += rank * 0.25 + ([6, 8, 12].includes(anchor.house) ? -0.25 : 0);
    if (rank >= 1.5) {
      covered.add(anchor.planet);
      reasons.push(VERDICT_TEXT.anchorStrong(anchor.planet, area, lang));
    } else if (rank <= -2 || [6, 8, 12].includes(anchor.house)) {
      covered.add(anchor.planet);
      reasons.push(VERDICT_TEXT.anchorWeak(anchor.planet, area, lang));
    }
  }

  const standing: VargaStanding = score >= 0.55 ? 'strong' : score <= -0.4 ? 'needs-effort' : 'workable';

  const restStrong = strong.filter(p => !covered.has(p.planet));
  const restWeak = weak.filter(p => !covered.has(p.planet));
  const restStrained = strained.filter(p => !covered.has(p.planet));

  if (restStrong.length) {
    reasons.push(VERDICT_TEXT.alsoStrong(joinAnd(restStrong.map(p => p.planet), lang), restStrong.length > 1, area, lang));
  }
  if (restWeak.length) {
    reasons.push(VERDICT_TEXT.alsoWeak(joinAnd(restWeak.map(p => p.planet), lang), restWeak.length > 1, area, lang));
  }
  if (restStrained.length && !restWeak.length) {
    reasons.push(VERDICT_TEXT.underStrain(joinAnd(restStrained.map(p => p.planet), lang), restStrained.length > 1, area, lang));
  }
  if (inTroubleHouses.length >= 3) {
    reasons.push(VERDICT_TEXT.troubleHouses(inTroubleHouses.length, area, lang));
  }
  if (!reasons.length) {
    reasons.push(VERDICT_TEXT.nothingStandsOut(area, lang));
  }

  // Per-chart wording: generic phrasing produces both bad grammar
  // ("Weak spots is a well-supported area") and, for the adversity chart,
  // the reverse of the truth.
  const headline = meaning
    ? standing === 'strong'
      ? meaning.verdicts.strong
      : standing === 'needs-effort'
        ? meaning.verdicts.needsEffort
        : meaning.verdicts.workable
    : VERDICT_TEXT.headlineFallback(standing, area, lang);

  const summary = VERDICT_TEXT.summary(standing, area, lang);

  return { standing, headline, summary, reasons };
}

