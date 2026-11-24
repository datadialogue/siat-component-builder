import LZString from 'lz-string';
import type { Doc } from '../lib/types';

/**
 * The builder state is embedded in an HTML comment at the top of an export so a
 * snippet copied back out of AEM can be re-opened and edited.
 * Base64 never contains "--", so it is safe inside a comment.
 */
const RE = /<!--\s*sfub:v1:([A-Za-z0-9+/=]+)\s*-->/;

export function encodeState(doc: Doc): string {
  const payload = JSON.stringify({ c: doc.component, p: doc.props, m: doc.common, n: doc.name, i: doc.instanceId });
  return `<!--sfub:v1:${LZString.compressToBase64(payload)}-->`;
}

export function decodeState(html: string): Doc | null {
  const m = RE.exec(html);
  if (!m) return null;
  try {
    const raw = LZString.decompressFromBase64(m[1]);
    if (!raw) return null;
    const o = JSON.parse(raw);
    return { component: o.c, props: o.p, common: o.m, name: o.n || '', instanceId: o.i || newInstanceId() };
  } catch {
    return null;
  }
}

export function newInstanceId(): string {
  return Math.random().toString(36).slice(2, 7);
}
