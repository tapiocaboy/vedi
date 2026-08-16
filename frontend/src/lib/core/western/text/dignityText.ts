import type { Bi } from '../../i18n';
import type { DignityLevel } from '../dignity';

export const DIGNITY_TEXT: Record<DignityLevel, { label: Bi; description: Bi }> = {
  rulership: {
    label: { en: 'Domicile', si: 'ස්වක්ෂේත්‍රය' },
    description: {
      en: 'in its own sign — fully itself here, expressing its nature directly and without friction.',
      si: 'තමන්ගේම රාශියේ — මෙහි සම්පූර්ණයෙන්ම තමන්ම වී, කිසිදු ගැටීමකින් තොරව සෘජුවම ස්වභාවය ප්‍රකාශ කරයි.',
    },
  },
  exaltation: {
    label: { en: 'Exalted', si: 'උච්ච' },
    description: {
      en: 'exalted — operating at its most refined and confident, though sometimes overplayed for the same reason.',
      si: 'උච්ච වී — වඩාත්ම පිරිපුන් හා විශ්වාසදායක ලෙස ක්‍රියා කරයි, එහෙත් එම හේතුව නිසාම සමහරවිට අධික ලෙසද ප්‍රකාශ විය හැක.',
    },
  },
  detriment: {
    label: { en: 'Detriment', si: 'නීච සබඳතාව' },
    description: {
      en: 'in detriment — working against its own grain here, which usually means more conscious effort for the same result.',
      si: 'නීච සබඳතාවෙන් — මෙහි තමන්ගේම ස්වභාවයට විරුද්ධව ක්‍රියා කරයි, එයින් අදහස් වන්නේ එකම ප්‍රතිඵලය සඳහා වැඩි සවිඥානක උත්සාහයක් අවශ්‍ය වීමයි.',
    },
  },
  fall: {
    label: { en: 'Fall', si: 'නීච' },
    description: {
      en: 'in fall — its confidence is lowest here, often the placement that needs the most patient, deliberate development.',
      si: 'නීච වී — මෙහි එහි විශ්වාසය අවම මට්ටමේ පවතී, බොහෝවිට වඩාත්ම ඉවසිලිවන්ත, හිතාමතා වර්ධනයක් අවශ්‍ය පිහිටීමයි.',
    },
  },
  neutral: {
    label: { en: 'Peregrine', si: 'මධ්‍යස්ථ' },
    description: {
      en: 'peregrine — neither helped nor hindered by sign placement, so its expression is shaped almost entirely by house and aspect instead.',
      si: 'මධ්‍යස්ථව — රාශි පිහිටීමෙන් උදව් හෝ බාධාවක් නොලබයි, එබැවින් එහි ප්‍රකාශනය සම්පූර්ණයෙන් පාහේ භාවය හා යෝගවලින් හැඩගැසේ.',
    },
  },
};
