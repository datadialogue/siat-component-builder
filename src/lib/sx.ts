import type { CSSProperties } from 'react';
import type { Theme } from '../theme/theme';

/**
 * Inline-style helpers that neutralise SFU's CLF4 global CSS.
 *
 * CLF4 sets html{font-size:10px}, resets margin/padding/border on most tags,
 * forces img{width:100%}, gives p/ul/ol 17px text + 30px bottom margin,
 * uppercases h1, greys + underlines links and adds red square bullets to li.
 * Inline styles beat those rules, so every element states what it needs.
 * Always use px or em (never rem).
 */
export interface Sx {
  /** Plain block: no margin/padding, border-box. */
  box: (s?: CSSProperties) => CSSProperties;
  /** Heading of a visual size (px). Use h2–h4 in markup; never h1. */
  heading: (size: number, s?: CSSProperties) => CSSProperties;
  /** Body paragraph. */
  text: (s?: CSSProperties) => CSSProperties;
  /** Small muted text (dates, captions, eyebrows). */
  small: (s?: CSSProperties) => CSSProperties;
  /** Uppercase eyebrow/tag label. */
  eyebrow: (s?: CSSProperties) => CSSProperties;
  /** A link that keeps theme colour (overrides CLF4 grey). */
  link: (s?: CSSProperties) => CSSProperties;
  /** Link/button styled as a button. */
  button: (variant?: 'primary' | 'secondary' | 'ghost' | 'light', s?: CSSProperties) => CSSProperties;
  /** <button> reset (for icon/tab buttons). */
  buttonReset: (s?: CSSProperties) => CSSProperties;
  /** Image filling its (positioned) box. */
  imgFill: (fit?: 'cover' | 'contain', pos?: string, s?: CSSProperties) => CSSProperties;
  /** Image at natural aspect, full width. */
  img: (s?: CSSProperties) => CSSProperties;
  /** Aspect-ratio box (padding trick); put an imgFill inside. ratio = "16:9". */
  ratio: (ratio: string, s?: CSSProperties) => CSSProperties;
  /** Responsive grid: up to `cols` columns, collapsing below `min` px each. No media queries. */
  grid: (cols: number, min: number, gap: number, s?: CSSProperties) => CSSProperties;
}

export function ratioToPercent(ratio: string): number {
  const [w, h] = ratio.split(':').map(Number);
  if (!w || !h) return 75;
  return Math.round((h / w) * 10000) / 100;
}

export function makeSx(t: Theme): Sx {
  const box = (s: CSSProperties = {}): CSSProperties => ({ margin: 0, padding: 0, boxSizing: 'border-box', ...s });
  return {
    box,
    heading: (size, s = {}) => box({
      fontFamily: t.font,
      fontSize: `${size}px`,
      lineHeight: 1.15,
      fontWeight: 800,
      fontStretch: '83%',
      letterSpacing: 'normal',
      textTransform: 'none',
      color: t.heading,
      ...s,
    }),
    text: (s = {}) => box({
      fontFamily: t.font,
      fontSize: '17px',
      lineHeight: 1.55,
      fontWeight: 400,
      color: t.text,
      ...s,
    }),
    small: (s = {}) => box({ fontFamily: t.font, fontSize: '14px', lineHeight: 1.4, color: t.muted, ...s }),
    eyebrow: (s = {}) => box({
      fontFamily: t.font,
      fontSize: '13px',
      lineHeight: 1.3,
      fontWeight: 700,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: t.accent,
      ...s,
    }),
    link: (s = {}) => ({ color: t.link, textDecoration: 'underline', textUnderlineOffset: '3px', background: 'none', ...s }),
    button: (variant = 'primary', s = {}) => {
      const base: CSSProperties = {
        display: 'inline-block',
        boxSizing: 'border-box',
        margin: 0,
        padding: '12px 24px',
        borderRadius: `${t.radiusSm}px`,
        fontFamily: t.font,
        fontSize: '15px',
        lineHeight: 1.2,
        fontWeight: 800,
        fontStretch: '83%',
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'background-color .2s ease, color .2s ease, transform .2s ease, box-shadow .2s ease',
      };
      const variants: Record<string, CSSProperties> = {
        primary: { background: t.accent, color: t.onAccent, border: `2px solid ${t.accent}` },
        secondary: { background: 'transparent', color: t.dark ? '#ffffff' : t.accent, border: `2px solid ${t.dark ? '#ffffff' : t.accent}` },
        ghost: { background: 'transparent', color: t.link, border: '2px solid transparent', padding: '12px 4px' },
        light: { background: '#ffffff', color: '#000000', border: '2px solid #ffffff' },
      };
      return { ...base, ...variants[variant], ...s };
    },
    buttonReset: (s = {}) => ({
      margin: 0,
      padding: 0,
      border: 0,
      background: 'none',
      font: 'inherit',
      color: 'inherit',
      cursor: 'pointer',
      boxSizing: 'border-box',
      WebkitAppearance: 'none',
      appearance: 'none',
      ...s,
    }),
    imgFill: (fit = 'cover', pos = '50% 50%', s = {}) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      margin: 0,
      padding: 0,
      border: 0,
      display: 'block',
      objectFit: fit,
      objectPosition: pos,
      ...s,
    }),
    img: (s = {}) => ({ display: 'block', width: '100%', maxWidth: '100%', height: 'auto', margin: 0, padding: 0, border: 0, ...s }),
    ratio: (ratio, s = {}) => ({
      position: 'relative',
      display: 'block',
      width: '100%',
      height: 0,
      paddingBottom: `${ratioToPercent(ratio)}%`,
      margin: 0,
      overflow: 'hidden',
      boxSizing: 'border-box',
      ...s,
    }),
    grid: (cols, min, gap, s = {}) => ({
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, max(${min}px, calc((100% - ${(cols - 1) * gap}px) / ${cols}))), 1fr))`,
      gap: `${gap}px`,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      ...s,
    }),
  };
}
