// Accordion (ES5). Works without JS via <details>; this adds smooth height, single-open and icon state.
S.c['accordion'] = S.c['accordion'] || function (root, S) {
S.css('sfub-acc-css', '[data-sfub=accordion] summary::-webkit-details-marker{display:none}');
var items = S.arr(root.querySelectorAll('details.sfua-item'));
var single = root.getAttribute('data-single') === '1';
var smooth = root.getAttribute('data-smooth') === '1' && !S.rm;
var on = root.getAttribute('data-on') || '', off = root.getAttribute('data-off') || '';
function icon(d) {
var ic = d.querySelector('.sfua-icon');
if (ic) ic.style.transform = d.open ? ic.getAttribute('data-open') : 'none';
S.sty(d, d.open ? on : off);
}
function set(d, open) {
var body = d.querySelector('.sfua-body');
if (open === d.open && !d.sfuaBusy) return;
if (open && single) items.forEach(function (o) { if (o !== d && o.open) set(o, false); });
if (!smooth || !body.animate) { d.open = open; icon(d); return; }
if (d.sfuaAnim) d.sfuaAnim.cancel();
d.sfuaBusy = true;
if (open) {
d.open = true;
icon(d);
var h = body.offsetHeight;
d.sfuaAnim = body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
} else {
var h2 = body.offsetHeight;
var ic = d.querySelector('.sfua-icon');
if (ic) ic.style.transform = 'none';
S.sty(d, off);
d.sfuaAnim = body.animate([{ height: h2 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 260, easing: 'ease-in' });
}
d.sfuaAnim.onfinish = function () { d.sfuaBusy = false; d.sfuaAnim = null; if (!open) d.open = false; icon(d); };
}
items.forEach(function (d, i) {
var sum = d.querySelector('summary');
sum.addEventListener('click', function (e) { e.preventDefault(); set(d, !d.open); });
d.addEventListener('toggle', function () { if (!d.sfuaBusy) icon(d); });
icon(d);
});
root.addEventListener('sfub:focus', function (e) { if (e.detail && e.detail.key === 'items' && items[e.detail.index]) set(items[e.detail.index], true); });
};
