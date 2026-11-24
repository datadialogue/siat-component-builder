import type { Theme } from '../theme/theme';

/**
 * Converts rich-text HTML (from the Tiptap editor) into AEM-safe HTML:
 * every element gets inline styles that override CLF4, classes are dropped,
 * and lists become <div role="list"> because CLF4 injects red square bullets
 * via `li:before`, which inline styles cannot remove.
 */
export function styleRichText(html: string, t: Theme, opts: { color?: string; size?: number } = {}): string {
  if (!html) return '';
  const color = opts.color ?? t.text;
  const size = opts.size ?? 17;
  const doc = new DOMParser().parseFromString(`<div id="r">${html}</div>`, 'text/html');
  const root = doc.getElementById('r')!;

  // font-family is inherited from the component root; only colour/size/spacing are restated
  // because CLF4 sets them on p/h* inside the main column.
  const base = `color:${color};`;
  const textStyle = `${base}font-size:${size}px;line-height:1.55;padding:0;`;
  const headingSizes: Record<string, number> = { H1: 32, H2: 28, H3: 22, H4: 18, H5: 16, H6: 15 };

  const merge = (el: Element, ours: string) => {
    const existing = el.getAttribute('style') || '';
    // existing (user-set, e.g. text-align / color) wins over ours
    el.setAttribute('style', ours + existing);
  };

  // Lists first (they restructure the tree).
  root.querySelectorAll('ul, ol').forEach((list) => {
    const ordered = list.tagName === 'OL';
    const wrap = doc.createElement('div');
    wrap.setAttribute('role', 'list');
    merge(wrap, 'margin:0 0 1em 0;padding:0;');
    let n = 0;
    Array.from(list.children).forEach((li) => {
      if (li.tagName !== 'LI') return;
      n++;
      const item = doc.createElement('div');
      item.setAttribute('role', 'listitem');
      item.setAttribute('style', `${textStyle}display:flex;gap:.6em;margin:0 0 .35em 0;`);
      const marker = doc.createElement('span');
      marker.setAttribute('aria-hidden', 'true');
      marker.setAttribute(
        'style',
        ordered
          ? `flex:0 0 auto;min-width:1.2em;font-weight:700;color:${t.accent === '#ffffff' ? color : t.accent};`
          : `flex:0 0 auto;width:.4em;height:.4em;margin-top:.62em;border-radius:50%;background:${t.accent === '#ffffff' ? color : t.accent};`,
      );
      if (ordered) marker.textContent = `${n}.`;
      const body = doc.createElement('div');
      body.setAttribute('style', 'flex:1 1 auto;min-width:0;');
      while (li.firstChild) body.appendChild(li.firstChild);
      item.appendChild(marker);
      item.appendChild(body);
      wrap.appendChild(item);
    });
    list.replaceWith(wrap);
  });

  root.querySelectorAll('*').forEach((el) => {
    el.removeAttribute('class');
    const tag = el.tagName;
    if (tag === 'P') {
      const inList = !!el.parentElement?.closest('[role="listitem"]');
      merge(el, `${textStyle}margin:0 0 ${inList ? '0' : '1em'} 0;`);
    } else if (headingSizes[tag]) {
      merge(
        el,
        `font-family:${t.font};color:${opts.color ?? t.heading};font-size:${headingSizes[tag]}px;line-height:1.2;font-weight:800;font-stretch:83%;letter-spacing:normal;text-transform:none;margin:1.1em 0 .45em 0;padding:0;`,
      );
    } else if (tag === 'A') {
      merge(el, `color:${opts.color && opts.color !== t.text ? opts.color : t.link};text-decoration:underline;text-underline-offset:3px;background:none;`);
    } else if (tag === 'STRONG' || tag === 'B') {
      merge(el, 'font-weight:700;');
    } else if (tag === 'BLOCKQUOTE') {
      merge(el, `${base}margin:0 0 1em 0;padding:.2em 0 .2em 1em;border:0;border-left:4px solid ${t.accent};font-size:${size + 2}px;line-height:1.5;font-style:italic;`);
    } else if (tag === 'HR') {
      merge(el, `display:block;height:1px;border:0;margin:1.4em 0;padding:0;background:${t.border};`);
    } else if (tag === 'CODE') {
      merge(el, 'font-family:Menlo,Consolas,monospace;font-size:.9em;padding:.1em .3em;background:rgba(0,0,0,.06);border-radius:3px;');
    } else if (tag === 'IMG') {
      merge(el, 'display:block;max-width:100%;height:auto;margin:0 0 1em 0;');
    }
  });

  // First heading in a block shouldn't push down; last element shouldn't add trailing space.
  const first = root.firstElementChild as HTMLElement | null;
  if (first && /^H\d$/.test(first.tagName)) first.style.marginTop = '0';
  const last = root.lastElementChild as HTMLElement | null;
  if (last) last.style.marginBottom = '0';

  return root.innerHTML;
}

/** Strip tags to plain text (for titles in lists, alt text suggestions, etc.). */
export function plainText(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}
