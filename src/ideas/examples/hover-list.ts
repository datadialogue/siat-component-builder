import type { Example } from '../types';
import { PHOTO, SIAT_LINKS } from '../siat';

const programs = [
  { title: 'Design', meta: 'BA · BSc', text: 'Interaction, visual and experience design, from sketch to tested prototype.', image: PHOTO.stickyWall, url: SIAT_LINKS.undergrad },
  { title: 'Interactive Systems', meta: 'BSc', text: 'Code, sensors and studies of how people use technology.', image: PHOTO.vrLab, url: SIAT_LINKS.undergrad },
  { title: 'Media Arts', meta: 'BA', text: 'Games, animation, sound and immersive installations.', image: PHOTO.bodyRemixer, url: SIAT_LINKS.undergrad },
  { title: 'Joint Majors', meta: 'Communication · Business', text: 'Pair interactive arts and technology with another SFU school.', image: PHOTO.teamwork, url: SIAT_LINKS.undergrad },
  { title: 'Graduate Studies', meta: 'MA · MSc · PhD', text: 'Thesis and project routes with research labs across the school.', image: PHOTO.mocap, url: SIAT_LINKS.grad },
  { title: 'Visual Analytics', meta: 'Graduate Certificate', text: 'Make large data sets readable and useful.', image: PHOTO.touch, url: SIAT_LINKS.grad },
];

const labs = [
  { title: 'Immersive environments', meta: 'VR · AR', text: 'Headsets, domes and projection rooms for studying presence and movement.', image: PHOTO.vrHand, url: SIAT_LINKS.research },
  { title: 'Embodied interaction', meta: 'Motion capture', text: 'How bodies, gesture and performance shape technology.', image: PHOTO.mocap, url: SIAT_LINKS.research },
  { title: 'Tangible computing', meta: 'Fabrication', text: 'Objects and spaces that sense and respond.', image: PHOTO.cnc, url: SIAT_LINKS.research },
  { title: 'Generative art and AI', meta: 'Creative AI', text: 'Systems that compose, draw and perform with people.', image: PHOTO.coda, url: SIAT_LINKS.research },
  { title: 'Bio-art', meta: 'Wet lab', text: 'Art made with living materials and lab methods.', image: PHOTO.bioArt, url: SIAT_LINKS.research },
];

export const examples: Record<string, Example> = {
  programs: {
    component: 'hover-list',
    preset: 'Dark index',
    real: { eyebrow: 'Explore our programs', heading: '', items: programs },
  },
  labs: {
    component: 'hover-list',
    preset: 'Light list',
    real: { eyebrow: 'Research', heading: 'Where the work happens', items: labs },
  },
};
