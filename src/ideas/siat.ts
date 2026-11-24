import type { ImageValue } from '../lib/types';

/*
 * Real photos from sfu.ca/siat (hotlinked from SFU's AEM DAM, so exported snippets
 * work on the live site too). Used by the Ideas page "Photos" mode.
 * Cards that pair a photo with an invented name/quote only use shots where the
 * person is not identifiable (headsets, mocap suits, backs of heads).
 */
const P = (src: string, alt: string, pos = '50% 50%'): ImageValue => ({ src, alt, pos });
const C = 'https://www.sfu.ca/content/sfu/siat';
const D = 'https://www.sfu.ca/content/dam/sfu/siat';

export const PHOTO = {
  projection: P(`${C}/jcr:content/main_content/textimage/image.img.2000.high.jpg/1684357859467.jpeg`, 'Silhouettes of visitors in front of an interactive projection'),
  butterflyTent: P(`${D}/Home/Research-slideshow/butterly_tent.jpeg/jcr:content/renditions/large.jpg`, 'A child inside the butterfly tent, a biofeedback game'),
  chronoscope: P(`${D}/Home/Research-slideshow/chronoscope.jpg/jcr:content/renditions/large.jpg`, 'The Chronoscope device held in a hand'),
  starWall: P(`${D}/Home/Research-slideshow/april152025-sfu-surrey-christine-mcavoy-0162_2.jpg/jcr:content/renditions/large.jpg`, 'Researchers in front of a large immersive display'),
  bodyRemixer: P(`${D}/Home/Research-slideshow/BodyRemiXer.png/jcr:content/renditions/original`, 'Body RemiXer mixed reality installation with glowing particles'),
  coda: P(`${D}/Home/Research-slideshow/CODA14.jpg/jcr:content/renditions/large.jpg`, 'A performer lit red inside a dark generative projection'),
  atrium: P(`${C}/jcr:content/main_content/textimage_365550010/image.img.2000.high.jpg/1689612318949.jpg`, 'Students working together in the Surrey campus atrium'),
  vrLab: P(`${C}/jcr:content/main_content/textimage_1243261667/image.img.2000.high.jpg/1689612327196.jpg`, 'A researcher guides a participant in a VR study'),
  touch: P(`${C}/research/jcr:content/main_content/textimage/image.img.2000.high.png/1635186105560.png`, 'A hand interacting with a 3D model on a touch screen'),
  vrStudent: P(`${C}/programs/jcr:content/main_content/textimage/image.img.2000.high.jpg/1677178820020.jpg`, 'A student wearing a VR headset', '60% 40%'),
  stickyWall: P(`${C}/programs/jcr:content/main_content/image_1070043746.img.2000.high.jpg/1677189667503.jpeg`, 'Students mapping ideas on a wall of sticky notes'),
  sketching: P(`${D}/People/staff.png/_jcr_content/renditions/medium.jpg`, 'Sketching next to a laptop'),
  tabletop: P(`${D}/People/research.png/_jcr_content/renditions/medium.jpg`, 'People exploring an interactive tabletop'),
  lecture: P(`${D}/People/teaching.png/_jcr_content/renditions/medium.jpg`, 'A lecture in a SIAT classroom'),
  building: P(`${D}/People/campus.png/_jcr_content/renditions/medium.jpg`, 'The timber roof of the SFU Surrey building'),
  convocation: P(`${D}/People/alumni.png/_jcr_content/renditions/medium.jpg`, 'Graduates in caps at convocation'),
  teamwork: P(`${D}/People/work_at_siat.png/_jcr_content/renditions/medium.jpg`, 'Students working on laptops at a table'),
  vrEvent: P(`${C}/programs/undergraduate/jcr:content/main_content/textimage/image.img.2000.high.jpg/1639694223249.jpg`, 'A visitor tries VR at a showcase', '50% 35%'),
  monitors: P(`${C}/programs/undergraduate/prospective-students/degrees/jcr:content/main_content/image.img.2000.high.jpg/1605215073195.jpg`, 'Students pointing at code on a monitor'),
  projectionFaces: P(`${C}/programs/graduate/jcr:content/main_content/textimage/image.img.2000.high.jpg/1629224913716.jpeg`, 'Projection mapping across a group of people'),
  electronics: P(`${C}/programs/graduate/jcr:content/main_content/image.img.2000.high.jpg/1688747853109.jpg`, 'Hands wiring an electronics prototype'),
  vrHand: P(`${C}/programs/graduate/degrees/jcr:content/main_content/image.img.2000.high.jpg/1673906092094.jpg`, 'A participant in a VR headset reaching into a virtual scene', '50% 40%'),
  mocap: P(`${C}/programs/graduate/degrees/jcr:content/main_content/image_1163619661.img.2000.high.jpg/1689179191687.jpg`, 'A performer in a motion capture suit on stage'),
  bioArt: P(`${C}/news-events/news/2026/june/postdoctoral-fellow-whitefeather-hunter-awarded-grant-to-support/_jcr_content.img.png/1782863137.jpg`, 'Working at a microscope in a bio-art lab'),
  exhibit: P(`${C}/news-events/news/2025/11/dreams--desires-and-the-digital-world--developing-critical-data-/_jcr_content.img.png/1762819356.jpg`, 'Visitors at a gallery installation'),
  aiFaces: P(`${C}/news-events/news/2025/07/introducing-our-newest-course--iat-111-artificial-intelligence-t/_jcr_content.img.png/1753218644.png`, 'A grid of AI-generated portraits'),
  studioDesk: P(`${C}/news-events/news/2025/07/what-really-makes-students-stand-out-in-the-workplace--soft-skil/_jcr_content.img.png/1752782319.png`, 'A green screen studio with a production desk'),
  camera: P(`${C}/research/themes/jcr:content/main_content/image_1903004468.img.2000.high.jpg/1705104149981.jpeg`, 'Students filming with a camera and a light'),
  buildingWide: P(`${C}/contact/jcr:content/main_content/textimage/image.img.2000.high.jpg/1629221274072.jpg`, 'Inside the SFU Surrey building'),
  showcase: P(`${C}/programs/undergraduate/prospective-students/jcr:content/main_content/textimage/image.img.2000.high.jpg/1635349521470.jpg`, 'Students presenting a project'),
  laser: P(`${D}/Undergrad/Spaces_and_Equipment/SpaceImages/SIAT%20Spaces-8%204x3.jpg/_jcr_content/renditions/xlarge.jpg`, 'Laser-cut shapes on a plywood sheet'),
  greenScreen: P(`${D}/Undergrad/Spaces_and_Equipment/SpaceImages/april152025-sfu-surrey-christine-mcavoy-0069_copy.jpg/_jcr_content/renditions/original`, 'A student on a treadmill in the green screen room'),
  fabLab: P(`${D}/Undergrad/Spaces_and_Equipment/SpaceImages/IMG_1983%204x3.JPG/_jcr_content/renditions/large.jpg`, 'The fabrication lab with saws and benches'),
  studio: P(`${D}/Undergrad/Spaces_and_Equipment/SpaceImages/SIAT%20Spaces-16%204x3.jpg/_jcr_content/renditions/xlarge.jpg`, 'A studio classroom with movable tables'),
  editSuite: P(`${D}/Undergrad/Spaces_and_Equipment/SpaceImages/april152025-sfu-surrey-christine-mcavoy-0060_copy.jpg/_jcr_content/renditions/large.jpg`, 'Students editing video beside a green screen'),
  workshop: P(`${D}/Undergrad/Spaces_and_Equipment/SpaceImages/IMG_5740%204x3.png/_jcr_content/renditions/large.jpg`, 'A class working in a studio with sticky notes on the wall'),
  cnc: P(`${D}/Undergrad/Spaces_and_Equipment/SpaceImages/IMG_1985%204x3.JPG/_jcr_content/renditions/large.jpg`, 'A CNC router cutting plywood'),
  game: P(`${C}/programs/undergraduate/prospective-students/jcr:content/main_content/textimage_1928887716/image.img.2000.high.jpg/1644859301343.jpg`, 'Key art for the student game Lux'),
  earth: P(`${C}/programs/undergraduate/jcr:content/main_content/image.img.2000.high.jpg/1678748248805.jpg`, 'A rendered satellite orbiting Earth'),
  interfuit: P(`${C}/news-events/news/2026/september/siat-hosts-the-canadian-premiere-of-interfuit/_jcr_content.img.png/1788989822.jpg`, 'Performers in a dim theatre installation'),
} satisfies Record<string, ImageValue>;

export const SIAT_URL = 'https://www.sfu.ca/siat.html';
export const SIAT_LINKS = {
  programs: 'https://www.sfu.ca/siat/programs.html',
  undergrad: 'https://www.sfu.ca/siat/programs/undergraduate.html',
  grad: 'https://www.sfu.ca/siat/programs/graduate.html',
  research: 'https://www.sfu.ca/siat/research.html',
  news: 'https://www.sfu.ca/siat/news-events/news.html',
  events: 'https://www.sfu.ca/siat/news-events/events.html',
  people: 'https://www.sfu.ca/siat/people.html',
  about: 'https://www.sfu.ca/siat/about.html',
  apply: 'https://www.sfu.ca/students/admission.html',
};
