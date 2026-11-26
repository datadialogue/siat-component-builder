// Rotating Sentence (ES5). The markup shows the first phrase. This rotates through the
// phrases in data-items ([{t:text, u:url, s:inline style}]) with the data-effect
// (roll | type | scramble | fade | reel), fills the progress segments, keeps the index in sync
// and pauses on hover, focus, the pause button, and while off-screen or in a hidden tab.
// Phrases are inline text, so long ones wrap with the sentence. Roll and fade split a
// phrase into words (inline-blocks) and animate them one after another.
S.c['rotator'] = S.c['rotator'] || function (root, S) {
var items;
try { items = JSON.parse(root.getAttribute('data-items') || '[]'); } catch (e) { items = []; }
if (items.length < 2) return;
var slot = root.querySelector('.sfrt-slot');
var cur = root.querySelector('.sfrt-cur');
var effect = root.getAttribute('data-effect') || 'roll';
var col = slot && effect === 'reel' ? slot.querySelector('.sfrt-col') : null;
if (!slot || (!cur && !col)) return;
var hold = parseInt(root.getAttribute('data-hold'), 10) || 2500;
var arrowCss = root.getAttribute('data-arrow') || '';
var ixOn = root.getAttribute('data-on') || '';
var ixOff = root.getAttribute('data-off') || '';
var steps = root.querySelector('.sfrt-steps');
var fills = S.arr(root.querySelectorAll('.sfrt-sf'));
var pauseBtn = root.querySelector('.sfrt-pause');
var ix = S.arr(root.querySelectorAll('.sfrt-ix'));
var canAnim = !!(slot.animate) && !S.rm;
// Preview only: keep phrases selectable after a swap.
var editPath = cur && cur.getAttribute('data-sfub-path');

var order = [];
for (var i = 0; i < items.length; i++) order.push(i);
// The reel shows its neighbours, so it always runs in list order.
if (!col && root.getAttribute('data-order') === 'shuffle') {
for (var j = order.length - 1; j > 1; j--) {
var k = 1 + Math.floor(Math.random() * j);
var tmp = order[j]; order[j] = order[k]; order[k] = tmp;
}
}
var pos = 0;
var shown = 0;
var busy = false;
var timer = 0, started = 0, left = hold;
var fillAnim = null;
var why = { user: false, hover: false, focus: false, away: false, edit: false };

// ---------- building a phrase ----------
function make(n) {
var it = items[n];
var el = document.createElement(it.u ? 'a' : 'span');
if (it.u) el.setAttribute('href', it.u);
el.className = 'sfrt-cur';
S.sty(el, it.s);
el.appendChild(document.createTextNode(it.t));
if (editPath) { el.setAttribute('data-sfub-path', 'items.' + n + '.text'); el.setAttribute('data-sfub-edit', 'text'); }
return el;
}
function arrow(el, n) {
if (!items[n].u || !arrowCss) return null;
var a = document.createElement('span');
a.setAttribute('aria-hidden', 'true');
S.sty(a, arrowCss);
a.appendChild(document.createTextNode('→'));
el.appendChild(a);
return a;
}
function swapIn(el) {
slot.replaceChild(el, cur);
cur = el;
}
// Split the phrase's text into words: a clipping box around a moving inner box each.
// Returns the inner boxes (plus the link arrow) to animate.
function words(el, clip) {
var txt = el.firstChild;
var out = [];
if (!txt || txt.nodeType !== 3) return out;
var parts = txt.nodeValue.split(/(\s+)/);
var frag = document.createDocumentFragment();
for (var q = 0; q < parts.length; q++) {
var w = parts[q];
if (!w) continue;
if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); continue; }
var box = document.createElement('span');
S.sty(box, 'display:inline-block;margin:0;padding:0;' + (clip ? 'clip-path:inset(-.12em -.3em -.28em -.3em);' : ''));
var inner = document.createElement('span');
S.sty(inner, 'display:inline-block;margin:0;padding:0;');
inner.appendChild(document.createTextNode(w));
box.appendChild(inner);
frag.appendChild(box);
out.push(inner);
}
el.replaceChild(frag, txt);
var a = el.lastChild;
if (a && a.nodeType === 1 && a.getAttribute('aria-hidden')) out.push(a);
return out;
}

// ---------- effects ----------
function run(list, frames, dur, ease, cb) {
var gap = Math.min(45, 320 / Math.max(1, list.length));
var last = null;
for (var q = 0; q < list.length; q++) last = list[q].animate(frames, { duration: dur, delay: q * gap, easing: ease, fill: 'both' });
if (last) last.onfinish = cb; else cb();
}
function wordSwap(n, outFrames, inFrames, clip, done) {
var old = cur.wordsList || (cur.wordsList = words(cur, clip));
run(old, outFrames, 300, 'cubic-bezier(.55,0,.75,.2)', function () {
var el = make(n);
arrow(el, n);
var list = el.wordsList = words(el, clip);
swapIn(el);
run(list, inFrames, 560, 'cubic-bezier(.2,.8,.2,1)', done);
});
}
function roll(n, done) {
wordSwap(n,
[{ transform: 'translateY(0)' }, { transform: 'translateY(-115%)' }],
[{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }],
true, done);
}
function fade(n, done) {
wordSwap(n,
[{ opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }, { opacity: 0, filter: 'blur(8px)', transform: 'translateY(-.15em)' }],
[{ opacity: 0, filter: 'blur(8px)', transform: 'translateY(.2em)' }, { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }],
false, done);
}

// Typewriter: delete the old phrase letter by letter, then type the new one, with a caret.
var caret = null;
function type(n, done) {
if (!caret) {
caret = document.createElement('span');
caret.setAttribute('aria-hidden', 'true');
S.sty(caret, 'display:inline-block;width:.06em;min-width:2px;height:.9em;margin:0 0 0 .06em;padding:0;vertical-align:-.08em;background:currentColor;');
caret.animate([{ opacity: 1 }, { opacity: 1, offset: .5 }, { opacity: 0, offset: .51 }, { opacity: 0 }], { duration: 900, iterations: Infinity });
}
var txt = cur.firstChild;
if (!txt || txt.nodeType !== 3) { instant(n, done); return; }
// Drop the arrow (and last round's caret), then put the caret at the end.
while (cur.lastChild && cur.lastChild !== txt) cur.removeChild(cur.lastChild);
cur.appendChild(caret);
var s = txt.nodeValue;
var del = setInterval(function () {
s = s.slice(0, -1);
txt.nodeValue = s;
if (s.length) return;
clearInterval(del);
var el = make(n);
var full = items[n].t;
el.firstChild.nodeValue = '';
el.appendChild(caret);
swapIn(el);
var c = 0;
var add = setInterval(function () {
c++;
el.firstChild.nodeValue = full.slice(0, c);
if (c < full.length) return;
clearInterval(add);
el.removeChild(caret);
arrow(el, n);
el.appendChild(caret);
done();
}, 55);
}, 24);
}

// Scramble: random glyphs settle left to right into the new phrase.
var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&*+=/<>';
function scramble(n, done) {
var from = items[shown].t, to = items[n].t;
var el = make(n);
swapIn(el);
var txt = el.firstChild;
var frames = 22, f = 0;
var len = Math.max(from.length, to.length);
var iv = setInterval(function () {
f++;
var p = f / frames;
var settled = Math.floor(p * to.length);
var curLen = Math.round(from.length + (to.length - from.length) * Math.min(1, p * 1.6));
var out = '';
for (var q = 0; q < Math.min(len, curLen); q++) {
if (q < settled) out += to.charAt(q);
else if (to.charAt(q) === ' ') out += ' ';
else out += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
}
txt.nodeValue = out;
if (f < frames) return;
clearInterval(iv);
txt.nodeValue = to;
arrow(el, n);
done();
}, 34);
}

// Reel: every phrase is a row in a column; the column slides so the current row sits in
// the middle. A clone of the last row sits above the first and clones of the first rows
// sit below the last, so wrapping around keeps rolling up instead of rewinding.
var rows = [], tail = null;
function center(el, animate) {
col.style.transition = animate && !S.rm ? 'transform .75s cubic-bezier(.65,0,.35,1)' : 'none';
var y = slot.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2);
col.style.transform = 'translateY(' + Math.round(y) + 'px)';
}
// Tall enough for the longest phrase plus one plain row above and below, so a phrase
// that wraps on a phone never pushes its neighbours out of view. Fixed, so nothing jumps.
function fit() {
var tall = 0, low = 1e9;
rows.forEach(function (r) { tall = Math.max(tall, r.offsetHeight); low = Math.min(low, r.offsetHeight); });
if (tall) slot.style.height = (tall + 2 * low) + 'px';
}
function light(n) {
S.arr(col.children).forEach(function (r) {
r.style.opacity = +r.getAttribute('data-i') === n ? '1' : '.22';
});
}
function ghost(r) {
var c = r.cloneNode(true);
c.setAttribute('aria-hidden', 'true');
S.arr(c.querySelectorAll('a')).forEach(function (a) { a.setAttribute('tabindex', '-1'); });
S.arr(c.querySelectorAll('[data-sfub-path]')).forEach(function (a) { a.removeAttribute('data-sfub-path'); a.removeAttribute('data-sfub-edit'); });
return c;
}
if (col) {
rows = S.arr(col.querySelectorAll('.sfrt-row'));
col.insertBefore(ghost(rows[rows.length - 1]), rows[0]);
tail = ghost(rows[0]);
col.appendChild(tail);
col.appendChild(ghost(rows[1]));
col.style.paddingTop = '0';
fit();
center(rows[0], false);
light(0);
}
function reel(n, done) {
var wrap = n === 0 && shown === rows.length - 1;
light(n);
center(wrap ? tail : rows[n], true);
setTimeout(function () {
// Landed on the clone of the first row: jump to the real one (it looks identical).
if (wrap) center(rows[0], false);
done();
}, S.rm ? 0 : 760);
}

function instant(n, done) {
var el = make(n);
arrow(el, n);
swapIn(el);
done();
}

// ---------- showing a phrase ----------
function mark(n) {
ix.forEach(function (a) { S.sty(a, +a.getAttribute('data-i') === n ? ixOn : ixOff); });
}
function show(n, cb) {
if (n === shown || busy) { if (cb) cb(); return; }
busy = true;
var fx = col ? reel : !canAnim ? instant : effect === 'type' ? type : effect === 'scramble' ? scramble : effect === 'fade' ? fade : roll;
mark(n);
fx(n, function () {
busy = false;
shown = n;
if (cb) cb();
});
}

// ---------- progress segments ----------
// Segments follow the play order: earlier ones full, the current one filling.
function paintSteps() {
for (var q = 0; q < fills.length; q++) fills[q].style.transform = q < pos ? 'scaleX(1)' : 'scaleX(0)';
}
function startFill(ms) {
var f = fills[pos];
if (fillAnim) { fillAnim.cancel(); fillAnim = null; }
paintSteps();
if (!f) return;
if (!f.animate || S.rm) { f.style.transform = 'scaleX(1)'; return; }
var p0 = 1 - ms / hold;
fillAnim = f.animate([{ transform: 'scaleX(' + p0 + ')' }, { transform: 'scaleX(1)' }], { duration: ms, easing: 'linear', fill: 'forwards' });
}

// ---------- timing ----------
function paused() { return why.user || why.hover || why.focus || why.away || why.edit; }
function schedule(ms) {
clearTimeout(timer);
left = ms;
started = +new Date();
startFill(ms);
timer = setTimeout(tick, ms);
}
function tick() {
timer = 0;
pos = (pos + 1) % order.length;
show(order[pos], function () { if (!paused()) schedule(hold); else { left = hold; startFill(hold); if (fillAnim) fillAnim.pause(); } });
}
function sync() {
if (paused()) {
if (timer) { clearTimeout(timer); timer = 0; left = Math.max(200, left - (+new Date() - started)); }
if (fillAnim) fillAnim.pause();
} else if (!timer && !busy) {
schedule(left);
}
}
function hush(key, v) { why[key] = v; sync(); }
function jump(n) {
for (var q = 0; q < order.length; q++) if (order[q] === n) pos = q;
left = hold;
startFill(hold);
if (fillAnim) fillAnim.pause();
show(n);
}

// ---------- controls ----------
if (steps) S.sty(steps, 'display:flex;');
if (pauseBtn) {
S.sty(pauseBtn, 'display:inline-flex;');
var ip = pauseBtn.querySelector('.sfrt-ip'), iy = pauseBtn.querySelector('.sfrt-iy');
pauseBtn.addEventListener('click', function () {
why.user = !why.user;
pauseBtn.setAttribute('aria-pressed', why.user ? 'true' : 'false');
pauseBtn.setAttribute('aria-label', why.user ? 'Play rotating text' : 'Pause rotating text');
if (ip) ip.style.display = why.user ? 'none' : 'flex';
if (iy) iy.style.display = why.user ? 'block' : 'none';
sync();
});
}
// Hovering the changing phrase holds it, so its link is easy to click.
slot.addEventListener('mouseenter', function () { hush('hover', true); });
slot.addEventListener('mouseleave', function () { hush('hover', false); });
root.addEventListener('focusin', function (e) { if (e.target !== pauseBtn) hush('focus', true); });
root.addEventListener('focusout', function (e) { if (!e.relatedTarget || !root.contains(e.relatedTarget)) hush('focus', false); });
// Index: hovering or focusing a phrase shows it in the sentence.
ix.forEach(function (a) {
var n = +a.getAttribute('data-i');
a.addEventListener('mouseenter', function () { hush('hover', true); jump(n); });
a.addEventListener('mouseleave', function () { hush('hover', false); });
a.addEventListener('focus', function () { jump(n); });
});
// Reel: keyboard focus on a row shows it; keep it centred when the width changes.
if (col) {
rows.forEach(function (r, n) {
r.addEventListener('focusin', function () { jump(n); });
});
window.addEventListener('resize', function () { fit(); if (!busy) center(rows[shown], false); });
}
if (window.IntersectionObserver) {
new IntersectionObserver(function (es) { hush('away', !es[es.length - 1].isIntersecting); }).observe(root);
}
document.addEventListener('visibilitychange', function () { hush('away', document.hidden); });

// Builder preview: hold on the selected phrase while it's being edited.
root.addEventListener('sfub:focus', function (e) {
if (!e.detail || e.detail.key !== 'items') return;
why.edit = true;
sync();
jump(e.detail.index);
});

schedule(hold);
};
