# SIAT Component Builder

This is a static React (Vite + TypeScript) app. People use it to build interface components and export them as **self-contained HTML snippets** for the "HTML" component of SFU's AEM CMS, used on the SIAT website.

## Commands

- `npm run dev`: builder at http://localhost:5173
- `npm test`: Vitest, including the component contract test (`tests/components.test.ts`)
- `npm run typecheck`, `npm run build` (outputs static `dist/`)
- `npm run new:component -- <id> "Name"`: scaffold a component

## Adding or changing components

Read `docs/ADDING_A_COMPONENT.md` first. In short, components live in `src/components/<id>/index.tsx` (`defineComponent`) with an optional `runtime.es5.js`. They are auto-registered, and the inspector UI is generated from `fields`. Don't write editor code for a new component.

## Hard constraints for exported HTML (SFU AEM + CLF4 CSS)

- Inline `style` only. AEM strips `<style>`. Every declaration needs a trailing `;`, which `finalizeForAEM` adds.
- Use px or em, never rem (the site root is 10px). Undo CLF4 globals with the `ctx.sx` helpers.
- No `<ul>/<ol>/<li>` (CLF4 bullets), no `<h1>`, no media queries.
- Runtime JS must be ES5, scoped to `root`, safe across multiple instances, and must respect `S.rm`.
- Content must still make sense if scripts don't run.
- Original reference that worked in AEM: `reference/sfu-gallery_6.html`.

## Architecture

| Path | What it does |
|---|---|
| `src/lib/types.ts` | Field schema, `ComponentDef`, `RenderCtx`, `Doc` |
| `src/lib/ctx.ts`, `src/lib/sx.ts`, `src/lib/rich.ts`, `src/theme/theme.ts` | Render context, CLF4-proof style helpers, rich-text styler, SFU palette and themes |
| `src/export/render.ts` | `renderDoc` → `renderToStaticMarkup` → `finalizeForAEM` → append runtime script → header and state comment |
| `src/export/lint.ts` | AEM checks shown in the Export dialog |
| `src/export/state.ts` | lz-string state comment, so exported snippets can be re-imported |
| `src/runtime/*.es5.js` | Shared runtime (`base`, `reveal`, `hover`). Only the modules a snippet uses are included |
| `src/store.ts` | zustand + zundo (undo/redo), per-component drafts, localStorage autosave, saved library |
| `src/editor/*` | UI: `Library`, `Preview` (iframe + `preview/bridge.js` for click-select, inline edit, drag-reorder, image drop), `inspector/*` (generated fields, dnd-kit lists, Tiptap rich text), `ExportDialog`, `ImportDialog`, `SavedMenu` |

The **Ideas** page (`#ideas`, `src/ideas/`) shows findings from Webby school winners. Each one has screenshots in `public/ideas/` and live examples that come from `src/ideas/examples/<component>.ts`. "Photos" mode fills the examples with sfu.ca/siat images (`src/ideas/siat.ts`) and sample text. `tests/ideas.test.ts` checks that every example renders AEM-clean in both modes.

The **Mockup** page (`#mockup`, `src/mockup/`) has two pages. **Homepage** rebuilds the SIAT homepage from real sfu.ca/siat content in `homepage.ts`. **Showcase** shows the Project Showcase component in every layout (`showcase.ts`). Each page is one HTML component per section, and each section can be copied on its own. `tests/mockup.test.ts` checks that each section is a single lint-clean snippet.

The **Project Showcase** component (`src/components/showcase/`) builds its year and topic filters from the projects' own `term` and `topic` fields. With JS, it opens on random picks from the most recent years, spread across topics. Its default content is real projects from sfu.ca/siat/showcase (`projects.ts`). `tests/showcase.test.ts` runs the runtime in jsdom.

In dev, `window.__sfub` is the store (useful for browser automation).

## UI conventions

Keep the builder UI quiet: icons and short labels, with help only behind `?` popovers (`<Help>`). It must stay responsive. Below 1024px the library becomes a drawer; below 768px the inspector becomes a bottom sheet.
