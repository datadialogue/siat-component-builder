import { useEffect, useMemo, useRef, useState } from 'react';
import type { Doc } from '../lib/types';
import { renderDoc } from '../export/render';
import shim from '../editor/preview/clf4-shim.css?raw';

const STAGE_H = 560;

/**
 * Live, read-only preview of an exported snippet: the exact export HTML (with its
 * runtime script) inside SFU page wrappers and the CLF4 shim. Mounts only when
 * scrolled near.
 *
 * - default: sizes itself to its content.
 * - stage: fixed height with scroll room above and below, for scroll-driven
 *   effects (an auto-height frame never scrolls, so they would never play).
 */
export function ExampleFrame({ doc, stage = false }: { doc: Doc; stage?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [near, setNear] = useState(false);
  const [h, setH] = useState(stage ? STAGE_H : 320);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const srcDoc = useMemo(() => {
    if (!near) return '';
    const { html, error } = renderDoc(doc, { preview: false });
    const body = error ? `<p style="color:#b00;font:14px sans-serif;">${error}</p>` : html;
    const spacer = (t: string) => `<div style="height:${Math.round(STAGE_H * 0.75)}px;display:flex;align-items:${t === 'top' ? 'flex-end' : 'flex-start'};justify-content:center;padding:12px;color:#a1a1aa;font:12px system-ui,sans-serif;">${t === 'top' ? 'Scroll ↓' : '↑'}</div>`;
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${shim}</style>
<style>html{overflow:${stage ? 'auto' : 'hidden'}}body{padding:16px;background:#fff}.main__content,.main__content--content,.page-content,.page-content__main{display:block;padding:0;margin:0}</style></head>
<body>${stage ? spacer('top') : ''}<section class="main"><div class="main__content"><div class="main__content--content"><div class="page-content"><div class="page-content__main"><div class="html section">${body}</div></div></div></div></div></section>${stage ? spacer('bottom') : ''}</body></html>`;
  }, [doc, near, stage]);

  useEffect(() => {
    const f = frame.current;
    if (!f || !srcDoc || stage) return;
    let ro: ResizeObserver | undefined;
    const onLoad = () => {
      const d = f.contentDocument;
      const main = d?.querySelector('section.main') as HTMLElement | null;
      if (!d || !main) return;
      const measure = () => setH(Math.ceil(main.getBoundingClientRect().height) + 32);
      measure();
      ro = new ResizeObserver(measure);
      ro.observe(main);
    };
    f.addEventListener('load', onLoad);
    return () => { f.removeEventListener('load', onLoad); ro?.disconnect(); };
  }, [srcDoc, stage]);

  // Start a stage scrolled just above the component so the effect is ready to play.
  useEffect(() => {
    const f = frame.current;
    if (!f || !srcDoc || !stage) return;
    const onLoad = () => f.contentWindow?.scrollTo(0, Math.round(STAGE_H * 0.35));
    f.addEventListener('load', onLoad);
    return () => f.removeEventListener('load', onLoad);
  }, [srcDoc, stage]);

  return (
    <div ref={host} className="overflow-hidden rounded-lg bg-white ring-1 ring-zinc-200" style={{ minHeight: 120 }}>
      {near && (
        <iframe ref={frame} title="Example" srcDoc={srcDoc}
          sandbox="allow-scripts allow-same-origin allow-popups"
          className="block w-full" style={{ height: stage ? STAGE_H : h }} />
      )}
    </div>
  );
}
