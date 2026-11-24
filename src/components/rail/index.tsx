import type { CSSProperties } from 'react';
import { GalleryHorizontalEnd } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

/*
 * Rail: a horizontal row of cards (people or stories) that scrolls sideways.
 * Native overflow + scroll-snap means it swipes and scrolls without JS; the runtime
 * adds prev/next buttons, a progress bar and arrow keys (all hidden in the markup).
 */

interface Card { _id?: string; image: ImageValue; tag: string; title: string; role: string; text: string; url: string }
interface Props {
  heading: string;
  intro: string;
  linkLabel: string;
  linkUrl: string;
  items: Card[];
  variant: 'people' | 'story';
  cardStyle: 'plain' | 'boxed';
  cardSize: 's' | 'm' | 'l';
  aspect: string;
  gap: string;
  arrows: boolean;
  progress: boolean;
}

const newCard = (i: number): Card => ({
  image: placeholderImage(i + 1, '3:4'),
  tag: ['Video', 'Feature', 'Podcast', 'News', 'Event'][i % 5],
  title: `Name or title ${i + 1}`,
  role: 'Program, year',
  text: 'One short line about what they make, study or found.',
  url: '',
});

const WIDTH = { s: 220, m: 280, l: 340 };

export default defineComponent<Props>({
  id: 'rail',
  name: 'Rail / Scroller',
  category: 'Media',
  description: 'A sideways-scrolling row of people or story cards with arrows and a progress bar.',
  icon: GalleryHorizontalEnd,
  commonDefaults: { hover: 'zoom' },
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    { key: 'intro', type: 'text', label: 'Intro', multiline: true },
    { key: 'linkLabel', type: 'text', label: '"See all" text' },
    { key: 'linkUrl', type: 'url', label: '"See all" link', help: 'Optional link shown next to the heading.' },
    {
      key: 'items', type: 'list', label: 'Cards', itemLabel: 'card', titleKey: 'title', thumbKey: 'image', min: 1, max: 20,
      newItem: newCard,
      itemFields: [
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'title', type: 'text', label: 'Name / title' },
        { key: 'role', type: 'text', label: 'Role / date', help: 'People: program and year. Stories: a date or byline.' },
        { key: 'text', type: 'text', label: 'Quote / text', multiline: true, help: 'People cards show this as a one-line quote.' },
        { key: 'tag', type: 'text', label: 'Tag', help: 'Story cards only, e.g. Video, Feature, Podcast, News or Event.' },
        { key: 'url', type: 'url', label: 'Link', help: 'Optional. Makes the whole card a link.' },
      ],
    },
    { key: 'variant', type: 'select', label: 'Card type', tab: 'style', options: [{ value: 'people', label: 'People' }, { value: 'story', label: 'Story' }] },
    { key: 'cardStyle', type: 'select', label: 'Card look', tab: 'style', options: [{ value: 'plain', label: 'Plain' }, { value: 'boxed', label: 'Boxed' }] },
    { key: 'cardSize', type: 'select', label: 'Card width', tab: 'style', options: [{ value: 's', label: 'S' }, { value: 'm', label: 'M' }, { value: 'l', label: 'L' }] },
    { key: 'aspect', type: 'select', label: 'Image shape', tab: 'style', showIf: (p) => p.variant === 'story', options: [{ value: '16:9', label: '16:9' }, { value: '4:3', label: '4:3' }, { value: '1:1', label: 'Square' }] },
    { key: 'gap', type: 'select', label: 'Gap', tab: 'style', options: [{ value: '12', label: 'S' }, { value: '20', label: 'M' }, { value: '28', label: 'L' }] },
    { key: 'arrows', type: 'toggle', label: 'Arrow buttons', tab: 'behaviour', help: 'Previous/next buttons beside the heading. Visitors can always swipe or scroll.' },
    { key: 'progress', type: 'toggle', label: 'Progress bar', tab: 'behaviour', help: 'A thin bar under the cards that shows how far along the row you are.' },
  ],
  defaults: {
    heading: 'Meet our community',
    intro: '',
    linkLabel: 'See all',
    linkUrl: '',
    items: [newCard(0), newCard(1), newCard(2), newCard(3), newCard(4), newCard(5)],
    variant: 'people',
    cardStyle: 'plain',
    cardSize: 'm',
    aspect: '16:9',
    gap: '20',
    arrows: true,
    progress: true,
  },
  presets: [
    { name: 'People', props: { variant: 'people', cardStyle: 'plain', cardSize: 'm' } },
    { name: 'Stories', props: { variant: 'story', cardStyle: 'boxed', cardSize: 'l', aspect: '16:9' }, common: { shadow: 'sm' } },
    { name: 'Dark stories', props: { variant: 'story', cardStyle: 'boxed', cardSize: 'l', aspect: '4:3' }, common: { theme: 'charcoal', shadow: 'none' } },
  ],
  runtime: (p) => (p.arrows || p.progress ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const gap = parseInt(p.gap, 10) || 20;
    const w = WIDTH[p.cardSize] ?? 280;
    const people = p.variant === 'people';
    const boxed = p.cardStyle === 'boxed';
    const trackId = `${ctx.id}-rail`;
    const line = t.dark ? '#ffffff' : t.heading;
    const pad = boxed ? '16px 18px 20px 18px' : '14px 0 0 0';

    const btn: CSSProperties = sx.buttonReset({
      display: 'none', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px',
      borderRadius: '50%', border: `2px solid ${line}`, color: line, fontSize: '18px', lineHeight: 1,
      fontFamily: t.font, transition: 'opacity .2s ease, background-color .2s ease',
    });

    return (
      <div {...ctx.root('rail', { padding: t.bg === 'transparent' ? 0 : '32px' })} data-gap={String(gap)}>
        {(p.heading || p.intro || p.linkUrl || p.arrows) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', margin: '0 0 20px 0', padding: 0 }}>
            <div style={{ flex: '1 1 320px', minWidth: 0, margin: 0, padding: 0 }}>
              {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(30, { margin: p.intro ? '0 0 8px 0' : 0 })}>{p.heading}</h2>}
              {p.intro && <p {...ctx.edit('intro', 'text')} style={sx.text({ color: t.muted, maxWidth: '640px' })}>{p.intro}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, padding: 0 }}>
              {p.linkUrl && p.linkLabel && (
                <a href={p.linkUrl} {...ctx.edit('linkLabel', 'text')} style={sx.link({ fontFamily: t.font, fontSize: '15px', fontWeight: 700, margin: '0 8px 0 0' })}>{p.linkLabel} &rarr;</a>
              )}
              {p.arrows && (
                <>
                  <button type="button" className="sfurl-prev" aria-label="Previous" aria-controls={trackId} style={btn}>&larr;</button>
                  <button type="button" className="sfurl-next" aria-label="Next" aria-controls={trackId} style={btn}>&rarr;</button>
                </>
              )}
            </div>
          </div>
        )}

        <div id={trackId} className="sfurl-track" role="region" aria-label={p.heading || 'Cards'} tabIndex={0}
          style={{
            display: 'flex', gap: `${gap}px`, margin: 0, padding: '4px 2px 12px 2px', boxSizing: 'border-box',
            position: 'relative', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch', scrollPadding: '0 2px',
          } as CSSProperties}>
          {p.items.map((c, i) => {
            const link = !!c.url;
            const Tag = link ? 'a' : 'div';
            return (
              <Tag key={c._id ?? i} className="sfurl-card" {...(link ? { href: c.url } : {})} {...ctx.item('items', i)} {...ctx.reveal()} {...ctx.hover()}
                style={{
                  flex: `0 0 ${w}px`, maxWidth: '85%', scrollSnapAlign: 'start', display: 'block', margin: 0, padding: 0,
                  boxSizing: 'border-box', overflow: 'hidden', textDecoration: 'none', color: t.text,
                  background: boxed ? (t.dark ? t.surface : '#ffffff') : 'transparent',
                  borderRadius: boxed ? `${t.radius}px` : 0, boxShadow: boxed ? t.shadow : 'none',
                }}>
                <div style={sx.ratio(people ? '3:4' : p.aspect, { borderRadius: boxed ? 0 : `${t.radius}px`, background: t.surfaceAlt })}>
                  <img src={c.image.src} alt={c.image.alt} loading="lazy" {...ctx.edit(`items.${i}.image`, 'image')} style={sx.imgFill('cover', c.image.pos)} />
                </div>
                <div style={{ margin: 0, padding: pad, boxSizing: 'border-box' }}>
                  {!people && c.tag && (
                    <span {...ctx.edit(`items.${i}.tag`, 'text')} style={sx.eyebrow({ display: 'inline-block', background: t.accent, color: t.onAccent, fontSize: '11px', padding: '4px 8px', borderRadius: `${t.radiusSm}px`, margin: '0 0 10px 0' })}>{c.tag}</span>
                  )}
                  <h3 {...ctx.edit(`items.${i}.title`, 'text')} style={sx.heading(people ? 20 : 21, { margin: 0 })}>{c.title}</h3>
                  {c.role && <div {...ctx.edit(`items.${i}.role`, 'text')} style={sx.small({ margin: '4px 0 0 0' })}>{c.role}</div>}
                  {c.text && (
                    <p {...ctx.edit(`items.${i}.text`, 'text')} style={sx.text(people
                      ? { fontSize: '16px', lineHeight: 1.45, margin: '10px 0 0 0', paddingLeft: '12px', borderLeft: `3px solid ${t.accent}` }
                      : { fontSize: '15px', lineHeight: 1.5, color: t.muted, margin: '8px 0 0 0' })}>
                      {people ? <>&ldquo;{c.text}&rdquo;</> : c.text}
                    </p>
                  )}
                  {link && !people && <span style={sx.small({ display: 'inline-block', color: t.link, fontWeight: 700, margin: '12px 0 0 0' })}>Read more &rarr;</span>}
                </div>
              </Tag>
            );
          })}
        </div>

        {p.progress && (
          <div className="sfurl-bar" aria-hidden="true" style={{ display: 'none', height: '3px', margin: '12px 0 0 0', padding: 0, background: t.dark ? 'rgba(255,255,255,.18)' : t.border, borderRadius: '3px', overflow: 'hidden' }}>
            <div className="sfurl-fill" style={{ height: '100%', width: '25%', margin: 0, padding: 0, background: t.accent, borderRadius: '3px', transition: 'margin-left .15s linear, width .15s linear' }} />
          </div>
        )}
      </div>
    );
  },
});
