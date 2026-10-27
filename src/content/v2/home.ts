/**
 * Copy and curation for the /v2 homepage. Facts come from the authority
 * records (verified-current items only); nothing marked [VERIFY]
 * in src/content/home.ts is reproduced here.
 */

import { siteConfig } from '@/lib/site'

export interface EmphText {
  text: string
  /** The one word set in Instrument Serif italic. */
  emphasis?: string
}

export interface FeaturedEntry {
  slug: string
  /** Which of the record's own images carries the plate. Defaults to the hero. */
  plateSrc?: string
  layout: 'wide' | 'left' | 'right' | 'figure' | 'compare'
  /** Labels of the record's measurements to show, in order. Defaults to the first three. */
  readings?: string[]
}

export interface RoleEntry {
  period: string
  role: string
  org: string
  note: string
  href: string
}

export const v2Home = {
  meta: {
    title: 'Rami Kronbi — Engineering record (v2 preview)',
    description:
      'Rami Kronbi is a Lebanese robotics and embedded-systems engineer. This is his engineering record: systems shown working, with their limits and evidence.',
  },

  hero: {
    name: 'Rami Kronbi',
    claim: { text: 'I build systems that sense the world and act on it.', emphasis: 'sense' } as EmphText,
    descriptor: 'Robotics and embedded-systems engineer',
    location: siteConfig.location,
    contentsLabel: 'Contents',
    readAction: 'Read the record',
    contactAction: 'Get in touch',
  },

  specimen: {
    label: 'Fig. 0',
    model: {
      title: 'Eachine E58 Pocket Drone',
      href: 'https://sketchfab.com/3d-models/none-95c15555467b455ea9e2e923904e9b60',
      author: 'the_Thorminator',
      authorHref: 'https://sketchfab.com/the_Thorminator',
      license: 'CC BY 4.0',
      licenseHref: 'https://creativecommons.org/licenses/by/4.0/',
    },
    hint: 'Drag it, or use the arrow keys; a simulated self-level loop brings it back.',
    ariaLabel:
      'Interactive folding pocket-drone model. Drag or use the arrow keys to tilt it; a simulated self-levelling controller returns it to level.',
    propLabel: (n: number) => `Prop ${n}`,
    callouts: {
      arm: 'Folding arm',
      airframe: 'Airframe',
      camera: 'Camera',
    },
    /** Labels for the procedural quadrotor, used only if the model cannot load. */
    fallbackCallouts: ['Rotor 1 · CW', 'Nav lamp', 'Airframe', 'Gimbal · camera'],
    fallbackCaption: 'Procedural quadrotor model.',
    modes: { loading: 'Loading', manual: 'Manual', level: 'Self-level', settled: 'Level' },
    simulated: 'Simulated mixer',
  },

  ticker: [
    'Engineering record',
    'Robotics',
    'Embedded perception',
    'Computer vision',
    'Control systems',
    'Edge AI',
    'Open source',
    'Beirut, Lebanon',
  ],

  entries: {
    heading: { text: 'Entries from the record', emphasis: 'record' } as EmphText,
    lede: 'Six systems, each with what it measured and the limit it admits to. The full record holds the rest.',
    allAction: 'Open the full contents',
    recordAction: 'Full record',
    noteAction: 'Field note',
    limitLabel: 'Known limit',
    items: [
      { slug: '360-spherical-panorama-stitching', layout: 'wide' },
      {
        slug: 'brainiacs-autonomous-race-car',
        layout: 'left',
        plateSrc: '/images/authority/race-car/front.jpeg',
      },
      {
        slug: 'thermal-super-resolution',
        layout: 'compare',
        plateSrc: '/images/authority/thermal-super-resolution/thermal-plate.webp',
      },
      { slug: 'easypid-arduino-library', layout: 'figure' },
      { slug: 'daleel-lebanese-election-information', layout: 'right' },
      { slug: 'upstream-open-source-contributions', layout: 'figure' },
    ] as FeaturedEntry[],
  },

  compare: {
    before: 'Input',
    after: 'Upscaled ×3',
    hint: 'Drag the divider',
    alt: 'A low-resolution thermal street scene beside the same frame upscaled three times.',
  },

  lightField: {
    heading: { text: 'Every arrow is a tracker.', emphasis: 'tracker.' } as EmphText,
    body: 'The PID light tracker turns two servos toward the brightest reading from four light sensors. Each arrow here runs the same idea on one axis: a proportional term turns it toward your cursor and a derivative term damps the swing. Change the damping and watch the field settle.',
    presets: [
      { id: 'under', label: 'Underdamped', kp: 70, kd: 3 },
      { id: 'critical', label: 'Critical', kp: 70, kd: 16.7 },
      { id: 'over', label: 'Overdamped', kp: 70, kd: 42 },
    ],
    readouts: { error: 'Mean error', damping: 'Damping ratio', light: 'Light' },
    lightStates: { cursor: 'Cursor', orbit: 'Orbit' },
    simulated: 'Simulation',
    links: [
      { label: 'PID Light Tracker', href: '/v2/projects/pid-light-tracking-robot' },
      { label: 'easyPID', href: '/v2/projects/easypid-arduino-library' },
      {
        label: 'What a two-axis light tracker teaches',
        href: '/v2/writing/what-a-two-axis-light-tracker-teaches-about-pid-control',
      },
    ],
  },

  notes: {
    heading: { text: 'Field notes', emphasis: 'notes' } as EmphText,
    lede: 'The technical notes behind the entries: decisions, failures, and what was measured.',
    allAction: 'All field notes',
    shown: 8,
  },

  marquee: {
    tools: ['Python', 'C++', 'OpenCV', 'PyTorch', 'Arduino', 'ESP32', 'Jetson', 'FastAPI', 'Flutter', 'TypeScript', 'Next.js'],
    loop: ['sense', 'perceive', 'act'],
  },

  roles: {
    heading: { text: 'Rooms and roles', emphasis: 'roles' } as EmphText,
    lede: 'Where the work happened and what Rami did there. Only roles with a public source are listed.',
    columns: { period: 'Period', role: 'Role', org: 'Where', note: 'Note' },
    items: [
      {
        period: '2024 — now',
        role: 'Embedded Systems Engineer',
        org: 'Oreyeon',
        note: 'Embedded perception and real-time vision for runway-safety systems.',
        href: siteConfig.employer.url,
      },
      {
        period: '2026',
        role: 'Lead developer',
        org: 'Daleel, with Layth Ayache',
        note: 'Verifiable, multilingual election information for Lebanon.',
        href: '/v2/projects/daleel-lebanese-election-information',
      },
      {
        period: '2025',
        role: 'Speaker',
        org: 'GDG DevFest Tripoli',
        note: 'On fitting vision-language models on small hardware, with a live demo.',
        href: '/v2/writing/talks-workshops-and-teaching',
      },
      {
        period: '2025',
        role: 'Mechatronics engineering graduate',
        org: 'Rafik Hariri University',
        note: 'Named recipient of the Nazik Rafik Hariri Graduate Studies Award for 2025.',
        href: siteConfig.education.url,
      },
      {
        period: '2024 — 2025',
        role: 'Co-founder',
        org: 'NASNA',
        note: 'A crisis-response coordination platform connecting families with NGOs and volunteers.',
        href: '/v2/writing/building-technology-around-crisis-response-operations',
      },
      {
        period: '2023',
        role: 'Third place, Future Engineers',
        org: 'World Robot Olympiad, with Wassim Ghaddar',
        note: 'An autonomous car built from scratch in twenty days.',
        href: '/v2/projects/brainiacs-autonomous-race-car',
      },
    ] as RoleEntry[],
  },

  methods: {
    heading: { text: 'Index of methods', emphasis: 'methods' } as EmphText,
    lede: 'Every entry is filed under the methods it uses. Throw the tags around; they always settle back into the index.',
    states: { falling: 'Falling', resting: 'Resting', grid: 'Indexed' },
    dropAction: 'Drop them again',
  },

  signOff: {
    heading: { text: 'Let’s build something that has to work.', emphasis: 'work.' } as EmphText,
    body: `Based in ${siteConfig.location}. ${siteConfig.availability}.`,
    emailLabel: 'Email',
    signed: 'Signed',
    witness: 'Rami Kronbi, Beirut',
  },
}

export const v2Nav = [
  { label: 'Record', href: '/v2', icon: 'notebook' },
  { label: 'Projects', href: '/v2/projects', icon: 'projects' },
  { label: 'Writing', href: '/v2/writing', icon: 'writing' },
  { label: 'Topics', href: '/v2/topics', icon: 'topics' },
] as const

export const v2Chrome = {
  brand: 'Rami Kronbi',
  contact: 'Get in touch',
  themeToLight: 'Switch to light theme',
  themeToDark: 'Switch to dark theme',
  skip: 'Skip to content',
  preview: 'v2 preview',
  footer: {
    record: 'Record',
    elsewhere: 'Elsewhere',
    preview:
      'This is /v2, a design exploration of ramikronbi.com. It is not indexed; the live record stays canonical.',
    liveAction: 'Open the live page',
    top: 'Back to top',
    copyright: `© 2026 ${siteConfig.name} · ${siteConfig.location}`,
  },
  profiles: [
    { label: 'GitHub', href: siteConfig.socials.github },
    { label: 'LinkedIn', href: siteConfig.socials.linkedin },
    { label: 'Medium', href: siteConfig.socials.medium },
    { label: 'DEV', href: siteConfig.socials.devto },
    { label: 'Hashnode', href: siteConfig.socials.hashnode },
    { label: 'ResearchGate', href: siteConfig.socials.researchgate },
    { label: 'Arduino Libraries', href: siteConfig.socials.arduinolibraries },
  ],
}

/*
 * The preflight: a one-per-session intro that doubles as the loading screen.
 * The arm sequence waits on the real model download; the flight and its
 * readouts are a simulation, labelled as such.
 */
export const v2Intro = {
  disarmed: 'Disarmed',
  armed: 'Armed',
  mode: 'Angle mode',
  modeFlip: 'Acro · flip',
  preflight: 'Preflight check',
  sim: 'Simulated flight · E58 model',
  throttle: 'Throttle',
  roll: 'Roll',
  alt: 'Alt',
  lock: 'Lock · camera',
  cap: { key: 'Ch5', text: 'arm switch · motors spool' },
  skip: 'Skip intro',
}
