import type { TopicRecord } from './types'

export const topics: TopicRecord[] = [
  {
    slug: 'computer-vision',
    title: 'Computer vision',
    metaTitle: 'Computer vision — Rami Kronbi',
    metaDescription:
      'Systems Rami Kronbi has built that extract useful structure from images or video, from 360° panorama stitching to thermal super-resolution and autonomous perception.',
    definition:
      'Engineering systems that extract useful structure from images or video.',
    questions: [
      'What computer-vision systems has Rami Kronbi built?',
      'Which of them run in real time or on edge hardware?',
      'Which projects expose reusable open-source code?',
    ],
  },
  {
    slug: 'robotics-perception',
    title: 'Robotics and perception',
    metaTitle: 'Robotics and perception — Rami Kronbi',
    metaDescription:
      'Where Rami Kronbi has connected sensing and estimation to physical systems that must act under timing and hardware constraints.',
    definition:
      'Connecting sensing and estimation to a physical system that must act under timing and hardware constraints.',
    questions: [
      'Which projects fuse perception with real actuation?',
      'How does perception timing interact with control cadence?',
      'What has Rami Kronbi actually deployed near a sensor?',
    ],
  },
  {
    slug: 'embedded-systems',
    title: 'Embedded systems',
    metaTitle: 'Embedded systems — Rami Kronbi',
    metaDescription:
      'Software and control designed around real devices, bounded compute, sensors, timing, and actuators — with reusable libraries where possible.',
    definition:
      'Software and control designed around real devices, bounded compute, sensors, timing, and actuators.',
    questions: [
      'Which embedded control systems has Rami Kronbi built?',
      'Where does reusable open-source code live?',
      'How are timing and saturation treated as first-class concerns?',
    ],
  },
  {
    slug: 'control-systems',
    title: 'Control systems',
    metaTitle: 'Control systems — Rami Kronbi',
    metaDescription:
      'Measuring error and driving physical behavior predictably despite noise, delay, saturation, and imperfect mechanics.',
    definition:
      'Measuring error and driving physical behavior predictably despite noise, delay, saturation, and imperfect mechanics.',
    questions: [
      'Where has PID control been applied end to end?',
      'How is saturation handled in practice?',
      'Which projects expose per-term controller state for tuning?',
    ],
  },
  {
    slug: 'edge-ai',
    title: 'Edge AI',
    metaTitle: 'Edge AI — Rami Kronbi',
    metaDescription:
      'Running machine-learning inference near the sensor, where latency, power, memory, and reliability constrain the model.',
    definition:
      'Running machine-learning inference near the sensor, where latency, power, memory, and reliability constrain the model.',
    questions: [
      'Which models has Rami Kronbi deployed on Jetson-class hardware?',
      'What speed and quality figures are attached to which hardware?',
      'How is “real time” bounded by hardware and input size?',
    ],
  },
  {
    slug: 'open-source-engineering',
    title: 'Open-source engineering',
    metaTitle: 'Open-source engineering — Rami Kronbi',
    metaDescription:
      'Software whose implementation, usage, limits, and contribution paths are publicly inspectable.',
    definition:
      'Software whose implementation, usage, limits, and contribution path are publicly inspectable.',
    questions: [
      'Which of Rami Kronbi’s libraries and packages are public?',
      'Where are the tests, documentation, and CLI contracts?',
      'What are the stated limits of each release?',
    ],
  },
  {
    slug: 'applied-ai',
    title: 'Applied AI',
    metaTitle: 'Applied AI — Rami Kronbi',
    metaDescription:
      'Model-driven software embedded in a defined workflow with review, safety, and operational constraints.',
    definition:
      'Model-driven software embedded in a defined workflow with review, safety, and operational constraints.',
    questions: [
      'Where do models sit inside a larger workflow?',
      'How is deterministic policy separated from model output?',
      'What safety boundaries are explicit in each project?',
    ],
  },
  {
    slug: 'civic-technology',
    title: 'Civic technology',
    metaTitle: 'Civic technology — Rami Kronbi',
    metaDescription:
      'Public-interest software designed around access, accountability, and institutions.',
    definition:
      'Public-interest software designed around access, accountability, and institutions.',
    questions: [
      'Which civic tools has Rami Kronbi built?',
      'How is provenance treated as a product feature?',
      'Where does each project draw its own limits?',
    ],
  },
  {
    slug: 'teaching-and-community',
    title: 'Teaching and community',
    metaTitle: 'Teaching and community — Rami Kronbi',
    metaDescription:
      'Where Rami Kronbi teaches, mentors and organizes: INJAZ, NASA Space Apps Beirut, NASNA, National Physics Day, talks and workshops.',
    definition:
      'Mentoring, teaching, and organizing: the work done with people rather than for them.',
    questions: [
      'Who has Rami Kronbi mentored?',
      'Which communities and events has he organized?',
      'Where has he spoken or taught?',
    ],
  },
  {
    slug: 'local-first-software',
    title: 'Local-first software',
    metaTitle: 'Local-first software — Rami Kronbi',
    metaDescription:
      'Applications that keep their primary workflow and data usable on the user’s machine rather than depending on a remote service.',
    definition:
      'Applications that keep their primary workflow and data usable on the user’s machine rather than depending on a remote service.',
    questions: [
      'What does local-first mean in each project?',
      'How is backup and export handled?',
      'Where do model providers stay under the user’s control?',
    ],
  },
]

export const topicMap = Object.fromEntries(topics.map((t) => [t.slug, t]))

export function getTopic(slug: string): typeof topics[number] | undefined {
  return topicMap[slug]
}
