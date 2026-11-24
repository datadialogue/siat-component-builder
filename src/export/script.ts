import base from '../runtime/base.es5.js?raw';
import reveal from '../runtime/reveal.es5.js?raw';
import hover from '../runtime/hover.es5.js?raw';

/**
 * Light, safe minification for hand-written ES5 runtime files:
 * drops full-line `//` comments, indentation and blank lines. Newlines are kept
 * so automatic semicolon insertion can never change meaning.
 */
export function minifyScript(src: string): string {
  return src
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('//'))
    .join('\n');
}

/**
 * Builds the single <script> appended to a snippet, or '' if nothing needs JS.
 * Only the shared modules the markup actually uses are included.
 */
export function buildScript(html: string, componentRuntime?: string): string {
  const needsReveal = html.includes('data-sfub-anim=');
  const needsHover = html.includes('data-sfub-hover-fx=');
  if (!componentRuntime && !needsReveal && !needsHover) return '';
  const parts = [base];
  if (needsReveal) parts.push(reveal);
  if (needsHover) parts.push(hover);
  if (componentRuntime) parts.push(componentRuntime);
  const body = minifyScript(parts.join('\n'));
  return `<script>\n(function(){\nvar S=window.SFUB=window.SFUB||{};\n${body}\nS.boot();\n})();\n</script>`;
}

/** Just the JS body (used by tests to parse-check as ES5). */
export function scriptBody(scriptTag: string): string {
  return scriptTag.replace(/^<script>/, '').replace(/<\/script>$/, '');
}
