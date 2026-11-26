/**
 * Card Rows and Rotating Sentence: no-JS markup is complete, and the runtimes
 * (run in jsdom, so no Web Animations: plain swaps) behave per instance.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { newDoc } from '../src/store';
import { renderDoc } from '../src/export/render';

function mount(id: string, preset: number, props: Record<string, any> = {}, instances = 1) {
  const base = newDoc(id, preset);
  let html = '';
  for (let n = 0; n < instances; n++) {
    const doc = { ...base, instanceId: `t${n}`, props: { ...base.props, ...props } };
    html += renderDoc(doc, { preview: false }).html;
  }
  document.body.innerHTML = html;
  const roots = [...document.querySelectorAll<HTMLElement>(`[data-sfub="${id}"]`)];
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return { roots, root: roots[0], run: () => scripts.forEach((s) => new Function(s)()) };
}

describe('card-rows', () => {
  beforeEach(() => { (window as any).SFUB = undefined; });

  it('ships every row and card, with arrows and page marks hidden (no JS)', () => {
    const { root } = mount('card-rows', 0);
    const doc = newDoc('card-rows', 0);
    expect(root.querySelectorAll('.sfcr-row').length).toBe(doc.props.rows.length);
    const cards = doc.props.rows.reduce((n: number, r: any) => n + r.cards.length + (r.linkUrl ? 1 : 0), 0);
    expect(root.querySelectorAll('.sfcr-card').length).toBe(cards);
    for (const b of root.querySelectorAll<HTMLElement>('.sfcr-prev, .sfcr-next, .sfcr-pager')) expect(b.style.display).toBe('none');
    // Each track is its own focusable, labelled scroll region with a unique id.
    const ids = [...root.querySelectorAll('.sfcr-track')].map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('header arrows page one row by whole cards and leave the other rows alone', () => {
    const { root, run } = mount('card-rows', 0, { arrows: 'header', step: 'page', gap: '16' });
    const tracks = [...root.querySelectorAll<HTMLElement>('.sfcr-track')];
    // jsdom has no layout: fake a 600px track of 280px cards that overflows.
    for (const t of tracks) {
      Object.defineProperty(t, 'clientWidth', { value: 600, configurable: true });
      Object.defineProperty(t, 'scrollWidth', { value: 2400, configurable: true });
      for (const c of t.children) Object.defineProperty(c, 'offsetWidth', { value: 280, configurable: true });
      (t as any).scrollTo = ({ left }: { left: number }) => { t.scrollLeft = left; };
    }
    run();
    const next = root.querySelectorAll<HTMLButtonElement>('.sfcr-next');
    expect(next[0].style.display).toBe('flex');
    next[0].click();
    expect(tracks[0].scrollLeft).toBe(2 * (280 + 16));
    expect(tracks[1].scrollLeft).toBe(0);
  });

  it('builds page marks for overflowing rows', () => {
    const { root, run } = mount('card-rows', 0, { pager: true });
    for (const t of root.querySelectorAll<HTMLElement>('.sfcr-track')) {
      Object.defineProperty(t, 'clientWidth', { value: 600, configurable: true });
      Object.defineProperty(t, 'scrollWidth', { value: 1800, configurable: true });
      for (const c of t.children) Object.defineProperty(c, 'offsetWidth', { value: 280, configurable: true });
    }
    run();
    const pager = root.querySelector<HTMLElement>('.sfcr-pager')!;
    expect(pager.style.display).toBe('flex');
    expect(pager.children.length).toBeGreaterThan(1);
  });
});

describe('rotator', () => {
  beforeEach(() => { (window as any).SFUB = undefined; vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });
  const text = (root: HTMLElement) => root.querySelector('.sfrt-cur')!.firstChild!.nodeValue;

  it('ships the full sentence with the first phrase as a link (no JS)', () => {
    const { root } = mount('rotator', 0);
    const doc = newDoc('rotator', 0);
    const cur = root.querySelector<HTMLAnchorElement>('.sfrt-cur')!;
    expect(cur.tagName).toBe('A');
    expect(cur.getAttribute('href')).toBe(doc.props.items[0].url);
    expect(root.querySelector('h2')!.textContent).toContain(`${doc.props.before} ${doc.props.items[0].text}`);
    expect(root.querySelector<HTMLElement>('.sfrt-pause')!.style.display).toBe('none');
  });

  it('rotates through the phrases in order, keeping links', () => {
    const { root, run } = mount('rotator', 0, { effect: 'roll', speed: 2, order: 'list' });
    const doc = newDoc('rotator', 0);
    run();
    expect(root.querySelector<HTMLElement>('.sfrt-pause')!.style.display).toBe('inline-flex');
    vi.advanceTimersByTime(2001);
    expect(text(root)).toBe(doc.props.items[1].text);
    expect(root.querySelector('.sfrt-cur')!.getAttribute('href')).toBe(doc.props.items[1].url);
    vi.advanceTimersByTime(2000);
    expect(text(root)).toBe(doc.props.items[2].text);
  });

  it('types and scrambles to the exact next phrase', () => {
    // Effect length: type deletes then types letter by letter (~2.9s here); scramble ~0.75s.
    for (const [effect, ms] of [['type', 3300], ['scramble', 1000]] as const) {
      const { root, run } = mount('rotator', 0, { effect, speed: 2 });
      // Force the animated path (jsdom has no Element.animate).
      (Element.prototype as any).animate = () => ({ onfinish: null, cancel() {}, pause() {} });
      try {
        run();
        vi.advanceTimersByTime(2000 + ms);
        expect(text(root)).toBe(newDoc('rotator', 0).props.items[1].text);
      } finally {
        delete (Element.prototype as any).animate;
      }
    }
  });

  it('pause button stops rotation; two instances run independently', () => {
    const { roots, run } = mount('rotator', 0, { speed: 2 }, 2);
    run();
    roots[0].querySelector<HTMLButtonElement>('.sfrt-pause')!.click();
    vi.advanceTimersByTime(4001);
    const items = newDoc('rotator', 0).props.items;
    expect(text(roots[0])).toBe(items[0].text);
    expect(text(roots[1])).toBe(items[2].text);
    expect(roots[0].querySelector('.sfrt-pause')!.getAttribute('aria-pressed')).toBe('true');
  });

  it('reel: ships every phrase as a row and rolls through them, wrapping to the start', () => {
    const items = newDoc('rotator', 0).props.items;
    const { root, run } = mount('rotator', 0, { effect: 'reel', speed: 2 });
    expect(root.querySelectorAll('.sfrt-row').length).toBe(items.length);
    expect([...root.querySelectorAll('.sfrt-row a')].map((a) => a.getAttribute('href'))).toEqual(items.map((i: any) => i.url));
    run();
    // Clones above and below for a seamless loop, hidden from screen readers and Tab.
    const rows = [...root.querySelectorAll<HTMLElement>('.sfrt-row')];
    expect(rows.length).toBe(items.length + 3);
    expect(rows.filter((r) => r.getAttribute('aria-hidden') === 'true').every((r) => [...r.querySelectorAll('a')].every((a) => a.tabIndex === -1))).toBe(true);
    const lit = () => [...new Set(rows.filter((r) => r.style.opacity === '1').map((r) => r.getAttribute('data-i')))];
    expect(lit()).toEqual(['0']);
    vi.advanceTimersByTime(2000 + 800);
    expect(lit()).toEqual(['1']);
    vi.advanceTimersByTime((2000 + 800) * (items.length - 1));
    expect(lit()).toEqual(['0']);
  });

  it('the index marks the phrase that is showing and jumps on hover', () => {
    const { root, run } = mount('rotator', 3, { index: 'list', effect: 'roll' });
    run();
    const ix = [...root.querySelectorAll<HTMLElement>('.sfrt-ix')];
    ix[3].dispatchEvent(new MouseEvent('mouseenter'));
    expect(text(root)).toBe(newDoc('rotator', 0).props.items[3].text);
    expect(ix[3].style.borderBottomColor).not.toBe('transparent');
    expect(ix[0].style.borderBottomColor).toBe('transparent');
  });
});
