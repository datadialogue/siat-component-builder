// Split Gallery behaviour (ES5). Adapted from the proven sfu-gallery_6.html.
S.c['split-gallery'] = S.c['split-gallery'] || function (root, S) {
var q = function (c) { return root.querySelector('.sfug-' + c); };
var main = q('main'), cap = q('caption'), frame = q('frame'), dim = q('dim'), shade = q('shade');
var over = q('over'), title = q('title'), bar = q('bar'), text = q('text');
var thumbs = S.arr(root.querySelectorAll('.sfug-thumb'));
var accent = root.getAttribute('data-sfub-accent') || '#a6192e';
var hoverText = root.getAttribute('data-overlay') === '1';
var rm = S.rm;
if (rm) { [main, dim, shade, over, title, bar, text].forEach(function (el) { if (el) el.style.transition = 'none'; }); }
function setOpen(open) {
if (!hoverText || !text.textContent) open = false;
dim.style.opacity = open ? '.62' : '0';
shade.style.opacity = open ? '0' : '1';
main.style.transform = (open && !rm) ? 'scale(1.05)' : 'scale(1)';
over.style.top = open ? '50%' : '16px';
over.style.transform = open ? 'translateY(-50%)' : 'translateY(0)';
title.style.fontSize = open ? '1.7em' : '1.05em';
title.style.letterSpacing = open ? '.04em' : '.12em';
bar.style.width = open ? '90px' : '36px';
bar.style.margin = open ? '12px 0 0 0' : '8px 0 0 0';
text.style.maxHeight = open ? '220px' : '0';
text.style.opacity = open ? '1' : '0';
text.style.margin = open ? '14px 0 0 0' : '0';
}
var hovering = false;
frame.addEventListener('mouseenter', function () { hovering = true; setOpen(true); });
frame.addEventListener('mouseleave', function () { hovering = false; setOpen(false); });
frame.addEventListener('focusin', function () { hovering = true; setOpen(true); });
frame.addEventListener('focusout', function () { hovering = false; setOpen(false); });
frame.addEventListener('pointerdown', function (e) {
if (e.pointerType === 'touch' && !e.target.closest('button')) { setOpen(dim.style.opacity === '0'); }
});
var current = -1;
if (!thumbs.length) return;
// In the builder preview, keep "click to edit" paths pointing at the visible item.
function repath(el, i, f) { if (el && el.hasAttribute('data-sfub-path')) el.setAttribute('data-sfub-path', 'items.' + i + '.' + f); }
function show(i, focusThumb) {
i = (i + thumbs.length) % thumbs.length;
if (i === current) return;
current = i;
var t = thumbs[i];
var img = t.querySelector('img');
thumbs.forEach(function (b, n) {
var on = n === i;
b.setAttribute('aria-current', on ? 'true' : 'false');
b.style.borderColor = on ? accent : 'transparent';
b.style.opacity = on ? '1' : '.75';
});
main.style.opacity = '0';
var src = t.getAttribute('data-full');
var next = new Image();
next.onload = next.onerror = function () {
if (current !== i) return;
main.src = src;
main.alt = img.getAttribute('alt') || '';
main.style.objectPosition = img.style.objectPosition || '50% 50%';
main.style.opacity = '1';
};
next.src = src;
title.textContent = t.getAttribute('data-title') || '';
text.textContent = t.getAttribute('data-text') || '';
over.style.visibility = (title.textContent || text.textContent) ? 'visible' : 'hidden';
shade.style.visibility = over.style.visibility;
if (cap) {
cap.textContent = t.getAttribute('data-caption') || '';
cap.style.display = cap.textContent ? 'block' : 'none';
}
repath(title, i, 'title'); repath(text, i, 'text'); repath(cap, i, 'caption'); repath(main, i, 'image');
if (focusThumb) t.focus();
}
thumbs.forEach(function (b, n) {
b.addEventListener('click', function () { show(n); restart(); });
b.addEventListener('mouseenter', function () { b.style.opacity = '1'; });
b.addEventListener('mouseleave', function () { b.style.opacity = (n === current) ? '1' : '.75'; });
});
var prev = q('prev'), nxt = q('next');
if (prev) prev.addEventListener('click', function () { show(current - 1); restart(); });
if (nxt) nxt.addEventListener('click', function () { show(current + 1); restart(); });
root.addEventListener('keydown', function (e) {
if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show(current + 1, true); }
else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show(current - 1, true); }
});
// Optional autoplay (pauses on hover/focus, off for reduced motion).
var secs = +root.getAttribute('data-autoplay') || 0, timer;
function restart() {
clearInterval(timer);
if (secs && !rm) timer = setInterval(function () { if (!hovering) show(current + 1); }, secs * 1000);
}
// Builder preview: selecting an item in the editor shows it.
root.addEventListener('sfub:focus', function (e) { if (e.detail && e.detail.key === 'items') show(e.detail.index); });
show(0);
restart();
};
