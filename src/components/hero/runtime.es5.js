// Hero / carousel behaviour (ES5): fade or slide, dots, arrows, autoplay with pause, Ken Burns.
S.c['hero'] = S.c['hero'] || function (root, S) {
var slides = S.arr(root.querySelectorAll('.sfuh-slide'));
var dots = S.arr(root.querySelectorAll('.sfuh-dot'));
var mode = root.getAttribute('data-mode') || 'fade';
var secs = +root.getAttribute('data-autoplay') || 0;
var kb = root.getAttribute('data-kenburns') === '1' && !S.rm;
var accent = root.getAttribute('data-sfub-accent') || '#fff';
var n = slides.length, cur = -1, timer, hold = false, stopped = false;
function zoom(s) {
var img = s.querySelector('.sfuh-img');
if (kb && img && img.animate) img.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }], { duration: (secs || 6) * 1000 + 1500, easing: 'linear', fill: 'forwards' });
}
if (n < 2) { if (slides[0]) zoom(slides[0]); return; }
slides.forEach(function (s) {
s.style.visibility = 'visible';
s.style.transition = S.rm ? 'none' : (mode === 'slide' ? 'transform .7s cubic-bezier(.2,.8,.2,1)' : 'opacity .8s ease');
});
function go(i) {
i = (i + n) % n;
if (i === cur) return;
cur = i;
slides.forEach(function (s, k) {
var on = k === i;
s.setAttribute('aria-hidden', on ? 'false' : 'true');
s.inert = !on;
s.style.pointerEvents = on ? 'auto' : 'none';
s.style.zIndex = on ? '1' : '0';
if (mode === 'slide') {
s.style.opacity = '1';
s.style.transform = on ? 'translateX(0)' : (k < i ? 'translateX(-100%)' : 'translateX(100%)');
} else {
s.style.opacity = on ? '1' : '0';
}
});
dots.forEach(function (d, k) {
d.setAttribute('aria-current', k === i ? 'true' : 'false');
d.style.background = k === i ? accent : 'rgba(255,255,255,.45)';
d.style.width = k === i ? '28px' : '10px';
});
zoom(slides[i]);
}
function tick() { if (!hold && !stopped) go(cur + 1); }
function restart() { clearInterval(timer); if (secs && !S.rm) timer = setInterval(tick, secs * 1000); }
dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); restart(); }); });
var prev = root.querySelector('.sfuh-prev'), next = root.querySelector('.sfuh-next');
if (prev) prev.addEventListener('click', function () { go(cur - 1); restart(); });
if (next) next.addEventListener('click', function () { go(cur + 1); restart(); });
var pause = root.querySelector('.sfuh-pause');
if (pause) {
if (!secs || S.rm) pause.style.display = 'none';
pause.addEventListener('click', function () {
stopped = !stopped;
pause.setAttribute('aria-pressed', stopped ? 'true' : 'false');
pause.innerHTML = stopped ? '&#9654;' : '&#10073;&#10073;';
pause.setAttribute('aria-label', stopped ? 'Play slideshow' : 'Pause slideshow');
});
}
root.addEventListener('mouseenter', function () { hold = true; });
root.addEventListener('mouseleave', function () { hold = false; });
root.addEventListener('focusin', function () { hold = true; });
root.addEventListener('focusout', function () { hold = false; });
root.addEventListener('keydown', function (e) {
if (e.key === 'ArrowRight') { go(cur + 1); restart(); }
else if (e.key === 'ArrowLeft') { go(cur - 1); restart(); }
});
// Touch swipe
var x0 = null;
root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
root.addEventListener('touchend', function (e) {
if (x0 === null) return;
var dx = e.changedTouches[0].clientX - x0;
if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); restart(); }
x0 = null;
});
root.addEventListener('sfub:focus', function (e) { if (e.detail && e.detail.key === 'slides') { stopped = true; go(e.detail.index); } });
go(0);
restart();
};
