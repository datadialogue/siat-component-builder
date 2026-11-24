import type { CSSProperties } from 'react';
import { SquareMousePointer } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import { contrastText } from '../../theme/theme';
import runtime from './runtime.es5.js?raw';

/*
 * Image Hover Reveal: image tiles whose text animates in over the image on hover / focus / tap.
 * The markup ships with the text visible (works without JS); runtime.es5.js hides it and
 * animates it in. Hidden text is only transparent or moved, never display:none, so screen
 * readers always get it.
 */

interface Tile { _id?: string; image: ImageValue; eyebrow: string; title: string; text: string; linkLabel: string; url: string }
interface Props {
  heading: string;
  tiles: Tile[];
  columns: string;
  aspect: string;
  gap: string;
  effect: 'fade' | 'up' | 'down' | 'side' | 'zoom' | 'circle' | 'rise';
  tint: 'dark' | 'accent' | 'light' | 'gradient';
  opacity: number;
  textPos: 'center' | 'bottom';
  align: 'left' | 'center';
  imageFx: 'none' | 'zoom' | 'blur' | 'grey';
  speed: number;
  stagger: boolean;
}

const newTile = (i: number): Tile => ({
  image: placeholderImage(i + 1, '4:3'),
  eyebrow: ['Research', 'Studio', 'Lab', 'Project'][i % 4],
  title: `Project title ${i + 1}`,
  text: 'A sentence or two that appears when someone hovers over the image.',
  linkLabel: 'Learn more',
  url: 'https://www.sfu.ca/siat.html',
});

function rgba(hex: string, a: number): string {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = /^[0-9a-f]{6}$/i.test(h) ? parseInt(h, 16) : 0;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.round(a * 100) / 100})`;
}

const TITLE_SIZE: Record<string, number> = { '1': 32, '2': 26, '3': 22, '4': 19 };

export default defineComponent<Props>({
  id: 'hover-reveal',
  name: 'Image Hover Reveal',
  category: 'Media',
  description: 'Images whose text slides or fades in on hover. Tap to reveal on phones.',
  icon: SquareMousePointer,
  commonDefaults: { hover: 'none' },
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    {
      key: 'tiles', type: 'list', label: 'Images', itemLabel: 'image', titleKey: 'title', thumbKey: 'image', min: 1, max: 16,
      newItem: newTile,
      itemFields: [
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'eyebrow', type: 'text', label: 'Label' },
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text', multiline: true },
        { key: 'url', type: 'url', label: 'Link', help: 'Optional. On phones, the first tap shows the text and the second opens the link.' },
        { key: 'linkLabel', type: 'text', label: 'Link text', showIf: (t) => !!t.url },
      ],
    },
    { key: 'columns', type: 'select', label: 'Columns', tab: 'style', options: ['1', '2', '3', '4'].map((v) => ({ value: v, label: v })), help: 'Maximum columns. Tiles wrap to fewer columns on small screens.' },
    { key: 'aspect', type: 'select', label: 'Image shape', tab: 'style', options: [{ value: '16:9', label: '16:9' }, { value: '4:3', label: '4:3' }, { value: '1:1', label: 'Square' }, { value: '3:4', label: 'Portrait' }] },
    { key: 'gap', type: 'select', label: 'Gap', tab: 'style', options: [{ value: '0', label: '0' }, { value: '8', label: 'S' }, { value: '16', label: 'M' }, { value: '24', label: 'L' }] },
    { key: 'tint', type: 'select', label: 'Overlay', tab: 'style', options: [{ value: 'dark', label: 'Dark' }, { value: 'gradient', label: 'Gradient' }, { value: 'accent', label: 'Accent' }, { value: 'light', label: 'Light' }] },
    { key: 'opacity', type: 'number', label: 'Overlay strength', tab: 'style', min: 30, max: 100, step: 5, unit: '%' },
    { key: 'textPos', type: 'select', label: 'Text position', tab: 'style', options: [{ value: 'center', label: 'Middle' }, { value: 'bottom', label: 'Bottom' }], showIf: (p) => p.effect !== 'rise' },
    { key: 'align', type: 'select', label: 'Align', tab: 'style', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
    {
      key: 'effect', type: 'select', label: 'Reveal', tab: 'behaviour', help: 'How the text appears on hover. "Caption" keeps the title visible and slides the rest up.',
      options: [{ value: 'fade', label: 'Fade' }, { value: 'up', label: 'Slide up' }, { value: 'down', label: 'Slide down' }, { value: 'side', label: 'Slide in' }, { value: 'zoom', label: 'Zoom' }, { value: 'circle', label: 'Circle' }, { value: 'rise', label: 'Caption' }],
    },
    { key: 'imageFx', type: 'select', label: 'Image on hover', tab: 'behaviour', options: [{ value: 'none', label: 'None' }, { value: 'zoom', label: 'Zoom' }, { value: 'blur', label: 'Blur' }, { value: 'grey', label: 'Grey → colour' }] },
    { key: 'speed', type: 'number', label: 'Speed', tab: 'behaviour', min: 150, max: 1200, step: 50, unit: 'ms' },
    { key: 'stagger', type: 'toggle', label: 'Text one line at a time', tab: 'behaviour' },
  ],
  defaults: {
    heading: '',
    tiles: [newTile(0), newTile(1), newTile(2)],
    columns: '3',
    aspect: '4:3',
    gap: '16',
    effect: 'up',
    tint: 'dark',
    opacity: 75,
    textPos: 'center',
    align: 'center',
    imageFx: 'zoom',
    speed: 450,
    stagger: true,
  },
  presets: [
    { name: 'Slide up', props: { effect: 'up', tint: 'dark', textPos: 'center', align: 'center', imageFx: 'zoom' } },
    { name: 'Fade', props: { effect: 'fade', tint: 'dark', textPos: 'center', align: 'center', imageFx: 'blur' } },
    { name: 'Caption', props: { effect: 'rise', tint: 'gradient', opacity: 90, align: 'left', imageFx: 'zoom' } },
    { name: 'Red circle', props: { effect: 'circle', tint: 'accent', opacity: 90, textPos: 'center', align: 'center', imageFx: 'grey' } },
    { name: 'Mosaic', props: { effect: 'side', tint: 'dark', gap: '0', aspect: '1:1', columns: '3', textPos: 'bottom', align: 'left', imageFx: 'zoom' }, common: { radius: 'none' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const cols = parseInt(p.columns, 10) || 3;
    const gap = parseInt(p.gap, 10) || 0;
    const rise = p.effect === 'rise';
    const center = p.align === 'center';
    const a = Math.min(100, Math.max(0, p.opacity)) / 100;
    const accentHex = t.accent.toLowerCase() === '#ffffff' ? t.onAccent : t.accent;
    const tintBg: string = rise || p.tint === 'gradient'
      ? `linear-gradient(to top, ${rgba(p.tint === 'accent' ? accentHex : p.tint === 'light' ? '#ffffff' : '#000000', a)} 0%, ${rgba(p.tint === 'accent' ? accentHex : p.tint === 'light' ? '#ffffff' : '#000000', a * 0.5)} 55%, rgba(0,0,0,0) 100%)`
      : rgba(p.tint === 'accent' ? accentHex : p.tint === 'light' ? '#ffffff' : '#000000', a);
    const fg = p.tint === 'light' ? '#1a1a1a' : p.tint === 'accent' ? contrastText(accentHex) : '#ffffff';
    const fgSoft = fg === '#ffffff' ? 'rgba(255,255,255,.88)' : 'rgba(0,0,0,.78)';
    const titleSize = TITLE_SIZE[String(cols)] ?? 22;
    const bottom = rise || p.textPos === 'bottom';
    const s = rise ? '' : 'sfuhr-s';

    const ov: CSSProperties = {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0,
      padding: cols >= 4 ? '16px' : '24px', boxSizing: 'border-box', zIndex: 1,
      display: 'flex', flexDirection: 'column',
      justifyContent: bottom ? 'flex-end' : 'center',
      alignItems: center ? 'center' : 'flex-start',
      textAlign: center ? 'center' : 'left',
    };

    return (
      <div {...ctx.root('hover-reveal', { padding: t.bg === 'transparent' ? 0 : '24px' })}
        data-fx={p.effect} data-ms={String(p.speed)} data-img={p.imageFx} {...(p.stagger ? { 'data-stag': '1' } : {})}>
        {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(30, { margin: '0 0 20px 0' })}>{p.heading}</h2>}
        <div style={sx.grid(cols, cols >= 4 ? 180 : 240, gap)}>
          {p.tiles.map((c, i) => {
            const link = !!c.url;
            const Tag = link ? 'a' : 'div';
            return (
              <Tag key={c._id ?? i} className="sfuhr-tile" {...(link ? { href: c.url } : {})} {...ctx.item('tiles', i)} {...ctx.reveal()} {...ctx.hover()}
                style={{
                  position: 'relative', display: 'block', overflow: 'hidden', margin: 0, padding: 0, boxSizing: 'border-box', minWidth: 0,
                  borderRadius: gap ? `${t.radius}px` : 0, boxShadow: gap && t.shadow !== 'none' ? t.shadow : 'none',
                  background: '#222222', color: fg, textDecoration: 'none', isolation: 'isolate',
                }}>
                <div style={sx.ratio(p.aspect)}>
                  <img className="sfuhr-img" src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`tiles.${i}.image`, 'image')} style={sx.imgFill('cover', c.image.pos)} />
                </div>
                <div className="sfuhr-ov" style={ov}>
                  <div className="sfuhr-bg" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0, padding: 0, background: tintBg }} />
                  <div style={{ position: 'relative', margin: 0, padding: 0, maxWidth: '100%' }}>
                    {c.eyebrow && <span className={s} {...ctx.edit(`tiles.${i}.eyebrow`, 'text')} style={sx.eyebrow({ display: 'block', color: fg, fontSize: '12px', margin: '0 0 8px 0' })}>{c.eyebrow}</span>}
                    <h3 className={s} {...ctx.edit(`tiles.${i}.title`, 'text')} style={sx.heading(titleSize, { color: fg, margin: 0 })}>{c.title}</h3>
                    <div className="sfuhr-more" style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
                      {c.text && (
                        <p className="sfuhr-s" {...ctx.edit(`tiles.${i}.text`, 'text')}
                          style={sx.text({ color: fgSoft, fontSize: cols >= 4 ? '14px' : '16px', lineHeight: 1.45, margin: '10px 0 0 0', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: cols >= 3 ? 3 : 5, overflow: 'hidden' })}>
                          {c.text}
                        </p>
                      )}
                      {link && c.linkLabel && (
                        <span className="sfuhr-s" {...ctx.edit(`tiles.${i}.linkLabel`, 'text')}
                          style={sx.small({ display: 'inline-block', color: fg, fontWeight: 700, fontSize: '14px', margin: '14px 0 0 0', padding: '0 0 2px 0', borderBottom: `2px solid ${fg}` })}>
                          {c.linkLabel} &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Tag>
            );
          })}
        </div>
      </div>
    );
  },
});
