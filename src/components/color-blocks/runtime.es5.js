// Colour Blocks (ES5). Inline styles can't do :hover, so links get their underline
// on hover/focus here. Without JS the links still read as links (bold + arrow).
S.c['color-blocks'] = S.c['color-blocks'] || function (root, S) {
S.arr(root.querySelectorAll('.sfucb-link')).forEach(function (a) {
function set(on) { a.style.textDecoration = on ? 'underline' : 'none'; }
a.addEventListener('mouseenter', function () { set(true); });
a.addEventListener('mouseleave', function () { set(false); });
a.addEventListener('focus', function () { set(true); });
a.addEventListener('blur', function () { set(false); });
});
};
