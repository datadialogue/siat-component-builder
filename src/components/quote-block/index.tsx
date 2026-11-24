import type { CSSProperties } from 'react';
import { Quote as QuoteIcon } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

/*
 * Quote Block: a big quote with a photo, used as a pause between sections
 * (Moore's student quotes, Schwarzman's "In their own words", LSAD's alumni cards).
 * Two or more quotes become a slider with dots and prev/next; without JS they stack.
 */

interface Q { _id?: string; quote: string; name: string; role: string; image: ImageValue }
interface Props {
  quotes: Q[];
  layout: 'left' | 'right' | 'bg' | 'none';
  size: 'md' | 'lg' | 'xl';
  shape: '1:1' | '3:4' | '4:3';
  mark: boolean;
  autoplay: boolean;
  interval: number;
}

const newQuote = (i: number): Q => ({
  quote: [
    'I came in thinking I would make games. I ended up designing how people feel when they play them.',
    'The best part is the mix. Artists, coders and designers all in one room, all on one project.',
    'My capstone team built something real for a real partner. That is what got me my first job.',
  ][i % 3],
  name: ['Student name', 'Student name', 'Alum name'][i % 3],
  role: ['BA, Interactive Arts & Technology', 'Design concentration', 'Class of 2024'][i % 3],
  image: placeholderImage(i + 1, '3:4'),
});

const SIZES: Record<Props['size'], string> = {
  md: 'clamp(20px, 2.6vw, 24px)',
  lg: 'clamp(22px, 3.4vw, 32px)',
  xl: 'clamp(26px, 4.6vw, 44px)',
};

export default defineComponent<Props>({
  id: 'quote-block',
  name: 'Quote Block',
  category: 'Content',
  description: 'A big quote with a photo. Two or more quotes become a slider.',
  icon: QuoteIcon,
  fields: [
    {
      key: 'quotes', type: 'list', label: 'Quotes', itemLabel: 'quote', titleKey: 'name', thumbKey: 'image', min: 1, max: 8,
      newItem: newQuote,
      itemFields: [
        { key: 'quote', type: 'text', label: 'Quote', multiline: true },
        { key: 'name', type: 'text', label: 'Name' },
        { key: 'role', type: 'text', label: 'Role' },
        { key: 'image', type: 'image', label: 'Photo' },
      ],
    },
    { key: 'layout', type: 'select', label: 'Layout', tab: 'style', options: [{ value: 'left', label: 'Photo left' }, { value: 'right', label: 'Photo right' }, { value: 'bg', label: 'Photo behind' }, { value: 'none', label: 'No photo' }] },
    { key: 'size', type: 'select', label: 'Quote size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'shape', type: 'select', label: 'Photo shape', tab: 'style', options: [{ value: '3:4', label: 'Portrait' }, { value: '1:1', label: 'Square' }, { value: '4:3', label: 'Landscape' }], showIf: (p) => p.layout === 'left' || p.layout === 'right' },
    { key: 'mark', type: 'toggle', label: 'Quote mark', tab: 'style' },
    { key: 'autoplay', type: 'toggle', label: 'Autoplay', tab: 'behaviour', help: 'With two or more quotes. Pauses on hover and focus, and has a pause button. Off for reduced motion.' },
    { key: 'interval', type: 'number', label: 'Time per quote', tab: 'behaviour', min: 3000, max: 15000, step: 500, unit: 'ms', showIf: (p) => p.autoplay },
  ],
  defaults: {
    quotes: [newQuote(0), newQuote(1)],
    layout: 'left',
    size: 'lg',
    shape: '3:4',
    mark: true,
    autoplay: false,
    interval: 7000,
  },
  presets: [
    { name: 'Photo + quote', props: { layout: 'left', size: 'lg', shape: '3:4', mark: true } },
    { name: 'Full bleed', props: { layout: 'bg', size: 'lg', mark: true }, common: { theme: 'charcoal', radius: 'none' } },
    { name: 'Colour card', props: { layout: 'right', size: 'md', shape: '1:1', mark: false }, common: { theme: 'grey', radius: 'lg' } },
  ],
  runtime: (p) => (p.quotes.length > 1 ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const bg = p.layout === 'bg';
    const side = p.layout === 'left' || p.layout === 'right';
    const multi = p.quotes.length > 1;
    const padded = t.bg !== 'transparent' && !bg;
    const fg = bg ? '#ffffff' : t.heading;
    const sub = bg ? 'rgba(255,255,255,.82)' : t.muted;
    const accent = bg ? '#ffffff' : t.dark ? '#ffffff' : t.accent;

    const text = (q: Q, i: number) => (
      <div style={{ flex: '1 1 320px', minWidth: 0, margin: 0, padding: bg ? 'clamp(24px, 5vw, 56px)' : 0, position: 'relative', boxSizing: 'border-box', alignSelf: 'center' }}>
        {p.mark && <div aria-hidden="true" style={sx.heading(96, { fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, color: accent, lineHeight: 0.8, height: '0.5em', margin: '0 0 12px 0' })}>&ldquo;</div>}
        <blockquote style={{ margin: 0, padding: 0, border: 0, quotes: 'none' }}>
          <p {...ctx.edit(`quotes.${i}.quote`, 'text')}
            style={sx.text({ fontSize: SIZES[p.size], lineHeight: 1.32, fontWeight: 500, letterSpacing: '-.005em', color: fg, margin: 0, maxWidth: '30em' })}>
            {q.quote}
          </p>
        </blockquote>
        {(q.name || q.role) && (
          <div style={{ margin: '24px 0 0 0', padding: '0 0 0 14px', borderLeft: `3px solid ${accent}` }}>
            {q.name && <div {...ctx.edit(`quotes.${i}.name`, 'text')} style={sx.text({ fontSize: '16px', fontWeight: 700, color: fg, lineHeight: 1.35 })}>{q.name}</div>}
            {q.role && <div {...ctx.edit(`quotes.${i}.role`, 'text')} style={sx.small({ color: sub, margin: '2px 0 0 0' })}>{q.role}</div>}
          </div>
        )}
      </div>
    );

    const slide = (q: Q, i: number) => {
      if (bg) {
        return (
          <figure key={q._id ?? i} className="sfqb-s" {...ctx.item('quotes', i)} {...ctx.reveal()}
            style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', minHeight: '440px', margin: 0, padding: 0, overflow: 'hidden', background: '#1a1a1a', borderRadius: `${t.radius}px` }}>
            {q.image.src && <img src={q.image.src} alt={q.image.alt} loading="lazy" {...ctx.edit(`quotes.${i}.image`, 'image')} style={sx.imgFill('cover', q.image.pos)} />}
            <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0, background: 'linear-gradient(to right, rgba(0,0,0,.82) 0%, rgba(0,0,0,.55) 55%, rgba(0,0,0,.15) 100%)' }} />
            <figcaption style={{ position: 'relative', margin: 0, padding: 0, width: '100%', maxWidth: '760px' }}>{text(q, i)}</figcaption>
          </figure>
        );
      }
      return (
        <figure key={q._id ?? i} className="sfqb-s" {...ctx.item('quotes', i)} {...ctx.reveal()}
          style={{ display: 'flex', flexWrap: 'wrap', flexDirection: p.layout === 'right' ? 'row-reverse' : 'row', alignItems: 'center', gap: 'clamp(24px, 4vw, 56px)', margin: 0, padding: 0 }}>
          {side && (
            <div style={{ flex: '0 1 340px', minWidth: '200px', maxWidth: '100%', margin: 0, padding: 0, borderRadius: `${t.radius}px`, overflow: 'hidden', boxShadow: t.shadow }}>
              <div style={sx.ratio(p.shape)}>
                <img src={q.image.src} alt={q.image.alt} loading="lazy" {...ctx.edit(`quotes.${i}.image`, 'image')} style={sx.imgFill('cover', q.image.pos)} />
              </div>
            </div>
          )}
          <figcaption style={{ flex: '1 1 320px', minWidth: 0, margin: 0, padding: 0 }}>{text(q, i)}</figcaption>
        </figure>
      );
    };

    const btn: CSSProperties = sx.buttonReset({
      width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${t.dark ? 'rgba(255,255,255,.5)' : t.border}`,
      color: t.dark ? '#ffffff' : t.heading, background: 'transparent', fontSize: '18px', lineHeight: '36px', textAlign: 'center',
    });
    const dotOn = `background:${t.dark ? '#ffffff' : t.accent};width:22px;`;
    const dotOff = `background:${t.dark ? 'rgba(255,255,255,.4)' : '#c4c5c7'};width:8px;`;

    return (
      <div {...ctx.root('quote-block', { padding: padded ? 'clamp(24px, 4vw, 48px)' : 0, borderRadius: padded ? `${t.radius}px` : 0 })}
        {...(multi ? { 'data-auto': p.autoplay ? String(p.interval) : '0', 'data-on': dotOn, 'data-off': dotOff } : {})}>
        <div className="sfqb-t" style={{ display: 'flex', flexDirection: 'column', gap: '40px', margin: 0, padding: 0 }}>
          {p.quotes.map(slide)}
        </div>
        {multi && (
          <div className="sfqb-c" style={{ display: 'none', alignItems: 'center', gap: '16px', margin: '24px 0 0 0', padding: 0, flexWrap: 'wrap' }}>
            <button type="button" className="sfqb-prev" aria-label="Previous quote" style={btn}>&larr;</button>
            <button type="button" className="sfqb-next" aria-label="Next quote" style={btn}>&rarr;</button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '0 0 0 4px', padding: 0 }}>
              {p.quotes.map((q, i) => (
                <button key={q._id ?? i} type="button" className="sfqb-dot" aria-label={`Quote ${i + 1}`}
                  style={sx.buttonReset({ display: 'block', height: '8px', width: '8px', borderRadius: '4px', background: '#c4c5c7', transition: 'width .3s ease, background-color .3s ease' })} />
              ))}
            </div>
            {p.autoplay && (
              <button type="button" className="sfqb-pause" aria-label="Pause" data-play="Play" data-pause="Pause"
                style={sx.buttonReset({ margin: '0 0 0 auto', fontFamily: t.font, fontSize: '13px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: t.dark ? '#ffffff' : t.heading })}>
                Pause
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
});
