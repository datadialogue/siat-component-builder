// SFUB base (ES5). Shared by every builder snippet on a page; safe to include many times.
// S.c = component initialisers, keyed by data-sfub name.
S.c = S.c || {};
S.rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
// Inject a <style> once at runtime. Enhancement only: inline styles must already look right.
S.css = S.css || function (id, text) {
if (document.getElementById(id)) return;
var st = document.createElement('style');
st.id = id;
st.appendChild(document.createTextNode(text));
(document.head || document.documentElement).appendChild(st);
};
// Apply a "prop:value;prop:value;" string to an element's inline style.
S.sty = S.sty || function (el, str) {
(str || '').split(';').forEach(function (d) {
var i = d.indexOf(':');
if (i > 0) el.style.setProperty(d.slice(0, i).trim(), d.slice(i + 1).trim());
});
};
S.arr = S.arr || function (list) { return Array.prototype.slice.call(list || []); };
S.boot = S.boot || function () {
var roots = document.querySelectorAll('[data-sfub]');
for (var i = 0; i < roots.length; i++) {
var r = roots[i];
var fn = S.c[r.getAttribute('data-sfub')];
try {
if (fn && !r.sfubC) { r.sfubC = 1; fn(r, S); }
if (S.hover && !r.sfubH && r.getAttribute('data-sfub-hover-fx')) { r.sfubH = 1; S.hover(r); }
if (S.reveal && !r.sfubR && r.getAttribute('data-sfub-anim')) { r.sfubR = 1; S.reveal(r); }
} catch (e) { if (window.console) console.warn('sfub', e); }
}
};
