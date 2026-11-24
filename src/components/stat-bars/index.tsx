import type { CSSProperties } from 'react';
import { ChartBarBig } from 'lucide-react';
import { defineComponent } from '../../lib/types';
import runtime from './runtime.es5.js?raw';

/*
 * Stat Bars: percentages shown as bars or rings. The markup ships the final state
 * (fill width / ring angle and the number); the runtime replays it from 0 on scroll.
 */

interface Item { _id?: string; value: number; suffix: string; label: string; note: string }
interface Props {
  heading: string;
  intro: string;
  question: string;
  items: Item[];
  style: 'bars' | 'rings';
  columns: string;
  thickness: 'thin' | 'thick';
  animate: boolean;
  duration: number;
}

const newItem = (i: number): Item => ([
  { value: 84, suffix: '%', label: 'work in design, technology or media within a year', note: '' },
  { value: 62, suffix: '%', label: 'complete at least one co-op work term', note: '' },
  { value: 38, suffix: '%', label: 'take part in faculty research before graduating', note: '' },
][i] ?? { value: 50, suffix: '%', label: `Describe what this number means ${i + 1}`, note: '' });

const clamp = (v: number) => Math.max(0, Math.min(100, Number(v) || 0));

export default defineComponent<Props>({
  id: 'stat-bars',
  name: 'Stat Bars',
  category: 'Content',
  description: 'Percentages as bars or rings that fill when they scroll into view.',
  icon: ChartBarBig,
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    { key: 'intro', type: 'text', label: 'Intro', multiline: true },
    { key: 'question', type: 'text', label: 'Side label', help: 'Optional short question shown to the left, e.g. "Where do graduates work?". Moves above on narrow screens.' },
    {
      key: 'items', type: 'list', label: 'Numbers', itemLabel: 'number', titleKey: 'label', min: 1, max: 8,
      newItem,
      itemFields: [
        { key: 'value', type: 'number', label: 'Value', min: 0, max: 100, step: 1, help: '0–100. Sets the bar length or ring.' },
        { key: 'suffix', type: 'text', label: 'After', placeholder: '%' },
        { key: 'label', type: 'text', label: 'Sentence', multiline: true },
        { key: 'note', type: 'text', label: 'Source / note' },
      ],
    },
    { key: 'style', type: 'select', label: 'Style', tab: 'style', options: [{ value: 'bars', label: 'Bars' }, { value: 'rings', label: 'Rings' }] },
    { key: 'columns', type: 'select', label: 'Columns', tab: 'style', showIf: (p) => p.style === 'rings', options: ['2', '3', '4'].map((v) => ({ value: v, label: v })) },
    { key: 'thickness', type: 'select', label: 'Thickness', tab: 'style', options: [{ value: 'thin', label: 'Thin' }, { value: 'thick', label: 'Thick' }] },
    { key: 'animate', type: 'toggle', label: 'Fill on scroll', tab: 'behaviour', help: 'Bars grow and numbers count up when scrolled into view. Shown instantly for reduced-motion visitors.' },
    { key: 'duration', type: 'number', label: 'Fill duration', tab: 'behaviour', min: 400, max: 4000, step: 100, unit: 'ms', showIf: (p) => p.animate },
  ],
  defaults: {
    heading: 'Where our graduates go',
    intro: '',
    question: '',
    items: [newItem(0), newItem(1), newItem(2)],
    style: 'bars',
    columns: '3',
    thickness: 'thick',
    animate: true,
    duration: 1400,
  },
  presets: [
    { name: 'Bars', props: { style: 'bars', thickness: 'thick' } },
    { name: 'Rings', props: { style: 'rings', columns: '3', thickness: 'thin' } },
    { name: 'Red band', props: { style: 'bars', thickness: 'thin' }, common: { theme: 'red' } },
  ],
  runtime: (p) => (p.animate ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const rings = p.style === 'rings';
    const thick = p.thickness === 'thick';
    const track = t.dark ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.09)';
    const numColor = t.accent;

    const num = (it: Item, i: number, size: number) => (
      <span style={sx.heading(size, { color: numColor, lineHeight: 1, whiteSpace: 'nowrap' })}>
        <span className="sfusb-num" {...ctx.edit(`items.${i}.value`)}>{clamp(it.value)}</span>{it.suffix}
      </span>
    );

    const bars = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', margin: 0, padding: 0 }}>
        {p.items.map((it, i) => {
          const v = clamp(it.value);
          return (
            <div key={it._id ?? i} className="sfusb-item" data-v={String(v)} {...ctx.item('items', i)} {...ctx.reveal()} style={{ margin: 0, padding: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: '14px', rowGap: '4px', margin: '0 0 10px 0', padding: 0 }}>
                {num(it, i, thick ? 44 : 36)}
                <span {...ctx.edit(`items.${i}.label`, 'text')} style={sx.text({ flex: '1 1 200px', fontSize: '17px', lineHeight: 1.4, color: t.text })}>{it.label}</span>
              </div>
              <div role="presentation" style={{ height: thick ? '14px' : '6px', margin: 0, padding: 0, background: track, borderRadius: `${Math.min(t.radiusSm, 7)}px`, overflow: 'hidden' }}>
                <div className="sfusb-fill" style={{ width: `${v}%`, height: '100%', margin: 0, padding: 0, background: numColor, borderRadius: `${Math.min(t.radiusSm, 7)}px` }} />
              </div>
              {it.note && <div {...ctx.edit(`items.${i}.note`, 'text')} style={sx.small({ margin: '8px 0 0 0' })}>{it.note}</div>}
            </div>
          );
        })}
      </div>
    );

    const ringW = thick ? 16 : 10;
    const ringGrid = (
      <div style={sx.grid(Number(p.columns) || 3, 170, 28)}>
        {p.items.map((it, i) => {
          const v = clamp(it.value);
          const mask = `radial-gradient(farthest-side, transparent calc(100% - ${ringW}px), #000 calc(100% - ${ringW - 1}px))`;
          const ring: CSSProperties = {
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0, padding: 0, borderRadius: '50%',
            background: `conic-gradient(${numColor} 0 ${v}%, ${track} ${v}% 100%)`,
            WebkitMask: mask, mask,
          } as CSSProperties;
          return (
            <div key={it._id ?? i} className="sfusb-item" data-v={String(v)} {...ctx.item('items', i)} {...ctx.reveal()} {...ctx.hover()}
              style={{ margin: 0, padding: '4px', boxSizing: 'border-box', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 16px auto', padding: 0 }}>
                <div className="sfusb-fill" data-c={numColor} data-t={track} style={ring} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', margin: 0, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {num(it, i, 36)}
                </div>
              </div>
              <div {...ctx.edit(`items.${i}.label`, 'text')} style={sx.text({ fontSize: '16px', lineHeight: 1.4, maxWidth: '260px', margin: '0 auto' })}>{it.label}</div>
              {it.note && <div {...ctx.edit(`items.${i}.note`, 'text')} style={sx.small({ margin: '6px auto 0 auto' })}>{it.note}</div>}
            </div>
          );
        })}
      </div>
    );

    return (
      <div {...ctx.root('stat-bars', { padding: t.bg === 'transparent' ? 0 : '36px 32px', borderRadius: t.bg === 'transparent' ? 0 : `${t.radius}px` })}
        data-mode={p.style} {...(p.animate ? { 'data-anim': '1', 'data-dur': String(p.duration) } : {})}>
        {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(32, { margin: p.intro ? '0 0 8px 0' : '0 0 28px 0' })}>{p.heading}</h2>}
        {p.intro && <p {...ctx.edit('intro', 'text')} style={sx.text({ color: t.muted, margin: '0 0 28px 0', maxWidth: '680px' })}>{p.intro}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 40px', margin: 0, padding: 0 }}>
          {p.question && (
            <div style={{ flex: '1 1 200px', margin: 0, padding: 0 }}>
              <h3 {...ctx.edit('question', 'text')} style={sx.heading(20, { margin: 0, color: t.heading })}>{p.question}</h3>
            </div>
          )}
          <div style={{ flex: '3 1 420px', minWidth: 0, margin: 0, padding: 0 }}>
            {rings ? ringGrid : bars}
          </div>
        </div>
      </div>
    );
  },
});
