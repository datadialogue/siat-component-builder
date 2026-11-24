// Stats count-up (ES5). Final numbers are in the markup, so nothing breaks without JS.
S.c['stats'] = S.c['stats'] || function (root, S) {
if (S.rm || S.skipAnim) return;
var dur = +root.getAttribute('data-dur') || 1600;
var nums = S.arr(root.querySelectorAll('.sfus-num'));
function fmt(n, dec, commas) {
var s = n.toFixed(dec);
if (!commas) return s;
var p = s.split('.');
p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
return p.join('.');
}
function run(el) {
var raw = el.textContent;
var target = parseFloat(raw.replace(/,/g, ''));
if (isNaN(target)) return;
var dec = (raw.split('.')[1] || '').length;
var commas = raw.indexOf(',') > -1;
var t0 = null;
function step(t) {
if (t0 === null) t0 = t;
var k = Math.min(1, (t - t0) / dur);
var e = 1 - Math.pow(1 - k, 3);
el.textContent = fmt(target * e, dec, commas);
if (k < 1) requestAnimationFrame(step); else el.textContent = raw;
}
el.textContent = fmt(0, dec, commas);
requestAnimationFrame(step);
}
if (!window.IntersectionObserver) return;
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); run(en.target); } });
}, { threshold: 0.4 });
nums.forEach(function (n) { io.observe(n); });
};
