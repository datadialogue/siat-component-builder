// Marquee (ES5). Markup is a static, clipped line. "loop": Web Animations ticker that pauses
// on hover/focus and has a pause button. "scroll": slides with page scroll. Reduced motion: static.
S.c['marquee'] = S.c['marquee'] || function (root, S) {
var vp = root.querySelector('.sfmq-vp');
var track = root.querySelector('.sfmq-t');
var btn = root.querySelector('.sfmq-btn');
if (!vp || !track || S.rm) return;
var mode = root.getAttribute('data-mode') || 'loop';
var speed = +root.getAttribute('data-speed') || 60;
var rev = root.getAttribute('data-dir') === 'right';
var groups = S.arr(track.querySelectorAll('.sfmq-g'));
var first = groups[0], copy = groups[1];
if (!first) return;
// Add aria-hidden copies until the track is at least one group wider than the viewport.
function fill() {
var gw = first.offsetWidth, vw = vp.offsetWidth;
var n = track.querySelectorAll('.sfmq-g').length;
while (copy && gw > 0 && n * gw < gw + vw && n < 30) { track.appendChild(copy.cloneNode(true)); n++; }
return gw;
}
if (mode === 'scroll') {
var ticking = false;
var update = function () {
ticking = false;
var r = root.getBoundingClientRect();
var vh = window.innerHeight || document.documentElement.clientHeight;
var p = (vh - r.top) / (vh + r.height);
if (p < 0) p = 0;
if (p > 1) p = 1;
// Travel about one phrase (not the whole track), so the text glides instead of racing past.
var vw = vp.offsetWidth;
var range = Math.min(track.scrollWidth - vw, first.offsetWidth - vw * 0.4);
if (range < vw * 0.3) range = Math.min(track.scrollWidth - vw, vw * 0.3);
if (range < 0) range = 0;
var x = rev ? -(1 - p) * range : -p * range;
track.style.transform = 'translate3d(' + Math.round(x) + 'px,0,0)';
};
var onScroll = function () {
if (ticking) return;
ticking = true;
if (window.requestAnimationFrame) window.requestAnimationFrame(update); else setTimeout(update, 16);
};
fill();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
update();
return;
}
if (!track.animate) return;
var anim = null, userPaused = false, hover = false, focus = false;
function sync() {
if (!anim) return;
if (userPaused || hover || focus) anim.pause(); else anim.play();
}
function start() {
var gw = fill();
if (!gw) return;
var t = anim ? anim.currentTime : 0;
if (anim) anim.cancel();
anim = track.animate(
[{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(' + (-gw) + 'px,0,0)' }],
{ duration: Math.max(2000, gw / speed * 1000), iterations: Infinity, direction: rev ? 'reverse' : 'normal' }
);
if (t) anim.currentTime = t;
sync();
}
if (btn) {
btn.style.display = 'block';
btn.addEventListener('click', function () {
userPaused = !userPaused;
btn.setAttribute('aria-label', btn.getAttribute(userPaused ? 'data-play' : 'data-pause'));
var ip = btn.querySelector('.sfmq-i-pause'), il = btn.querySelector('.sfmq-i-play');
if (ip) ip.style.display = userPaused ? 'none' : 'block';
if (il) il.style.display = userPaused ? 'block' : 'none';
sync();
});
}
root.addEventListener('mouseenter', function () { hover = true; sync(); });
root.addEventListener('mouseleave', function () { hover = false; sync(); });
root.addEventListener('focusin', function (e) { focus = e.target !== btn; sync(); });
root.addEventListener('focusout', function () { focus = false; sync(); });
var rt;
window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(start, 200); });
start();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
};
