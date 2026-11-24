import type { CSSProperties, ReactElement } from 'react';
import { Blocks, Heading, Pilcrow, Image as ImageIcon, MousePointerClick, Minus, MoveVertical, Quote, Play } from 'lucide-react';
import { defineComponent, type Field, type ImageValue, type RenderCtx } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';

/* Blocks are laid out with flex-wrap: each has a target width and a minimum,
   so rows collapse to a single column on phones without media queries. */

type Width = '100' | '75' | '66' | '50' | '33' | '25';
interface Block { _id?: string; type: string; width: Width | string; [k: string]: any }
interface Props {
  blocks: Block[];
  gap: 'sm' | 'md' | 'lg';
  valign: 'start' | 'center' | 'end';
  background: 'none' | 'surface' | 'alt' | 'accent' | 'image';
  bgImage: ImageValue;
  bgDim: number;
  padding: 'none' | 'sm' | 'md' | 'lg';
}

const widthField: Field = {
  key: 'width', type: 'select', label: 'Width',
  options: [{ value: '100', label: 'Full' }, { value: '75', label: '¾' }, { value: '66', label: '⅔' }, { value: '50', label: '½' }, { value: '33', label: '⅓' }, { value: '25', label: '¼' }],
  help: 'Width on large screens. Blocks stack on phones.',
};
const alignField: Field = { key: 'align', type: 'select', label: 'Align', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }, { value: 'right', label: 'Right' }] };

const blockTypes = {
  heading: {
    label: 'Heading', icon: Heading,
    fields: [
      { key: 'eyebrow', type: 'text', label: 'Eyebrow' },
      { key: 'text', type: 'text', label: 'Heading' },
      { key: 'level', type: 'select', label: 'Size', options: [{ value: 'h2', label: 'Large' }, { value: 'h3', label: 'Medium' }, { value: 'h4', label: 'Small' }] },
      alignField, widthField,
    ] as Field[],
    create: () => ({ type: 'heading', width: '100', eyebrow: '', text: 'Section heading', level: 'h2', align: 'left' }),
  },
  text: {
    label: 'Text', icon: Pilcrow,
    fields: [{ key: 'html', type: 'richtext', label: 'Text' }, widthField] as Field[],
    create: () => ({ type: 'text', width: '100', html: '<p>Write something here. Select text to add <strong>bold</strong>, links or lists.</p>' }),
  },
  image: {
    label: 'Image', icon: ImageIcon,
    fields: [
      { key: 'image', type: 'image', label: 'Image' },
      { key: 'aspect', type: 'select', label: 'Shape', options: [{ value: 'auto', label: 'Original' }, { value: '16:9', label: '16:9' }, { value: '4:3', label: '4:3' }, { value: '1:1', label: 'Square' }] },
      { key: 'caption', type: 'text', label: 'Caption' },
      { key: 'url', type: 'url', label: 'Link (optional)' },
      widthField,
    ] as Field[],
    create: () => ({ type: 'image', width: '50', image: placeholderImage(1, '4:3'), aspect: '4:3', caption: '', url: '' }),
  },
  button: {
    label: 'Button', icon: MousePointerClick,
    fields: [
      { key: 'label', type: 'text', label: 'Label' },
      { key: 'url', type: 'url', label: 'Link' },
      { key: 'variant', type: 'select', label: 'Style', options: [{ value: 'primary', label: 'Solid' }, { value: 'secondary', label: 'Outline' }, { value: 'ghost', label: 'Text' }] },
      { key: 'newTab', type: 'toggle', label: 'Open in new tab' },
      alignField, widthField,
    ] as Field[],
    create: () => ({ type: 'button', width: '100', label: 'Learn more', url: 'https://www.sfu.ca/siat.html', variant: 'primary', newTab: false, align: 'left' }),
  },
  quote: {
    label: 'Quote', icon: Quote,
    fields: [{ key: 'text', type: 'text', label: 'Quote', multiline: true }, { key: 'cite', type: 'text', label: 'Attribution' }, widthField] as Field[],
    create: () => ({ type: 'quote', width: '100', text: 'A memorable quote from a student, alum or faculty member.', cite: 'Name, Program' }),
  },
  video: {
    label: 'Video', icon: Play,
    fields: [
      { key: 'url', type: 'url', label: 'YouTube or Vimeo link', placeholder: 'https://www.youtube.com/watch?v=…' },
      { key: 'title', type: 'text', label: 'Title (for screen readers)' },
      widthField,
    ] as Field[],
    create: () => ({ type: 'video', width: '100', url: '', title: 'Video' }),
  },
  divider: {
    label: 'Divider', icon: Minus,
    fields: [{ key: 'style', type: 'select', label: 'Style', options: [{ value: 'line', label: 'Line' }, { value: 'accent', label: 'Accent bar' }] }, widthField] as Field[],
    create: () => ({ type: 'divider', width: '100', style: 'line' }),
  },
  spacer: {
    label: 'Spacer', icon: MoveVertical,
    fields: [{ key: 'size', type: 'number', label: 'Height', min: 8, max: 160, step: 8, unit: 'px' }, widthField] as Field[],
    create: () => ({ type: 'spacer', width: '100', size: 32 }),
  },
};

const GAPS = { sm: 12, md: 24, lg: 40 };
const PADS = { none: '0', sm: '16px', md: '32px', lg: '56px' };

export function videoEmbedUrl(url: string): string {
  const u = (url || '').trim();
  let m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(u);
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
  m = /vimeo\.com\/(?:video\/)?(\d+)/.exec(u);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  return /^https:\/\//.test(u) ? u : '';
}

function renderBlock(b: Block, i: number, ctx: RenderCtx, light: boolean): ReactElement | null {
  const { theme: t, sx } = ctx;
  const path = (k: string) => `blocks.${i}.${k}`;
  const headColor = light ? '#ffffff' : t.heading;
  const textColor = light ? '#ffffff' : t.text;
  switch (b.type) {
    case 'heading': {
      const Tag = (['h2', 'h3', 'h4'].includes(b.level) ? b.level : 'h2') as 'h2';
      const size = { h2: 34, h3: 26, h4: 20 }[b.level as 'h2'] ?? 34;
      return (
        <div style={{ textAlign: b.align, margin: 0, padding: 0 }}>
          {b.eyebrow && <div {...ctx.edit(path('eyebrow'), 'text')} style={sx.eyebrow({ margin: '0 0 8px 0', color: light ? '#ffffff' : t.accent === '#ffffff' ? '#ffffff' : t.accent })}>{b.eyebrow}</div>}
          <Tag {...ctx.edit(path('text'), 'text')} style={sx.heading(size, { color: headColor })}>{b.text}</Tag>
        </div>
      );
    }
    case 'text':
      return <div {...ctx.edit(path('html'), 'rich')} style={{ margin: 0, padding: 0 }} dangerouslySetInnerHTML={ctx.rich(b.html, light ? { color: '#ffffff' } : {})} />;
    case 'image': {
      const img: ImageValue = b.image ?? { src: '', alt: '' };
      const pic = b.aspect && b.aspect !== 'auto'
        ? <div style={sx.ratio(b.aspect, { borderRadius: `${t.radius}px` })}><img src={img.src} alt={img.alt} loading="lazy" {...ctx.edit(path('image'), 'image')} style={sx.imgFill('cover', img.pos)} /></div>
        : <img src={img.src} alt={img.alt} loading="lazy" {...ctx.edit(path('image'), 'image')} style={sx.img({ borderRadius: `${t.radius}px` })} />;
      return (
        <figure style={{ margin: 0, padding: 0 }}>
          {b.url ? <a href={b.url} style={{ display: 'block', textDecoration: 'none' }}>{pic}</a> : pic}
          {b.caption && <figcaption {...ctx.edit(path('caption'), 'text')} style={sx.small({ margin: '8px 0 0 0', color: light ? 'rgba(255,255,255,.85)' : t.muted })}>{b.caption}</figcaption>}
        </figure>
      );
    }
    case 'button':
      return (
        <div style={{ textAlign: b.align, margin: 0, padding: 0 }}>
          <a href={b.url} {...(b.newTab ? { target: '_blank', rel: 'noopener' } : {})} {...ctx.edit(path('label'), 'text')} {...ctx.hover()}
            style={sx.button(light && b.variant === 'primary' ? 'light' : b.variant, light && b.variant !== 'primary' ? { color: '#ffffff', borderColor: b.variant === 'ghost' ? 'transparent' : '#ffffff' } : {})}>{b.label}</a>
        </div>
      );
    case 'quote':
      return (
        <blockquote style={{ margin: 0, padding: '4px 0 4px 20px', borderLeft: `4px solid ${light ? '#ffffff' : t.accent}`, boxSizing: 'border-box' }}>
          <p {...ctx.edit(path('text'), 'text')} style={sx.text({ fontSize: '22px', lineHeight: 1.45, fontStyle: 'italic', color: textColor, margin: '0 0 10px 0' })}>{b.text}</p>
          {b.cite && <footer {...ctx.edit(path('cite'), 'text')} style={sx.small({ fontWeight: 700, color: light ? 'rgba(255,255,255,.85)' : t.muted })}>&mdash; {b.cite}</footer>}
        </blockquote>
      );
    case 'video': {
      const src = videoEmbedUrl(b.url);
      return (
        <div style={sx.ratio('16:9', { borderRadius: `${t.radius}px`, background: '#111' })}>
          {src
            ? <iframe src={src} title={b.title || 'Video'} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, margin: 0, padding: 0 }} />
            : <div {...ctx.edit(path('url'))} style={sx.small({ position: 'absolute', top: '50%', left: 0, right: 0, textAlign: 'center', color: '#aaa', transform: 'translateY(-50%)' })}>Paste a YouTube or Vimeo link</div>}
        </div>
      );
    }
    case 'divider':
      return b.style === 'accent'
        ? <div role="separator" style={{ width: '64px', height: '4px', margin: 0, padding: 0, background: light ? '#ffffff' : t.accent }} />
        : <div role="separator" style={{ width: '100%', height: '1px', margin: 0, padding: 0, background: light ? 'rgba(255,255,255,.4)' : t.border }} />;
    case 'spacer':
      return <div aria-hidden="true" style={{ height: `${b.size ?? 32}px`, margin: 0, padding: 0 }} />;
    default:
      return null;
  }
}

export default defineComponent<Props>({
  id: 'composer',
  name: 'Custom Block',
  category: 'Layout',
  description: 'Build your own layout from headings, text, images, buttons and more.',
  icon: Blocks,
  fields: [
    { key: 'blocks', type: 'blocks', label: 'Blocks', blockTypes },
    { key: 'background', type: 'select', label: 'Background', tab: 'style', options: [{ value: 'none', label: 'None' }, { value: 'surface', label: 'Panel' }, { value: 'alt', label: 'Grey' }, { value: 'accent', label: 'Accent' }, { value: 'image', label: 'Image' }] },
    { key: 'bgImage', type: 'image', label: 'Background image', tab: 'style', showIf: (p) => p.background === 'image' },
    { key: 'bgDim', type: 'number', label: 'Darken image', tab: 'style', min: 0, max: 90, step: 5, unit: '%', showIf: (p) => p.background === 'image' },
    { key: 'padding', type: 'select', label: 'Padding', tab: 'style', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }] },
    { key: 'gap', type: 'select', label: 'Spacing', tab: 'style', options: [{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }] },
    { key: 'valign', type: 'select', label: 'Vertical align', tab: 'style', options: [{ value: 'start', label: 'Top' }, { value: 'center', label: 'Middle' }, { value: 'end', label: 'Bottom' }] },
  ],
  defaults: {
    blocks: [
      { ...blockTypes.heading.create(), eyebrow: 'Feature', text: 'Tell a short story' },
      { ...blockTypes.image.create(), width: '50' },
      { ...blockTypes.text.create(), width: '50', html: '<p>Pair an image with a paragraph. Drag blocks to reorder them, or set each block\'s width.</p><ul><li><p>Point one</p></li><li><p>Point two</p></li></ul>' },
      { ...blockTypes.button.create() },
    ],
    gap: 'md',
    valign: 'center',
    background: 'none',
    bgImage: placeholderImage(6, '16:9', 'Background image'),
    bgDim: 55,
    padding: 'none',
  },
  presets: [
    { name: 'Plain', props: { background: 'none', padding: 'none' } },
    { name: 'Panel', props: { background: 'alt', padding: 'md' } },
    { name: 'Accent', props: { background: 'accent', padding: 'lg' } },
    { name: 'Photo', props: { background: 'image', padding: 'lg', bgDim: 55 } },
  ],
  render(p, ctx) {
    const { theme: t } = ctx;
    const gap = GAPS[p.gap];
    const accentDark = t.accent !== '#ffffff';
    const light = p.background === 'image' || (p.background === 'accent' && accentDark) || (t.dark && p.background !== 'surface');
    const bg: Record<Props['background'], CSSProperties> = {
      none: {},
      surface: { background: t.dark ? t.surface : '#ffffff', boxShadow: t.shadow },
      alt: { background: t.surfaceAlt },
      accent: { background: accentDark ? t.accent : t.bg },
      image: { background: '#222' },
    };
    const pad = p.background !== 'none' && p.padding === 'none' ? PADS.md : PADS[p.padding];
    return (
      <div {...ctx.root('composer', { position: 'relative', overflow: 'hidden', borderRadius: p.background !== 'none' ? `${t.radius}px` : 0, ...bg[p.background] })}>
        {p.background === 'image' && p.bgImage?.src && (
          <>
            <img src={p.bgImage.src} alt="" {...ctx.edit('bgImage', 'image')} style={ctx.sx.imgFill('cover', p.bgImage.pos)} />
            <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `rgba(0,0,0,${(p.bgDim ?? 55) / 100})` }} />
          </>
        )}
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: `${gap}px`, alignItems: { start: 'flex-start', center: 'center', end: 'flex-end' }[p.valign], padding: pad, margin: 0, boxSizing: 'border-box' }}>
          {p.blocks.map((b, i) => {
            const w = Number(b.width) || 100;
            const basis = w >= 100 ? '100%' : `calc(${w}% - ${gap}px)`;
            return (
              <div key={b._id ?? i} {...ctx.item('blocks', i)} {...ctx.reveal()}
                style={{ flex: `1 1 ${basis}`, maxWidth: '100%', minWidth: w >= 100 ? '100%' : 'min(100%, 240px)', margin: 0, padding: 0, boxSizing: 'border-box' }}>
                {renderBlock(b, i, ctx, light)}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
