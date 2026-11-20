import type { Metadata } from 'next'
import { Suspense } from 'react'
import { preload } from 'react-dom'

import { SignOff } from '@/components/v2/home/sign-off'
import { INTRO_MODEL } from '@/components/v2/intro/timing'
import { JsonLd } from '@/components/v2/json-ld'
import { Build } from '@/components/vneo/build'
import { Community } from '@/components/vneo/community'
import { Experience } from '@/components/vneo/experience'
import { Glance } from '@/components/vneo/glance'
import { Hero } from '@/components/vneo/hero'
import { Loop } from '@/components/vneo/loop'
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
  // the E58 stands in the hero: ask for it first, ahead of everything below the fold
  preload(INTRO_MODEL, {
    as: 'fetch',
    crossOrigin: 'anonymous',
    fetchPriority: 'high',
  })
  const c = vneo
  return (
    <>
      <JsonLd data={[homeJsonLd]} />
      <Hero />
      <Glance items={c.glance} label="At a glance" />
      {/* each section hydrates as its own unit, so the hero's entrance keeps the main thread between them */}
      <Suspense>
        <Build />
      </Suspense>
      <Suspense>
        <Experience roles={experienceBoard()} now={nowYear()} />
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

      <Suspense>
        <Loop />
      </Suspense>

      <Near className="vn-signoff">
        <SignOff copy={c.signOff} warm />
      </Near>
    </>
  )
}
