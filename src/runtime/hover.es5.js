// Shared hover/focus effect for [data-sfub-hover] elements: lift | zoom | glow.
// Inline styles can't express :hover, so mouse/focus events toggle inline styles.
S.hover = S.hover || function (root) {
var fx = root.getAttribute('data-sfub-hover-fx');
var sh = root.getAttribute('data-sfub-shadow') || '0 10px 28px rgba(0,0,0,.18)';
var ac = root.getAttribute('data-sfub-accent') || '#cc0633';
S.arr(root.querySelectorAll('[data-sfub-hover]')).forEach(function (el) {
var img = el.querySelector('img');
var bt = el.style.transform, bs = el.style.boxShadow;
el.style.transition = (el.style.transition ? el.style.transition + ',' : '') + 'transform .3s ease,box-shadow .3s ease';
if (img && fx === 'zoom') img.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1)';
function set(on) {
if (fx === 'lift') {
el.style.transform = on && !S.rm ? 'translateY(-6px)' : bt;
el.style.boxShadow = on ? sh : bs;
} else if (fx === 'zoom') {
if (img && !S.rm) img.style.transform = on ? 'scale(1.07)' : '';
el.style.boxShadow = on ? sh : bs;
} else if (fx === 'glow') {
el.style.boxShadow = on ? '0 0 0 3px ' + ac + (sh ? ',' + sh : '') : bs;
}
}
el.addEventListener('mouseenter', function () { set(true); });
el.addEventListener('mouseleave', function () { set(false); });
el.addEventListener('focusin', function () { set(true); });
el.addEventListener('focusout', function () { set(false); });
});
};
