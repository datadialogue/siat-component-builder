// Card grid tag filter (ES5). The filter bar is hidden in the markup and only shown when JS runs.
S.c['card-grid'] = S.c['card-grid'] || function (root, S) {
var bar = root.querySelector('.sfuc-filters');
if (!bar) return;
var btns = S.arr(bar.querySelectorAll('button'));
var cards = S.arr(root.querySelectorAll('.sfuc-card'));
var on = root.getAttribute('data-on') || '', off = root.getAttribute('data-off') || '';
bar.style.display = 'flex';
function pick(tag) {
btns.forEach(function (b) {
var a = b.getAttribute('data-tag') === tag;
b.setAttribute('aria-pressed', a ? 'true' : 'false');
S.sty(b, a ? on : off);
});
cards.forEach(function (c) {
var show = !tag || c.getAttribute('data-tag') === tag;
var was = c.style.display !== 'none';
c.style.display = show ? '' : 'none';
if (show && !was && c.animate && !S.rm) c.animate([{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
});
}
btns.forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-tag')); }); });
pick('');
};
