import { siteConfig } from '@/lib/site'

export function StructuredData() {
  const personId = `${siteConfig.url}/#person`
  const oreyeonId = 'https://www.oreyeon.com/#organization'

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': personId,
      name: 'Rami Kronbi',
      url: siteConfig.url,
      email: siteConfig.email,
      jobTitle: 'Embedded Systems & Vision Engineer',
      description:
        'Rami Kronbi is a robotics, embedded & systems engineer in Beirut, Lebanon. Since 2024 he has worked as Embedded Systems & Vision Engineer at Oreyeon, building real-time vision for airport runway safety on NVIDIA Jetson. He studied Mechatronics Engineering at Rafik Hariri University from 2021 to 2025 and graduated as class valedictorian. From 2021 to 2024 he led the technical organisation of NASA Space Apps Beirut. His work spans robotics, embedded control and computer vision, from an autonomous race car and a landmine detection and extraction robot to easyPID, an open-source PID library in the Arduino Library Manager, and OmniSign, real-time Lebanese Sign Language translation.',
      image: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/vneo/rami-kronbi-1x1.jpg`,
        width: 1200,
        height: 1200,
        caption: 'Rami Kronbi',
      },
      homeLocation: {
        '@type': 'Place',
        name: 'Beirut, Lebanon',
      },
      worksFor: {
        '@type': 'Organization',
        '@id': oreyeonId,
        name: 'Oreyeon',
        url: siteConfig.employer.url,
      },
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'Rafik Hariri University',
        url: siteConfig.education.url,
      },
      award: 'Nazik Rafik Hariri Graduate Studies Award, 2025',
      knowsAbout: [
        'Robotics',
        'Autonomous Systems',
        'Embedded Systems',
        'Embedded Perception',
        'Computer Vision',
        'Sensor Fusion',
        'Control Systems',
        'Real-Time Systems',
        'Edge Computing',
        'Machine Learning',
        'Mechatronics',
        'TensorRT',
        'PyTorch',
        'OpenCV',
        'Thermal Imaging',
        'Sign Language Recognition',
      ],
      sameAs: [
        siteConfig.socials.github,
        siteConfig.socials.linkedin,
        siteConfig.socials.medium,
        siteConfig.socials.devto,
        siteConfig.socials.hashnode,
        siteConfig.socials.researchgate,
        siteConfig.socials.arduinolibraries,
      ],
    },
  ]

  return (
    <>
      {schemas.map((schema) => (
        <script
          key={schema['@id']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
