import { ZODIAC_IMAGE_URLS } from '../../lib/core/zodiacFigures';

interface Props {
  index: number;
  color?: string;
  className?: string;
  title?: string;
}

/** Classic pictorial sign used in the chart centre and as a faint cell mark. */
export const ZodiacSymbol: React.FC<Props> = ({ index, color = 'currentColor', className, title }) => {
  const src = ZODIAC_IMAGE_URLS[((index % 12) + 12) % 12];
  return (
    <span
      className={className}
      title={title}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{
        display: 'block',
        backgroundColor: color,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  );
};
