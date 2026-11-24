// Statement (ES5). Pill links fill on hover/focus. With data-reveal="words", words brighten
// one by one as the statement scrolls through the viewport. Markup ships fully visible.
S.c['statement'] = S.c['statement'] || function (root, S) {
S.arr(root.querySelectorAll('.sfst-pill')).forEach(function (a) {
var on = a.getAttribute('data-on'), off = a.getAttribute('data-off');
function set(v) { S.sty(a, v ? on : off); }
a.addEventListener('mouseenter', function () { set(true); });
a.addEventListener('mouseleave', function () { set(false); });
a.addEventListener('focus', function () { set(true); });
a.addEventListener('blur', function () { set(false); });
});
if (root.getAttribute('data-reveal') !== 'words' || S.rm) return;
var words = S.arr(root.querySelectorAll('.sfst-w'));
if (!words.length) return;
var last = -1, ticking = false;
words.forEach(function (w) { w.style.transition = 'opacity .3s linear'; });
function update() {
ticking = false;
var r = root.getBoundingClientRect();
var de = document.documentElement;
var vh = window.innerHeight || de.clientHeight;
// Starts when the top passes 90% of the viewport, ends when the bottom reaches 55%.
var start = vh * 0.9, end = vh * 0.55;
var total = r.height + (start - end);
var p = total > 0 ? (start - r.top) / total : 1;
// Nothing more to scroll (end of page, or a short embed): show everything.
if ((window.pageYOffset || de.scrollTop) + vh >= de.scrollHeight - 4) p = 1;
if (p < 0) p = 0;
if (p > 1) p = 1;
var n = Math.round(p * words.length);
if (n === last) return;
last = n;
for (var i = 0; i < words.length; i++) words[i].style.opacity = i < n ? '1' : '.18';
}
function onScroll() {
if (ticking) return;
ticking = true;
if (window.requestAnimationFrame) window.requestAnimationFrame(update); else setTimeout(update, 16);
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
update();
};
