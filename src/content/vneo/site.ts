/**
 * Vneo: the site the versions were for. Its words are the ones Rami already
 * kept: v7's chapters (the work by who it serves), v3's plain-language layer
 * and flight log, v2's tracker field and sign-off, and v6's reel scenes for
 * the engineering underneath. Every fact comes from a ready record or a
 * ready article; nothing marked [VERIFY] is used.
 */

import { getArticle } from '@/content/authority'
import { v2Home } from '@/content/v2/home'
import { v3Home } from '@/content/v3/home'
import {
  noteHref,
  rebase,
  workBySlug,
  workHref,
  works,
} from '@/content/v3/work'
import { shotAlt } from '@/content/v6/reel'
import { buildChapters, buildGroups, type Chapter } from '@/content/v7/home'
import { siteConfig } from '@/lib/site'

/** Vneo is the site: its pages live at the root. */
export const VN = ''
/** The home page, as a link target. */
export const HOME = '/'

/** Writing opens inside Vneo, with a way back. */
export const writingHref = (slug: string) => `${VN}/writing/${slug}`
const intoVneo = (href: string) =>
  href.startsWith('/writing/') ? `${VN}${href}` : href

/** The Brainiacs car, in its refined photograph. */
export const RACE_PHOTO = '/images/vneo/race-refined.jpg'
const RACE_ORIGINAL = '/images/authority/race-car/front.jpeg'
export const racePhoto = <T extends { src: string }>(m: T): T =>
  m.src === RACE_ORIGINAL ? { ...m, src: RACE_PHOTO } : m

export const chapters: Chapter[] = buildChapters(VN).map((c) => ({
  ...c,
  plate:
    c.id === 'machines'
      ? {
          kind: 'image' as const,
          src: '/images/vneo/race-refined-crop.jpg',
          position: '50% 50%',
        }
      : c.plate,
  link:
    c.id === 'clinics'
      ? {
          label: 'How Basira works',
          href: writingHref('designing-a-council-of-models-for-retinal-screening'),
        }
      : { ...c.link, href: intoVneo(c.link.href) },
  more: c.more ? { ...c.more, href: intoVneo(c.more.href) } : undefined,
}))
export const groups = buildGroups(VN)
/** "More of the work": the groups, minus what the page already shows. */
export const moreGroups = () =>
  groups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) => !shownAbove.has(it.href.split('/').pop()!)),
    }))
    .filter((g) => g.items.length)
export const chapterOf = (slug: string) =>
  chapters.find((c) => c.link.href === workHref(slug, VN))

/** The reel: the engineering underneath, one shot at a time. */
export const reel = (
  [
    {
      id: 'see',
      tab: 'See',
      slug: 'brainiacs-autonomous-race-car',
      line: 'A car that reads the course and steers itself: the camera’s view, its edges, its strongest corners, and the lock.',
    },
    {
      id: 'map',
      tab: 'Map',
      slug: '360-spherical-panorama-stitching',
      line: 'One handheld phone sweep, 309 frames, stitched into a sphere you can walk around.',
    },
    {
      id: 'heat',
      tab: 'Heat',
      slug: 'thermal-super-resolution',
      line: 'A low-resolution thermal image, upscaled three times by a model small enough to run beside the sensor.',
    },
    {
      id: 'tune',
      tab: 'Tune',
      slug: 'easypid-arduino-library',
      line: 'The feedback loop that keeps a motor on target, as a library anyone can install.',
    },
    {
      id: 'trace',
      tab: 'Trace',
      slug: 'fine-crack-tracing-toolkit',
      line: 'A crack already found in an image, turned into an ordered path you can measure.',
    },
    {
      id: 'ship',
      tab: 'Ship',
      slug: 'upstream-open-source-contributions',
      line: 'Fixes sent to the open-source projects themselves: three merged by their maintainers.',
    },
  ] as const
).map((r) => {
  const w = workBySlug(r.slug)!
  return {
    ...r,
    title: w.project.title.split(' — ')[0],
    href: workHref(r.slug, VN),
    alt: shotAlt[r.id],
  }
})
export type ReelId = (typeof reel)[number]['id']

/** A piece of work as the grid and the theater show it. */
type Motion =
  | { kind: 'shot'; id: ReelId }
  | { kind: 'scene'; id: Chapter['id'] }
  | { kind: 'own'; id: 'demining' }

/** What each project's own scene shows, for screen readers. */
export const ownAlt = {
  demining:
    'An illustration: a rover sweeps a planned path over a georeferenced grid and marks what it finds; its stack reads sense, perceive, localize, plan, act.',
} as const
const workItem = (slug: string, motion: Motion | undefined, shows: string) => {
  const w = workBySlug(slug)!
  return {
    slug,
    title: w.project.title.split(' — ')[0],
    kind: w.plain.kind,
    line: w.plain.line,
    proof: w.plain.proof,
    part: w.plain.part,
    href: workHref(slug, VN),
    motion,
    shows,
    alt:
      motion?.kind === 'shot'
        ? shotAlt[motion.id]
        : motion?.kind === 'own'
          ? ownAlt[motion.id]
          : (chapters.find((c) => c.id === motion?.id)?.alt ?? w.plain.line),
  }
}
export type WorkItem = ReturnType<typeof workItem>

export type TileSize = 'big' | 'wide' | 'tall' | 'one'
export type ShowItem = WorkItem & {
  size: TileSize
  /** Its place in the desktop grid (grid-template-areas in vneo.css). */
  area: string
  image?: { src: string; position?: string; fit?: 'contain'; poster?: string }
  figure?: { from: string; fromNote: string; to: string; toNote: string }
  /** Opens outside the site (a project with no page here yet). */
  external?: boolean
}

/**
 * The work, as one tight grid, from most to least important: the landmine
 * robot and the drone first, then OmniSign, the rotor-fault study, the
 * road-speed audit and the thermal model. The first four pieces with motion
 * play in turn like a reel.
 */
export const showcase: ShowItem[] = [
  {
    ...workItem('landmine-detection-extraction-robot', undefined, ''),
    alt: 'RViz shows the rover’s 2D map and planned path, then the rover drives itself through the indoor arena.',
    size: 'big',
    area: 'mine',
    image: {
      src: '/images/authority/landmine/navigation.mp4',
      poster: '/images/authority/landmine/navigation-poster.jpg',
    },
  },
  {
    ...workItem('five-inch-carbon-fiber-fpv-drone', undefined, ''),
    size: 'big',
    area: 'fpv',
    image: {
      src: '/images/authority/fpv-drone/build.jpg',
      position: '50% 54%',
    },
  },
  {
    ...workItem(
      'omnisign-lebanese-sign-language',
      { kind: 'scene', id: 'signers' },
      'A hand read as tracked points, then turned into text on a phone, the web, or an offline device.'
    ),
    size: 'tall',
    area: 'omni',
  },
  {
    ...workItem('quadrotor-rotor-fault-recovery', undefined, ''),
    size: 'wide',
    area: 'rot',
    image: {
      src: '/images/authority/quadrotor-rotor-fault-recovery/rotor-loss-sim.mp4',
      poster: '/images/authority/quadrotor-rotor-fault-recovery/rotor-loss-sim-poster.jpg',
    },
  },
  {
    ...workItem('road-speed-audit', undefined, ''),
    size: 'wide',
    area: 'road',
    image: {
      src: '/images/authority/road-speed-audit/a40-speed-overlay.mp4',
      poster: '/images/authority/road-speed-audit/a40-speed-overlay-poster.jpg',
    },
  },
  {
    ...workItem(
      'thermal-super-resolution',
      { kind: 'shot', id: 'heat' },
      'The low-resolution thermal input, swept by its ×3 output.'
    ),
    size: 'tall',
    area: 'heat',
  },
  {
    ...workItem(
      '360-spherical-panorama-stitching',
      { kind: 'shot', id: 'map' },
      '309 frames from one phone sweep, closing into one sphere.'
    ),
    size: 'wide',
    area: 'pano',
  },
  {
    ...workItem(
      'brainiacs-autonomous-race-car',
      { kind: 'shot', id: 'see' },
      'The car’s camera view, its edges, its strongest corners, and the lock.'
    ),
    size: 'wide',
    area: 'race',
  },
  {
    ...workItem('imu-bench', undefined, ''),
    size: 'wide',
    area: 'imu',
    image: {
      src: '/images/authority/imu-bench/tile.mp4',
      poster: '/images/authority/imu-bench/tile-poster.jpg',
    },
  },
  {
    ...workItem(
      'fine-crack-tracing-toolkit',
      { kind: 'shot', id: 'trace' },
      'A crack mask becomes candidate points, a spanning tree, and one smooth path.'
    ),
    size: 'tall',
    area: 'crk',
  },
  {
    ...workItem(
      'easypid-arduino-library',
      { kind: 'shot', id: 'tune' },
      'A simulated step response settling as the damping rises.'
    ),
    size: 'wide',
    area: 'pid',
  },
  {
    ...workItem('esp32-barn-door-star-tracker', undefined, ''),
    size: 'tall',
    area: 'star',
    image: {
      src: '/images/authority/esp32-barn-door-star-tracker/cad-render-square.png',
      fit: 'contain',
    },
  },
]
/** How many of the first motion tiles play in turn when the grid arrives. */
export const FEATURED = 4

/** In the community: the work built for people, and the rooms where it is shared. */
const scene = (id: Chapter['id']) => chapters.find((c) => c.id === id)!
export const community = {
  label: 'In the community',
  title: 'Built for people, and shared in person.',
  hot: 'people',
  built: [
    { ...scene('families'), size: 'big' as const },
    { ...scene('clinics'), size: 'tall' as const },
    { ...scene('students'), size: 'one' as const },
  ],
  talk: {
    label: 'Speaker',
    event: 'GDG DevFest Tripoli 2025',
    when: '20 December 2025',
    title:
      'On-Device Multimodal Assistants: Can We Fit GPT-Vision on Small Hardware?',
    note: 'Quantization, memory budgets, and hardware acceleration, ending with a live demo.',
    demo: 'Live demo',
    image: {
      src: '/images/authority/talks/devfest-title.jpg',
      alt: 'The talk’s opening slide, “Can we make Jarvis real?”, at GDG DevFest Tripoli 2025.',
    },
    href: writingHref('talks-workshops-and-teaching'),
  },
  workshops: {
    label: 'Workshops',
    title: 'Git, GitHub, and the long way into AI',
    items: [
      'CodewithSerah bootcamp, two sessions · January 2026',
      'LAU Byblos SWE Club, coordinator; material by Tarek AlSaleh · April 2026',
    ],
    href: writingHref('talks-workshops-and-teaching'),
  },
  mentoring: {
    label: 'Mentoring',
    title: 'INJAZ Al-Arab',
    note: 'Technical mentor to two school healthcare teams, LumiScan and Dosely, from first idea to prototype; both were awarded in 2026.',
    image: {
      src: '/images/authority/injaz/dosely-booth.jpg',
      alt: 'Rami Kronbi with the Dosely team at their INJAZ Lebanon booth.',
    },
    href: writingHref('mentoring-two-healthcare-teams-at-injaz'),
  },
  /** The last row, the whole width: four years of Space Apps. */
  organizing: {
    label: 'Organizing',
    title: 'NASA Space Apps Beirut',
    years: ['2021', '2022', '2023', '2024'],
    stats: [
      { value: '250–400', label: 'participants a year' },
      { value: '6×', label: 'teams I mentored in the global top 10' },
    ],
    note: 'Lead technical organizer for four years, running technical bootcamps on NASA data and mentoring the teams.',
    image: {
      src: '/images/authority/space-apps/hackathon-hall.jpg',
      alt: 'Rami Kronbi taking a selfie in front of a hall full of teams working at laptops during NASA Space Apps Beirut.',
    },
    href: writingHref('what-four-years-of-technical-mentoring-taught-me'),
  },
  read: 'Read more',
}

/**
 * Already shown above, so "More of the work" lists only the rest; and the
 * work kept off the home page, which only All projects lists.
 */
export const shownAbove = new Set([
  ...showcase.map((t) => t.slug),
  'basira-retinal-screening',
  'posture-aware-classroom-desk',
  'ree-personal-finance-tracker',
  'drone-control-bootcamp',
])

/** What I build (v3's sentence): one line, each phrase lit while pointed at. */
const build = {
  title: v3Home.build.title,
  lead: v3Home.build.lead,
  groups: v3Home.build.groups.map(({ id, phrase, joiner }) => ({
    id,
    phrase,
    joiner,
  })),
  portrait: {
    // the live site's portrait (/images/home/portrait.webp), set on a lit sage backdrop
    src: '/images/vneo/portrait-sage.webp',
    alt: 'Rami Kronbi in profile, in black and white.',
    tag: 'ID lock · Rami',
  },
}

/**
 * My professional experience, in order: the roles, ventures and mentoring,
 * flown as v3's flight log. Projects and prizes live in their own sections.
 */
const log = {
  label: 'Experience',
  title: 'Flight log',
  points: [
    {
      when: '2021 – 2024',
      what: 'Technical mentor and organizer, NASA Space Apps Beirut',
      note: 'Ran technical bootcamps on NASA data and mentored hackathon teams, for 250–400 participants a year.',
      href: writingHref('what-four-years-of-technical-mentoring-taught-me'),
    },
    {
      when: '2022 – 2023',
      what: 'Computer-vision intern, VIBE',
      note: 'At a startup, I built emotion recognition on edge hardware to support children with autism.',
      href: workHref('emotion-recognition-autism-support', VN),
    },
    {
      when: '2022 – 2025',
      what: 'Lab and teaching assistant, Rafik Hariri University',
      note: 'Ran mechatronics lab sessions, and organized the university’s robotics competitions, including IEEE Micromouse.',
      href: siteConfig.education.url,
    },
    {
      when: '2023 – 2025',
      what: 'Co-founder, Evoid',
      note: 'Systems engineer and product manager at a small applied computer-vision venture in Beirut.',
      href: writingHref('what-a-small-vision-venture-taught-me-about-scope'),
    },
    {
      when: '2024 – now',
      what: 'Embedded Systems & Vision Engineer, Oreyeon',
      note: 'Full time: real-time vision for airport runway safety, on NVIDIA Jetson.',
      href: siteConfig.employer.url,
    },
    {
      when: '2024 – 2026',
      what: 'Co-founder and operations lead, NASNA',
      note: 'A crisis-response platform connecting displaced families with NGOs, donors, and volunteers.',
      href: writingHref('building-technology-around-crisis-response-operations'),
    },
    {
      when: '2026',
      what: 'Technical mentor, INJAZ Al-Arab',
      note: 'Took two school healthcare teams from first idea to award-winning prototypes.',
      href: writingHref('mentoring-two-healthcare-teams-at-injaz'),
    },
  ],
}

const note = (slug: string) => {
  const a = getArticle(slug)
  return a && a.state === 'ready'
    ? { title: a.title, dek: a.dek, href: writingHref(a.slug) }
    : undefined
}

export const vneo = {
  meta: {
    title: 'Rami Kronbi — Robotics, vision & embedded systems engineer',
    description:
      'Rami Kronbi, robotics, vision & embedded systems engineer in Beirut: a mine-detection rover with 3D LiDAR SLAM, sign-language recognition, drones, and more.',
  },
  hero: {
    id: 'ID lock · engineer',
    first: 'Rami',
    last: 'Kronbi',
    sub: 'Robotics, vision & embedded systems engineer',
    where: siteConfig.location.replace(', ', ' · '),
    chips: [
      { label: 'Work', href: '#work' },
      { label: 'Community', href: '#community' },
      { label: 'Contact', href: '#sign-off' },
    ],
  },
  glance: [
    {
      big: 'Now',
      label: 'Embedded Systems & Vision Engineer at Oreyeon',
      note: 'real-time vision for runway safety',
      href: siteConfig.employer.url,
    },
    {
      big: '4×',
      label: 'Co-founder',
      note: 'NASNA · OmniSign · Bsheel · Evoid',
      href: `${HOME}#community`,
    },
    {
      big: '2025',
      label: 'Mechatronics engineer, RHU',
      note: 'valedictorian, 4.0/4.0, full master’s scholarship',
      href: 'https://www.rhu.edu.lb/media-room/news/rhu-commencement-2025-a-tribute-to-legacy-learning-and-new-beginnings',
    },
    {
      big: 'Mentor',
      label: 'Speaker and mentor',
      note: 'DevFest Tripoli · NASA Space Apps · INJAZ',
      href: `${VN}/about#about-teaching`,
    },
  ],
  work: {
    no: 4,
    /** every project on the site, for the button under the grid */
    total: works.length,
    viewAll: 'View all projects',
    label: 'Work',
    title: 'Selected projects.',
    hot: 'projects',
    all: 'All projects',
    open: 'Open the project',
    watch: 'Watch',
    prev: 'Previous piece',
    next: 'Next piece',
    close: 'Close',
  },

  notes: {
    label: 'Writing',
    title: 'How the work was done.',
    hot: 'done',
    items: [
      'designing-election-information-for-verifiability',
      'building-technology-around-crisis-response-operations',
      'building-an-autonomous-race-car-in-twenty-days',
    ]
      .map(note)
      .filter((n): n is NonNullable<typeof n> => !!n),
    all: { label: 'All writing', href: `${VN}/writing` },
  },
  build,
  log,
  /** After the selected projects: sense, decide, act, once around each of three machines, in its own footage. */
  laps: {
    no: 5,
    label: 'The loop',
    title: 'Three machines, one loop.',
    hot: 'loop',
    replay: 'Play again',
  },
  /** The closing shot: sense, decide, act, as a 5-inch quad that loses a rotor and flies on (the drone swarm is in the backlog). */
  loop: {
    label: 'Sense, decide, act',
    heading:
      'Sense, decide, act: robotics, computer vision, embedded systems, and edge AI.',
    replay: 'Play again',
  },
  /** The robot pack, the closing shot before the quad; it now opens the robotics and perception hub. */
  pack: {
    accent: '#b7d3a8',
    replay: 'Play again',
    words: ['Sense', 'Decide', 'Act'],
    note: 'Illustration · 36 × Unitree Go2, simulated on a circuit board',
    tracks: [30, 22, 27, 32],
    track: 'Go2',
    focus: ['Robotics', 'Computer vision', 'Embedded systems', 'Edge AI'],
    id: 'ID lock · pack',
    cap: '36 robots · one name',
    credit:
      'Unitree Go2 model © Unitree Robotics (BSD 3-Clause), via MuJoCo Menagerie.',
    alt: 'Three words, sense, decide, act, as a pack of 36 simulated Unitree Go2 robot dogs on a circuit board is scanned and tracked, falls into ranks, and trots out into a ring; then four focus areas fly at the lens, robotics, computer vision, embedded systems, edge AI, as the pack gallops at it; then the robots walk into the letters RK., the board lights a trace between them, and a jump runs through the letters.',
  },
  more: {
    label: 'More of the work',
    title: 'And the rest, by who it serves.',
    hot: 'serves',
    all: 'Every project',
  },
  signOff: v2Home.signOff,
}

export const vneoChrome = {
  brand: 'Rami Kronbi',
  skip: 'Skip to content',
  nav: [
    { label: 'Work', href: `${HOME}#work` },
    { label: 'Community', href: `${HOME}#community` },
    { label: 'Projects', href: `${VN}/projects` },
    { label: 'Writing', href: `${VN}/writing` },
    { label: 'About', href: `${VN}/about` },
    { label: 'Contact', href: `${HOME}#sign-off` },
  ],
  /** The burger that holds the nav on a phone. */
  menu: { open: 'Menu', close: 'Close the menu' },
  footer: {
    links: [
      { label: 'Projects', href: '/projects' },
      { label: 'Writing', href: '/writing' },
      { label: 'Topics', href: '/topics' },
      { label: 'About', href: '/about' },
    ],
    copyright: `© 2026 ${siteConfig.name} · ${siteConfig.location}`,
  },
}

export { works, workHref }
