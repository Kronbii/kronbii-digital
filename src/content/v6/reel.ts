/**
 * /v6, "Armed": the flight reel opened up into a page you read at your own
 * speed. Every fact here is already in the record: the shots are the reel's
 * own scenes (videos/armed-30), whose figures come from the ready authority
 * records, and the words around them are v3's plain-language layer. Nothing
 * marked [VERIFY] anywhere is used.
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
  type WorkItem,
} from '@/content/v3/work'
import { siteConfig } from '@/lib/site'

export const V6 = '/v6'

/** The page's sections, in reel order: number, chrome label, anchor. */
export const sections = [
  { id: 'id', no: '01', label: 'ID' },
  { id: 'proof', no: '02', label: 'Proof' },
  { id: 'glide', no: '03', label: 'Claim' },
  { id: 'see', no: '04', label: 'See' },
  { id: 'map', no: '05', label: 'Map' },
  { id: 'heat', no: '06', label: 'Heat' },
  { id: 'tune', no: '07', label: 'Tune' },
  { id: 'trace', no: '08', label: 'Trace' },
  { id: 'ship', no: '09', label: 'Ship' },
  { id: 'credits', no: '10', label: 'Credits' },
  { id: 'path', no: '11', label: 'Path' },
  { id: 'fly', no: '12', label: 'Fly' },
  { id: 'notes', no: '13', label: 'Notes' },
  { id: 'land', no: '14', label: 'Land' },
] as const

export type SectionId = (typeof sections)[number]['id']
export const sectionOf = (id: SectionId) => sections.find((s) => s.id === id)!

/** The six project shots, with the record they are cut from. */
export const shotSlugs = {
  see: 'brainiacs-autonomous-race-car',
  map: '360-spherical-panorama-stitching',
  heat: 'thermal-super-resolution',
  tune: 'easypid-arduino-library',
  trace: 'fine-crack-tracing-toolkit',
  ship: 'upstream-open-source-contributions',
} as const

export type ShotId = keyof typeof shotSlugs
export const shotOrder: ShotId[] = [
  'see',
  'map',
  'heat',
  'tune',
  'trace',
  'ship',
]
export const shotOfSlug = (slug: string) =>
  shotOrder.find((s) => shotSlugs[s] === slug)

/** What each shot shows, for assistive tech; the shot itself is illustration. */
export const shotAlt: Record<ShotId, string> = {
  see: 'The Brainiacs race car passing through a vision stack: the photo, its edge map, its strongest corners, and a lock box around the vehicle, beside its Arduino Mega schematic.',
  map: 'Feature matches between two phone frames, then 309 frames fanning out and closing into one panorama that curls into a sphere.',
  heat: 'A low-resolution thermal street scene, swept by its three-times enhanced output, with the ×2, ×3, and ×4 quality figures.',
  tune: 'A simulated step response settling as the damping rises, beside the easyPID library’s name and features.',
  trace:
    'A crack mask scanned in and thinned to a one-pixel skeleton, its ends and junctions marked and a break bridged, then each centreline redrawn and coloured by the crack’s width, exporting CSV, JSON and GeoJSON.',
  ship: 'A git graph of five upstream pull requests: three merge into main, one stays open, one is closed.',
}

/** The source a visitor most likely wants: a live demo, else the code. */
export function primarySource(w: WorkItem) {
  const s = w.project.sources
  return (
    s.find((x) => x.kind === 'demo') ??
    s.find((x) => x.kind === 'repository') ??
    s.find((x) => x.kind === 'listing') ??
    s[0]
  )
}

/** The companion note, only when it is ready. */
export function noteOf(w: WorkItem) {
  const a = getArticle(w.project.articleSlug)
  return a && a.state === 'ready'
    ? { title: a.title, href: noteHref(a.slug) }
    : undefined
}

export const shots = shotOrder.map((id) => {
  const w = workBySlug(shotSlugs[id])!
  return {
    id,
    section: sectionOf(id),
    work: w,
    href: workHref(w.project.slug, V6),
    source: primarySource(w),
    note: noteOf(w),
  }
})

/** Everything else that is ready, for the credits. */
export const creditWorks = works.filter(
  (w) => !shotOrder.some((s) => shotSlugs[s] === w.project.slug)
)

export const v6Copy = {
  meta: {
    title: 'Rami Kronbi — Flight reel (v6 preview)',
    description:
      'Rami Kronbi is a Lebanese robotics and embedded-systems engineer. The flight reel, opened up: each piece of work as a shot you can read.',
  },

  hero: {
    id: 'ID lock · operator',
    first: 'Rami',
    last: 'Kronbi',
    sub: 'Robotics & embedded-systems engineer',
    where: 'Beirut · Lebanon',
    chips: [
      { label: 'See', href: '#see' },
      { label: 'Map', href: '#map' },
      { label: 'Tune', href: '#tune' },
      { label: 'Fly', href: '#fly' },
    ],
    now: v3Home.hero.now,
    roll: 'Roll the reel',
  },

  proof: {
    title: 'The short version',
    creds: v3Home.creds.map((c) => ({ ...c, href: rebase(c.href, V6) })),
  },

  glide: {
    k: 'From the record',
    cam: 'Chase cam · simulated',
    /** v3's claim, one word per eighth; the hot word lands on the beat. */
    claim: [
      ['I', 'build', 'systems', 'that', 'sense'],
      ['the', 'world', 'and', 'act', 'on', 'it.'],
    ],
    hot: 'sense',
    strobe: [
      {
        src: '/images/authority/race-car/team.jpeg',
        pos: '50% 18%',
        b: 'Team',
        rest: 'Brainiacs · with Wassim Ghaddar',
      },
      {
        src: '/images/v6/race-edges.png',
        fit: 'contain',
        b: 'Sobel',
        rest: 'edges',
      },
      {
        src: '/images/v6/pano-matches.jpg',
        b: '921',
        rest: 'inliers per pair',
      },
      {
        src: '/images/v6/thermal-low.webp',
        pixel: true,
        b: 'Thermal',
        rest: 'input',
      },
      { src: '/images/v6/thermal-x3.webp', b: '×3', rest: 'output' },
      {
        src: '/images/v6/crack-ink.png',
        fit: 'contain',
        b: 'Crack',
        rest: 'mask',
      },
      {
        src: '/images/v6/race-schematic.png',
        fit: 'contain',
        paper: true,
        b: 'Arduino',
        rest: 'Mega',
      },
      { src: '/images/v6/pano-equirect.jpg', b: '333°', rest: 'sweep' },
    ] as {
      src: string
      pos?: string
      fit?: 'contain'
      pixel?: boolean
      paper?: boolean
      b: string
      rest: string
    }[],
    lede: 'Six shots from the reel follow. Each plays once when it reaches you; the words beside it say what it is, and what I did.',
  },

  slate: {
    part: 'My part',
    proof: 'Proof',
    open: 'Open the case',
    source: 'Source',
    note: 'Read the note',
    replay: 'Replay shot',
  },

  credits: {
    title: 'Also built',
    lede: (n: number) =>
      `${n} more pieces of work in the record, credited the way a film credits its crew.`,
    all: 'Every project',
  },

  path: {
    title: 'Path',
    lede: v3Home.log.lede,
    head: ['Event', 'Year', 'Clip', 'Note'],
    points: v3Home.log.points.map((p) => ({ ...p, href: rebase(p.href, V6) })),
  },

  fly: {
    no: '12 · Fly',
    words: ['Sense', 'Decide', 'Act'],
    focus: ['Robotics', 'Computer vision', 'Control systems', 'Edge AI'],
    swarm: '36 × E58 · formation flight, simulated',
    id: 'ID lock · formation',
    cap: '36 drones · one name',
    alt: 'Three words, sense, decide, act; then four focus areas fly at the lens, robotics, computer vision, control systems, edge AI; then 36 simulated pocket drones arrange themselves into the letters RK.',
  },

  notes: {
    title: 'Notes',
    lede: v3Home.notes.lede,
    items: v3Home.notes.slugs
      .map((s) => getArticle(s))
      .filter((a) => a && a.state === 'ready')
      .map((a) => ({ title: a!.title, dek: a!.dek, href: noteHref(a!.slug) })),
    all: { label: v3Home.notes.all, href: '/writing' },
  },

  land: {
    cap: 'Fig. ∞ · the operator',
    name: 'Rami Kronbi',
    sub: 'Robotics & embedded-systems engineer',
    where: 'Beirut · Lebanon',
    line: v2Home.signOff.heading.text,
    body: v2Home.signOff.body,
    email: siteConfig.email,
    emailLabel: 'Write to me',
    url: 'ramikronbi.com',
    disarmed: 'Disarmed',
    credit: 'E58 drone model · the_Thorminator · CC BY 4.0',
    alt: 'A pocket drone hovers over the sign-off, sets down beside the address, and its propellers spool down.',
  },
}

export const v6Chrome = {
  brand: 'Rami Kronbi',
  reel: 'Flight reel',
  skip: 'Skip to content',
  preview: 'v6 preview',
  bpm: '128 BPM',
  nav: [
    { label: 'Work', href: `${V6}#see` },
    { label: 'Path', href: `${V6}#path` },
    { label: 'Projects', href: `${V6}/projects` },
    { label: 'Contact', href: `${V6}#land` },
  ],
  footer: {
    note: 'This is /v6, a design exploration of ramikronbi.com. It is not indexed; the live site stays canonical.',
    live: 'Open the live site',
    copyright: `© 2026 ${siteConfig.name} · ${siteConfig.location}`,
  },
  profiles: [
    { label: 'GitHub', href: siteConfig.socials.github },
    { label: 'LinkedIn', href: siteConfig.socials.linkedin },
    { label: 'Medium', href: siteConfig.socials.medium },
    { label: 'Arduino Libraries', href: siteConfig.socials.arduinolibraries },
    { label: 'ResearchGate', href: siteConfig.socials.researchgate },
  ],
}

export { workHref }
