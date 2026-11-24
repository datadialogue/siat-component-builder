import { renderToStaticMarkup } from 'react-dom/server';
import type { Doc } from '../lib/types';
import { makeCtx } from '../lib/ctx';
import { getComponent } from '../components/registry';
import { normalizeStyle } from './style';
import { buildScript } from './script';
import { encodeState } from './state';
import { DEFAULT_COMMON } from '../theme/theme';

const PREVIEW_ATTRS = ['data-sfub-path', 'data-sfub-edit', 'data-sfub-item'];

/**
 * Post-process rendered markup for AEM: normalise every style attribute,
 * remove <style> blocks (AEM drops them anyway) and preview-only attributes.
 */
export function finalizeForAEM(markup: string, keepPreviewAttrs = false): string {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup;
  const frag = tpl.content;
  frag.querySelectorAll('style').forEach((s) => s.remove());
  // React 19 hoists <link rel="preload"> for eager images with real URLs; it would be a second root.
  frag.querySelectorAll('link[rel="preload"]').forEach((l) => l.remove());
  frag.querySelectorAll('*').forEach((el) => {
    const st = el.getAttribute('style');
    if (st !== null) {
      const n = normalizeStyle(st);
      if (n) el.setAttribute('style', n);
      else el.removeAttribute('style');
    }
    if (!keepPreviewAttrs) PREVIEW_ATTRS.forEach((a) => el.removeAttribute(a));
  });
  return tpl.innerHTML;
}

/** Insert the script as the last child of the root element (keeps the snippet a single element). */
function appendScript(html: string, script: string): string {
  if (!script) return html;
  const i = html.lastIndexOf('</');
  if (i < 0) return html + script;
  return html.slice(0, i) + script + html.slice(i);
}

export interface RenderResult {
  html: string;
  error?: string;
}

export function renderDoc(doc: Doc, opts: { preview: boolean; includeState?: boolean }): RenderResult {
  const def = getComponent(doc.component);
  if (!def) return { html: '', error: `Unknown component "${doc.component}"` };
  try {
    const common = { ...DEFAULT_COMMON, ...def.commonDefaults, ...doc.common };
    const ctx = makeCtx(common, doc.instanceId, opts.preview);
    const props = { ...def.defaults, ...doc.props };
    const markup = renderToStaticMarkup(def.render(props, ctx));
    let html = finalizeForAEM(markup, opts.preview);
    const runtime = typeof def.runtime === 'function' ? def.runtime(props) : def.runtime;
    html = appendScript(html, buildScript(html, runtime));
    if (!opts.preview) {
      const header = `<!-- ${def.name} · SIAT Component Builder · paste into an AEM HTML component -->`;
      html = [header, opts.includeState ? encodeState(doc) : '', html].filter(Boolean).join('\n');
    }
    return { html };
  } catch (e) {
    return { html: '', error: e instanceof Error ? e.message : String(e) };
  }
}
