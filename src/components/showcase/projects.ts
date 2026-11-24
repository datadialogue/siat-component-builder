import type { ImageValue } from '../../lib/types';

/*
 * Real projects from sfu.ca/siat/showcase (Fall 2024 – Spring 2026). Titles, credits,
 * courses, links and images are as published; the one-line blurbs are shortened from
 * each project page's description. Topics are merged into one shared list because
 * the live site names them differently each term.
 */
export interface Project {
  _id?: string;
  image: ImageValue;
  title: string;
  blurb: string;
  topic: string;
  term: string;
  by: string;
  course: string;
  url: string;
}

const SC = 'https://www.sfu.ca/siat/showcase';
const IMG = 'https://www.sfu.ca/content/sfu/siat/showcase';
const S26 = 'Spring-2026-project-showcase', F25 = 'fall-2025-project-showcase', S25 = 'spring-2025-project-showcase', F24 = 'fall-2024-project-showcase';

const P = (term: string, dir: string, page: string, img: string, title: string, topic: string, blurb: string, by: string, course: string, alt: string): Project => ({
  image: { src: `${IMG}/${dir}/jcr:content/main_content/${img}`, alt, pos: '50% 50%' },
  title, blurb, topic, term, by, course, url: `${SC}/${dir}/${page}.html`,
});

export const TOPICS = {
  games: 'Games',
  anim: 'Animation',
  vr: 'VR & immersive',
  data: 'Data visualization',
  apps: 'Apps & interfaces',
  story: 'Stories & characters',
  film: 'Film & motion',
  space: 'Spatial & physical',
  ai: 'Simulation & AI',
};
const T = TOPICS;

export const PROJECTS: Project[] = [
  P('Spring 2026', S26, 'iat-445-Atom-Viscera', 'image.img.2000.high.jpg/1776878875600.jpg', 'Atom Viscera', T.vr, 'Shrink down 1000× to escape a robot factory in VR.', 'Pouya Salehi Najafabadi, Cooper Frederick Leong', 'IAT 445 Immersive Environments', 'Key art for the VR game Atom Viscera'),
  P('Spring 2026', S26, 'iat-410-Witchs-Winter', 'image_86138985.img.2000.high.png/1776813045332.png', "Witch's Winter", T.games, 'A pixel-art platformer about restoring the shattered seasons.', 'Yuge Wang, Yuan Xiao, Annie Vo, Kate Luong, Frentzen Taslim', 'IAT 410 Advanced Game Design', "Pixel-art scene from Witch's Winter"),
  P('Spring 2026', S26, 'iat-343-Under-Pressure', 'image_1205034114.img.2000.high.jpg/1776881634899.jpg', 'Under Pressure', T.anim, 'Two thieves, one diamond, and a rival they never saw coming.', 'Angelina Lim, Janis Tong, Yuxuan Ren (Evelyn), Nicole Li, Sara Ka Nam Chung, Hannah Wang', 'IAT 343 Animation', 'A diamond on a pedestal between reaching hands'),
  P('Spring 2026', S26, 'iat-355-Pokemon-Cultural-Relevance', 'image_951730530.img.2000.high.png/1777998030622.png', 'Pokemon Cultural Relevance', T.data, 'Thirty years of Pokémon, told in interactive charts.', 'Victoria Lee, KC Fedellaga, Danika Lescano', 'IAT 355 Introduction to Visual Analytics', 'Welcome screen of the PokéScope visualization'),
  P('Spring 2026', S26, 'iat-380-Lumi-Pip', 'image_1129778174.img.2000.high.jpg/1776884611825.jpg', 'Lumi & Pip', T.story, 'A young space gardener and her floating robot helper.', 'Erika Rachel Miranda', 'IAT 380 Special Topics', 'Character sheet for Lumi and her robot Pip'),
  P('Spring 2026', S26, 'iat-459-UniBazaar', 'image_1218240566.img.2000.high.png/1776878839902.png', 'UniBazaar', T.apps, 'A campus marketplace for second-hand student finds.', 'Yuhan Fan, Jessica Chan', 'IAT 459 Internet Computing Technologies', 'Screens from the UniBazaar mobile app'),
  P('Spring 2026', S26, 'iat-499-Beneath-the-Grey', 'image_1280815741.img.2000.high.png/1776813069561.png', 'Beneath the Grey', T.games, 'A survivor-like about reclaiming hope in a world of ash.', 'Yuge Wang, Yuan Xiao', 'IAT 499 Graduation Project', 'Title card for Beneath the Grey'),
  P('Spring 2026', S26, 'iat-343-WORLDS', 'image_1585156636.img.2000.high.jpg/1776885501318.jpeg', 'WORLDS', T.anim, 'A PS1-style horror short with a modern finish.', 'Roman Medvedev, Julian Ritter, Iris Jiang, Jiwon Song', 'IAT 343 Animation', 'A dark red still from the animation WORLDS'),
  P('Spring 2026', S26, 'iat-355-every-ai-query-has-a-carbon-cost', 'image_1935264820.img.2000.high.png/1778005179563.png', 'Every AI Query Has a Carbon Cost', T.data, 'Charting the fast-growing energy demand of AI.', 'Corina Chen', 'IAT 355 Introduction to Visual Analytics', 'Data visualization about the energy cost of AI'),
  P('Spring 2026', S26, 'iat-313-The-Tavern', 'image_63244737.img.2000.high.jpg/1776801066095.jpg', 'The Tavern', T.story, 'A visual novel about a cowardly teen and a missing father.', 'Zoey Lee, Wai Sing Chen, Lexi Qiao, Phoebe Qian, Priscilla Chan', 'IAT 313 Narrative and New Media', 'Title screen of the visual novel The Tavern'),
  P('Spring 2026', S26, 'iat-312-End-of-the-World', 'image_430897998.img.2000.high.jpg/1776878759367.jpg', 'End of the World', T.games, 'A survival board game of scarce supplies and hard choices.', 'Angelina Lim, Janis Tong, Kate (Minjin) Lee, Yu-Tung (Selina) Chu', 'IAT 312 Foundations of Game Design', 'The End of the World board game laid out on a table'),

  P('Fall 2025', F25, 'iat-445-something-lurking', 'image_150719458.img.2000.high.png/1768437291391.png', 'Something Lurking', T.vr, 'Something unseen moves aboard a failing space station.', 'Md Kashfi Or Rashid Pranta, Eric Gabriel Cheng Li, Kento Weil, Micheal Kim', 'IAT 445 Immersive Environments', 'A red-lit space station corridor'),
  P('Fall 2025', F25, 'iat-312-greedy-goblins', 'image_86138985.img.2000.high.jpg/1767650967037.jpg', 'Greedy Goblins', T.games, 'A card game of bluffing, swapping and social deduction.', 'Wesley Zhang, Joshua Nam, Jenna Han, Lori Jiang, William Qian', 'IAT 312 Foundations of Game Design', 'Title art for Greedy Goblins with a castle'),
  P('Fall 2025', F25, 'iat-343-autoviscera', 'image_16523871.img.2000.high.png/1768867895171.png', 'Autoviscera', T.anim, 'A sci-fi short where machines wage war and life persists.', 'Yotei Kikuya, Pouya Salehi, Cian Ho, Varren Viljoen', 'IAT 343 Animation', 'Title card for the animation Autoviscera'),
  P('Fall 2025', F25, 'iat-355-the-voyager', 'image_951730530.img.2000.high.jpg/1768869210761.jpg', 'The Voyager', T.data, "Humanity's journey into space, told in data.", 'Riya Daiya, Danelly Joseph', 'IAT 355 Introduction to Visual Analytics', 'The golden Voyager record'),
  P('Fall 2025', F25, 'iat-351-moody', 'image_866387175.img.2000.high.png/1767659508049.png', 'Moody', T.apps, 'Helps gamers track how they feel while they play.', 'Irena Lina Ong, Irina Ng, Michael Kim, Chisa Dang', 'IAT 351 Advanced Human-Computer Interaction', 'Moody app characters showing different moods'),
  P('Fall 2025', F25, 'iat-202-on-the-line', 'image_323106600.img.2000.high.jpg/1768416242531.jpg', 'On the Line', T.film, "A podcaster's secrets catch up with him. Audience Choice winner.", 'Rachel Ling Min Seah, Roman Medvedev, Travis Lee, Wai Sing Chen', 'IAT 202 New Media Images', 'The On the Line team with their Audience Choice award'),
  P('Fall 2025', F25, 'iat-233-the-voronial-pavilion', 'image_1235915253.img.2000.high.jpg/1770076915186.jpg', 'The Voronial Pavilion', T.space, "A parametric shelter for Surrey's Holland Park.", 'Lexi Qiao, Salena Karwa, Grace Hung', 'IAT 233 Spatial Design', 'Rendering of the Voronial Pavilion in a park'),
  P('Fall 2025', F25, 'iat-100-legs', 'image_1839283938.img.2000.high.jpg/1768864052488.jpg', 'LEGS', T.story, 'A song turned into a graphic novel.', 'Ching Wei (Winnie) Wang', 'IAT 100 Digital Image Design', 'Cover of the graphic novel LEGS'),

  P('Spring 2025', S25, 'iat-480-roaming-huaxia', 'image_1921667669.img.2000.high.jpg/1749242767200.jpg', 'Roaming Huaxia', T.games, 'A playful food journey from Beijing to Chongqing.', 'Clare Liu, Le Xu, Yizhang Zhu', 'IAT 480 Special Topics', 'Board and cards for the game Roaming Huaxia'),
  P('Spring 2025', S25, 'iat-445-the-p-o-r-t-a-l-project', 'image_440757566.img.2000.high.png/1749492104040.png', 'The P.O.R.T.A.L Project', T.vr, 'Be a lighthouse keeper where small acts have big effects.', 'Abhishek Mishra, Carlos Montoya, Seth van der Zweep, Thomas Sun, Duncan Templeton', 'IAT 445 Immersive Environments', 'Title card for The P.O.R.T.A.L Project'),
  P('Spring 2025', S25, 'iat-443-hot-tofu', 'image_1988508665.img.2000.high.png/1749236585183.png', 'Hot Tofu, Ôngbà', T.film, 'A docuseries pilot on food and immigrant life in Metro Vancouver.', 'Monica De Mesa, Alan Lam, Eric Militaru, Minh Tan Trinh, Siqi Li, Carlos Montoya-Aviles', 'IAT 443 Senior Project in Creative Media', 'Title card for Hot Tofu, Ông Bà'),
  P('Spring 2025', S25, 'iat-499-mossy--your-emotional-space', 'image_452663299.img.2000.high.png/1749493245052.png', 'Mossy: Your Emotional Space', T.apps, 'A two-minute daily mood check-in.', 'Miji Kim', 'IAT 499 Graduation Project', 'The Mossy app mascot'),
  P('Spring 2025', S25, 'iat-265-cosmic-architect', 'image_1272057256.img.2000.high.png/1749234765292.png', 'Cosmic Architect', T.ai, 'Build a solar system and make a planet habitable.', 'Aedrian Salazar', 'IAT 265 Multimedia Programming for Art and Design', 'Screenshot of the Cosmic Architect simulation'),
  P('Spring 2025', S25, 'iat-106-normal-disco', 'image_761249760.img.2000.high.png/1749069315359.png', 'Normal Disco', T.space, 'A hand-built automaton made to move beautifully.', 'Haoyu Zhan, Him Hang Leung', 'IAT 106 Spatial Thinking and Communicating', 'Drawing of the Normal Disco automaton'),
  P('Spring 2025', S25, 'iat-100-janet-and-the-cactus', 'image_1514769503.img.2000.high.png/1749068287362.png', 'Janet and the Cactus', T.film, 'Kinetic type in a pixel desktop style.', 'Winnie Shen', 'IAT 100 Digital Image Design', 'A pixel cactus in a desktop window'),
  P('Spring 2025', S25, 'iat-380-zachary-ying-and-the-dragon-emperor', 'image_1823430960.img.2000.high.jpg/1749491452789.jpg', 'Zachary Ying and the Dragon Emperor', T.story, 'Character and prop designs for an existing story.', 'Angelina Lim', 'IAT 380 Special Topics', 'Character sketches for Zachary Ying'),

  P('Fall 2024', F24, 'iat-445-afterimage', 'image_915424282.img.2000.high.png/1736795190353.png', 'AfterImage', T.vr, "A dreamy VR puzzle inside a patient's memories.", 'Yuncheng Chen, Chuqiao Zhong, Zhengyao Zhu, Siyu Chen', 'IAT 445 Immersive Environments', 'Visitors trying the AfterImage VR game'),
  P('Fall 2024', F24, 'iat-410-bandit-express', 'image_86138985.img.2000.high.png/1736796281218.png', 'Bandit Express', T.games, 'The worst cop in town takes back a train from raccoons.', 'Alicia LeClercq, Jalene Pang', 'IAT 410 Advanced Game Design', 'Title screen of Bandit Express with a train on a bridge'),
  P('Fall 2024', F24, 'iat-343-tiny-planets--big-dreams', 'image_942853102.img.2000.high.png/1736805884626.png', 'Tiny Planets, Big Dreams', T.anim, "A boy's dream trip into space with his favourite dolls.", 'Lynne Yang, Aden Trathen, Chris Moon, Christina Lee, Allison Lee', 'IAT 343 Animation', 'Title card for Tiny Planets, Big Dreams'),
  P('Fall 2024', F24, 'iat-360-pest-detector', 'image_481316948.img.2000.high.png/1736803734535.png', 'Pest Detector', T.ai, 'Computer vision that spots crop pests early.', 'Sylvia Siqi Zhang, Sa young Shin', 'IAT 360 Exploring Artificial Intelligence', 'A farmer checking crops, from Pest Detector'),
  P('Fall 2024', F24, 'iat-233-woven-pavilion', 'image_459065565.img.2000.high.jpg/1736873524278.jpg', 'Woven Pavilion', T.space, 'A dome of woven ribbons for Holland Park.', 'Mary Gigiberia, Khushy Brar', 'IAT 233 Spatial Design', 'Rendering of the Woven Pavilion'),
  P('Fall 2024', F24, 'iat-100-the-metamorphosis', 'image_319959464.img.2000.high.jpg/1736877093239.jpg', 'The Metamorphosis', T.story, "Kafka's classic as a hand-drawn graphic novel.", 'Inarah Usmani', 'IAT 100 Digital Image Design', 'Title page of a graphic novel of The Metamorphosis'),
];
