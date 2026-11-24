import { ListTree } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

/*
 * Hover List: a big-type index (programs, labs, people). Hovering or focusing a row
 * dims the others and shows its image, either floating by the cursor or in a side
 * panel. Touch: first tap expands the row inline, second tap follows the link.
 * Without JS it is a plain list of links with meta and text; images stay hidden.
 */

interface Row { _id?: string; title: string; meta: string; text: string; image: ImageValue; url: string }
interface Props {
  eyebrow: string;
  heading: string;
  items: Row[];
  layout: 'follow' | 'side';
  size: 'md' | 'lg' | 'xl';
  arrows: boolean;
  lines: boolean;
  textOnHover: boolean;
}

const newRow = (i: number): Row => ({
  title: ['Program one', 'Program two', 'Program three', 'Program four', 'Program five'][i] ?? `Item ${i + 1}`,
  meta: ['BA · BSc', 'BA', 'MA · MSc', 'PhD', 'Certificate'][i] ?? '',
  text: 'One short line about this item.',
  image: placeholderImage(i + 1, '4:3'),
  url: 'https://www.sfu.ca/siat.html',
});

// [min px, vw, max px] for clamp(): scales with the viewport, no media queries.
const SIZES = { md: [22, 3.2, 30], lg: [26, 4.4, 42], xl: [30, 6, 60] } as const;

export default defineComponent<Props>({
  id: 'hover-list',
  name: 'Hover List',
  category: 'Interactive',
  description: 'A big-type index of programs or labs. Hover a row to see its image.',
  icon: ListTree,
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Label' },
    { key: 'heading', type: 'text', label: 'Heading' },
    {
      key: 'items', type: 'list', label: 'Rows', itemLabel: 'row', titleKey: 'title', thumbKey: 'image', min: 1, max: 24,
      newItem: newRow,
      itemFields: [
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'meta', type: 'text', label: 'Small label', help: 'Shown beside the title, e.g. "BA · BSc" or a lab lead.' },
        { key: 'text', type: 'text', label: 'Text', multiline: true },
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'url', type: 'url', label: 'Link' },
      ],
    },
    { key: 'layout', type: 'select', label: 'Image', tab: 'style', options: [{ value: 'follow', label: 'Follows cursor' }, { value: 'side', label: 'Side panel' }], help: 'Where the hovered row’s image appears. Phones show it inside the row after a tap.' },
    { key: 'size', type: 'select', label: 'Text size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'arrows', type: 'toggle', label: 'Arrows', tab: 'style' },
    { key: 'lines', type: 'toggle', label: 'Lines between rows', tab: 'style' },
    { key: 'textOnHover', type: 'toggle', label: 'Text on hover only', tab: 'behaviour', help: 'Hides each row’s text until it is hovered, focused or tapped. Always shown if scripts are off.' },
  ],
  defaults: {
    eyebrow: 'Explore',
    heading: '',
    items: [newRow(0), newRow(1), newRow(2), newRow(3), newRow(4)],
    layout: 'follow',
    size: 'xl',
    arrows: true,
    lines: true,
    textOnHover: true,
  },
  commonDefaults: { theme: 'charcoal' },
  presets: [
    { name: 'Dark index', props: { layout: 'follow', size: 'xl', arrows: false, lines: false, textOnHover: true }, common: { theme: 'charcoal' } },
    { name: 'Light list', props: { layout: 'side', size: 'lg', arrows: true, lines: true, textOnHover: false }, common: { theme: 'light' } },
    { name: 'Compact', props: { layout: 'side', size: 'md', arrows: true, lines: true, textOnHover: true }, common: { theme: 'grey' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const [mn, vw, mx] = SIZES[p.size] ?? SIZES.lg;
    const side = p.layout === 'side';
    const lineColor = t.dark ? 'rgba(255,255,255,.18)' : t.border;
    const accent = t.dark && t.accent === '#ffffff' ? '#ffffff' : t.accent;
    const pad = t.bg === 'transparent' ? 0 : '32px';
    const imgBox = { position: 'relative' as const, width: '100%', height: 0, paddingBottom: '75%', margin: 0, overflow: 'hidden', borderRadius: `${t.radius}px`, background: t.surfaceAlt };

    return (
      <div {...ctx.root('hover-list', { padding: pad, position: 'relative' })}
        data-layout={p.layout} data-accent={accent} {...(p.textOnHover ? { 'data-texthover': '1' } : {})}>
        {p.eyebrow && <div {...ctx.edit('eyebrow', 'text')} style={sx.eyebrow({ margin: '0 0 10px 0', color: t.dark ? t.muted : t.accent })}>{p.eyebrow}</div>}
        {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(32, { margin: '0 0 20px 0' })}>{p.heading}</h2>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start', margin: 0, padding: 0 }}>
          <div className="sfuhl-list" role="list" style={{ flex: '2 1 360px', minWidth: 0, margin: 0, padding: 0, borderTop: p.lines ? `1px solid ${lineColor}` : 0 }}>
            {p.items.map((r, i) => {
              const Tag = r.url ? 'a' : 'div';
              return (
                <div key={r._id ?? i} role="listitem" className="sfuhl-row" {...ctx.item('items', i)} {...ctx.reveal()}
                  style={{ margin: 0, padding: 0, borderBottom: p.lines ? `1px solid ${lineColor}` : 0, transition: 'opacity .3s ease' }}>
                  <Tag className="sfuhl-a" {...(r.url ? { href: r.url } : { tabIndex: 0 })}
                    style={{ display: 'block', margin: 0, padding: p.size === 'md' ? '14px 0' : '18px 0', color: t.heading, textDecoration: 'none', background: 'none', outlineOffset: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', margin: 0, padding: 0 }}>
                      <div style={{ flex: '1 1 auto', minWidth: 0, margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: '12px', rowGap: '2px' }}>
                        <h3 {...ctx.edit(`items.${i}.title`, 'text')} style={sx.heading(mx, { fontSize: `clamp(${mn}px, ${vw}vw, ${mx}px)`, lineHeight: 1.08, color: 'inherit', minWidth: 0 })}>{r.title}</h3>
                        {r.meta && <span {...ctx.edit(`items.${i}.meta`, 'text')} style={sx.small({ display: 'inline-block', color: t.muted, fontWeight: 700, letterSpacing: '.04em' })}>{r.meta}</span>}
                      </div>
                      {p.arrows && r.url && (
                        <span className="sfuhl-arrow" aria-hidden="true" style={{ flex: '0 0 auto', margin: 0, padding: 0, fontFamily: t.font, fontSize: `clamp(${Math.round(mn * 0.8)}px, ${vw * 0.7}vw, ${Math.round(mx * 0.6)}px)`, lineHeight: 1, color: accent, transition: 'transform .3s cubic-bezier(.2,.8,.2,1)' }}>&rarr;</span>
                      )}
                    </div>
                    <div className="sfuhl-more" style={{ display: 'block', margin: 0, padding: 0, overflow: 'hidden', transition: 'max-height .4s cubic-bezier(.2,.8,.2,1), opacity .3s ease' }}>
                      {r.image?.src && (
                        <span className="sfuhl-inl" style={{ display: 'none', margin: '14px 0 0 0', padding: 0, maxWidth: '420px' }}>
                          <span style={{ ...imgBox, display: 'block' }}>
                            <img src={r.image.src} alt={r.image.alt} loading="lazy" {...ctx.edit(`items.${i}.image`, 'image')} style={sx.imgFill('cover', r.image.pos)} />
                          </span>
                        </span>
                      )}
                      {r.text && <span {...ctx.edit(`items.${i}.text`, 'text')} style={sx.text({ display: 'block', margin: '8px 0 0 0', color: t.muted, fontSize: '16px', maxWidth: '620px' })}>{r.text}</span>}
                    </div>
                  </Tag>
                </div>
              );
            })}
          </div>
          {side && (
            <div className="sfuhl-side" aria-hidden="true" style={{ display: 'none', flex: '1 1 280px', minWidth: 0, margin: 0, padding: 0, position: 'sticky', top: '24px' }}>
              <div style={imgBox}>
                {p.items.map((r, i) => r.image?.src ? (
                  <img key={r._id ?? i} className="sfuhl-simg" data-i={String(i)} src={r.image.src} alt="" loading="lazy" {...ctx.edit(`items.${i}.image`, 'image')}
                    style={sx.imgFill('cover', r.image.pos, { opacity: i === 0 ? 1 : 0, transition: 'opacity .35s ease' })} />
                ) : null)}
              </div>
            </div>
          )}
        </div>
        {!side && (
          <div className="sfuhl-float" aria-hidden="true"
            style={{ display: 'none', position: 'absolute', top: 0, left: 0, width: '300px', height: '225px', margin: 0, padding: 0, overflow: 'hidden', borderRadius: `${t.radius}px`, boxShadow: '0 18px 44px rgba(0,0,0,.35)', pointerEvents: 'none', zIndex: 5, opacity: 0, transition: 'opacity .25s ease, transform .18s cubic-bezier(.2,.8,.2,1)' }}>
            {p.items.map((r, i) => r.image?.src ? (
              <img key={r._id ?? i} className="sfuhl-fimg" data-i={String(i)} src={r.image.src} alt="" loading="lazy"
                style={sx.imgFill('cover', r.image.pos, { opacity: 0, transition: 'opacity .25s ease' })} />
            ) : null)}
          </div>
        )}
      </div>
    );
  },
});
