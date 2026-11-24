import { useEffect, useState, type ReactNode } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Popover from '@radix-ui/react-popover';
import { ChevronRight, Copy, GripVertical, Plus, Trash2, Link2 } from 'lucide-react';
import type { BlocksField, Field, ListField } from '../../lib/types';
import { useStore } from '../../store';
import { getIn } from '../../lib/path';
import { plainText } from '../../lib/rich';
import { SWATCHES } from '../../theme/theme';
import { cx, Help, inputCls, Label, Segmented, Slider, Switch, Tip } from '../ui';
import { RichText } from './RichText';
import { ImageInput } from './ImageInput';

const rel = (full: string) => full.replace(/^props\./, '');

/** Renders a set of fields for one object (props, common, or a list item). */
export function FieldGroup({ fields, base, tab }: { fields: Field[]; base: string; tab?: string }) {
  const parent = useStore((s) => getIn(s.doc, base));
  return (
    <div className="space-y-4">
      {fields
        .filter((f) => !tab || (f.tab ?? 'content') === tab)
        .filter((f) => !f.showIf || f.showIf(parent ?? {}))
        .map((f) => <FieldControl key={f.key} field={f} path={`${base}.${f.key}`} />)}
    </div>
  );
}

function FieldControl({ field, path }: { field: Field; path: string }) {
  const value = useStore((s) => getIn(s.doc, path));
  const setValue = useStore((s) => s.setValue);
  const set = (v: any) => setValue(path, v);
  const selected = useStore((s) => s.selected);
  const focusNonce = useStore((s) => s.focusNonce);
  const isSel = selected === rel(path);
  const id = `f-${path}`;
  const [autoFocusRich, setAutoFocusRich] = useState(false);

  useEffect(() => {
    if (!isSel || !focusNonce) return;
    if (field.type === 'richtext') setAutoFocusRich(true);
  }, [isSel, focusNonce, field.type]);

  if (field.type === 'list') return <ListControl field={field} path={path} />;
  if (field.type === 'blocks') return <BlocksControl field={field} path={path} />;

  let control: ReactNode;
  switch (field.type) {
    case 'text':
      control = field.multiline
        ? <textarea id={id} rows={3} className={cx(inputCls, 'resize-y')} value={value ?? ''} placeholder={field.placeholder} onChange={(e) => set(e.target.value)} />
        : <input id={id} className={inputCls} value={value ?? ''} placeholder={field.placeholder} onChange={(e) => set(e.target.value)} />;
      break;
    case 'url':
      control = (
        <div className="relative">
          <Link2 className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400" />
          <input id={id} className={cx(inputCls, 'pl-8')} value={value ?? ''} placeholder={field.placeholder ?? 'https://www.sfu.ca/siat/…'} onChange={(e) => set(e.target.value.trim())} />
        </div>
      );
      break;
    case 'richtext':
      control = <RichText value={value ?? ''} onChange={set} autoFocus={autoFocusRich} />;
      break;
    case 'image':
      control = <ImageInput id={id} value={value} onChange={set} />;
      break;
    case 'color':
      control = <ColorInput value={value ?? ''} onChange={set} allowAuto={field.allowAuto} />;
      break;
    case 'select': {
      const short = field.options.length <= 4 && field.options.every((o) => o.label.length <= 12);
      control = short
        ? <Segmented value={String(value)} options={field.options} onChange={set} />
        : (
          <select id={id} className={cx(inputCls, 'cursor-pointer')} value={String(value)} onChange={(e) => set(e.target.value)}>
            {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      break;
    }
    case 'number':
      control = <Slider value={Number(value ?? field.min)} min={field.min} max={field.max} step={field.step} unit={field.unit} onChange={set} />;
      break;
    case 'toggle':
      return (
        <div data-field-path={rel(path)} className={cx('flex items-center justify-between gap-3 rounded-md', isSel && 'ring-2 ring-sky-500 ring-offset-4')}>
          <div className="flex items-center gap-1">
            <label htmlFor={id} className="text-xs font-medium text-zinc-600">{field.label}</label>
            {field.help && <Help>{field.help}</Help>}
          </div>
          <Switch id={id} checked={!!value} onChange={set} />
        </div>
      );
  }
  return (
    <div data-field-path={rel(path)} className={cx('rounded-md transition', isSel && 'ring-2 ring-sky-500 ring-offset-4')}>
      <Label htmlFor={id} help={field.help}>{field.label}</Label>
      {control}
    </div>
  );
}

function ColorInput({ value, onChange, allowAuto }: { value: string; onChange: (v: string) => void; allowAuto?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {allowAuto && (
        <button type="button" onClick={() => onChange('')} aria-pressed={!value}
          className={cx('h-7 rounded-md border px-2 text-[11px] font-medium', !value ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50')}>Auto</button>
      )}
      {SWATCHES.map((s) => (
        <Tip key={s.value} label={s.name}>
          <button type="button" aria-label={s.name} onClick={() => onChange(s.value)}
            className={cx('size-7 rounded-md border border-black/10 transition hover:scale-110', value === s.value && 'ring-2 ring-sky-500 ring-offset-1')} style={{ background: s.value }} />
        </Tip>
      ))}
      <Tip label="Custom colour">
        <label className={cx('relative size-7 cursor-pointer overflow-hidden rounded-md border border-black/10 bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]', value && !SWATCHES.some((s) => s.value === value) && 'ring-2 ring-sky-500 ring-offset-1')}>
          <input type="color" value={value || '#cc0633'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
      </Tip>
    </div>
  );
}

/* ---------------------------- Sortable lists ---------------------------- */

function useListDnd(path: string) {
  const moveItem = useStore((s) => s.moveItem);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const items: any[] = useStore((s) => getIn(s.doc, path)) ?? [];
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = items.findIndex((i) => i._id === e.active.id);
    const to = items.findIndex((i) => i._id === e.over!.id);
    if (from >= 0 && to >= 0) moveItem(path, from, to);
  };
  return { sensors, items, onDragEnd };
}

function useOpenState(path: string) {
  const selected = useStore((s) => s.selected);
  const focusNonce = useStore((s) => s.focusNonce);
  const [open, setOpen] = useState<number | null>(null);
  const r = rel(path);
  useEffect(() => {
    const m = selected && new RegExp(`^${r.replace(/\./g, '\\.')}\\.(\\d+)`).exec(selected);
    if (m) setOpen(Number(m[1]));
  }, [selected, focusNonce, r]);
  return [open, setOpen] as const;
}

function ListControl({ field, path }: { field: ListField; path: string }) {
  const { sensors, items, onDragEnd } = useListDnd(path);
  const [open, setOpen] = useOpenState(path);
  const addItem = useStore((s) => s.addItem);
  const canAdd = !field.max || items.length < field.max;
  return (
    <div>
      <Label help={field.help}>{field.label} <span className="text-zinc-400">· {items.length}</span></Label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {items.map((item, i) => (
              <SortableRow key={item._id} id={item._id} path={path} index={i} count={items.length} min={field.min ?? 0}
                title={rowTitle(item, field.titleKey) || `${cap(field.itemLabel)} ${i + 1}`}
                thumb={field.thumbKey ? item[field.thumbKey]?.src : undefined}
                open={open === i} onToggle={() => setOpen(open === i ? null : i)}>
                <FieldGroup fields={field.itemFields} base={`${path}.${i}`} />
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {canAdd && (
        <button type="button" onClick={() => { addItem(path, field.newItem(items.length)); setOpen(items.length); }}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-50">
          <Plus className="size-3.5" /> Add {field.itemLabel}
        </button>
      )}
    </div>
  );
}

function BlocksControl({ field, path }: { field: BlocksField; path: string }) {
  const { sensors, items, onDragEnd } = useListDnd(path);
  const [open, setOpen] = useOpenState(path);
  const addItem = useStore((s) => s.addItem);
  const [menu, setMenu] = useState(false);
  return (
    <div>
      <Label help="Drag to reorder here or in the preview. Set each block's width to place blocks side by side.">{field.label}</Label>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {items.map((b, i) => {
              const bt = field.blockTypes[b.type];
              if (!bt) return null;
              const Icon = bt.icon;
              return (
                <SortableRow key={b._id} id={b._id} path={path} index={i} count={items.length} min={0}
                  title={blockSummary(b) || bt.label} icon={<Icon className="size-3.5" />}
                  badge={b.width && b.width !== '100' ? widthLabel(b.width) : undefined}
                  thumb={b.image?.src}
                  open={open === i} onToggle={() => setOpen(open === i ? null : i)}>
                  <FieldGroup fields={bt.fields} base={`${path}.${i}`} />
                </SortableRow>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      <Popover.Root open={menu} onOpenChange={setMenu}>
        <Popover.Trigger asChild>
          <button type="button" className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-50">
            <Plus className="size-3.5" /> Add block
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content sideOffset={6} className="z-50 grid w-64 grid-cols-4 gap-1 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl">
            {Object.entries(field.blockTypes).map(([k, bt]) => {
              const Icon = bt.icon;
              return (
                <button key={k} type="button" onClick={() => { addItem(path, bt.create()); setOpen(items.length); setMenu(false); }}
                  className="flex flex-col items-center gap-1 rounded-md p-2 text-[11px] text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                  <Icon className="size-4" />{bt.label}
                </button>
              );
            })}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function SortableRow({ id, path, index, count, min, title, thumb, icon, badge, open, onToggle, children }: {
  id: string; path: string; index: number; count: number; min: number; title: string; thumb?: string; icon?: ReactNode; badge?: string;
  open: boolean; onToggle: () => void; children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const removeItem = useStore((s) => s.removeItem);
  const duplicateItem = useStore((s) => s.duplicateItem);
  const select = useStore((s) => s.select);
  const selected = useStore((s) => s.selected);
  const r = `${rel(path)}.${index}`;
  const isSel = !!selected && (selected === r || selected.startsWith(`${r}.`));

  useEffect(() => {
    if (open) document.querySelector(`[data-field-path="${r}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [open, r]);

  return (
    <div ref={setNodeRef} data-field-path={r}
      style={{ transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 10 : undefined }}
      className={cx('rounded-lg border bg-white', isDragging ? 'border-sky-400 shadow-lg' : isSel ? 'border-sky-400' : 'border-zinc-200')}>
      <div className="flex items-center gap-1.5 py-1 pr-1 pl-0.5">
        <button type="button" aria-label="Drag to reorder" {...attributes} {...listeners}
          className="flex h-8 w-5 cursor-grab touch-none items-center justify-center rounded text-zinc-400 hover:text-zinc-700 active:cursor-grabbing">
          <GripVertical className="size-3.5" />
        </button>
        <button type="button" onClick={() => { onToggle(); select(r); }} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          {thumb ? <img src={thumb} alt="" className="size-7 shrink-0 rounded object-cover" /> : icon ? <span className="flex size-7 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-500">{icon}</span> : null}
          <span className="min-w-0 flex-1 truncate text-sm text-zinc-800">{title}</span>
          {badge && <span className="rounded bg-zinc-100 px-1.5 text-[10px] font-medium text-zinc-500">{badge}</span>}
          <ChevronRight className={cx('size-4 shrink-0 text-zinc-400 transition', open && 'rotate-90')} />
        </button>
        <Tip label="Duplicate"><button type="button" aria-label="Duplicate" onClick={() => duplicateItem(path, index)} className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"><Copy className="size-3.5" /></button></Tip>
        <Tip label="Delete"><button type="button" aria-label="Delete" disabled={count <= min} onClick={() => removeItem(path, index)} className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"><Trash2 className="size-3.5" /></button></Tip>
      </div>
      {open && <div className="border-t border-zinc-100 px-3 pt-3 pb-4">{children}</div>}
    </div>
  );
}

function rowTitle(item: any, key?: string): string {
  if (!key) return '';
  const v = item[key];
  return typeof v === 'string' ? plainText(v).slice(0, 60) : '';
}
function blockSummary(b: any): string {
  const s = b.text || b.label || b.caption || (b.html ? plainText(b.html) : '') || b.url || '';
  return String(s).slice(0, 50);
}
function widthLabel(w: string) {
  return ({ '75': '¾', '66': '⅔', '50': '½', '33': '⅓', '25': '¼' } as Record<string, string>)[w] ?? w;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
