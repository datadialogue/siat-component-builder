import type { ReactElement, CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Theme } from '../theme/theme';
import type { Sx } from './sx';

/* ------------------------------------------------------------------ *
 * Field schema. The inspector UI is generated from these, so a new
 * component never needs editor code. Keys are relative to `props`.
 * ------------------------------------------------------------------ */

export type Tab = 'content' | 'style' | 'behaviour';

interface FieldBase {
  key: string;
  label: string;
  /** Shown in a "?" popover next to the label. Keep it to 1–2 short sentences. */
  help?: string;
  /** Which inspector tab the field lives in. Default: 'content'. */
  tab?: Tab;
  /** Hide the field unless this returns true (receives the parent object: props, or the list item). */
  showIf?: (parent: any) => boolean;
}

export interface TextField extends FieldBase { type: 'text'; multiline?: boolean; placeholder?: string }
export interface RichTextField extends FieldBase { type: 'richtext' }
export interface UrlField extends FieldBase { type: 'url'; placeholder?: string }
export interface ImageField extends FieldBase { type: 'image' }
export interface ColorField extends FieldBase { type: 'color'; allowAuto?: boolean }
export interface SelectField extends FieldBase {
  type: 'select';
  options: { value: string; label: string }[];
}
export interface NumberField extends FieldBase {
  type: 'number'; min: number; max: number; step?: number; unit?: string;
}
export interface ToggleField extends FieldBase { type: 'toggle' }
export interface ListField extends FieldBase {
  type: 'list';
  /** Singular noun for the "+ Add" button, e.g. "image", "card". */
  itemLabel: string;
  /** Key of the item field used as the item's title in the collapsed list. */
  titleKey?: string;
  /** Key of an image field used as the item's thumbnail in the collapsed list. */
  thumbKey?: string;
  itemFields: Field[];
  newItem: (index: number) => Record<string, any>;
  min?: number;
  max?: number;
}
export interface BlockType {
  label: string;
  icon: LucideIcon;
  fields: Field[];
  create: () => Record<string, any>;
}
export interface BlocksField extends FieldBase {
  type: 'blocks';
  blockTypes: Record<string, BlockType>;
}

export type Field =
  | TextField | RichTextField | UrlField | ImageField | ColorField | SelectField
  | NumberField | ToggleField | ListField | BlocksField;

export interface ImageValue {
  src: string;
  alt: string;
  /** object-position, e.g. "50% 30%" */
  pos?: string;
}

/* ------------------------------------------------------------------ *
 * Shared settings every component gets (Style + Behaviour tabs).
 * ------------------------------------------------------------------ */
export interface Common {
  theme: string;
  accent: string;          // '' = theme default
  font: 'sfu' | 'arial' | 'serif' | 'system';
  radius: 'none' | 'sm' | 'md' | 'lg';
  shadow: 'none' | 'sm' | 'md' | 'lg';
  maxWidth: 'full' | '1200' | '960' | '720';
  spaceY: 'none' | 'sm' | 'md' | 'lg';
  entrance: 'none' | 'fade' | 'up' | 'down' | 'left' | 'right' | 'zoom';
  duration: number;
  delay: number;
  stagger: number;
  easing: 'smooth' | 'spring' | 'linear';
  hover: 'none' | 'lift' | 'zoom' | 'glow';
}

/* ------------------------------------------------------------------ *
 * Render context handed to every component's render().
 * ------------------------------------------------------------------ */
export interface RenderCtx {
  theme: Theme;
  common: Common;
  /** Unique per exported instance. Prefix any element id with it. */
  id: string;
  /** True inside the builder preview; false for export. */
  preview: boolean;
  sx: Sx;
  /** Root element attributes + base style. Spread onto the outermost element. */
  root: (name: string, style?: CSSProperties) => Record<string, any>;
  /** Marks an element as editable/selectable in the preview. `kind: 'text'` enables double-click inline editing. */
  edit: (path: string, kind?: 'text' | 'rich' | 'image' | 'select') => Record<string, any>;
  /** Marks a list item so it can be dragged to reorder in the preview. */
  item: (listKey: string, index: number) => Record<string, any>;
  /** Marks an element for the entrance animation (no-op when entrance = none). */
  reveal: () => Record<string, any>;
  /** Marks an element for the shared hover effect (no-op when hover = none). */
  hover: () => Record<string, any>;
  /** Converts rich-text HTML to AEM-safe inline-styled HTML. Use with dangerouslySetInnerHTML. */
  rich: (html: string, opts?: { color?: string; size?: number }) => { __html: string };
}

export interface Preset<P> {
  name: string;
  props?: Partial<P>;
  common?: Partial<Common>;
}

export interface ComponentDef<P extends Record<string, any> = Record<string, any>> {
  /** kebab-case; also the folder name and the data-sfub value. */
  id: string;
  name: string;
  category: 'Media' | 'Layout' | 'Content' | 'Interactive';
  description: string;
  icon: LucideIcon;
  fields: Field[];
  defaults: P;
  /** Named style variants. They change look only and keep the user's content. */
  presets?: Preset<P>[];
  /** Overrides for the shared Common defaults (e.g. a hero defaults to no max-width). */
  commonDefaults?: Partial<Common>;
  render: (props: P, ctx: RenderCtx) => ReactElement;
  /**
   * ES5 behaviour script (import from ./runtime.es5.js?raw). It must register itself as:
   *   S.c['<id>'] = S.c['<id>'] || function (root, S) { ... };
   */
  runtime?: string | ((props: P) => string | undefined);
}

export function defineComponent<P extends Record<string, any>>(def: ComponentDef<P>): ComponentDef<P> {
  return def;
}

export interface Doc {
  component: string;
  props: Record<string, any>;
  common: Common;
  instanceId: string;
  name: string;
}
