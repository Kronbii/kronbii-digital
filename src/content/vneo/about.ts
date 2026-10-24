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
  lede: 'I’m a robotics, vision, and embedded systems engineer in Beirut. This is the record behind the projects: where I studied, where I work, where I teach, and what came of it.',
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
          href: 'https://www.rhu.edu.lb/media-room/news/rhu-commencement-2025-a-tribute-to-legacy-learning-and-new-beginnings',
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
          where: 'Oreyeon, Coimbra, Portugal (hybrid)',
          href: 'https://www.oreyeon.com/',
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
          note: 'Vision and machine-learning pipelines for clients.',
        },
        {
          when: '2024 – 2025',
          what: 'Landmine detection and extraction robot',
          where: 'RHU project, field-tested with the Lebanese Armed Forces',
          note: 'I led all the software: 2D then 3D LiDAR SLAM, navigation, detection and segmentation, and the arm’s kinematics.',
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
          href: writingHref('mentoring-two-healthcare-teams-at-injaz'),
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
          what: 'Bootcamp sessions and a Git workshop',
          note: 'Two sessions at the CodewithSerah bootcamp in January, “Git & GitHub” and “The Long Way into AI”, and a hands-on Git workshop I coordinated for the LAU Byblos Software Engineering Club in April, with material by Tarek AlSaleh.',
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
          what: 'Lead technical organizer and participant, NASA Space Apps Beirut',
          note: 'Technical bootcamps on NASA data and mentoring for 250–400 participants a year; teams I mentored reached the global top 10 six times. I competed too: our team won a Distinctive Team Award in 2021.',
          href: writingHref('what-four-years-of-technical-mentoring-taught-me'),
        },
        {
          when: '2024 – 2026',
          what: 'Co-founder and operations lead, NASNA',
          note: 'A crisis-support platform connecting displaced and war-affected people with donors, NGOs, sponsors, and volunteers; I led its crisis-response operations and volunteer matching.',
          href: writingHref('building-technology-around-crisis-response-operations'),
        },
        {
          when: '2025 – 2026',
          what: 'Co-founder, OmniSign',
          note: 'Real-time Lebanese Sign Language recognition, on phones and small devices.',
          href: workHref('omnisign-lebanese-sign-language', VN),
        },
        {
          when: '2025 – now',
          what: 'Co-founder, Bsheel',
          note: 'A real-world quest app, live on Google Play and the App Store; I built its AI proof checks.',
          href: workHref('bsheel-quest-app', VN),
        },
        {
          when: '2023 – 2025',
          what: 'Co-founder, Evoid',
          note: 'A small applied computer-vision venture that built apps for clients.',
          href: writingHref('what-a-small-vision-venture-taught-me-about-scope'),
        },
        {
          when: '2026',
          what: 'Space²',
          note: 'An emerging innovation space and incubator in Lebanon that helps university students build practical projects and grow local ideas into products. We run it together with Al Ghad Lana.',
          href: 'https://www.alghadlana.com',
        },
        {
          when: '2021 – 2024',
          what: 'Society lead, RHU Physics & Astronomy Club',
          note: 'I founded and led National Physics Day across four universities: UOB, LAU, AUB, and LU.',
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
          href: 'https://www.rhu.edu.lb/media-room/news/rhu-commencement-2025-a-tribute-to-legacy-learning-and-new-beginnings',
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
          what: 'Disaster Assistance and Response Engineering (DARE) at LAU',
          note: 'For the landmine detection and extraction robot, with the RHU Robotics and Technology Club team.',
          href: workHref('landmine-detection-extraction-robot', VN),
        },
        {
          when: '2024',
          what: 'CRDP honorary recognition',
          note: 'From CRDP Lebanon, for my contributions to NASA Space Apps.',
        },
        {
          when: '2023',
          what: 'World Robot Olympiad, Future Engineers',
          note: 'Second place with the Brainiacs, Wassim Ghaddar and me.',
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
