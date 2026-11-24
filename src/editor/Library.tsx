import { components } from '../components/registry';
import { useStore } from '../store';
import { cx, Help } from './ui';

const CATS = ['Media', 'Content', 'Interactive', 'Layout'] as const;

export function Library({ onPick }: { onPick?: () => void }) {
  const current = useStore((s) => s.doc.component);
  const load = useStore((s) => s.loadComponent);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-zinc-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">Components</h2>
        <Help side="right">Pick a component to edit. Each one exports as a single snippet for one AEM HTML component. Your edits to each are kept while you switch.</Help>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-3">
        {CATS.map((cat) => {
          const list = components.filter((c) => c.category === cat);
          if (!list.length) return null;
          return (
            <section key={cat}>
              <div className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">{cat}</div>
              <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                {list.map((c) => {
                  const Icon = c.icon;
                  const on = c.id === current;
                  return (
                    <button key={c.id} type="button" title={c.description} onClick={() => { load(c.id); onPick?.(); }}
                      className={cx(
                        'group flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition',
                        on ? 'border-[#cc0633] bg-[#cc0633]/5' : 'border-transparent hover:border-zinc-200 hover:bg-white',
                      )}>
                      <span className={cx('flex size-8 shrink-0 items-center justify-center rounded-md transition', on ? 'bg-[#cc0633] text-white' : 'bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200 group-hover:text-[#cc0633]')}>
                        <Icon className="size-4" />
                      </span>
                      <span className={cx('truncate text-sm', on ? 'font-semibold text-zinc-900' : 'text-zinc-700')}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
