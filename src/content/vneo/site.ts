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
  link: { ...c.link, href: intoVneo(c.link.href) },
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
        : (chapters.find((c) => c.id === motion?.id)?.alt ?? w.plain.line),
  }
}
export type WorkItem = ReturnType<typeof workItem>

export type TileSize = 'big' | 'wide' | 'tall' | 'one'
export type ShowItem = WorkItem & {
  size: TileSize
  /** Its place in the desktop grid (grid-template-areas in vneo.css). */
  area: string
  image?: { src: string; position?: string; fit?: 'contain' }
  figure?: { from: string; fromNote: string; to: string; toNote: string }
  /** Opens outside the site (a project with no page here yet). */
  external?: boolean
}

/** Juno, the new version of my finance app, shown by its screenshot. */
const juno: ShowItem = {
  ...workItem('juno', undefined, ''),
  alt: 'Juno’s home screen with demo data: the month’s spending, budgets, and accounts.',
  size: 'wide',
  area: 'juno',
  image: { src: '/images/vneo/juno-home.jpg', position: '0% 0%' },
}

/**
 * The work, as one tight grid, by importance: the biggest tiles for the work
 * that matters most (the drone, then the car, OmniSign, and the thermal
 * model). The first four pieces with motion play in turn like a reel.
 */
export const showcase: ShowItem[] = [
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
    ...workItem(
      'brainiacs-autonomous-race-car',
      { kind: 'shot', id: 'see' },
      'The car’s camera view, its edges, its strongest corners, and the lock.'
    ),
    size: 'wide',
    area: 'race',
  },
  {
    ...workItem(
      'daleel-lebanese-election-information',
      { kind: 'scene', id: 'voters' },
      'A fact, traced back to its source, with its history kept.'
    ),
    size: 'wide',
    area: 'dal',
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
      'upstream-open-source-contributions',
      { kind: 'shot', id: 'ship' },
      'Five pull requests to Betaflight, PX4, and OpenFront: three merged.'
    ),
    size: 'wide',
    area: 'ship',
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
      'easypid-arduino-library',
      { kind: 'shot', id: 'tune' },
      'A simulated step response settling as the damping rises.'
    ),
    size: 'one',
    area: 'pid',
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
    ...workItem('imagen-raw-to-edit-dataset-pipeline', undefined, ''),
    size: 'wide',
    area: 'img',
    figure: {
      from: '2–3',
      fromNote: 'a day, team of three',
      to: '~40',
      toNote: 'a day, per person',
    },
  },
  {
    ...workItem('lebanese-motorcycle-theory-trainer', undefined, ''),
    size: 'one',
    area: 'moto',
    image: {
      src: '/images/authority/motorcycle-trainer/sign-127.webp',
      fit: 'contain',
    },
  },
  juno,
]
/** How many of the first motion tiles play in turn when the grid arrives. */
export const FEATURED = 4

/** In the community: the work built for people, and the rooms where it is shared. */
const scene = (id: Chapter['id']) => chapters.find((c) => c.id === id)!
export const community = {
  label: 'In the community',
  title: 'Built for people, and shared in person.',
  hot: 'people',
  lede: 'Software for families in a crisis and for clinics, a desk for students, and the talks and workshops where I teach what I know.',
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
    href: writingHref('talks-workshops-and-teaching'),
  },
  workshops: {
    label: 'Workshops',
    title: 'Git & GitHub, hands on',
    items: [
      'CodewithSerah bootcamp · January 2026',
      'LAU Byblos Software Engineering Club · April 2026',
    ],
    href: writingHref('talks-workshops-and-teaching'),
  },
  mentoring: {
    label: 'Mentoring',
    title: 'NASA Space Apps, Beirut',
    years: ['2021', '2022', '2023', '2024'],
    note: 'Lead technical organizer: bootcamps on NASA data, problem selection, and prototyping for its teams.',
    href: writingHref('what-four-years-of-technical-mentoring-taught-me'),
  },
  read: 'Read more',
}

/** Already shown above, so "More of the work" lists only the rest; REE is superseded by Juno. */
export const shownAbove = new Set([
  ...showcase.map((t) => t.slug),
  'basira-retinal-screening',
  'posture-aware-classroom-desk',
  'ree-personal-finance-tracker',
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
 * The path so far (v3's flight log, as v4 flew it), its links moved into
 * Vneo: only the turning points, so not the talk or the single upstream fix.
 */
const LOG_SKIP = new Set([
  'Spoke at GDG DevFest Tripoli',
  'A fix merged into Betaflight',
])
const log = {
  ...v3Home.log,
  points: v3Home.log.points
    .filter((p) => !LOG_SKIP.has(p.what))
    .map((p) => ({
      ...p,
      href: intoVneo(rebase(p.href, VN)),
    })),
}

const note = (slug: string) => {
  const a = getArticle(slug)
  return a && a.state === 'ready'
    ? { title: a.title, dek: a.dek, href: writingHref(a.slug) }
    : undefined
}

export const vneo = {
  meta: {
    title: 'Rami Kronbi — Robotics, embedded, and systems engineer',
    description:
      'Rami Kronbi is a robotics, embedded, and systems engineer in Beirut who builds for people: election information for voters, crisis coordination for displaced families, second readings for clinics, and robots that steer themselves.',
  },
  hero: {
    id: 'ID lock · engineer',
    first: 'Rami',
    last: 'Kronbi',
    sub: 'Robotics, embedded & systems engineer',
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
      label: 'Embedded Systems Engineer at Oreyeon',
      note: 'real-time vision for runway safety',
      href: siteConfig.employer.url,
    },
    {
      big: '3×',
      label: 'Co-founder',
      note: 'Evoid · NASNA · OmniSign',
      href: `${HOME}#community`,
    },
    {
      big: '2025',
      label: 'Mechatronics engineer, RHU',
      note: 'graduated with a full master’s scholarship',
      href: siteConfig.education.url,
    },
    {
      big: 'Mentor',
      label: 'Speaker and mentor',
      note: 'GDG DevFest Tripoli · NASA Space Apps Beirut',
      href: writingHref('talks-workshops-and-teaching'),
    },
  ],
  work: {
    no: 3,
    label: 'Work',
    title: 'Selected projects.',
    hot: 'projects',
    lede: 'The most important come first and play as you arrive; hover any to see it again, or press Watch for the full view. Each says what it does, my part, and the fact to check.',
    /** The same, for a phone: no hover there, and the grid becomes a row to swipe. */
    ledeTouch:
      'The most important come first, each playing as it comes into view; swipe for the rest, or press Watch for the full view. Each says what it does, my part, and the fact to check.',
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
    lede: v3Home.notes.lede,
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
  /** The closing shot: sense, decide, act, as the robot pack (the drone swarm is in the backlog). */
  loop: {
    label: 'Sense, decide, act',
    heading:
      'Sense, decide, act: robotics, computer vision, embedded systems, and edge AI.',
    replay: 'Play again',
    accent: '#b7d3a8',
    pack: {
      words: ['Sense', 'Decide', 'Act'],
      note: '36 × Unitree Go2 · on a circuit board, simulated',
      tracks: [30, 22, 27, 32],
      track: 'Go2',
      focus: ['Robotics', 'Computer vision', 'Embedded systems', 'Edge AI'],
      id: 'ID lock · pack',
      cap: '36 robots · one name',
      credit:
        'Unitree Go2 model © Unitree Robotics (BSD 3-Clause), via MuJoCo Menagerie.',
      alt: 'Three words, sense, decide, act, as a pack of 36 simulated Unitree Go2 robot dogs on a circuit board is scanned and tracked, falls into ranks, and trots out into a ring; then four focus areas fly at the lens, robotics, computer vision, embedded systems, edge AI, as the pack gallops at it; then the robots walk into the letters RK., the board lights a trace between them, and a jump runs through the letters.',
    },
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
    { label: 'Contact', href: `${HOME}#sign-off` },
  ],
  footer: {
    links: [
      { label: 'Projects', href: '/projects' },
      { label: 'Writing', href: '/writing' },
      { label: 'Topics', href: '/topics' },
    ],
    copyright: `© 2026 ${siteConfig.name} · ${siteConfig.location}`,
  },
}

export { works, workHref }
