import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { preload } from 'react-dom'

import { SignOff } from '@/components/v2/home/sign-off'
import { INTRO_MODEL } from '@/components/v2/intro/timing'
import { JsonLd } from '@/components/v2/json-ld'
import { FlightLog } from '@/components/v3/home/flight-log'
import { Build } from '@/components/vneo/build'
import { Community } from '@/components/vneo/community'
import { Glance } from '@/components/vneo/glance'
import { Hero } from '@/components/vneo/hero'
import { Loop } from '@/components/vneo/loop'
import { Near } from '@/components/vneo/near'
import { Slate, SlateMark } from '@/components/vneo/slate'
import { pageMeta } from '@/components/vneo/meta'
import { Work } from '@/components/vneo/work'
import { VN, moreGroups, vneo } from '@/content/vneo/site'
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
  // the E58 flies in the intro and stands in the hero: ask for it first, ahead of everything below the fold
  preload(INTRO_MODEL, {
    as: 'fetch',
    crossOrigin: 'anonymous',
    fetchPriority: 'high',
  })
  const c = vneo
  const groups = moreGroups()
  const n = groups.reduce((k, g) => k + g.items.length, 0)
  return (
    <>
      <JsonLd data={[homeJsonLd]} />
      <Hero />
      <Glance items={c.glance} label="At a glance" />
      {/* each section hydrates as its own unit, so the intro keeps the main thread between them */}
      <Suspense>
        <Build />
      </Suspense>
      <Suspense>
        <div className="vn-log vn-v3">
          <SlateMark no={3} label={c.log.label} />
          <FlightLog
            title={c.log.title}
            lede={c.log.lede}
            points={c.log.points}
          />
        </div>
      </Suspense>
      <Suspense>
        <Work />
      </Suspense>
      <Suspense>
        <Community />
      </Suspense>

      <section id="more" className="vn-more" aria-labelledby="more-h">
        <Slate
          no={6}
          label={c.more.label}
          title={c.more.title}
          hot={c.more.hot}
          lede={`${n} more projects.`}
          id="more-h"
        />
        <div className="v7-groups">
          {groups.map((g) => (
            <div key={g.label} className="v7-group">
              <h3>{g.label}</h3>
              <ul>
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link href={it.href}>
                      <b>{it.title}</b>
                      <span>{it.line}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="v7-more-all">
          <Link className="v7-go" href={`${VN}/projects`}>
            {c.more.all} →
          </Link>
        </p>
      </section>

      <Suspense>
        <Loop />
      </Suspense>

      <Near className="vn-signoff">
        <SignOff copy={c.signOff} warm />
      </Near>
    </>
  )
}
