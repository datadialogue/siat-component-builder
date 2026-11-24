import type { CSSProperties } from 'react';
import { Signpost } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

/*
 * Path Finder: a big sentence with a choice ("I want to [select]") or a row of chips.
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
    const cardBg = t.dark ? t.surface : t.bg === 'transparent' ? t.surfaceAlt : '#ffffff';

    const chip: CSSProperties = sx.buttonReset({
      display: 'inline-block', padding: '10px 18px', borderRadius: '999px', border: '2px solid transparent',
      fontFamily: t.font, fontSize: '16px', fontWeight: 700, lineHeight: 1.2,
      transition: 'background-color .2s ease, color .2s ease, border-color .2s ease',
    });

    return (
      <div {...ctx.root('path-finder', { padding: t.bg === 'transparent' ? 0 : '32px' })}
        data-on={chipOn} data-off={chipOff} data-anim={p.anim} data-mode={p.mode}>
        {p.eyebrow && <div {...ctx.edit('eyebrow', 'text')} style={sx.eyebrow({ margin: '0 0 14px 0', color: t.dark ? t.heading : t.accent })}>{p.eyebrow}</div>}

        {/* Controls: hidden until the runtime runs (the stacked panels below cover no-JS). */}
        <div className="sfupf-ctrl" style={{ display: 'none', margin: '0 0 28px 0', padding: 0 }}>
          {p.mode === 'select' ? (
            <div style={sx.heading(fs, { fontSize: fsc, fontWeight: 800, lineHeight: 1.2 })}>
              <label htmlFor={sid} {...ctx.edit('lead', 'text')} style={{ margin: '0 0.25em 0 0', padding: 0, font: 'inherit', color: 'inherit', display: 'inline' }}>{p.lead}</label>
              <span style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', margin: 0, padding: 0, verticalAlign: 'baseline' }}>
                <select id={sid} className="sfupf-select"
                  style={sx.buttonReset({
                    fontFamily: t.font, fontSize: '1em', fontWeight: 800, fontStretch: '83%', lineHeight: 1.2, color: line,
                    padding: '0 1.1em 2px 0', borderBottom: `0.08em solid ${line}`, borderRadius: 0, maxWidth: '100%',
                    textOverflow: 'ellipsis', backgroundColor: 'transparent',
                  })}>
                  {p.options.map((o, i) => <option key={o._id ?? i} value={String(i)} style={{ color: '#000000', background: '#ffffff' }}>{o.label}</option>)}
                </select>
                <span aria-hidden="true" style={{ position: 'absolute', right: '0.1em', top: '50%', margin: '-0.32em 0 0 0', padding: 0, fontSize: '0.5em', lineHeight: 1, color: line, pointerEvents: 'none' }}>&#9660;</span>
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
