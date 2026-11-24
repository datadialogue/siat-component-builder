import { useRef, useState } from 'react';
import { ImagePlus, Upload, AlertTriangle } from 'lucide-react';
import type { ImageValue } from '../../lib/types';
import { isPlaceholder } from '../../lib/placeholder';
import { cx, fileToDataUrl, Help, inputCls } from '../ui';

export function ImageInput({ value, onChange, id }: { value: ImageValue; onChange: (v: ImageValue) => void; id?: string }) {
  const v: ImageValue = value ?? { src: '', alt: '' };
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const local = /^data:image\/(?!svg)/.test(v.src) || v.src.startsWith('blob:');
  const placeholder = isPlaceholder(v.src);
  const [px, py] = (v.pos ?? '50% 50%').split(' ').map((s) => parseFloat(s));

  const takeFile = async (f?: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    const src = await fileToDataUrl(f);
    onChange({ ...v, src, alt: v.alt && !/^Describe/.test(v.alt) ? v.alt : f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') });
  };

  const setFocal = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!v.src) { fileRef.current?.click(); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    onChange({ ...v, pos: `${x}% ${y}%` });
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); takeFile(e.dataTransfer.files?.[0]); }}
        onClick={setFocal}
        className={cx(
          'group relative flex aspect-video cursor-crosshair items-center justify-center overflow-hidden rounded-md border bg-[repeating-conic-gradient(#f4f4f5_0_25%,#fff_0_50%)] bg-[length:16px_16px]',
          over ? 'border-sky-500 ring-2 ring-sky-500/30' : 'border-zinc-200',
        )}
        title={v.src ? 'Click to set the focal point' : 'Drop an image'}
      >
        {v.src ? (
          <>
            <img src={v.src} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: v.pos }} />
            <span className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-500/80 shadow" style={{ left: `${px}%`, top: `${py}%` }} />
          </>
        ) : (
          <ImagePlus className="size-6 text-zinc-400" />
        )}
        {over && <div className="absolute inset-0 bg-sky-500/15" />}
        <button type="button" onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
          className="absolute right-1.5 bottom-1.5 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-zinc-700 opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100">
          <Upload className="size-3" /> File
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => takeFile(e.target.files?.[0])} />
      </div>

      {(local || placeholder) && (
        <div className={cx('flex items-start gap-1.5 rounded-md px-2 py-1.5 text-[11px] leading-snug', local ? 'bg-amber-50 text-amber-800' : 'bg-zinc-50 text-zinc-500')}>
          {local && <AlertTriangle className="mt-px size-3 shrink-0" />}
          <span className="flex-1">{local ? 'Preview only — paste the DAM path below' : 'Placeholder'}</span>
          <Help>Upload the image to AEM Assets (DAM), copy its path (starts with /content/dam/…) and paste it here. Local files only show in this preview.</Help>
        </div>
      )}

      <input id={id} className={inputCls} placeholder="/content/dam/sfu/siat/…" value={local || placeholder ? '' : v.src}
        onChange={(e) => onChange({ ...v, src: e.target.value.trim() })} aria-label="Image URL" />
      <input className={inputCls} placeholder="Alt text (describe the image)" value={v.alt} onChange={(e) => onChange({ ...v, alt: e.target.value })} aria-label="Alt text" />
    </div>
  );
}
