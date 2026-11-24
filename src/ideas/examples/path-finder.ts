import type { Example } from '../types';
import { PHOTO, SIAT_LINKS } from '../siat';

const options = [
  {
    label: 'design games and play',
    title: 'Media Arts and Interactive Systems',
    text: 'Make games, animation and sound, then learn the code and research behind how people play.',
    tags: 'Game design, Animation, Sound, Interaction design',
    image: PHOTO.game,
    linkLabel: 'See the concentrations',
    url: SIAT_LINKS.undergrad,
  },
  {
    label: 'build things people touch',
    title: 'Physical computing and fabrication',
    text: 'Prototype with sensors, electronics, laser cutters and CNC in the Surrey fabrication lab.',
    tags: 'Interactive Systems, Tangible interfaces, Fabrication lab',
    image: PHOTO.electronics,
    linkLabel: 'Explore the BSc',
    url: SIAT_LINKS.undergrad,
  },
  {
    label: 'make sense of data',
    title: 'Visual Analytics',
    text: 'Turn large, messy data into pictures people can reason with. Open to grad students and professionals.',
    tags: 'Graduate Certificate, Data visualization, HCI',
    image: PHOTO.touch,
    linkLabel: 'Graduate programs',
    url: SIAT_LINKS.grad,
  },
  {
    label: 'shape how AI works with people',
    title: 'Human-Centred AI',
    text: 'Learn to design and test AI tools around the people who use them. Flexible, non-credit study.',
    tags: 'Micro-credential, Design research, Ethics',
    image: PHOTO.aiFaces,
    linkLabel: 'See micro-credentials',
    url: SIAT_LINKS.programs,
  },
  {
    label: '…I’m not sure yet',
    title: 'Start broad, then choose',
    text: 'First-year courses cover design, media and systems. Most students pick a concentration in second year.',
    tags: 'BA, BSc, Joint majors with Communication and Business',
    image: PHOTO.atrium,
    linkLabel: 'Explore all programs',
    url: SIAT_LINKS.programs,
  },
];

export const examples: Record<string, Example> = {
  sentence: {
    component: 'path-finder',
    preset: 'Sentence',
    real: { eyebrow: 'Find your path', lead: 'At SIAT I want to', after: '', options },
  },
  chips: {
    component: 'path-finder',
    preset: 'Chips',
    real: { eyebrow: 'Programs', lead: 'What do you want to make?', after: '', options },
  },
};
