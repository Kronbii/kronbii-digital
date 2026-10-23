/**
 * /v7, "Focus": the work by who it serves. Every line restates a ready
 * record or a ready article (the NASNA chapter comes from the crisis-response
 * note, which is its only public record here); v3's plain-language layer
 * supplies the one-sentence summaries. Nothing marked [VERIFY] is used.
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
import { siteConfig } from '@/lib/site'

export const V7 = '/v7'

export type ChapterId =
  | 'voters'
  | 'families'
  | 'clinics'
  | 'signers'
  | 'students'
  | 'machines'

export interface Chapter {
  id: ChapterId
  /** Who it is for, as the hero's sentence ends: "I build for …". */
  who: string
  /** The chapter's label. */
  label: string
  /** One sentence anyone can follow. */
  title: string
  /** The word in the title set in the serif. */
  hot: string
  line: string
  part: string
  /** What the shot shows, for assistive tech. */
  alt: string
  link: { label: string; href: string; external?: boolean }
  more?: { label: string; href: string; external?: boolean }
  /** For the hero plate. */
  plate:
    | { kind: 'image'; src: string; position?: string }
    | { kind: 'type'; text: string; dir?: 'rtl' }
  name: string
}

const w = (slug: string) => workBySlug(slug)!
const nasna = getArticle(
  'building-technology-around-crisis-response-operations'
)
const note = (slug: string) => {
  const a = getArticle(slug)
  return a && a.state === 'ready' ? noteHref(a.slug) : undefined
}

/** The chapters, with their links inside the given version (e.g. /v7). */
export function buildChapters(base: string): Chapter[] {
  return [
    {
      id: 'voters',
      who: 'voters',
      label: 'For voters',
      name: 'Daleel',
      title: 'Election information you can trace back to its source.',
      hot: 'source',
      line: 'Daleel keeps every fact with where it came from and how it changed, in Arabic, English, and French.',
      part: w('daleel-lebanese-election-information').plain.part,
      alt: 'The Daleel platform; a fact lifts off it, a thread traces it back to its source, and its earlier versions stack up underneath, kept rather than overwritten.',
      link: {
        label: 'How Daleel works',
        href: workHref('daleel-lebanese-election-information', base),
      },
      plate: {
        kind: 'image',
        src: '/images/authority/daleel/hero.jpeg',
        position: '50% 30%',
      },
    },
    {
      id: 'families',
      who: 'families in a crisis',
      label: 'For families in a crisis',
      name: 'NASNA',
      title: 'Displaced families, matched with the people who can help.',
      hot: 'help',
      line: 'NASNA connects displaced and war-affected families in Lebanon with NGOs, donors, and volunteers. Its intake form works offline, NGOs see only the cases that match what they cover, and a family’s phone number never appears in their case feed.',
      part: 'Co-founder, AI engineer and developer, with Mohammad Homsi, Abed El-Fattah Amouneh, and Lynn El Solh',
      alt: 'Families, NASNA, and NGOs as three groups; a request is saved offline, syncs when the connection returns, and reaches only the NGO whose coverage matches it, while the family’s phone number stays out of the feed.',
      link: {
        label: 'Read how it was built',
        href:
          note('building-technology-around-crisis-response-operations') ??
          '/writing',
      },
      more: nasna
        ? { label: 'nasna.world', href: 'https://nasna.world', external: true }
        : undefined,
      plate: { kind: 'type', text: 'ناسنا', dir: 'rtl' },
    },
    {
      id: 'clinics',
      who: 'clinics',
      label: 'For clinics',
      name: 'Basira',
      title: 'A second reading of an eye scan, and the doctor still decides.',
      hot: 'doctor',
      line: 'Three AI models each read a retinal image and report how far they agree. It is a prototype, not a medical device: the doctor confirms or overrides every report.',
      part: 'Built alone',
      alt: 'A retinal scan read three times, once by each model; their agreement fills a bar, and the report waits for the doctor to confirm or override.',
      link: {
        label: 'How Basira works',
        href: workHref('basira-retinal-screening', base),
      },
      plate: { kind: 'type', text: 'Basira' },
    },
    {
      id: 'signers',
      who: 'people who sign',
      label: 'For people who sign',
      name: 'OmniSign',
      title: 'Lebanese Sign Language, recognized in real time.',
      hot: 'real time',
      line: 'OmniSign reads signing from a camera and runs on phones, on the web, and on offline devices.',
      part: 'Co-founder and computer vision engineer, in a team of five',
      alt: 'An illustration of a hand as tracked points; the skeleton connects, and the reading becomes a line of text, on a phone, the web, or an offline device.',
      link: {
        label: 'How OmniSign works',
        href: workHref('omnisign-lebanese-sign-language', base),
      },
      plate: { kind: 'type', text: 'OmniSign' },
    },
    {
      id: 'students',
      who: 'students',
      label: 'For students',
      name: 'BEMO',
      title: 'A classroom desk that notices how you sit.',
      hot: 'notices',
      line: 'A camera reads posture, and the desk adjusts its own height and tilt, slowly, with a light for instant feedback and a dashboard for the longer view.',
      part: 'Team lead in a team of five',
      alt: 'The BEMO desk prototype at night; a camera sees posture, the desktop raises and tilts slowly, and a light gives instant feedback.',
      link: {
        label: 'How the desk works',
        href: workHref('posture-aware-classroom-desk', base),
      },
      plate: {
        kind: 'image',
        src: '/images/authority/smart-desk/night-pic.jpeg',
      },
    },
    {
      id: 'machines',
      who: 'machines that move',
      label: 'And machines that move',
      name: 'Brainiacs',
      title: 'Robots that see, decide, and steer themselves.',
      hot: 'steer',
      line: 'A self-driving car built from scratch in 20 days took third in Future Engineers at WRO Lebanon 2023. Drones are the love: a fix of mine was merged into Betaflight, the firmware that flies FPV drones.',
      part: 'Team of two, with Wassim Ghaddar',
      alt: 'The Brainiacs race car; a counter runs to 20 days, the placing lands, third in Future Engineers at WRO Lebanon, and a merged Betaflight fix follows.',
      link: {
        label: 'How the car works',
        href: workHref('brainiacs-autonomous-race-car', base),
      },
      more: {
        label: 'The Betaflight fix',
        href: workHref('upstream-open-source-contributions', base),
      },
      plate: {
        kind: 'image',
        src: '/images/v6/race-crop.jpg',
        position: '50% 60%',
      },
    },
  ]
}

export const chapters = buildChapters(V7)

/** Everything else that is ready, grouped by who it is for. */
const GROUPS: { label: string; slugs: string[] }[] = [
  {
    label: 'Safety',
    slugs: [
      'quadrotor-rotor-fault-recovery',
      'landmine-detection-extraction-robot',
      'runway-inspection-uav',
      'road-speed-audit',
    ],
  },
  { label: 'Learners', slugs: ['drone-control-bootcamp'] },
  { label: 'Care', slugs: ['emotion-recognition-autism-support'] },
  {
    label: 'Engineers and makers',
    slugs: [
      'easypid-arduino-library',
      'upstream-open-source-contributions',
      'pid-light-tracking-robot',
      'fine-crack-tracing-toolkit',
      'ice-engine-simulator',
      'esp32-barn-door-star-tracker',
    ],
  },
  {
    label: 'Seeing better',
    slugs: ['thermal-super-resolution', '360-spherical-panorama-stitching'],
  },
  { label: 'Players', slugs: ['bsheel-quest-app'] },
]

export const buildGroups = (base: string) =>
  GROUPS.map((g) => ({
    label: g.label,
    items: g.slugs
      .map((s) => workBySlug(s))
      .filter((x): x is NonNullable<typeof x> => !!x)
      .map((x) => ({
        title: x.project.title.split(' — ')[0],
        line: x.plain.line,
        href: workHref(x.project.slug, base),
      })),
  }))

export const groups = buildGroups(V7)

export const v7Copy = {
  meta: {
    title:
      'Rami Kronbi — Robotics, embedded, and systems engineer (v7 preview)',
    description:
      'Rami Kronbi is a robotics, embedded, and systems engineer in Beirut who builds for people: election information for voters, crisis coordination for displaced families, second readings for clinics, and robots that steer themselves.',
  },
  hero: {
    first: 'Rami',
    last: 'Kronbi',
    role: 'Robotics, embedded, and systems engineer',
    where: siteConfig.location,
    lead: 'I build for',
    now: v3Home.hero.now,
    down: 'See who it’s for',
  },
  proof: v3Home.creds.map((c) => ({ ...c, href: rebase(c.href, V7) })),
  proofLabel: 'At a glance',
  partLabel: 'My part',
  more: {
    title: 'More of the work',
    lede: (n: number) => `${n} more projects, by who they serve.`,
    all: 'Every project',
  },
  contact: {
    line: v2Home.signOff.heading.text,
    body: v2Home.signOff.body,
    email: siteConfig.email,
    label: 'Write to me',
  },
  replay: 'Play again',
  illustration: 'Illustration',
}

export const v7Chrome = {
  brand: 'Rami Kronbi',
  skip: 'Skip to content',
  nav: [
    { label: 'Work', href: `${V7}#voters` },
    { label: 'Projects', href: `${V7}/projects` },
    { label: 'Contact', href: `${V7}#contact` },
  ],
  footer: {
    note: 'This is /v7, a design exploration of ramikronbi.com. It is not indexed; the live site stays canonical.',
    live: 'Open the live site',
    copyright: `© 2026 ${siteConfig.name} · ${siteConfig.location}`,
  },
  profiles: [
    { label: 'GitHub', href: siteConfig.socials.github },
    { label: 'LinkedIn', href: siteConfig.socials.linkedin },
    { label: 'Medium', href: siteConfig.socials.medium },
    { label: 'Arduino Libraries', href: siteConfig.socials.arduinolibraries },
  ],
}

/** The chapter a project is told in, if it has one. */
export const chapterOf = (
  slug: string,
  list: Chapter[] = chapters,
  base = V7
) => list.find((c) => c.link.href === workHref(slug, base))

export { works, workHref }
