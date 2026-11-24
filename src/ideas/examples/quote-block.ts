import type { Example } from '../types';
import { PHOTO } from '../siat';

// Invented sample quotes. They are paired only with photos where nobody is identifiable.
export const examples: Record<string, Example> = {
  student: {
    component: 'quote-block',
    preset: 'Photo + quote',
    real: {
      quotes: [
        { quote: 'I came in thinking I would make games. Now I design how people feel when they play them.', name: 'Student, 4th year', role: 'Interactive Systems concentration', image: { ...PHOTO.vrStudent, pos: '62% 40%' } },
        { quote: 'My thesis is a dance piece the audience steers with their bodies. SIAT is the only place I could build it.', name: 'MA student', role: 'Media Arts', image: { ...PHOTO.mocap, pos: '50% 30%' } },
        { quote: 'The green screen room became my second home. By third year I was teaching others how to light it.', name: 'Student, 3rd year', role: 'Design concentration', image: PHOTO.editSuite },
      ],
    },
  },
  bleed: {
    component: 'quote-block',
    preset: 'Full bleed',
    real: {
      quotes: [
        { quote: 'We test ideas with real people, early and often. That is what makes the work hold up.', name: 'Graduate researcher', role: 'PhD, Interactive Arts & Technology', image: { ...PHOTO.vrHand, pos: '70% 40%' } },
      ],
    },
  },
};
