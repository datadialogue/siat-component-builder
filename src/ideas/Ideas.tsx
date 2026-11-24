import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, ArrowUpRight, Image as ImageIcon, Monitor, Shapes, Smartphone, SquarePen, X } from 'lucide-react';
import { getComponent } from '../components/registry';
import { useStore } from '../store';
import { newInstanceId } from '../export/state';
import { cx, Help, Segmented } from '../editor/ui';
import { ExampleFrame } from './ExampleFrame';
import { FINDINGS, WEBBY_URL } from './findings';
import { exampleDoc, resolveExample, type Mode } from './resolve';
import type { Example, Finding, Source } from './types';

const KINDS = ['All', 'Order', 'Content', 'Interaction', 'Look'] as const;
const MODE_KEY = 'sfub:ideas:mode';
const shotUrl = (s: Source) => `${import.meta.env.BASE_URL}ideas/${s.shot}`;

function readMode(): Mode {
  try { return localStorage.getItem(MODE_KEY) === 'placeholders' ? 'placeholders' : 'photos'; } catch { return 'photos'; }
}

export function Ideas() {
  const [mode, setModeState] = useState<Mode>(readMode);
  const [kind, setKind] = useState<(typeof KINDS)[number]>('All');
  const [zoom, setZoom] = useState<Source | null>(null);
  const setMode = (m: Mode) => { setModeState(m); try { localStorage.setItem(MODE_KEY, m); } catch { /* ignore */ } };
  const list = FINDINGS.filter((f) => kind === 'All' || f.kind === kind);

  return (
    <div className="h-full overflow-y-auto bg-zinc-50" id="ideas-scroll">
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-semibold text-zinc-900">Ideas</h1>
            <Help side="bottom">Patterns from the Webby “School/University” winners and nominees, 2024–2026, each rebuilt as an AEM-safe SIAT component.</Help>
          </div>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter">
            {KINDS.map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k}
                className={cx('rounded-full px-2.5 py-1 text-xs font-medium transition', kind === k ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100')}>
                {k}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-56">
              <Segmented<Mode> value={mode} onChange={setMode} options={[
                { value: 'photos', label: <span className="inline-flex items-center gap-1"><ImageIcon className="size-3.5" />Photos</span>, title: 'SIAT photos and sample text' },
                { value: 'placeholders', label: <span className="inline-flex items-center gap-1"><Shapes className="size-3.5" />Placeholders</span>, title: 'Numbered placeholders' },
              ]} />
            </div>
            <Help side="bottom">Photos: images from sfu.ca/siat with sample text written for this page. Placeholders: the component’s blank starting content.</Help>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <p className="pt-6 text-xs text-zinc-500">
          {FINDINGS.length} findings from <a href={WEBBY_URL} target="_blank" rel="noreferrer" className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800">17 school sites on the Webby list</a>
        </p>
        {list.map((f) => <FindingSection key={f.id} f={f} n={FINDINGS.indexOf(f) + 1} mode={mode} onZoom={setZoom} />)}
      </div>

      <Dialog.Root open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-zinc-950/80" />
          <Dialog.Content className="fixed inset-3 z-50 flex flex-col items-center justify-center gap-3 outline-none sm:inset-8" aria-describedby={undefined}>
            <Dialog.Title className="sr-only">{zoom?.site}</Dialog.Title>
            {zoom && (
              <>
                <img src={shotUrl(zoom)} alt={`Screenshot of ${zoom.site}`} className="min-h-0 max-w-full flex-1 rounded-lg object-contain shadow-2xl" />
                <div className="flex items-center gap-2">
                  <a href={zoom.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100">
                    {zoom.site}<ArrowUpRight className="size-4" />
                  </a>
                  <Dialog.Close className="inline-flex size-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25" aria-label="Close"><X className="size-4" /></Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function FindingSection({ f, n, mode, onZoom }: { f: Finding; n: number; mode: Mode; onZoom: (s: Source) => void }) {
  const tall = !!f.flow;
  return (
    <section id={`idea-${f.id}`} className="scroll-mt-14 border-b border-zinc-200 py-10 last:border-0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs">
            <span className="font-semibold text-zinc-400 tabular-nums">{String(n).padStart(2, '0')}</span>
            <span className="rounded-full bg-[#cc0633]/8 px-2 py-0.5 font-medium text-[#a6192e]">{f.kind}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{f.title}</h2>
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-zinc-600">{f.text}</p>
          {f.flow && (
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              {f.flow.map((st, i) => (
                <span key={st.label} className="inline-flex items-center gap-1.5">
                  <a href={`#idea-${st.to}`} onClick={(e) => { e.preventDefault(); document.getElementById(`idea-${st.to}`)?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-zinc-800 shadow-sm ring-1 ring-zinc-200 hover:ring-[#cc0633]">
                    {st.label}
                  </a>
                  {i < f.flow!.length - 1 && <ArrowRight className="size-3.5 text-zinc-400" />}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={cx('grid gap-3', tall ? 'grid-cols-3' : f.sources.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
          {f.sources.map((s) => (
            <figure key={s.shot} className="m-0 min-w-0">
              <button type="button" onClick={() => onZoom(s)} className="group block w-full overflow-hidden rounded-lg bg-zinc-200 ring-1 ring-zinc-200 focus-visible:outline-2 focus-visible:outline-sky-600" aria-label={`Enlarge ${s.site} screenshot`}>
                <img src={shotUrl(s)} alt={`Screenshot of ${s.site}`} loading="lazy"
                  className={cx('block w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]', tall ? 'h-72 sm:h-96' : 'aspect-[16/10]')} />
              </button>
              <figcaption className="mt-1.5">
                <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-xs font-medium text-zinc-500 hover:text-[#a6192e]">
                  {s.site}<ArrowUpRight className="size-3" />
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      {f.examples.map((ref) => {
        const ex = resolveExample(ref);
        return ex ? <ExampleBlock key={ref} ex={ex} mode={mode} /> : null;
      })}
    </section>
  );
}

function ExampleBlock({ ex, mode }: { ex: Example; mode: Mode }) {
  const [phone, setPhone] = useState(false);
  const def = getComponent(ex.component)!;
  const id = useMemo(() => newInstanceId(), []);
  const doc = useMemo(() => exampleDoc(ex, mode, id), [ex, mode, id]);
  const Icon = def.icon;

  const open = () => {
    const st = useStore.getState();
    st.loadComponent(ex.component);
    st.loadDoc({ ...exampleDoc(ex, mode, newInstanceId()), name: def.name });
    window.location.hash = '';
  };

  return (
    <div className="mt-6">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
          <Icon className="size-3.5 text-[#cc0633]" />SIAT version · {def.name}
        </span>
        <Help>Inline styles only, no media queries, and it still reads well without JavaScript. Paste the export into an AEM HTML component.</Help>
        <div className="ml-auto flex items-center gap-1">
          <div className="flex rounded-lg bg-zinc-100 p-0.5">
            {([['Desktop', false, Monitor], ['Phone', true, Smartphone]] as const).map(([label, v, I]) => (
              <button key={label} type="button" aria-label={label} title={label} aria-pressed={phone === v} onClick={() => setPhone(v)}
                className={cx('inline-flex size-7 items-center justify-center rounded-md transition', phone === v ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800')}>
                <I className="size-3.5" />
              </button>
            ))}
          </div>
          <button type="button" onClick={open}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#cc0633] px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#a6192e]">
            <SquarePen className="size-3.5" />Open in builder
          </button>
        </div>
      </div>
      <div className={cx('mx-auto transition-[max-width] duration-300', phone ? 'max-w-[392px]' : 'max-w-none')}>
        <ExampleFrame doc={doc} stage={ex.stage} />
      </div>
    </div>
  );
}
