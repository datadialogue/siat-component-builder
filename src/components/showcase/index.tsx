import type { CSSProperties, ReactNode } from 'react';
import { Shapes } from 'lucide-react';
import { defineComponent } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';
import { PROJECTS, type Project } from './projects';

/*
 * Project Showcase: student projects with year + topic filters, in five layouts.
 * Without JS every project shows, in order, and the filter bar stays hidden.
 * With JS the filter bar appears and the opening view is N random picks from the
 * most recent years, spread across topics (runtime.es5.js).
 */

type Layout = 'grid' | 'mosaic' | 'masonry' | 'index' | 'rail';
interface Props {
  eyebrow: string;
  heading: string;
  intro: string;
  linkLabel: string;
  linkUrl: string;
  allLabel: string;
  items: Project[];
  layout: Layout;
  cardStyle: 'card' | 'plain' | 'overlay';
  columns: string;
  aspect: string;
  gap: string;
  showMeta: boolean;
  showBy: boolean;
  featured: number;
  recent: number;
  yearFilter: 'year' | 'term' | 'none';
  topicFilter: boolean;
  shuffle: boolean;
  textFx: 'rise' | 'fade' | 'none';
  animate: boolean;
}

const newProject = (i: number): Project => ({
  image: placeholderImage(i + 1, '4:3'),
  title: `Project ${i + 1}`,
  blurb: 'A few words about the project.',
  topic: 'Games',
  term: 'Spring 2026',
  by: 'Student names',
  course: 'IAT 100',
  url: '',
});

export const yearOf = (term: string) => /(\d{4})/.exec(term || '')?.[1] ?? '';
const courseCode = (c: string) => /^[A-Z]{2,4}\s*\d{3}/.exec((c || '').trim())?.[0] ?? c;

/** Mosaic tile sizes by visible position (the runtime re-applies this after filtering). */
export const MOSAIC = ['L', 'S', 'S', 'T', 'W', 'S', 'S', 'W', 'S', 'S', 'T', 'S'] as const;
const SPAN = { S: [1, 1], W: [2, 1], T: [1, 2], L: [2, 2] } as const;
const TITLE = { S: 17, W: 22, T: 20, L: 30 } as const;

export default defineComponent<Props>({
  id: 'showcase',
  name: 'Project Showcase',
  category: 'Interactive',
  description: 'Student projects with year and topic filters. Opens on random picks from recent years.',
  icon: Shapes,
  commonDefaults: { hover: 'lift' },
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Eyebrow' },
    { key: 'heading', type: 'text', label: 'Heading' },
    { key: 'intro', type: 'text', label: 'Intro', multiline: true },
    { key: 'linkLabel', type: 'text', label: 'Link label' },
    { key: 'linkUrl', type: 'url', label: 'Link', help: 'Optional link beside the heading, e.g. the submission form or past showcases.' },
    {
      key: 'items', type: 'list', label: 'Projects', itemLabel: 'project', titleKey: 'title', thumbKey: 'image', min: 1, max: 80,
      newItem: newProject,
      itemFields: [
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'blurb', type: 'text', label: 'A few words', multiline: true, help: 'One short line. About ten words reads best.' },
        { key: 'topic', type: 'text', label: 'Topic', help: 'Projects with the same topic share a filter button. Type it the same way each time.' },
        { key: 'term', type: 'text', label: 'Term', help: 'For example "Spring 2026". The year is read from it.' },
        { key: 'by', type: 'text', label: 'By' },
        { key: 'course', type: 'text', label: 'Course' },
        { key: 'url', type: 'url', label: 'Link' },
      ],
    },
    { key: 'allLabel', type: 'text', label: '"See all" label', help: 'Button under the random picks that shows every project.' },

    {
      key: 'layout', type: 'select', label: 'Layout', tab: 'style',
      options: [{ value: 'grid', label: 'Grid' }, { value: 'mosaic', label: 'Mosaic' }, { value: 'masonry', label: 'Masonry' }, { value: 'index', label: 'Index' }, { value: 'rail', label: 'Rail' }],
    },
    {
      key: 'cardStyle', type: 'select', label: 'Card look', tab: 'style', showIf: (p) => ['grid', 'masonry', 'rail'].includes(p.layout),
      options: [{ value: 'card', label: 'Card' }, { value: 'plain', label: 'Plain' }, { value: 'overlay', label: 'Text on image' }],
    },
    { key: 'columns', type: 'select', label: 'Max columns', tab: 'style', showIf: (p) => ['grid', 'mosaic', 'masonry'].includes(p.layout), options: ['2', '3', '4', '5'].map((v) => ({ value: v, label: v })) },
    { key: 'aspect', type: 'select', label: 'Image shape', tab: 'style', showIf: (p) => p.layout === 'grid' || p.layout === 'rail', options: [{ value: '4:3', label: '4:3' }, { value: '16:10', label: '16:10' }, { value: '1:1', label: 'Square' }, { value: '3:4', label: 'Tall' }] },
    { key: 'gap', type: 'select', label: 'Gap', tab: 'style', options: [{ value: '6', label: 'XS' }, { value: '12', label: 'S' }, { value: '20', label: 'M' }, { value: '28', label: 'L' }] },
    { key: 'showMeta', type: 'toggle', label: 'Term and course', tab: 'style' },
    { key: 'showBy', type: 'toggle', label: 'Student names', tab: 'style' },

    { key: 'featured', type: 'number', label: 'Random picks', tab: 'behaviour', min: 0, max: 24, help: 'How many projects the opening view shows, picked at random across topics. 0 shows everything.' },
    { key: 'recent', type: 'number', label: 'From the last', unit: 'years', tab: 'behaviour', min: 1, max: 6, showIf: (p) => p.featured > 0, help: 'Random picks only come from this many of the most recent years.' },
    { key: 'shuffle', type: 'toggle', label: 'Shuffle button', tab: 'behaviour', showIf: (p) => p.featured > 0 },
    { key: 'yearFilter', type: 'select', label: 'Time filter', tab: 'behaviour', options: [{ value: 'year', label: 'Years' }, { value: 'term', label: 'Terms' }, { value: 'none', label: 'Off' }] },
    { key: 'topicFilter', type: 'toggle', label: 'Topic filter', tab: 'behaviour' },
    { key: 'textFx', type: 'select', label: 'Title motion', tab: 'behaviour', options: [{ value: 'rise', label: 'Words rise' }, { value: 'fade', label: 'Words fade' }, { value: 'none', label: 'None' }], help: 'Plays on titles when the showcase scrolls into view and after each filter. Mosaic and Index only.' },
    { key: 'animate', type: 'toggle', label: 'Animate filtering', tab: 'behaviour' },
  ],
  defaults: {
    eyebrow: 'Student work',
    heading: 'Project showcase',
    intro: 'Games, films, apps and installations made by SIAT students.',
    linkLabel: 'Submit a project',
    linkUrl: 'https://www.sfu.ca/siat/showcase/showcase-submission.html',
    allLabel: 'See all projects',
    items: PROJECTS,
    layout: 'grid',
    cardStyle: 'card',
    columns: '3',
    aspect: '4:3',
    gap: '20',
    showMeta: true,
    showBy: false,
    featured: 9,
    recent: 2,
    yearFilter: 'year',
    topicFilter: true,
    shuffle: true,
    textFx: 'rise',
    animate: true,
  },
  presets: [
    { name: 'Grid', props: { layout: 'grid', cardStyle: 'card', columns: '3', aspect: '4:3', gap: '20' }, common: { shadow: 'sm' } },
    { name: 'Mosaic', props: { layout: 'mosaic', columns: '4', gap: '6', textFx: 'rise' }, common: { theme: 'charcoal', hover: 'none' } },
    { name: 'Masonry', props: { layout: 'masonry', cardStyle: 'plain', columns: '4', gap: '20' } },
    { name: 'Index', props: { layout: 'index', textFx: 'rise', gap: '12' }, common: { hover: 'none' } },
    { name: 'Rail', props: { layout: 'rail', cardStyle: 'overlay', aspect: '3:4', gap: '12' }, common: { theme: 'grey' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const items = p.items ?? [];
    const gap = parseInt(p.gap, 10) || 0;
    const cols = Math.max(2, parseInt(p.columns, 10) || 3);
    const fx = (p.layout === 'mosaic' || p.layout === 'index') ? p.textFx : 'none';
    const line = t.dark ? 'rgba(255,255,255,.22)' : t.border;
    const ink = t.dark ? '#ffffff' : t.heading;
    const cardBg = t.dark ? t.surface : '#ffffff';

    // Filter values, from the projects themselves.
    const count: Record<string, number> = {};
    items.forEach((c) => { if (c.topic) count[c.topic] = (count[c.topic] ?? 0) + 1; });
    const topics = Object.keys(count).sort((a, b) => count[b] - count[a]);
    const years = [...new Set(items.map((c) => yearOf(c.term)).filter(Boolean))].sort((a, b) => +b - +a);
    const terms = [...new Set(items.map((c) => c.term).filter(Boolean))];
    const timeVals = p.yearFilter === 'term' ? terms : p.yearFilter === 'year' ? years : [];

    // Active/inactive looks are handed to the runtime as style strings.
    const tabOn = `color:${ink};border-bottom-color:${t.accent};`;
    const tabOff = `color:${t.muted};border-bottom-color:transparent;`;
    const chipOn = `background:${t.accent};border-color:${t.accent};color:${t.onAccent};`;
    const chipOff = `background:transparent;border-color:${line};color:${t.text};`;

    const tab: CSSProperties = sx.buttonReset({
      flex: '0 0 auto', whiteSpace: 'nowrap', fontFamily: t.font, fontSize: '19px', lineHeight: 1.2, fontWeight: 800, fontStretch: '83%', color: t.muted,
      padding: '6px 0', borderBottom: '3px solid transparent', transition: 'color .2s ease, border-color .2s ease',
    });
    const chip: CSSProperties = sx.buttonReset({
      display: 'inline-flex', flex: '0 0 auto', whiteSpace: 'nowrap', alignItems: 'center', gap: '6px', fontFamily: t.font, fontSize: '14px', lineHeight: 1.2, fontWeight: 600,
      padding: '7px 13px', borderRadius: '999px', border: `1px solid ${line}`, color: t.text,
      transition: 'background-color .2s ease, color .2s ease, border-color .2s ease, opacity .2s ease',
    });
    const roundBtn: CSSProperties = sx.buttonReset({
      display: 'none', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%',
      border: `2px solid ${ink}`, color: ink, fontSize: '17px', lineHeight: 1, fontFamily: t.font,
    });

    /** Title words wrapped for the rise/fade animation; plain text otherwise. */
    const words = (s: string): ReactNode => fx === 'none' ? s : s.split(/\s+/).filter(Boolean).flatMap((w, k) => [
      k ? ' ' : null,
      <span key={k} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', margin: '0 0 -.12em 0', padding: '0 0 .12em 0' }}>
        <span className="sfsc-w" style={{ display: 'inline-block', margin: 0, padding: 0 }}>{w}</span>
      </span>,
    ]);

    const meta = (c: Project) => [p.showMeta && c.term, p.showMeta && c.course && courseCode(c.course)].filter(Boolean).join(' · ');

    const itemAttrs = (c: Project, i: number) => ({
      className: 'sfsc-it', role: 'listitem', 'data-i': String(i), 'data-topic': c.topic || '', 'data-year': yearOf(c.term), 'data-term': c.term || '',
      ...ctx.item('items', i),
    });

    /** Text over the image (mosaic tiles, "Text on image" cards). */
    const overlay = (c: Project, i: number, size: number, fill: boolean) => {
      const link = !!c.url;
      const Tag = link ? 'a' : 'div';
      return (
        <Tag className="sfsc-tile" {...(link ? { href: c.url } : {})} {...(p.layout === 'mosaic' ? {} : ctx.hover())}
          style={{
            position: fill ? 'absolute' : 'relative', top: 0, left: 0, width: '100%', height: fill ? '100%' : 'auto', display: 'block', margin: 0, padding: 0,
            boxSizing: 'border-box', overflow: 'hidden', isolation: 'isolate', textDecoration: 'none', color: '#ffffff', background: '#1c1c1c',
            borderRadius: `${t.radius}px`, boxShadow: p.layout === 'mosaic' ? 'none' : t.shadow,
          }}>
          {p.layout === 'masonry'
            ? <img className="sfsc-img" src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`items.${i}.image`, 'image')} style={sx.img({ transition: 'transform .8s cubic-bezier(.2,.8,.2,1)' })} />
            : (
              <div style={fill ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0 } : sx.ratio(p.aspect)}>
                <img className="sfsc-img" src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`items.${i}.image`, 'image')}
                  style={sx.imgFill('cover', c.image.pos, { transition: 'transform .8s cubic-bezier(.2,.8,.2,1)' })} />
              </div>
            )}
          <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0, background: 'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.5) 40%, rgba(0,0,0,0) 72%)' }} />
          {c.topic && (
            <span {...ctx.edit(`items.${i}.topic`, 'text')} style={sx.eyebrow({ position: 'absolute', top: '12px', left: '12px', color: '#ffffff', fontSize: '11px', background: 'rgba(0,0,0,.55)', padding: '4px 8px', borderRadius: `${t.radiusSm}px` })}>{c.topic}</span>
          )}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, margin: 0, padding: '16px', boxSizing: 'border-box' }}>
            <h3 className="sfsc-t" {...ctx.edit(`items.${i}.title`, 'text')} style={sx.heading(size, { color: '#ffffff', lineHeight: 1.1 })}>{words(c.title)}</h3>
            <div className="sfsc-more" style={{ margin: 0, padding: 0, overflow: 'hidden', transition: 'max-height .4s ease, opacity .3s ease' }}>
              {c.blurb && <p {...ctx.edit(`items.${i}.blurb`, 'text')} style={sx.text({ color: 'rgba(255,255,255,.88)', fontSize: '14px', lineHeight: 1.4, margin: '6px 0 0 0' })}>{c.blurb}</p>}
              {meta(c) && <div style={sx.small({ color: 'rgba(255,255,255,.7)', fontSize: '12px', margin: '6px 0 0 0' })}>{meta(c)}</div>}
              {p.showBy && c.by && <div {...ctx.edit(`items.${i}.by`, 'text')} style={sx.small({ color: 'rgba(255,255,255,.7)', fontSize: '12px', margin: '2px 0 0 0' })}>By {c.by}</div>}
            </div>
          </div>
        </Tag>
      );
    };

    /** Image above text (grid, masonry and rail with "Card" or "Plain"). */
    const card = (c: Project, i: number) => {
      const link = !!c.url;
      const Tag = link ? 'a' : 'div';
      const boxed = p.cardStyle === 'card';
      const imgBox: CSSProperties = { borderRadius: boxed ? 0 : `${t.radius}px`, background: t.surfaceAlt };
      return (
        <Tag className="sfsc-card" {...(link ? { href: c.url } : {})} {...ctx.hover()}
          style={{
            display: 'block', height: '100%', margin: 0, padding: 0, boxSizing: 'border-box', overflow: 'hidden', textDecoration: 'none', color: t.text,
            background: boxed ? cardBg : 'transparent', borderRadius: boxed ? `${t.radius}px` : 0, boxShadow: boxed ? t.shadow : 'none',
            border: boxed && t.shadow === 'none' ? `1px solid ${line}` : 0,
          }}>
          {p.layout === 'masonry'
            ? <div style={{ ...imgBox, margin: 0, padding: 0, overflow: 'hidden' }}><img className="sfsc-img" src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`items.${i}.image`, 'image')} style={sx.img({ transition: 'transform .8s cubic-bezier(.2,.8,.2,1)' })} /></div>
            : (
              <div style={sx.ratio(p.aspect, imgBox)}>
                <img className="sfsc-img" src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`items.${i}.image`, 'image')} style={sx.imgFill('cover', c.image.pos, { transition: 'transform .8s cubic-bezier(.2,.8,.2,1)' })} />
              </div>
            )}
          <div style={{ margin: 0, padding: boxed ? '16px 18px 18px 18px' : '14px 0 0 0', boxSizing: 'border-box' }}>
            {c.topic && <div {...ctx.edit(`items.${i}.topic`, 'text')} style={sx.eyebrow({ fontSize: '12px', margin: '0 0 6px 0' })}>{c.topic}</div>}
            <h3 className="sfsc-t" {...ctx.edit(`items.${i}.title`, 'text')} style={sx.heading(20, { margin: 0 })}>{c.title}</h3>
            {c.blurb && <p {...ctx.edit(`items.${i}.blurb`, 'text')} style={sx.text({ fontSize: '15px', lineHeight: 1.45, color: t.muted, margin: '6px 0 0 0' })}>{c.blurb}</p>}
            {meta(c) && <div style={sx.small({ fontSize: '13px', margin: '10px 0 0 0' })}>{meta(c)}</div>}
            {p.showBy && c.by && <div {...ctx.edit(`items.${i}.by`, 'text')} style={sx.small({ fontSize: '13px', margin: '2px 0 0 0' })}>By {c.by}</div>}
          </div>
        </Tag>
      );
    };

    /** Index row: thumbnail, big title, topic and term. The runtime adds a floating preview on hover. */
    const row = (c: Project, i: number) => {
      const link = !!c.url;
      const Tag = link ? 'a' : 'div';
      return (
        <Tag className="sfsc-row" {...(link ? { href: c.url } : {})}
          style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '20px', rowGap: '6px', margin: 0, padding: `${gap + 6}px 0`,
            boxSizing: 'border-box', borderTop: `1px solid ${line}`, textDecoration: 'none', color: t.text, transition: 'opacity .25s ease',
          }}>
          <span style={sx.ratio('4:3', { flex: '0 0 88px', width: '88px', paddingBottom: '66px', borderRadius: `${t.radiusSm}px`, background: t.surfaceAlt })}>
            <img className="sfsc-img" src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`items.${i}.image`, 'image')} style={sx.imgFill('cover', c.image.pos)} />
          </span>
          <span style={{ display: 'block', flex: '1 1 180px', minWidth: 0, margin: 0, padding: 0 }}>
            <h3 className="sfsc-t" {...ctx.edit(`items.${i}.title`, 'text')} style={sx.heading(28, { color: ink })}>{words(c.title)}</h3>
            {c.blurb && <span {...ctx.edit(`items.${i}.blurb`, 'text')} style={sx.text({ display: 'block', fontSize: '15px', lineHeight: 1.4, color: t.muted, margin: '4px 0 0 0' })}>{c.blurb}</span>}
            {p.showBy && c.by && <span {...ctx.edit(`items.${i}.by`, 'text')} style={sx.small({ display: 'block', fontSize: '13px', margin: '4px 0 0 0' })}>By {c.by}</span>}
          </span>
          {c.topic && <span className="sfsc-col" {...ctx.edit(`items.${i}.topic`, 'text')} style={sx.eyebrow({ flex: '0 0 auto', fontSize: '12px', minWidth: '150px' })}>{c.topic}</span>}
          {meta(c) && <span className="sfsc-col" style={sx.small({ flex: '0 0 auto', minWidth: '150px', fontSize: '13px' })}>{meta(c)}</span>}
          <span className="sfsc-arrow" aria-hidden="true" style={{ flex: '0 0 auto', margin: 0, padding: 0, fontFamily: t.font, fontSize: '22px', color: t.accent, transition: 'transform .25s ease' }}>&rarr;</span>
        </Tag>
      );
    };

    let list: ReactNode;
    if (p.layout === 'mosaic') {
      list = (
        <div role="list" className="sfsc-list" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(min(max(150px, calc((100% - ${(cols - 1) * gap}px) / ${cols})), calc((100% - ${gap}px) / 2)), 1fr))`,
          gridAutoRows: '150px', gridAutoFlow: 'row dense', gap: `${gap}px`, margin: 0, padding: 0, boxSizing: 'border-box',
        }}>
          {items.map((c, i) => {
            const s = MOSAIC[i % MOSAIC.length];
            const [cs, rs] = SPAN[s];
            return (
              <div key={c._id ?? i} {...itemAttrs(c, i)} style={{ gridColumn: `span ${cs}`, gridRow: `span ${rs}`, position: 'relative', minWidth: 0, minHeight: 0, margin: 0, padding: 0 }}>
                {overlay(c, i, TITLE[s], true)}
              </div>
            );
          })}
        </div>
      );
    } else if (p.layout === 'index') {
      list = (
        <div role="list" className="sfsc-list" style={{ margin: 0, padding: 0, borderBottom: `1px solid ${line}` }}>
          {items.map((c, i) => <div key={c._id ?? i} {...itemAttrs(c, i)} style={{ margin: 0, padding: 0 }}>{row(c, i)}</div>)}
        </div>
      );
    } else if (p.layout === 'rail') {
      list = (
        <div role="list" id={`${ctx.id}-track`} className="sfsc-list" tabIndex={0} aria-label={p.heading || 'Projects'}
          style={{ display: 'flex', gap: `${gap}px`, margin: 0, padding: '4px 2px 14px 2px', boxSizing: 'border-box', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as CSSProperties}>
          {items.map((c, i) => (
            <div key={c._id ?? i} {...itemAttrs(c, i)} style={{ flex: '0 0 300px', maxWidth: '82%', scrollSnapAlign: 'start', margin: 0, padding: 0 }}>
              {p.cardStyle === 'overlay' ? overlay(c, i, 24, false) : card(c, i)}
            </div>
          ))}
        </div>
      );
    } else if (p.layout === 'masonry') {
      list = (
        <div role="list" className="sfsc-list" style={{ columns: `220px ${cols}`, columnGap: `${gap}px`, margin: 0, padding: 0 }}>
          {items.map((c, i) => (
            <div key={c._id ?? i} {...itemAttrs(c, i)} style={{ display: 'inline-block', width: '100%', margin: `0 0 ${gap}px 0`, padding: 0, breakInside: 'avoid', verticalAlign: 'top' }}>
              {p.cardStyle === 'overlay' ? overlay(c, i, 21, false) : card(c, i)}
            </div>
          ))}
        </div>
      );
    } else {
      list = (
        <div role="list" className="sfsc-list" style={sx.grid(cols, 240, gap)}>
          {items.map((c, i) => (
            <div key={c._id ?? i} {...itemAttrs(c, i)} style={{ margin: 0, padding: 0, minWidth: 0 }}>
              {p.cardStyle === 'overlay' ? overlay(c, i, 22, false) : card(c, i)}
            </div>
          ))}
        </div>
      );
    }

    const hasFilters = timeVals.length > 0 || (p.topicFilter && topics.length > 1);

    return (
      <div {...ctx.root('showcase', { padding: t.bg === 'transparent' ? 0 : '32px', position: 'relative' })}
        data-layout={p.layout} data-featured={String(Math.max(0, p.featured | 0))} data-recent={String(Math.max(1, p.recent | 0))}
        data-ymode={p.yearFilter} data-fx={fx} data-anim={p.animate ? '1' : '0'} data-gap={String(gap)}
        data-tab-on={tabOn} data-tab-off={tabOff} data-chip-on={chipOn} data-chip-off={chipOff}>
        <div {...ctx.reveal()} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px 24px', margin: '0 0 20px 0', padding: 0 }}>
          <div style={{ flex: '1 1 360px', minWidth: 0, margin: 0, padding: 0 }}>
            {p.eyebrow && <div {...ctx.edit('eyebrow', 'text')} style={sx.eyebrow({ margin: '0 0 8px 0' })}>{p.eyebrow}</div>}
            {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(38, { color: ink, margin: 0 })}>{p.heading}</h2>}
            {p.intro && <p {...ctx.edit('intro', 'text')} style={sx.text({ color: t.muted, maxWidth: '640px', margin: '8px 0 0 0' })}>{p.intro}</p>}
          </div>
          {p.linkUrl && p.linkLabel && (
            <a href={p.linkUrl} {...ctx.edit('linkLabel', 'text')} style={sx.link({ fontFamily: t.font, fontSize: '15px', fontWeight: 700 })}>{p.linkLabel} &rarr;</a>
          )}
        </div>

        <div className="sfsc-ctl" style={{ display: 'none', flexDirection: 'column', gap: '14px', margin: '0 0 22px 0', padding: 0 }}>
          {hasFilters && timeVals.length > 0 && (
            <div role="group" className="sfsc-scroll" aria-label={p.yearFilter === 'term' ? 'Term' : 'Year'} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 22px', margin: 0, padding: 0, borderBottom: `1px solid ${line}` }}>
              {p.featured > 0 && <button type="button" data-fy="feat" aria-pressed="false" style={tab}>&#10022; Featured</button>}
              {timeVals.map((v) => <button key={v} type="button" data-fy={v} aria-pressed="false" style={tab}>{v}</button>)}
              <button type="button" data-fy="all" aria-pressed="false" style={tab}>{p.yearFilter === 'term' ? 'All terms' : 'All years'}</button>
            </div>
          )}
          {p.topicFilter && topics.length > 1 && (
            <div role="group" className="sfsc-scroll" aria-label="Topic" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: 0, padding: 0 }}>
              <button type="button" data-ft="all" aria-pressed="false" style={chip}>All topics</button>
              {topics.map((v) => (
                <button key={v} type="button" data-ft={v} aria-pressed="false" style={chip}>
                  {v}<span className="sfsc-n" style={{ fontSize: '12px', opacity: 0.65, margin: 0, padding: 0 }}>{count[v]}</span>
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px', margin: 0, padding: 0 }}>
            <span className="sfsc-count" aria-live="polite" style={sx.small({ flex: '1 1 auto' })} />
            {p.featured > 0 && p.shuffle && (
              <button type="button" className="sfsc-shuf" style={sx.buttonReset({ display: 'none', fontFamily: t.font, fontSize: '14px', fontWeight: 700, color: t.link, padding: '4px 0' })}>&#8635; Shuffle</button>
            )}
            {p.layout === 'rail' && (
              <span style={{ display: 'inline-flex', gap: '8px', margin: 0, padding: 0 }}>
                <button type="button" className="sfsc-prev" aria-label="Previous" aria-controls={`${ctx.id}-track`} style={roundBtn}>&larr;</button>
                <button type="button" className="sfsc-next" aria-label="Next" aria-controls={`${ctx.id}-track`} style={roundBtn}>&rarr;</button>
              </span>
            )}
          </div>
        </div>

        {list}

        <p className="sfsc-empty" style={sx.text({ display: 'none', color: t.muted, padding: '24px 0', textAlign: 'center' })}>No projects match. Try another topic or year.</p>
        {p.featured > 0 && (
          <div style={{ textAlign: 'center', margin: '28px 0 0 0', padding: 0 }}>
            <button type="button" className="sfsc-all" {...ctx.edit('allLabel', 'text')} style={sx.button('secondary', { display: 'none' })}>{p.allLabel || 'See all projects'}</button>
          </div>
        )}
      </div>
    );
  },
});
