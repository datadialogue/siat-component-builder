/** Tiny immutable path helpers. Paths look like "props.items.2.title". */

export function split(path: string): (string | number)[] {
  return path.split('.').filter(Boolean).map((k) => (/^\d+$/.test(k) ? Number(k) : k));
}

export function getIn(obj: any, path: string): any {
  let cur = obj;
  for (const k of split(path)) {
    if (cur == null) return undefined;
    cur = cur[k as any];
  }
  return cur;
}

export function setIn<T>(obj: T, path: string, value: any): T {
  const keys = split(path);
  const rec = (cur: any, i: number): any => {
    if (i === keys.length) return value;
    const k = keys[i];
    const base = cur ?? (typeof k === 'number' ? [] : {});
    const copy = Array.isArray(base) ? base.slice() : { ...base };
    copy[k as any] = rec(base[k as any], i + 1);
    return copy;
  };
  return rec(obj, 0);
}

let counter = 0;
export function uid(): string {
  counter = (counter + 1) % 1e6;
  return Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 6) + counter.toString(36);
}

/** Give every object inside an array a stable `_id` (used as React/drag keys). */
export function ensureIds<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const o = ensureIds(v) as any;
        return o._id ? o : { _id: uid(), ...o };
      }
      return ensureIds(v);
    }) as T;
  }
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) out[k] = ensureIds(v);
    return out;
  }
  return value;
}

export function moveInArray<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice();
  const [m] = copy.splice(from, 1);
  copy.splice(Math.max(0, Math.min(copy.length, to)), 0, m);
  return copy;
}
