// Photo mosaic (ES5). Captions ship visible. On devices that can hover, this hides
// them and reveals on hover/focus; it also zooms the photo and straightens collage tiles.
S.c['mosaic'] = S.c['mosaic'] || function (root, S) {
var canHover = !!(window.matchMedia && window.matchMedia('(hover: hover)').matches);
var capHover = root.getAttribute('data-cap') === 'hover' && canHover;
var zoom = root.getAttribute('data-zoom') === '1' && !S.rm;
var collage = root.getAttribute('data-collage') === '1';
var tiles = S.arr(root.querySelectorAll('.sfmo-tile'));
// Rows follow the column width (no-JS fallback: fixed row height in the markup).
var grid = root.querySelector('.sfmo-grid');
function rows() {
if (!grid || !window.getComputedStyle) return;
var w = parseFloat(getComputedStyle(grid).gridTemplateColumns.split(' ')[0]);
if (w > 0) grid.style.gridAutoRows = Math.round(w * 0.82) + 'px';
}
rows();
var rt;
window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(rows, 100); });
tiles.forEach(function (el) {
var cap = el.querySelector('.sfmo-cap');
var img = el.querySelector('.sfmo-img');
var rot = el.getAttribute('data-rot') || 'none';
var hov = false, foc = false;
function paint() {
var on = hov || foc;
if (capHover && cap) S.sty(cap, on ? 'opacity:1;transform:none;' : 'opacity:0;transform:' + (S.rm ? 'none' : 'translateY(8px)') + ';');
if (zoom && img) img.style.transform = on ? 'scale(1.07)' : '';
if (collage) {
el.style.transform = on ? (S.rm ? 'none' : 'rotate(0deg) scale(1.03)') : rot;
el.style.zIndex = on ? '2' : '';
}
}
if (capHover && cap && el.tagName !== 'A' && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
paint();
el.addEventListener('mouseenter', function () { hov = true; paint(); });
el.addEventListener('mouseleave', function () { hov = false; paint(); });
el.addEventListener('focusin', function () { foc = true; paint(); });
el.addEventListener('focusout', function () { foc = false; paint(); });
});
// Builder preview: show the caption of the tile being edited.
root.addEventListener('sfub:focus', function (e) {
if (!e.detail || e.detail.key !== 'tiles') return;
var el = tiles[e.detail.index];
var cap = el && el.querySelector('.sfmo-cap');
if (cap) S.sty(cap, 'opacity:1;transform:none;');
});
};
