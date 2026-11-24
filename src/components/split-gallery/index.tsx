import { GalleryHorizontalEnd } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import { ratioToPercent } from '../../lib/sx';
import runtime from './runtime.es5.js?raw';

interface Item { _id?: string; image: ImageValue; title: string; text: string; caption: string }
interface Props {
  items: Item[];
  layout: 'split' | 'stacked';
  thumbCols: string;
  aspect: string;
  fit: 'contain' | 'cover';
  overlay: boolean;
  showCaption: boolean;
  showArrows: boolean;
  autoplay: number;
}

const newItem = (i: number): Item => ({
  image: placeholderImage(i + 1),
  title: `Image ${i + 1} headline`,
  text: `Longer description for image ${i + 1}. It appears on hover while the photo dims behind it.`,
  caption: `Caption for image ${i + 1}`,
});

export default defineComponent<Props>({
  id: 'split-gallery',
  name: 'Split Gallery',
  category: 'Media',
  description: 'Large image with a thumbnail grid. Hover reveals a description.',
  icon: GalleryHorizontalEnd,
  fields: [
    {
      key: 'items', type: 'list', label: 'Images', itemLabel: 'image', titleKey: 'title', thumbKey: 'image', min: 1, max: 24,
      newItem,
      itemFields: [
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'title', type: 'text', label: 'Headline' },
        { key: 'text', type: 'text', label: 'Hover text', multiline: true, help: 'Revealed when someone hovers or taps the large image.' },
        { key: 'caption', type: 'text', label: 'Caption' },
      ],
    },
    { key: 'layout', type: 'select', label: 'Layout', tab: 'style', options: [{ value: 'split', label: 'Side by side' }, { value: 'stacked', label: 'Stacked' }] },
    { key: 'thumbCols', type: 'select', label: 'Thumbnail columns', tab: 'style', options: ['2', '3', '4', '5', '6'].map((v) => ({ value: v, label: v })) },
    { key: 'aspect', type: 'select', label: 'Image shape', tab: 'style', options: [{ value: '4:3', label: '4:3' }, { value: '3:2', label: '3:2' }, { value: '16:9', label: '16:9' }, { value: '1:1', label: 'Square' }] },
    { key: 'fit', type: 'select', label: 'Image fit', tab: 'style', options: [{ value: 'contain', label: 'Whole image' }, { value: 'cover', label: 'Fill frame' }], help: '"Whole image" never crops. "Fill frame" crops to fill.' },
    { key: 'showCaption', type: 'toggle', label: 'Caption bar', tab: 'style' },
    { key: 'overlay', type: 'toggle', label: 'Hover reveals text', tab: 'behaviour' },
    { key: 'showArrows', type: 'toggle', label: 'Arrows', tab: 'behaviour' },
    { key: 'autoplay', type: 'number', label: 'Autoplay', tab: 'behaviour', min: 0, max: 15, step: 1, unit: 's', help: '0 = off. Pauses on hover; off for visitors who prefer reduced motion.' },
  ],
  defaults: {
    items: Array.from({ length: 6 }, (_, i) => newItem(i)),
    layout: 'split',
    thumbCols: '3',
    aspect: '4:3',
    fit: 'contain',
    overlay: true,
    showCaption: true,
    showArrows: true,
    autoplay: 0,
  },
  presets: [
    { name: 'Classic', props: { layout: 'split', thumbCols: '3', fit: 'contain' } },
    { name: 'Filmstrip', props: { layout: 'stacked', thumbCols: '6', fit: 'cover', aspect: '16:9' } },
    { name: 'Dark', props: { fit: 'cover' }, common: { theme: 'charcoal' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const items = p.items.length ? p.items : [newItem(0)];
    const first = items[0];
    const cols = Math.max(1, parseInt(p.thumbCols, 10) || 3);
    const gap = 8;
    const thumbW = `calc((100% - ${(cols - 1) * gap}px) / ${cols})`;
    const stacked = p.layout === 'stacked';
    const arrow = (side: 'left' | 'right') => ({
      position: 'absolute' as const, top: '50%', [side]: '10px', margin: '-20px 0 0 0', width: '40px', height: '40px', padding: 0,
      border: 0, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '24px', lineHeight: '40px',
      textAlign: 'center' as const, cursor: 'pointer', zIndex: 2,
    });
    return (
      <div
        {...ctx.root('split-gallery', {
          display: 'flex', flexFlow: 'row wrap', alignItems: 'flex-start', gap: '16px 20px',
          padding: t.bg === 'transparent' ? 0 : '20px',
        })}
        data-sfub-accent={t.accent}
        data-overlay={p.overlay ? '1' : '0'}
        {...(p.autoplay ? { 'data-autoplay': String(p.autoplay) } : {})}
      >
        <figure className="sfug-stage" {...ctx.reveal()} style={{ flex: stacked ? '1 1 100%' : '1 1 380px', minWidth: 0, margin: 0, padding: 0, background: t.surfaceAlt, borderRadius: `${t.radius}px`, overflow: 'hidden', boxSizing: 'border-box', boxShadow: t.shadow }}>
          <div className="sfug-frame" style={{ position: 'relative', display: 'block', width: '100%', height: 0, paddingBottom: `${ratioToPercent(p.aspect)}%`, background: t.dark ? '#1f1f20' : '#e6e6e6', overflow: 'hidden' }}>
            <img className="sfug-main" src={first.image.src} alt={first.image.alt} {...ctx.edit('items.0.image', 'image')}
              style={sx.imgFill(p.fit, first.image.pos, { transition: 'opacity .2s ease, transform .6s ease' })} />
            <div className="sfug-dim" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#000', opacity: 0, transition: 'opacity .45s ease', pointerEvents: 'none' }} />
            <div className="sfug-shade" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '110px', background: 'linear-gradient(to bottom,rgba(0,0,0,.65),rgba(0,0,0,0))', transition: 'opacity .45s ease', pointerEvents: 'none' }} />
            <div className="sfug-over" style={{ position: 'absolute', top: '16px', left: p.showArrows ? '64px' : '20px', right: p.showArrows ? '64px' : '20px', transform: 'translateY(0)', transition: 'top .5s cubic-bezier(.2,.8,.2,1), transform .5s cubic-bezier(.2,.8,.2,1)', pointerEvents: 'none', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.6)', fontFamily: t.font }}>
              <div className="sfug-title" {...ctx.edit('items.0.title', 'text')} style={{ fontSize: '1.05em', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', lineHeight: 1.2, transition: 'font-size .5s ease, letter-spacing .5s ease' }}>{first.title}</div>
              <div className="sfug-bar" style={{ width: '36px', height: '3px', margin: '8px 0 0 0', background: t.accent === '#ffffff' ? '#ffffff' : t.accent, transition: 'width .5s ease, margin .5s ease' }} />
              <div className="sfug-text" {...ctx.edit('items.0.text', 'text')} style={{ maxHeight: 0, opacity: 0, overflow: 'hidden', fontSize: '1em', lineHeight: 1.5, transition: 'max-height .5s ease, opacity .5s ease .1s, margin .5s ease' }}>{first.text}</div>
            </div>
            {p.showArrows && (
              <>
                <button type="button" className="sfug-prev" aria-label="Previous image" style={arrow('left')}>&#8249;</button>
                <button type="button" className="sfug-next" aria-label="Next image" style={arrow('right')}>&#8250;</button>
              </>
            )}
          </div>
          {p.showCaption && (
            <figcaption className="sfug-caption" aria-live="polite" {...ctx.edit('items.0.caption', 'text')}
              style={sx.text({ display: first.caption ? 'block' : 'none', padding: '10px 14px', fontSize: '15px', lineHeight: 1.4, color: t.text, background: t.surface === 'transparent' ? 'transparent' : t.surface, borderTop: `1px solid ${t.border}` })}>
              {first.caption}
            </figcaption>
          )}
        </figure>

        <div className="sfug-grid" role="group" aria-label="Gallery thumbnails" style={{ display: 'flex', flexFlow: 'row wrap', flex: stacked ? '1 1 100%' : '1 1 240px', maxWidth: '100%', alignContent: 'flex-start', gap: `${gap}px`, margin: 0, padding: 0, boxSizing: 'border-box' }}>
          {items.map((it, i) => (
            <button
              key={it._id ?? i}
              type="button"
              className="sfug-thumb"
              {...ctx.item('items', i)}
              {...ctx.edit(`items.${i}.image`, 'image')}
              data-full={it.image.src}
              data-title={it.title}
              data-text={it.text}
              data-caption={p.showCaption ? it.caption : ''}
              aria-current={i === 0 ? 'true' : 'false'}
              style={{ position: 'relative', display: 'block', flex: `0 0 ${thumbW}`, width: thumbW, height: 0, padding: `0 0 ${thumbW} 0`, margin: 0, border: `3px solid ${i === 0 ? t.accent : 'transparent'}`, borderRadius: `${t.radiusSm}px`, background: '#ddd', overflow: 'hidden', cursor: 'pointer', opacity: i === 0 ? 1 : 0.75, boxSizing: 'border-box', transition: 'opacity .2s ease, border-color .2s ease' }}
            >
              <img src={it.image.src} alt={it.image.alt} loading="lazy" style={sx.imgFill('cover', it.image.pos)} />
            </button>
          ))}
        </div>
      </div>
    );
  },
});
