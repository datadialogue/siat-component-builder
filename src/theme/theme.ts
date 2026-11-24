import type { Common } from '../lib/types';

/** SFU brand palette (communicators-toolkit + CLF4 CSS variables). */
export const SFU = {
  red: '#cc0633',
  darkRed: '#a6192e',
  black: '#000000',
  white: '#ffffff',
  charcoal: '#414042',
  grey: '#54585a',
  midGrey: '#6d6f71',
  lightGrey: '#e6e7e8',
  paleGrey: '#f5f5f5',
  focus: '#0b78e6',
} as const;

export const SWATCHES: { name: string; value: string }[] = [
  { name: 'SFU Red', value: SFU.red },
  { name: 'Dark Red', value: SFU.darkRed },
  { name: 'Charcoal', value: SFU.charcoal },
  { name: 'Grey', value: SFU.grey },
  { name: 'Mid Grey', value: SFU.midGrey },
  { name: 'Light Grey', value: SFU.lightGrey },
  { name: 'Pale Grey', value: SFU.paleGrey },
  { name: 'Black', value: SFU.black },
  { name: 'White', value: SFU.white },
];

export interface Theme {
  /** Page-level background behind the component ('transparent' = inherit page). */
  bg: string;
  /** Cards, panels. */
  surface: string;
  /** Alternate subtle surface (stripes, inactive tabs). */
  surfaceAlt: string;
  text: string;
  heading: string;
  muted: string;
  border: string;
  accent: string;
  /** Text colour on top of the accent colour. */
  onAccent: string;
  link: string;
  font: string;
  radius: number;
  radiusSm: number;
  shadow: string;
  shadowHover: string;
  dark: boolean;
}

interface ThemePreset {
  name: string;
  bg: string; surface: string; surfaceAlt: string;
  text: string; heading: string; muted: string; border: string;
  accent: string; onAccent: string; link: string; dark: boolean;
}

export const THEMES: Record<string, ThemePreset> = {
  light: {
    name: 'SFU Light', bg: 'transparent', surface: '#ffffff', surfaceAlt: SFU.paleGrey,
    text: '#1a1a1a', heading: SFU.charcoal, muted: SFU.midGrey, border: SFU.lightGrey,
    accent: SFU.red, onAccent: '#ffffff', link: SFU.darkRed, dark: false,
  },
  grey: {
    name: 'Pale Grey', bg: SFU.paleGrey, surface: '#ffffff', surfaceAlt: '#ececec',
    text: '#1a1a1a', heading: SFU.charcoal, muted: SFU.midGrey, border: '#dcdddf',
    accent: SFU.darkRed, onAccent: '#ffffff', link: SFU.darkRed, dark: false,
  },
  red: {
    name: 'SFU Red', bg: SFU.darkRed, surface: '#b51f36', surfaceAlt: '#8f1426',
    text: '#ffffff', heading: '#ffffff', muted: '#f3d3d9', border: 'rgba(255,255,255,.28)',
    accent: '#ffffff', onAccent: SFU.darkRed, link: '#ffffff', dark: true,
  },
  charcoal: {
    name: 'Charcoal', bg: '#2b2a2c', surface: SFU.charcoal, surfaceAlt: '#353436',
    text: '#f2f2f2', heading: '#ffffff', muted: '#b9babc', border: 'rgba(255,255,255,.16)',
    accent: '#ff3d5e', onAccent: '#ffffff', link: '#ff8fa1', dark: true,
  },
  minimal: {
    name: 'Minimal', bg: 'transparent', surface: 'transparent', surfaceAlt: SFU.paleGrey,
    text: '#000000', heading: '#000000', muted: SFU.grey, border: '#cfd0d2',
    accent: '#000000', onAccent: '#ffffff', link: '#000000', dark: false,
  },
};

const FONTS: Record<Common['font'], string> = {
  sfu: 'November, Arial, sans-serif',
  arial: 'Arial, Helvetica, sans-serif',
  serif: "Georgia, 'Times New Roman', serif",
  system: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

const RADII = { none: [0, 0], sm: [4, 2], md: [8, 4], lg: [16, 8] } as const;
const SHADOWS = {
  none: ['none', 'none'],
  sm: ['0 1px 3px rgba(0,0,0,.12)', '0 4px 12px rgba(0,0,0,.16)'],
  md: ['0 4px 14px rgba(0,0,0,.12)', '0 10px 28px rgba(0,0,0,.18)'],
  lg: ['0 12px 32px rgba(0,0,0,.16)', '0 18px 44px rgba(0,0,0,.24)'],
} as const;

/** Pick black or white text for a given background colour. */
export function contrastText(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#ffffff';
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.45 ? '#000000' : '#ffffff';
}

export function resolveTheme(common: Common): Theme {
  const p = THEMES[common.theme] ?? THEMES.light;
  const accent = common.accent || p.accent;
  const [radius, radiusSm] = RADII[common.radius] ?? RADII.md;
  const [shadow, shadowHover] = SHADOWS[common.shadow] ?? SHADOWS.sm;
  return {
    bg: p.bg, surface: p.surface, surfaceAlt: p.surfaceAlt,
    text: p.text, heading: p.heading, muted: p.muted, border: p.border,
    accent,
    onAccent: common.accent ? contrastText(common.accent) : p.onAccent,
    link: common.accent && !p.dark ? common.accent : p.link,
    font: FONTS[common.font] ?? FONTS.sfu,
    radius, radiusSm, shadow, shadowHover, dark: p.dark,
  };
}

export const DEFAULT_COMMON: Common = {
  theme: 'light',
  accent: '',
  font: 'sfu',
  radius: 'md',
  shadow: 'sm',
  maxWidth: 'full',
  spaceY: 'sm',
  entrance: 'none',
  duration: 600,
  delay: 0,
  stagger: 80,
  easing: 'smooth',
  hover: 'none',
};
