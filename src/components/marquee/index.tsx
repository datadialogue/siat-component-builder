import type { CSSProperties } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { defineComponent } from '../../lib/types';
import runtime from './runtime.es5.js?raw';

/*
 * Marquee: a band of large moving text (Hereford's mailing-list ticker, Stanford
 * Momentum's giant scroll-driven word). The markup is a static line clipped by
 * overflow:hidden; the runtime animates it. "loop" runs on its own, pauses on
 * hover/focus and has a pause button (WCAG 2.2.2). "scroll" follows the page scroll.
 * Reduced motion: static.
 */

interface Item { _id?: string; text: string; url: string }
interface Props {
  items: Item[];
  separator: '•' | '✳' | '/' | '—' | 'none';
  size: 'sm' | 'md' | 'lg' | 'xl';
  mode: 'loop' | 'scroll';
  speed: number;
  direction: 'left' | 'right';
  outline: boolean;
  uppercase: boolean;
  border: boolean;
}

const SIZES: Record<Props['size'], string> = {
  sm: '20px',
  md: 'clamp(26px, 4vw, 40px)',
  lg: 'clamp(40px, 7vw, 80px)',
  xl: 'clamp(64px, 15vw, 200px)',
};
const PAD: Record<Props['size'], string> = { sm: '12px', md: '18px', lg: '22px', xl: '18px' };

export default defineComponent<Props>({
  id: 'marquee',
  name: 'Marquee',
  category: 'Media',
  description: 'A band of big moving text: a looping ticker or a word that slides as you scroll.',
  icon: MoveHorizontal,
  commonDefaults: { spaceY: 'none' },
  fields: [
    {
      key: 'items', type: 'list', label: 'Text', itemLabel: 'phrase', titleKey: 'text', min: 1, max: 10,
      newItem: (i) => ({ text: ['Applications open now', 'Open house in March', 'Grad show in April'][i] ?? `Phrase ${i + 1}`, url: '' }),
      itemFields: [
        { key: 'text', type: 'text', label: 'Text' },
        { key: 'url', type: 'url', label: 'Link', help: 'Optional.' },
      ],
    },
    { key: 'separator', type: 'select', label: 'Separator', tab: 'style', options: [{ value: '•', label: '•' }, { value: '✳', label: '✳' }, { value: '/', label: '/' }, { value: '—', label: '—' }, { value: 'none', label: 'None' }] },
    { key: 'size', type: 'select', label: 'Size', tab: 'style', options: [{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'outline', type: 'toggle', label: 'Outline text', tab: 'style' },
    { key: 'uppercase', type: 'toggle', label: 'Capitals', tab: 'style' },
    { key: 'border', type: 'toggle', label: 'Lines above and below', tab: 'style' },
    { key: 'mode', type: 'select', label: 'Movement', tab: 'behaviour', options: [{ value: 'loop', label: 'Loop' }, { value: 'scroll', label: 'With scroll' }], help: 'Loop runs on its own, with a pause button. With scroll, the text slides as the page scrolls. Reduced motion: still.' },
    { key: 'speed', type: 'number', label: 'Speed', tab: 'behaviour', min: 20, max: 240, step: 10, unit: 'px/s', showIf: (p) => p.mode === 'loop' },
    { key: 'direction', type: 'select', label: 'Direction', tab: 'behaviour', options: [{ value: 'left', label: '←' }, { value: 'right', label: '→' }] },
  ],
  defaults: {
    items: [
      { text: 'Applications open now', url: 'https://www.sfu.ca/students/admission.html' },
      { text: 'Open house in March', url: '' },
      { text: 'Grad show in April', url: '' },
    ],
    separator: '✳',
    size: 'md',
    mode: 'loop',
    speed: 60,
    direction: 'left',
    outline: false,
    uppercase: false,
    border: true,
  },
  presets: [
    { name: 'Ticker', props: { size: 'sm', mode: 'loop', outline: false, uppercase: true, border: false, separator: '•' }, common: { theme: 'red' } },
    { name: 'Giant word', props: { size: 'xl', mode: 'scroll', outline: true, uppercase: true, border: false, separator: 'none' } },
    { name: 'Announcements', props: { size: 'md', mode: 'loop', outline: false, uppercase: false, border: false, separator: '✳' }, common: { theme: 'charcoal' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const color = t.heading;
    const textStyle: CSSProperties = sx.heading(20, {
      display: 'inline-block', fontSize: SIZES[p.size], lineHeight: 1.05, whiteSpace: 'nowrap',
      textTransform: p.uppercase ? 'uppercase' : 'none', letterSpacing: p.uppercase ? '.01em' : '-.01em',
      color: p.outline ? 'transparent' : color,
      // November is a variable font whose overlapping contours show through a stroke, so outline uses a static font.
      ...(p.outline ? { fontFamily: "Arial, Helvetica, sans-serif", fontWeight: 700, fontStretch: '100%', WebkitTextStroke: `${p.size === 'xl' ? 2 : 1.5}px ${t.dark ? '#ffffff' : t.heading}` } : {}),
      margin: 0, padding: 0,
    });
    const sep = p.separator === 'none' ? '' : p.separator;
    const sepStyle: CSSProperties = { ...textStyle, color: t.dark ? '#ffffff' : t.accent, WebkitTextStroke: '0', padding: '0 .45em', fontWeight: 400 };
    const gap = sep ? '0' : '.6em';

    const group = (copy: boolean) => (
      <div className="sfmq-g" {...(copy ? { 'aria-hidden': 'true' } : {})}
        style={{ display: 'flex', flex: '0 0 auto', alignItems: 'center', margin: 0, padding: `0 ${gap} 0 0`, whiteSpace: 'nowrap' }}>
        {p.items.map((it, i) => {
          const inner = it.url
            ? <a href={it.url} {...(copy ? { tabIndex: -1 } : ctx.edit(`items.${i}.text`, 'text'))} style={{ ...textStyle, textDecoration: 'none' }}>{it.text}</a>
            : <span {...(copy ? {} : ctx.edit(`items.${i}.text`, 'text'))} style={textStyle}>{it.text}</span>;
          return (
            <span key={(it._id ?? i) + (copy ? 'c' : '')} {...(copy ? {} : ctx.item('items', i))} style={{ display: 'inline-flex', alignItems: 'center', margin: 0, padding: 0, paddingRight: sep ? 0 : '.6em' }}>
              {inner}
              {sep && <span aria-hidden="true" style={sepStyle}>{sep}</span>}
            </span>
          );
        })}
      </div>
    );

    const line = p.border ? `1px solid ${t.dark ? 'rgba(255,255,255,.3)' : t.heading}` : 0;
    return (
      <div {...ctx.root('marquee', { position: 'relative', overflow: 'hidden', padding: `${PAD[p.size]} 0`, borderTop: line, borderBottom: line })}
        data-mode={p.mode} data-speed={String(p.speed)} data-dir={p.direction}>
        <div style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
          <div className="sfmq-vp" style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden', margin: 0, padding: 0 }}>
            <div className="sfmq-t" style={{ display: 'flex', width: 'max-content', margin: 0, padding: 0, willChange: 'transform' }}>
              {group(false)}
              {group(true)}
            </div>
          </div>
          <button type="button" className="sfmq-btn" aria-label="Pause" data-play="Play" data-pause="Pause"
            style={sx.buttonReset({
              display: 'none', flex: '0 0 auto', width: '32px', height: '32px', margin: '0 12px', borderRadius: '50%',
              background: 'transparent', color: t.dark ? '#ffffff' : t.heading,
              border: `1.5px solid ${t.dark ? 'rgba(255,255,255,.55)' : t.border}`,
            })}>
            <svg className="sfmq-i-pause" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false" style={{ display: 'block', margin: '0 auto' }}>
              <rect x="3" y="2" width="3.5" height="12" fill="currentColor" /><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor" />
            </svg>
            <svg className="sfmq-i-play" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false" style={{ display: 'none', margin: '0 auto' }}>
              <path d="M4 2l10 6-10 6z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    );
  },
});
