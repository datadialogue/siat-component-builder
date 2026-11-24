import type { CSSProperties } from 'react';
import { LayoutGrid } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

interface Card {
  _id?: string; image: ImageValue; tag: string; date: string; title: string; text: string; linkLabel: string; url: string;
}
interface Props {
  sectionTitle: string;
  viewAllLabel: string;
  viewAllUrl: string;
  cards: Card[];
  columns: string;
  variant: 'elevated' | 'outline' | 'flat' | 'overlay';
  aspect: string;
  showImage: boolean;
  showTag: boolean;
  showDate: boolean;
  showText: boolean;
  linkMode: 'card' | 'text' | 'button' | 'none';
  filter: boolean;
}

const TAGS = ['News', 'Research', 'Events'];
const newCard = (i: number): Card => ({
  image: placeholderImage(i + 1, '16:9'),
  tag: TAGS[i % TAGS.length],
  date: 'Nov 23, 2026',
  title: `Card title ${i + 1}`,
  text: 'One or two sentences that summarise the story and make people want to read more.',
  linkLabel: 'Read more',
  url: 'https://www.sfu.ca/siat.html',
});

export default defineComponent<Props>({
  id: 'card-grid',
  name: 'Card Grid',
  category: 'Content',
  description: 'News, programs or people as responsive cards. Optional tag filter.',
  icon: LayoutGrid,
  commonDefaults: { hover: 'lift' },
  fields: [
    { key: 'sectionTitle', type: 'text', label: 'Section title' },
    { key: 'viewAllLabel', type: 'text', label: '"View all" link', showIf: (p) => !!p.sectionTitle },
    { key: 'viewAllUrl', type: 'url', label: '"View all" URL', showIf: (p) => !!p.sectionTitle && !!p.viewAllLabel },
    {
      key: 'cards', type: 'list', label: 'Cards', itemLabel: 'card', titleKey: 'title', thumbKey: 'image', min: 1, max: 24,
      newItem: newCard,
      itemFields: [
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'tag', type: 'text', label: 'Tag', help: 'Also used by the filter buttons.' },
        { key: 'date', type: 'text', label: 'Date / meta' },
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text', multiline: true },
        { key: 'url', type: 'url', label: 'Link' },
        { key: 'linkLabel', type: 'text', label: 'Link text' },
      ],
    },
    { key: 'columns', type: 'select', label: 'Columns', tab: 'style', options: ['1', '2', '3', '4'].map((v) => ({ value: v, label: v })), help: 'Maximum columns. Cards wrap to fewer columns on small screens automatically.' },
    { key: 'variant', type: 'select', label: 'Card style', tab: 'style', options: [{ value: 'elevated', label: 'Raised' }, { value: 'outline', label: 'Outline' }, { value: 'flat', label: 'Flat' }, { value: 'overlay', label: 'Overlay' }] },
    { key: 'aspect', type: 'select', label: 'Image shape', tab: 'style', options: [{ value: '16:9', label: '16:9' }, { value: '4:3', label: '4:3' }, { value: '1:1', label: 'Square' }, { value: '3:4', label: 'Portrait' }] },
    { key: 'showImage', type: 'toggle', label: 'Images', tab: 'style' },
    { key: 'showTag', type: 'toggle', label: 'Tags', tab: 'style' },
    { key: 'showDate', type: 'toggle', label: 'Dates', tab: 'style' },
    { key: 'showText', type: 'toggle', label: 'Text', tab: 'style' },
    { key: 'linkMode', type: 'select', label: 'Link', tab: 'behaviour', options: [{ value: 'card', label: 'Whole card' }, { value: 'text', label: 'Text link' }, { value: 'button', label: 'Button' }, { value: 'none', label: 'None' }] },
    { key: 'filter', type: 'toggle', label: 'Filter by tag', tab: 'behaviour', help: 'Adds buttons that filter cards by their tag.' },
  ],
  defaults: {
    sectionTitle: '',
    viewAllLabel: 'View all',
    viewAllUrl: 'https://www.sfu.ca/siat/news.html',
    cards: Array.from({ length: 3 }, (_, i) => newCard(i)),
    columns: '3',
    variant: 'elevated',
    aspect: '16:9',
    showImage: true,
    showTag: true,
    showDate: true,
    showText: true,
    linkMode: 'card',
    filter: false,
  },
  presets: [
    { name: 'News', props: { variant: 'elevated', showDate: true, showTag: true, aspect: '16:9' }, common: { hover: 'lift' } },
    { name: 'Programs', props: { variant: 'outline', showDate: false, linkMode: 'button', columns: '2' }, common: { hover: 'glow' } },
    { name: 'People', props: { variant: 'flat', aspect: '1:1', showTag: false, showDate: false, columns: '4' }, common: { hover: 'zoom' } },
    { name: 'Overlay', props: { variant: 'overlay', aspect: '4:3', showText: false }, common: { hover: 'zoom' } },
  ],
  runtime: (p) => (p.filter ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const cols = parseInt(p.columns, 10) || 3;
    const overlay = p.variant === 'overlay';
    const tags = Array.from(new Set(p.cards.map((c) => c.tag.trim()).filter(Boolean)));
    const cardBase: Record<Props['variant'], CSSProperties> = {
      elevated: { background: t.dark ? t.surface : '#ffffff', borderRadius: `${t.radius}px`, boxShadow: t.shadow === 'none' ? `0 0 0 1px ${t.border}` : t.shadow, overflow: 'hidden' },
      outline: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: `${t.radius}px`, overflow: 'hidden' },
      flat: { background: 'transparent' },
      overlay: { borderRadius: `${t.radius}px`, overflow: 'hidden', background: '#222' },
    };
    const pad = p.variant === 'flat' ? '14px 0 0 0' : '18px 20px 20px';
    const filterOn = `background:${t.accent};color:${t.onAccent};border-color:${t.accent};`;
    const filterOff = `background:transparent;color:${t.text};border-color:${t.border};`;

    return (
      <div {...ctx.root('card-grid', { padding: t.bg === 'transparent' ? 0 : '24px' })}
        {...(p.filter ? { 'data-on': filterOn, 'data-off': filterOff } : {})}>
        {p.sectionTitle && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px 16px', margin: '0 0 20px 0', padding: 0 }}>
            <h2 {...ctx.edit('sectionTitle', 'text')} style={sx.heading(30, { margin: 0 })}>{p.sectionTitle}</h2>
            {p.viewAllLabel && <a href={p.viewAllUrl} {...ctx.edit('viewAllLabel', 'text')} style={sx.link({ fontFamily: t.font, fontSize: '15px', fontWeight: 700 })}>{p.viewAllLabel} &rarr;</a>}
          </div>
        )}
        {p.filter && tags.length > 1 && (
          <div className="sfuc-filters" role="toolbar" aria-label="Filter" style={{ display: 'none', flexWrap: 'wrap', gap: '8px', margin: '0 0 20px 0', padding: 0 }}>
            {['', ...tags].map((tag) => (
              <button key={tag || 'all'} type="button" data-tag={tag} aria-pressed={tag === '' ? 'true' : 'false'}
                style={sx.buttonReset({ padding: '7px 16px', border: `1px solid ${t.border}`, borderRadius: '999px', fontFamily: t.font, fontSize: '14px', fontWeight: 700, color: t.text, transition: 'background-color .2s ease, color .2s ease' })}>
                {tag || 'All'}
              </button>
            ))}
          </div>
        )}
        <div style={sx.grid(cols, cols >= 4 ? 200 : 240, 24)}>
          {p.cards.map((c, i) => {
            const Tag = p.linkMode === 'card' && c.url ? 'a' : 'div';
            const linkProps = Tag === 'a' ? { href: c.url } : {};
            const image = (p.showImage || overlay) && (
              <div style={sx.ratio(p.aspect, { borderRadius: p.variant === 'flat' ? `${t.radius}px` : 0 })}>
                <img src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`cards.${i}.image`, 'image')} style={sx.imgFill('cover', c.image.pos)} />
                {overlay && <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,.82) 0%, rgba(0,0,0,.25) 55%, rgba(0,0,0,0) 100%)' }} />}
              </div>
            );
            const fg = overlay ? '#ffffff' : t.text;
            const body = (
              <div style={overlay
                ? { position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px', boxSizing: 'border-box', margin: 0 }
                : { padding: pad, margin: 0, display: 'flex', flexDirection: 'column', flex: '1 1 auto', boxSizing: 'border-box' }}>
                {(p.showTag && c.tag) || (p.showDate && c.date) ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', alignItems: 'center', margin: '0 0 8px 0', padding: 0 }}>
                    {p.showTag && c.tag && <span {...ctx.edit(`cards.${i}.tag`, 'text')} style={sx.eyebrow({ color: overlay ? '#ffffff' : t.accent === '#ffffff' ? '#ffffff' : t.accent, fontSize: '12px' })}>{c.tag}</span>}
                    {p.showDate && c.date && <span {...ctx.edit(`cards.${i}.date`, 'text')} style={sx.small({ color: overlay ? 'rgba(255,255,255,.85)' : t.muted, fontSize: '13px' })}>{c.date}</span>}
                  </div>
                ) : null}
                <h3 {...ctx.edit(`cards.${i}.title`, 'text')} style={sx.heading(21, { color: overlay ? '#ffffff' : t.heading, margin: '0 0 8px 0' })}>{c.title}</h3>
                {p.showText && c.text && <p {...ctx.edit(`cards.${i}.text`, 'text')} style={sx.text({ color: overlay ? 'rgba(255,255,255,.9)' : fg, fontSize: '16px', margin: '0 0 14px 0' })}>{c.text}</p>}
                {p.linkMode === 'text' && c.linkLabel && (
                  <a href={c.url} {...ctx.edit(`cards.${i}.linkLabel`, 'text')} style={sx.link({ marginTop: 'auto', fontFamily: t.font, fontSize: '15px', fontWeight: 700, color: overlay ? '#ffffff' : t.link })}>{c.linkLabel} &rarr;</a>
                )}
                {p.linkMode === 'button' && c.linkLabel && (
                  <div style={{ marginTop: 'auto', padding: 0 }}>
                    <a href={c.url} {...ctx.edit(`cards.${i}.linkLabel`, 'text')} style={sx.button('secondary', { padding: '9px 18px', fontSize: '14px' })}>{c.linkLabel}</a>
                  </div>
                )}
                {p.linkMode === 'card' && c.linkLabel && !overlay && (
                  <span style={sx.small({ marginTop: 'auto', fontWeight: 700, color: t.link })}>{c.linkLabel} &rarr;</span>
                )}
              </div>
            );
            return (
              <Tag key={c._id ?? i} className="sfuc-card" {...(p.filter ? { 'data-tag': c.tag.trim() } : {})} {...linkProps} {...ctx.item('cards', i)} {...ctx.reveal()} {...ctx.hover()}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', margin: 0, padding: 0,
                  color: 'inherit', textDecoration: 'none', minWidth: 0,
                  ...cardBase[p.variant],
                }}>
                {image}
                {body}
              </Tag>
            );
          })}
        </div>
      </div>
    );
  },
});
