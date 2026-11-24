import type { Example } from '../types';

// Sample figures for layout only. Replace with real SIAT data before publishing.
export const examples: Record<string, Example> = {
  outcomes: {
    component: 'stat-bars',
    preset: 'Bars',
    props: { question: 'Where do graduates go?' },
    real: {
      heading: 'What a SIAT degree leads to',
      intro: '',
      question: 'Where do graduates go?',
      items: [
        { value: 84, suffix: '%', label: 'work in design, technology or media within a year', note: '' },
        { value: 62, suffix: '%', label: 'complete at least one co-op term', note: '' },
        { value: 41, suffix: '%', label: 'work on research projects with faculty', note: '' },
        { value: 27, suffix: '%', label: 'go on to graduate study', note: 'Sample figures' },
      ],
    },
  },
  rings: {
    component: 'stat-bars',
    preset: 'Rings',
    real: {
      heading: 'A school built around studios',
      intro: '',
      question: '',
      items: [
        { value: 70, suffix: '%', label: 'of courses are hands-on studios or labs', note: '' },
        { value: 48, suffix: '%', label: 'of studio projects are made in teams', note: '' },
        { value: 92, suffix: '%', label: 'of students say they built a portfolio piece', note: 'Sample figures' },
      ],
    },
  },
};
