// Hover List (ES5). Hover/focus a row: other rows dim and its image shows, floating by the
// cursor ("follow") or in a side panel ("side"). Touch: first tap expands the row inline,
// second tap follows the link. Reduced motion: no cursor following, images just swap.
S.c['hover-list'] = S.c['hover-list'] || function (root, S) {
var side = root.getAttribute('data-layout') === 'side';
var textHover = root.getAttribute('data-texthover') === '1';
var list = root.querySelector('.sfuhl-list');
var panel = root.querySelector('.sfuhl-side');
var float = root.querySelector('.sfuhl-float');
var fimgs = S.arr(root.querySelectorAll('.sfuhl-fimg'));
var simgs = S.arr(root.querySelectorAll('.sfuhl-simg'));
var rows = S.arr(root.querySelectorAll('.sfuhl-row')).map(function (el) {
return { el: el, a: el.querySelector('.sfuhl-a'), more: el.querySelector('.sfuhl-more'), inl: el.querySelector('.sfuhl-inl'), arrow: el.querySelector('.sfuhl-arrow') };
});
if (!list || !rows.length) return;
var act = -1, exp = -1, shown = 0, wide = true, mouse = false, fx = 0, fy = 0;
function measure() {
wide = root.offsetWidth >= 700;
if (panel) panel.style.display = wide ? 'block' : 'none';
if (float && !wide) S.sty(float, 'display:none;opacity:0;');
}
function pickImg(imgs, i) {
imgs.forEach(function (im) { im.style.opacity = +im.getAttribute('data-i') === i ? '1' : '0'; });
}
function placeFloat(i) {
if (!float) return;
var fw = float.offsetWidth || 300, fh = float.offsetHeight || 225;
var rr = root.getBoundingClientRect();
var x, y;
if (mouse && !S.rm) { x = fx + 28; y = fy - fh / 2; }
else {
var r = rows[i].el.getBoundingClientRect();
x = rr.width - fw - 8;
y = r.top - rr.top + r.height / 2 - fh / 2;
}
x = Math.max(0, Math.min(x, rr.width - fw));
y = Math.max(0, Math.min(y, rr.height - fh));
float.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
}
function paint() {
var lit = act >= 0 ? act : exp;
rows.forEach(function (r, k) {
var on = k === lit;
r.el.style.opacity = act >= 0 && k !== act ? '.35' : '1';
if (r.arrow) r.arrow.style.transform = on && !S.rm ? 'translateX(8px)' : 'none';
var open = k === exp || (textHover ? on : true);
if (r.more && textHover) S.sty(r.more, open ? 'max-height:900px;opacity:1;' : 'max-height:0;opacity:0;');
if (r.inl) r.inl.style.display = k === exp ? 'block' : 'none';
});
if (side && act >= 0) { shown = act; pickImg(simgs, act); }
if (float) {
var showF = wide && act >= 0 && exp < 0 && !!root.querySelector('.sfuhl-fimg[data-i="' + act + '"]');
if (showF) {
float.style.display = 'block';
pickImg(fimgs, act);
placeFloat(act);
float.style.opacity = '1';
} else {
float.style.opacity = '0';
}
}
}
function noAnim(on) {
rows.forEach(function (r) {
if (r.more) r.more.style.transition = on ? 'none' : '';
});
}
noAnim(true);
measure();
paint();
void root.offsetWidth;
noAnim(false);
if (S.rm && float) float.style.transition = 'opacity .2s ease';
rows.forEach(function (r, k) {
var touched = 0, wasOpen = false;
r.el.addEventListener('mouseenter', function () { if (new Date().getTime() - touched > 800) { act = k; paint(); } });
r.a.addEventListener('focus', function () { mouse = false; act = k; paint(); });
r.a.addEventListener('blur', function () { if (act === k) { act = -1; paint(); } });
r.el.addEventListener('touchstart', function () { touched = new Date().getTime(); wasOpen = exp === k; }, { passive: true });
r.a.addEventListener('click', function (e) {
var isTouch = new Date().getTime() - touched < 800;
if ((isTouch || !r.a.getAttribute('href')) && !wasOpen) {
if (r.a.getAttribute('href')) e.preventDefault();
exp = k; act = -1; wasOpen = true; paint();
} else if (!r.a.getAttribute('href') && wasOpen) {
exp = -1; wasOpen = false; paint();
}
});
});
list.addEventListener('mousemove', function (e) {
mouse = true;
if (!float || S.rm) return;
var rr = root.getBoundingClientRect();
fx = e.clientX - rr.left; fy = e.clientY - rr.top;
if (act >= 0) placeFloat(act);
});
list.addEventListener('mouseleave', function () { act = -1; paint(); });
window.addEventListener('resize', function () { measure(); paint(); });
// Builder preview: expand the row being edited.
root.addEventListener('sfub:focus', function (e) {
if (!e.detail || e.detail.key !== 'items') return;
exp = e.detail.index; act = -1;
if (side) { shown = exp; pickImg(simgs, exp); }
paint();
});
};
