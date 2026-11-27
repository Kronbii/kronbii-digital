import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SignOff } from '@/components/v2/home/sign-off'
import { JsonLd } from '@/components/v2/json-ld'
import { Build } from '@/components/vneo/build'
import { Community } from '@/components/vneo/community'
import { ExperienceV3 } from '@/components/vneo/experience-v3'
import { Hero } from '@/components/vneo/hero'
import { Laps } from '@/components/vneo/machines'
import { Near } from '@/components/vneo/near'
import { pageMeta } from '@/components/vneo/meta'
import { Work } from '@/components/vneo/work'
import { experienceBoard, nowYear } from '@/content/vneo/experience-board'
import { vneo } from '@/content/vneo/site'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = pageMeta({
  path: '/',
  title: vneo.meta.title,
  description: vneo.meta.description,
})

/**
 * The home page as a WebPage about Rami, its primary image his portrait: the
 * picture search should show for the site, in the three shapes it asks for.
 */
const portrait = (shape: string, width: number, height: number) => ({
  '@type': 'ImageObject',
  url: `${siteConfig.url}/images/vneo/rami-kronbi-${shape}.jpg`,
  width,
  height,
  caption: 'Rami Kronbi',
})
const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${siteConfig.url}/#webpage`,
  url: siteConfig.url,
  name: vneo.meta.title,
  description: vneo.meta.description,
  isPartOf: { '@id': `${siteConfig.url}/#website` },
  about: { '@id': `${siteConfig.url}/#person` },
  primaryImageOfPage: portrait('1x1', 1200, 1200),
  image: [
    portrait('1x1', 1200, 1200),
    portrait('4x3', 1200, 900),
    portrait('16x9', 1600, 900),
  ],
}

export default function Vneo() {
  const c = vneo
  return (
    <>
      <JsonLd data={[homeJsonLd]} />
      <Hero />
      {/* each section hydrates as its own unit, so the hero's entrance keeps the main thread between them */}
      <Suspense>
        <Build />
      </Suspense>
      <Suspense>
        <ExperienceV3 roles={experienceBoard()} now={nowYear()} />
      </Suspense>
      <Suspense>
        <Work />
      </Suspense>
      <Suspense>
        <Laps />
      </Suspense>
      <Suspense>
        <Community />
      </Suspense>

      <Near className="vn-signoff">
        <SignOff copy={c.signOff} warm />
      </Near>
    </>
  )
}
