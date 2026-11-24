import type { Field } from './types';
import { THEMES } from '../theme/theme';

/** Shared settings shown for every component. Keys are relative to doc.common. */
export const COMMON_STYLE_FIELDS: Field[] = [
  { key: 'theme', type: 'select', label: 'Theme', options: Object.entries(THEMES).map(([value, t]) => ({ value, label: t.name })) },
  { key: 'accent', type: 'color', label: 'Accent colour', allowAuto: true, help: 'Buttons, highlights and active states. "Auto" uses the theme colour.' },
  { key: 'font', type: 'select', label: 'Font', options: [{ value: 'sfu', label: 'SFU' }, { value: 'arial', label: 'Arial' }, { value: 'serif', label: 'Serif' }, { value: 'system', label: 'System' }], help: 'SFU = November, the font used on sfu.ca.' },
  { key: 'radius', type: 'select', label: 'Corners', options: [{ value: 'none', label: 'Square' }, { value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }] },
  { key: 'shadow', type: 'select', label: 'Shadow', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }] },
  { key: 'maxWidth', type: 'select', label: 'Max width', options: [{ value: 'full', label: 'Full' }, { value: '1200', label: '1200' }, { value: '960', label: '960' }, { value: '720', label: '720' }], help: 'Caps the width and centres the component.' },
  { key: 'spaceY', type: 'select', label: 'Space above/below', options: [{ value: 'none', label: '0' }, { value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }] },
];

export const COMMON_MOTION_FIELDS: Field[] = [
  {
    key: 'entrance', type: 'select', label: 'Entrance', help: 'Plays when the component scrolls into view. Skipped for visitors who prefer reduced motion.',
    options: [{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade' }, { value: 'up', label: 'Rise' }, { value: 'down', label: 'Drop' }, { value: 'left', label: 'From left' }, { value: 'right', label: 'From right' }, { value: 'zoom', label: 'Zoom' }],
  },
  { key: 'duration', type: 'number', label: 'Duration', min: 150, max: 2000, step: 50, unit: 'ms', showIf: (c) => c.entrance !== 'none' },
  { key: 'delay', type: 'number', label: 'Delay', min: 0, max: 2000, step: 50, unit: 'ms', showIf: (c) => c.entrance !== 'none' },
  { key: 'stagger', type: 'number', label: 'Stagger', min: 0, max: 400, step: 20, unit: 'ms', help: 'Delay between items that appear together (cards, blocks…).', showIf: (c) => c.entrance !== 'none' },
  { key: 'easing', type: 'select', label: 'Easing', options: [{ value: 'smooth', label: 'Smooth' }, { value: 'spring', label: 'Bouncy' }, { value: 'linear', label: 'Linear' }], showIf: (c) => c.entrance !== 'none' },
  { key: 'hover', type: 'select', label: 'Hover effect', options: [{ value: 'none', label: 'None' }, { value: 'lift', label: 'Lift' }, { value: 'zoom', label: 'Zoom' }, { value: 'glow', label: 'Glow' }], help: 'Applies to cards, buttons and other hoverable items.' },
];
