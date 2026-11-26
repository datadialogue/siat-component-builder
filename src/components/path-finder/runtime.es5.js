// Path Finder (ES5). Markup ships every option as a stacked panel; this shows the
// dropdown or chips and keeps only the chosen panel visible.
// The dropdown is a custom listbox (WAI-ARIA "select-only combobox" style): a button
// that opens a styled list. Keys: arrows, Home/End, Enter/Space, Esc, type-ahead.
S.c['path-finder'] = S.c['path-finder'] || function (root, S) {
var ctrl = root.querySelector('.sfupf-ctrl');
var btn = root.querySelector('.sfupf-btn');
var list = root.querySelector('.sfupf-list');
var val = root.querySelector('.sfupf-val');
var chev = root.querySelector('.sfupf-chev');
var opts = S.arr(root.querySelectorAll('.sfupf-opt'));
var chips = S.arr(root.querySelectorAll('.sfupf-chip'));
var panels = S.arr(root.querySelectorAll('.sfupf-panel'));
var anim = root.getAttribute('data-anim') || 'none';
var on = root.getAttribute('data-on') || '', off = root.getAttribute('data-off') || '';
var actCss = root.getAttribute('data-opt-act') || '', idleCss = root.getAttribute('data-opt-idle') || '';
if (!ctrl || !panels.length) return;
ctrl.style.display = 'block';
S.arr(root.querySelectorAll('.sfupf-fb')).forEach(function (h) { h.style.display = 'none'; });
panels.forEach(function (p) { p.style.margin = '0'; });
var cur = -1;

function show(i, quiet) {
if (i < 0 || i >= panels.length || i === cur) return;
cur = i;
panels.forEach(function (p, k) { p.style.display = k === i ? '' : 'none'; });
chips.forEach(function (c, k) {
c.setAttribute('aria-pressed', k === i ? 'true' : 'false');
S.sty(c, k === i ? on : off);
});
opts.forEach(function (o, k) {
o.setAttribute('aria-selected', k === i ? 'true' : 'false');
var tk = o.querySelector('.sfupf-tick');
if (tk) tk.style.opacity = k === i ? '1' : '0';
});
if (val && opts[i]) {
var l = opts[i].querySelector('.sfupf-ol');
val.textContent = l ? l.textContent : '';
}
var p = panels[i];
if (!quiet && p.animate && !S.rm && anim !== 'none') {
p.animate(anim === 'rise' ? [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
}

chips.forEach(function (c, k) {
c.addEventListener('click', function () { show(k); });
});

// ---------- dropdown ----------
if (btn && list && opts.length) {
var open = false;
var act = 0;
var typed = '', typedAt = 0;
var hoverIn = function (e) { if (!S.rm) btn.style.opacity = e.type === 'mouseenter' ? '.75' : '1'; };
btn.addEventListener('mouseenter', hoverIn);
btn.addEventListener('mouseleave', hoverIn);

function activate(k, scroll) {
act = Math.max(0, Math.min(opts.length - 1, k));
opts.forEach(function (o, n) { S.sty(o, n === act ? actCss : idleCss); });
list.setAttribute('aria-activedescendant', opts[act].id);
if (scroll) {
var o = opts[act];
if (o.offsetTop < list.scrollTop) list.scrollTop = o.offsetTop - 8;
else if (o.offsetTop + o.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = o.offsetTop + o.offsetHeight - list.clientHeight + 8;
}
}
function setOpen(v, refocus) {
if (v === open) return;
open = v;
btn.setAttribute('aria-expanded', v ? 'true' : 'false');
if (chev) S.sty(chev, v ? 'transform:rotate(225deg);margin-bottom:-.02em;' : 'transform:rotate(45deg);margin-bottom:.2em;');
if (!v) {
list.style.display = 'none';
if (refocus) btn.focus();
return;
}
list.style.left = '0px';
list.style.display = 'block';
// Keep the list on screen when the trigger sits near the right edge.
var r = list.getBoundingClientRect();
var vw = window.innerWidth || document.documentElement.clientWidth;
if (r.right > vw - 8) list.style.left = Math.min(0, vw - 8 - r.right) + 'px';
activate(cur < 0 ? 0 : cur, true);
if (list.animate && !S.rm) list.animate([{ opacity: 0, transform: 'translateY(-6px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
list.focus();
}
function choose(k) {
show(k);
setOpen(false, true);
}

btn.addEventListener('click', function () { setOpen(!open, open); });
btn.addEventListener('keydown', function (e) {
var k = e.key;
if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Down' || k === 'Up') { e.preventDefault(); setOpen(true); }
});
list.addEventListener('keydown', function (e) {
var k = e.key;
if (k === 'ArrowDown' || k === 'Down') { e.preventDefault(); activate(act + 1, true); }
else if (k === 'ArrowUp' || k === 'Up') { e.preventDefault(); activate(act - 1, true); }
else if (k === 'Home') { e.preventDefault(); activate(0, true); }
else if (k === 'End') { e.preventDefault(); activate(opts.length - 1, true); }
else if (k === 'Enter' || k === ' ' || k === 'Spacebar') { e.preventDefault(); choose(act); }
else if (k === 'Escape' || k === 'Esc') { e.preventDefault(); setOpen(false, true); }
else if (k === 'Tab') { choose(act); }
else if (k && k.length === 1) {
// Type-ahead: jump to the first option starting with what was typed.
var now = +new Date();
typed = (now - typedAt > 700 ? '' : typed) + k.toLowerCase();
typedAt = now;
for (var n = 0; n < opts.length; n++) {
var t = (opts[n].querySelector('.sfupf-ol') || opts[n]).textContent.toLowerCase();
if (t.indexOf(typed) === 0) { activate(n, true); break; }
}
}
});
opts.forEach(function (o, n) {
o.addEventListener('mouseenter', function () { activate(n, false); });
o.addEventListener('click', function () { choose(n); });
});
list.addEventListener('focusout', function (e) {
if (!e.relatedTarget || (e.relatedTarget !== btn && !list.contains(e.relatedTarget))) setOpen(false);
});
document.addEventListener('mousedown', function (e) {
if (open && !list.contains(e.target) && !btn.contains(e.target)) setOpen(false);
});
}

// Builder preview: show the option being edited.
root.addEventListener('sfub:focus', function (e) {
if (e.detail && e.detail.key === 'options') show(e.detail.index, true);
});
show(0, true);
};
