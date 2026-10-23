/** The record beyond the projects: study, work, teaching, community, awards, certificates. In my words, from my CV. */

import { writingHref, workHref, VN } from './site'

export interface AboutEntry {
  when: string
  what: string
  where?: string
  note?: string
  href?: string
}

export interface AboutSection {
  id: string
  title: string
  entries: AboutEntry[]
}

export const about: {
  title: string
  description: string
  lede: string
  sections: AboutSection[]
} = {
  title: 'About',
  description:
    'Rami Kronbi’s record beyond the projects: a mechatronics degree from RHU, embedded and vision engineering at Oreyeon, teaching and mentoring, community work, awards, and certificates.',
  lede: 'I’m a robotics, embedded, and systems engineer in Beirut. This is the record behind the projects: where I studied, where I work, where I teach, and what came of it.',
  sections: [
    {
      id: 'education',
      title: 'Education',
      entries: [
        {
          when: '2021 – 2025',
          what: 'Bachelor of Mechatronics Engineering',
          where: 'Rafik Hariri University (RHU), Lebanon',
          note: 'CGPA 4.0/4.0, class valedictorian.',
        },
      ],
    },
    {
      id: 'work',
      title: 'Work',
      entries: [
        {
          when: '2024 – now',
          what: 'Embedded Systems & Vision Engineer',
          where: 'Oreyeon, Coimbra (hybrid)',
          note: 'Real-time vision for airport runway safety, on NVIDIA Jetson.',
        },
        {
          when: '2022 – 2025',
          what: 'Lab assistant and teaching assistant',
          where: 'Rafik Hariri University',
          note: 'I prepared and ran mechatronics lab sessions, guided students through the experiments, helped with teaching and assessment, and kept the lab’s equipment working.',
        },
        {
          when: '2025 – 2026',
          what: 'Freelance machine-learning and computer-vision developer',
          note: 'Pipelines for clients, such as a RAW-to-edit photo dataset for a real-estate photography agency.',
          href: writingHref('why-color-science-comes-before-the-model'),
        },
        {
          when: '2024 – 2025',
          what: 'Landmine detection and extraction robot',
          where: 'Lebanese Army initiative',
          note: 'The ROS 2 autonomy stack for a mine-detection rover with a 6-DoF arm, field-tested with the Lebanese Armed Forces.',
          href: workHref('landmine-detection-extraction-robot', VN),
        },
      ],
    },
    {
      id: 'teaching',
      title: 'Teaching and mentoring',
      entries: [
        {
          when: '2026',
          what: 'Technical mentor, INJAZ Al-Arab Company Program',
          note: 'I mentored two healthcare teams from first idea to working prototype: a melanoma-detection device, and an elderly-care set of a wearable bracelet, a pillbox, and an app. Both teams won awards: Best Community Impact and Best Healthcare Innovation.',
        },
        {
          when: '2022 – 2025',
          what: 'Robotics competitions at RHU',
          note: 'I organized the university’s robotics competitions, including IEEE Micromouse, and mentored teams for the World Robot Olympiad and other competitions.',
        },
        {
          when: 'Dec 2025',
          what: 'Speaker, GDG DevFest Tripoli 2025',
          where: 'GDG North Lebanon',
          note: 'On-device multimodal assistants: can GPT-Vision fit on small hardware?',
          href: writingHref('talks-workshops-and-teaching'),
        },
        {
          when: '2026',
          what: 'Git and GitHub workshops',
          note: 'At the CodewithSerah bootcamp (January) and the LAU Byblos Software Engineering Club (April).',
          href: writingHref('talks-workshops-and-teaching'),
        },
      ],
    },
    {
      id: 'community',
      title: 'Community',
      entries: [
        {
          when: '2021 – 2024',
          what: 'Lead technical organizer, NASA Space Apps Beirut',
          note: 'Technical bootcamps on NASA data and mentoring for 250–400 participants a year; teams I mentored reached the global top 10 six times.',
          href: writingHref('what-four-years-of-technical-mentoring-taught-me'),
        },
        {
          when: '2024 – 2026',
          what: 'Co-founder, NASNA',
          note: 'A crisis-support platform connecting displaced and war-affected people with donors, NGOs, sponsors, and volunteers.',
          href: writingHref('building-technology-around-crisis-response-operations'),
        },
        {
          when: '2025 – 2026',
          what: 'Co-founder, OmniSign',
          note: 'Real-time Lebanese Sign Language translation.',
          href: workHref('omnisign-lebanese-sign-language', VN),
        },
        {
          when: '2026',
          what: 'Space²',
          note: 'An emerging innovation space and incubator in Lebanon that helps university students build practical projects and grow local ideas into products. I’m shaping its technology direction and project portfolio.',
        },
        {
          when: '2021 – 2024',
          what: 'Society lead, Physics & Astronomy Club',
          note: 'I founded and led National Physics Day across four universities.',
          href: writingHref('turning-physics-outreach-into-a-multi-university-program'),
        },
      ],
    },
    {
      id: 'awards',
      title: 'Awards',
      entries: [
        {
          when: '2025',
          what: 'Nazik Rafik Hariri Graduate Studies Award',
          note: 'Graduated valedictorian with a 4.0/4.0 CGPA and a 100% master’s scholarship.',
        },
        {
          when: '2025',
          what: 'Best Graduating Project, RHU Engineering Jury',
          href: workHref('posture-aware-classroom-desk', VN),
        },
        {
          when: '2025',
          what: 'Public Choice first prize, National FYP Demo Day',
          note: 'With the OmniSign team.',
          href: workHref('omnisign-lebanese-sign-language', VN),
        },
        {
          when: '2024',
          what: 'Disaster Management and Response Engineering (DARE @ LAU), 2nd place',
        },
        {
          when: '2024',
          what: 'CRDP honorary recognition',
        },
        {
          when: '2023',
          what: 'World Robot Olympiad, Future Engineers',
          note: 'Third place with the Brainiacs, later re-ranked to second.',
          href: workHref('brainiacs-autonomous-race-car', VN),
        },
        {
          when: '2021',
          what: 'NASA Space Apps Lebanon, Distinctive Team Award',
        },
      ],
    },
    {
      id: 'certificates',
      title: 'Certificates',
      entries: [
        { when: '2026', what: 'Google Project Management Certificate', where: 'Google' },
        { when: '2026', what: 'AI Full Stack Development Expert', where: 'Forward MENA & OnRamp' },
        { when: '2026', what: 'AI-Powered Full-Stack Development', where: 'Forward MENA' },
        { when: '2023', what: 'Python for Everybody', where: 'Coursera' },
        {
          when: '2025 – 2026',
          what: 'Short courses in cloud and teamwork',
          note: 'Cloud foundations on AWS, Azure, and Google Cloud, with cloud networking, security, and storage; and communication, negotiation, conflict, critical thinking, emotional intelligence, resilience, time management, business ethics, and writing in plain language.',
        },
      ],
    },
  ],
}
