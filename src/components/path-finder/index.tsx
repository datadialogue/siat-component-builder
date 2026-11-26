import type { CSSProperties } from 'react';
import { Signpost } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import { SFU } from '../../theme/theme';
import runtime from './runtime.es5.js?raw';

/*
 * Path Finder: a big sentence with a choice ("I want to [dropdown]") or a row of chips.
 * The dropdown is a custom ARIA listbox (a native <select>'s open list can't be styled).
 * Each choice shows a result panel (image, title, text, tags, link).
 * Without JS every option renders as a stacked panel with its label as a heading;
 * the runtime shows the controls and keeps one panel visible.
 */

interface Option { _id?: string; label: string; title: string; text: string; tags: string; image: ImageValue; linkLabel: string; url: string }
interface Props {
  eyebrow: string;
  lead: string;
  after: string;
  options: Option[];
  mode: 'select' | 'chips';
  size: 'md' | 'lg' | 'xl';
  imageSide: 'left' | 'right' | 'none';
  anim: 'none' | 'fade' | 'rise';
}

const newOption = (i: number): Option => ({
  label: ['choice one', 'choice two', 'choice three'][i] ?? `choice ${i + 1}`,
  title: ['Path one', 'Path two', 'Path three'][i] ?? `Path ${i + 1}`,
  text: 'A sentence or two about where this choice leads and what you would study.',
  tags: ['Tag one, Tag two, Tag three', 'Tag one, Tag two', 'Tag one, Tag two'][i] ?? 'Tag one, Tag two',
  image: placeholderImage(i + 1, '4:3'),
  linkLabel: 'Explore this path',
  url: 'https://www.sfu.ca/siat.html',
});

const SIZES = { md: 28, lg: 40, xl: 56 } as const;

export default defineComponent<Props>({
  id: 'path-finder',
  name: 'Path Finder',
  category: 'Interactive',
  description: 'A sentence with a choice ("I want to…") that shows a matching program, career or page.',
  icon: Signpost,
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Label' },
    { key: 'lead', type: 'text', label: 'Sentence start', placeholder: 'I want to', help: 'Words before the choice. The choice finishes the sentence.' },
    { key: 'after', type: 'text', label: 'Sentence end', placeholder: '.', help: 'Optional words after the choice, e.g. "at SIAT."' },
    {
      key: 'options', type: 'list', label: 'Choices', itemLabel: 'choice', titleKey: 'label', thumbKey: 'image', min: 2, max: 10,
      newItem: newOption,
      itemFields: [
        { key: 'label', type: 'text', label: 'Choice', help: 'Shown in the dropdown or chip. Write it so it finishes the sentence.' },
        { key: 'title', type: 'text', label: 'Result title' },
        { key: 'text', type: 'text', label: 'Result text', multiline: true },
        { key: 'tags', type: 'text', label: 'Tags', help: 'Comma-separated, e.g. related programs or careers.' },
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'url', type: 'url', label: 'Link' },
        { key: 'linkLabel', type: 'text', label: 'Link text', showIf: (o) => !!o.url },
      ],
    },
    { key: 'mode', type: 'select', label: 'Choice style', tab: 'style', options: [{ value: 'select', label: 'Dropdown' }, { value: 'chips', label: 'Chips' }] },
    { key: 'size', type: 'select', label: 'Sentence size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'imageSide', type: 'select', label: 'Result image', tab: 'style', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'none', label: 'None' }] },
    { key: 'anim', type: 'select', label: 'Result change', tab: 'behaviour', options: [{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade' }, { value: 'rise', label: 'Rise' }], help: 'How the result appears when the choice changes. Skipped for reduced motion.' },
  ],
  defaults: {
    eyebrow: 'Find your path',
    lead: 'I want to',
    after: '',
    options: [newOption(0), newOption(1), newOption(2)],
    mode: 'select',
    size: 'lg',
    imageSide: 'left',
    anim: 'rise',
  },
  presets: [
    { name: 'Sentence', props: { mode: 'select', size: 'lg', imageSide: 'left' } },
    { name: 'Chips', props: { mode: 'chips', size: 'md', imageSide: 'right' } },
    { name: 'Red', props: { mode: 'select', size: 'xl', imageSide: 'left' }, common: { theme: 'red' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const fs = SIZES[p.size] ?? 40;
    // Scales with the viewport so the dropdown fits on phones (no media queries).
    const fsc = `clamp(${Math.min(fs, 24)}px, ${Math.round(fs / 9.6 * 10) / 10}vw, ${fs}px)`;
    const sid = `sfub-${ctx.id}-pf`;
    const accent = t.accent;
    const line = t.dark ? '#ffffff' : accent;
    const chipOn = `background:${accent};color:${t.onAccent};border-color:${accent};`;
    const chipOff = `background:transparent;color:${t.heading};border-color:${t.dark ? 'rgba(255,255,255,.5)' : t.border};`;
    // The open list is always a white card, so it needs an accent that reads on white.
    const pop = t.dark ? SFU.red : accent;
    const cardBg = t.dark ? t.surface : t.bg === 'transparent' ? t.surfaceAlt : '#ffffff';

    const chip: CSSProperties = sx.buttonReset({
      display: 'inline-block', padding: '10px 18px', borderRadius: '999px', border: '2px solid transparent',
      fontFamily: t.font, fontSize: '16px', fontWeight: 700, lineHeight: 1.2,
      transition: 'background-color .2s ease, color .2s ease, border-color .2s ease',
    });

    return (
      <div {...ctx.root('path-finder', { padding: t.bg === 'transparent' ? 0 : '32px' })}
        data-on={chipOn} data-off={chipOff} data-anim={p.anim} data-mode={p.mode}
        data-opt-act={`background:#f5f5f5;box-shadow:inset 3px 0 0 ${pop};`} data-opt-idle="background:transparent;box-shadow:inset 3px 0 0 transparent;">
        {p.eyebrow && <div {...ctx.edit('eyebrow', 'text')} style={sx.eyebrow({ margin: '0 0 14px 0', color: t.dark ? t.heading : t.accent })}>{p.eyebrow}</div>}

        {/* Controls: hidden until the runtime runs (the stacked panels below cover no-JS). */}
        <div className="sfupf-ctrl" style={{ display: 'none', margin: '0 0 28px 0', padding: 0 }}>
          {p.mode === 'select' ? (
            <div style={sx.heading(fs, { fontSize: fsc, fontWeight: 800, lineHeight: 1.2 })}>
              <span id={`${sid}-lead`} {...ctx.edit('lead', 'text')} style={{ margin: '0 0.25em 0 0', padding: 0 }}>{p.lead}</span>
              {/* Custom listbox: a native <select>'s open list can't be styled inline. */}
              <span className="sfupf-dd" style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', margin: 0, padding: 0, verticalAlign: 'baseline' }}>
                <button type="button" id={`${sid}-btn`} className="sfupf-btn" aria-haspopup="listbox" aria-expanded="false"
                  aria-controls={`${sid}-list`} aria-labelledby={`${sid}-lead ${sid}-btn`}
                  style={sx.buttonReset({
                    display: 'inline-block', maxWidth: '100%', fontFamily: t.font, fontSize: '1em', fontWeight: 800, fontStretch: '83%',
                    lineHeight: 1.2, color: line, textAlign: 'left', whiteSpace: 'normal', padding: '0 0 .04em 0',
                    borderBottom: `0.08em solid ${line}`, transition: 'opacity .2s ease',
                  })}>
                  <span className="sfupf-val" style={{ margin: 0, padding: 0 }}>{p.options[0]?.label}</span>
                  <span aria-hidden="true" className="sfupf-chev"
                    style={{ display: 'inline-block', width: '.3em', height: '.3em', margin: '0 .12em .2em .38em', padding: 0, borderRight: `.075em solid ${line}`, borderBottom: `.075em solid ${line}`, transform: 'rotate(45deg)', transition: 'transform .25s ease, margin .25s ease', verticalAlign: 'middle' }} />
                </button>
                <span id={`${sid}-list`} className="sfupf-list" role="listbox" tabIndex={-1} aria-labelledby={`${sid}-lead`}
                  style={{
                    display: 'none', position: 'absolute', top: 'calc(100% + 12px)', left: 0, zIndex: 40, boxSizing: 'border-box',
                    width: 'max-content', minWidth: 'max(100%, 260px)', maxWidth: 'min(90vw, 440px)', maxHeight: '60vh', overflowY: 'auto',
                    margin: 0, padding: '8px', background: '#ffffff', borderRadius: `${Math.max(t.radius, 6)}px`,
                    boxShadow: '0 18px 48px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.08)', border: '1px solid rgba(0,0,0,.06)',
                    textAlign: 'left', fontFamily: t.font, fontSize: '16px', fontWeight: 400, fontStretch: '100%', lineHeight: 1.3,
                    letterSpacing: 'normal', color: '#1a1a1a', outline: 'none', transformOrigin: '0 0',
                  }}>
                  {p.options.map((o, i) => (
                    <span key={o._id ?? i} id={`${sid}-o${i}`} role="option" className="sfupf-opt" data-i={String(i)} aria-selected={i === 0 ? 'true' : 'false'}
                      style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: 0, padding: '10px 12px 10px 14px', borderRadius: `${t.radiusSm}px`, cursor: 'pointer', boxShadow: 'inset 3px 0 0 transparent', transition: 'background-color .15s ease, box-shadow .15s ease' }}>
                      <span style={{ display: 'block', flex: '1 1 auto', minWidth: 0, margin: 0, padding: 0 }}>
                        <span className="sfupf-ol" style={{ display: 'block', margin: 0, padding: 0, fontSize: '19px', fontWeight: 800, fontStretch: '83%', lineHeight: 1.2, color: '#1a1a1a' }}>{o.label}</span>
                        {o.title && <span style={{ display: 'block', margin: '2px 0 0 0', padding: 0, fontSize: '13px', lineHeight: 1.3, color: '#6d6f71' }}>{o.title}</span>}
                      </span>
                      <span aria-hidden="true" className="sfupf-tick"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 22px', width: '22px', height: '22px', margin: 0, padding: 0, borderRadius: '50%', background: pop, color: '#ffffff', fontSize: '12px', fontWeight: 700, lineHeight: 1, opacity: i === 0 ? 1 : 0, transition: 'opacity .15s ease' }}>&#10003;</span>
                    </span>
                  ))}
                </span>
              </span>
              {p.after && <span {...ctx.edit('after', 'text')} style={{ margin: '0 0 0 0.2em', padding: 0 }}>{p.after}</span>}
            </div>
          ) : (
            <div role="group" aria-labelledby={`${sid}-lead`} style={{ margin: 0, padding: 0 }}>
              <div id={`${sid}-lead`} {...ctx.edit('lead', 'text')} style={sx.heading(fs, { fontSize: fsc, margin: '0 0 16px 0' })}>
                {p.lead}{p.after ? ` ${p.after}` : ''}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: 0, padding: 0 }}>
                {p.options.map((o, i) => (
                  <button key={o._id ?? i} type="button" className="sfupf-chip" aria-pressed={i === 0 ? 'true' : 'false'}
                    {...ctx.edit(`options.${i}.label`, 'text')}
                    style={{ ...chip, ...(i === 0 ? { background: accent, color: t.onAccent, borderColor: accent } : { background: 'transparent', color: t.heading, borderColor: t.dark ? 'rgba(255,255,255,.5)' : t.border }) }}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sfupf-out" aria-live="polite" style={{ margin: 0, padding: 0 }}>
          {p.options.map((o, i) => {
            const tags = (o.tags || '').split(',').map((s) => s.trim()).filter(Boolean);
            const img = p.imageSide !== 'none' && !!o.image?.src;
            return (
              <div key={o._id ?? i} className="sfupf-panel" {...ctx.item('options', i)} {...ctx.reveal()}
                style={{ margin: i ? '24px 0 0 0' : 0, padding: 0, boxSizing: 'border-box' }}>
                <h3 className="sfupf-fb" style={sx.heading(22, { margin: '0 0 12px 0', color: t.muted })}>
                  {p.lead} {o.label}{p.after ? ` ${p.after}` : ''}
                </h3>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', flexDirection: p.imageSide === 'right' ? 'row-reverse' : 'row', alignItems: 'stretch',
                  margin: 0, padding: 0, background: cardBg, borderRadius: `${t.radius}px`, overflow: 'hidden', boxShadow: t.shadow,
                }}>
                  {img && (
                    <div style={{ flex: '1 1 260px', minWidth: 0, margin: 0, padding: 0, position: 'relative', minHeight: '220px' }}>
                      <img src={o.image.src} alt={o.image.alt} loading="lazy" {...ctx.edit(`options.${i}.image`, 'image')} style={sx.imgFill('cover', o.image.pos)} />
                    </div>
                  )}
                  <div style={{ flex: '1 1 300px', minWidth: 0, margin: 0, padding: '28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 {...ctx.edit(`options.${i}.title`, 'text')} style={sx.heading(28, { margin: '0 0 10px 0' })}>{o.title}</h3>
                    {o.text && <p {...ctx.edit(`options.${i}.text`, 'text')} style={sx.text({ margin: '0 0 16px 0' })}>{o.text}</p>}
                    {tags.length > 0 && (
                      <div {...ctx.edit(`options.${i}.tags`, 'text')} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '0 0 18px 0', padding: 0 }}>
                        {tags.map((tg, k) => (
                          <span key={k} style={sx.small({ display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: t.dark ? 'rgba(255,255,255,.14)' : t.surfaceAlt === cardBg ? '#ffffff' : t.surfaceAlt, color: t.dark ? '#ffffff' : t.heading, fontSize: '13px', fontWeight: 700 })}>{tg}</span>
                        ))}
                      </div>
                    )}
                    {o.url && o.linkLabel && (
                      <div style={{ margin: 0, padding: 0 }}>
                        <a href={o.url} {...ctx.edit(`options.${i}.linkLabel`, 'text')} {...ctx.hover()} style={sx.button(t.dark ? 'light' : 'primary')}>{o.linkLabel} &rarr;</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
