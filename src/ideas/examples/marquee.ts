import type { Example } from '../types';
import { SIAT_LINKS } from '../siat';

// Sample dates and events. Replace before publishing.
export const examples: Record<string, Example> = {
  ticker: {
    component: 'marquee',
    preset: 'Ticker',
    real: {
      items: [
        { text: 'Fall applications open now', url: SIAT_LINKS.apply },
        { text: 'SIAT open house · Surrey campus', url: SIAT_LINKS.events },
        { text: 'Grad show in April', url: SIAT_LINKS.events },
        { text: 'New: micro-credential in Human-Centred AI', url: SIAT_LINKS.programs },
      ],
    },
  },
  giant: {
    component: 'marquee',
    preset: 'Giant word',
    stage: true,
    real: {
      items: [
        { text: 'Make it interactive', url: '' },
        { text: 'Make it matter', url: '' },
      ],
      separator: '✳',
    },
  },
};
