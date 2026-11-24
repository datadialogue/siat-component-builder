import type { Finding, Source } from './types';

/*
 * What we took from the Webby "School/University" winners and nominees (2024–2026).
 * Keep each finding to a title and one or two plain sentences.
 */

export const WEBBY_URL = 'https://winners.webbyawards.com/winners/websites-and-mobile-sites/general-desktop-mobile-sites/schooluniversity?years=0';

const SITES = {
  lsad: ['LSAD Graduates', 'https://www.lsadgraduates.ie/'],
  cornell: ['Cornell Human Ecology', 'https://human.cornell.edu/'],
  sva: ['SVA MFA Interaction Design', 'https://interactiondesign.sva.edu/'],
  mica: ['MICA', 'https://www.mica.edu/'],
  gsb100: ['Stanford GSB Centennial', 'https://gsb100.stanford.edu/'],
  bryant: ['Bryant University', 'https://www.bryant.edu/'],
  schwarzman: ['Schwarzman Scholars 10 Years', 'https://www.schwarzmanscholars.org/ten-year-anniversary/'],
  vcuarts: ['VCUarts', 'https://arts.vcu.edu/'],
  harvard: ['Harvard Chan School', 'https://hsph.harvard.edu/'],
  hca: ['Hereford College of Arts', 'https://www.hca.ac.uk/'],
  lovecolorado: ['Love Colorado', 'https://lovecolorado.com/'],
  momentum: ['Stanford Momentum', 'https://momentum.stanford.edu/'],
  moore: ['Moore College Viewbook', 'https://moore.edu/viewbook/'],
  yale: ['Yale & Slavery', 'https://yaleandslavery.yale.edu/'],
  risd: ['RISD', 'https://www.risd.edu/'],
  saic: ['SAIC', 'https://www.saic.edu/'],
  wyss: ['Wyss Institute', 'https://wyss.harvard.edu/'],
} as const;

const s = (key: keyof typeof SITES, shot: string): Source => ({ site: SITES[key][0], url: SITES[key][1], shot: `${key}-${shot}.jpg` });

export const FINDINGS: Finding[] = [
  {
    id: 'order',
    kind: 'Order',
    title: 'The same order, again and again',
    text: 'Most winners open with one bold line, then show ways in, proof, people and stories, and end with what’s on and one clear next step. Each band answers one question.',
    sources: [s('harvard', 'full'), s('saic', 'full'), s('hca', 'full')],
    examples: [],
    flow: [
      { label: 'Bold line', to: 'statement' },
      { label: 'Ways in', to: 'path' },
      { label: 'Proof', to: 'proof' },
      { label: 'People', to: 'people' },
      { label: 'Stories', to: 'rows' },
      { label: 'What’s on', to: 'moving' },
      { label: 'Next step', to: 'blocks' },
    ],
  },
  {
    id: 'statement',
    kind: 'Content',
    title: 'Open with a sentence, not a welcome',
    text: 'The first thing you read is one confident line about who the school is. A few words carry colour.',
    sources: [s('cornell', 'f02'), s('risd', 'f00'), s('hca', 'f00')],
    examples: ['statement'],
  },
  {
    id: 'inline',
    kind: 'Content',
    title: 'Links live inside the story',
    text: 'One short paragraph with small link chips dropped into it. Reading and moving on become the same thing.',
    sources: [s('vcuarts', 'f02')],
    examples: ['statement:inline'],
  },
  {
    id: 'path',
    kind: 'Interaction',
    title: 'Let people pick a path',
    text: 'Visitors finish a sentence like “I’d like to be…” and get the programs that fit. A long menu becomes one answer.',
    sources: [s('lsad', 'f04'), s('moore', 'f02'), s('bryant', 'f04'), s('lovecolorado', 'f02')],
    examples: ['path-finder'],
  },
  {
    id: 'index',
    kind: 'Interaction',
    title: 'Programs as a big, quiet index',
    text: 'Program lists are set in large type with arrows. A picture appears only when you hover, so the list stays clean.',
    sources: [s('vcuarts', 'f03'), s('cornell', 'f04')],
    examples: ['hover-list'],
  },
  {
    id: 'people',
    kind: 'Content',
    title: 'Faces, with one line each',
    text: 'Portraits with a name and one sentence about what that person did. Short, human, and easy to swipe through.',
    sources: [s('harvard', 'f03'), s('saic', 'f05'), s('lovecolorado', 'f04')],
    examples: ['rail:people'],
  },
  {
    id: 'rows',
    kind: 'Order',
    title: 'Stories in rows, tagged by type',
    text: 'Each chapter is a heading, one line and a row of cards. A small tag says whether it is a video, a feature or a podcast.',
    sources: [s('schwarzman', 'f02'), s('risd', 'f09'), s('momentum', 'f08')],
    examples: ['rail:stories'],
  },
  {
    id: 'quotes',
    kind: 'Content',
    title: 'Quotes as pauses',
    text: 'Large student quotes sit between photo sections. They slow the page and let a real voice speak.',
    sources: [s('moore', 'f09'), s('schwarzman', 'f07'), s('lsad', 'f03')],
    examples: ['quote-block'],
  },
  {
    id: 'proof',
    kind: 'Content',
    title: 'Proof you can see',
    text: 'Outcomes appear as bars or big numbers next to a plain question, like “Where do graduates work?”.',
    sources: [s('sva', 'f11'), s('wyss', 'f04'), s('saic', 'f02')],
    examples: ['stat-bars'],
  },
  {
    id: 'blocks',
    kind: 'Look',
    title: 'Colour blocks by audience',
    text: 'Strong colour tiles split the page by who is visiting. Each tile has one claim and two links.',
    sources: [s('mica', 'f01'), s('saic', 'f03'), s('hca', 'f01')],
    examples: ['color-blocks'],
  },
  {
    id: 'timeline',
    kind: 'Interaction',
    title: 'History with a sticky index',
    text: 'A side index stays put while dated entries scroll past, and it lights up where you are. Long stories stay easy to follow.',
    sources: [s('yale', 'f05'), s('schwarzman', 'f01')],
    examples: ['timeline'],
  },
  {
    id: 'mosaic',
    kind: 'Look',
    title: 'Let the photos talk',
    text: 'A dense wall of studio and event photos shows energy faster than a paragraph can.',
    sources: [s('gsb100', 'f05'), s('moore', 'f06')],
    examples: ['mosaic'],
  },
  {
    id: 'moving',
    kind: 'Interaction',
    title: 'Type that moves',
    text: 'A slow ticker for dates and deadlines, or one giant word that slides as you scroll. Motion without video.',
    sources: [s('hca', 'f09'), s('momentum', 'f13')],
    examples: ['marquee:ticker', 'marquee:giant'],
  },
];
