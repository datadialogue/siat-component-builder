import type { CSSProperties } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

/*
 * Photo mosaic: a dense CSS grid of photos in mixed sizes (S, wide, tall, large).
 * Columns use minmax(min(N, half the width), 1fr) so there are always at least two
 * columns, and a 2-wide tile can never overflow. Captions ship visible (touch and
 * no-JS); runtime.es5.js hides them on hover-capable devices and reveals on hover/focus.
 */

type Size = 'S' | 'W' | 'T' | 'L';
interface Tile { _id?: string; image: ImageValue; caption: string; size: Size; url: string }
interface Props {
  heading: string;
  intro: string;
  tiles: Tile[];
  columns: string;
  density: 'sm' | 'md' | 'lg';
  gap: string;
  style: 'grid' | 'collage';
  captions: 'hover' | 'always' | 'none';
  zoom: boolean;
}

const SIZES: Size[] = ['L', 'S', 'S', 'T', 'W', 'S', 'S', 'W', 'S'];
const newTile = (i: number): Tile => ({
  image: placeholderImage(i + 1, '1:1'),
  caption: `Caption for photo ${i + 1}`,
  size: SIZES[i % SIZES.length],
  url: '',
});

const CELL = { sm: 100, md: 130, lg: 156 };
const SPAN: Record<Size, [number, number]> = { S: [1, 1], W: [2, 1], T: [1, 2], L: [2, 2] };

/** Deterministic small tilt per tile for the collage look (−1.8° … +1.8°). */
const tilt = (i: number) => ((((i * 37) % 7) - 3) * 0.6).toFixed(1);

export default defineComponent<Props>({
  id: 'mosaic',
  name: 'Photo Mosaic',
  category: 'Media',
  description: 'A photo wall in mixed sizes. Captions on hover; a scrapbook "collage" look.',
  icon: LayoutDashboard,
  commonDefaults: { hover: 'none' },
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    { key: 'intro', type: 'text', label: 'Intro', multiline: true },
    {
      key: 'tiles', type: 'list', label: 'Photos', itemLabel: 'photo', titleKey: 'caption', thumbKey: 'image', min: 1, max: 40,
      newItem: newTile,
      itemFields: [
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'caption', type: 'text', label: 'Caption' },
        {
          key: 'size', type: 'select', label: 'Size', help: 'Wide and large tiles take two columns. The grid packs tiles to fill gaps, so order can shift slightly.',
          options: [{ value: 'S', label: 'Small' }, { value: 'W', label: 'Wide' }, { value: 'T', label: 'Tall' }, { value: 'L', label: 'Large' }],
        },
        { key: 'url', type: 'url', label: 'Link' },
      ],
    },
    { key: 'style', type: 'select', label: 'Look', tab: 'style', options: [{ value: 'grid', label: 'Grid' }, { value: 'collage', label: 'Collage' }], help: 'Collage adds white frames and a slight tilt that straightens on hover.' },
    { key: 'columns', type: 'select', label: 'Max columns', tab: 'style', options: ['3', '4', '5', '6', '8'].map((v) => ({ value: v, label: v })) },
    { key: 'density', type: 'select', label: 'Min tile size', tab: 'style', options: [{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }], help: 'Smaller tiles fit more columns. Phones always get at least two.' },
    { key: 'gap', type: 'select', label: 'Gap', tab: 'style', options: [{ value: '0', label: '0' }, { value: '4', label: 'XS' }, { value: '8', label: 'S' }, { value: '16', label: 'M' }] },
    { key: 'captions', type: 'select', label: 'Captions', tab: 'behaviour', options: [{ value: 'hover', label: 'On hover' }, { value: 'always', label: 'Always' }, { value: 'none', label: 'Hidden' }], help: '"On hover" still shows captions on phones and when scripts are off.' },
    { key: 'zoom', type: 'toggle', label: 'Zoom on hover', tab: 'behaviour' },
  ],
  defaults: {
    heading: 'A year in pictures',
    intro: '',
    tiles: SIZES.map((_, i) => newTile(i)),
    columns: '5',
    density: 'md',
    gap: '8',
    style: 'grid',
    captions: 'hover',
    zoom: true,
  },
  presets: [
    { name: 'Grid', props: { style: 'grid', gap: '8', density: 'md' } },
    { name: 'Collage', props: { style: 'collage', gap: '16', density: 'md' }, common: { radius: 'none', shadow: 'md' } },
    { name: 'Tight', props: { style: 'grid', gap: '0', density: 'sm', columns: '6' }, common: { radius: 'none' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const collage = p.style === 'collage';
    const gap = parseInt(p.gap, 10) || 0;
    const n = CELL[p.density] ?? 130;
    const cols = Math.max(2, parseInt(p.columns, 10) || 5);
    const frame = collage ? 6 : 0;
    const pad = collage ? '24px' : t.bg === 'transparent' ? 0 : '24px';

    const grid: CSSProperties = {
      display: 'grid',
      // at most `cols` columns, tiles at least n px, but always at least 2 columns
      gridTemplateColumns: `repeat(auto-fill, minmax(min(max(${n}px, calc((100% - ${(cols - 1) * gap}px) / ${cols})), calc((100% - ${gap}px) / 2)), 1fr))`,
      gridAutoRows: `${n}px`,
      gridAutoFlow: 'row dense',
      gap: `${gap}px`,
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
    };

    return (
      <div {...ctx.root('mosaic', { padding: pad, background: collage && t.bg === 'transparent' ? t.surfaceAlt : t.bg })}
        data-cap={p.captions} {...(p.zoom ? { 'data-zoom': '1' } : {})} {...(collage ? { 'data-collage': '1' } : {})}>
        {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(32, { margin: p.intro ? '0 0 8px 0' : '0 0 24px 0' })}>{p.heading}</h2>}
        {p.intro && <p {...ctx.edit('intro', 'text')} style={sx.text({ color: t.muted, margin: '0 0 24px 0', maxWidth: '680px' })}>{p.intro}</p>}
        <div role="list" className="sfmo-grid" style={grid}>
          {p.tiles.map((c, i) => {
            const [cs, rs] = SPAN[c.size] ?? SPAN.S;
            const link = !!c.url;
            const Tag = link ? 'a' : 'div';
            const rot = collage ? `rotate(${tilt(i)}deg)` : 'none';
            return (
              <div key={c._id ?? i} role="listitem" {...ctx.item('tiles', i)} {...ctx.reveal()}
                style={{ gridColumn: `span ${cs}`, gridRow: `span ${rs}`, minWidth: 0, minHeight: 0, margin: 0, padding: 0, position: 'relative' }}>
                <Tag className="sfmo-tile" {...(link ? { href: c.url } : {})} data-rot={rot} {...ctx.hover()}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block', margin: 0, padding: 0,
                    boxSizing: 'border-box', overflow: 'hidden', isolation: 'isolate', textDecoration: 'none', color: '#ffffff',
                    background: collage ? '#ffffff' : '#222222',
                    borderRadius: collage ? '2px' : `${t.radius}px`,
                    boxShadow: collage ? t.shadow : 'none',
                    transform: rot,
                    transition: 'transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease',
                  }}>
                  <div style={{ position: 'absolute', top: `${frame}px`, left: `${frame}px`, right: `${frame}px`, bottom: `${frame}px`, margin: 0, padding: 0, overflow: 'hidden', background: '#222222' }}>
                    <img className="sfmo-img" src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`tiles.${i}.image`, 'image')}
                      style={sx.imgFill('cover', c.image.pos, { transition: 'transform .8s cubic-bezier(.2,.8,.2,1)' })} />
                    {c.caption && p.captions !== 'none' && (
                      <div className="sfmo-cap" style={{
                        position: 'absolute', left: 0, right: 0, bottom: 0, margin: 0, padding: '28px 12px 10px 12px', zIndex: 1,
                        background: 'linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.45) 60%, rgba(0,0,0,0) 100%)',
                        transition: 'opacity .3s ease, transform .3s ease',
                      }}>
                        <span {...ctx.edit(`tiles.${i}.caption`, 'text')} style={sx.small({ display: 'block', color: '#ffffff', fontSize: '13px', lineHeight: 1.35, fontWeight: 600 })}>{c.caption}</span>
                      </div>
                    )}
                  </div>
                </Tag>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
