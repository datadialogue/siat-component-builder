// Card Rows (ES5). Every row already scrolls natively (overflow + scroll-snap). This adds,
// per row: prev/next arrows that page through it, page marks and arrow keys.
// The arrows and page marks are hidden in the markup and shown only when a row overflows.
S.c['card-rows'] = S.c['card-rows'] || function (root, S) {
var gap = parseFloat(root.getAttribute('data-gap')) || 0;
var byPage = root.getAttribute('data-step') !== 'card';
var on = '#ffffff';
var off = 'rgba(127,127,127,.45)';
// Hide native scrollbars once our own controls exist (WebKit needs a real rule).
S.css('sfcr-css', '[data-sfub="card-rows"] .sfcr-track::-webkit-scrollbar{display:none}');

function setup(row) {
var track = row.querySelector('.sfcr-track');
if (!track) return null;
var prev = row.querySelector('.sfcr-prev');
var next = row.querySelector('.sfcr-next');
var pager = row.querySelector('.sfcr-pager');
var edges = S.arr(row.querySelectorAll('.sfcr-edge'));
var hot = false;
var marks = [];
S.sty(track, 'scrollbar-width:none;-ms-overflow-style:none;');

function cardStep() {
var c = track.children[0];
return c ? c.offsetWidth + gap : track.clientWidth * 0.8;
}
// One page = as many whole cards as fit, so a page turn never cuts a card in half.
function pageStep() {
var s = cardStep();
return Math.max(1, Math.floor((track.clientWidth + gap) / s)) * s;
}
function max() { return track.scrollWidth - track.clientWidth; }
function go(dir) {
var x = track.scrollLeft + dir * (byPage ? pageStep() : cardStep());
if (track.scrollTo) track.scrollTo({ left: x, behavior: S.rm ? 'auto' : 'smooth' });
else track.scrollLeft = x;
}
function btn(b, enabled, show) {
if (!b) return;
var edge = b.className.indexOf('sfcr-edge') >= 0;
b.disabled = !enabled;
if (!show) { S.sty(b, 'display:none;'); return; }
S.sty(b, 'display:flex;');
if (edge) S.sty(b, enabled ? 'opacity:' + (hot ? '1' : '0') + ';cursor:pointer;pointer-events:auto;' : 'opacity:0;cursor:default;pointer-events:none;');
else S.sty(b, enabled ? 'opacity:1;cursor:pointer;' : 'opacity:.3;cursor:default;');
}
function buildMarks(n) {
if (!pager || marks.length === n) return;
pager.innerHTML = '';
marks = [];
for (var i = 0; i < n; i++) {
var m = document.createElement('span');
S.sty(m, 'display:block;width:14px;height:3px;margin:0;padding:0;border-radius:2px;transition:background-color .2s ease;');
pager.appendChild(m);
marks.push(m);
}
}
function update() {
var m = max();
var scrolls = m > 2;
var x = track.scrollLeft;
btn(prev, x > 2, scrolls);
btn(next, x < m - 2, scrolls);
// Match the edge arrows to the image height (cards can shrink on narrow screens).
var img = track.querySelector('.sfcr-card img');
if (img && img.parentNode && img.parentNode.offsetHeight) {
edges.forEach(function (b) { b.style.height = img.parentNode.offsetHeight + 'px'; });
}
if (!pager) return;
if (!scrolls) { S.sty(pager, 'display:none;'); return; }
var ps = pageStep();
var n = Math.min(12, Math.ceil(m / ps - 0.05) + 1);
buildMarks(n);
var cur = x >= m - 2 ? n - 1 : Math.min(n - 1, Math.round(x / ps));
for (var i = 0; i < marks.length; i++) marks[i].style.backgroundColor = i === cur ? on : off;
S.sty(pager, 'display:flex;');
}
var raf = 0;
function later() {
if (raf) return;
raf = 1;
(window.requestAnimationFrame || setTimeout)(function () { raf = 0; update(); });
}
function heat(v) { hot = v; update(); }

if (prev) prev.addEventListener('click', function () { go(-1); });
if (next) next.addEventListener('click', function () { go(1); });
track.addEventListener('scroll', later);
track.addEventListener('keydown', function (e) {
var k = e.key || e.keyCode;
if (k === 'ArrowLeft' || k === 37) { e.preventDefault(); go(-1); }
else if (k === 'ArrowRight' || k === 39) { e.preventDefault(); go(1); }
});
// Edge arrows fade in while the pointer or keyboard focus is in the row.
if (edges.length) {
row.addEventListener('mouseenter', function () { heat(true); });
row.addEventListener('mouseleave', function () { heat(false); });
row.addEventListener('focusin', function () { heat(true); });
row.addEventListener('focusout', function (e) { if (!e.relatedTarget || !row.contains(e.relatedTarget)) heat(false); });
}
// Images load late and change widths; re-measure when they do.
S.arr(track.querySelectorAll('img')).forEach(function (im) { im.addEventListener('load', later); });
update();
return { track: track, update: later };
}

var rows = S.arr(root.querySelectorAll('.sfcr-row')).map(setup);
// The active page mark uses the theme's text colour.
if (root.style.color) on = root.style.color;
rows.forEach(function (r) { if (r) r.update(); });
window.addEventListener('resize', function () { rows.forEach(function (r) { if (r) r.update(); }); });

// Builder preview: scroll the selected card into view.
root.addEventListener('sfub:focus', function (e) {
var m = e.detail && /^rows\.(\d+)\.cards\.(\d+)/.exec(e.detail.path || '');
if (!m || !rows[+m[1]]) return;
var t = rows[+m[1]].track;
var c = t.children[+m[2]];
// The track is position:relative, so offsetLeft is already relative to it.
if (c) t.scrollLeft = c.offsetLeft;
});
};
