import type { Example } from '../types';
import { PHOTO, SIAT_LINKS } from '../siat';

// Sample story arc, written loosely. Check dates and facts before publishing.
const entries = [
  { group: '2000s', date: '2002', title: 'SIAT is formed in Surrey', text: 'Programs from TechBC join SFU, and a new school for art, design and technology opens in Surrey.', image: PHOTO.building, linkLabel: '', url: '' },
  { group: '2000s', date: 'Mid 2000s', title: 'A home at Surrey Central', text: 'The school settles into the new SFU Surrey building, with studios beside the classrooms.', image: { src: '', alt: '' }, linkLabel: '', url: '' },
  { group: '2010s', date: '2010s', title: 'Labs for bodies and space', text: 'Research labs grow around VR, motion capture and immersive media.', image: PHOTO.vrLab, linkLabel: '', url: '' },
  { group: '2010s', date: 'Late 2010s', title: 'Graduate programs grow', text: 'MA, MSc and PhD students take on thesis and project work across the school.', image: { src: '', alt: '' }, linkLabel: 'Graduate programs', url: SIAT_LINKS.grad },
  { group: '2020s', date: '2020s', title: 'Visual Analytics certificate', text: 'A graduate certificate teaches how to make sense of data with interactive visuals.', image: PHOTO.touch, linkLabel: '', url: '' },
  { group: '2020s', date: '2020s', title: 'Spaces to make things', text: 'A fabrication lab, a green screen studio and editing suites open for students.', image: PHOTO.fabLab, linkLabel: '', url: '' },
  { group: '2020s', date: '2020s', title: 'Micro-credentials', text: 'Short courses in Human-Centred AI and Creative Technology open SIAT to new learners.', image: { src: '', alt: '' }, linkLabel: '', url: '' },
  { group: '2020s', date: '2026', title: 'A best paper at CHI', text: 'SIAT researchers bring home a best paper award from the top conference in the field.', image: PHOTO.starWall, linkLabel: 'Read the story', url: SIAT_LINKS.news },
];

export const examples: Record<string, Example> = {
  side: {
    component: 'timeline',
    preset: 'Side index',
    stage: true,
    real: { heading: 'Two decades of SIAT', intro: 'From a new school in Surrey to award-winning research.', indexTitle: 'Jump to', entries },
  },
  centred: {
    component: 'timeline',
    preset: 'Centred',
    stage: true,
    real: { heading: 'Two decades of SIAT', intro: '', entries },
  },
};
