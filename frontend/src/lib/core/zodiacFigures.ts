/**
 * Pictorial zodiac symbols taken from the cream-on-dark line-art set:
 * ram, bull, twins, crab, lion, maiden, scales, scorpion, archer-centaur,
 * sea-goat, water-jar, and two fishes. Used as particles (sampled) and as
 * the coloured mark in the chart centre.
 */
import aries from '../../assets/zodiac/00-aries.png';
import taurus from '../../assets/zodiac/01-taurus.png';
import gemini from '../../assets/zodiac/02-gemini.png';
import cancer from '../../assets/zodiac/03-cancer.png';
import leo from '../../assets/zodiac/04-leo.png';
import virgo from '../../assets/zodiac/05-virgo.png';
import libra from '../../assets/zodiac/06-libra.png';
import scorpio from '../../assets/zodiac/07-scorpio.png';
import sagittarius from '../../assets/zodiac/08-sagittarius.png';
import capricorn from '../../assets/zodiac/09-capricorn.png';
import aquarius from '../../assets/zodiac/10-aquarius.png';
import pisces from '../../assets/zodiac/11-pisces.png';

export interface FigurePt { x: number; y: number }
export interface FigureSample { outline: FigurePt[]; detail: FigurePt[]; fill: FigurePt[] }

const ALPHA_MIN = 90;
const LUM_STEP = 40;

export const ZODIAC_IMAGE_URLS: readonly string[] = [
  aries, taurus, gemini, cancer, leo, virgo,
  libra, scorpio, sagittarius, capricorn, aquarius, pisces,
];

const images: (HTMLImageElement | null)[] = ZODIAC_IMAGE_URLS.map(() => null);
let loadPromise: Promise<HTMLImageElement[]> | null = null;

function zodiacIndex(index: number): number {
  return ((index % 12) + 12) % 12;
}

export function loadZodiacImages(): Promise<HTMLImageElement[]> {
  if (typeof Image === 'undefined') return Promise.resolve([]);
  if (loadPromise) return loadPromise;
  loadPromise = Promise.all(ZODIAC_IMAGE_URLS.map((src, i) => new Promise<HTMLImageElement>((resolve, reject) => {
    const cached = images[i];
    if (cached?.complete && cached.naturalWidth) {
      resolve(cached);
      return;
    }
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { images[i] = im; resolve(im); };
    im.onerror = () => reject(new Error(`zodiac image ${i} failed to load`));
    im.src = src;
  })));
  return loadPromise;
}

export function drawZodiacFigure(ctx: CanvasRenderingContext2D, index: number) {
  const im = images[zodiacIndex(index)];
  if (!im?.complete || !im.naturalWidth) return;
  ctx.save();
  ctx.drawImage(im, 0, 0, 100, 100);
  ctx.restore();
}

/** Rasterise a figure and split pixels into outline / detail / fill. */
export function sampleZodiacFigure(index: number, size = 420, stride = 2): FigureSample {
  const empty: FigureSample = { outline: [], detail: [], fill: [] };
  const im = images[zodiacIndex(index)];
  if (!im?.complete || !im.naturalWidth) return empty;

  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d', { willReadFrequently: true });
  if (!g) return empty;

  g.clearRect(0, 0, size, size);
  const pad = size * 0.06;
  g.drawImage(im, pad, pad, size - pad * 2, size - pad * 2);

  const data = g.getImageData(0, 0, size, size).data;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size;
  const alphaAt = (x: number, y: number) => (inside(x, y) ? data[(y * size + x) * 4 + 3] : 0);
  const lumAt = (x: number, y: number) => {
    const i = (y * size + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };

  const outline: FigurePt[] = [];
  const detail: FigurePt[] = [];
  const fill: FigurePt[] = [];
  const NEIGHBOURS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (let y = 0; y < size; y += stride) {
    for (let x = 0; x < size; x += stride) {
      if (alphaAt(x, y) <= ALPHA_MIN) continue;
      const pt = { x: x / size - 0.5, y: y / size - 0.5 };
      let onOutline = false;
      for (const [dx, dy] of NEIGHBOURS) {
        if (alphaAt(x + dx * stride, y + dy * stride) <= ALPHA_MIN) { onOutline = true; break; }
      }
      if (onOutline) { outline.push(pt); continue; }
      const l = lumAt(x, y);
      let onDetail = false;
      for (const [dx, dy] of NEIGHBOURS) {
        const nx = x + dx * stride, ny = y + dy * stride;
        if (!inside(nx, ny)) continue;
        if (Math.abs(l - lumAt(nx, ny)) > LUM_STEP) { onDetail = true; break; }
      }
      (onDetail ? detail : fill).push(pt);
    }
  }
  return { outline, detail, fill };
}

export function figurePointCount(sample: FigureSample): number {
  return sample.outline.length + sample.detail.length + sample.fill.length;
}
