/**
 * Project Showcase: filters come from the projects, the no-JS markup shows everything,
 * and the runtime opens on random picks from recent years spread across topics.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { newDoc } from '../src/store';
import { renderDoc } from '../src/export/render';
import { PROJECTS } from '../src/components/showcase/projects';
import { yearOf } from '../src/components/showcase';

function mount(preset: number, props: Record<string, any> = {}) {
  const base = newDoc('showcase', preset);
  const doc = { ...base, instanceId: 't1', props: { ...base.props, ...props } };
  const html = renderDoc(doc, { preview: false }).html;
  document.body.innerHTML = html;
  const root = document.querySelector<HTMLElement>('[data-sfub="showcase"]')!;
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? '';
  return { root, html, run: () => new Function(script)() };
}
const shown = (root: HTMLElement) => [...root.querySelectorAll<HTMLElement>('.sfsc-it')].filter((el) => el.style.display !== 'none');
const click = (root: HTMLElement, sel: string) => root.querySelector<HTMLButtonElement>(sel)!.click();

describe('showcase', () => {
  beforeEach(() => { (window as any).SFUB = undefined; });

  it('ships every project visible and the filter bar hidden (no JS)', () => {
    const { root } = mount(0);
    expect(root.querySelectorAll('.sfsc-it').length).toBe(PROJECTS.length);
    expect(shown(root).length).toBe(PROJECTS.length);
    expect(root.querySelector<HTMLElement>('.sfsc-ctl')!.style.display).toBe('none');
  });

  it('builds year buttons (newest first) and one button per topic', () => {
    const { root } = mount(0);
    const years = [...root.querySelectorAll('[data-fy]')].map((b) => b.getAttribute('data-fy'));
    expect(years).toEqual(['feat', '2026', '2025', '2024', 'all']);
    const topics = new Set(PROJECTS.map((p) => p.topic));
    expect(root.querySelectorAll('[data-ft]').length).toBe(topics.size + 1);
  });

  it('opens on N random picks from the last two years, one per topic first', () => {
    const { root, run } = mount(0, { featured: 6, recent: 2 });
    run();
    expect(root.querySelector<HTMLElement>('.sfsc-ctl')!.style.display).toBe('flex');
    const vis = shown(root);
    expect(vis.length).toBe(6);
    for (const el of vis) expect(+el.getAttribute('data-year')!).toBeGreaterThanOrEqual(2025);
    expect(new Set(vis.map((el) => el.getAttribute('data-topic'))).size).toBe(6);
    expect(root.querySelector('.sfsc-count')!.textContent).toBe('6 random picks from 2025–2026');
  });

  it('filters by year and topic, and "See all" shows everything', () => {
    const { root, run } = mount(0);
    run();
    click(root, '[data-fy="2024"]');
    const y24 = PROJECTS.filter((p) => yearOf(p.term) === '2024').length;
    expect(shown(root).length).toBe(y24);
    click(root, '[data-ft="Games"]');
    expect(shown(root).every((el) => el.getAttribute('data-topic') === 'Games' && el.getAttribute('data-year') === '2024')).toBe(true);
    click(root, '[data-fy="feat"]');
    click(root, '[data-ft="all"]');
    click(root, '.sfsc-all');
    expect(shown(root).length).toBe(PROJECTS.length);
    expect(root.querySelector('[data-fy="all"]')!.getAttribute('aria-pressed')).toBe('true');
  });

  it('term filter uses the term text', () => {
    const { root, run } = mount(4, { yearFilter: 'term' });
    run();
    click(root, '[data-fy="Fall 2025"]');
    expect(shown(root).length).toBe(PROJECTS.filter((p) => p.term === 'Fall 2025').length);
  });

  it('every layout renders the same projects', () => {
    for (let i = 0; i < 5; i++) expect(mount(i).root.querySelectorAll('.sfsc-it').length).toBe(PROJECTS.length);
  });

  it('real content links to the SIAT showcase', () => {
    for (const p of PROJECTS) {
      expect(p.url).toMatch(/^https:\/\/www\.sfu\.ca\/siat\/showcase\//);
      expect(p.image.src).toMatch(/^https:\/\/www\.sfu\.ca\/content\/sfu\/siat\/showcase\//);
      expect(p.blurb.split(' ').length).toBeLessThanOrEqual(12);
    }
  });
});
