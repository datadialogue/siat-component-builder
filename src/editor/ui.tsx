import { useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { HelpCircle } from 'lucide-react';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

/** Small "?" that opens a short help popover. All UI help lives behind these. */
export function Help({ children, side = 'top' }: { children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" aria-label="Help" className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-sky-600">
          <HelpCircle className="size-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side={side} sideOffset={6} collisionPadding={12}
          className="z-50 max-w-64 rounded-lg bg-zinc-900 px-3 py-2 text-xs leading-relaxed text-white shadow-xl">
          {children}
          <Popover.Arrow className="fill-zinc-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function Tip({ label, children, side = 'bottom' }: { label: string; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  return (
    <Tooltip.Root delayDuration={350}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={side} sideOffset={6} className="z-50 rounded-md bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg">
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function IconButton({ label, onClick, children, active, disabled, className }: {
  label: string; onClick?: () => void; children: ReactNode; active?: boolean; disabled?: boolean; className?: string;
}) {
  return (
    <Tip label={label}>
      <button type="button" aria-label={label} onClick={onClick} disabled={disabled}
        className={cx(
          'inline-flex size-8 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-35 disabled:hover:bg-transparent',
          active && 'bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white',
          className,
        )}>
        {children}
      </button>
    </Tip>
  );
}

export function Label({ children, help, htmlFor }: { children: ReactNode; help?: string; htmlFor?: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-1">
      <label htmlFor={htmlFor} className="text-xs font-medium text-zinc-600">{children}</label>
      {help && <Help>{help}</Help>}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex w-full flex-wrap gap-0.5 rounded-lg bg-zinc-100 p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" title={o.title} onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          className={cx(
            'min-w-0 flex-1 truncate rounded-md px-2 py-1 text-xs font-medium transition',
            value === o.value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800',
          )}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition', checked ? 'bg-[#cc0633]' : 'bg-zinc-300')}>
      <span className={cx('inline-block size-4 rounded-full bg-white shadow transition', checked ? 'translate-x-4.5' : 'translate-x-0.5')} />
    </button>
  );
}

export function Slider({ value, min, max, step = 1, unit, onChange }: {
  value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 flex-1 cursor-pointer accent-[#cc0633]" />
      <div className="flex w-16 items-center rounded-md border border-zinc-200 bg-white px-1.5">
        <input type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent py-1 text-right text-xs outline-none" />
        {unit && <span className="pl-0.5 text-[11px] text-zinc-400">{unit}</span>}
      </div>
    </div>
  );
}

export const inputCls = 'w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20';

/** Copy text with a short "Copied" state. */
export function useCopy(): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);
  return [
    copied,
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    },
  ];
}

/** Read an image file, downscale to ≤1600px and return a JPEG/PNG data URL for preview use. */
export async function fileToDataUrl(file: File, max = 1600): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      return await new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
    }
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}
