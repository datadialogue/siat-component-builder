import { parse } from 'acorn';

export type LintLevel = 'error' | 'warn' | 'info';
export interface LintIssue {
  level: LintLevel;
  code: string;
  message: string;
}

/** SFU's CMS docs recommend keeping an HTML component under this many characters. */
export const SFU_RECOMMENDED_CHARS = 4000;
export const LARGE_CHARS = 30000;

/**
 * Checks an exported snippet against what is known to break (or risk breaking)
 * on SFU's AEM + CLF4. Errors should be fixed before pasting.
 */
export function lintForAEM(html: string): LintIssue[] {
  const issues: LintIssue[] = [];
  const add = (level: LintLevel, code: string, message: string) => issues.push({ level, code, message });

  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const f = tpl.content;

  if (f.querySelector('style')) add('error', 'style-block', 'Contains a <style> block — AEM removes it.');

  let missingSemi = 0;
  let rem = 0;
  f.querySelectorAll('[style]').forEach((el) => {
    const s = el.getAttribute('style')!.trim();
    if (s && !s.endsWith(';')) missingSemi++;
    if (/\d(\.\d+)?rem\b/.test(s)) rem++;
  });
  if (missingSemi) add('error', 'semicolon', `${missingSemi} style attribute(s) missing a trailing ";" — AEM may drop the code.`);
  if (rem) add('warn', 'rem', `${rem} style(s) use rem units — SFU pages use a 10px root, so sizes shrink. Use px or em.`);

  // Count unique sources: one image can appear twice (e.g. a gallery thumb + its data-full).
  let noAlt = 0;
  const localSet = new Set<string>(), placeholderSet = new Set<string>(), httpSet = new Set<string>();
  const classify = (src: string) => {
    if (/^data:image\/svg\+xml/.test(src)) placeholderSet.add(src);
    else if (/^data:/.test(src) || /^blob:/.test(src)) localSet.add(src);
    else if (/^http:/.test(src)) httpSet.add(src);
  };
  f.querySelectorAll('img').forEach((img) => {
    if (!img.hasAttribute('alt')) noAlt++;
    classify(img.getAttribute('src') || '');
  });
  f.querySelectorAll('[data-full]').forEach((el) => classify(el.getAttribute('data-full') || ''));
  const local = localSet.size, placeholder = placeholderSet.size, httpImg = httpSet.size;
  if (local) add('error', 'local-image', `${local} image(s) are local files. Upload them to the AEM DAM and paste the /content/dam/… path.`);
  if (placeholder) add('warn', 'placeholder', `${placeholder} placeholder image(s) still in use.`);
  if (noAlt) add('warn', 'alt', `${noAlt} image(s) have no alt text.`);
  if (httpImg) add('warn', 'http', `${httpImg} image(s) use http:// — use https:// or a /content/dam/ path.`);

  let emptyLink = 0, relLink = 0, httpLink = 0;
  f.querySelectorAll('a').forEach((a) => {
    const href = (a.getAttribute('href') || '').trim();
    if (!href || href === '#') emptyLink++;
    else if (/^http:/.test(href)) httpLink++;
    else if (!/^(https:|\/|#|mailto:|tel:)/.test(href)) relLink++;
  });
  if (emptyLink) add('warn', 'empty-link', `${emptyLink} link(s) have no URL.`);
  if (relLink) add('warn', 'relative-link', `${relLink} relative link(s). Use full paths like /siat/… or https://… so links survive page moves.`);
  if (httpLink) add('info', 'http-link', `${httpLink} link(s) use http://.`);

  if (f.querySelector('ul, ol, li')) add('warn', 'list', 'Contains <ul>/<ol>: SFU adds red square bullets that inline styles cannot remove.');
  if (f.querySelector('h1')) add('warn', 'h1', 'Contains an <h1>. The page already has one; use h2–h4.');
  if (f.querySelector('iframe')) add('info', 'iframe', 'Contains an iframe (video/embed). Check it in AEM preview.');

  f.querySelectorAll('script').forEach((s) => {
    try {
      parse(s.textContent || '', { ecmaVersion: 5 });
    } catch (e) {
      add('error', 'es5', `Script is not ES5: ${(e as Error).message}`);
    }
  });

  const len = html.length;
  if (len > LARGE_CHARS) add('warn', 'size', `${len.toLocaleString()} characters — very large. Consider fewer items or turning off "edit data".`);
  else if (len > SFU_RECOMMENDED_CHARS) add('info', 'size', `${len.toLocaleString()} characters. SFU recommends ≤ 4,000, but larger snippets work.`);

  return issues;
}
