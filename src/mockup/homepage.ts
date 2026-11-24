import type { ImageValue } from '../lib/types';
import type { Example } from '../ideas/types';
import { PHOTO } from '../ideas/siat';
import { HOME_SHOWCASE } from './showcase';

/*
 * SIAT homepage mockup: the real sfu.ca/siat homepage content (welcome text, research
 * slideshow, programs, news, events, statement, memorial), re-ordered and re-told with
 * the builder components. Each section is one AEM HTML component.
 */

export interface MockSection extends Example {
  /** Short name shown in the section list. */
  label: string;
}

const SIAT = 'https://www.sfu.ca/siat';
const UG = `${SIAT}/programs/undergraduate/prospective-students/degrees.html`;
const GR = `${SIAT}/programs/graduate/degrees.html`;
const img = (src: string, alt: string, pos = '50% 50%'): ImageValue => ({ src, alt, pos });

const NEWS = {
  amanda: img(`https://www.sfu.ca/content/sfu/siat/programs/undergraduate/current-students/co-op/co-op-blogs/fall-2026/amanda-eng/_jcr_content.img.png/1792531213.png`, 'Amanda Eng with an illustrated avatar of herself'),
  michael: img('https://www.sfu.ca/content/sfu/siat/news-events/news/2026/april/meet-michael-kim--recipient-of-the-2026-cody-sawatsky-memorial-a/_jcr_content.img.png/1777396151.png', 'Michael Kim, 2026 Cody Sawatsky Memorial Award recipient'),
  chi: img('https://www.sfu.ca/content/sfu/siat/news-events/news/2026/march/siat-researchers-take-home-chi-2026-award-for-best-paper/_jcr_content.img.png/1774473270.jpg', 'CHI 2026 conference artwork'),
};
const EVENT_IMG = {
  townHall: img('https://events.sfu.ca/live/image/gid/111/width/491/height/246/crop/1/src_region/0,0,2160,1080/12373_Eventbrite_LiveWhale_banners.rev.1794934717.png', 'SIAT Undergraduate Town Hall'),
  info: img('https://events.sfu.ca/live/image/gid/111/width/491/height/246/crop/1/src_region/0,0,941,468/12160_Screenshot_2026-10-07_at_2.16.29PM.rev.1791415920.png', 'SIAT Undergraduate Program Information Session'),
  explore: img('https://events.sfu.ca/live/image/gid/111/width/491/height/246/crop/1/src_region/0,0,1880,940/12333_ExploreSIAT_2027.rev.1794254174.png', 'Explore SIAT'),
};
const RUSSELL = img('https://www.sfu.ca/content/sfu/siat/jcr:content/main_content/image_1015268512.img.2000.high.jpg/1725395902108.jpg', 'Russell Taylor', '50% 30%');

export const HOMEPAGE: MockSection[] = [
  {
    label: 'Hero',
    component: 'hero',
    preset: 'Banner',
    props: { height: 'lg', headingSize: 'xl', kenburns: true, strength: 60 },
    real: {
      slides: [{
        image: PHOTO.projection,
        eyebrow: 'School of Interactive Arts & Technology',
        heading: 'Art, design and technology, made together.',
        text: 'An interdisciplinary, research-focused school at SFU Surrey.',
        ctaLabel: 'Find your program', ctaUrl: `${SIAT}/programs.html`,
        cta2Label: 'See the research', cta2Url: `${SIAT}/research.html`,
      }],
    },
  },
  {
    label: 'What’s on',
    component: 'marquee',
    preset: 'Ticker',
    real: {
      items: [
        { text: 'Undergraduate Town Hall · Nov 24', url: 'https://events.sfu.ca/event/51357-siat-undergraduate-town-hall' },
        { text: 'Info session online · Dec 2', url: 'https://events.sfu.ca/event/51364-siat-info-session-online' },
        { text: 'Explore SIAT · Jan 21 · Surrey & online', url: 'https://events.sfu.ca/event/51249-explore-siat' },
        { text: 'CHI 2026 Best Paper Award', url: `${SIAT}/news-events/news/2026/march/siat-researchers-take-home-chi-2026-award-for-best-paper.html` },
      ],
    },
  },
  {
    label: 'Who we are',
    component: 'statement',
    preset: 'Statement',
    props: { reveal: 'words' },
    real: {
      eyebrow: 'Welcome to SIAT',
      text: 'Here, *technologists*, *artists*, *designers* and *theorists* work side by side, inventing new media and studying how people live with technology.',
      links: [
        { label: 'About SIAT', url: `${SIAT}/about.html` },
        { label: 'Our people', url: `${SIAT}/people.html` },
      ],
    },
  },
  {
    label: 'Programs',
    component: 'hover-list',
    preset: 'Dark index',
    real: {
      eyebrow: 'Programs',
      heading: '',
      items: [
        { title: 'Bachelor of Arts', meta: 'BA', text: 'Create original and experimental work in interactive media.', image: PHOTO.bodyRemixer, url: `${UG}#siatmajor` },
        { title: 'Bachelor of Science', meta: 'BSc', text: 'Design and build inventive technologies, grounded in the science of human experience.', image: PHOTO.vrLab, url: `${UG}#siatmajor` },
        { title: 'Honours', meta: 'BA · BSc', text: 'Add a research thesis to your degree.', image: PHOTO.stickyWall, url: `${UG}#honours` },
        { title: 'Joint major', meta: 'Communication · Business', text: 'Pair Interactive Arts & Technology with another SFU school.', image: PHOTO.teamwork, url: `${UG}#jointmajor` },
        { title: 'Minor & second degree', meta: 'Undergraduate', text: 'Add SIAT to another degree, or start a second one.', image: PHOTO.sketching, url: `${UG}#siatminor` },
        { title: 'Master’s', meta: 'MA · MSc', text: 'Thesis or project routes, working in SIAT research labs.', image: PHOTO.mocap, url: `${GR}#MA` },
        { title: 'Doctorate', meta: 'PhD', text: 'Lead original research in interactive arts and technology.', image: PHOTO.vrHand, url: `${GR}#PhD` },
        { title: 'Visual Analytics', meta: 'Graduate Certificate', text: 'Make large, complex data readable and useful.', image: PHOTO.touch, url: `${GR}#visualanalytics` },
      ],
    },
  },
  {
    label: 'Research',
    component: 'rail',
    preset: 'Dark stories',
    real: {
      heading: 'Research you can step into',
      intro: 'SIAT researchers study technology and the human experience, and build what they study.',
      linkLabel: 'Explore SIAT research',
      linkUrl: `${SIAT}/research.html`,
      items: [
        { image: PHOTO.bodyRemixer, tag: 'Installation', title: 'Body RemiXer', role: 'Desnoyers-Stewart, Stepanova, Riecke, Pennefather', text: 'Mixed reality that connects people across the virtual and the actual.', url: `${SIAT}/research.html` },
        { image: PHOTO.butterflyTent, tag: 'Research', title: 'The butterfly tent', role: 'Alissa N. Antle and Jinsil Seo', text: 'A biofeedback game that helps children regulate emotion.', url: `${SIAT}/research.html` },
        { image: PHOTO.chronoscope, tag: 'Design', title: 'Chronoscope', role: 'Chen, Odom, Lin and Zhong', text: 'A device for exploring the past inside your own photo archive.', url: `${SIAT}/research.html` },
        { image: PHOTO.starWall, tag: 'Lab', title: 'VVISE Lab', role: 'Wolfgang Stuerzlinger', text: 'Virtual and augmented reality, visual analytics and interaction.', url: `${SIAT}/research.html` },
        { image: PHOTO.coda, tag: 'Performance', title: 'REVIVE', role: 'Philippe Pasquier', text: 'A CODA presentation of live, generative music.', url: `${SIAT}/research.html` },
      ],
    },
  },
  HOME_SHOWCASE,
  {
    label: 'News',
    component: 'rail',
    preset: 'Stories',
    real: {
      heading: 'Latest news',
      intro: '',
      linkLabel: 'Read more SIAT news',
      linkUrl: `${SIAT}/news-events/news.html`,
      items: [
        { image: NEWS.chi, tag: 'Research', title: 'SIAT researchers take home a CHI 2026 Best Paper Award', role: 'March 2026', text: '', url: `${SIAT}/news-events/news/2026/march/siat-researchers-take-home-chi-2026-award-for-best-paper.html` },
        { image: NEWS.michael, tag: 'Award', title: 'Meet Michael Kim, 2026 Cody Sawatsky Memorial Award in Gaming', role: 'April 2026', text: '', url: `${SIAT}/news-events/news/2026/april/meet-michael-kim--recipient-of-the-2026-cody-sawatsky-memorial-a.html` },
        { image: NEWS.amanda, tag: 'Co-op', title: 'How Amanda Eng found a design niche in the public sector', role: 'Co-op blog · Fall 2026', text: '', url: `${SIAT}/programs/undergraduate/current-students/co-op/co-op-blogs/fall-2026/amanda-eng.html` },
      ],
    },
  },
  {
    label: 'Events',
    component: 'rail',
    preset: 'Stories',
    props: { cardSize: 's' },
    common: { theme: 'grey' },
    real: {
      heading: 'Upcoming events',
      intro: '',
      linkLabel: 'View all events',
      linkUrl: `${SIAT}/news-events/events.html`,
      items: [
        { image: EVENT_IMG.townHall, tag: 'Event', title: 'SIAT Undergraduate Town Hall', role: 'Tue, Nov 24 · 2:00–4:00 pm', text: 'Location to be announced.', url: 'https://events.sfu.ca/event/51357-siat-undergraduate-town-hall' },
        { image: EVENT_IMG.info, tag: 'Online', title: 'SIAT Info Session', role: 'Wed, Dec 2 · 7:00–8:00 pm', text: 'On Zoom.', url: 'https://events.sfu.ca/event/51364-siat-info-session-online' },
        { image: EVENT_IMG.explore, tag: 'Event', title: 'Explore SIAT', role: 'Thu, Jan 21 · 6:00–7:30 pm', text: 'SFU Surrey campus and online.', url: 'https://events.sfu.ca/event/51249-explore-siat' },
      ],
    },
  },
  {
    label: 'Inside SIAT',
    component: 'mosaic',
    preset: 'Grid',
    real: {
      heading: 'Inside SIAT',
      intro: '',
      tiles: [
        { image: PHOTO.building, caption: 'SFU Surrey', size: 'L', url: '' },
        { image: PHOTO.greenScreen, caption: 'Green screen room', size: 'S', url: '' },
        { image: PHOTO.cnc, caption: 'CNC router', size: 'S', url: '' },
        { image: PHOTO.editSuite, caption: 'Video editing suite', size: 'W', url: '' },
        { image: PHOTO.fabLab, caption: 'Fabrication lab', size: 'T', url: '' },
        { image: PHOTO.studio, caption: 'Studio classroom', size: 'S', url: '' },
        { image: PHOTO.laser, caption: 'Laser cutting', size: 'S', url: '' },
        { image: PHOTO.workshop, caption: 'Studio critique', size: 'W', url: '' },
        { image: PHOTO.camera, caption: 'Shooting on location', size: 'S', url: '' },
      ],
    },
  },
  {
    label: 'Our commitment',
    component: 'statement',
    preset: 'Red band',
    props: { size: 'md' },
    real: {
      eyebrow: 'Our commitment',
      text: 'SIAT stands against *racism in all its forms*. We commit to building and sustaining an inclusive and safe community.',
      links: [{ label: 'Read the statement', url: `${SIAT}/news-events/news/2022/06/siat-anti-racism-statement.html` }],
    },
  },
  {
    label: 'In memoriam',
    component: 'quote-block',
    preset: 'Colour card',
    props: { mark: false, size: 'md', shape: '1:1' },
    real: {
      quotes: [{
        quote: 'Russell overflowed with passion for design, designers and design education, matched only by his commitment to students.',
        name: 'In memory of Russell Taylor',
        role: 'University lecturer, 22 years at SIAT',
        image: RUSSELL,
      }],
    },
  },
  {
    label: 'Next steps',
    component: 'color-blocks',
    preset: 'Audience hub',
    real: {
      heading: '',
      intro: '',
      tiles: [
        { kind: 'text', color: 'auto', eyebrow: 'Future students', title: 'Start your degree at SIAT.', text: 'BA, BSc, honours, joint majors and a minor.', link1Label: 'Undergraduate', link1Url: `${SIAT}/programs/undergraduate.html`, link2Label: 'Info sessions', link2Url: `${SIAT}/news-events/events.html`, image: { src: '', alt: '' }, wide: true },
        { kind: 'image', color: 'auto', eyebrow: '', title: '', text: '', link1Label: '', link1Url: '', link2Label: '', link2Url: '', image: PHOTO.atrium, wide: false },
        { kind: 'text', color: 'auto', eyebrow: 'Graduate', title: 'MA, MSc and PhD.', text: 'Plus a Graduate Certificate in Visual Analytics.', link1Label: 'Graduate programs', link1Url: `${SIAT}/programs/graduate.html`, link2Label: '', link2Url: '', image: { src: '', alt: '' }, wide: false },
        { kind: 'text', color: 'auto', eyebrow: 'Research', title: 'Labs, themes and publications.', text: 'Multi-disciplinary research on technology and the human experience.', link1Label: 'Research', link1Url: `${SIAT}/research.html`, link2Label: 'Faculty', link2Url: `${SIAT}/people/research-faculty.html`, image: { src: '', alt: '' }, wide: false },
        { kind: 'image', color: 'auto', eyebrow: 'Visit', title: 'SFU Surrey campus', text: '', link1Label: '', link1Url: `${SIAT}/contact.html`, link2Label: '', link2Url: '', image: PHOTO.buildingWide, wide: false },
        { kind: 'text', color: 'auto', eyebrow: 'Current students', title: 'Advising, co-op and awards.', text: '', link1Label: 'Current students', link1Url: `${SIAT}/programs/undergraduate/current-students.html`, link2Label: 'Contact', link2Url: `${SIAT}/contact.html`, image: { src: '', alt: '' }, wide: false },
      ],
    },
  },
];
