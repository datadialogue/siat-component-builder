import { useEffect, useRef } from 'react';
import { RotateCcw, Play, Type, Palette, Sparkles } from 'lucide-react';
import { useStore } from '../../store';
import { getComponent } from '../../components/registry';
import { COMMON_MOTION_FIELDS, COMMON_STYLE_FIELDS } from '../../lib/commonFields';
import type { Tab } from '../../lib/types';
import { FieldGroup } from './Fields';
import { cx, Help, IconButton } from '../ui';

const TABS: { id: Tab; label: string; icon: typeof Type }[] = [
  { id: 'content', label: 'Content', icon: Type },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'behaviour', label: 'Motion', icon: Sparkles },
];

export function Inspector() {
  const docComponent = useStore((s) => s.doc.component);
  const tab = useStore((s) => s.ui.tab);
  const setUi = useStore((s) => s.setUi);
  const selected = useStore((s) => s.selected);
  const focusNonce = useStore((s) => s.focusNonce);
  const resetDoc = useStore((s) => s.resetDoc);
  const applyPreset = useStore((s) => s.applyPreset);
  const replay = useStore((s) => s.replay);
  const def = getComponent(docComponent);
  const scroller = useRef<HTMLDivElement>(null);

  // Scroll to / focus the field that was clicked in the preview.
  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => {
      const el = scroller.current?.querySelector<HTMLElement>(`[data-field-path="${CSS.escape(selected)}"]`);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (focusNonce) {
        const input = el.querySelector<HTMLElement>('input:not([type=file]):not([type=range]), textarea, .ProseMirror');
        input?.focus({ preventScroll: true });
      }
    }, 60);
    return () => clearTimeout(t);
  }, [selected, focusNonce]);

  if (!def) return null;
  const Icon = def.icon;
  const hasTab = (t: Tab) => def.fields.some((f) => (f.tab ?? 'content') === t);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-md bg-[#cc0633]/10 text-[#cc0633]"><Icon className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h2 className="truncate text-sm font-semibold text-zinc-900">{def.name}</h2>
            <Help side="bottom">{def.description} Click anything in the preview to edit it; double-click text to type in place.</Help>
          </div>
        </div>
        <IconButton label="Reset to defaults" onClick={() => { if (confirm('Reset this component to its defaults?')) resetDoc(); }}><RotateCcw className="size-4" /></IconButton>
      </div>

      <div role="tablist" className="flex gap-1 border-b border-zinc-200 px-3 pt-2">
        {TABS.map((t) => {
          const I = t.icon;
          return (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setUi({ tab: t.id })}
              className={cx('-mb-px flex items-center gap-1.5 border-b-2 px-2.5 pb-2 text-xs font-medium transition',
                tab === t.id ? 'border-[#cc0633] text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800')}>
              <I className="size-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {tab === 'content' && <FieldGroup fields={def.fields} base="props" tab="content" />}

        {tab === 'style' && (
          <div className="space-y-6">
            {!!def.presets?.length && (
              <section>
                <div className="mb-2 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">Variants</div>
                <div className="flex flex-wrap gap-1.5">
                  {def.presets.map((p, i) => (
                    <button key={p.name} type="button" onClick={() => applyPreset(i)}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:border-[#cc0633] hover:text-[#cc0633]">
                      {p.name}
                    </button>
                  ))}
                </div>
              </section>
            )}
            {hasTab('style') && <Section title={def.name}><FieldGroup fields={def.fields} base="props" tab="style" /></Section>}
            <Section title="Theme"><FieldGroup fields={COMMON_STYLE_FIELDS} base="common" /></Section>
          </div>
        )}

        {tab === 'behaviour' && (
          <div className="space-y-6">
            {hasTab('behaviour') && <Section title="Interaction"><FieldGroup fields={def.fields} base="props" tab="behaviour" /></Section>}
            <Section title="Animation" action={
              <button type="button" onClick={replay} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"><Play className="size-3" />Replay</button>
            }>
              <FieldGroup fields={COMMON_MOTION_FIELDS} base="common" />
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">{title}</div>
        {action}
      </div>
      {children}
    </section>
  );
}
