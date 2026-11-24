import { describe, it, expect } from 'vitest';
import { normalizeStyle } from '../src/export/style';
import { minifyScript } from '../src/export/script';
import { lintForAEM } from '../src/export/lint';
import { styleRichText } from '../src/lib/rich';
import { resolveTheme, DEFAULT_COMMON } from '../src/theme/theme';
import { videoEmbedUrl } from '../src/components/composer';

describe('normalizeStyle', () => {
  it('adds trailing semicolons and trims', () => {
    expect(normalizeStyle('display: flex ; margin:0')).toBe('display:flex;margin:0;');
  });
  it('keeps semicolons inside url() and quotes', () => {
    const s = `background:url("data:image/svg+xml;utf8,<svg/>");color:red`;
    expect(normalizeStyle(s)).toBe(`background:url("data:image/svg+xml;utf8,<svg/>");color:red;`);
  });
  it('converts rem to px at 16px', () => {
    expect(normalizeStyle('font-size:1.5rem;padding:1rem 2rem')).toBe('font-size:24px;padding:16px 32px;');
  });
  it('drops empty declarations', () => {
    expect(normalizeStyle(';;color:red;;')).toBe('color:red;');
  });
});

describe('minifyScript', () => {
  it('removes comment lines and indentation', () => {
    expect(minifyScript('// hi\n  var a = 1;\n\n  // x\n  a++;')).toBe('var a = 1;\na++;');
  });
});

describe('lintForAEM', () => {
  it('flags style blocks, missing semicolons, local images, lists and h1', () => {
    const html = '<div style="color:red"><style>a{}</style><img src="data:image/png;base64,AAA"><ul><li>x</li></ul><h1>T</h1><a href="page.html">x</a></div>';
    const codes = lintForAEM(html).map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(['style-block', 'semicolon', 'local-image', 'alt', 'list', 'h1', 'relative-link']));
  });
  it('rejects non-ES5 scripts', () => {
    const codes = lintForAEM('<div style="a:b;"><script>const x = () => 1;</script></div>').map((i) => i.code);
    expect(codes).toContain('es5');
  });
  it('is clean for a simple valid snippet', () => {
    const issues = lintForAEM('<div style="margin:0;"><img src="/content/dam/sfu/x.jpg" alt="x" style="width:100%;"><a href="https://www.sfu.ca/">SFU</a></div>');
    expect(issues).toEqual([]);
  });
});

describe('styleRichText', () => {
  const t = resolveTheme(DEFAULT_COMMON);
  it('inlines styles on every element and removes classes', () => {
    const out = styleRichText('<p class="x">Hi <a href="https://a.b">l</a> <strong>b</strong></p><h3>H</h3>', t);
    const doc = new DOMParser().parseFromString(out, 'text/html');
    doc.body.querySelectorAll('*').forEach((el) => {
      expect(el.getAttribute('style')).toBeTruthy();
      expect(el.hasAttribute('class')).toBe(false);
    });
  });
  it('converts lists to role=list divs (CLF4 adds bullets to li)', () => {
    const out = styleRichText('<ul><li><p>a</p></li><li><p>b</p></li></ul><ol><li><p>c</p></li></ol>', t);
    expect(out).not.toMatch(/<(ul|ol|li)[\s>]/);
    expect(out.match(/role="listitem"/g)?.length).toBe(3);
    expect(out).toContain('1.');
  });
  it('keeps user alignment and colour', () => {
    const out = styleRichText('<p style="text-align: center">x<span style="color: #cc0633">y</span></p>', t);
    expect(out).toMatch(/text-align: center/);
    expect(out).toMatch(/color: #cc0633/);
  });
});

describe('videoEmbedUrl', () => {
  it('handles YouTube and Vimeo', () => {
    expect(videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(videoEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(videoEmbedUrl('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456');
    expect(videoEmbedUrl('javascript:alert(1)')).toBe('');
  });
});
