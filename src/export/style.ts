/**
 * Normalise an inline style string for AEM:
 *  - every declaration is `prop:value;` (trailing semicolon is REQUIRED — AEM has
 *    silently dropped/deleted code when it was missing)
 *  - `rem` → px at 16px (SFU sets html{font-size:10px}, so rem would shrink)
 *  - whitespace collapsed
 * Splits on `;` only at depth 0 outside quotes/parentheses (data: URIs contain `;`).
 */
export function normalizeStyle(style: string): string {
  const decls: string[] = [];
  let buf = '';
  let depth = 0;
  let quote: string | null = null;
  for (const ch of style) {
    if (quote) {
      if (ch === quote) quote = null;
      buf += ch;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ';' && depth === 0) { decls.push(buf); buf = ''; continue; }
    buf += ch;
  }
  decls.push(buf);

  const out: string[] = [];
  for (const d of decls) {
    const i = d.indexOf(':');
    if (i < 1) continue;
    const prop = d.slice(0, i).trim().toLowerCase();
    let value = d.slice(i + 1).trim().replace(/\s+/g, ' ');
    if (!prop || !value) continue;
    if (!value.includes('url(')) {
      value = value.replace(/(-?\d*\.?\d+)rem\b/g, (_, n) => `${Math.round(parseFloat(n) * 16 * 100) / 100}px`);
    }
    out.push(`${prop}:${value};`);
  }
  return out.join('');
}
