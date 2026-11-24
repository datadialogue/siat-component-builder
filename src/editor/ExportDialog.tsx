import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check, Download, ExternalLink, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { renderDoc } from '../export/render';
import { lintForAEM, SFU_RECOMMENDED_CHARS, LARGE_CHARS, type LintIssue } from '../export/lint';
import { SFU_CSS_URL } from './preview/previewDoc';
import { cx, Help, Switch, useCopy } from './ui';

const LS_STATE = 'sfub:includeState';

export function ExportDialog() {
  const open = useStore((s) => s.ui.exportOpen);
  const setUi = useStore((s) => s.setUi);
  const doc = useStore((s) => s.doc);
  const [includeState, setIncludeState] = useState(() => {
    try { return localStorage.getItem(LS_STATE) !== '0'; } catch { return true; }
  });
  const [copied, copy] = useCopy();

  const html = useMemo(() => (open ? renderDoc(doc, { preview: false, includeState }).html : ''), [open, doc, includeState]);
  const issues = useMemo(() => (html ? lintForAEM(html) : []), [html]);
  const len = html.length;
  const errors = issues.filter((i) => i.level === 'error').length;

  const toggleState = (v: boolean) => {
    setIncludeState(v);
    try { localStorage.setItem(LS_STATE, v ? '1' : '0'); } catch { /* ignore */ }
  };

  const fileName = `${(doc.name || doc.component).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.html`;
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = fileName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const testPage = () => {
    const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Test · ${doc.name}</title><link rel="stylesheet" href="${SFU_CSS_URL}"><style>body{padding:24px}.page-content__main{max-width:980px;margin:0 auto}</style></head><body><section class="main"><div class="main__content"><div class="main__content--content"><div class="page-content"><div class="page-content__main"><div class="html section">\n${html}\n</div></div></div></div></div></section></body></html>`;
    window.open(URL.createObjectURL(new Blob([page], { type: 'text/html' })), '_blank');
  };

  const pct = Math.min(100, (len / LARGE_CHARS) * 100);
  const meterColor = len <= SFU_RECOMMENDED_CHARS ? 'bg-emerald-500' : len <= 20000 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <Dialog.Root open={open} onOpenChange={(o) => setUi({ exportOpen: o })}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-2 z-50 flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(760px,92vh)] sm:w-[min(960px,94vw)] sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-3">
            <Dialog.Title className="text-base font-semibold text-zinc-900">Export for AEM</Dialog.Title>
            <Help side="bottom">
              <ol className="list-decimal space-y-1 pl-4">
                <li>Copy the HTML.</li>
                <li>In AEM, drag an <b>HTML</b> component onto the page and click Edit.</li>
                <li>Paste, save, then preview the page and refresh.</li>
              </ol>
            </Help>
            <Dialog.Description className="sr-only">Copy the generated HTML into an AEM HTML component.</Dialog.Description>
            <Dialog.Close className="ml-auto rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100" aria-label="Close"><X className="size-4" /></Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <div className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-zinc-200 p-5 md:w-72 md:border-r md:border-b-0">
              <div>
                <div className="mb-1.5 flex items-baseline justify-between text-xs">
                  <span className="font-medium text-zinc-600">Size</span>
                  <span className="text-zinc-900 tabular-nums">{len.toLocaleString()} chars</span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div className={cx('h-full rounded-full transition-all', meterColor)} style={{ width: `${pct}%` }} />
                  <div className="absolute top-0 h-full w-px bg-zinc-400" style={{ left: `${(SFU_RECOMMENDED_CHARS / LARGE_CHARS) * 100}%` }} title="SFU recommended 4,000" />
                </div>
              </div>

              <label className="flex items-center justify-between gap-2 text-xs font-medium text-zinc-600">
                <span className="flex items-center gap-1">Include edit data
                  <Help>Adds a hidden comment so you can paste this snippet back into the builder (Import) and keep editing. Turn off for the smallest output.</Help>
                </span>
                <Switch checked={includeState} onChange={toggleState} />
              </label>

              <div className="space-y-1.5">
                {issues.length === 0 && <IssueRow issue={{ level: 'info', code: 'ok', message: 'Ready to paste.' }} ok />}
                {issues.map((i) => <IssueRow key={i.code} issue={i} />)}
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <button type="button" onClick={() => copy(html)}
                  className={cx('flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition', copied ? 'bg-emerald-600' : 'bg-[#cc0633] hover:bg-[#a6192e]')}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? 'Copied' : errors ? 'Copy anyway' : 'Copy HTML'}
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={download} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"><Download className="size-3.5" />.html</button>
                  <button type="button" onClick={testPage} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"><ExternalLink className="size-3.5" />Test page</button>
                </div>
              </div>
            </div>

            <pre className="min-h-0 flex-1 overflow-auto bg-zinc-950 p-4 font-mono text-[11.5px] leading-relaxed break-all whitespace-pre-wrap text-zinc-300 select-all">{html}</pre>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function IssueRow({ issue, ok }: { issue: LintIssue; ok?: boolean }) {
  const I = ok ? CheckCircle2 : issue.level === 'error' ? AlertCircle : issue.level === 'warn' ? AlertTriangle : Info;
  return (
    <div className={cx('flex gap-2 rounded-md px-2.5 py-2 text-xs leading-snug',
      ok ? 'bg-emerald-50 text-emerald-800' : issue.level === 'error' ? 'bg-red-50 text-red-800' : issue.level === 'warn' ? 'bg-amber-50 text-amber-900' : 'bg-zinc-50 text-zinc-600')}>
      <I className="mt-px size-3.5 shrink-0" />
      <span>{issue.message}</span>
    </div>
  );
}
