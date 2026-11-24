import type { CSSProperties } from 'react';
import { ListCollapse } from 'lucide-react';
import { defineComponent } from '../../lib/types';
import accordionRuntime from './runtime.es5.js?raw';

interface Item { _id?: string; title: string; body: string; open: boolean }
interface Props {
  sectionTitle: string;
  items: Item[];
  variant: 'lines' | 'boxed' | 'filled';
  icon: 'plus' | 'chevron' | 'none';
  titleSize: 'sm' | 'md' | 'lg';
  singleOpen: boolean;
  smooth: boolean;
}

const newItem = (i: number): Item => ({
  title: i === 0 ? 'How do I apply to SIAT?' : `Question ${i + 1}`,
  body: '<p>Write the answer here. You can use <strong>bold</strong>, <a href="https://www.sfu.ca/siat.html">links</a> and lists:</p><ul><li><p>First point</p></li><li><p>Second point</p></li></ul>',
  open: false,
});

const SIZES = { sm: 16, md: 19, lg: 23 };

export default defineComponent<Props>({
  id: 'accordion',
  name: 'Accordion / FAQ',
  category: 'Interactive',
  description: 'Expandable questions and answers. Works even if scripts are blocked.',
  icon: ListCollapse,
  fields: [
    { key: 'sectionTitle', type: 'text', label: 'Section title' },
    {
      key: 'items', type: 'list', label: 'Items', itemLabel: 'item', titleKey: 'title', min: 1, max: 40,
      newItem,
      itemFields: [
        { key: 'title', type: 'text', label: 'Question / title' },
        { key: 'body', type: 'richtext', label: 'Answer' },
        { key: 'open', type: 'toggle', label: 'Open at start' },
      ],
    },
    { key: 'variant', type: 'select', label: 'Style', tab: 'style', options: [{ value: 'lines', label: 'Lines' }, { value: 'boxed', label: 'Boxed' }, { value: 'filled', label: 'Filled' }] },
    { key: 'icon', type: 'select', label: 'Icon', tab: 'style', options: [{ value: 'plus', label: '+' }, { value: 'chevron', label: '⌄' }, { value: 'none', label: 'None' }] },
    { key: 'titleSize', type: 'select', label: 'Title size', tab: 'style', options: [{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }] },
    { key: 'singleOpen', type: 'toggle', label: 'One open at a time', tab: 'behaviour' },
    { key: 'smooth', type: 'toggle', label: 'Smooth open/close', tab: 'behaviour' },
  ],
  defaults: {
    sectionTitle: '',
    items: [newItem(0), newItem(1), newItem(2)],
    variant: 'lines',
    icon: 'plus',
    titleSize: 'md',
    singleOpen: false,
    smooth: true,
  },
  presets: [
    { name: 'Lines', props: { variant: 'lines', icon: 'plus' } },
    { name: 'Boxed', props: { variant: 'boxed', icon: 'chevron' } },
    { name: 'Filled', props: { variant: 'filled', icon: 'plus' }, common: { theme: 'grey' } },
  ],
  // Without JS, <details> still opens/closes; the script adds animation, single-open and icon rotation.
  runtime: (p) => (p.smooth || p.singleOpen || p.icon !== 'none' ? accordionRuntime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const accent = t.accent === '#ffffff' ? t.heading : t.accent;
    const item: Record<Props['variant'], { base: CSSProperties; on: string; off: string }> = {
      lines: {
        base: { borderTop: 0, borderLeft: 0, borderRight: 0, borderBottom: `1px solid ${t.border}`, background: 'transparent' },
        on: `border-bottom-color:${accent};`, off: `border-bottom-color:${t.border};`,
      },
      boxed: {
        base: { border: `1px solid ${t.border}`, borderRadius: `${t.radiusSm}px`, background: t.surface, margin: '0 0 10px 0' },
        on: `border-color:${accent};box-shadow:${t.shadow};`, off: `border-color:${t.border};box-shadow:none;`,
      },
      filled: {
        base: { border: 0, borderLeft: '4px solid transparent', borderRadius: `${t.radiusSm}px`, background: t.dark ? t.surface : '#ffffff', margin: '0 0 8px 0' },
        on: `border-left-color:${accent};`, off: 'border-left-color:transparent;',
      },
    };
    const v = item[p.variant];
    const padX = p.variant === 'lines' ? '2px' : '20px';
    const iconGlyph = p.icon === 'plus' ? '+' : '⌄';
    const iconOpen = p.icon === 'plus' ? 'rotate(45deg)' : 'rotate(180deg)';

    return (
      <div {...ctx.root('accordion', { padding: t.bg === 'transparent' ? 0 : '24px' })}
        data-single={p.singleOpen ? '1' : '0'} data-smooth={p.smooth ? '1' : '0'} data-on={v.on} data-off={v.off}>
        {p.sectionTitle && <h2 {...ctx.edit('sectionTitle', 'text')} style={sx.heading(30, { margin: '0 0 16px 0' })}>{p.sectionTitle}</h2>}
        <div style={{ margin: 0, padding: 0, borderTop: p.variant === 'lines' ? `1px solid ${t.border}` : 0 }}>
          {p.items.map((it, i) => (
            <details key={it._id ?? i} className="sfua-item" open={it.open || undefined} {...ctx.item('items', i)} {...ctx.reveal()}
              style={{ display: 'block', boxSizing: 'border-box', padding: 0, margin: 0, transition: 'border-color .25s ease, box-shadow .25s ease', ...v.base }}>
              <summary style={{ display: 'block', listStyle: 'none', cursor: 'pointer', margin: 0, padding: `16px ${padX}`, outlineOffset: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', margin: 0, padding: 0 }}>
                  <span {...ctx.edit(`items.${i}.title`, 'text')} style={sx.heading(SIZES[p.titleSize], { fontWeight: 700, fontStretch: '100%', lineHeight: 1.35 })}>{it.title}</span>
                  {p.icon !== 'none' && (
                    <span className="sfua-icon" aria-hidden="true" data-open={iconOpen}
                      style={{ flex: '0 0 auto', display: 'inline-block', width: '28px', height: '28px', lineHeight: p.icon === 'plus' ? '26px' : '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: p.icon === 'plus' ? '26px' : '20px', fontWeight: 400, color: accent, transition: 'transform .3s ease', transform: it.open ? iconOpen : 'none' }}>
                      {iconGlyph}
                    </span>
                  )}
                </span>
              </summary>
              <div className="sfua-body" style={{ overflow: 'hidden', margin: 0, padding: 0 }}>
                <div {...ctx.edit(`items.${i}.body`, 'rich')} style={{ margin: 0, padding: `0 ${padX} 18px` }} dangerouslySetInnerHTML={ctx.rich(it.body, { size: 16 })} />
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  },
});

