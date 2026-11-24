import type { Example } from '../types';
import { PHOTO } from '../siat';

const tiles = [
  { image: PHOTO.bodyRemixer, caption: 'Body RemiXer, a mixed reality installation', size: 'L', url: '' },
  { image: PHOTO.vrEvent, caption: 'Trying VR at the year-end showcase', size: 'S', url: '' },
  { image: PHOTO.laser, caption: 'Laser-cut parts in the fabrication lab', size: 'S', url: '' },
  { image: PHOTO.mocap, caption: 'Motion capture on stage', size: 'T', url: '' },
  { image: PHOTO.building, caption: 'Under the timber roof in Surrey', size: 'W', url: '' },
  { image: PHOTO.stickyWall, caption: 'Mapping ideas in a design studio', size: 'S', url: '' },
  { image: PHOTO.electronics, caption: 'Wiring a prototype', size: 'S', url: '' },
  { image: PHOTO.projectionFaces, caption: 'Projection mapping experiments', size: 'W', url: '' },
  { image: PHOTO.greenScreen, caption: 'The green screen room', size: 'T', url: '' },
  { image: PHOTO.convocation, caption: 'Convocation day', size: 'S', url: '' },
  { image: PHOTO.coda, caption: 'A generative performance', size: 'S', url: '' },
  { image: PHOTO.cnc, caption: 'The CNC router at work', size: 'W', url: '' },
];

export const examples: Record<string, Example> = {
  wall: {
    component: 'mosaic',
    preset: 'Grid',
    real: { heading: 'A year at SIAT', intro: '', tiles },
  },
  collage: {
    component: 'mosaic',
    preset: 'Collage',
    real: { heading: 'Scenes from the showcase', intro: '', tiles: tiles.slice(0, 9) },
  },
};
