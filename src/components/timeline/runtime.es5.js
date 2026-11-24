// Timeline (ES5). Markup is a working single-column timeline with anchor links.
// This adds: active-era highlight, smooth scroll, chip-row index when the columns
// wrap (narrow), alternating entries for the centred layout, and a scroll entrance.
S.c['timeline'] = S.c['timeline'] || function (root, S) {
var g = function (k) { return root.getAttribute('data-' + k) || ''; };
var centre = g('layout') === 'centre';
var ac = g('ac'), on = g('on'), mu = g('mu'), hd = g('hd'), bd = g('bd');
var nav = root.querySelector('.sftl-nav');
var navin = root.querySelector('.sftl-navin');
var list = root.querySelector('.sftl-list');
var body = root.querySelector('.sftl-body');
var links = S.arr(root.querySelectorAll('.sftl-link'));
var entries = S.arr(root.querySelectorAll('.sftl-e'));
var groups = S.arr(root.querySelectorAll('.sftl-group'));
var active = 0, narrow = false;

// ---- index: wide (vertical, sticky) vs narrow (horizontal chip row) ----
var WIDE_NAV = 'flex:1 1 160px;max-width:220px;';
var WIDE_IN = 'position:sticky;';
var WIDE_LIST = 'flex-direction:column;overflow-x:visible;gap:0;padding:0;border-left:2px solid ' + bd + ';';
var LINK_WIDE = 'display:block;white-space:normal;margin:0 0 0 -2px;padding:8px 0 8px 14px;border:0;border-left:3px solid transparent;border-radius:0;background:transparent;';
var LINK_CHIP = 'display:inline-block;white-space:nowrap;margin:0;padding:6px 14px;border:1px solid ' + bd + ';border-radius:999px;';
function paintLinks() {
links.forEach(function (a) {
var is = +a.getAttribute('data-g') === active;
if (narrow) {
S.sty(a, LINK_CHIP + (is ? 'background:' + ac + ';color:' + on + ';border-color:' + ac + ';font-weight:800;' : 'background:transparent;color:' + mu + ';font-weight:400;'));
} else {
S.sty(a, LINK_WIDE + (is ? 'border-left-color:' + ac + ';color:' + hd + ';font-weight:800;' : 'color:' + mu + ';font-weight:400;'));
}
if (is) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
});
}
function indexLayout() {
if (!nav || !body) return;
S.sty(nav, WIDE_NAV);
S.sty(navin, WIDE_IN);
S.sty(list, WIDE_LIST);
narrow = body.offsetTop > nav.offsetTop + 20;
if (narrow) {
S.sty(nav, 'flex:1 1 100%;max-width:none;');
S.sty(navin, 'position:static;');
S.sty(list, 'flex-direction:row;overflow-x:auto;gap:8px;padding:0 0 4px 0;border-left:0;');
}
paintLinks();
}
function setActive(k) {
if (k === active) return;
active = k;
paintLinks();
if (narrow && list) {
var a = links[k];
if (a) list.scrollLeft = Math.max(0, a.parentNode.offsetLeft - 16);
}
}
links.forEach(function (a) {
a.addEventListener('click', function (e) {
var el = document.getElementById((a.getAttribute('href') || '').slice(1));
if (!el) return;
e.preventDefault();
try { el.scrollIntoView({ behavior: S.rm ? 'auto' : 'smooth', block: 'start' }); } catch (x) { el.scrollIntoView(true); }
setActive(+a.getAttribute('data-g'));
});
});
if (links.length && window.IntersectionObserver) {
var io = new IntersectionObserver(function (es) {
es.forEach(function (e) { if (e.isIntersecting) setActive(+e.target.getAttribute('data-g')); });
}, { rootMargin: '-30% 0px -60% 0px' });
entries.concat(groups).forEach(function (el) { io.observe(el); });
}

// ---- centred layout: alternate sides on wide screens, overlapping slightly ----
function centreLayout() {
var wide = root.offsetWidth >= 760;
var kids = S.arr(body.children);
var bottoms = [0, 0], side = 0, prevTop = -1, flowEnd = 0;
body.style.paddingBottom = '0px';
kids.forEach(function (el) {
var line = el.querySelector('.sftl-line'), dot = el.querySelector('.sftl-dot'), im = el.querySelector('.sftl-img');
if (im) im.style.marginLeft = wide && side === 0 && el.className.indexOf('sftl-e') > -1 ? 'auto' : '0px';
var isGroup = el.className.indexOf('sftl-group') > -1;
el.style.marginTop = '0px';
if (!wide) {
S.sty(el, 'width:auto;margin-left:0;padding-left:36px;padding-right:0;text-align:left;');
if (line) S.sty(line, 'left:9px;right:auto;');
if (dot) S.sty(dot, 'left:3px;right:auto;');
return;
}
if (isGroup) {
S.sty(el, 'width:auto;margin-left:0;padding-left:0;padding-right:0;text-align:center;');
if (line) S.sty(line, 'left:50%;right:auto;margin-left:-1px;');
var need = Math.max(bottoms[0], bottoms[1]) - el.offsetTop;
if (need > 0) el.style.marginTop = need + 'px';
bottoms = [el.offsetTop + el.offsetHeight, el.offsetTop + el.offsetHeight];
side = 0;
prevTop = -1;
return;
}
var left = side === 0;
if (left) {
S.sty(el, 'width:50%;margin-left:0;padding-left:0;padding-right:36px;text-align:right;');
if (line) S.sty(line, 'left:auto;right:-1px;margin-left:0;');
if (dot) S.sty(dot, 'left:auto;right:-7px;');
} else {
S.sty(el, 'width:50%;margin-left:50%;padding-left:36px;padding-right:0;text-align:left;');
if (line) S.sty(line, 'left:-1px;right:auto;margin-left:0;');
if (dot) S.sty(dot, 'left:-7px;right:auto;');
}
var natural = el.offsetTop;
var want = Math.max(prevTop < 0 ? natural : prevTop + 56, bottoms[side]);
el.style.marginTop = (want - natural) + 'px';
prevTop = el.offsetTop;
bottoms[side] = prevTop + el.offsetHeight;
side = 1 - side;
});
if (wide) {
flowEnd = kids.length ? kids[kids.length - 1].offsetTop + kids[kids.length - 1].offsetHeight : 0;
var extra = Math.max(bottoms[0], bottoms[1]) - flowEnd;
if (extra > 0) body.style.paddingBottom = extra + 'px';
}
}

function layout() {
if (centre && body) centreLayout(); else indexLayout();
}
layout();
var t;
window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(layout, 120); });
S.arr(root.querySelectorAll('img')).forEach(function (im) {
if (!im.complete) im.addEventListener('load', function () { clearTimeout(t); t = setTimeout(layout, 60); });
});

// ---- entrance ----
if (g('anim') === '1' && !S.rm && !S.skipAnim && root.animate && window.IntersectionObserver) {
var ro = new IntersectionObserver(function (es) {
es.forEach(function (e) {
if (!e.isIntersecting) return;
ro.unobserve(e.target);
var c = e.target.querySelector('.sftl-c');
if (!c) return;
c.style.opacity = '';
c.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
});
}, { threshold: 0.12 });
entries.forEach(function (el) {
var c = el.querySelector('.sftl-c');
if (c) c.style.opacity = '0';
ro.observe(el);
});
}

// Builder preview: show the entry being edited.
root.addEventListener('sfub:focus', function (e) {
if (!e.detail || e.detail.key !== 'entries') return;
var el = entries[e.detail.index];
if (!el) return;
var c = el.querySelector('.sftl-c');
if (c) c.style.opacity = '';
});
};
