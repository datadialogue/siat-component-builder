import type { MockSection } from './homepage';

/*
 * Showcase page mockup: the same real projects (src/components/showcase/projects.ts)
 * in each Project Showcase layout, so they can be compared on one page. A real page
 * would use one of them.
 */
const SC = 'https://www.sfu.ca/siat/showcase.html';
const SUBMIT = 'https://www.sfu.ca/siat/showcase/showcase-submission.html';

export const SHOWCASE: MockSection[] = [
  {
    label: 'Grid',
    component: 'showcase',
    preset: 'Grid',
    props: { eyebrow: 'Student work', heading: 'Project showcase', linkLabel: 'Submit a project', linkUrl: SUBMIT, featured: 9 },
  },
  {
    label: 'Mosaic',
    component: 'showcase',
    preset: 'Mosaic',
    props: { eyebrow: 'Made at SIAT', heading: 'Fresh from the studios', intro: 'Random picks from the last two years. Shuffle for more.', linkLabel: '', featured: 10 },
  },
  {
    label: 'Masonry',
    component: 'showcase',
    preset: 'Masonry',
    props: { eyebrow: 'Browse', heading: 'Find work by topic', intro: 'Pick a topic, then a year.', featured: 12, showBy: true, linkLabel: '' },
  },
  {
    label: 'Index',
    component: 'showcase',
    preset: 'Index',
    props: { eyebrow: 'All projects', heading: 'The project index', intro: 'Every title in one list. Hover a row for a look.', featured: 8, linkLabel: 'Past showcases', linkUrl: SC },
  },
  {
    label: 'Rail',
    component: 'showcase',
    preset: 'Rail',
    props: { eyebrow: 'By term', heading: 'Term by term', intro: '', yearFilter: 'term', featured: 8, linkLabel: 'Submit a project', linkUrl: SUBMIT },
  },
];

/** Smaller version for the homepage. */
export const HOME_SHOWCASE: MockSection = {
  label: 'Student work',
  component: 'showcase',
  preset: 'Grid',
  props: {
    eyebrow: 'Student work', heading: 'Made by SIAT students', intro: '', cardStyle: 'overlay', aspect: '4:3', gap: '12',
    featured: 6, yearFilter: 'none', linkLabel: 'All projects', linkUrl: SC, allLabel: 'See more projects',
  },
};
