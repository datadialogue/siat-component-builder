/**
 * Mockups: every section is a separate, lint-clean AEM snippet with its own
 * instance id, so they can be pasted one by one onto the same page.
 */
import { describe, it, expect } from 'vitest';
import { HOMEPAGE } from '../src/mockup/homepage';
import { SHOWCASE } from '../src/mockup/showcase';
import { exampleDoc } from '../src/ideas/resolve';
import { renderDoc } from '../src/export/render';
import { lintForAEM } from '../src/export/lint';
import { getComponent } from '../src/components/registry';

describe.each([['homepage', HOMEPAGE, 'mk'], ['showcase', SHOWCASE, 'sc']] as const)('%s mockup', (_name, sections, prefix) => {
  const docs = sections.map((s, i) => exampleDoc(s, 'photos', `${prefix}${i + 1}`));

  it('uses only registered components', () => {
    for (const s of sections) expect(getComponent(s.component)).toBeTruthy();
  });

  it.each(sections.map((s, i) => [i + 1, s.label] as const))('%s · %s renders as one lint-clean snippet', (n) => {
    const html = renderDoc(docs[n - 1], { preview: false, includeState: true }).html;
    expect(lintForAEM(html).filter((x) => x.level === 'error')).toEqual([]);
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    expect(tpl.content.children.length).toBe(1);
    expect(tpl.content.children[0].getAttribute('data-sfub-id')).toBe(`${prefix}${n}`);
    for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) expect(m[1]).toMatch(/^https:\/\/(www|events)\.sfu\.ca\//);
  });
});
