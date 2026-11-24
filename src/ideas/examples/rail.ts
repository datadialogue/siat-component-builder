import type { Example } from '../types';
import { PHOTO, SIAT_LINKS } from '../siat';

// Sample copy. People cards use only photos where the person is not identifiable.
export const examples: Record<string, Example> = {
  people: {
    component: 'rail',
    preset: 'People',
    real: {
      heading: 'Meet the people making SIAT',
      intro: 'Students who design, code and perform their way through Surrey.',
      linkLabel: 'More stories',
      linkUrl: SIAT_LINKS.people,
      items: [
        { image: PHOTO.vrStudent, title: 'Maya', role: '4th year, Interactive Systems', text: 'I came for games and stayed for the research labs.', tag: '', url: '' },
        { image: PHOTO.mocap, title: 'Daniel', role: 'MA student, Media Arts', text: 'My thesis is a dance piece the audience can steer.', tag: '', url: '' },
        { image: PHOTO.editSuite, title: 'Priya', role: '3rd year, Design', text: 'The green screen room became my second home.', tag: '', url: '' },
        { image: PHOTO.vrHand, title: 'Sam', role: 'PhD student, Interactive Systems', text: 'I study how people reach for things in VR.', tag: '', url: '' },
        { image: PHOTO.camera, title: 'Lena', role: '2nd year, Media Arts', text: 'First week, I was already holding a camera.', tag: '', url: '' },
        { image: PHOTO.electronics, title: 'Omar', role: '4th year, joint major with Business', text: 'I prototype hardware, then pitch it.', tag: '', url: '' },
      ],
    },
  },
  stories: {
    component: 'rail',
    preset: 'Stories',
    real: {
      heading: 'Latest from SIAT',
      intro: '',
      linkLabel: 'All news',
      linkUrl: SIAT_LINKS.news,
      items: [
        { image: PHOTO.starWall, tag: 'News', title: 'SIAT researchers win a CHI best paper award', role: 'March 2026', text: 'A study of how people reflect with their photo archives.', url: SIAT_LINKS.news },
        { image: PHOTO.teamwork, tag: 'Feature', title: 'A co-op term with the Teaching and Learning Centre', role: 'Co-op blog', text: 'Eight months designing learning tools across Canada.', url: SIAT_LINKS.news },
        { image: PHOTO.vrEvent, tag: 'Event', title: 'Spring showcase: 40 student projects', role: 'April 2026', text: 'Games, installations and apps from four years of studio.', url: SIAT_LINKS.events },
        { image: PHOTO.aiFaces, tag: 'News', title: 'New course: AI for creative practice', role: 'IAT 111', text: 'A first-year course on making with, and questioning, AI.', url: SIAT_LINKS.undergrad },
        { image: PHOTO.vrLab, tag: 'Video', title: 'Inside the VR lab', role: '3 min', text: 'How researchers test movement and presence in VR.', url: SIAT_LINKS.research },
        { image: PHOTO.bodyRemixer, tag: 'Podcast', title: 'Bodies, sensors and shared space', role: '24 min', text: 'A talk with the team behind Body RemiXer.', url: SIAT_LINKS.research },
      ],
    },
  },
};
