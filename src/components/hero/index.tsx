import type { CSSProperties } from 'react';
import { PanelTop } from 'lucide-react';
import { defineComponent, type ImageValue } from '../../lib/types';
import { placeholderImage } from '../../lib/placeholder';
import runtime from './runtime.es5.js?raw';

interface Slide {
  _id?: string; image: ImageValue; eyebrow: string; heading: string; text: string;
  ctaLabel: string; ctaUrl: string; cta2Label: string; cta2Url: string;
}
interface Props {
  slides: Slide[];
  height: 'sm' | 'md' | 'lg' | 'xl';
  align: 'left' | 'center';
  valign: 'center' | 'bottom';
  overlay: 'gradient' | 'dark' | 'accent' | 'none';
  strength: number;
  panel: boolean;
  headingSize: 'md' | 'lg' | 'xl';
  mode: 'fade' | 'slide';
  autoplay: number;
  showDots: boolean;
  showArrows: boolean;
  kenburns: boolean;
}

const newSlide = (i: number): Slide => ({
  image: placeholderImage(i + 1, '16:9', `Describe slide ${i + 1}`, ''),
  eyebrow: 'School of Interactive Arts & Technology',
  heading: i === 0 ? 'Design the future of interaction' : `Slide ${i + 1} headline`,
  text: 'A short supporting sentence that invites people to learn more.',
  ctaLabel: 'Learn more',
  ctaUrl: 'https://www.sfu.ca/siat.html',
  cta2Label: '',
  cta2Url: '',
});

const HEIGHTS = { sm: 280, md: 420, lg: 560, xl: 700 };
const HEADINGS = { md: 32, lg: 44, xl: 58 };

export default defineComponent<Props>({
  id: 'hero',
  name: 'Hero / Carousel',
  category: 'Media',
  description: 'Full-width banner with heading and buttons. Add slides for a carousel.',
  icon: PanelTop,
  commonDefaults: { radius: 'none', shadow: 'none', spaceY: 'none' },
  fields: [
    {
      key: 'slides', type: 'list', label: 'Slides', itemLabel: 'slide', titleKey: 'heading', thumbKey: 'image', min: 1, max: 10,
      newItem: newSlide,
      itemFields: [
        { key: 'image', type: 'image', label: 'Background image' },
        { key: 'eyebrow', type: 'text', label: 'Eyebrow' },
        { key: 'heading', type: 'text', label: 'Heading' },
        { key: 'text', type: 'text', label: 'Text', multiline: true },
        { key: 'ctaLabel', type: 'text', label: 'Button' },
        { key: 'ctaUrl', type: 'url', label: 'Button link', showIf: (s) => !!s.ctaLabel },
        { key: 'cta2Label', type: 'text', label: 'Second button' },
        { key: 'cta2Url', type: 'url', label: 'Second button link', showIf: (s) => !!s.cta2Label },
      ],
    },
    { key: 'height', type: 'select', label: 'Height', tab: 'style', options: [{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'align', type: 'select', label: 'Text align', tab: 'style', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
    { key: 'valign', type: 'select', label: 'Text position', tab: 'style', options: [{ value: 'center', label: 'Middle' }, { value: 'bottom', label: 'Bottom' }] },
    { key: 'headingSize', type: 'select', label: 'Heading size', tab: 'style', options: [{ value: 'md', label: 'M' }, { value: 'lg', label: 'L' }, { value: 'xl', label: 'XL' }] },
    { key: 'overlay', type: 'select', label: 'Overlay', tab: 'style', options: [{ value: 'gradient', label: 'Gradient' }, { value: 'dark', label: 'Dark' }, { value: 'accent', label: 'Accent' }, { value: 'none', label: 'None' }] },
    { key: 'strength', type: 'number', label: 'Overlay strength', tab: 'style', min: 0, max: 90, step: 5, unit: '%', showIf: (p) => p.overlay !== 'none' },
    { key: 'panel', type: 'toggle', label: 'Text on a panel', tab: 'style', help: 'Puts the text on a solid box for readability over busy photos.' },
    { key: 'mode', type: 'select', label: 'Transition', tab: 'behaviour', options: [{ value: 'fade', label: 'Fade' }, { value: 'slide', label: 'Slide' }], showIf: (p) => p.slides?.length > 1 },
    { key: 'autoplay', type: 'number', label: 'Autoplay', tab: 'behaviour', min: 0, max: 15, step: 1, unit: 's', help: '0 = off. A pause button is added automatically.', showIf: (p) => p.slides?.length > 1 },
    { key: 'showDots', type: 'toggle', label: 'Dots', tab: 'behaviour', showIf: (p) => p.slides?.length > 1 },
    { key: 'showArrows', type: 'toggle', label: 'Arrows', tab: 'behaviour', showIf: (p) => p.slides?.length > 1 },
    { key: 'kenburns', type: 'toggle', label: 'Slow zoom', tab: 'behaviour', help: 'Slowly zooms the background photo ("Ken Burns").' },
  ],
  defaults: {
    slides: [newSlide(0)],
    height: 'md',
    align: 'left',
    valign: 'center',
    overlay: 'gradient',
    strength: 60,
    panel: false,
    headingSize: 'lg',
    mode: 'fade',
    autoplay: 6,
    showDots: true,
    showArrows: true,
    kenburns: false,
  },
  presets: [
    { name: 'Banner', props: { overlay: 'gradient', panel: false, align: 'left', valign: 'center' } },
    { name: 'Centred', props: { overlay: 'dark', align: 'center', strength: 50 } },
    { name: 'Red panel', props: { overlay: 'none', panel: true, valign: 'bottom' }, common: { theme: 'red' } },
    { name: 'Carousel', props: { slides: [newSlide(0), newSlide(1), newSlide(2)], mode: 'slide' } },
  ],
  runtime: (p) => (p.slides.length > 1 || p.kenburns ? runtime : undefined),
  render(p, ctx) {
    const { theme: t, sx } = ctx;
    const slides = p.slides.length ? p.slides : [newSlide(0)];
    const multi = slides.length > 1;
    const a = p.strength / 100;
    const overlayBg: Record<Props['overlay'], string> = {
      gradient: p.align === 'center'
        ? `rgba(0,0,0,${a})`
        : `linear-gradient(90deg, rgba(0,0,0,${a}) 0%, rgba(0,0,0,${a * 0.55}) 55%, rgba(0,0,0,0) 100%)`,
      dark: `rgba(0,0,0,${a})`,
      accent: hexA(t.accent === '#ffffff' ? '#a6192e' : t.accent, a),
      none: 'transparent',
    };
    const panelBg = t.dark ? t.bg : '#ffffff';
    const textColor = p.panel ? (t.dark ? '#ffffff' : t.text) : '#ffffff';
    const headColor = p.panel ? (t.dark ? '#ffffff' : t.heading) : '#ffffff';
    const centered = p.align === 'center';
    const ctrlBtn: CSSProperties = sx.buttonReset({ position: 'absolute', top: '50%', width: '44px', height: '44px', margin: '-22px 0 0 0', borderRadius: '50%', background: 'rgba(0,0,0,.45)', color: '#fff', fontSize: '26px', lineHeight: '44px', textAlign: 'center', zIndex: 3 });

    return (
      <div {...ctx.root('hero', { position: 'relative', overflow: 'hidden', borderRadius: `${t.radius}px`, background: '#222', boxShadow: t.shadow })}
        data-sfub-accent={t.accent === '#ffffff' ? '#ffffff' : t.accent}
        data-mode={p.mode}
        {...(multi && p.autoplay ? { 'data-autoplay': String(p.autoplay) } : {})}
        {...(p.kenburns ? { 'data-kenburns': '1' } : {})}
        {...(multi ? { role: 'region', 'aria-roledescription': 'carousel', 'aria-label': 'Featured' } : {})}
      >
        <div className="sfuh-track" style={{ display: 'grid', margin: 0, padding: 0 }}>
          {slides.map((s, i) => (
            <div key={s._id ?? i} className="sfuh-slide" {...ctx.item('slides', i)}
              {...(multi ? { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${i + 1} of ${slides.length}`, 'aria-hidden': i === 0 ? 'false' : 'true' } : {})}
              style={{
                gridArea: '1 / 1', position: 'relative', display: 'flex', boxSizing: 'border-box',
                minHeight: `${HEIGHTS[p.height]}px`, margin: 0,
                padding: multi ? '48px 64px 56px' : '48px clamp(20px, 5vw, 64px)',
                alignItems: p.valign === 'bottom' ? 'flex-end' : 'center',
                justifyContent: centered ? 'center' : 'flex-start',
                opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden', zIndex: i === 0 ? 1 : 0,
                overflow: 'hidden',
              }}>
              <img className="sfuh-img" src={s.image.src} alt={s.image.alt} {...ctx.edit(`slides.${i}.image`, 'image')}
                style={sx.imgFill('cover', s.image.pos, { transformOrigin: '50% 50%' })} />
              {p.overlay !== 'none' && <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: overlayBg[p.overlay], pointerEvents: 'none' }} />}
              <div {...ctx.reveal()} style={{
                position: 'relative', zIndex: 1, maxWidth: centered ? '760px' : '620px', boxSizing: 'border-box', margin: 0,
                textAlign: centered ? 'center' : 'left',
                ...(p.panel ? { background: panelBg, padding: '28px 32px', borderRadius: `${t.radiusSm}px`, boxShadow: '0 10px 30px rgba(0,0,0,.25)' } : { padding: 0 }),
              }}>
                {s.eyebrow && <div {...ctx.edit(`slides.${i}.eyebrow`, 'text')} style={sx.eyebrow({ color: p.panel ? t.accent : '#ffffff', opacity: p.panel ? 1 : 0.9, margin: '0 0 12px 0' })}>{s.eyebrow}</div>}
                {s.heading && <h2 {...ctx.edit(`slides.${i}.heading`, 'text')} style={sx.heading(HEADINGS[p.headingSize], { color: headColor, margin: '0 0 14px 0', textShadow: p.panel ? 'none' : '0 2px 12px rgba(0,0,0,.35)' })}>{s.heading}</h2>}
                {s.text && <p {...ctx.edit(`slides.${i}.text`, 'text')} style={sx.text({ color: textColor, fontSize: '19px', margin: '0 0 22px 0', textShadow: p.panel ? 'none' : '0 1px 8px rgba(0,0,0,.35)' })}>{s.text}</p>}
                {(s.ctaLabel || s.cta2Label) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: centered ? 'center' : 'flex-start', margin: 0, padding: 0 }}>
                    {s.ctaLabel && <a href={s.ctaUrl} {...ctx.edit(`slides.${i}.ctaLabel`, 'text')} {...ctx.hover()} style={sx.button(p.panel ? 'primary' : 'light')}>{s.ctaLabel}</a>}
                    {s.cta2Label && <a href={s.cta2Url} {...ctx.edit(`slides.${i}.cta2Label`, 'text')} style={sx.button('secondary', p.panel ? {} : { color: '#ffffff', borderColor: '#ffffff' })}>{s.cta2Label}</a>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {multi && p.showArrows && (
          <>
            <button type="button" className="sfuh-prev" aria-label="Previous slide" style={{ ...ctrlBtn, left: '12px' }}>&#8249;</button>
            <button type="button" className="sfuh-next" aria-label="Next slide" style={{ ...ctrlBtn, right: '12px' }}>&#8250;</button>
          </>
        )}
        {multi && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: '16px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: 0, padding: 0 }}>
            {p.showDots && slides.map((_, i) => (
              <button key={i} type="button" className="sfuh-dot" aria-label={`Show slide ${i + 1}`} aria-current={i === 0 ? 'true' : 'false'}
                style={sx.buttonReset({ width: i === 0 ? '28px' : '10px', height: '10px', borderRadius: '5px', background: i === 0 ? (t.accent === '#ffffff' ? '#ffffff' : t.accent) : 'rgba(255,255,255,.45)', transition: 'width .3s ease, background-color .3s ease' })} />
            ))}
            {p.autoplay > 0 && (
              <button type="button" className="sfuh-pause" aria-label="Pause slideshow" aria-pressed="false"
                style={sx.buttonReset({ width: '28px', height: '28px', margin: '0 0 0 8px', borderRadius: '50%', background: 'rgba(0,0,0,.45)', color: '#fff', fontSize: '10px', lineHeight: '28px', textAlign: 'center', letterSpacing: '-2px' })}>&#10073;&#10073;</button>
            )}
          </div>
        )}
      </div>
    );
  },
});

function hexA(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return `rgba(0,0,0,${a})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
