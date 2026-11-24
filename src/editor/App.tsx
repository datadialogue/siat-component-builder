import { useEffect, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Undo2, Redo2, FolderOpen, Code2, LayoutGrid, SlidersHorizontal, X, Lightbulb, Wrench, LayoutTemplate } from 'lucide-react';
import { Ideas } from '../ideas/Ideas';
import { Mockup } from '../mockup/Mockup';
import { useStore as useZustand } from 'zustand';
import { useStore, undo, redo } from '../store';
import { Library } from './Library';
import { Preview } from './Preview';
import { Inspector } from './inspector/Inspector';
import { ExportDialog } from './ExportDialog';
import { ImportDialog } from './ImportDialog';
import { SavedMenu } from './SavedMenu';
import { cx, IconButton } from './ui';

type View = 'build' | 'ideas' | 'mockup';
/** "#ideas" and "#mockup" show those pages; anything else is the builder. */
function useHashView(): View {
  const read = (): View => (window.location.hash === '#ideas' ? 'ideas' : window.location.hash === '#mockup' ? 'mockup' : 'build');
  const [view, setView] = useState<View>(read);
  useEffect(() => {
    const on = () => setView(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return view;
}

export function App() {
  const panel = useStore((s) => s.ui.panel);
  const setUi = useStore((s) => s.setUi);
  const name = useStore((s) => s.doc.name);
  const setValue = useStore((s) => s.setValue);
  const canUndo = useZustand(useStore.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useZustand(useStore.temporal, (s) => s.futureStates.length > 0);
  const view = useHashView();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest('input, textarea, [contenteditable=true], .ProseMirror');
      if (!(e.metaKey || e.ctrlKey) || typing || view !== 'build') return;
      const k = e.key.toLowerCase();
      if (k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      else if (k === 'y') { e.preventDefault(); redo(); }
      else if (k === 'e') { e.preventDefault(); setUi({ exportOpen: true }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setUi, view]);

  const close = () => setUi({ panel: null });

  return (
    <Tooltip.Provider>
      <div className="flex h-dvh flex-col overflow-hidden bg-zinc-50 text-zinc-900">
        {/* Top bar */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-2 sm:px-3">
          {view === 'build' && <IconButton label="Components" className="lg:hidden" onClick={() => setUi({ panel: panel === 'library' ? null : 'library' })}><LayoutGrid className="size-4" /></IconButton>}
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-[#cc0633] text-[11px] font-black tracking-tight text-white">SIAT</span>
            <span className="hidden text-sm font-semibold text-zinc-900 xl:inline">Component Builder</span>
          </div>
          <nav className="ml-1 flex rounded-lg bg-zinc-100 p-0.5" aria-label="View">
            {([['build', 'Build', Wrench], ['ideas', 'Ideas', Lightbulb], ['mockup', 'Mockup', LayoutTemplate]] as const).map(([v, label, I]) => (
              <a key={v} href={v === 'build' ? '#' : `#${v}`} aria-current={view === v ? 'page' : undefined}
                onClick={(e) => { e.preventDefault(); window.location.hash = v === 'build' ? '' : v; }}
                className={cx('inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition', view === v ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800')}>
                <I className="size-3.5" /><span className="hidden sm:inline">{label}</span>
              </a>
            ))}
          </nav>
          {view === 'build' && <>
          <span className="mx-1 hidden h-5 w-px bg-zinc-200 sm:block" />
          <input value={name} onChange={(e) => setValue('name', e.target.value)} aria-label="Name"
            className="hidden w-40 min-w-0 rounded-md border border-transparent px-2 py-1 text-sm text-zinc-600 hover:border-zinc-200 focus:border-sky-500 focus:outline-none md:block lg:w-56" />
          </>}
          {view === 'build' && <div className="ml-auto flex items-center gap-0.5">
            <IconButton label="Undo (⌘Z)" onClick={undo} disabled={!canUndo}><Undo2 className="size-4" /></IconButton>
            <IconButton label="Redo (⇧⌘Z)" onClick={redo} disabled={!canRedo}><Redo2 className="size-4" /></IconButton>
            <SavedMenu />
            <IconButton label="Open exported snippet" onClick={() => setUi({ importOpen: true })}><FolderOpen className="size-4" /></IconButton>
            <IconButton label="Edit" className="md:hidden" onClick={() => setUi({ panel: panel === 'inspector' ? null : 'inspector' })}><SlidersHorizontal className="size-4" /></IconButton>
            <button type="button" onClick={() => setUi({ exportOpen: true })}
              className="ml-1 flex items-center gap-1.5 rounded-lg bg-[#cc0633] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a6192e]">
              <Code2 className="size-4" /><span className="hidden sm:inline">Export</span>
            </button>
          </div>}
        </header>

        {view === 'ideas' ? <main className="min-h-0 flex-1"><Ideas /></main> : view === 'mockup' ? <main className="min-h-0 flex-1"><Mockup /></main> : (
        <div className="relative flex min-h-0 flex-1">
          {/* Library: sidebar on large screens, drawer otherwise */}
          <aside className={cx(
            'z-30 w-72 shrink-0 border-r border-zinc-200 bg-zinc-50 transition-transform duration-200 lg:static lg:w-60 lg:translate-x-0',
            'absolute inset-y-0 left-0 shadow-xl lg:shadow-none',
            panel === 'library' ? 'translate-x-0' : '-translate-x-full',
          )}>
            <Library onPick={close} />
          </aside>

          <main className="min-w-0 flex-1">
            <Preview />
          </main>

          {/* Inspector: sidebar on md+, bottom sheet on phones */}
          <aside className={cx(
            'z-30 shrink-0 bg-white transition-transform duration-200',
            'max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:h-[72%] max-md:rounded-t-2xl max-md:shadow-[0_-12px_40px_rgba(0,0,0,.18)]',
            panel === 'inspector' ? 'max-md:translate-y-0' : 'max-md:translate-y-full',
            'md:w-80 md:border-l md:border-zinc-200 xl:w-96',
          )}>
            <div className="flex justify-center pt-2 md:hidden">
              <button type="button" aria-label="Close" onClick={close} className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500"><X className="size-3" /></button>
            </div>
            <div className="h-full max-md:h-[calc(100%-32px)]"><Inspector /></div>
          </aside>

          {panel && <div className={cx('absolute inset-0 z-20 bg-zinc-950/20', panel === 'library' ? 'lg:hidden' : 'md:hidden')} onClick={close} />}
        </div>
        )}
      </div>
      <ExportDialog />
      <ImportDialog />
    </Tooltip.Provider>
  );
}
