// Path Finder (ES5). Markup ships every option as a stacked panel; this shows the
// dropdown or chips and keeps only the chosen panel visible.
S.c['path-finder'] = S.c['path-finder'] || function (root, S) {
var ctrl = root.querySelector('.sfupf-ctrl');
var sel = root.querySelector('.sfupf-select');
var chips = S.arr(root.querySelectorAll('.sfupf-chip'));
var panels = S.arr(root.querySelectorAll('.sfupf-panel'));
var anim = root.getAttribute('data-anim') || 'none';
var on = root.getAttribute('data-on') || '', off = root.getAttribute('data-off') || '';
if (!ctrl || !panels.length) return;
ctrl.style.display = 'block';
S.arr(root.querySelectorAll('.sfupf-fb')).forEach(function (h) { h.style.display = 'none'; });
panels.forEach(function (p) { p.style.margin = '0'; });
var cur = -1;
function show(i, quiet) {
if (i < 0 || i >= panels.length || i === cur) return;
cur = i;
panels.forEach(function (p, k) { p.style.display = k === i ? '' : 'none'; });
if (sel && +sel.value !== i) sel.value = String(i);
chips.forEach(function (c, k) {
c.setAttribute('aria-pressed', k === i ? 'true' : 'false');
S.sty(c, k === i ? on : off);
});
var p = panels[i];
if (!quiet && p.animate && !S.rm && anim !== 'none') {
p.animate(anim === 'rise' ? [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
}
if (sel) sel.addEventListener('change', function () { show(+sel.value || 0); });
chips.forEach(function (c, k) {
c.addEventListener('click', function () { show(k); });
});
// Builder preview: show the option being edited.
root.addEventListener('sfub:focus', function (e) {
if (e.detail && e.detail.key === 'options') show(e.detail.index, true);
});
show(sel ? (+sel.value || 0) : 0, true);
};
