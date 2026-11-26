import type { CSSProperties } from 'react';
import { Rows3 } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import { PROJECTS, TOPICS } from '../showcase/projects';
import runtime from './runtime.es5.js?raw';

/*
 * Card Rows: several titled rows stacked on top of each other, each one scrolling
 * sideways on its own (the streaming-app / MIT Media Lab pattern). Every track is a
 * native overflow + scroll-snap row, so it swipes and scrolls with no script. The
 * runtime adds edge arrows that page through the row, page segments, edge fades and
 * arrow keys. All of that is hidden in the markup.
 */

interface Card { _id?: string; image: ImageValue; title: string; meta: string; tag: string; url: string }
interface Row { _id?: string; title: string; linkLabel: string; linkUrl: string; cards: Card[] }
interface Props {
  heading: string;
  intro: string;
  rows: Row[];
  layout: 'below' | 'overlay';
  aspect: '16:9' | '4:3' | '1:1' | '2:3';
  cardSize: 's' | 'm' | 'l';
  gap: string;
  endCard: boolean;
  arrows: 'edges' | 'header' | 'none';
  pager: boolean;
  step: 'page' | 'card';
}

const SHOWCASE = 'https://www.sfu.ca/siat/showcase.html';

const newCard = (i: number): Card => ({
  image: placeholderImage(i + 1, '16:9'),
  title: `Project ${i + 1}`,
  meta: 'Course · Term',
  tag: '',
  url: '',
});

const newRow = (i: number): Row => ({
  title: `Row ${i + 1}`,
  linkLabel: 'See all',
  linkUrl: '',
  cards: [0, 1, 2, 3, 4].map((n) => newCard(i * 5 + n)),
});

/** "IAT 410 Advanced Game Design" -> "IAT 410". */
const courseCode = (c: string) => c.split(' ').slice(0, 2).join(' ');

const topicRow = (title: string, topic: string): Row => ({
  title,
  linkLabel: 'See all',
  linkUrl: SHOWCASE,
  cards: PROJECTS.filter((p) => p.topic === topic).slice(0, 8).map((p) => ({
    image: p.image, title: p.title, meta: `${courseCode(p.course)} · ${p.term}`, tag: '', url: p.url,
  })),
});

/** Card widths (px) per size; posters are narrower so a similar number fit. */
const WIDTH: Record<Props['cardSize'], number> = { s: 220, m: 280, l: 360 };
const RATIO: Record<Props['aspect'], number> = { '16:9': 9 / 16, '4:3': 3 / 4, '1:1': 1, '2:3': 3 / 2 };

export default defineComponent<Props>({
  id: 'card-rows',
  name: 'Card Rows',
  category: 'Media',
  description: 'Stacked rows of cards, each scrolling sideways with edge arrows, like a streaming app.',
  icon: Rows3,
  commonDefaults: { hover: 'zoom' },
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    { key: 'intro', type: 'text', label: 'Intro', multiline: true },
    {
      key: 'rows', type: 'list', label: 'Rows', itemLabel: 'row', titleKey: 'title', min: 1, max: 8,
      newItem: newRow,
      itemFields: [
        { key: 'title', type: 'text', label: 'Row title' },
        { key: 'linkLabel', type: 'text', label: '"See all" text' },
        { key: 'linkUrl', type: 'url', label: '"See all" link', help: 'Optional. Shown beside the row title and as a tile at the end of the row.' },
        {
          key: 'cards', type: 'list', label: 'Cards', itemLabel: 'card', titleKey: 'title', thumbKey: 'image', min: 1, max: 24,
          newItem: newCard,
          itemFields: [
            { key: 'image', type: 'image', label: 'Image' },
            { key: 'title', type: 'text', label: 'Title' },
            { key: 'meta', type: 'text', label: 'Meta', help: 'A short line under the title: course, date, people.' },
            { key: 'tag', type: 'text', label: 'Tag', help: 'Optional label on the image, e.g. New, Video or Award.' },
            { key: 'url', type: 'url', label: 'Link', help: 'Optional. Makes the whole card a link.' },
          ],
        },
      ],
    },
    { key: 'layout', type: 'select', label: 'Text', tab: 'style', options: [{ value: 'below', label: 'Below' }, { value: 'overlay', label: 'On image' }] },
    { key: 'aspect', type: 'select', label: 'Image shape', tab: 'style', options: [{ value: '16:9', label: '16:9' }, { value: '4:3', label: '4:3' }, { value: '1:1', label: 'Square' }, { value: '2:3', label: 'Poster' }] },
    { key: 'cardSize', type: 'select', label: 'Card width', tab: 'style', options: [{ value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }] },
    { key: 'gap', type: 'select', label: 'Gap', tab: 'style', options: [{ value: '8', label: 'S' }, { value: '16', label: 'M' }, { value: '24', label: 'L' }] },
    { key: 'endCard', type: 'toggle', label: '"See all" tile', tab: 'style', help: 'Adds a tile at the end of each row that has a "See all" link.' },
    { key: 'arrows', type: 'select', label: 'Arrows', tab: 'behaviour', options: [{ value: 'edges', label: 'Edges' }, { value: 'header', label: 'Header' }, { value: 'none', label: 'None' }], help: 'Edges: tall arrows over the ends of the row, shown on hover. Header: round buttons beside the row title. Visitors can always swipe or scroll.' },
    { key: 'step', type: 'select', label: 'Arrow step', tab: 'behaviour', showIf: (p) => p.arrows !== 'none', options: [{ value: 'page', label: 'Page' }, { value: 'card', label: 'Card' }] },
    { key: 'pager', type: 'toggle', label: 'Page marks', tab: 'behaviour', help: 'Small segments beside each row title that show which page of the row is in view.' },
  ],
  defaults: {
    heading: 'Student work',
    intro: 'Projects from the SIAT showcase, by topic. Scroll a row or use the arrows to see more.',
    rows: [
      topicRow('Games', TOPICS.games),
      topicRow('Animation', TOPICS.anim),
      topicRow('Data visualization', TOPICS.data),
    ],
    layout: 'below',
    aspect: '16:9',
    cardSize: 'm',
    gap: '16',
    endCard: true,
    arrows: 'edges',
    step: 'page',
    pager: true,
  },
  presets: [
    { name: 'Rows', props: { layout: 'below', aspect: '16:9', cardSize: 'm', gap: '16' } },
    { name: 'Streaming', props: { layout: 'overlay', aspect: '16:9', cardSize: 'm', gap: '8' }, common: { theme: 'charcoal', radius: 'sm', shadow: 'none' } },
    { name: 'Posters', props: { layout: 'overlay', aspect: '2:3', cardSize: 's', gap: '16' }, common: { radius: 'md' } },
  ],
  runtime: (p) => (p.arrows !== 'none' || p.pager ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const gap = parseInt(p.gap, 10) || 16;
    const w = WIDTH[p.cardSize] ?? 280;
    const overlay = p.layout === 'overlay';
    const imgH = Math.round(w * (RATIO[p.aspect] ?? 0.5625));
    const line = t.dark ? '#ffffff' : t.heading;
    const padded = t.bg !== 'transparent';
    const H = p.heading ? { row: 'h3', card: 'h4' } as const : { row: 'h2', card: 'h3' } as const;

    const roundBtn: CSSProperties = sx.buttonReset({
      display: 'none', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px',
      borderRadius: '50%', border: `2px solid ${line}`, color: line, fontSize: '17px', lineHeight: 1,
      fontFamily: t.font, transition: 'opacity .2s ease',
    });
    // Tall translucent bars over the row ends; height is re-measured by the runtime.
    const edgeBtn = (side: 'left' | 'right'): CSSProperties => sx.buttonReset({
      display: 'none', position: 'absolute', top: '6px', [side]: 0, zIndex: 2, width: '52px', height: `${imgH}px`,
      alignItems: 'center', justifyContent: 'center',
      background: side === 'left'
        ? 'linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.35) 70%, rgba(0,0,0,0))'
        : 'linear-gradient(270deg, rgba(0,0,0,.82), rgba(0,0,0,.35) 70%, rgba(0,0,0,0))',
      color: '#ffffff', fontSize: '44px', lineHeight: 1, fontFamily: 'Arial, sans-serif', fontWeight: 400, textShadow: '0 1px 6px rgba(0,0,0,.5)',
      borderRadius: side === 'left' ? `${t.radius}px 0 0 ${t.radius}px` : `0 ${t.radius}px ${t.radius}px 0`,
      opacity: 0, transition: 'opacity .25s ease',
    } as CSSProperties);

    const cardBase = (link: boolean): CSSProperties => ({
      flex: `0 0 ${w}px`, maxWidth: '78%', scrollSnapAlign: 'start', display: 'block', margin: 0, padding: 0,
      boxSizing: 'border-box', position: 'relative', textDecoration: 'none', color: t.text,
      borderRadius: `${t.radius}px`, overflow: overlay ? 'hidden' : 'visible', cursor: link ? 'pointer' : 'default',
    });

    const tagStyle = (onImage: boolean): CSSProperties => sx.eyebrow({
      display: 'inline-block', background: t.accent, color: t.onAccent, fontSize: '11px', letterSpacing: '.1em',
      padding: '4px 8px', borderRadius: `${t.radiusSm}px`,
      ...(onImage ? { position: 'absolute', top: '10px', left: '10px', zIndex: 1 } : {}),
    });

    return (
      <div {...ctx.root('card-rows', { padding: padded ? '32px' : 0 })} data-gap={String(gap)} data-step={p.step}>
        {(p.heading || p.intro) && (
          <div style={{ margin: '0 0 28px 0', padding: 0, maxWidth: '760px' }}>
            {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(32, { margin: p.intro ? '0 0 8px 0' : 0 })}>{p.heading}</h2>}
            {p.intro && <p {...ctx.edit('intro', 'text')} style={sx.text({ color: t.muted, margin: 0 })}>{p.intro}</p>}
          </div>
        )}

        {p.rows.map((row, r) => {
          const trackId = `${ctx.id}-row${r}`;
          const RowTag = H.row;
          const CardTag = H.card;
          const end = p.endCard && !!row.linkUrl;
          return (
            <div key={row._id ?? r} className="sfcr-row" role="group" aria-label={row.title || `Row ${r + 1}`} {...ctx.item('rows', r)}
              style={{ margin: r === p.rows.length - 1 ? 0 : '0 0 36px 0', padding: 0, position: 'relative' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 18px', margin: '0 0 12px 0', padding: 0 }}>
                {row.title && <RowTag {...ctx.edit(`rows.${r}.title`, 'text')} style={sx.heading(22, { margin: 0 })}>{row.title}</RowTag>}
                {row.linkUrl && row.linkLabel && (
                  <a href={row.linkUrl} {...ctx.edit(`rows.${r}.linkLabel`, 'text')}
                    style={sx.link({ fontFamily: t.font, fontSize: '14px', fontWeight: 700, letterSpacing: '.04em', textDecoration: 'none', color: t.dark ? '#ffffff' : t.link })}>
                    {row.linkLabel}&nbsp;&rsaquo;
                  </a>
                )}
                <div style={{ flex: '1 1 0px', minWidth: 0, margin: 0, padding: 0 }} />
                {p.pager && <div className="sfcr-pager" aria-hidden="true" style={{ display: 'none', gap: '3px', margin: 0, padding: 0, alignSelf: 'center' }} />}
                {p.arrows === 'header' && (
                  <div style={{ display: 'flex', gap: '8px', margin: 0, padding: 0, alignSelf: 'center' }}>
                    <button type="button" className="sfcr-prev" aria-label={`Previous: ${row.title}`} aria-controls={trackId} style={roundBtn}>&larr;</button>
                    <button type="button" className="sfcr-next" aria-label={`Next: ${row.title}`} aria-controls={trackId} style={roundBtn}>&rarr;</button>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative', margin: 0, padding: 0 }}>
                {p.arrows === 'edges' && <button type="button" className="sfcr-prev sfcr-edge" aria-label={`Previous: ${row.title}`} aria-controls={trackId} style={edgeBtn('left')}>&lsaquo;</button>}
                <div id={trackId} className="sfcr-track" role="region" aria-label={row.title || `Row ${r + 1}`} tabIndex={0}
                  style={{
                    display: 'flex', gap: `${gap}px`, margin: 0, padding: '6px 0 14px 0', boxSizing: 'border-box',
                    position: 'relative', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch', scrollBehavior: 'auto',
                  } as CSSProperties}>
                  {row.cards.map((c, i) => {
                    const link = !!c.url;
                    const Tag = link ? 'a' : 'div';
                    const path = `rows.${r}.cards.${i}`;
                    return (
                      <Tag key={c._id ?? i} className="sfcr-card" {...(link ? { href: c.url } : {})} {...ctx.item(`rows.${r}.cards`, i)} {...ctx.reveal()} {...ctx.hover()}
                        style={cardBase(link)}>
                        <div style={sx.ratio(p.aspect, { borderRadius: `${t.radius}px`, background: t.surfaceAlt })}>
                          <img src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`${path}.image`, 'image')} style={sx.imgFill('cover', c.image.pos)} />
                          {c.tag && <span {...ctx.edit(`${path}.tag`, 'text')} style={tagStyle(true)}>{c.tag}</span>}
                          {overlay && (
                            <div style={{
                              position: 'absolute', left: 0, right: 0, bottom: 0, margin: 0, padding: '48px 14px 12px 14px',
                              background: 'linear-gradient(0deg, rgba(0,0,0,.86) 0%, rgba(0,0,0,.5) 55%, rgba(0,0,0,0) 100%)',
                            }}>
                              <CardTag {...ctx.edit(`${path}.title`, 'text')} style={sx.heading(p.cardSize === 's' ? 17 : 19, { color: '#ffffff', margin: 0 })}>{c.title}</CardTag>
                              {c.meta && <div {...ctx.edit(`${path}.meta`, 'text')} style={sx.small({ color: 'rgba(255,255,255,.82)', fontSize: '13px', margin: '3px 0 0 0' })}>{c.meta}</div>}
                            </div>
                          )}
                        </div>
                        {!overlay && (
                          <div style={{ margin: 0, padding: '10px 2px 0 2px' }}>
                            <CardTag {...ctx.edit(`${path}.title`, 'text')} style={sx.heading(p.cardSize === 's' ? 17 : 19, { margin: 0 })}>{c.title}</CardTag>
                            {c.meta && <div {...ctx.edit(`${path}.meta`, 'text')} style={sx.small({ fontSize: '13px', margin: '3px 0 0 0' })}>{c.meta}</div>}
                          </div>
                        )}
                      </Tag>
                    );
                  })}
                  {end && (
                    <a href={row.linkUrl} className="sfcr-card" {...ctx.hover()}
                      style={{ ...cardBase(true), flex: `0 0 ${Math.round(w * 0.62)}px` }}>
                      <div style={sx.ratio(p.aspect, { borderRadius: `${t.radius}px`, background: t.dark ? 'rgba(255,255,255,.1)' : t.accent })}>
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0, padding: '12px', textAlign: 'center',
                          color: t.dark ? '#ffffff' : t.onAccent, fontFamily: t.font,
                        }}>
                          <span aria-hidden="true" style={{ display: 'block', fontSize: '34px', lineHeight: 1, fontWeight: 300 }}>&rarr;</span>
                          <span style={{ display: 'block', fontSize: '15px', lineHeight: 1.25, fontWeight: 700 }}>
                            {row.linkLabel || 'See all'}<span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>: {row.title}</span>
                          </span>
                        </div>
                      </div>
                    </a>
                  )}
                </div>
                {p.arrows === 'edges' && <button type="button" className="sfcr-next sfcr-edge" aria-label={`Next: ${row.title}`} aria-controls={trackId} style={edgeBtn('right')}>&rsaquo;</button>}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
});
