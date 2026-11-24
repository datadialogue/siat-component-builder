import type { CSSProperties } from 'react';
import { PanelsTopLeft } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import runtime from './runtime.es5.js?raw';

interface TabItem { _id?: string; label: string; body: string; image: ImageValue }
interface Props {
  tabs: TabItem[];
  variant: 'underline' | 'pills' | 'boxed';
  layout: 'top' | 'side';
  align: 'start' | 'center' | 'stretch';
  imageSide: 'left' | 'right' | 'top';
  panelAnim: 'none' | 'fade' | 'slide';
}

const newTab = (i: number): TabItem => ({
  label: ['Undergraduate', 'Graduate', 'Research'][i] ?? `Tab ${i + 1}`,
  body: `<h3>Heading for tab ${i + 1}</h3><p>Panel content goes here. Use the editor to add <strong>formatting</strong>, links and lists.</p>`,
  image: { src: '', alt: '' },
});

export default defineComponent<Props>({
  id: 'tabs',
  name: 'Tabs',
  category: 'Interactive',
  description: 'Switch between panels of content. Shows as stacked sections if scripts are blocked.',
  icon: PanelsTopLeft,
  fields: [
    {
      key: 'tabs', type: 'list', label: 'Tabs', itemLabel: 'tab', titleKey: 'label', thumbKey: 'image', min: 1, max: 12,
      newItem: newTab,
      itemFields: [
        { key: 'label', type: 'text', label: 'Tab label' },
        { key: 'body', type: 'richtext', label: 'Content' },
        { key: 'image', type: 'image', label: 'Image (optional)' },
      ],
    },
    { key: 'variant', type: 'select', label: 'Tab style', tab: 'style', options: [{ value: 'underline', label: 'Underline' }, { value: 'pills', label: 'Pills' }, { value: 'boxed', label: 'Boxed' }] },
    { key: 'layout', type: 'select', label: 'Tabs position', tab: 'style', options: [{ value: 'top', label: 'Top' }, { value: 'side', label: 'Side' }] },
    { key: 'align', type: 'select', label: 'Tab alignment', tab: 'style', options: [{ value: 'start', label: 'Start' }, { value: 'center', label: 'Centre' }, { value: 'stretch', label: 'Fill' }], showIf: (p) => p.layout === 'top' },
    { key: 'imageSide', type: 'select', label: 'Image position', tab: 'style', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'top', label: 'Top' }] },
    { key: 'panelAnim', type: 'select', label: 'Panel transition', tab: 'behaviour', options: [{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Rise' }] },
  ],
  defaults: {
    tabs: [newTab(0), newTab(1), newTab(2)],
    variant: 'underline',
    layout: 'top',
    align: 'start',
    imageSide: 'right',
    panelAnim: 'fade',
  },
  presets: [
    { name: 'Underline', props: { variant: 'underline', layout: 'top' } },
    { name: 'Pills', props: { variant: 'pills', layout: 'top', align: 'center' } },
    { name: 'Side menu', props: { variant: 'boxed', layout: 'side' } },
  ],
  runtime,
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const side = p.layout === 'side';
    const accent = t.accent === '#ffffff' ? t.heading : t.accent;
    const pid = (i: number) => `sfub-${ctx.id}-panel-${i}`;
    const tid = (i: number) => `sfub-${ctx.id}-tab-${i}`;

    const states: Record<Props['variant'], { base: CSSProperties; on: string; off: string }> = {
      underline: {
        base: { padding: side ? '12px 16px' : '12px 18px', borderBottom: side ? 0 : '3px solid transparent', borderLeft: side ? '3px solid transparent' : 0, background: 'transparent' },
        on: `color:${t.heading};border-color:${accent};`,
        off: `color:${t.muted};border-color:transparent;`,
      },
      pills: {
        base: { padding: '10px 20px', borderRadius: '999px', border: 0 },
        on: `color:${t.accent === '#ffffff' ? t.bg : t.onAccent};background:${t.accent};`,
        off: `color:${t.text};background:transparent;`,
      },
      boxed: {
        base: { padding: '12px 18px', border: `1px solid ${t.border}`, borderRadius: side ? `${t.radiusSm}px` : `${t.radiusSm}px ${t.radiusSm}px 0 0`, margin: side ? '0 0 6px 0' : '0 0 -1px 0' },
        on: `color:${t.heading};background:${t.dark ? t.surface : '#ffffff'};border-bottom-color:${side ? t.border : t.dark ? t.surface : '#ffffff'};`,
        off: `color:${t.muted};background:${t.surfaceAlt};border-bottom-color:${t.border};`,
      },
    };
    const st = states[p.variant];
    const panelBox: CSSProperties = p.variant === 'boxed'
      ? { border: `1px solid ${t.border}`, borderRadius: side ? `${t.radiusSm}px` : `0 ${t.radiusSm}px ${t.radiusSm}px ${t.radiusSm}px`, background: t.dark ? t.surface : '#ffffff', padding: '24px' }
      : { padding: side ? '4px 0 0 0' : '24px 0 0 0' };

    return (
      <div {...ctx.root('tabs', { padding: t.bg === 'transparent' ? 0 : '24px', display: side ? 'flex' : 'block', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' })}
        data-on={st.on} data-off={st.off} data-panel-anim={p.panelAnim}>
        <div className="sfut-list" role="tablist" aria-orientation={side ? 'vertical' : 'horizontal'}
          style={{
            display: 'none', margin: 0, padding: 0, boxSizing: 'border-box',
            flexDirection: side ? 'column' : 'row', flexWrap: side ? 'nowrap' : 'wrap',
            justifyContent: p.align === 'center' ? 'center' : 'flex-start',
            gap: p.variant === 'pills' ? '6px' : p.variant === 'boxed' && !side ? '4px' : 0,
            borderBottom: !side && p.variant !== 'pills' ? `1px solid ${t.border}` : 0,
            borderLeft: side && p.variant === 'underline' ? `1px solid ${t.border}` : 0,
            flex: side ? '0 1 220px' : undefined,
            minWidth: side ? '180px' : undefined,
          }}>
          {p.tabs.map((tab, i) => (
            <button key={tab._id ?? i} type="button" role="tab" id={tid(i)} className="sfut-tab" aria-controls={pid(i)}
              aria-selected={i === 0 ? 'true' : 'false'} tabIndex={i === 0 ? 0 : -1}
              {...ctx.item('tabs', i)} {...ctx.edit(`tabs.${i}.label`, 'text')}
              style={sx.buttonReset({
                ...st.base,
                fontFamily: t.font, fontSize: '16px', fontWeight: 700, lineHeight: 1.3,
                textAlign: side ? 'left' : 'center',
                flex: p.align === 'stretch' && !side ? '1 1 0' : '0 0 auto',
                transition: 'color .2s ease, background-color .2s ease, border-color .2s ease',
              })}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ flex: side ? '1 1 320px' : undefined, minWidth: 0, margin: 0, padding: 0 }}>
          {p.tabs.map((tab, i) => {
            const hasImg = !!tab.image?.src;
            const row = hasImg && p.imageSide !== 'top';
            return (
              <div key={tab._id ?? i} className="sfut-panel" role="tabpanel" id={pid(i)} aria-labelledby={tid(i)} tabIndex={0}
                style={{ boxSizing: 'border-box', margin: i > 0 ? '0' : 0, ...panelBox }}>
                <h3 className="sfut-fallback" style={sx.heading(22, { margin: i === 0 ? '0 0 12px 0' : '28px 0 12px 0' })}>{tab.label}</h3>
                <div style={{ display: row ? 'flex' : 'block', flexWrap: 'wrap', flexDirection: p.imageSide === 'right' ? 'row-reverse' : 'row', gap: '24px', alignItems: 'flex-start', margin: 0, padding: 0 }}>
                  {hasImg && (
                    <div style={{ flex: '1 1 240px', margin: row ? 0 : '0 0 16px 0', padding: 0, borderRadius: `${t.radiusSm}px`, overflow: 'hidden' }}>
                      <img src={tab.image.src} alt={tab.image.alt} loading="lazy" {...ctx.edit(`tabs.${i}.image`, 'image')} style={sx.img({ objectFit: 'cover', objectPosition: tab.image.pos })} />
                    </div>
                  )}
                  <div {...ctx.edit(`tabs.${i}.body`, 'rich')} style={{ flex: '2 1 300px', minWidth: 0, margin: 0, padding: 0 }} dangerouslySetInnerHTML={ctx.rich(tab.body)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
