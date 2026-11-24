/**
 * Ideas page data: every screenshot exists, every example resolves to a real
 * component, and every example renders to lint-clean AEM HTML in both modes.
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { FINDINGS } from '../src/ideas/findings';
import { exampleDoc, resolveExample } from '../src/ideas/resolve';
import { renderDoc } from '../src/export/render';
import { lintForAEM } from '../src/export/lint';

describe('ideas findings', () => {
  it('have unique ids and short text', () => {
    const ids = FINDINGS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of FINDINGS) {
      expect(f.text.split(/[.!?](\s|$)/).filter((s) => s.trim().length > 1).length).toBeLessThanOrEqual(3);
      for (const st of f.flow ?? []) expect(ids).toContain(st.to);
    }
  });

  it.each(FINDINGS.flatMap((f) => f.sources.map((s) => [f.id, s.shot] as const)))('%s screenshot %s exists', (_, shot) => {
    expect(existsSync(join(__dirname, '..', 'public', 'ideas', shot))).toBe(true);
  });

  const refs = FINDINGS.flatMap((f) => f.examples.map((r) => [f.id, r] as const));
  describe.each(refs)('%s → %s', (_, ref) => {
    const ex = resolveExample(ref);
    it('resolves to a registered component', () => {
      expect(ex).not.toBeNull();
    });
    it.each(['photos', 'placeholders'] as const)('renders lint-clean (%s)', (mode) => {
      const out = renderDoc(exampleDoc(ex!, mode, 'idea1'), { preview: false });
      expect(out.error).toBeUndefined();
      expect(lintForAEM(out.html).filter((i) => i.level === 'error')).toEqual([]);
    });
    it('uses only https sfu.ca photos in photos mode', () => {
      const html = renderDoc(exampleDoc(ex!, 'photos', 'idea1'), { preview: false }).html;
      for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) expect(m[1]).toMatch(/^https:\/\/www\.sfu\.ca\//);
    });
  });
});
