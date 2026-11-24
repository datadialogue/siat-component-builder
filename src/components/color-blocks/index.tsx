import type { CSSProperties } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import { SFU } from '../../theme/theme';
import runtime from './runtime.es5.js?raw';

/*
 * Colour Blocks: a wall of solid SFU-colour tiles and photo tiles (MICA's audience grid,
 * SAIC / Hereford colour pacing). Flex-wrap, not grid spans, so wide tiles never overflow
 * when the row collapses on small screens.
 */

type Swatch = 'auto' | 'red' | 'darkRed' | 'charcoal' | 'black' | 'paleGrey' | 'white';
interface Tile {
  _id?: string;
  kind: 'text' | 'image';
  color: Swatch;
  eyebrow: string;
  title: string;
  text: string;
  link1Label: string; link1Url: string;
  link2Label: string; link2Url: string;
  image: ImageValue;
  wide: boolean;
}
interface Props {
  heading: string;
  intro: string;
  tiles: Tile[];
  palette: 'mixed' | 'bold' | 'quiet';
  gap: '0' | '4' | '12' | '24';
  height: number;
  titleSize: 'md' | 'lg';
}

// Background / heading / body / link colours per swatch (all SFU palette).
const SW: Record<Exclude<Swatch, 'auto'>, { bg: string; h: string; t: string; a: string; line?: string }> = {
  red: { bg: SFU.red, h: '#ffffff', t: 'rgba(255,255,255,.9)', a: '#ffffff' },
  darkRed: { bg: SFU.darkRed, h: '#ffffff', t: 'rgba(255,255,255,.9)', a: '#ffffff' },
  charcoal: { bg: SFU.charcoal, h: '#ffffff', t: 'rgba(255,255,255,.86)', a: '#ffffff' },
  black: { bg: SFU.black, h: '#ffffff', t: 'rgba(255,255,255,.82)', a: '#ffffff' },
  paleGrey: { bg: SFU.paleGrey, h: SFU.charcoal, t: '#1a1a1a', a: SFU.darkRed },
  white: { bg: SFU.white, h: SFU.charcoal, t: '#1a1a1a', a: SFU.darkRed, line: SFU.lightGrey },
};
const PALETTES: Record<Props['palette'], Exclude<Swatch, 'auto'>[]> = {
  mixed: ['red', 'white', 'charcoal', 'paleGrey', 'darkRed', 'black'],
  bold: ['red', 'black', 'darkRed', 'charcoal'],
  quiet: ['paleGrey', 'white'],
};

const newTile = (i: number): Tile => ({
  kind: i === 1 || i === 4 ? 'image' : 'text',
  color: 'auto',
  eyebrow: ['Audience one', '', 'Audience two', 'Audience three', '', 'Audience four'][i] ?? 'Label',
  title: ['A short, direct heading', '', 'Another short heading', 'Third heading here', '', 'Fourth heading'][i] ?? `Heading ${i + 1}`,
  text: 'One or two sentences about who this is for and where to go next.',
  link1Label: 'First link', link1Url: 'https://www.sfu.ca/siat.html',
  link2Label: i % 2 ? '' : 'Second link', link2Url: i % 2 ? '' : 'https://www.sfu.ca/siat.html',
  image: placeholderImage(i + 1, '4:3'),
  wide: i === 0,
});

const swatchOptions = [
  { value: 'auto', label: 'Auto' }, { value: 'red', label: 'SFU Red' }, { value: 'darkRed', label: 'Dark Red' },
  { value: 'charcoal', label: 'Charcoal' }, { value: 'black', label: 'Black' }, { value: 'paleGrey', label: 'Pale Grey' }, { value: 'white', label: 'White' },
];

export default defineComponent<Props>({
  id: 'color-blocks',
  name: 'Colour Blocks',
  category: 'Layout',
  description: 'A wall of bold SFU-colour tiles and photos, e.g. one tile per audience.',
  icon: LayoutDashboard,
  commonDefaults: { hover: 'zoom', radius: 'none', shadow: 'none' },
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    { key: 'intro', type: 'text', label: 'Intro', multiline: true },
    {
      key: 'tiles', type: 'list', label: 'Tiles', itemLabel: 'tile', titleKey: 'title', thumbKey: 'image', min: 1, max: 12,
      newItem: newTile,
      itemFields: [
        { key: 'kind', type: 'select', label: 'Type', options: [{ value: 'text', label: 'Colour + text' }, { value: 'image', label: 'Photo' }] },
        { key: 'color', type: 'select', label: 'Colour', options: swatchOptions, help: '"Auto" picks the next colour from the palette (Style tab).', showIf: (t) => t.kind !== 'image' },
        { key: 'image', type: 'image', label: 'Image', showIf: (t) => t.kind === 'image' },
        { key: 'eyebrow', type: 'text', label: 'Label' },
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text', multiline: true, showIf: (t) => t.kind !== 'image' },
        { key: 'link1Label', type: 'text', label: 'Link 1 text' },
        { key: 'link1Url', type: 'url', label: 'Link 1' },
        { key: 'link2Label', type: 'text', label: 'Link 2 text', showIf: (t) => t.kind !== 'image' },
        { key: 'link2Url', type: 'url', label: 'Link 2', showIf: (t) => t.kind !== 'image' },
        { key: 'wide', type: 'toggle', label: 'Wide', help: 'Takes about two tiles of space. Drops to full width on small screens.' },
      ],
    },
    { key: 'palette', type: 'select', label: 'Palette', tab: 'style', options: [{ value: 'mixed', label: 'Mixed' }, { value: 'bold', label: 'Bold' }, { value: 'quiet', label: 'Quiet' }], help: 'Colours used by tiles set to "Auto".' },
    { key: 'gap', type: 'select', label: 'Gap', tab: 'style', options: [{ value: '0', label: '0' }, { value: '4', label: 'XS' }, { value: '12', label: 'M' }, { value: '24', label: 'L' }] },
    { key: 'height', type: 'number', label: 'Tile height', tab: 'style', min: 160, max: 520, step: 20, unit: 'px', help: 'Minimum height. Tiles grow to fit their text.' },
    { key: 'titleSize', type: 'select', label: 'Title size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }] },
  ],
  defaults: {
    heading: '',
    intro: '',
    tiles: [0, 1, 2, 3, 4, 5].map(newTile),
    palette: 'mixed',
    gap: '0',
    height: 280,
    titleSize: 'md',
  },
  presets: [
    { name: 'Audience hub', props: { palette: 'mixed', gap: '0', titleSize: 'md' }, common: { radius: 'none', shadow: 'none', hover: 'zoom' } },
    { name: 'Bold', props: { palette: 'bold', gap: '4', titleSize: 'lg' }, common: { radius: 'none', shadow: 'none', hover: 'zoom' } },
    { name: 'Quiet', props: { palette: 'quiet', gap: '12', titleSize: 'md' }, common: { radius: 'md', shadow: 'none', hover: 'lift' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const gap = parseInt(p.gap, 10) || 0;
    const pal = PALETTES[p.palette] ?? PALETTES.mixed;
    const r = gap ? `${t.radius}px` : '0';
    let auto = 0;
    const titlePx = p.titleSize === 'lg' ? 34 : 26;

    const tileBase = (wide: boolean): CSSProperties => ({
      flex: wide ? '2 1 540px' : '1 1 260px', minWidth: 0, maxWidth: '100%', minHeight: `${p.height}px`,
      margin: 0, boxSizing: 'border-box', position: 'relative', overflow: 'hidden', borderRadius: r,
    });

    const link = (label: string, url: string, color: string, path: string) => label && url ? (
      <a href={url} className="sfucb-link" {...ctx.edit(path, 'text')}
        style={{ display: 'inline-block', margin: '0 18px 6px 0', padding: 0, fontFamily: t.font, fontSize: '15px', fontWeight: 700, lineHeight: 1.4, letterSpacing: '.02em', color, textDecoration: 'none', textUnderlineOffset: '4px', textDecorationThickness: '2px', background: 'none' }}>
        {label} &rarr;
      </a>
    ) : null;

    return (
      <div {...ctx.root('color-blocks', { padding: t.bg === 'transparent' ? 0 : '24px' })}>
        {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(32, { margin: p.intro ? '0 0 8px 0' : '0 0 20px 0' })}>{p.heading}</h2>}
        {p.intro && <p {...ctx.edit('intro', 'text')} style={sx.text({ color: t.muted, margin: '0 0 24px 0', maxWidth: '680px' })}>{p.intro}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${gap}px`, margin: 0, padding: 0 }}>
          {p.tiles.map((c, i) => {
            if (c.kind === 'image') {
              const hasText = !!(c.eyebrow || c.title);
              const Tag = c.link1Url ? 'a' : 'div';
              return (
                <Tag key={c._id ?? i} {...(c.link1Url ? { href: c.link1Url } : {})} {...ctx.item('tiles', i)} {...ctx.reveal()} {...ctx.hover()}
                  style={{ ...tileBase(c.wide), display: 'block', background: SFU.charcoal, color: '#ffffff', textDecoration: 'none' }}>
                  <img src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`tiles.${i}.image`, 'image')} style={sx.imgFill('cover', c.image.pos)} />
                  {hasText && (
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, margin: 0, padding: '48px 24px 20px 24px', background: 'linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 100%)' }}>
                      {c.eyebrow && <div {...ctx.edit(`tiles.${i}.eyebrow`, 'text')} style={sx.eyebrow({ color: '#ffffff', fontSize: '12px', margin: '0 0 6px 0' })}>{c.eyebrow}</div>}
                      {c.title && <h3 {...ctx.edit(`tiles.${i}.title`, 'text')} style={sx.heading(22, { color: '#ffffff' })}>{c.title}{c.link1Url ? ' →' : ''}</h3>}
                    </div>
                  )}
                </Tag>
              );
            }
            const key = c.color === 'auto' || !SW[c.color as keyof typeof SW] ? pal[auto++ % pal.length] : (c.color as keyof typeof SW);
            const s = SW[key];
            const line = s.line && (gap > 0 || t.bg === 'transparent') ? `1px solid ${s.line}` : '0';
            return (
              <div key={c._id ?? i} {...ctx.item('tiles', i)} {...ctx.reveal()}
                style={{ ...tileBase(c.wide), background: s.bg, border: line, padding: c.wide ? '36px 40px' : '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ margin: 0, padding: 0 }}>
                  {c.eyebrow && <div {...ctx.edit(`tiles.${i}.eyebrow`, 'text')} style={sx.eyebrow({ color: s.h, opacity: 0.85, margin: '0 0 12px 0' })}>{c.eyebrow}</div>}
                  {c.title && <h3 {...ctx.edit(`tiles.${i}.title`, 'text')} style={sx.heading(c.wide ? titlePx + 6 : titlePx, { color: s.h, margin: '0 0 12px 0', maxWidth: '18em' })}>{c.title}</h3>}
                  {c.text && <p {...ctx.edit(`tiles.${i}.text`, 'text')} style={sx.text({ color: s.t, fontSize: '16px', margin: '0 0 16px 0', maxWidth: '34em' })}>{c.text}</p>}
                </div>
                {(c.link1Label || c.link2Label) && (
                  <div style={{ margin: 0, padding: 0 }}>
                    {link(c.link1Label, c.link1Url, s.a, `tiles.${i}.link1Label`)}
                    {link(c.link2Label, c.link2Url, s.a, `tiles.${i}.link2Label`)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
