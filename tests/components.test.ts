/**
 * Contract test: every registered component (and every preset) must render to
 * AEM-safe HTML. A new component is "done" when this passes.
 */
import { describe, it, expect } from 'vitest';
import { parse } from 'acorn';
import { components } from '../src/components/registry';
import { renderDoc } from '../src/export/render';
import { lintForAEM } from '../src/export/lint';
import { decodeState } from '../src/export/state';
import { DEFAULT_COMMON } from '../src/theme/theme';
import type { Doc } from '../src/lib/types';

function docFor(id: string, presetIndex = -1): Doc {
  const def = components.find((c) => c.id === id)!;
  const preset = presetIndex >= 0 ? def.presets![presetIndex] : undefined;
  return {
    component: id,
    props: { ...structuredClone(def.defaults), ...(preset?.props ?? {}) },
    common: { ...DEFAULT_COMMON, ...def.commonDefaults, ...(preset?.common ?? {}) },
    instanceId: 'test1',
    name: def.name,
  };
}

const variants: [string, Doc][] = [];
for (const c of components) {
  variants.push([`${c.id} (defaults)`, docFor(c.id)]);
  c.presets?.forEach((p, i) => variants.push([`${c.id} / ${p.name}`, docFor(c.id, i)]));
  // Exercise shared animation + hover paths too
  const animated = docFor(c.id);
  animated.common = { ...animated.common, entrance: 'up', hover: 'glow' };
  variants.push([`${c.id} (animated)`, animated]);
}

describe('component registry', () => {
  it('discovers the phase-1 components', () => {
    const ids = components.map((c) => c.id);
    for (const id of ['split-gallery', 'hero', 'card-grid', 'accordion', 'tabs', 'composer']) expect(ids).toContain(id);
  });

  it.each(components.map((c) => [c.id, c] as const))('%s has a valid definition', (_, c) => {
    expect(c.id).toMatch(/^[a-z][a-z0-9-]*$/);
    expect(c.name).toBeTruthy();
    expect(c.fields.length).toBeGreaterThan(0);
    for (const f of c.fields) {
      if (f.type === 'list') expect(typeof f.newItem(0)).toBe('object');
    }
  });
});

describe.each(variants)('%s', (_, doc) => {
  const out = renderDoc(doc, { preview: false, includeState: true });

  it('renders without error', () => {
    expect(out.error).toBeUndefined();
    expect(out.html.length).toBeGreaterThan(100);
  });

  it('passes AEM lint with no errors', () => {
    const errors = lintForAEM(out.html).filter((i) => i.level === 'error');
    expect(errors).toEqual([]);
  });

  it('uses only inline styles that end with ";" and no <style>, rem, class-based CSS or <ul>/<li>', () => {
    expect(out.html).not.toMatch(/<style/i);
    expect(out.html).not.toMatch(/<(ul|ol|li)[\s>]/i);
    const styles = [...out.html.matchAll(/style="([^"]*)"/g)].map((m) => m[1]);
    expect(styles.length).toBeGreaterThan(0);
    for (const s of styles) {
      expect(s.endsWith(';')).toBe(true);
      expect(s).not.toMatch(/\d(\.\d+)?rem\b/);
    }
  });

  it('has a single root element tagged with data-sfub', () => {
    const tpl = document.createElement('template');
    tpl.innerHTML = out.html;
    const els = Array.from(tpl.content.children);
    expect(els.length).toBe(1);
    expect(els[0].getAttribute('data-sfub')).toBe(doc.component);
    expect(els[0].getAttribute('data-sfub-id')).toBe('test1');
  });

  it('script (if any) parses as ES5', () => {
    const m = /<script>([\s\S]*?)<\/script>/.exec(out.html);
    if (m) expect(() => parse(m[1], { ecmaVersion: 5 })).not.toThrow();
  });

  it('strips preview-only attributes from export', () => {
    expect(out.html).not.toMatch(/data-sfub-(path|edit|item)=/);
  });

  it('round-trips builder state through the export comment', () => {
    const back = decodeState(out.html)!;
    expect(back.component).toBe(doc.component);
    expect(back.props).toEqual(doc.props);
    expect(back.common).toEqual(doc.common);
  });
});

describe('preview render', () => {
  it.each(components.map((c) => [c.id] as const))('%s keeps edit paths in preview', (id) => {
    const out = renderDoc(docFor(id), { preview: true });
    expect(out.error).toBeUndefined();
    expect(out.html).toMatch(/data-sfub-(path|item)=/);
  });
});
