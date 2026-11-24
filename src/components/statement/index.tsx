import type { CSSProperties, ReactNode } from 'react';
import { Highlighter } from 'lucide-react';
import { defineComponent } from '../../lib/types';
import { SFU } from '../../theme/theme';
import runtime from './runtime.es5.js?raw';

/*
 * Statement: one big sentence instead of a "Welcome to…" paragraph.
 * In the text, *word* is highlighted and [label](url) becomes an inline pill link.
 * Optional scroll reveal brightens the words one by one; the markup ships fully
 * visible, so it reads the same without JS or with reduced motion.
 */

interface Link { _id?: string; label: string; url: string }
interface Props {
  eyebrow: string;
  text: string;
  links: Link[];
  size: 'md' | 'lg' | 'xl';
  weight: 'light' | 'bold';
  highlight: 'colour' | 'underline' | 'marker';
  multicolour: boolean;
  align: 'left' | 'center';
  linkStyle: 'inline' | 'rows';
  reveal: 'none' | 'words';
}

type Seg = { t: 'text'; s: string } | { t: 'hl'; s: string; n: number } | { t: 'link'; s: string; url: string };

/** Parses *highlight* and [label](url) markers. */
export function parseStatement(src: string): Seg[] {
  const out: Seg[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*([^*]+)\*/g;
  let last = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ t: 'text', s: src.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: 'link', s: m[1], url: m[2] });
    else out.push({ t: 'hl', s: m[3], n: n++ });
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ t: 'text', s: src.slice(last) });
  return out;
}

const SIZES: Record<Props['size'], string> = {
  md: 'clamp(22px, 3.4vw, 30px)',
  lg: 'clamp(27px, 4.6vw, 42px)',
  xl: 'clamp(32px, 6.2vw, 60px)',
};

function rgba(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export default defineComponent<Props>({
  id: 'statement',
  name: 'Statement',
  category: 'Content',
  description: 'One big sentence with highlighted words, inline pill links and arrow links.',
  icon: Highlighter,
  fields: [
    { key: 'eyebrow', type: 'text', label: 'Label' },
    { key: 'text', type: 'text', label: 'Statement', multiline: true, help: 'Wrap words in *stars* to highlight them. Write [label](https://…) for an inline pill link.' },
    {
      key: 'links', type: 'list', label: 'Links', itemLabel: 'link', titleKey: 'label', min: 0, max: 8,
      newItem: (i) => ({ label: ['Undergraduate', 'Graduate', 'Research', 'Visit us'][i] ?? `Link ${i + 1}`, url: 'https://www.sfu.ca/siat.html' }),
      itemFields: [
        { key: 'label', type: 'text', label: 'Label' },
        { key: 'url', type: 'url', label: 'Link' },
      ],
    },
    { key: 'size', type: 'select', label: 'Size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'weight', type: 'select', label: 'Weight', tab: 'style', options: [{ value: 'light', label: 'Light' }, { value: 'bold', label: 'Bold' }] },
    { key: 'highlight', type: 'select', label: 'Highlight', tab: 'style', options: [{ value: 'colour', label: 'Colour' }, { value: 'underline', label: 'Underline' }, { value: 'marker', label: 'Marker' }] },
    { key: 'multicolour', type: 'toggle', label: 'Several colours', tab: 'style', help: 'Highlighted words take turns between red, dark red and black.' },
    { key: 'align', type: 'select', label: 'Align', tab: 'style', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
    { key: 'linkStyle', type: 'select', label: 'Links', tab: 'style', options: [{ value: 'inline', label: 'In a row' }, { value: 'rows', label: 'List' }] },
    { key: 'reveal', type: 'select', label: 'Scroll reveal', tab: 'behaviour', options: [{ value: 'none', label: 'None' }, { value: 'words', label: 'Word by word' }], help: 'Words brighten one by one as the visitor scrolls. Skipped for reduced motion.' },
  ],
  defaults: {
    eyebrow: 'About SIAT',
    text: 'We are *artists*, *designers*, *engineers* and *researchers*, working together to shape how people live with [technology](https://www.sfu.ca/siat/research.html).',
    links: [
      { label: 'Undergraduate', url: 'https://www.sfu.ca/siat/programs/undergraduate.html' },
      { label: 'Graduate', url: 'https://www.sfu.ca/siat/programs/graduate.html' },
      { label: 'Research', url: 'https://www.sfu.ca/siat/research.html' },
    ],
    size: 'lg',
    weight: 'bold',
    highlight: 'colour',
    multicolour: true,
    align: 'left',
    linkStyle: 'inline',
    reveal: 'none',
  },
  presets: [
    { name: 'Statement', props: { size: 'lg', weight: 'bold', highlight: 'colour', multicolour: true, align: 'left', linkStyle: 'inline' } },
    { name: 'Story with links', props: { size: 'md', weight: 'light', highlight: 'colour', multicolour: false, linkStyle: 'rows' } },
    { name: 'Red band', props: { size: 'lg', weight: 'bold', highlight: 'underline', multicolour: false, align: 'center', linkStyle: 'inline' }, common: { theme: 'red' } },
  ],
  runtime: (p) => (p.reveal === 'words' || /\]\(/.test(p.text) ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const center = p.align === 'center';
    const light = p.weight === 'light';
    const words = p.reveal === 'words';
    const padded = t.bg !== 'transparent';

    // Highlight colours
    const multi = p.multicolour;
    // Multicolour: highlights take turns (accent, dark red, charcoal/black) over a grey base, so all three stand out.
    const lightCycle = [t.accent, SFU.darkRed, '#000000'];
    const darkCycle = ['#ffffff', '#ffc2cc', '#ffe3e8'];
    const hlColor = (n: number) => (multi ? (t.dark ? darkCycle : lightCycle)[n % 3] : t.dark ? '#ffffff' : t.accent);
    const base = p.highlight === 'colour'
      ? (t.dark ? t.muted : multi ? SFU.grey : t.heading)
      : t.heading;

    const hlStyle = (n: number): CSSProperties => {
      const c = hlColor(n);
      const s: CSSProperties = { margin: 0, padding: 0, fontWeight: light ? 700 : 'inherit' };
      if (p.highlight === 'colour') return { ...s, color: c };
      if (p.highlight === 'underline') return { ...s, color: t.heading, textDecoration: 'underline', textDecorationColor: c, textDecorationThickness: '.08em', textUnderlineOffset: '.14em' };
      return {
        ...s, color: t.heading, padding: '0 .08em',
        background: `linear-gradient(transparent 58%, ${t.dark ? 'rgba(255,255,255,.28)' : rgba(c.length === 7 ? c : SFU.red, 0.22)} 58%)`,
        WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone',
      } as CSSProperties;
    };

    const pillColor = t.dark ? '#ffffff' : t.accent;
    const pillOff = `background:transparent;color:${pillColor};`;
    const pillOn = `background:${pillColor};color:${t.dark ? t.bg === 'transparent' ? '#000000' : t.bg : t.onAccent};`;

    // Wrap words in spans for the scroll reveal; otherwise plain text.
    let k = 0;
    const wrapWords = (s: string): ReactNode => {
      const lines = s.split('\n');
      return lines.map((line, li) => (
        <span key={`l${k++}`}>
          {li > 0 && <br />}
          {words
            ? line.split(/(\s+)/).map((w) => (/^\s+$/.test(w) || !w ? w : <span key={`w${k++}`} className="sfst-w">{w}</span>))
            : line}
        </span>
      ));
    };

    const segs = parseStatement(p.text || '');
    const body = segs.map((s, i) => {
      if (s.t === 'text') return <span key={i}>{wrapWords(s.s)}</span>;
      if (s.t === 'hl') return <span key={i} style={hlStyle(s.n)}>{wrapWords(s.s)}</span>;
      return (
        <a key={i} href={s.url} className={words ? 'sfst-pill sfst-w' : 'sfst-pill'} data-on={pillOn} data-off={pillOff}
          style={{
            display: 'inline-block', margin: '0 .12em', padding: '.32em .8em .3em', verticalAlign: '.18em',
            border: `2px solid ${pillColor}`, borderRadius: '999px', background: 'transparent', color: pillColor,
            fontFamily: t.font, fontSize: 'max(13px, .42em)', lineHeight: 1.1, fontWeight: 700, fontStretch: '100%',
            letterSpacing: '.02em', textDecoration: 'none', whiteSpace: 'nowrap',
            transition: 'background-color .2s ease, color .2s ease',
          }}>
          {s.s}&nbsp;&rarr;
        </a>
      );
    });

    const rows = p.linkStyle === 'rows';
    return (
      <div {...ctx.root('statement', { padding: padded ? '48px clamp(20px, 4vw, 48px)' : 0, textAlign: center ? 'center' : 'left', borderRadius: padded ? `${t.radius}px` : 0 })}
        {...(words ? { 'data-reveal': 'words' } : {})}>
        {p.eyebrow && <div {...ctx.edit('eyebrow', 'text')} style={sx.eyebrow({ margin: '0 0 18px 0', color: t.dark ? t.muted : t.accent })}>{p.eyebrow}</div>}
        <h2 {...ctx.edit('text')} {...ctx.reveal()}
          style={sx.heading(30, {
            fontSize: SIZES[p.size], lineHeight: 1.18, fontWeight: light ? 400 : 800, fontStretch: light ? '100%' : '83%',
            letterSpacing: light ? '-.005em' : '-.01em', color: base, margin: 0,
            maxWidth: center ? '22em' : '24em', marginLeft: center ? 'auto' : 0, marginRight: center ? 'auto' : 0,
          })}>
          {body}
        </h2>
        {p.links.length > 0 && (
          <div role="list" style={rows
            ? { margin: '32px 0 0 0', padding: 0, maxWidth: '560px', marginLeft: center ? 'auto' : 0, marginRight: center ? 'auto' : 0, textAlign: 'left' }
            : { display: 'flex', flexWrap: 'wrap', gap: '12px 28px', margin: '28px 0 0 0', padding: 0, justifyContent: center ? 'center' : 'flex-start' }}>
            {p.links.map((l, i) => (
              <div role="listitem" key={l._id ?? i} {...ctx.item('links', i)} style={{ margin: 0, padding: 0 }}>
                <a href={l.url} {...ctx.edit(`links.${i}.label`, 'text')} {...ctx.hover()}
                  style={rows
                    ? sx.link({ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '14px 0', borderTop: `1px solid ${t.border}`, borderBottom: i === p.links.length - 1 ? `1px solid ${t.border}` : 0, color: t.heading, textDecoration: 'none', fontFamily: t.font, fontSize: '17px', fontWeight: 700, lineHeight: 1.3 })
                    : sx.link({ display: 'inline-block', padding: '0 0 3px 0', borderBottom: `2px solid ${t.dark ? '#ffffff' : t.accent}`, color: t.dark ? '#ffffff' : t.heading, textDecoration: 'none', fontFamily: t.font, fontSize: '14px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', lineHeight: 1.3 })}>
                  {rows ? <><span>{l.label}</span><span aria-hidden="true" style={{ color: t.dark ? '#ffffff' : t.accent }}>&rarr;</span></> : <>{l.label} &rarr;</>}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
});
