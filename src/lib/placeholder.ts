import type { ImageValue } from './types';

const COLORS = ['#a6192e', '#1f6f8b', '#2e7d32', '#6a1b9a', '#ef6c00', '#37474f', '#00838f', '#ad1457', '#5d4037'];

/**
 * Lightweight SVG placeholder (data URI). Lint reports these as "placeholder"
 * so the author remembers to swap in DAM images before publishing.
 */
export function placeholderSrc(n: number, ratio = '4:3', label?: string): string {
  const [w, h] = ratio.split(':').map(Number);
  const W = 400;
  const H = Math.round((W * (h || 3)) / (w || 4));
  const fill = COLORS[(n - 1 + COLORS.length) % COLORS.length];
  const text = label ?? String(n);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}'><rect width='${W}' height='${H}' fill='${fill}'/><text x='50%' y='50%' dy='.35em' font-size='${Math.round(H / 3)}' fill='white' fill-opacity='.85' text-anchor='middle' font-family='sans-serif'>${text}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%27/g, "'");
}

export function placeholderImage(n: number, ratio = '4:3', alt?: string, label?: string): ImageValue {
  return { src: placeholderSrc(n, ratio, label), alt: alt ?? `Describe image ${n}`, pos: '50% 50%' };
}

export function isPlaceholder(src: string): boolean {
  return src.startsWith('data:image/svg+xml');
}
