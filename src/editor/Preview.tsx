import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Monitor, PanelLeft, Tablet, Smartphone, Play, AlertCircle } from 'lucide-react';
import { useStore, VIEWPORTS, undo, redo } from '../store';
import { renderDoc } from '../export/render';
import { getIn } from '../lib/path';
import { previewDocument } from './preview/previewDoc';
import { cx, fileToDataUrl, Help, IconButton, Switch, Tip } from './ui';

const ICONS: Record<string, typeof Monitor> = { full: Monitor, column: PanelLeft, tablet: Tablet, phone: Smartphone };
const BODY_PAD = 32; // preview body padding (16px each side)

export function Preview() {
  const doc = useStore((s) => s.doc);
  const selected = useStore((s) => s.selected);
  const ui = useStore((s) => s.ui);
  const setUi = useStore((s) => s.setUi);
  const iframe = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [avail, setAvail] = useState({ w: 800, h: 600 });

  const result = useMemo(() => renderDoc(doc, { preview: true }), [doc]);
  const srcDoc = useMemo(() => previewDocument(ui.liveCss), [ui.liveCss]);

  // Replay entrance animation when asked, or when animation settings change.
  const c = doc.common;
  const animKey = `${c.entrance}|${c.duration}|${c.delay}|${c.stagger}|${c.easing}|${doc.component}|${ui.replayNonce}`;
  const lastAnim = useRef('');

  const post = (m: any) => iframe.current?.contentWindow?.postMessage({ __sfub: 1, ...m }, '*');

  useEffect(() => { setReady(false); }, [srcDoc]);

  useEffect(() => {
    if (!ready) return;
    const replay = lastAnim.current !== animKey;
    lastAnim.current = animKey;
    post({ type: 'render', html: result.html, replay });
    post({ type: 'select', path: useStore.getState().selected });
  }, [result.html, ready, animKey]);

  useEffect(() => { if (ready) post({ type: 'select', path: selected }); }, [selected, ready]);

  // Messages from the iframe bridge
  useEffect(() => {
    const onMsg = async (e: MessageEvent) => {
      if (e.source !== iframe.current?.contentWindow) return;
      const m = e.data;
      if (!m?.__sfub) return;
      const st = useStore.getState();
      switch (m.type) {
        case 'ready': setReady(true); break;
        case 'select': st.select(m.path); if (m.path) st.setUi({ tab: 'content' }); break;
        case 'focusField': st.select(m.path, true); st.setUi({ tab: 'content', panel: window.innerWidth < 1024 ? 'inspector' : st.ui.panel }); break;
        case 'text': if (m.path) st.setValue(`props.${m.path}`, m.value); break;
        case 'move': st.moveItem(`props.${m.key}`, m.from, m.to); break;
        case 'dropImage': {
          if (!m.path || !(m.file instanceof Blob)) break;
          const src = await fileToDataUrl(m.file as File);
          const cur = getIn(st.doc, `props.${m.path}`) ?? {};
          const name = (m.file as File).name?.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') ?? '';
          st.setValue(`props.${m.path}`, { ...cur, src, alt: cur.alt && !/^Describe/.test(cur.alt) ? cur.alt : name });
          st.select(m.path);
          break;
        }
        case 'key': if (m.key === 'y' || (m.key === 'z' && m.shift)) redo(); else if (m.key === 'z') undo(); break;
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAvail({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const preset = VIEWPORTS.find((v) => v.id === ui.viewport);
  const contentW = preset ? preset.width : ui.customWidth;
  const frameW = contentW + BODY_PAD;
  const scale = Math.min(1, (avail.w - 24) / frameW);
  const frameH = Math.max(200, (avail.h - 8) / scale);

  // Drag the frame edge to resize
  const startDrag = (e: React.PointerEvent, dir: 1 | -1) => {
    e.preventDefault();
    const x0 = e.clientX;
    const w0 = contentW;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    const shield = document.createElement('div');
    shield.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:ew-resize';
    document.body.appendChild(shield);
    const move = (ev: PointerEvent) => {
      const w = Math.round(Math.max(300, Math.min(1820, w0 + (dir * (ev.clientX - x0) * 2) / scale)));
      setUi({ viewport: 'custom', customWidth: w });
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); shield.remove(); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-100">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-zinc-200 bg-white px-3 py-1.5">
        <div className="flex items-center gap-0.5">
          {VIEWPORTS.map((v) => {
            const I = ICONS[v.id];
            return (
              <IconButton key={v.id} label={`${v.label} · ${v.width}px`} active={ui.viewport === v.id} onClick={() => setUi({ viewport: v.id })}>
                <I className="size-4" />
              </IconButton>
            );
          })}
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500 tabular-nums">
          <input aria-label="Preview width" type="number" min={300} max={1820} value={contentW}
            onChange={(e) => setUi({ viewport: 'custom', customWidth: Math.max(300, Math.min(1820, Number(e.target.value) || 300)) })}
            className="w-14 rounded border border-transparent bg-transparent px-1 py-0.5 text-right hover:border-zinc-200 focus:border-sky-500 focus:outline-none" />
          px{scale < 0.999 && <span className="ml-1 rounded bg-zinc-100 px-1 text-[10px]">{Math.round(scale * 100)}%</span>}
          <Help side="bottom">Width of the space the component sits in. Drag the frame's edges to try any width.</Help>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Tip label="Replay animations">
            <button type="button" onClick={() => useStore.getState().replay()} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"><Play className="size-3.5" /><span className="hidden sm:inline">Replay</span></button>
          </Tip>
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-600">
            <Switch checked={ui.liveCss} onChange={(v) => setUi({ liveCss: v })} />
            <span className="hidden sm:inline">Live SFU CSS</span><span className="sm:hidden">SFU</span>
            <Help side="bottom">On: loads sfu.ca's real stylesheet (needs internet). Off: a built-in copy of the rules that affect pasted HTML.</Help>
          </label>
        </div>
      </div>

      <div ref={box} className="relative min-h-0 flex-1 overflow-hidden">
        {result.error && (
          <div className="absolute inset-x-4 top-4 z-10 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 shadow">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />{result.error}
          </div>
        )}
        <div className="absolute top-1 left-1/2 -translate-x-1/2" style={{ width: frameW * scale, height: frameH * scale }}>
          <div className="relative origin-top-left" style={{ width: frameW, height: frameH, transform: `scale(${scale})` }}>
            <iframe ref={iframe} title="Component preview" srcDoc={srcDoc}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              className={cx('size-full rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,.08),0_8px_30px_rgba(0,0,0,.06)] transition-opacity', ready ? 'opacity-100' : 'opacity-0')} />
            {(['left', 'right'] as const).map((side) => (
              <div key={side} role="separator" aria-label="Resize preview" onPointerDown={(e) => startDrag(e, side === 'right' ? 1 : -1)}
                className={cx('group absolute top-0 flex h-full w-4 cursor-ew-resize items-center justify-center', side === 'right' ? '-right-4' : '-left-4')}
                style={{ transform: `scale(${1 / scale}, 1)` }}>
                <span className="h-12 w-1 rounded-full bg-zinc-300 transition group-hover:h-20 group-hover:bg-sky-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
