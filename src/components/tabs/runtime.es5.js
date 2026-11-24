// Tabs (ES5). Markup ships as stacked sections; this turns it into accessible tabs.
S.c['tabs'] = S.c['tabs'] || function (root, S) {
var list = root.querySelector('.sfut-list');
var tabs = S.arr(root.querySelectorAll('.sfut-tab'));
var panels = S.arr(root.querySelectorAll('.sfut-panel'));
var on = root.getAttribute('data-on') || '', off = root.getAttribute('data-off') || '';
var anim = root.getAttribute('data-panel-anim') || 'none';
if (!list || !tabs.length) return;
list.style.display = 'flex';
S.arr(root.querySelectorAll('.sfut-fallback')).forEach(function (h) { h.style.display = 'none'; });
var cur = -1;
function select(i, focus) {
i = (i + tabs.length) % tabs.length;
if (i === cur) return;
cur = i;
tabs.forEach(function (t, k) {
var a = k === i;
t.setAttribute('aria-selected', a ? 'true' : 'false');
t.setAttribute('tabindex', a ? '0' : '-1');
S.sty(t, a ? on : off);
});
panels.forEach(function (p, k) {
p.hidden = k !== i;
p.style.display = k === i ? '' : 'none';
});
var p = panels[i];
if (p && p.animate && !S.rm && anim !== 'none') {
p.animate(anim === 'slide' ? [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }] : [{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
}
if (focus) tabs[i].focus();
}
tabs.forEach(function (t, k) {
t.addEventListener('click', function () { select(k); });
t.addEventListener('keydown', function (e) {
var v = list.getAttribute('aria-orientation') === 'vertical';
if (e.key === (v ? 'ArrowDown' : 'ArrowRight')) { e.preventDefault(); select(cur + 1, true); }
else if (e.key === (v ? 'ArrowUp' : 'ArrowLeft')) { e.preventDefault(); select(cur - 1, true); }
else if (e.key === 'Home') { e.preventDefault(); select(0, true); }
else if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
});
});
root.addEventListener('sfub:focus', function (e) { if (e.detail && e.detail.key === 'tabs') select(e.detail.index); });
select(0);
};
