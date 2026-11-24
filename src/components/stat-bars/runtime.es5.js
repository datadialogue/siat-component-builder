// Stat Bars (ES5). The markup already shows the final bars/rings and numbers.
// This resets them to 0 and fills them when they scroll into view. Skipped for reduced motion.
S.c['stat-bars'] = S.c['stat-bars'] || function (root, S) {
if (S.rm || !window.IntersectionObserver || !window.requestAnimationFrame) return;
if (root.getAttribute('data-anim') !== '1') return;
var dur = +root.getAttribute('data-dur') || 1400;
var ring = root.getAttribute('data-mode') === 'rings';
var items = S.arr(root.querySelectorAll('.sfusb-item')).map(function (el) {
var num = el.querySelector('.sfusb-num');
var txt = num ? num.textContent : '';
return {
el: el,
num: num,
fill: el.querySelector('.sfusb-fill'),
v: parseFloat(el.getAttribute('data-v')) || 0,
dec: (txt.split('.')[1] || '').length
};
});
function paint(it, x) {
if (it.num) it.num.textContent = x.toFixed(it.dec);
if (!it.fill) return;
if (ring) {
var c = it.fill.getAttribute('data-c'), t = it.fill.getAttribute('data-t');
it.fill.style.background = 'conic-gradient(' + c + ' 0 ' + x + '%, ' + t + ' ' + x + '% 100%)';
} else {
it.fill.style.width = x + '%';
}
}
function run(it, delay) {
var start = null;
function frame(ts) {
if (start === null) start = ts + delay;
var t = Math.max(0, Math.min(1, (ts - start) / dur));
var e = 1 - Math.pow(1 - t, 3);
paint(it, t < 1 ? it.v * e : it.v);
if (t < 1) window.requestAnimationFrame(frame);
}
window.requestAnimationFrame(frame);
}
var batch = 0, timer;
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (en) {
if (!en.isIntersecting) return;
io.unobserve(en.target);
for (var i = 0; i < items.length; i++) {
if (items[i].el === en.target) { run(items[i], batch * 120); batch++; }
}
clearTimeout(timer);
timer = setTimeout(function () { batch = 0; }, 80);
});
}, { threshold: 0.3 });
items.forEach(function (it) { paint(it, 0); io.observe(it.el); });
};
