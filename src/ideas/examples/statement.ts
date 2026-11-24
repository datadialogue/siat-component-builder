import type { Example } from '../types';
import { SIAT_LINKS } from '../siat';

// Sample copy in SIAT's voice. Replace before publishing.
export const examples: Record<string, Example> = {
  main: {
    component: 'statement',
    preset: 'Statement',
    props: { reveal: 'words' },
    stage: true,
    real: {
      eyebrow: 'School of Interactive Arts & Technology',
      text: 'We are *artists*, *designers*, *engineers* and *researchers* in Surrey, building the technology people will live with next.',
      links: [
        { label: 'Undergraduate', url: SIAT_LINKS.undergrad },
        { label: 'Graduate', url: SIAT_LINKS.grad },
        { label: 'Research', url: SIAT_LINKS.research },
      ],
    },
  },
  inline: {
    component: 'statement',
    preset: 'Story with links',
    props: { linkStyle: 'inline' },
    real: {
      eyebrow: 'Study at SIAT',
      text: 'Choose a path in *Design*, *Interactive Systems* or *Media Arts* [See programs](https://www.sfu.ca/siat/programs.html), or pair SIAT with Communication or Business. You will learn in studios and labs with faculty who [do the research](https://www.sfu.ca/siat/research.html), and you will finish with a portfolio of real projects [Meet our people](https://www.sfu.ca/siat/people.html).',
      links: [
        { label: 'How to apply', url: SIAT_LINKS.apply },
        { label: 'Visit Surrey campus', url: SIAT_LINKS.about },
      ],
    },
  },
};
