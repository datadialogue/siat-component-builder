import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Bookmark, Trash2, FileJson } from 'lucide-react';
import { useStore, listSaved, saveCurrent, deleteSaved, type SavedItem } from '../store';
import { getComponent } from '../components/registry';
import { inputCls, Tip } from './ui';

export function SavedMenu() {
  const doc = useStore((s) => s.doc);
  const loadDoc = useStore((s) => s.loadDoc);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [name, setName] = useState('');

  const refresh = () => setItems(listSaved());
  const downloadJson = (it: SavedItem) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ doc: it.doc }, null, 2)], { type: 'application/json' }));
    a.download = `${it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
  };

  return (
    <Popover.Root open={open} onOpenChange={(o) => { setOpen(o); if (o) { refresh(); setName(doc.name); } }}>
      <Tip label="Saved components">
        <Popover.Trigger asChild>
          <button type="button" aria-label="Saved components" className="inline-flex size-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
            <Bookmark className="size-4" />
          </button>
        </Popover.Trigger>
      </Tip>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={6} collisionPadding={8} className="z-50 w-80 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl">
          <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { saveCurrent(name.trim()); refresh(); } }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={inputCls} aria-label="Name" />
            <button type="submit" className="rounded-md bg-zinc-900 px-3 text-xs font-semibold text-white">Save</button>
          </form>
          <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
            {items.length === 0 && <p className="py-4 text-center text-xs text-zinc-400">Nothing saved yet</p>}
            {items.map((it) => {
              const def = getComponent(it.doc.component);
              const Icon = def?.icon;
              return (
                <div key={it.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50">
                  <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => { loadDoc(it.doc, it.id); setOpen(false); }}>
                    {Icon && <Icon className="size-4 shrink-0 text-zinc-400" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-zinc-800">{it.name}</span>
                      <span className="block text-[11px] text-zinc-400">{def?.name} · {new Date(it.updated).toLocaleDateString()}</span>
                    </span>
                  </button>
                  <button type="button" aria-label="Download JSON" title="Download .json" onClick={() => downloadJson(it)} className="rounded p-1 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-zinc-700"><FileJson className="size-3.5" /></button>
                  <button type="button" aria-label="Delete" title="Delete" onClick={() => { deleteSaved(it.id); refresh(); }} className="rounded p-1 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                </div>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
