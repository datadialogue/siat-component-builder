import type { Example } from '../types';
import { PHOTO, SIAT_LINKS } from '../siat';

const t = (o: Record<string, any>) => ({
  kind: 'text', color: 'auto', eyebrow: '', title: '', text: '', link1Label: '', link1Url: '', link2Label: '', link2Url: '',
  image: { src: '', alt: '' }, wide: false, ...o,
});
const img = (image: any, eyebrow = '', title = '', url = '', wide = false) => t({ kind: 'image', image, eyebrow, title, link1Url: url, wide });

const audiences = [
  t({ eyebrow: 'Future students', title: 'Make the things people will use next.', text: 'Design, code and art in one degree, at SFU Surrey.', link1Label: 'Undergraduate', link1Url: SIAT_LINKS.undergrad, link2Label: 'How to apply', link2Url: SIAT_LINKS.apply, wide: true }),
  img(PHOTO.vrStudent),
  t({ eyebrow: 'Current students', title: 'Advising, co-op and labs.', text: 'Book an advisor, find a co-op term or reserve studio time.', link1Label: 'Student resources', link1Url: SIAT_LINKS.undergrad }),
  t({ eyebrow: 'Research', title: 'Labs that study people and technology.', text: 'Immersive media, AI, data and embodied interaction.', link1Label: 'Our research', link1Url: SIAT_LINKS.research, link2Label: 'Faculty', link2Url: SIAT_LINKS.people }),
  img(PHOTO.fabLab, 'Visit us', 'Tour the Surrey studios', SIAT_LINKS.about),
  t({ eyebrow: 'Industry & partners', title: 'Hire, partner or sponsor a project.', text: 'Work with students and researchers on real problems.', link1Label: 'Get in touch', link1Url: SIAT_LINKS.about }),
];

const bold = [
  t({ eyebrow: 'Apply', title: 'Applications open for Fall.', text: 'BA, BSc and joint majors.', link1Label: 'Start here', link1Url: SIAT_LINKS.apply, wide: true }),
  t({ eyebrow: 'Graduate', title: 'MA, MSc and PhD.', text: 'Thesis and project routes.', link1Label: 'Graduate programs', link1Url: SIAT_LINKS.grad }),
  img(PHOTO.projectionFaces),
  t({ eyebrow: 'News', title: 'What SIAT made this term.', link1Label: 'All news', link1Url: SIAT_LINKS.news }),
  t({ eyebrow: 'Events', title: 'Showcases, talks and open studios.', link1Label: 'Upcoming events', link1Url: SIAT_LINKS.events, wide: true }),
];

export const examples: Record<string, Example> = {
  audiences: {
    component: 'color-blocks',
    preset: 'Audience hub',
    real: { heading: '', intro: '', tiles: audiences },
  },
  bold: {
    component: 'color-blocks',
    preset: 'Bold',
    real: { heading: '', intro: '', tiles: bold },
  },
};
