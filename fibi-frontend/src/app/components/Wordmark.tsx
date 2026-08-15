import logo from '../../assets/fibi_logo.svg';

/**
 * The FIBI wordmark, cropped to its artwork.
 *
 * The source SVG is a 1280×853 canvas whose ink occupies only a middle band —
 * about 53% of the width and 24% of the height. Sizing the <img> by height
 * therefore renders the mark at a quarter of the size the class implies, which
 * is why it turned up either illegibly small (`h-8` in the auth panel) or
 * legible only by overflowing its bar (`h-40` in the site nav).
 *
 * The fix is a fixed-size window with an oversized image centred inside it: the
 * transparent margin is clipped rather than eating the layout, and every
 * surface asks for a size instead of re-deriving the ratio.
 *
 * Ink height per size — the number that actually matters visually:
 * xs 20px · sm 24px · md 30px · lg 40px · xl 56px.
 */

const SIZES = {
  xs: { box: 'h-6 w-20', img: 'h-[82px]' },
  sm: { box: 'h-8 w-24', img: 'h-[98px]' },
  md: { box: 'h-9 w-28', img: 'h-[123px]' },
  lg: { box: 'h-12 w-36', img: 'h-[164px]' },
  xl: { box: 'h-16 w-48', img: 'h-[229px]' },
} as const;

export type WordmarkSize = keyof typeof SIZES;

export function Wordmark({
  size = 'md',
  /** `light` inverts the dark artwork for placement on a dark surface. */
  tone = 'dark',
  className = '',
}: {
  size?: WordmarkSize;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const { box, img } = SIZES[size];
  return (
    <span className={`relative block shrink-0 overflow-hidden ${box} ${className}`}>
      <img
        src={logo}
        alt="FIBI"
        className={`absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 ${img} ${
          tone === 'light' ? 'invert brightness-[1.9]' : ''
        }`}
      />
    </span>
  );
}
