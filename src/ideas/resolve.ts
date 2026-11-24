import type { Doc } from '../lib/types';
import type { Example } from './types';
import { getComponent } from '../components/registry';
import { newDoc } from '../store';
import { ensureIds } from '../lib/path';

/** src/ideas/examples/<component>.ts → `export const examples: Record<string, Example>` */
const mods = import.meta.glob<{ examples?: Record<string, Example> }>('./examples/*.ts', { eager: true });
const byComponent: Record<string, Record<string, Example>> = {};
for (const [path, m] of Object.entries(mods)) {
  const id = /\/examples\/(.+)\.ts$/.exec(path)?.[1];
  if (id) byComponent[id] = m.examples ?? {};
}

export type Mode = 'photos' | 'placeholders';

/** "component" or "component:key" → Example (falls back to the component's first example, then its defaults). */
export function resolveExample(ref: string): Example | null {
  const [component, key] = ref.split(':');
  if (!getComponent(component)) return null;
  const set = byComponent[component] ?? {};
  return (key && set[key]) || Object.values(set)[0] || { component };
}

export function exampleDoc(ex: Example, mode: Mode, instanceId: string): Doc {
  const def = getComponent(ex.component)!;
  const pi = ex.preset ? def.presets?.findIndex((p) => p.name === ex.preset) ?? -1 : -1;
  const base = newDoc(ex.component, pi);
  return {
    ...base,
    instanceId,
    props: ensureIds(structuredClone({ ...base.props, ...ex.props, ...(mode === 'photos' ? ex.real : {}) })),
    common: { ...base.common, ...ex.common },
  };
}
