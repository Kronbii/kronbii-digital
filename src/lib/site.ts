export const siteConfig = {
  name: 'Rami Kronbi',
  shortName: 'Rami Kronbi',
  title: 'Rami Kronbi | Robotics, Embedded & Systems Engineer',
  description:
    'Rami Kronbi is a robotics, embedded & systems engineer in Beirut: robots, embedded control, and real-time computer vision, built for the people who use them.',
  url: 'https://ramikronbi.com',
  email: 'ramykronby@gmail.com',
  location: 'Beirut, Lebanon',
  availability: 'Open to research collaborations and engineering roles',
  socials: {
    github: 'https://github.com/Kronbii',
    linkedin: 'https://www.linkedin.com/in/rami-kronbi/',
    medium: 'https://medium.com/@ramikronbi',
    devto: 'https://dev.to/ramikronbi',
    hashnode: 'https://hashnode.com/@kronbii',
    researchgate: 'https://www.researchgate.net/profile/Rami-Kronbi',
    arduinolibraries: 'https://www.arduinolibraries.info/authors/kronbii',
  },
  employer: {
    name: 'Oreyeon',
    url: 'https://www.oreyeon.com/',
  },
  education: {
    name: 'Rafik Hariri University',
    url: 'https://www.rhu.edu.lb',
  },
} as const

export type SiteConfig = typeof siteConfig
