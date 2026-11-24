import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Monitor, Smartphone, SquarePen } from 'lucide-react';
import { getComponent } from '../components/registry';
import { renderDoc } from '../export/render';
import { newInstanceId } from '../export/state';
import { useStore } from '../store';
import shim from '../editor/preview/clf4-shim.css?raw';
import { cx, Help, Tip } from '../editor/ui';
import { exampleDoc } from '../ideas/resolve';
import { HOMEPAGE, type MockSection } from './homepage';
import { SHOWCASE } from './showcase';

const PAGES = {
  home: { label: 'Homepage', prefix: 'mk', sections: HOMEPAGE, help: 'An example homepage built from the real sfu.ca/siat content.' },
  showcase: { label: 'Showcase', prefix: 'sc', sections: SHOWCASE, help: 'The Project Showcase component in each layout, with real projects from sfu.ca/siat/showcase. A real page would use one.' },
} as const;
type PageKey = keyof typeof PAGES;
const LS_PAGE = 'sfub:mockup:page';
const readPage = (): PageKey => { try { const v = localStorage.getItem(LS_PAGE); return v === 'showcase' ? 'showcase' : 'home'; } catch { return 'home'; } };

const LS_STATE = 'sfub:includeState';
const includeState = () => { try { return localStorage.getItem(LS_STATE) !== '0'; } catch { return true; } };

/** Mockup-only chrome inside the frame (never exported). */
const FRAME_CSS = `
html{overflow:auto;scroll-behavior:smooth}
body{background:#fff;margin:0}
.mk-sfu{display:flex;align-items:center;gap:14px;padding:14px 24px;border-bottom:1px solid #e6e7e8;font:600 13px system-ui,sans-serif;color:#54585a}
.mk-sfu b{font:900 22px/1 Arial,sans-serif;color:#cc0633;letter-spacing:-.02em}
.mk-dept{background:#a6192e;color:#fff;padding:14px 24px;font:800 20px/1.2 November,Arial,sans-serif;font-stretch:83%}
.mk-note{font:500 11px system-ui,sans-serif;color:#a1a1aa;text-align:center;padding:6px 0;border-bottom:1px dashed #e4e4e7}
.page-content__main{max-width:1200px;margin:0 auto;padding:8px 24px 64px}
.mk{position:relative;border-radius:4px;transition:outline-color .15s}
.mk{outline:2px dashed transparent;outline-offset:4px}
.mk:hover,.mk.mk-on{outline-color:#0b78e6}
.mk-bar{position:absolute;top:8px;right:8px;z-index:9999;display:flex;align-items:center;gap:4px;padding:4px;border-radius:10px;background:#18181b;box-shadow:0 6px 20px rgba(0,0,0,.25);opacity:0;transform:translateY(4px);transition:opacity .15s,transform .15s;pointer-events:none}
.mk:hover .mk-bar,.mk:focus-within .mk-bar,.mk.mk-on .mk-bar{opacity:1;transform:none;pointer-events:auto}
.mk-bar span{font:600 11px system-ui,sans-serif;color:#a1a1aa;padding:0 6px}
.mk-bar button{all:unset;cursor:pointer;font:600 12px system-ui,sans-serif;color:#fff;padding:5px 9px;border-radius:7px;background:#3f3f46}
.mk-bar button:hover,.mk-bar button:focus-visible{background:#cc0633}
.mk-foot{font:500 12px system-ui,sans-serif;color:#a1a1aa;text-align:center;padding:24px;border-top:1px solid #e6e7e8}
`;

const FRAME_JS = `
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.mk-bar button');
  if (!b) return;
  e.preventDefault();
  var i = +b.getAttribute('data-i'), act = b.getAttribute('data-act');
  if (act === 'copy') {
    var html = (parent.__sfubMock || [])[i] || '';
    var done = function () { var t = b.textContent; b.textContent = 'Copied ✓'; setTimeout(function () { b.textContent = t; }, 1400); parent.postMessage({ __mk: 1, type: 'copied', i: i }, '*'); };
    var fallback = function () { var ta = document.createElement('textarea'); ta.value = html; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(html).then(done, fallback); else fallback();
  } else parent.postMessage({ __mk: 1, type: act, i: i }, '*');
});
document.addEventListener('scroll', function () {
  var secs = document.querySelectorAll('.mk'), best = 0, top = innerHeight * 0.35;
  for (var k = 0; k < secs.length; k++) if (secs[k].getBoundingClientRect().top < top) best = k;
  parent.postMessage({ __mk: 1, type: 'active', i: best }, '*');
}, { passive: true });
`;

export function Mockup() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [phone, setPhone] = useState(false);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<number | null>(null);
  const [page, setPageState] = useState<PageKey>(readPage);
  const pg = PAGES[page];
  const sections: readonly MockSection[] = pg.sections;
  const setPage = (k: PageKey) => {
    setPageState(k); setActive(0);
    try { localStorage.setItem(LS_PAGE, k); } catch { /* ignore */ }
  };

  const docs = useMemo(() => sections.map((s, i) => exampleDoc(s, 'photos', `${pg.prefix}${i + 1}`)), [sections, pg.prefix]);
  const exports = useMemo(() => docs.map((d) => renderDoc(d, { preview: false, includeState: includeState() }).html), [docs]);

  const srcDoc = useMemo(() => {
    const body = docs.map((d, i) => {
      const def = getComponent(d.component)!;
      const html = renderDoc(d, { preview: false }).html;
      return `<div class="mk" id="mk-${i}" data-i="${i}"><div class="mk-bar"><span>${i + 1} · ${def.name}</span><button type="button" data-act="copy" data-i="${i}">Copy HTML</button><button type="button" data-act="edit" data-i="${i}">Edit</button></div>${html}</div>`;
    }).join('\n');
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${shim}</style><style>${FRAME_CSS}</style></head>
<body><div class="mk-sfu"><b>SFU</b>SIMON FRASER UNIVERSITY</div><div class="mk-dept">School of Interactive Arts &amp; Technology</div><div class="mk-note">SFU page header above is not part of the snippets</div>
<section class="main"><div class="main__content"><div class="main__content--content"><div class="page-content"><div class="page-content__main">${body}</div></div></div></div></section>
<div class="mk-foot">End of mockup · ${docs.length} HTML components</div><script>${FRAME_JS}</script></body></html>`;
  }, [docs]);

  // Hand the export HTML to the frame (copy happens inside it, on the user's click).
  useEffect(() => { (window as any).__sfubMock = exports; }, [exports]);

  const flash = (i: number) => { setCopied(i); setTimeout(() => setCopied((c) => (c === i ? null : c)), 1400); };

  const edit = (i: number) => {
    const { sections: list, label } = pageRef.current;
    const s = list[i];
    const st = useStore.getState();
    st.loadComponent(s.component);
    st.loadDoc({ ...exampleDoc(s, 'photos', newInstanceId()), name: `${label} · ${s.label}` });
    window.location.hash = '';
  };
  // The frame's message listener is bound once; it reads the current page from here.
  const pageRef = useRef(pg);
  pageRef.current = pg;

  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.__mk) return;
      const { type, i } = e.data;
      if (type === 'copied') flash(i);
      else if (type === 'edit') edit(i);
      else if (type === 'active') setActive(i);
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);

  const jump = (i: number) => {
    const d = frame.current?.contentDocument;
    const el = d?.getElementById(`mk-${i}`);
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    d!.querySelectorAll('.mk-on').forEach((n) => n.classList.remove('mk-on'));
    el.classList.add('mk-on');
    setTimeout(() => el.classList.remove('mk-on'), 1600);
  };

  const copyOne = async (i: number) => {
    try { await navigator.clipboard.writeText(exports[i]); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = exports[i];
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    flash(i);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-100 md:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <h1 className="sr-only">SIAT mockups</h1>
            <div className="flex rounded-lg bg-zinc-100 p-0.5" role="group" aria-label="Page">
              {(Object.keys(PAGES) as PageKey[]).map((k) => (
                <button key={k} type="button" aria-pressed={page === k} onClick={() => setPage(k)}
                  className={cx('rounded-md px-2.5 py-1 text-xs font-medium transition', page === k ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800')}>
                  {PAGES[k].label}
                </button>
              ))}
            </div>
            <Help side="bottom">{pg.help} Each band is its own AEM HTML component: hover it to copy its HTML, then paste each one into its own HTML component, in order.</Help>
          </div>
          <div className="ml-auto flex rounded-lg bg-zinc-100 p-0.5">
            {([['Desktop', false, Monitor], ['Phone', true, Smartphone]] as const).map(([label, v, I]) => (
              <Tip key={label} label={label}>
                <button type="button" aria-label={label} aria-pressed={phone === v} onClick={() => setPhone(v)}
                  className={cx('inline-flex size-7 items-center justify-center rounded-md transition', phone === v ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800')}>
                  <I className="size-3.5" />
                </button>
              </Tip>
            ))}
          </div>
        </div>
        <div className="min-h-0 flex-1 p-2 sm:p-3">
          <iframe ref={frame} title={`SIAT ${pg.label.toLowerCase()} mockup`} srcDoc={srcDoc}
            sandbox="allow-scripts allow-same-origin allow-popups" allow="clipboard-write"
            className={cx('mx-auto block h-full rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,.08),0_8px_30px_rgba(0,0,0,.06)] transition-[max-width] duration-300', phone ? 'w-full max-w-97.5' : 'w-full max-w-none')} />
        </div>
      </div>

      <aside className="max-h-[40%] shrink-0 overflow-y-auto border-t border-zinc-200 bg-white md:max-h-none md:w-72 md:border-t-0 md:border-l">
        <div className="sticky top-0 flex items-center gap-1 border-b border-zinc-200 bg-white px-4 py-2.5">
          <h2 className="text-sm font-semibold text-zinc-900">Snippets</h2>
          <span className="text-xs text-zinc-400">· {sections.length}</span>
          <Help side="left">One AEM HTML component each. Copy and paste them in this order.</Help>
        </div>
        <div className="p-2" role="list">
          {sections.map((s: MockSection, i) => {
            const def = getComponent(s.component)!;
            const Icon = def.icon;
            return (
              <div key={i} role="listitem"
                className={cx('group flex items-center gap-2 rounded-lg px-2 py-1.5 transition', active === i ? 'bg-zinc-100' : 'hover:bg-zinc-50')}>
                <button type="button" onClick={() => jump(i)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                  <span className="w-4 shrink-0 text-right text-[11px] font-semibold text-zinc-400 tabular-nums">{i + 1}</span>
                  <span className={cx('flex size-7 shrink-0 items-center justify-center rounded-md ring-1', active === i ? 'bg-[#cc0633] text-white ring-[#cc0633]' : 'bg-white text-zinc-600 ring-zinc-200')}>
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-zinc-800">{s.label}</span>
                    <span className="block truncate text-[11px] text-zinc-400">{def.name}</span>
                  </span>
                </button>
                <Tip label="Copy HTML">
                  <button type="button" aria-label={`Copy ${s.label} HTML`} onClick={() => copyOne(i)}
                    className={cx('inline-flex size-7 shrink-0 items-center justify-center rounded-md transition', copied === i ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900')}>
                    {copied === i ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </button>
                </Tip>
                <Tip label="Edit in builder">
                  <button type="button" aria-label={`Edit ${s.label}`} onClick={() => edit(i)}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900">
                    <SquarePen className="size-3.5" />
                  </button>
                </Tip>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
