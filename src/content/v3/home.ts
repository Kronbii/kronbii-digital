/**
 * Copy for the /v3 homepage. Written for someone skimming: every figure is a
 * verified-current fact from a ready authority record, said plainly, with
 * its source one click away. Nothing marked [VERIFY] in src/content/home.ts
 * is used.
 */

import { v2Home } from '@/content/v2/home'
import { siteConfig } from '@/lib/site'

import { noteHref, workHref } from './work'

const WRO = 'https://www.rhu.edu.lb/media-room/news/rhu-engineering-students-win-big-in-the-world-robotics-olympiad'

export const v3Home = {
  meta: {
    title: 'Rami Kronbi — Robotics and embedded-systems engineer (v3 preview)',
    description:
      'Rami Kronbi is a Lebanese robotics and embedded-systems engineer. He builds drones, robots, and the vision systems inside them, and software for clinics, voters, and learners.',
  },

  hero: {
    name: 'Rami Kronbi',
    claim: 'I build systems that sense the world and act on it.',
    hot: 'sense',
    now: {
      label: 'Now',
      text: 'Embedded Systems Engineer at Oreyeon, working on real-time vision for runway-safety systems.',
      href: siteConfig.employer.url,
    },
    where: siteConfig.location,
    work: 'See the work',
    hold: 'Press and hold anywhere to pull focus.',
    contact: 'Get in touch',
  },

  /** The four facts a skimmer should leave with, under the name. */
  creds: [
    { big: '2nd', label: 'WRO Lebanon 2023', note: 'Future Engineers', href: WRO },
    {
      big: 'Award',
      label: 'Nazik Rafik Hariri Graduate Studies Award',
      note: 'full master’s scholarship, 2025',
      href: siteConfig.education.url,
    },
    {
      big: 'Merged',
      label: 'into Betaflight',
      note: 'the firmware that flies FPV drones',
      href: workHref('upstream-open-source-contributions'),
    },
    {
      big: 'Speaker',
      label: 'GDG DevFest Tripoli 2025',
      note: 'AI on small hardware',
      href: noteHref('talks-workshops-and-teaching'),
    },
  ],

  thermal: {
    label: 'Thermal view',
    mode: 'Ironbow',
    target: 'Quadcopter',
    tracking: 'Tracking you',
    idle: 'Scanning',
    loading: 'Acquiring',
    note: 'Simulated heat on a model of the E58 pocket drone. Move your cursor; it turns to follow.',
    scaleCold: 'Cool',
    scaleHot: 'Hot',
    ariaLabel:
      'A model drone rendered as if through a thermal camera: its four motors glow hottest. It turns to face your cursor.',
    credit: v2Home.specimen.model,
  },

  build: {
    title: 'What I build',
    lead: 'I build',
    groups: [
      {
        id: 'machines',
        phrase: 'machines that move on their own',
        joiner: ',',
        slugs: [
          'brainiacs-autonomous-race-car',
          'posture-aware-classroom-desk',
          'upstream-open-source-contributions',
          'pid-light-tracking-robot',
        ],
      },
      {
        id: 'vision',
        phrase: 'cameras that understand what they see',
        joiner: ', and',
        slugs: [
          'thermal-super-resolution',
          'omnisign-lebanese-sign-language',
          '360-spherical-panorama-stitching',
          'imagen-raw-to-edit-dataset-pipeline',
        ],
      },
      {
        id: 'people',
        phrase: 'software and courses that people use',
        joiner: '.',
        slugs: [
          'bsheel-quest-app',
          'omnisign-lebanese-sign-language',
          'drone-control-bootcamp',
        ],
      },
    ],
    hint: 'Point at a phrase to see the work behind it.',
  },

  proof: {
    title: 'The short version',
    lede: 'What has been checked, counted, or awarded, in plain words. Each line links to its source.',
    rows: [
      {
        figure: '3rd',
        text: 'of 95+ teams at the World Robot Olympiad 2023, Future Engineers, with a self-driving car built from scratch in 20 days alongside Wassim Ghaddar.',
        source: 'Rafik Hariri University',
        href: WRO,
        image: {
          src: '/images/authority/race-car/team.jpeg',
          alt: 'Team Brainiacs standing with the vehicle at the WRO Future Engineers competition venue.',
        },
      },
      {
        figure: 'Full',
        text: 'master’s scholarship: the Nazik Rafik Hariri Graduate Studies Award for 2025, on graduating in mechatronics engineering from Rafik Hariri University.',
        source: 'Rafik Hariri University',
        href: siteConfig.education.url,
      },
      {
        figure: '~40',
        text: 'edited photos a day per person, where a team of three had managed 2–3 a day in all, after I built a pipeline that learned one photographer’s editing style for a French real-estate agency. Figures reported by the client.',
        source: 'Imagen',
        href: workHref('imagen-raw-to-edit-dataset-pipeline'),
      },
      {
        figure: '3',
        text: 'fixes merged by open-source maintainers: one into Betaflight, the firmware that flies FPV drones, and two into the OpenFront browser game.',
        source: 'Pull requests',
        href: workHref('upstream-open-source-contributions'),
      },
      {
        figure: '~45',
        text: 'thermal frames a second, sharpened by a model small enough to run on an NVIDIA Jetson beside the camera.',
        source: 'Thermal super-resolution',
        href: workHref('thermal-super-resolution'),
        image: {
          src: '/images/authority/thermal-super-resolution/thermal-plate.webp',
          alt: 'A low-resolution thermal street scene beside the same frame upscaled three times.',
        },
      },
      {
        figure: 'Talk',
        text: 'at GDG DevFest Tripoli 2025: “On-Device Multimodal Assistants: Can We Fit GPT-Vision on Small Hardware?”, with a live demo.',
        source: 'Talks and teaching',
        href: noteHref('talks-workshops-and-teaching'),
      },
      {
        when: '2025',
        what: 'Public Choice prize with OmniSign',
        note: 'First prize by public vote at the National FYP Demo Day, for real-time Lebanese Sign Language recognition.',
        href: workHref('omnisign-lebanese-sign-language'),
      },
      {
        when: '2026',
        what: 'Mentored two award-winning INJAZ teams',
        note: 'Healthcare startups taken from idea to working prototype: Best Community Impact and Best Healthcare Innovation.',
        href: noteHref('mentoring-two-healthcare-teams-at-injaz'),
      },
    ],
  },

  work: {
    title: 'Selected work',
    lede: (total: number) =>
      `Seven of ${total} projects. Each says what it does, what I did, and the one fact you can check.`,
    all: 'All projects',
    read: 'Read the story',
    tiles: [
      { slug: 'brainiacs-autonomous-race-car', size: 'hero' },
      { slug: 'thermal-super-resolution', size: 'wide' },
      { slug: 'posture-aware-classroom-desk', size: 'small' },
      { slug: 'daleel-lebanese-election-information', size: 'small' },
      { slug: '360-spherical-panorama-stitching', size: 'band' },
      {
        slug: 'imagen-raw-to-edit-dataset-pipeline',
        size: 'half',
        figure: { from: '2–3', fromNote: 'a day, team of three', to: '~40', toNote: 'a day, per person' },
      },
      {
        slug: 'upstream-open-source-contributions',
        size: 'half',
        merges: ['betaflight #15706', 'openfront #4868', 'openfront #4985'],
      },
    ] as WorkTile[],
  },

  /** v2's tracker field, with links into /v3. */
  lightField: {
    ...v2Home.lightField,
    links: [
      { label: 'PID Light Tracker', href: workHref('pid-light-tracking-robot') },
      { label: 'easyPID', href: workHref('easypid-arduino-library') },
      {
        label: 'What a two-axis light tracker teaches',
        href: noteHref('what-a-two-axis-light-tracker-teaches-about-pid-control'),
      },
    ],
  },

  log: {
    title: 'Flight log',
    lede: 'The path so far, one waypoint at a time.',
    points: [
      {
        when: '2023',
        what: 'Second place at WRO Lebanon',
        note: 'Future Engineers, with Wassim Ghaddar: a self-driving car in twenty days.',
        href: workHref('brainiacs-autonomous-race-car'),
      },
      {
        when: '2023',
        what: 'Co-founded Evoid',
        note: 'A small applied computer-vision venture in Beirut, as systems engineer and product manager.',
        href: noteHref('what-a-small-vision-venture-taught-me-about-scope'),
      },
      {
        when: '2024',
        what: 'Joined Oreyeon',
        note: 'Embedded Systems & Vision Engineer: real-time vision for runway-safety systems.',
        href: siteConfig.employer.url,
      },
      {
        when: '2024',
        what: 'Co-founded NASNA',
        note: 'A crisis-response platform connecting families with NGOs and volunteers.',
        href: noteHref('building-technology-around-crisis-response-operations'),
      },
      {
        when: '2024',
        what: 'Built a mine-detection robot',
        note: 'Software lead: 2D then 3D LiDAR SLAM, Nav2, detection; field-tested with the Lebanese Armed Forces.',
        href: workHref('landmine-detection-extraction-robot'),
      },
      {
        when: '2025',
        what: 'Graduated, with a full master’s scholarship',
        note: 'Mechatronics engineering, Rafik Hariri University; the Nazik Rafik Hariri Graduate Studies Award.',
        href: siteConfig.education.url,
      },
      {
        when: '2025',
        what: 'Spoke at GDG DevFest Tripoli',
        note: 'Fitting vision-language models onto small hardware, with a live demo.',
        href: noteHref('talks-workshops-and-teaching'),
      },

      {
        when: '2026',
        what: 'A fix merged into Betaflight',
        note: 'Drone flight-controller firmware, merged by its maintainers in September.',
        href: workHref('upstream-open-source-contributions'),
      },
    ],
  },

  notes: {
    title: 'Writing',
    lede: 'How the work was done: the decisions, the failures, and what was measured.',
    all: 'All writing',
    slugs: [
      'building-an-autonomous-race-car-in-twenty-days',
      'what-small-upstream-fixes-teach-about-firmware',
      'designing-election-information-for-verifiability',
    ],
  },

  signOff: {
    ...v2Home.signOff,
  },
}

export interface WorkTile {
  slug: string
  size: 'hero' | 'wide' | 'small' | 'band' | 'half'
  figure?: { from: string; fromNote: string; to: string; toNote: string }
  merges?: string[]
}

export const v3Nav = [
  { label: 'Work', href: '/v3#work' },
  { label: 'Proof', href: '/v3#proof' },
  { label: 'Path', href: '/v3#log' },
  { label: 'Projects', href: '/v3/projects' },
] as const

export const v3Chrome = {
  brand: 'Rami Kronbi',
  contact: 'Get in touch',
  themeToLight: 'Switch to light theme',
  themeToDark: 'Switch to dark theme',
  skip: 'Skip to content',
  preview: 'v3 preview',
  menu: 'Menu',
  close: 'Close',
  footer: {
    note: 'This is /v3, a design exploration of ramikronbi.com. It is not indexed; the live site stays canonical.',
    live: 'Open the live site',
    top: 'Back to top',
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
