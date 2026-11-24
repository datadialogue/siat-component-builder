import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileUp } from 'lucide-react';
import { useStore } from '../store';
import { decodeState } from '../export/state';
import { getComponent } from '../components/registry';
import type { Doc } from '../lib/types';
import { Help, inputCls, cx } from './ui';

export function parseImport(text: string): Doc | null {
  const fromHtml = decodeState(text);
  if (fromHtml) return fromHtml;
  try {
    const o = JSON.parse(text);
    const d = o.doc ?? o;
    if (d?.component && getComponent(d.component)) return d as Doc;
  } catch { /* not JSON */ }
  return null;
}

export function ImportDialog() {
  const open = useStore((s) => s.ui.importOpen);
  const setUi = useStore((s) => s.setUi);
  const loadDoc = useStore((s) => s.loadDoc);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const tryLoad = (t: string) => {
    const doc = parseImport(t);
    if (!doc || !getComponent(doc.component)) {
      setError('No builder data found. Only snippets exported with "Include edit data" can be re-opened.');
      return;
    }
    loadDoc(doc);
    setText('');
    setError('');
    setUi({ importOpen: false });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { setUi({ importOpen: o }); setError(''); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(560px,94vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-2xl">
          <div className="mb-3 flex items-center gap-2">
            <Dialog.Title className="text-base font-semibold text-zinc-900">Open snippet</Dialog.Title>
            <Help side="bottom">Paste HTML you exported earlier (from AEM's HTML component editor), or a saved .json file.</Help>
            <Dialog.Description className="sr-only">Paste an exported snippet to edit it again.</Dialog.Description>
            <Dialog.Close className="ml-auto rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Close"><X className="size-4" /></Dialog.Close>
          </div>
          <textarea autoFocus rows={9} value={text} onChange={(e) => { setText(e.target.value); setError(''); }}
            placeholder="<!-- … SIAT Component Builder … -->" className={cx(inputCls, 'font-mono text-xs')} />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <div className="mt-3 flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
              <FileUp className="size-3.5" /> File
              <input type="file" accept=".html,.htm,.json,.txt" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) tryLoad(await f.text()); }} />
            </label>
            <button type="button" disabled={!text.trim()} onClick={() => tryLoad(text)}
              className="ml-auto rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Open</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
