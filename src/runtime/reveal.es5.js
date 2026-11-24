// Entrance animation on scroll (Web Animations API + IntersectionObserver). No stylesheet needed.
// Root attrs: data-sfub-anim (fade|up|down|left|right|zoom), -dur, -delay, -stagger, -ease.
S.reveal = S.reveal || function (root) {
if (S.rm || S.skipAnim || !root.animate) return;
var g = function (k) { return root.getAttribute('data-sfub-' + k); };
var from = { fade: 'none', up: 'translateY(28px)', down: 'translateY(-28px)', left: 'translateX(-36px)', right: 'translateX(36px)', zoom: 'scale(.9)' }[g('anim')] || 'none';
var dur = +g('dur') || 600, delay = +g('delay') || 0, stag = +g('stagger') || 0;
var ease = { spring: 'cubic-bezier(.34,1.56,.64,1)', linear: 'linear' }[g('ease')] || 'cubic-bezier(.2,.8,.2,1)';
var els = S.arr(root.querySelectorAll('[data-sfub-reveal]'));
if (!els.length) els = [root];
var batch = 0, timer;
function play(el) {
el.style.opacity = '';
el.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }], { duration: dur, delay: delay + batch * stag, easing: ease, fill: 'backwards' });
batch++;
clearTimeout(timer);
timer = setTimeout(function () { batch = 0; }, 60);
}
if (!window.IntersectionObserver) { els.forEach(play); return; }
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (en) {
if (en.isIntersecting) { io.unobserve(en.target); play(en.target); }
});
}, { threshold: 0.12 });
els.forEach(function (el) { el.style.opacity = '0'; io.observe(el); });
};
