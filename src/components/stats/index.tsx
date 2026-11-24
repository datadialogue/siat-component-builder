import type { CSSProperties } from 'react';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { defineComponent } from '../../lib/types';
import runtime from './runtime.es5.js?raw';

interface Stat { _id?: string; value: string; prefix: string; suffix: string; label: string; text: string }
interface Props {
  heading: string;
  intro: string;
  stats: Stat[];
  columns: string;
  variant: 'plain' | 'cards' | 'band' | 'dividers';
  align: 'left' | 'center';
  size: 'md' | 'lg' | 'xl';
  countUp: boolean;
  countDuration: number;
}

const newStat = (i: number): Stat => ([
  { value: '1,200', prefix: '', suffix: '+', label: 'Students', text: 'Undergraduate and graduate' },
  { value: '60', prefix: '', suffix: '', label: 'Faculty members', text: 'Across design, media and technology' },
  { value: '25', prefix: '', suffix: '+', label: 'Research labs', text: '' },
  { value: '98', prefix: '', suffix: '%', label: 'Employed', text: 'Within a year of graduating' },
][i] ?? { value: '100', prefix: '', suffix: '', label: `Stat ${i + 1}`, text: '' });

const SIZES = { md: 36, lg: 52, xl: 68 };

export default defineComponent<Props>({
  id: 'stats',
  name: 'Stats / Count-up',
  category: 'Content',
  description: 'Big numbers that count up when they scroll into view.',
  icon: ChartNoAxesColumnIncreasing,
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    { key: 'intro', type: 'text', label: 'Intro', multiline: true },
    {
      key: 'stats', type: 'list', label: 'Numbers', itemLabel: 'number', titleKey: 'label', min: 1, max: 8,
      newItem: newStat,
      itemFields: [
        { key: 'value', type: 'text', label: 'Number', help: 'Digits with optional commas or decimals, e.g. 1,200 or 4.5.' },
        { key: 'prefix', type: 'text', label: 'Before', placeholder: '$' },
        { key: 'suffix', type: 'text', label: 'After', placeholder: '+ or %' },
        { key: 'label', type: 'text', label: 'Label' },
        { key: 'text', type: 'text', label: 'Small text' },
      ],
    },
    { key: 'columns', type: 'select', label: 'Columns', tab: 'style', options: ['2', '3', '4'].map((v) => ({ value: v, label: v })) },
    { key: 'variant', type: 'select', label: 'Style', tab: 'style', options: [{ value: 'plain', label: 'Plain' }, { value: 'cards', label: 'Cards' }, { value: 'band', label: 'Band' }, { value: 'dividers', label: 'Lines' }] },
    { key: 'align', type: 'select', label: 'Align', tab: 'style', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
    { key: 'size', type: 'select', label: 'Number size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'countUp', type: 'toggle', label: 'Count up', tab: 'behaviour', help: 'Numbers count from 0 when scrolled into view. Shown instantly for reduced-motion visitors.' },
    { key: 'countDuration', type: 'number', label: 'Count duration', tab: 'behaviour', min: 400, max: 4000, step: 100, unit: 'ms', showIf: (p) => p.countUp },
  ],
  defaults: {
    heading: 'SIAT by the numbers',
    intro: '',
    stats: [newStat(0), newStat(1), newStat(2), newStat(3)],
    columns: '4',
    variant: 'plain',
    align: 'center',
    size: 'lg',
    countUp: true,
    countDuration: 1600,
  },
  presets: [
    { name: 'Plain', props: { variant: 'plain' } },
    { name: 'Cards', props: { variant: 'cards' }, common: { theme: 'grey' } },
    { name: 'Red band', props: { variant: 'band' }, common: { theme: 'red' } },
    { name: 'Lines', props: { variant: 'dividers', align: 'left' } },
  ],
  runtime: (p) => (p.countUp ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const center = p.align === 'center';
    const numColor = t.accent === '#ffffff' ? '#ffffff' : t.accent;
    const cell: Record<Props['variant'], CSSProperties> = {
      plain: { padding: '8px 4px' },
      cards: { padding: '24px 20px', background: t.dark ? t.surface : '#ffffff', borderRadius: `${t.radius}px`, boxShadow: t.shadow },
      band: { padding: '8px 4px' },
      dividers: { padding: '4px 0 4px 20px', borderLeft: `3px solid ${numColor}` },
    };
    return (
      <div {...ctx.root('stats', { padding: p.variant === 'band' ? '40px 32px' : t.bg === 'transparent' ? 0 : '32px', borderRadius: p.variant === 'band' ? `${t.radius}px` : 0, textAlign: center ? 'center' : 'left' })}
        {...(p.countUp ? { 'data-dur': String(p.countDuration) } : {})}>
        {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(32, { margin: p.intro ? '0 0 8px 0' : '0 0 28px 0' })}>{p.heading}</h2>}
        {p.intro && <p {...ctx.edit('intro', 'text')} style={sx.text({ color: t.muted, margin: '0 0 28px 0', maxWidth: center ? 'none' : '640px' })}>{p.intro}</p>}
        <div style={sx.grid(Number(p.columns) || 4, 170, 24)}>
          {p.stats.map((s, i) => (
            <div key={s._id ?? i} {...ctx.item('stats', i)} {...ctx.reveal()} {...ctx.hover()} style={{ margin: 0, boxSizing: 'border-box', ...cell[p.variant] }}>
              <div style={sx.heading(SIZES[p.size], { color: numColor, lineHeight: 1, margin: '0 0 8px 0', whiteSpace: 'nowrap' })}>
                {s.prefix}<span className="sfus-num" {...ctx.edit(`stats.${i}.value`, 'text')}>{s.value}</span>{s.suffix}
              </div>
              <div {...ctx.edit(`stats.${i}.label`, 'text')} style={sx.text({ fontWeight: 700, color: t.heading, fontSize: '17px', lineHeight: 1.3 })}>{s.label}</div>
              {s.text && <div {...ctx.edit(`stats.${i}.text`, 'text')} style={sx.small({ margin: '4px 0 0 0' })}>{s.text}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  },
});
