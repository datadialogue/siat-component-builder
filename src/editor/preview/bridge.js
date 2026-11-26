// Runs INSIDE the preview iframe (builder only, never exported).
// Renders snippets, reports clicks/edits/drags to the editor via postMessage.
(function () {
  const mount = document.getElementById('sfub-mount');
  const post = (m) => parent.postMessage({ __sfub: 1, ...m }, '*');
  window.SFUB = window.SFUB || {};
  let editing = null;
  let pending = null;
  let selected = null;
  let firstRender = true;

  function render(html, replay) {
    if (editing) { pending = { html, replay }; return; }
    const y = window.scrollY;
    window.SFUB.skipAnim = !(replay || firstRender);
    firstRender = false;
    mount.innerHTML = html;
    mount.querySelectorAll('script').forEach((old) => {
      const s = document.createElement('script');
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
    mount.querySelectorAll('[data-sfub-item]').forEach((el) => { el.draggable = true; });
    window.scrollTo(0, y);
    mark();
    focusItem();
    reportHeight();
  }

  function reportHeight() {
    requestAnimationFrame(() => post({ type: 'height', height: document.documentElement.scrollHeight }));
  }

  function mark() {
    mount.querySelectorAll('[data-sfub-selected]').forEach((el) => el.removeAttribute('data-sfub-selected'));
    if (!selected) return;
    const css = (v) => (window.CSS && CSS.escape ? CSS.escape(v) : v);
    let el = mount.querySelector(`[data-sfub-path="${css(selected)}"]`);
    // Otherwise the deepest list item on the path (handles nested lists like rows.0.cards.2).
    const parts = selected.split('.');
    for (let n = parts.length; !el && n > 1; n--) {
      if (/^\d+$/.test(parts[n - 1])) el = mount.querySelector(`[data-sfub-item="${css(parts.slice(0, n).join('.'))}"]`);
    }
    if (el) el.setAttribute('data-sfub-selected', '');
  }

  function focusItem() {
    const m = selected && /^([\w]+)\.(\d+)/.exec(selected);
    if (!m) return;
    const root = mount.querySelector('[data-sfub]');
    if (root) root.dispatchEvent(new CustomEvent('sfub:focus', { detail: { key: m[1], index: +m[2], path: selected } }));
  }

  function pathOf(target) {
    const p = target.closest('[data-sfub-path]');
    const it = target.closest('[data-sfub-item]');
    if (p && (!it || it.contains(p))) return p.getAttribute('data-sfub-path');
    if (it) return it.getAttribute('data-sfub-item');
    return null;
  }

  // ---- selection ----
  document.addEventListener('click', (e) => {
    if (editing && editing.contains(e.target)) return;
    const a = e.target.closest('a[href]');
    if (a) e.preventDefault(); // never navigate away inside the preview
    const path = pathOf(e.target);
    post({ type: 'select', path });
  }, true);

  // ---- inline text editing ----
  document.addEventListener('dblclick', (e) => {
    const el = e.target.closest('[data-sfub-edit]');
    if (!el) return;
    const kind = el.getAttribute('data-sfub-edit');
    const path = el.getAttribute('data-sfub-path');
    // Text inside <button>/<summary> can't be safely contentEditable; edit in the panel instead.
    if (kind !== 'text' || el.closest('button, summary')) { post({ type: 'focusField', path }); return; }
    e.preventDefault();
    startEdit(el, path);
  });

  function startEdit(el, path) {
    editing = el;
    let anc = el.closest('[draggable]');
    if (anc) anc.draggable = false;
    try { el.contentEditable = 'plaintext-only'; } catch { el.contentEditable = 'true'; }
    if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
    el.focus();
    const r = document.createRange();
    r.selectNodeContents(el);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    const onInput = () => post({ type: 'text', path, value: el.innerText.replace(/\n+$/, '') });
    const onKey = (ev) => {
      if ((ev.key === 'Enter' && !ev.shiftKey) || ev.key === 'Escape') { ev.preventDefault(); el.blur(); }
      ev.stopPropagation();
    };
    const end = () => {
      el.removeEventListener('input', onInput);
      el.removeEventListener('keydown', onKey, true);
      el.removeEventListener('blur', end);
      el.removeAttribute('contenteditable');
      if (anc) anc.draggable = true;
      onInput();
      editing = null;
      if (pending) { const p = pending; pending = null; render(p.html, p.replay); }
    };
    el.addEventListener('input', onInput);
    el.addEventListener('keydown', onKey, true);
    el.addEventListener('blur', end);
  }

  // ---- drag to reorder list items ----
  let drag = null;
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;z-index:99999;background:#0b78e6;border-radius:2px;pointer-events:none;display:none;box-shadow:0 0 0 2px #fff;';
  document.body.appendChild(bar);

  // "rows.0.cards.3" -> { key: "rows.0.cards", index: 3 }. Keys may be nested list paths.
  function itemId(el) {
    const v = el.getAttribute('data-sfub-item');
    const i = v.lastIndexOf('.');
    return { key: v.slice(0, i), index: +v.slice(i + 1) };
  }
  // Items of exactly this list (not of lists nested inside its items).
  function itemsOf(listKey) {
    return Array.from(mount.querySelectorAll(`[data-sfub-item^="${listKey}."]`)).filter((el) => itemId(el).key === listKey);
  }
  // Closest ancestor item that belongs to this list.
  function closestItem(target, listKey) {
    let el = target.closest && target.closest('[data-sfub-item]');
    while (el && itemId(el).key !== listKey) el = el.parentElement && el.parentElement.closest('[data-sfub-item]');
    return el;
  }

  function horizontal(listKey) {
    const items = itemsOf(listKey);
    if (items.length < 2) return false;
    const a = items[0].getBoundingClientRect(), b = items[1].getBoundingClientRect();
    // Tolerant of hover transforms (e.g. a lifted card sits a few px higher).
    return Math.abs(a.top - b.top) < Math.min(a.height, b.height) / 2;
  }

  document.addEventListener('dragstart', (e) => {
    const it = e.target.closest && e.target.closest('[data-sfub-item]');
    if (!it || editing) return;
    const { key, index } = itemId(it);
    drag = { key, from: index, el: it, horiz: horizontal(key) };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'sfub');
    setTimeout(() => { it.style.opacity = '.35'; }, 0);
  });
  document.addEventListener('dragend', () => {
    if (drag) drag.el.style.opacity = '';
    drag = null;
    bar.style.display = 'none';
  });

  let fileTarget = null;
  function setFileTarget(el) {
    if (fileTarget === el) return;
    if (fileTarget) fileTarget.removeAttribute('data-sfub-droptarget');
    fileTarget = el;
    if (el) el.setAttribute('data-sfub-droptarget', '');
  }

  document.addEventListener('dragover', (e) => {
    const types = Array.from(e.dataTransfer?.types || []);
    if (types.includes('Files')) {
      e.preventDefault();
      setFileTarget(e.target.closest('[data-sfub-edit="image"]'));
      e.dataTransfer.dropEffect = fileTarget ? 'copy' : 'none';
      return;
    }
    if (!drag) return;
    const t = closestItem(e.target, drag.key);
    if (!t) { bar.style.display = 'none'; return; }
    e.preventDefault();
    const r = t.getBoundingClientRect();
    const after = drag.horiz ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2;
    drag.to = itemId(t).index + (after ? 1 : 0);
    bar.style.display = 'block';
    if (drag.horiz) {
      Object.assign(bar.style, { left: `${(after ? r.right : r.left) - 2}px`, top: `${r.top}px`, width: '4px', height: `${r.height}px` });
    } else {
      Object.assign(bar.style, { left: `${r.left}px`, top: `${(after ? r.bottom : r.top) - 2}px`, width: `${r.width}px`, height: '4px' });
    }
  });
  document.addEventListener('dragleave', (e) => { if (!e.relatedTarget) setFileTarget(null); });

  document.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length) {
      e.preventDefault();
      const el = fileTarget;
      setFileTarget(null);
      const f = files[0];
      if (el && /^image\//.test(f.type)) post({ type: 'dropImage', path: el.getAttribute('data-sfub-path'), file: f });
      return;
    }
    if (!drag || drag.to == null) return;
    e.preventDefault();
    let to = drag.to;
    if (drag.from < to) to--;
    if (to !== drag.from) post({ type: 'move', key: drag.key, from: drag.from, to });
    bar.style.display = 'none';
  });

  // ---- keyboard shortcuts forwarded to the editor ----
  document.addEventListener('keydown', (e) => {
    if (editing) return;
    if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z' || e.key === 'y')) {
      e.preventDefault();
      post({ type: 'key', key: e.key.toLowerCase(), shift: e.shiftKey });
    }
  });

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || !m.__sfub) return;
    if (m.type === 'render') render(m.html, m.replay);
    else if (m.type === 'select') { selected = m.path; mark(); focusItem(); }
  });
  new ResizeObserver(reportHeight).observe(document.body);
  post({ type: 'ready' });
})();
