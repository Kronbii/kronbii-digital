/**
 * My experience as a flight-strip board: every role I have held, from the
 * jobs and research to the ventures, teaching and community work. The words
 * come from my CV, as the About page already says them.
 *
 * Each role is a strip. `lead` roles are where I work now and get the big
 * strips; the rest are logged under them. A `review` role renders only in
 * development (or a preview built with AUTHORITY_INCLUDE_REVIEW=1) until its
 * details are settled; `keep: false` takes a role off the board without
 * losing its record.
 */

import type { PublicationState } from '@/content/authority/types'

export type RoleKind =
  | 'work'
  | 'research'
  | 'venture'
  | 'teaching'
  | 'community'
  | 'study'

export const kindLabel: Record<RoleKind, string> = {
  work: 'Work',
  research: 'Research',
  venture: 'Venture',
  teaching: 'Teaching',
  community: 'Community',
  study: 'Study',
}

export interface Role {
  /** stable key, for the picker */
  id: string
  /** three letters, the strip's callsign */
  call: string
  org: string
  /** the organization's full name, when the short one needs it */
  orgLong?: string
  role: string
  /** other titles for the same role, to choose between (the picker offers them) */
  roles?: string[]
  kind: RoleKind
  /** in decimal years; unset while the start is not settled */
  from?: number
  /** a decimal year, or still going */
  to: number | 'now'
  /** the dates as printed */
  when: string
  where?: string
  /** one line, the strip's pencil note */
  note: string
  /** more, for the open strip */
  more?: string
  /** people and organizations it was done with */
  with?: string[]
  /** project slugs (only ready ones are shown) */
  projects?: string[]
  /** article slugs (only ready ones are shown) */
  writing?: string[]
  href?: string
  /** where I work now: a big strip */
  lead?: boolean
  state: PublicationState
  /** on the board; false keeps the record but takes it off */
  keep?: boolean
  /** what still has to be settled before it goes public (development only) */
  open?: string
}

export const experience = {
  no: 3,
  label: 'Experience',
  title: 'Flight log.',
  hot: 'log',
  lede: 'Where I work now, and everything I flew to get here.',
  now: 'Now',
  bays: {
    lead: 'Where I work now',
    rest: 'Before, and alongside',
  },
  chart: {
    label: 'Every role on a timeline, from the year it started to the year it ended',
    now: 'Now',
  },
  strip: {
    open: 'More',
    close: 'Less',
    with: 'With',
    projects: 'From this role',
    writing: 'Written about it',
    site: 'Visit',
    since: 'Since',
  },
}

export const roles: Role[] = [
  {
    id: 'oreyeon',
    call: 'ORY',
    org: 'Oreyeon',
    role: 'Embedded Systems & Vision Engineer',
    kind: 'work',
    from: 2024.6,
    to: 'now',
    when: '2024 – now',
    where: 'Coimbra, Portugal (hybrid)',
    note: 'Real-time vision for airport runway safety, on NVIDIA Jetson.',
    href: 'https://www.oreyeon.com/',
    lead: true,
    state: 'ready',
  },
  {
    id: 'cnrs-l',
    call: 'CNR',
    org: 'CNRS-L',
    orgLong: 'National Council for Scientific Research, Lebanon',
    role: 'Research and development engineer',
    kind: 'research',
    to: 'now',
    when: 'Now',
    where: 'Lebanon',
    note: 'Research and development at Lebanon’s national council for scientific research, the public body behind the country’s national research centers.',
    href: 'https://www.cnrs.edu.lb/',
    lead: true,
    state: 'ready',
    open: 'Start date, and a line on what I work on',
  },
  {
    id: 'chronos',
    call: 'CHR',
    org: 'Chronos',
    role: 'Engineer',
    kind: 'work',
    to: 'now',
    when: 'Now',
    where: 'Lebanon',
    note: 'An engineering space and incubator for Lebanese startups that take on the country’s real problems.',
    more: 'We fund startups, work beside their founders as engineers, and help them grow working products out of their ideas: products built for Lebanon as it really is, not as we wish it were.',
    lead: true,
    state: 'ready',
    open: 'Start date',
  },
  {
    id: 'freelance',
    call: 'FRL',
    org: 'Freelance',
    role: 'Machine-learning and computer-vision developer',
    kind: 'work',
    from: 2025,
    to: 'now',
    when: '2025 – now',
    note: 'Vision and machine-learning pipelines for clients.',
    state: 'ready',
  },
  {
    id: 'bsheel',
    call: 'BSH',
    org: 'Bsheel',
    role: 'Co-founder',
    kind: 'venture',
    from: 2025,
    to: 'now',
    when: '2025 – now',
    note: 'A real-world quest app, live on Google Play and the App Store; I built its AI proof checks.',
    with: ['Razan Hasbini', 'Tayseer Laz'],
    projects: ['bsheel-quest-app'],
    state: 'ready',
  },
  {
    id: 'space2',
    call: 'SP2',
    org: 'Space²',
    role: 'Co-organizer',
    kind: 'community',
    from: 2026,
    to: 'now',
    when: '2026 – now',
    note: 'An innovation space and incubator that helps university students build practical projects and grow local ideas into products.',
    with: ['Al Ghad Lana'],
    href: 'https://www.alghadlana.com',
    state: 'review',
    open: 'Is this the same place as Chronos? My title, and whether it is still running',
  },
  {
    id: 'injaz',
    call: 'INJ',
    org: 'INJAZ Al-Arab',
    role: 'Technical mentor, Company Program',
    kind: 'teaching',
    from: 2026,
    to: 2026.4,
    when: '2026',
    note: 'Took two school healthcare teams from first idea to award-winning prototypes.',
    more: 'LumiScan (Ahliah School), a melanoma-detection device, and Dosely (Saint Joseph School), an elderly-care set of a wearable bracelet, a pillbox, and an app. Both teams won awards: Best Community Impact and Best Healthcare Innovation.',
    writing: ['mentoring-two-healthcare-teams-at-injaz'],
    state: 'ready',
  },
  {
    id: 'bootcamps',
    call: 'CWS',
    org: 'CodewithSerah and LAU Byblos',
    role: 'Bootcamp sessions and a Git workshop',
    kind: 'teaching',
    from: 2026.05,
    to: 2026.3,
    when: '2026',
    note: '“Git & GitHub” and “The Long Way into AI” at the CodewithSerah bootcamp, then a hands-on Git workshop for the LAU Byblos Software Engineering Club.',
    with: ['Tarek AlSaleh, who wrote the workshop material'],
    writing: ['talks-workshops-and-teaching'],
    state: 'ready',
  },
  {
    id: 'devfest',
    call: 'GDG',
    org: 'GDG DevFest Tripoli',
    role: 'Speaker',
    kind: 'teaching',
    from: 2025.93,
    to: 2025.93,
    when: 'Dec 2025',
    where: 'GDG North Lebanon',
    note: 'On-device multimodal assistants: can GPT-Vision fit on small hardware?',
    writing: ['talks-workshops-and-teaching'],
    state: 'ready',
  },
  {
    id: 'nasna',
    call: 'NSN',
    org: 'NASNA',
    role: 'Co-founder and operations lead',
    kind: 'venture',
    from: 2024.75,
    to: 2026.4,
    when: '2024 – 2026',
    note: 'A crisis-response platform connecting displaced families with NGOs, donors, and volunteers.',
    more: 'A crisis-support platform for displaced and war-affected people, with donors, NGOs, sponsors, and volunteers; I led its crisis-response operations and volunteer matching.',
    writing: ['building-technology-around-crisis-response-operations'],
    href: 'https://nasna.world',
    state: 'ready',
  },
  {
    id: 'omnisign',
    call: 'OMS',
    org: 'OmniSign',
    role: 'Co-founder',
    kind: 'venture',
    from: 2025,
    to: 2026.4,
    when: '2025 – 2026',
    note: 'Real-time Lebanese Sign Language recognition, on phones and small devices.',
    projects: ['omnisign-lebanese-sign-language'],
    state: 'ready',
  },
  {
    id: 'landmine',
    call: 'LMR',
    org: 'Rafik Hariri University',
    role: 'Software lead, landmine detection and extraction robot',
    kind: 'research',
    from: 2024,
    to: 2025.5,
    when: '2024 – 2025',
    where: 'Field-tested with the Lebanese Armed Forces',
    note: 'I led all the software: 2D then 3D LiDAR SLAM, navigation, detection and segmentation, and the arm’s kinematics.',
    projects: ['landmine-detection-extraction-robot'],
    state: 'ready',
  },
  {
    id: 'evoid',
    call: 'EVD',
    org: 'Evoid',
    role: 'Co-founder',
    kind: 'venture',
    from: 2023,
    to: 2025.9,
    when: '2023 – 2025',
    note: 'Systems engineer and product manager at a small applied computer-vision venture in Beirut.',
    writing: ['what-a-small-vision-venture-taught-me-about-scope'],
    href: 'https://evoid.dev',
    state: 'ready',
  },
  {
    id: 'rhu-lab',
    call: 'RHU',
    org: 'Rafik Hariri University',
    role: 'Lab assistant and teaching assistant',
    kind: 'teaching',
    from: 2022,
    to: 2025.5,
    when: '2022 – 2025',
    note: 'Ran mechatronics lab sessions and kept the lab’s equipment working.',
    more: 'I prepared and ran mechatronics lab sessions, guided students through the experiments, and helped with teaching and assessment.',
    state: 'ready',
  },
  {
    id: 'rhu-robotics',
    call: 'MMS',
    org: 'Rafik Hariri University',
    role: 'Organizer, robotics competitions',
    kind: 'teaching',
    from: 2022,
    to: 2025.5,
    when: '2022 – 2025',
    note: 'Organized the university’s robotics competitions, including Lebanon’s first IEEE Micromouse.',
    more: 'IEEE Micromouse 2023–2024 was the first in Lebanon, held at RHU in May 2024, where I mentored a number of the teams. I also mentored teams for the World Robot Olympiad and other competitions.',
    href: 'https://www.rhu.edu.lb/media-room/news/rafik-hariri-university-is-set-to-make-history-by-hosting-lebanons-first-ever-micromouse-competition',
    state: 'ready',
  },
  {
    id: 'vibe',
    call: 'VBE',
    org: 'VIBE',
    role: 'Computer-vision intern',
    kind: 'work',
    from: 2022,
    to: 2023.9,
    when: '2022 – 2023',
    note: 'At a startup, I built emotion recognition on edge hardware to support children with autism.',
    projects: ['emotion-recognition-autism-support'],
    state: 'ready',
  },
  {
    id: 'space-apps',
    call: 'SAB',
    org: 'NASA Space Apps Beirut',
    role: 'Lead technical organizer and mentor',
    kind: 'community',
    from: 2021.75,
    to: 2024.85,
    when: '2021 – 2024',
    note: 'Technical bootcamps on NASA data and mentoring, for 250–400 participants a year.',
    more: 'Teams I mentored reached the global top 10 six times. I competed too: our team won a Distinctive Team Award in 2021. Space Apps Beirut gave me its Exceptional Volunteering Certification in 2024.',
    writing: ['what-four-years-of-technical-mentoring-taught-me'],
    state: 'ready',
  },
  {
    id: 'physics',
    call: 'PHY',
    org: 'RHU Physics & Astronomy Club',
    role: 'Society lead',
    kind: 'community',
    from: 2021.75,
    to: 2024.5,
    when: '2021 – 2024',
    note: 'Founded and led National Physics Day across four universities: UOB, LAU, AUB, and LU.',
    writing: ['turning-physics-outreach-into-a-multi-university-program'],
    state: 'ready',
  },
  {
    id: 'rhu-degree',
    call: 'BEN',
    org: 'Rafik Hariri University',
    role: 'Bachelor of Mechatronics Engineering',
    kind: 'study',
    from: 2021.6,
    to: 2025.45,
    when: '2021 – 2025',
    note: 'CGPA 4.0/4.0, class valedictorian, and a full scholarship for my master’s.',
    projects: [
      'posture-aware-classroom-desk',
      'brainiacs-autonomous-race-car',
    ],
    href: 'https://www.rhu.edu.lb/media-room/news/rhu-commencement-2025-a-tribute-to-legacy-learning-and-new-beginnings',
    state: 'ready',
  },
]
