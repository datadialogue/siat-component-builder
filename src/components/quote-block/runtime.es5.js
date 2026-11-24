// Quote Block slider (ES5). Markup ships stacked; this overlays the quotes in one grid cell
// (no height jumps) and adds prev/next, dots and optional autoplay that pauses on hover/focus.
S.c['quote-block'] = S.c['quote-block'] || function (root, S) {
var track = root.querySelector('.sfqb-t');
var slides = S.arr(root.querySelectorAll('.sfqb-s'));
var ctl = root.querySelector('.sfqb-c');
if (!track || slides.length < 2 || !ctl) return;
var dots = S.arr(root.querySelectorAll('.sfqb-dot'));
var pauseBtn = root.querySelector('.sfqb-pause');
var on = root.getAttribute('data-on') || '', off = root.getAttribute('data-off') || '';
var every = +root.getAttribute('data-auto') || 0;
if (S.rm) every = 0;
S.sty(track, 'display:grid;gap:0;');
ctl.style.display = 'flex';
if (pauseBtn && !every) pauseBtn.style.display = 'none';
track.setAttribute('aria-live', every ? 'off' : 'polite');
slides.forEach(function (s) {
S.sty(s, 'grid-area:1 / 1;transition:' + (S.rm ? 'none' : 'opacity .5s ease, visibility .5s') + ';');
});
var cur = -1;
function show(i) {
i = (i + slides.length) % slides.length;
if (i === cur) return;
cur = i;
slides.forEach(function (s, k) {
var a = k === i;
S.sty(s, a ? 'opacity:1;visibility:visible;' : 'opacity:0;visibility:hidden;');
if (a) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
});
dots.forEach(function (d, k) {
S.sty(d, k === i ? on : off);
if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
});
}
var timer = null, paused = false, hover = false, focus = false;
function tick() {
clearTimeout(timer);
if (!every || paused || hover || focus) return;
timer = setTimeout(function () { show(cur + 1); tick(); }, every);
}
root.querySelector('.sfqb-prev').addEventListener('click', function () { show(cur - 1); tick(); });
root.querySelector('.sfqb-next').addEventListener('click', function () { show(cur + 1); tick(); });
dots.forEach(function (d, k) { d.addEventListener('click', function () { show(k); tick(); }); });
if (pauseBtn && every) {
pauseBtn.addEventListener('click', function () {
paused = !paused;
var label = pauseBtn.getAttribute(paused ? 'data-play' : 'data-pause');
pauseBtn.setAttribute('aria-label', label);
pauseBtn.textContent = label;
tick();
});
}
root.addEventListener('mouseenter', function () { hover = true; tick(); });
root.addEventListener('mouseleave', function () { hover = false; tick(); });
root.addEventListener('focusin', function () { focus = true; tick(); });
root.addEventListener('focusout', function (e) { focus = !!(e.relatedTarget && root.contains(e.relatedTarget)); tick(); });
// Builder preview: show the quote being edited.
root.addEventListener('sfub:focus', function (e) {
if (e.detail && e.detail.key === 'quotes') show(e.detail.index);
});
show(0);
tick();
};
