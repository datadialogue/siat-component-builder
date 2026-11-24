import { create } from 'zustand';
import { temporal } from 'zundo';
import type { Doc, Tab } from './lib/types';
import { components, getComponent } from './components/registry';
import { DEFAULT_COMMON } from './theme/theme';
import { ensureIds, getIn, moveInArray, setIn, uid } from './lib/path';
import { newInstanceId } from './export/state';

const LS_KEY = 'sfub:workspace:v1';
const LS_SAVED = 'sfub:saved:v1';

export interface SavedItem { id: string; name: string; updated: number; doc: Doc }

export const VIEWPORTS = [
  { id: 'full', label: 'Full width', width: 1420, help: 'Full-width SFU page (max 1420px).' },
  { id: 'column', label: 'Main column', width: 980, help: 'Page with a side menu.' },
  { id: 'tablet', label: 'Tablet', width: 720, help: 'Tablet or half-width column.' },
  { id: 'phone', label: 'Phone', width: 360, help: 'Typical phone content width.' },
] as const;

export function newDoc(componentId: string, presetIndex = -1): Doc {
  const def = getComponent(componentId) ?? components[0];
  const preset = presetIndex >= 0 ? def.presets?.[presetIndex] : undefined;
  return {
    component: def.id,
    props: ensureIds(structuredClone({ ...def.defaults, ...(preset?.props ?? {}) })),
    common: { ...DEFAULT_COMMON, ...def.commonDefaults, ...(preset?.common ?? {}) },
    instanceId: newInstanceId(),
    name: def.name,
  };
}

/** Make sure a loaded doc has every current default (components can gain new fields). */
function hydrate(doc: Doc): Doc {
  const def = getComponent(doc.component);
  if (!def) return newDoc(components[0].id);
  return {
    ...doc,
    props: ensureIds({ ...structuredClone(def.defaults), ...doc.props }),
    common: { ...DEFAULT_COMMON, ...def.commonDefaults, ...doc.common },
    instanceId: doc.instanceId || newInstanceId(),
    name: doc.name || def.name,
  };
}

interface UiState {
  viewport: string;          // VIEWPORTS id or 'custom'
  customWidth: number;
  liveCss: boolean;
  tab: Tab;
  panel: 'library' | 'inspector' | null; // mobile/tablet drawers
  exportOpen: boolean;
  importOpen: boolean;
  replayNonce: number;
}

interface State {
  doc: Doc;
  drafts: Record<string, Doc>;
  savedId: string | null;
  /** props-relative path of the selected element, e.g. "items.2.title" */
  selected: string | null;
  focusNonce: number;
  ui: UiState;

  loadComponent: (id: string) => void;
  applyPreset: (index: number) => void;
  setValue: (path: string, value: any) => void;
  addItem: (listPath: string, item: Record<string, any>, at?: number) => void;
  removeItem: (listPath: string, index: number) => void;
  duplicateItem: (listPath: string, index: number) => void;
  moveItem: (listPath: string, from: number, to: number) => void;
  select: (path: string | null, focus?: boolean) => void;
  loadDoc: (doc: Doc, savedId?: string | null) => void;
  resetDoc: () => void;
  setUi: (patch: Partial<UiState>) => void;
  replay: () => void;
}

function loadWorkspace(): { doc: Doc; drafts: Record<string, Doc>; ui?: Partial<UiState> } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o?.doc?.component) return null;
    return { doc: hydrate(o.doc), drafts: o.drafts ?? {}, ui: o.ui };
  } catch {
    return null;
  }
}

const initial = loadWorkspace();
const firstDoc = initial?.doc ?? newDoc(components[0].id);

export const useStore = create<State>()(
  temporal(
    (set, get) => ({
      doc: firstDoc,
      drafts: initial?.drafts ?? {},
      savedId: null,
      selected: null,
      focusNonce: 0,
      ui: {
        viewport: typeof window !== 'undefined' && window.innerWidth < 700 ? 'phone' : 'column',
        customWidth: 980,
        liveCss: false,
        tab: 'content',
        replayNonce: 0,
        ...(initial?.ui ?? {}),
        panel: null,
        exportOpen: false,
        importOpen: false,
      },

      loadComponent: (id) => {
        const { doc, drafts } = get();
        if (id === doc.component) return;
        const nextDrafts = { ...drafts, [doc.component]: doc };
        const next = drafts[id] ? hydrate(drafts[id]) : newDoc(id);
        set({ doc: next, drafts: nextDrafts, selected: null, savedId: null });
      },
      applyPreset: (index) => {
        const { doc } = get();
        const def = getComponent(doc.component);
        const p = def?.presets?.[index];
        if (!p) return;
        set({
          doc: {
            ...doc,
            props: { ...doc.props, ...ensureIds(structuredClone(p.props ?? {})) },
            common: { ...DEFAULT_COMMON, ...def!.commonDefaults, ...(p.common ?? {}), maxWidth: doc.common.maxWidth },
          },
        });
        get().replay();
      },
      setValue: (path, value) => set((s) => ({ doc: setIn(s.doc, path, value) })),
      addItem: (listPath, item, at) =>
        set((s) => {
          const list: any[] = getIn(s.doc, listPath) ?? [];
          const i = at ?? list.length;
          const next = list.slice();
          next.splice(i, 0, ensureIds([item])[0]);
          const rel = listPath.replace(/^props\./, '');
          return { doc: setIn(s.doc, listPath, next), selected: `${rel}.${i}`, focusNonce: s.focusNonce + 1 };
        }),
      removeItem: (listPath, index) =>
        set((s) => {
          const list: any[] = getIn(s.doc, listPath) ?? [];
          return { doc: setIn(s.doc, listPath, list.filter((_, k) => k !== index)), selected: null };
        }),
      duplicateItem: (listPath, index) =>
        set((s) => {
          const list: any[] = getIn(s.doc, listPath) ?? [];
          const copy = { ...structuredClone(list[index]), _id: uid() };
          const next = list.slice();
          next.splice(index + 1, 0, ensureIds(copy));
          const rel = listPath.replace(/^props\./, '');
          return { doc: setIn(s.doc, listPath, next), selected: `${rel}.${index + 1}` };
        }),
      moveItem: (listPath, from, to) =>
        set((s) => {
          const list: any[] = getIn(s.doc, listPath) ?? [];
          if (from === to || from < 0 || from >= list.length) return {};
          const rel = listPath.replace(/^props\./, '');
          const sel = s.selected && s.selected.startsWith(`${rel}.${from}`) ? s.selected.replace(`${rel}.${from}`, `${rel}.${to}`) : s.selected;
          return { doc: setIn(s.doc, listPath, moveInArray(list, from, to)), selected: sel };
        }),
      select: (path, focus = false) => set((s) => ({ selected: path, focusNonce: focus ? s.focusNonce + 1 : s.focusNonce })),
      loadDoc: (doc, savedId = null) => set({ doc: hydrate(doc), selected: null, savedId }),
      resetDoc: () => set((s) => ({ doc: newDoc(s.doc.component), selected: null, savedId: null })),
      setUi: (patch) => set((s) => ({ ui: { ...s.ui, ...patch } })),
      replay: () => set((s) => ({ ui: { ...s.ui, replayNonce: s.ui.replayNonce + 1 } })),
    }),
    {
      partialize: (s) => ({ doc: s.doc }),
      limit: 150,
      equality: (a, b) => a.doc === b.doc,
      // Group rapid edits (typing) into one undo step.
      handleSet: (handleSet) => {
        let t: ReturnType<typeof setTimeout> | undefined;
        let first = true;
        return (...args: Parameters<typeof handleSet>) => {
          if (first) { handleSet(...args); first = false; }
          clearTimeout(t);
          t = setTimeout(() => { first = true; }, 400);
        };
      },
    },
  ),
);

/* ---------- autosave ---------- */
let saveTimer: ReturnType<typeof setTimeout> | undefined;
useStore.subscribe((s) => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const { viewport, customWidth, liveCss, tab } = s.ui;
      localStorage.setItem(LS_KEY, JSON.stringify({ doc: s.doc, drafts: s.drafts, ui: { viewport, customWidth, liveCss, tab } }));
    } catch {
      /* quota or private mode: ignore */
    }
  }, 400);
});

export const undo = () => useStore.temporal.getState().undo();
export const redo = () => useStore.temporal.getState().redo();

/* ---------- saved components library ---------- */
export function listSaved(): SavedItem[] {
  try {
    return JSON.parse(localStorage.getItem(LS_SAVED) || '[]');
  } catch {
    return [];
  }
}
export function saveCurrent(name: string): SavedItem | null {
  const { doc, savedId } = useStore.getState();
  const items = listSaved();
  const id = savedId ?? uid();
  const item: SavedItem = { id, name, updated: Date.now(), doc: { ...doc, name } };
  const next = [item, ...items.filter((i) => i.id !== id)];
  try {
    localStorage.setItem(LS_SAVED, JSON.stringify(next));
  } catch {
    return null;
  }
  useStore.setState({ savedId: id, doc: { ...doc, name } });
  return item;
}
export function deleteSaved(id: string) {
  try {
    localStorage.setItem(LS_SAVED, JSON.stringify(listSaved().filter((i) => i.id !== id)));
  } catch {
    /* ignore */
  }
}
