import type { CSSProperties } from 'react';
import { History } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

/*
 * Timeline: dated entries grouped into eras, with a sticky index of the eras
 * (side layout) or a centred line with alternating entries (centre layout).
 * Without JS: a single-column timeline whose index is plain anchor links.
 * runtime.es5.js adds the active-era highlight, smooth scrolling, the chip-row
 * index on narrow screens, the alternating centre layout and the entrance.
 */

interface Entry { _id?: string; group: string; date: string; title: string; text: string; image: ImageValue; linkLabel: string; url: string }
interface Props {
  heading: string;
  intro: string;
  entries: Entry[];
  layout: 'side' | 'centre';
  indexTitle: string;
  dateSize: 'md' | 'lg' | 'xl';
  animate: boolean;
}

const EMPTY: ImageValue = { src: '', alt: '' };
const TEXT = 'A sentence or two about what happened and why it mattered.';

const newEntry = (i: number): Entry => ([
  { group: '2000s', date: '2002', title: 'Where it began', text: TEXT, image: placeholderImage(1, '16:9'), linkLabel: '', url: '' },
  { group: '2000s', date: '2006', title: 'A new home', text: TEXT, image: EMPTY, linkLabel: '', url: '' },
  { group: '2010s', date: '2012', title: 'The first labs open', text: TEXT, image: placeholderImage(2, '16:9'), linkLabel: '', url: '' },
  { group: '2010s', date: '2017', title: 'Graduate programs grow', text: TEXT, image: EMPTY, linkLabel: 'Read more', url: 'https://www.sfu.ca/siat.html' },
  { group: '2020s', date: '2021', title: 'New spaces to make things', text: TEXT, image: placeholderImage(3, '16:9'), linkLabel: '', url: '' },
  { group: '2020s', date: '2026', title: 'Recognition', text: TEXT, image: EMPTY, linkLabel: '', url: '' },
][i] ?? { group: '2020s', date: String(2020 + i), title: `Milestone ${i + 1}`, text: TEXT, image: EMPTY, linkLabel: '', url: '' });

const DATE_SIZE = { md: 28, lg: 40, xl: 56 };

export default defineComponent<Props>({
  id: 'timeline',
  name: 'Timeline',
  category: 'Interactive',
  description: 'History as dated entries, with a sticky index of eras that follows the reader.',
  icon: History,
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    { key: 'intro', type: 'text', label: 'Intro', multiline: true },
    {
      key: 'entries', type: 'list', label: 'Entries', itemLabel: 'entry', titleKey: 'title', thumbKey: 'image', min: 1, max: 40,
      newItem: newEntry,
      itemFields: [
        { key: 'group', type: 'text', label: 'Era', help: 'Entries with the same era are grouped. Each era gets a link in the index.' },
        { key: 'date', type: 'text', label: 'Date' },
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text', multiline: true },
        { key: 'image', type: 'image', label: 'Image (optional)' },
        { key: 'url', type: 'url', label: 'Link' },
        { key: 'linkLabel', type: 'text', label: 'Link text', showIf: (e) => !!e.url },
      ],
    },
    { key: 'indexTitle', type: 'text', label: 'Index title', showIf: (p) => p.layout === 'side' },
    { key: 'layout', type: 'select', label: 'Layout', tab: 'style', options: [{ value: 'side', label: 'Side index' }, { value: 'centre', label: 'Centred' }], help: 'Centred alternates entries left and right on wide screens and becomes one column on phones.' },
    { key: 'dateSize', type: 'select', label: 'Date size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'animate', type: 'toggle', label: 'Reveal on scroll', tab: 'behaviour', help: 'Entries rise in as they scroll into view. Skipped for reduced-motion visitors.' },
  ],
  defaults: {
    heading: 'Our story',
    intro: '',
    entries: [0, 1, 2, 3, 4, 5].map(newEntry),
    layout: 'side',
    indexTitle: 'Jump to',
    dateSize: 'lg',
    animate: true,
  },
  presets: [
    { name: 'Side index', props: { layout: 'side', dateSize: 'lg' } },
    { name: 'Centred', props: { layout: 'centre', dateSize: 'lg' } },
    { name: 'Dark', props: { layout: 'side', dateSize: 'xl' }, common: { theme: 'charcoal' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const side = p.layout === 'side';
    const accent = t.accent;
    const solid = t.bg === 'transparent' ? '#ffffff' : t.bg;
    const pad = t.bg === 'transparent' ? 0 : '32px';

    // Unique eras in order of first appearance; each entry knows its era index.
    const groups: { label: string; first: number }[] = [];
    const gi: number[] = p.entries.map((e, i) => {
      const label = (e.group || '').trim();
      let k = groups.findIndex((g) => g.label === label);
      if (k < 0) { k = groups.length; groups.push({ label, first: i }); }
      return k;
    });
    const gid = (k: number) => `${ctx.id}-tl${k}`;

    const line: CSSProperties = { position: 'absolute', display: 'block', top: 0, bottom: 0, left: '9px', width: '2px', margin: 0, padding: 0, background: t.border };
    const dot: CSSProperties = { position: 'absolute', display: 'block', top: '12px', left: '3px', width: '14px', height: '14px', margin: 0, padding: 0, borderRadius: '50%', background: accent, boxShadow: `0 0 0 4px ${solid}` };

    const linkBase: CSSProperties = {
      display: 'block', margin: '0 0 0 -2px', padding: '8px 0 8px 14px', borderLeft: '3px solid transparent',
      fontFamily: t.font, fontSize: '16px', lineHeight: 1.3, color: t.muted, textDecoration: 'none', background: 'transparent',
    };

    return (
      <div {...ctx.root('timeline', { padding: pad })}
        data-layout={p.layout} data-ac={accent} data-on={t.onAccent} data-mu={t.muted} data-hd={t.heading} data-bd={t.border}
        {...(p.animate ? { 'data-anim': '1' } : {})}>
        {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(32, { margin: p.intro ? '0 0 8px 0' : '0 0 28px 0' })}>{p.heading}</h2>}
        {p.intro && <p {...ctx.edit('intro', 'text')} style={sx.text({ color: t.muted, margin: '0 0 28px 0', maxWidth: '680px' })}>{p.intro}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '32px', margin: 0, padding: 0 }}>
          {side && groups.length > 0 && (
            <nav className="sftl-nav" aria-label={p.indexTitle || 'Timeline'} style={{ flex: '1 1 160px', maxWidth: '220px', minWidth: 0, margin: 0, padding: 0, boxSizing: 'border-box' }}>
              <div className="sftl-navin" style={{ position: 'sticky', top: '16px', margin: 0, padding: '4px 0', background: solid, zIndex: 2 }}>
                {p.indexTitle && <div {...ctx.edit('indexTitle', 'text')} style={sx.eyebrow({ margin: '0 0 10px 0' })}>{p.indexTitle}</div>}
                <div className="sftl-list" role="list" style={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', gap: 0, margin: 0, padding: 0, borderLeft: `2px solid ${t.border}` }}>
                  {groups.map((g, k) => (
                    <div key={k} role="listitem" style={{ flex: '0 0 auto', margin: 0, padding: 0 }}>
                      <a className="sftl-link" data-g={String(k)} href={`#${gid(k)}`} style={k === 0 ? { ...linkBase, borderLeftColor: accent, color: t.heading, fontWeight: 800 } : linkBase}>
                        {g.label || '—'}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          )}
          <div className="sftl-body" style={{ flex: side ? '3 1 320px' : '1 1 100%', minWidth: 0, position: 'relative', margin: 0, padding: 0 }}>
            {p.entries.map((e, i) => {
              const k = gi[i];
              const marker = groups[k].first === i && groups[k].label !== '';
              return [
                marker && (
                  <div key={`g${k}`} id={gid(k)} className="sftl-group" data-g={String(k)} style={{ position: 'relative', margin: 0, padding: '0 0 20px 36px', scrollMarginTop: '80px' }}>
                    <span className="sftl-line" aria-hidden="true" style={line} />
                    <span {...ctx.edit(`entries.${i}.group`, 'text')} style={sx.eyebrow({ position: 'relative', display: 'inline-block', padding: '5px 12px', borderRadius: '999px', background: accent, color: t.onAccent, textTransform: 'none', letterSpacing: '.04em', fontSize: '14px' })}>{groups[k].label}</span>
                  </div>
                ),
                <div key={e._id ?? i} className="sftl-e" data-g={String(k)} {...ctx.item('entries', i)} style={{ position: 'relative', margin: 0, padding: '0 0 36px 36px', boxSizing: 'border-box' }}>
                  <span className="sftl-line" aria-hidden="true" style={line} />
                  <span className="sftl-dot" aria-hidden="true" style={dot} />
                  <div className="sftl-c" style={{ margin: 0, padding: 0 }}>
                    {e.date && <div {...ctx.edit(`entries.${i}.date`, 'text')} style={sx.heading(DATE_SIZE[p.dateSize] ?? 40, { color: accent, lineHeight: 1, margin: '0 0 8px 0' })}>{e.date}</div>}
                    {e.title && <h3 {...ctx.edit(`entries.${i}.title`, 'text')} style={sx.heading(22, { margin: '0 0 6px 0' })}>{e.title}</h3>}
                    {e.text && <p {...ctx.edit(`entries.${i}.text`, 'text')} style={sx.text({ margin: 0, maxWidth: '640px', display: 'inline-block' })}>{e.text}</p>}
                    {e.image?.src && (
                      <div className="sftl-img" style={{ maxWidth: '560px', margin: '16px 0 0 0', padding: 0 }}>
                        <div {...ctx.hover()} style={{ ...sx.ratio('16:9'), borderRadius: `${t.radius}px`, boxShadow: t.shadow, background: t.surfaceAlt }}>
                          <img src={e.image.src} alt={e.image.alt} loading="lazy" {...ctx.edit(`entries.${i}.image`, 'image')} style={sx.imgFill('cover', e.image.pos)} />
                        </div>
                      </div>
                    )}
                    {e.url && e.linkLabel && (
                      <div style={{ margin: '12px 0 0 0', padding: 0 }}>
                        <a href={e.url} {...ctx.edit(`entries.${i}.linkLabel`, 'text')} style={sx.link({ fontFamily: t.font, fontSize: '15px', fontWeight: 700 })}>{e.linkLabel} &rarr;</a>
                      </div>
                    )}
                  </div>
                </div>,
              ];
            })}
          </div>
        </div>
      </div>
    );
  },
});
