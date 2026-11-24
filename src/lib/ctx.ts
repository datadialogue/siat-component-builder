import type { CSSProperties } from 'react';
import type { Common, RenderCtx } from './types';
import { resolveTheme } from '../theme/theme';
import { makeSx } from './sx';
import { styleRichText } from './rich';

const MAX_WIDTHS: Record<Common['maxWidth'], string> = { full: '100%', '1200': '1200px', '960': '960px', '720': '720px' };
const SPACE_Y: Record<Common['spaceY'], string> = { none: '0', sm: '16px', md: '32px', lg: '56px' };

export function makeCtx(common: Common, id: string, preview: boolean): RenderCtx {
  const theme = resolveTheme(common);
  const sx = makeSx(theme);
  const animOn = common.entrance !== 'none';
  const hoverOn = common.hover !== 'none';

  return {
    theme,
    common,
    id,
    preview,
    sx,
    root: (name: string, style: CSSProperties = {}) => {
      const attrs: Record<string, any> = {
        'data-sfub': name,
        'data-sfub-id': id,
        style: {
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: MAX_WIDTHS[common.maxWidth] ?? '100%',
          margin: `${SPACE_Y[common.spaceY] ?? '16px'} auto`,
          padding: 0,
          fontFamily: theme.font,
          color: theme.text,
          background: theme.bg,
          ...style,
        },
      };
      if (animOn) {
        attrs['data-sfub-anim'] = common.entrance;
        attrs['data-sfub-dur'] = String(common.duration);
        if (common.delay) attrs['data-sfub-delay'] = String(common.delay);
        if (common.stagger) attrs['data-sfub-stagger'] = String(common.stagger);
        if (common.easing !== 'smooth') attrs['data-sfub-ease'] = common.easing;
      }
      if (hoverOn) {
        attrs['data-sfub-hover-fx'] = common.hover;
        attrs['data-sfub-shadow'] = theme.shadowHover;
        if (common.hover === 'glow') attrs['data-sfub-accent'] = theme.accent;
      }
      return attrs;
    },
    edit: (path, kind) => (preview ? { 'data-sfub-path': path, ...(kind ? { 'data-sfub-edit': kind } : {}) } : {}),
    item: (listKey, index) => (preview ? { 'data-sfub-item': `${listKey}.${index}` } : {}),
    reveal: () => (animOn ? { 'data-sfub-reveal': '' } : {}),
    hover: () => (hoverOn ? { 'data-sfub-hover': '' } : {}),
    rich: (html, opts) => ({ __html: styleRichText(html, theme, opts) }),
  };
}
