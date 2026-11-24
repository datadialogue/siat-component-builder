# Adding a component

Each component is one folder in `src/components/<id>/`. The registry finds it automatically, and the inspector UI is generated from its `fields`, so you write no editor code.

```bash
npm run new:component -- my-thing "My Thing"   # scaffold from the template
npm run dev                                     # see it in the builder
npm test                                        # contract test: must pass
```

`src/components/stats/` was built this way. It is a good small example. `split-gallery/` is the reference port of the original hand-made AEM gallery.

## Files

| File | Purpose |
|---|---|
| `index.tsx` | `export default defineComponent({...})`: metadata, fields, defaults, presets, `render` |
| `runtime.es5.js` | Optional behaviour script, **ES5 only**, imported with `?raw` |
| `README.md` | What it's for, in one paragraph |

## The AEM rules (why the code looks the way it does)

SFU's AEM "HTML component" and the CLF4 site CSS impose these rules. The contract test enforces most of them.

1. **Inline styles only.** AEM strips `<style>` blocks. Use `style={{...}}`. The exporter normalises each style and adds the trailing `;` that AEM requires; without it AEM has silently dropped code.
2. **px or em, never rem.** SFU sets `html{font-size:10px}`.
3. **Undo CLF4 globals.** CLF4 does all of the following, so start every element from a `ctx.sx` helper (`sx.text`, `sx.heading`, `sx.button`, `sx.imgFill`, `sx.buttonReset`, …):
   - resets margin, padding and border
   - forces `img{width:100%}`
   - gives `p` 17px text and a 30px bottom margin
   - uppercases `h1`
   - colours links grey
4. **No `<ul>/<ol>/<li>`.** CLF4 adds red square bullets through `li:before`, which inline CSS can't remove. Use `<div role="list">`. Rich text is converted for you by `ctx.rich()`.
5. **No `<h1>`.** The page already has one. Use h2–h4.
6. **No media queries.** Make things responsive with flex-wrap, or `sx.grid(cols, minPx, gap)`, which collapses columns on its own.
7. **One root element.** Spread `ctx.root('<id>', style)` on it. That adds `data-sfub`, the instance id, theme font and colour, max-width and spacing, plus the animation and hover data attributes.
8. **Several instances on one page must not clash.** Prefix every `id` with `ctx.id`, and query only inside `root` in the runtime.
9. **Content must work without JS.** Ship the final state in the markup and let the script enhance it. For example, Tabs renders stacked sections that the script turns into tabs, and Stats ships the final numbers.
10. **Respect reduced motion.** Check `S.rm` in runtimes; the shared entrance and hover effects already do.

## `render(props, ctx)` helpers

| Helper | Use |
|---|---|
| `ctx.theme` | Resolved colours and tokens: `accent`, `onAccent`, `text`, `heading`, `muted`, `surface`, `surfaceAlt`, `border`, `radius`, `shadow`, `font`, `dark` |
| `ctx.sx` | CLF4-proof style builders (see `src/lib/sx.ts`) |
| `ctx.root(name, style)` | Attributes for the outer element |
| `ctx.edit(path, kind)` | Makes an element clickable in the preview. `kind: 'text'` adds double-click inline editing; `'image'` accepts dropped files; `'rich'` focuses the rich-text editor |
| `ctx.item(listKey, i)` | Makes a list item draggable in the preview |
| `ctx.reveal()` | Opts the element into the shared scroll entrance animation |
| `ctx.hover()` | Opts the element into the shared hover effect (lift, zoom or glow) |
| `ctx.rich(html, opts)` | Returns `{__html}` for `dangerouslySetInnerHTML`; inline-styles rich text |

Preview-only attributes are stripped from the export.

## Field types

`text` (`multiline`), `richtext`, `url`, `image` (value is `{src, alt, pos}`), `color` (`allowAuto`), `select` (`options`), `number` (`min`, `max`, `step`, `unit`), `toggle`, `list` (`itemFields`, `newItem`, `titleKey`, `thumbKey`, `min`, `max`) and `blocks` (`blockTypes`; see `composer`).

Field options:

- `tab: 'content' | 'style' | 'behaviour'` puts the field on the Content, Style or Motion tab.
- `help` adds a short "?" popover. Keep it to one or two sentences.
- `showIf(parent)` hides the field when it doesn't apply.

The shared Theme and Animation settings are added for every component automatically (`src/lib/commonFields.ts`). Don't re-implement them.

**Presets** are named style variants. They should change look, not content.

## Runtime scripts (`runtime.es5.js`)

```js
S.c['my-thing'] = S.c['my-thing'] || function (root, S) {
  // root = this instance's [data-sfub="my-thing"] element
  // S.rm (reduced motion), S.arr(list), S.sty(el, 'a:b;c:d;'), S.css(id, cssText)
  root.addEventListener('sfub:focus', function (e) { /* builder selected item e.detail.index */ });
};
```

- **ES5 only.** No `let`, `const`, arrow functions, template strings, classes or spread. The test parses it with `acorn` at `ecmaVersion: 5`.
- Full-line `//` comments are stripped on export, so comment freely. Don't put `//` at the start of a line inside a string.
- Pass settings through `data-*` attributes on the root, and use `S.sty` with style strings for active/inactive states (see `tabs`).
- `runtime` can be a function of props that returns `undefined` when no JS is needed, which keeps exports small.
- `S.css()` injects a real `<style>` at runtime. Use it only as an enhancement for `:hover`, `@media` or `@keyframes`; the inline baseline must already look right.

## Ways to make things interactive (prefer earlier ones)

1. **Plain HTML:** `<details>/<summary>`, links, anchor jumps, `<iframe>` embeds.
2. **Inline `transition` plus JS that toggles inline styles.** This is how the gallery does hover.
3. **Web Animations API (`el.animate`) plus `IntersectionObserver`.** Keyframes without a stylesheet: entrances, count-ups.
4. **`S.css()` runtime style injection.** For things only a stylesheet can express.
5. **Full behaviours:** tabs, carousels, filters.

## Done checklist

- [ ] `npm test` passes. It covers every preset plus an "animated" variant: no `<style>`, a trailing `;` on every style, no rem or lists, one root, ES5 script, state round-trip.
- [ ] `npm run typecheck` passes.
- [ ] Checked in `npm run dev` at Full, Column, Tablet and Phone widths, with **Live SFU CSS** on.
- [ ] Two instances on one page behave independently (Export → **Test page**, paste twice).
- [ ] Keyboard works, and the component makes sense with JS disabled.
