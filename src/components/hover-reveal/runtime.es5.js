// Image Hover Reveal (ES5). Markup ships with the text visible; this hides it and animates it in
// on hover, keyboard focus or tap. Text is only made transparent or moved, so screen readers keep it.
S.c['hover-reveal'] = S.c['hover-reveal'] || function (root, S) {
var fx = root.getAttribute('data-fx') || 'fade';
var ms = +root.getAttribute('data-ms') || 450;
var imgFx = root.getAttribute('data-img') || 'none';
var stag = root.getAttribute('data-stag') === '1' && !S.rm;
var rise = fx === 'rise';
var ease = ' cubic-bezier(.2,.8,.2,1)';
// Overlay states per effect. Reduced motion: plain fade, no movement.
var HIDE = {
fade: 'opacity:0;',
up: 'transform:translateY(101%);',
down: 'transform:translateY(-101%);',
side: 'transform:translateX(-101%);',
zoom: 'opacity:0;transform:scale(1.18);',
circle: 'clip-path:circle(0% at 50% 50%);-webkit-clip-path:circle(0% at 50% 50%);'
};
var SHOW = {
circle: 'clip-path:circle(75% at 50% 50%);-webkit-clip-path:circle(75% at 50% 50%);'
};
var ovHide = S.rm ? 'opacity:0;' : (HIDE[fx] || HIDE.fade);
var ovShow = S.rm ? 'opacity:1;' : (SHOW[fx] || 'opacity:1;transform:none;');
var IMG = {
zoom: ['transform:none;', 'transform:scale(1.08);'],
blur: ['transform:none;filter:none;', 'transform:scale(1.06);filter:blur(4px);'],
grey: ['filter:grayscale(1);', 'filter:grayscale(0);']
};
var img = IMG[imgFx];
if (img && S.rm && imgFx !== 'grey') img = null;
function tr(props, d) {
if (S.rm) return 'opacity 200ms ease';
return props.map(function (p) { return p + ' ' + d + 'ms' + ease; }).join(',');
}
var tiles = S.arr(root.querySelectorAll('.sfuhr-tile')).map(function (el) {
return {
el: el,
ov: el.querySelector('.sfuhr-ov'),
bg: el.querySelector('.sfuhr-bg'),
more: el.querySelector('.sfuhr-more'),
img: el.querySelector('.sfuhr-img'),
lines: S.arr(el.querySelectorAll('.sfuhr-s')),
hov: false, foc: false, pin: false, on: null
};
});
function paint(t, on) {
if (rise) {
if (t.bg) S.sty(t.bg, on ? 'opacity:1;' : 'opacity:.75;');
if (t.more) S.sty(t.more, on ? 'max-height:400px;opacity:1;' : 'max-height:0;opacity:0;');
} else if (t.ov) {
S.sty(t.ov, on ? ovShow : ovHide);
}
if (img && t.img) S.sty(t.img, img[on ? 1 : 0]);
if (stag) {
t.lines.forEach(function (l, k) {
l.style.transitionDelay = on ? (Math.round(ms * 0.3) + k * 70) + 'ms' : '0ms';
S.sty(l, on ? 'opacity:1;transform:none;' : 'opacity:0;transform:translateY(14px);');
});
}
}
function motion(t, off) {
var m = ms;
if (t.ov && !rise) t.ov.style.transition = off ? 'none' : tr(['opacity', 'transform', 'clip-path', '-webkit-clip-path'], m);
if (t.bg) t.bg.style.transition = off ? 'none' : tr(['opacity'], m);
if (t.more) t.more.style.transition = off ? 'none' : tr(['max-height', 'opacity'], m);
if (t.img) t.img.style.transition = off ? 'none' : tr(['transform', 'filter'], Math.round(m * 1.6));
t.lines.forEach(function (l) { l.style.transition = off || !stag ? (off ? 'none' : '') : tr(['opacity', 'transform'], m); });
}
function update(t, instant) {
var on = t.hov || t.foc || t.pin;
if (on === t.on) return;
t.on = on;
if (instant) motion(t, true);
paint(t, on);
if (instant) { void t.el.offsetWidth; motion(t, false); }
}
tiles.forEach(function (t) {
var el = t.el, touched = 0, wasOn = false;
update(t, true);
if (el.tagName !== 'A' && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
el.addEventListener('mouseenter', function () { t.hov = true; update(t); });
el.addEventListener('mouseleave', function () { t.hov = false; update(t); });
el.addEventListener('focusin', function () { t.foc = true; update(t); });
el.addEventListener('focusout', function (e) { t.foc = !!(e.relatedTarget && el.contains(e.relatedTarget)); update(t); });
// Touch: first tap shows the text, second tap follows the link.
el.addEventListener('touchstart', function () {
touched = new Date().getTime();
wasOn = t.on;
tiles.forEach(function (o) { if (o !== t) { o.hov = false; o.pin = false; update(o); } });
}, { passive: true });
el.addEventListener('click', function (e) {
if (new Date().getTime() - touched < 800 && !wasOn) {
e.preventDefault();
t.pin = true;
update(t);
}
});
});
// Builder preview: keep the selected tile's text showing while it is being edited.
root.addEventListener('sfub:focus', function (e) {
if (!e.detail || e.detail.key !== 'tiles') return;
tiles.forEach(function (t, k) { t.pin = k === e.detail.index; update(t, true); });
});
};
