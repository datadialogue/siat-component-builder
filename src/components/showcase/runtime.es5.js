// Project Showcase (ES5). Markup ships every project visible and the filter bar hidden.
// This shows the filters, opens on N random picks from the most recent years (spread
// across topics), filters by year/term and topic, and animates the changes.
// Mosaic tiles get re-sized by visible position; Index gets a floating hover preview;
// Rail gets arrow buttons.
S.c['showcase'] = S.c['showcase'] || function (root, S) {
var list = root.querySelector('.sfsc-list');
var ctl = root.querySelector('.sfsc-ctl');
if (!list) return;
var layout = root.getAttribute('data-layout');
var N = parseInt(root.getAttribute('data-featured'), 10) || 0;
var recent = parseInt(root.getAttribute('data-recent'), 10) || 2;
var ymode = root.getAttribute('data-ymode');
var fx = S.rm ? 'none' : root.getAttribute('data-fx') || 'none';
var anim = root.getAttribute('data-anim') === '1' && !S.rm && !!list.animate;
var gap = parseFloat(root.getAttribute('data-gap')) || 0;
var look = {
tabOn: root.getAttribute('data-tab-on'), tabOff: root.getAttribute('data-tab-off'),
chipOn: root.getAttribute('data-chip-on'), chipOff: root.getAttribute('data-chip-off')
};
var canHover = !!(window.matchMedia && window.matchMedia('(hover: hover)').matches);
var countEl = root.querySelector('.sfsc-count');
var shuf = root.querySelector('.sfsc-shuf');
var allBtn = root.querySelector('.sfsc-all');
var empty = root.querySelector('.sfsc-empty');
var ybtns = S.arr(root.querySelectorAll('[data-fy]'));
var tbtns = S.arr(root.querySelectorAll('[data-ft]'));

var items = S.arr(list.querySelectorAll('.sfsc-it')).map(function (el, i) {
return { el: el, i: i, d: el.style.display, topic: el.getAttribute('data-topic') || '', year: parseInt(el.getAttribute('data-year'), 10) || 0, term: el.getAttribute('data-term') || '' };
});
if (!items.length) return;
var maxY = 0;
items.forEach(function (it) { if (it.year > maxY) maxY = it.year; });
var st = { y: N > 0 ? 'feat' : 'all', t: 'all' };
var picks = null;

function shuffle(a) {
for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var x = a[k]; a[k] = a[j]; a[j] = x; }
return a;
}
function inTime(it, y) {
if (y === 'all') return true;
if (y === 'feat') return !maxY || it.year > maxY - recent;
return ymode === 'term' ? it.term === y : String(it.year) === y;
}
function inTopic(it, t) { return t === 'all' || it.topic === t; }
// Round-robin over shuffled topics, so the picks cover as many topics as possible.
function pick(cands, n) {
var by = {}, order = [], out = [];
cands.forEach(function (it) { if (!by[it.topic]) { by[it.topic] = []; order.push(it.topic); } by[it.topic].push(it); });
shuffle(order);
order.forEach(function (t) { shuffle(by[t]); });
while (out.length < n) {
var got = false;
for (var k = 0; k < order.length && out.length < n; k++) {
if (by[order[k]].length) { out.push(by[order[k]].shift()); got = true; }
}
if (!got) break;
}
return out;
}
function visible() {
var c = items.filter(function (it) { return inTime(it, st.y) && inTopic(it, st.t); });
if (st.y !== 'feat') return c;
if (!picks) picks = pick(c, N);
return picks;
}

// Mosaic: tile sizes follow the visible order, rows follow the column width.
var PAT = ['L', 'S', 'S', 'T', 'W', 'S', 'S', 'W', 'S', 'S', 'T', 'S'];
var SPAN = { S: [1, 1], W: [2, 1], T: [1, 2], L: [2, 2] };
var TSIZE = { S: 17, W: 22, T: 20, L: 30 };
function spans(vis) {
vis.forEach(function (it, k) {
var s = PAT[k % PAT.length];
it.el.style.gridColumn = 'span ' + SPAN[s][0];
it.el.style.gridRow = 'span ' + SPAN[s][1];
var h = it.el.querySelector('.sfsc-t');
if (h) h.style.fontSize = TSIZE[s] + 'px';
});
}
function rows() {
if (layout !== 'mosaic' || !window.getComputedStyle) return;
var w = parseFloat(getComputedStyle(list).gridTemplateColumns.split(' ')[0]);
if (w > 0) list.style.gridAutoRows = Math.round(w * 0.8) + 'px';
}

function words(el, delay) {
if (fx === 'none' || !el.animate) return;
S.arr(el.querySelectorAll('.sfsc-w')).forEach(function (w, j) {
if (!w.animate) return;
w.animate(fx === 'rise' ? [{ transform: 'translateY(110%)' }, { transform: 'none' }] : [{ opacity: 0 }, { opacity: 1 }],
{ duration: 560, delay: delay + 140 + j * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
});
}
function enter(vis) {
vis.forEach(function (it, k) {
var d = Math.min(k, 12) * 45;
if (anim && it.el.animate) it.el.animate([{ opacity: 0, transform: 'translateY(18px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: d, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
words(it.el, anim ? d : 0);
});
}

function paintButtons() {
ybtns.forEach(function (b) {
var on = b.getAttribute('data-fy') === st.y;
S.sty(b, on ? look.tabOn : look.tabOff);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
// Topic counts follow the time filter (and the recent window while showing picks).
var n = {}, total = 0;
items.forEach(function (it) { if (inTime(it, st.y)) { n[it.topic] = (n[it.topic] || 0) + 1; total++; } });
tbtns.forEach(function (b) {
var v = b.getAttribute('data-ft'), on = v === st.t;
var c = v === 'all' ? total : n[v] || 0;
var cnt = b.querySelector('.sfsc-n');
if (cnt) cnt.textContent = c;
S.sty(b, (on ? look.chipOn : look.chipOff) + (c || on ? 'opacity:1;cursor:pointer;' : 'opacity:.4;cursor:default;'));
b.disabled = !c && !on;
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
}

var track = layout === 'rail' ? list : null;
function apply(animate) {
var vis = visible();
var on = {};
vis.forEach(function (it) { on[it.i] = 1; });
// Picks show in their random order; everything else keeps the authored order.
var order = st.y === 'feat' ? vis.concat(items.filter(function (it) { return !on[it.i]; })) : items;
order.forEach(function (it) { list.appendChild(it.el); });
items.forEach(function (it) { it.el.style.display = on[it.i] ? it.d : 'none'; });
if (layout === 'mosaic') spans(vis);
if (track) track.scrollLeft = 0;
paintButtons();
if (countEl) {
countEl.textContent = st.y === 'feat'
? vis.length + (vis.length === 1 ? ' pick' : ' random picks') + (maxY ? ' from ' + (recent > 1 ? (maxY - recent + 1) + '–' : '') + maxY : '')
: vis.length + (vis.length === 1 ? ' project' : ' projects');
}
if (shuf) shuf.style.display = st.y === 'feat' && vis.length > 1 ? 'inline-block' : 'none';
if (allBtn) allBtn.style.display = st.y === 'feat' ? 'inline-block' : 'none';
if (empty) empty.style.display = vis.length ? 'none' : 'block';
railUpdate();
if (animate) enter(vis);
}
function set(y, t) {
if (y !== null) st.y = y;
if (t !== null) st.t = t;
picks = null;
apply(true);
}

if (ctl) ctl.style.display = 'flex';
ybtns.forEach(function (b) { b.addEventListener('click', function () { set(b.getAttribute('data-fy'), null); }); });
tbtns.forEach(function (b) { b.addEventListener('click', function () { if (!b.disabled) set(null, b.getAttribute('data-ft')); }); });
if (shuf) shuf.addEventListener('click', function () { picks = null; apply(true); });
if (allBtn) allBtn.addEventListener('click', function () { set('all', null); });

// Mosaic: details show on hover/focus where hovering is possible; image zooms.
if (layout === 'mosaic') {
rows();
var rt;
window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(rows, 100); });
}
if (layout === 'mosaic' || layout === 'rail' || layout === 'grid' || layout === 'masonry') {
S.arr(root.querySelectorAll('.sfsc-tile')).forEach(function (el) {
var more = el.querySelector('.sfsc-more');
var img = el.querySelector('.sfsc-img');
var hide = canHover && layout === 'mosaic' && more;
function paint(onn) {
if (hide) S.sty(more, onn ? 'max-height:200px;opacity:1;' : 'max-height:0;opacity:0;');
if (img && !S.rm) img.style.transform = onn ? 'scale(1.06)' : '';
}
if (hide && el.tagName !== 'A') el.setAttribute('tabindex', '0');
paint(false);
el.addEventListener('mouseenter', function () { paint(true); });
el.addEventListener('mouseleave', function () { paint(false); });
el.addEventListener('focusin', function () { paint(true); });
el.addEventListener('focusout', function () { paint(false); });
});
}

// Index: other rows dim, the arrow nudges, and a preview image follows the cursor.
if (layout === 'index') {
var fl = null, fimg = null, rr = null;
if (canHover) {
fl = document.createElement('div');
fl.setAttribute('aria-hidden', 'true');
S.sty(fl, 'position:absolute;left:0;top:0;width:300px;height:225px;margin:0;padding:0;pointer-events:none;opacity:0;z-index:5;overflow:hidden;border-radius:8px;background:#222;box-shadow:0 18px 40px rgba(0,0,0,.28);transition:opacity .2s ease' + (S.rm ? '' : ',transform .12s ease-out') + ';');
fimg = document.createElement('img');
fimg.alt = '';
S.sty(fimg, 'position:absolute;top:0;left:0;width:100%;height:100%;max-width:none;margin:0;padding:0;border:0;object-fit:cover;');
fl.appendChild(fimg);
root.appendChild(fl);
}
var place = function (e) {
if (!fl) return;
rr = root.getBoundingClientRect();
var x = Math.min(e.clientX - rr.left + 28, rr.width - 300);
var y = Math.max(0, Math.min(e.clientY - rr.top - 112, rr.height - 225));
fl.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)' + (S.rm ? '' : ' rotate(-2deg)');
};
var rowEls = items.map(function (it) { return it.el.querySelector('.sfsc-row'); });
rowEls.forEach(function (r, k) {
if (!r) return;
var on = function (e) {
rowEls.forEach(function (o, j) { if (o) o.style.opacity = j === k ? '1' : '.4'; });
var a = r.querySelector('.sfsc-arrow');
if (a && !S.rm) a.style.transform = 'translateX(6px)';
var im = r.querySelector('.sfsc-img');
if (fl && im && e && e.type === 'mouseenter') { fimg.src = im.currentSrc || im.src; fl.style.opacity = '1'; place(e); }
};
var off = function () {
rowEls.forEach(function (o) { if (o) o.style.opacity = '1'; });
var a = r.querySelector('.sfsc-arrow');
if (a) a.style.transform = 'none';
if (fl) fl.style.opacity = '0';
};
r.addEventListener('mouseenter', on);
r.addEventListener('mousemove', place);
r.addEventListener('mouseleave', off);
r.addEventListener('focus', on);
r.addEventListener('blur', off);
});
}

// Rail: arrow buttons and arrow keys.
var prev = root.querySelector('.sfsc-prev'), next = root.querySelector('.sfsc-next');
function railUpdate() {
if (!track) return;
var max = track.scrollWidth - track.clientWidth, scrolls = max > 2;
[prev, next].forEach(function (b, k) {
if (!b) return;
var off = k ? track.scrollLeft >= max - 2 : track.scrollLeft <= 2;
b.disabled = off;
S.sty(b, (scrolls ? 'display:inline-flex;' : 'display:none;') + (off ? 'opacity:.3;cursor:default;' : 'opacity:1;cursor:pointer;'));
});
}
function go(dir) {
var c = null;
for (var k = 0; k < items.length && !c; k++) if (items[k].el.style.display !== 'none') c = items[k].el;
var x = track.scrollLeft + dir * (c ? c.offsetWidth + gap : track.clientWidth * 0.8);
if (track.scrollTo) track.scrollTo({ left: x, behavior: S.rm ? 'auto' : 'smooth' });
else track.scrollLeft = x;
}
if (track) {
if (prev) prev.addEventListener('click', function () { go(-1); });
if (next) next.addEventListener('click', function () { go(1); });
track.addEventListener('scroll', railUpdate);
window.addEventListener('resize', railUpdate);
track.addEventListener('keydown', function (e) {
var k = e.key || e.keyCode;
if (k === 'ArrowLeft' || k === 37) { e.preventDefault(); go(-1); }
else if (k === 'ArrowRight' || k === 39) { e.preventDefault(); go(1); }
});
S.sty(track, 'scrollbar-width:none;');
S.css('sfsc-css', '.sfsc-list::-webkit-scrollbar{display:none}');
}

// Narrow widths (no media queries in AEM): filter rows scroll sideways instead of
// wrapping, and Index rows drop their fixed side columns and arrow.
var scrollRows = S.arr(root.querySelectorAll('.sfsc-scroll'));
var cols = S.arr(root.querySelectorAll('.sfsc-col'));
var arrows = S.arr(root.querySelectorAll('.sfsc-arrow'));
var narrow = null;
function fit() {
var n = root.offsetWidth > 0 && root.offsetWidth < 640;
if (n === narrow) return;
narrow = n;
scrollRows.forEach(function (g) { S.sty(g, n ? 'flex-wrap:nowrap;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;' : 'flex-wrap:wrap;overflow-x:visible;overflow-y:visible;'); });
cols.forEach(function (c) { c.style.minWidth = n ? '0' : '150px'; });
arrows.forEach(function (a) { a.style.display = n ? 'none' : ''; });
}
S.css('sfsc-css2', '.sfsc-scroll::-webkit-scrollbar{display:none}');
fit();
var ft;
window.addEventListener('resize', function () { clearTimeout(ft); ft = setTimeout(fit, 80); });

apply(false);

// Play the entrance (and the title motion) once, when the showcase scrolls into view.
if ((anim || fx !== 'none') && window.IntersectionObserver) {
var io = new IntersectionObserver(function (es) {
if (!es[0].isIntersecting) return;
io.disconnect();
enter(visible());
}, { threshold: 0.12 });
io.observe(list);
}

// Builder preview: make sure the project being edited is on screen.
root.addEventListener('sfub:focus', function (e) {
if (!e.detail || e.detail.key !== 'items') return;
var it = items[e.detail.index];
if (!it) return;
if (it.el.style.display === 'none') { st.y = 'all'; st.t = 'all'; picks = null; apply(false); }
if (track) track.scrollLeft = it.el.offsetLeft - track.offsetLeft - 2;
});
};
