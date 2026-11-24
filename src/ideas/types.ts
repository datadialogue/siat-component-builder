import type { Common } from '../lib/types';

/** A live example on the Ideas page: a component doc in two content modes. */
export interface Example {
  component: string;
  /** Preset name to start from (looks only). */
  preset?: string;
  /** Overrides used in both modes (layout, options, list lengths). */
  props?: Record<string, any>;
  common?: Partial<Common>;
  /** "Photos" mode: SIAT photos + sample copy. Merged over defaults + props. */
  real?: Record<string, any>;
  /** Show in a fixed-height, scrollable frame (scroll-driven effects). */
  stage?: boolean;
}

export interface Source {
  site: string;
  url: string;
  /** File in public/ideas/ */
  shot: string;
}

export interface Finding {
  id: string;
  kind: 'Order' | 'Content' | 'Interaction' | 'Look';
  title: string;
  /** One or two plain sentences. */
  text: string;
  sources: Source[];
  /** "component" or "component:exampleKey" (from src/ideas/examples/<component>.ts). */
  examples: string[];
  /** Optional flow of steps (used by the page-order finding). */
  flow?: { label: string; to: string }[];
}
