// Rail (ES5). The row already scrolls natively (overflow + scroll-snap). This adds
// prev/next buttons, a progress bar and arrow keys. All of it is hidden in the markup.
S.c['rail'] = S.c['rail'] || function (root, S) {
var track = root.querySelector('.sfurl-track');
if (!track) return;
var prev = root.querySelector('.sfurl-prev');
var next = root.querySelector('.sfurl-next');
var bar = root.querySelector('.sfurl-bar');
var fill = root.querySelector('.sfurl-fill');
var gap = parseFloat(root.getAttribute('data-gap')) || 0;
// Hide the native scrollbar once our own controls exist (WebKit needs a real rule).
S.sty(track, 'scrollbar-width:none;-ms-overflow-style:none;');
S.css('sfurl-css', '.sfurl-track::-webkit-scrollbar{display:none}');
function step() {
var c = track.children[0];
return c ? c.offsetWidth + gap : track.clientWidth * 0.8;
}
function go(dir) {
var x = track.scrollLeft + dir * step();
if (track.scrollTo) track.scrollTo({ left: x, behavior: S.rm ? 'auto' : 'smooth' });
else track.scrollLeft = x;
}
function state(b, off) {
if (!b) return;
b.disabled = off;
S.sty(b, off ? 'opacity:.3;cursor:default;' : 'opacity:1;cursor:pointer;');
}
var raf = 0;
function update() {
raf = 0;
var max = track.scrollWidth - track.clientWidth;
var scrolls = max > 2;
if (prev) S.sty(prev, scrolls ? 'display:inline-flex;' : 'display:none;');
if (next) S.sty(next, scrolls ? 'display:inline-flex;' : 'display:none;');
if (bar) S.sty(bar, scrolls ? 'display:block;' : 'display:none;');
state(prev, track.scrollLeft <= 2);
state(next, track.scrollLeft >= max - 2);
if (fill && scrolls) {
var w = Math.max(8, (track.clientWidth / track.scrollWidth) * 100);
var p = Math.min(1, Math.max(0, track.scrollLeft / max));
fill.style.width = w + '%';
fill.style.marginLeft = (p * (100 - w)) + '%';
}
}
function later() { if (!raf) raf = (window.requestAnimationFrame || setTimeout)(update); }
if (prev) prev.addEventListener('click', function () { go(-1); });
if (next) next.addEventListener('click', function () { go(1); });
track.addEventListener('scroll', later);
window.addEventListener('resize', later);
track.addEventListener('keydown', function (e) {
var k = e.key || e.keyCode;
if (k === 'ArrowLeft' || k === 37) { e.preventDefault(); go(-1); }
else if (k === 'ArrowRight' || k === 39) { e.preventDefault(); go(1); }
});
// Images load late and change widths; re-measure when they do.
S.arr(track.querySelectorAll('img')).forEach(function (im) { im.addEventListener('load', later); });
update();
// Builder preview: scroll the selected card into view.
root.addEventListener('sfub:focus', function (e) {
if (!e.detail || e.detail.key !== 'items') return;
var c = track.children[e.detail.index];
if (c) track.scrollLeft = c.offsetLeft - track.offsetLeft - 2;
});
};
