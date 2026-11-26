import type { CSSProperties } from 'react';
import { TextCursorInput } from 'lucide-react';
import { defineComponent } from '../../lib/types';
import { SFU, contrastText } from '../../theme/theme';
import { PROJECTS } from '../showcase/projects';
import runtime from './runtime.es5.js?raw';

/*
 * Rotating Sentence: a fixed start ("At SIAT, we make") finished by a phrase that
 * keeps changing, each phrase optionally a link (the MIT Media Lab "We work where
 * ideas collide:" pattern). The markup ships the sentence with the first phrase
 * (and, optionally, an index of every phrase), so it reads fine without JS.
 * The runtime rotates with roll / type / scramble / fade, or "reel": every phrase in a
 * vertical column that rolls up one step at a time, neighbours faded above and below.
 * It also fills progress segments,
 * and pauses on hover, focus, off-screen and with the pause button.
 */

interface Item { _id?: string; text: string; url: string }
interface Props {
  eyebrow: string;
  before: string;
  items: Item[];
  after: string;
  layout: 'inline' | 'stacked';
  size: 'md' | 'lg' | 'xl';
  weight: 'light' | 'bold';
  highlight: 'colour' | 'underline' | 'pill' | 'marker';
  cycle: boolean;
  align: 'left' | 'center';
  effect: 'roll' | 'type' | 'scramble' | 'fade' | 'reel';
  speed: number;
  order: 'list' | 'shuffle';
  timer: boolean;
  index: 'none' | 'list';
}

/** Height of one reel row in em (line-height 1.16 + .12em padding). */
const REEL_ROW = 1.28;

const SIZES: Record<Props['size'], string> = {
  md: 'clamp(24px, 3.6vw, 32px)',
  lg: 'clamp(28px, 5vw, 46px)',
  xl: 'clamp(34px, 7vw, 68px)',
};

const proj = (title: string) => PROJECTS.find((p) => p.title === title)?.url ?? 'https://www.sfu.ca/siat/showcase.html';

/** "text-decoration-color:red;-webkit-x:y;" -> { textDecorationColor: 'red', WebkitX: 'y' } */
function cssObj(css: string): CSSProperties {
  const o: Record<string, string> = {};
  css.split(';').forEach((d) => {
    const i = d.indexOf(':');
    if (i < 1) return;
    const k = d.slice(0, i).trim().replace(/^-(\w)/, (_, c) => c.toUpperCase()).replace(/-(\w)/g, (_, c) => c.toUpperCase());
    o[k] = d.slice(i + 1).trim();
  });
  return o as CSSProperties;
}

function rgba(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0xcc0633;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export default defineComponent<Props>({
  id: 'rotator',
  name: 'Rotating Sentence',
  category: 'Content',
  description: 'A sentence whose ending keeps changing. Each ending can be a link.',
  icon: TextCursorInput,
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Label' },
    { key: 'before', type: 'text', label: 'Sentence start', multiline: true, help: 'The fixed words before the changing part, e.g. "At SIAT, we make".' },
    {
      key: 'items', type: 'list', label: 'Changing part', itemLabel: 'ending', titleKey: 'text', min: 1, max: 16,
      newItem: (i) => ({ text: `something new ${i + 1}`, url: '' }),
      itemFields: [
        { key: 'text', type: 'text', label: 'Text' },
        { key: 'url', type: 'url', label: 'Link', help: 'Optional. The phrase becomes a link while it is showing.' },
      ],
    },
    { key: 'after', type: 'text', label: 'Sentence end', help: 'Optional words after the changing part, e.g. "." or "every day."' },
    { key: 'layout', type: 'select', label: 'Layout', tab: 'style', showIf: (p) => p.effect !== 'reel', options: [{ value: 'inline', label: 'One line' }, { value: 'stacked', label: 'Stacked' }], help: 'Stacked puts the start on its own smaller line above the changing part.' },
    { key: 'size', type: 'select', label: 'Size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'weight', type: 'select', label: 'Weight', tab: 'style', options: [{ value: 'light', label: 'Light' }, { value: 'bold', label: 'Bold' }] },
    { key: 'highlight', type: 'select', label: 'Highlight', tab: 'style', options: [{ value: 'colour', label: 'Colour' }, { value: 'underline', label: 'Underline' }, { value: 'pill', label: 'Pill' }, { value: 'marker', label: 'Marker' }] },
    { key: 'cycle', type: 'toggle', label: 'Change colours', tab: 'style', help: 'Each phrase takes the next colour from the SFU palette.' },
    { key: 'align', type: 'select', label: 'Align', tab: 'style', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
    { key: 'index', type: 'select', label: 'Index', tab: 'style', options: [{ value: 'none', label: 'None' }, { value: 'list', label: 'All phrases' }], help: 'Lists every phrase under the sentence. The one showing is marked; hovering one shows it.' },
    { key: 'effect', type: 'select', label: 'Effect', tab: 'behaviour', options: [{ value: 'roll', label: 'Roll' }, { value: 'type', label: 'Type' }, { value: 'scramble', label: 'Scramble' }, { value: 'fade', label: 'Fade' }, { value: 'reel', label: 'Reel' }], help: 'How one phrase changes to the next. Reel stacks every phrase in a column that rolls up, with the ones before and after faded. Reduced-motion visitors get a plain swap.' },
    { key: 'speed', type: 'number', label: 'Hold', tab: 'behaviour', min: 1.5, max: 8, step: 0.5, unit: 's', help: 'How long each phrase stays before the next one.' },
    { key: 'order', type: 'select', label: 'Order', tab: 'behaviour', showIf: (p) => p.effect !== 'reel', options: [{ value: 'list', label: 'In order' }, { value: 'shuffle', label: 'Shuffle' }] },
    { key: 'timer', type: 'toggle', label: 'Progress', tab: 'behaviour', help: 'Small segments, one per phrase, that fill up until the next phrase.' },
  ],
  defaults: {
    eyebrow: 'Student work',
    before: 'At SIAT, we make',
    items: [
      { text: 'virtual worlds you shrink into', url: proj('Atom Viscera') },
      { text: 'charts that count the carbon cost of AI', url: proj('Every AI Query Has a Carbon Cost') },
      { text: 'games about hard choices', url: proj('End of the World') },
      { text: 'apps that ask players how they feel', url: proj('Moody') },
      { text: 'animated diamond heists', url: proj('Under Pressure') },
      { text: 'stories about robots and gardens', url: proj('Lumi & Pip') },
    ],
    after: '.',
    layout: 'inline',
    size: 'lg',
    weight: 'bold',
    highlight: 'colour',
    cycle: true,
    align: 'left',
    effect: 'roll',
    speed: 2.5,
    order: 'list',
    timer: true,
    index: 'none',
  },
  presets: [
    { name: 'Sentence', props: { layout: 'inline', highlight: 'colour', cycle: true, align: 'left', weight: 'bold', effect: 'roll', index: 'none' } },
    { name: 'Pills', props: { layout: 'inline', highlight: 'pill', cycle: true, align: 'center', weight: 'light', effect: 'fade', index: 'none' } },
    { name: 'Typewriter', props: { layout: 'stacked', highlight: 'underline', cycle: false, align: 'left', weight: 'bold', effect: 'type', size: 'xl', index: 'none' }, common: { theme: 'charcoal' } },
    { name: 'Reel', props: { highlight: 'colour', cycle: true, align: 'left', weight: 'bold', effect: 'reel', size: 'lg', index: 'none' } },
    { name: 'Index', props: { layout: 'stacked', highlight: 'marker', cycle: false, align: 'left', weight: 'bold', effect: 'scramble', index: 'list' }, common: { theme: 'grey' } },
  ],
  runtime: (p) => (p.items.length > 1 ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const center = p.align === 'center';
    const light = p.weight === 'light';
    const reel = p.effect === 'reel' && p.items.length > 1;
    // The reel always sits on its own lines under the sentence start.
    const stacked = p.layout === 'stacked' || reel;
    const padded = t.bg !== 'transparent';
    const items = p.items.length ? p.items : [{ text: '…', url: '' }];

    // Colour per phrase.
    const lightCycle = [t.accent, '#000000', SFU.darkRed, SFU.charcoal];
    const darkCycle = ['#ffffff', '#ffc2cc', '#ff8fa1', '#e6e7e8'];
    const one = t.dark ? '#ffffff' : t.accent;
    const colourOf = (i: number) => (p.cycle ? (t.dark ? darkCycle : lightCycle)[i % 4] : one);

    // Every phrase's full inline style as a string: the runtime applies these when it swaps.
    // Phrases stay display:inline so a long one wraps like the rest of the sentence;
    // highlights are backgrounds (cloned per line) so they survive word-by-word animation.
    const base = `display:inline;margin:0;padding:0;text-decoration:none;font-weight:${light ? 700 : 'inherit'};-webkit-box-decoration-break:clone;box-decoration-break:clone;`;
    const itemCss = (i: number): string => {
      const c = colourOf(i);
      switch (p.highlight) {
        case 'underline':
          return `${base}color:${t.heading};padding:0 0 .06em 0;background:linear-gradient(${c}, ${c}) 0 100% / 100% .09em no-repeat;`;
        case 'pill':
          return `${base}color:${/^#/.test(c) ? contrastText(c) : t.onAccent};background:${c};padding:0 .28em .04em .28em;border-radius:.22em;`;
        case 'marker':
          return `${base}color:${t.heading};padding:0 .06em;background:linear-gradient(transparent 60%, ${t.dark ? 'rgba(255,255,255,.3)' : rgba(c, 0.26)} 60%);`;
        default:
          return `${base}color:${c};`;
      }
    };
    const arrowCss = 'display:inline-block;margin:0 0 0 .16em;padding:0;font-size:.55em;line-height:1;vertical-align:.5em;font-weight:700;text-decoration:none;';
    const first = items[0];
    const FirstTag = first.url ? 'a' : 'span';
    const data = JSON.stringify(items.map((it, i) => ({ t: it.text, u: it.url || '', s: itemCss(i) })));

    const linkOn = `color:${t.heading};border-bottom-color:${one};`;
    const linkOff = `color:${t.muted};border-bottom-color:transparent;`;
    const many = items.length > 1;
    const afterText = p.after ? (/^[\s.,;:!?)]/.test(p.after) ? p.after : ` ${p.after}`) : '';
    const hasIndex = p.index === 'list';
    const track = t.dark ? 'rgba(255,255,255,.22)' : t.border;

    return (
      <div {...ctx.root('rotator', { padding: padded ? '48px clamp(20px, 4vw, 48px)' : 0, textAlign: center ? 'center' : 'left', borderRadius: padded ? `${t.radius}px` : 0 })}
        data-effect={p.effect} data-hold={String(Math.round((p.speed || 2.5) * 1000))} data-order={p.order}
        data-items={data} data-arrow={arrowCss} data-on={linkOn} data-off={linkOff}>
        {p.eyebrow && <div {...ctx.edit('eyebrow', 'text')} style={sx.eyebrow({ margin: '0 0 18px 0', color: t.dark ? t.muted : t.accent })}>{p.eyebrow}</div>}
        <h2 {...ctx.reveal()}
          style={sx.heading(30, {
            fontSize: SIZES[p.size], lineHeight: 1.16, fontWeight: light ? 400 : 800, fontStretch: light ? '100%' : '83%',
            letterSpacing: light ? '-.005em' : '-.015em', color: t.heading, margin: 0,
            maxWidth: center ? '20em' : '22em', marginLeft: center ? 'auto' : 0, marginRight: center ? 'auto' : 0,
          })}>
          {p.before && (
            <span {...ctx.edit('before', 'text')} style={stacked
              ? { display: 'block', margin: '0 0 .3em 0', padding: 0, fontSize: '.5em', lineHeight: 1.25, fontWeight: light ? 400 : 700, color: t.dark ? t.muted : t.text }
              : { margin: 0, padding: 0 }}>
              {p.before}
            </span>
          )}
          {p.before && !stacked && ' '}
          {reel ? (
            /* Reel: every phrase on its own row in a column that the runtime rolls upward.
               Three rows show (before, current, after), faded at the edges. Without JS the
               first phrase sits in the middle row and the next one peeks in below. */
            <span className="sfrt-slot sfrt-reel" aria-live="off"
              style={{
                display: 'block', position: 'relative', height: `${REEL_ROW * 3}em`, overflow: 'hidden', margin: 0, padding: 0,
                WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000000 34%, #000000 66%, transparent 100%)',
                maskImage: 'linear-gradient(180deg, transparent 0%, #000000 34%, #000000 66%, transparent 100%)',
              } as CSSProperties}>
              <span className="sfrt-col" style={{ display: 'block', margin: 0, padding: `${REEL_ROW}em 0 0 0`, willChange: 'transform' }}>
                {items.map((it, i) => {
                  const Tag = it.url ? 'a' : 'span';
                  return (
                    <span key={(it as Item)._id ?? i} className="sfrt-row" data-i={String(i)}
                      style={{ display: 'block', margin: 0, padding: '.06em 0', opacity: i === 0 ? 1 : 0.22, transition: 'opacity .5s ease' }}>
                      <Tag {...(it.url ? { href: it.url } : {})} {...ctx.edit(`items.${i}.text`, 'text')} style={cssObj(itemCss(i))}>
                        {it.text}
                        {it.url && <span aria-hidden="true" style={cssObj(arrowCss)}>&rarr;</span>}
                      </Tag>
                      {afterText && <span style={{ margin: 0, padding: 0, color: t.heading }}>{afterText}</span>}
                    </span>
                  );
                })}
              </span>
            </span>
          ) : (
            <span className="sfrt-slot" aria-live="off" style={{ display: 'inline', margin: 0, padding: 0 }}>
              <FirstTag className="sfrt-cur" {...(first.url ? { href: first.url } : {})} {...ctx.edit('items.0.text', 'text')} style={cssObj(itemCss(0))}>
                {first.text}
                {first.url && <span aria-hidden="true" style={cssObj(arrowCss)}>&rarr;</span>}
              </FirstTag>
            </span>
          )}
          {!reel && afterText && <span {...ctx.edit('after', 'text')} style={{ margin: 0, padding: 0, color: t.heading }}>{afterText}</span>}
        </h2>

        {(hasIndex || many) && (
          <div style={{ margin: hasIndex ? '28px 0 0 0' : '22px 0 0 0', padding: 0 }}>
            {hasIndex && (
              <div role="list" className="sfrt-index" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 22px', justifyContent: center ? 'center' : 'flex-start', margin: 0, padding: 0 }}>
                {items.map((it, i) => {
                  const Tag = it.url ? 'a' : 'span';
                  return (
                    <div role="listitem" key={(it as Item)._id ?? i} {...ctx.item('items', i)} style={{ margin: 0, padding: 0 }}>
                      <Tag className="sfrt-ix" data-i={String(i)} {...(it.url ? { href: it.url } : {})} {...ctx.edit(`items.${i}.text`, 'text')}
                        style={sx.link({
                          display: 'inline-block', margin: 0, padding: '0 0 3px 0', fontFamily: t.font, fontSize: '15px', lineHeight: 1.35, fontWeight: 700,
                          textDecoration: 'none', borderBottom: '2px solid transparent', transition: 'color .2s ease, border-color .2s ease',
                          ...cssObj(i === 0 ? linkOn : linkOff),
                        })}>
                        {it.text}
                      </Tag>
                    </div>
                  );
                })}
              </div>
            )}
            {many && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: center ? 'center' : 'flex-start', margin: hasIndex ? '20px 0 0 0' : 0, padding: 0 }}>
                {p.timer && (
                  <div className="sfrt-steps" aria-hidden="true" style={{ display: 'none', flexWrap: 'wrap', gap: '4px', margin: 0, padding: 0 }}>
                    {items.map((_, i) => (
                      <span key={i} style={{ display: 'block', position: 'relative', width: '22px', height: '3px', margin: 0, padding: 0, background: track, borderRadius: '2px', overflow: 'hidden' }}>
                        <span className="sfrt-sf" style={{ display: 'block', width: '100%', height: '100%', margin: 0, padding: 0, background: one, transformOrigin: '0 50%', transform: 'scaleX(0)' }} />
                      </span>
                    ))}
                  </div>
                )}
                <button type="button" className="sfrt-pause" aria-label="Pause rotating text" aria-pressed="false"
                  style={sx.buttonReset({
                    display: 'none', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', width: '28px', height: '28px',
                    borderRadius: '50%', border: `1.5px solid ${track}`, color: t.heading,
                  })}>
                  <span className="sfrt-ip" style={{ display: 'flex', gap: '3px', margin: 0, padding: 0 }}>
                    <span style={{ display: 'block', width: '3px', height: '10px', margin: 0, padding: 0, background: 'currentColor' }} />
                    <span style={{ display: 'block', width: '3px', height: '10px', margin: 0, padding: 0, background: 'currentColor' }} />
                  </span>
                  <span className="sfrt-iy" style={{ display: 'none', width: 0, height: 0, margin: '0 0 0 2px', padding: 0, borderLeft: '9px solid currentColor', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' }} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
});
