#!/usr/bin/env node
/**
 * Scaffold a new builder component:
 *   npm run new:component -- my-thing "My Thing"
 * Creates src/components/my-thing/{index.tsx,runtime.es5.js,README.md}.
 * The registry picks it up automatically; run `npm test` to validate it.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , id, ...nameParts] = process.argv;
if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error('Usage: npm run new:component -- <kebab-id> ["Display Name"]');
  process.exit(1);
}
const name = nameParts.join(' ') || id.replace(/(^|-)(\w)/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase());
const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'components', id);
if (existsSync(root)) {
  console.error(`src/components/${id} already exists`);
  process.exit(1);
}
mkdirSync(root, { recursive: true });

writeFileSync(join(root, 'index.tsx'), `import { Box } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

/*
 * ${name}
 * Rules (see docs/ADDING_A_COMPONENT.md):
 *  - inline styles only (style={{...}}); px/em, never rem; no <style>, no <ul>/<li>, no <h1>
 *  - start from ctx.sx helpers — they undo SFU's CLF4 global CSS
 *  - spread ctx.root('${id}') on the single outer element
 *  - ctx.edit(path,'text'|'rich'|'image') / ctx.item(list,i) make things clickable + draggable in the preview
 *  - ctx.reveal() / ctx.hover() opt elements into the shared entrance animation / hover effect
 */

interface Item { _id?: string; image: ImageValue; title: string; text: string }
interface Props {
  heading: string;
  items: Item[];
  columns: string;
  highlight: boolean;
}

const newItem = (i: number): Item => ({
  image: placeholderImage(i + 1, '4:3'),
  title: \`Item \${i + 1}\`,
  text: 'Short description.',
});

export default defineComponent<Props>({
  id: '${id}',
  name: '${name}',
  category: 'Content',
  description: 'One-line description shown in the library.',
  icon: Box,
  fields: [
    { key: 'heading', type: 'text', label: 'Heading' },
    {
      key: 'items', type: 'list', label: 'Items', itemLabel: 'item', titleKey: 'title', thumbKey: 'image', min: 1, max: 12,
      newItem,
      itemFields: [
        { key: 'image', type: 'image', label: 'Image' },
        { key: 'title', type: 'text', label: 'Title' },
        { key: 'text', type: 'text', label: 'Text', multiline: true },
      ],
    },
    { key: 'columns', type: 'select', label: 'Columns', tab: 'style', options: ['2', '3', '4'].map((v) => ({ value: v, label: v })) },
    { key: 'highlight', type: 'toggle', label: 'Highlight on click', tab: 'behaviour', help: 'Example behaviour handled by runtime.es5.js.' },
  ],
  defaults: {
    heading: '${name}',
    items: [newItem(0), newItem(1), newItem(2)],
    columns: '3',
    highlight: true,
  },
  presets: [
    { name: 'Default', props: { columns: '3' } },
    { name: 'Grey panel', props: { columns: '2' }, common: { theme: 'grey' } },
  ],
  // Only ship JS when a behaviour needs it.
  runtime: (p) => (p.highlight ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    return (
      <div {...ctx.root('${id}', { padding: t.bg === 'transparent' ? 0 : '24px' })} data-sfub-accent={t.accent}>
        {p.heading && <h2 {...ctx.edit('heading', 'text')} style={sx.heading(30, { margin: '0 0 20px 0' })}>{p.heading}</h2>}
        <div style={sx.grid(Number(p.columns) || 3, 220, 24)}>
          {p.items.map((it, i) => (
            <div key={it._id ?? i} className="sfux-item" tabIndex={0} {...ctx.item('items', i)} {...ctx.reveal()} {...ctx.hover()}
              style={{ margin: 0, padding: 0, background: t.surface, borderRadius: \`\${t.radius}px\`, overflow: 'hidden', boxShadow: t.shadow, transition: 'outline-color .2s ease', outline: '3px solid transparent' }}>
              <div style={sx.ratio('4:3')}>
                <img src={it.image.src} alt={it.image.alt} loading="lazy" {...ctx.edit(\`items.\${i}.image\`, 'image')} style={sx.imgFill('cover', it.image.pos)} />
              </div>
              <div style={{ padding: '16px', margin: 0 }}>
                <h3 {...ctx.edit(\`items.\${i}.title\`, 'text')} style={sx.heading(20, { margin: '0 0 6px 0' })}>{it.title}</h3>
                <p {...ctx.edit(\`items.\${i}.text\`, 'text')} style={sx.text({ fontSize: '16px' })}>{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});
`);

writeFileSync(join(root, 'runtime.es5.js'), `// ${name} behaviour. ES5 ONLY (var, function, no arrows/let/const/template strings).
// Called once per instance: root is the element with data-sfub="${id}"; S has helpers
// (S.rm = prefers-reduced-motion, S.arr, S.sty, S.css). Full-line // comments are stripped on export.
S.c['${id}'] = S.c['${id}'] || function (root, S) {
var accent = root.getAttribute('data-sfub-accent') || '#cc0633';
var items = S.arr(root.querySelectorAll('.sfux-item'));
function activate(el) {
items.forEach(function (o) { o.style.outlineColor = o === el ? accent : 'transparent'; });
}
items.forEach(function (el) {
el.addEventListener('click', function () { activate(el); });
el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(el); } });
});
// Builder preview: selecting an item in the editor sends this event.
root.addEventListener('sfub:focus', function (e) { if (e.detail && e.detail.key === 'items' && items[e.detail.index]) activate(items[e.detail.index]); });
};
`);

writeFileSync(join(root, 'README.md'), `# ${name}

One paragraph: what it is for and where it is used on the SIAT site.

- **Content:** heading, items (image, title, text)
- **Behaviour:** optional click highlight (runtime.es5.js)
`);

console.log(`Created src/components/${id}/ — edit index.tsx, then run: npm test`);
