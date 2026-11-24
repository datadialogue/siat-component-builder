import type { ComponentDef } from '../lib/types';

/**
 * Auto-discovers every component folder: src/components/<id>/index.tsx
 * must `export default defineComponent({...})`. No manual registration needed.
 */
const modules = import.meta.glob<{ default: ComponentDef<any> }>('./*/index.tsx', { eager: true });

const ORDER = [
  'split-gallery', 'hero', 'card-grid', 'hover-reveal', 'rail', 'showcase', 'mosaic', 'marquee',
  'statement', 'stats', 'stat-bars', 'quote-block',
  'accordion', 'tabs', 'path-finder', 'hover-list', 'timeline',
  'color-blocks', 'composer',
];

export const components: ComponentDef<any>[] = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean)
  .sort((a, b) => {
    const ia = ORDER.indexOf(a.id), ib = ORDER.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.name.localeCompare(b.name);
  });

const byId = new Map(components.map((c) => [c.id, c]));

export function getComponent(id: string): ComponentDef<any> | undefined {
  return byId.get(id);
}
