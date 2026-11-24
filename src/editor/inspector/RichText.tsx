import { useEffect, useState } from 'react';
import { useEditor, EditorContent, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import * as Popover from '@radix-ui/react-popover';
import {
  Bold, Italic, Underline, Link2, Heading2, Heading3, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  Palette, RemoveFormatting, Unlink,
} from 'lucide-react';
import { SWATCHES } from '../../theme/theme';
import { cx, inputCls, Tip } from '../ui';

export function RichText({ value, onChange, autoFocus }: { value: string; onChange: (html: string) => void; autoFocus?: boolean }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
        code: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https', HTMLAttributes: { rel: null, target: null, class: null } },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: value,
    editorProps: { attributes: { class: 'rte min-h-24 px-3 py-2 text-sm outline-none' } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  });

  // Sync external changes (undo, preset, inline edits) without fighting the cursor.
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if ((editor.isEmpty ? '' : editor.getHTML()) !== value) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  useEffect(() => {
    if (autoFocus && editor) editor.commands.focus('end');
  }, [autoFocus, editor]);

  if (!editor) return null;
  return (
    <div className="overflow-hidden rounded-md border border-zinc-200 bg-white focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), link: e.isActive('link'),
      h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }),
      ul: e.isActive('bulletList'), ol: e.isActive('orderedList'), quote: e.isActive('blockquote'),
      center: e.isActive({ textAlign: 'center' }), right: e.isActive({ textAlign: 'right' }),
      color: (e.getAttributes('textStyle').color as string | undefined) ?? '',
    }),
  });
  const c = () => editor.chain().focus();
  const B = ({ on, label, run, children }: { on?: boolean; label: string; run: () => void; children: React.ReactNode }) => (
    <Tip label={label}>
      <button type="button" aria-label={label} aria-pressed={!!on} onMouseDown={(e) => e.preventDefault()} onClick={run}
        className={cx('inline-flex size-7 items-center justify-center rounded text-zinc-600 hover:bg-zinc-100', on && 'bg-zinc-900 text-white hover:bg-zinc-800')}>
        {children}
      </button>
    </Tip>
  );
  const ic = 'size-3.5';
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-100 bg-zinc-50/70 px-1 py-1">
      <B label="Bold" on={s.bold} run={() => c().toggleBold().run()}><Bold className={ic} /></B>
      <B label="Italic" on={s.italic} run={() => c().toggleItalic().run()}><Italic className={ic} /></B>
      <B label="Underline" on={s.underline} run={() => c().toggleUnderline().run()}><Underline className={ic} /></B>
      <LinkButton editor={editor} active={s.link} />
      <span className="mx-0.5 h-4 w-px bg-zinc-200" />
      <B label="Heading" on={s.h2} run={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className={ic} /></B>
      <B label="Subheading" on={s.h3} run={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className={ic} /></B>
      <B label="Bullet list" on={s.ul} run={() => c().toggleBulletList().run()}><List className={ic} /></B>
      <B label="Numbered list" on={s.ol} run={() => c().toggleOrderedList().run()}><ListOrdered className={ic} /></B>
      <B label="Quote" on={s.quote} run={() => c().toggleBlockquote().run()}><Quote className={ic} /></B>
      <span className="mx-0.5 h-4 w-px bg-zinc-200" />
      <B label="Align left" on={!s.center && !s.right} run={() => c().setTextAlign('left').run()}><AlignLeft className={ic} /></B>
      <B label="Centre" on={s.center} run={() => c().setTextAlign('center').run()}><AlignCenter className={ic} /></B>
      <B label="Align right" on={s.right} run={() => c().setTextAlign('right').run()}><AlignRight className={ic} /></B>
      <ColorButton editor={editor} color={s.color} />
      <B label="Clear formatting" run={() => c().unsetAllMarks().clearNodes().run()}><RemoveFormatting className={ic} /></B>
    </div>
  );
}

function LinkButton({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const apply = () => {
    const u = url.trim();
    if (!u) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: u }).run();
    setOpen(false);
  };
  return (
    <Popover.Root open={open} onOpenChange={(o) => { setOpen(o); if (o) setUrl(editor.getAttributes('link').href ?? ''); }}>
      <Tip label="Link">
        <Popover.Trigger asChild>
          <button type="button" aria-label="Link" onMouseDown={(e) => e.preventDefault()}
            className={cx('inline-flex size-7 items-center justify-center rounded text-zinc-600 hover:bg-zinc-100', active && 'bg-zinc-900 text-white hover:bg-zinc-800')}>
            <Link2 className="size-3.5" />
          </button>
        </Popover.Trigger>
      </Tip>
      <Popover.Portal>
        <Popover.Content sideOffset={6} className="z-50 flex w-72 gap-1.5 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl">
          <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && apply()}
            placeholder="https://www.sfu.ca/siat/…" className={inputCls} />
          {active && (
            <button type="button" aria-label="Remove link" onClick={() => { editor.chain().focus().unsetLink().run(); setOpen(false); }} className="rounded-md px-2 text-zinc-500 hover:bg-zinc-100"><Unlink className="size-4" /></button>
          )}
          <button type="button" onClick={apply} className="rounded-md bg-zinc-900 px-3 text-xs font-medium text-white">OK</button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ColorButton({ editor, color }: { editor: Editor; color: string }) {
  return (
    <Popover.Root>
      <Tip label="Text colour">
        <Popover.Trigger asChild>
          <button type="button" aria-label="Text colour" onMouseDown={(e) => e.preventDefault()} className="relative inline-flex size-7 items-center justify-center rounded text-zinc-600 hover:bg-zinc-100">
            <Palette className="size-3.5" />
            <span className="absolute bottom-1 left-1.5 right-1.5 h-0.5 rounded" style={{ background: color || 'transparent' }} />
          </button>
        </Popover.Trigger>
      </Tip>
      <Popover.Portal>
        <Popover.Content sideOffset={6} className="z-50 grid grid-cols-5 gap-1.5 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl">
          <button type="button" title="Default" onClick={() => editor.chain().focus().unsetColor().run()} className="size-6 rounded border border-zinc-300 bg-[linear-gradient(135deg,#fff_45%,#cc0633_45%,#cc0633_55%,#fff_55%)]" />
          {SWATCHES.map((sw) => (
            <button key={sw.value} type="button" title={sw.name} onClick={() => editor.chain().focus().setColor(sw.value).run()}
              className={cx('size-6 rounded border border-zinc-200', color === sw.value && 'ring-2 ring-sky-500 ring-offset-1')} style={{ background: sw.value }} />
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
