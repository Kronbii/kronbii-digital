import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/v2/json-ld'
import { liveCrumbs } from '@/components/v2/schema'
import { BackButton } from '@/components/vneo/back'
import { pageMeta } from '@/components/vneo/meta'
import { about, type AboutEntry } from '@/content/vneo/about'
import { HOME } from '@/content/vneo/site'
import { siteConfig } from '@/lib/site'

export const metadata: Metadata = pageMeta({
  path: '/about',
  title: 'About — Rami Kronbi',
  description: about.description,
})

const PERSON = `${siteConfig.url}/#person`
const RHU = {
  '@type': 'EducationalOrganization',
  name: siteConfig.education.name,
  url: siteConfig.education.url,
}
const section = (id: string) =>
  about.sections.find((s) => s.id === id)?.entries ?? []
/** "2023", "2025 – 2026": the year it starts. */
const year = (e: AboutEntry) => e.when.match(/\d{4}/)?.[0]

/** The page is Rami's profile: the site's Person, with the record this page lists. */
const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${siteConfig.url}/about#page`,
  url: `${siteConfig.url}/about`,
  name: `${about.title} — ${siteConfig.name}`,
  description: about.description,
  isPartOf: { '@id': `${siteConfig.url}/#website` },
  mainEntity: {
    '@type': 'Person',
    '@id': PERSON,
    name: siteConfig.name,
    url: siteConfig.url,
    alumniOf: RHU,
    hasOccupation: [
      {
        '@type': 'Occupation',
        name: 'Embedded Systems & Vision Engineer',
        description:
          'At Oreyeon, since 2024: real-time vision for airport runway safety, on NVIDIA Jetson.',
      },
      {
        '@type': 'Occupation',
        name: 'Lab assistant and teaching assistant',
        description: 'At Rafik Hariri University, 2022 – 2025.',
      },
      {
        '@type': 'Occupation',
        name: 'Technical mentor',
        description: 'INJAZ Al-Arab Company Program, 2026.',
      },
    ],
    hasCredential: [
      ...section('education').map((e) => ({
        '@type': 'EducationalOccupationalCredential',
        name: e.what,
        credentialCategory: 'degree',
        recognizedBy: RHU,
      })),
      ...section('certificates')
        .filter((e) => !/^short courses/i.test(e.what))
        .map((e) => ({
          '@type': 'EducationalOccupationalCredential',
          name: e.what,
          credentialCategory: 'certificate',
          ...(e.where
            ? { recognizedBy: { '@type': 'Organization', name: e.where } }
            : {}),
          ...(year(e) ? { dateCreated: year(e) } : {}),
        })),
    ],
    award: section('awards').map((e) =>
      year(e) ? `${e.what} (${year(e)})` : e.what
    ),
  },
}

const external = (href: string) => /^https?:\/\//.test(href)

export default function VneoAbout() {
  return (
    <>
      <JsonLd
        data={[
          profileJsonLd,
          liveCrumbs([
            { label: 'Home', href: '/' },
            { label: about.title, href: '/about' },
          ]),
        ]}
      />
      <section className="v7-index vn-index vn-about">
        <div className="vn-backbar">
          <BackButton fallback={HOME} label="Back" />
          <nav className="v7-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href={HOME}>Home</Link>
              </li>
              <li aria-current="page">{about.title}</li>
            </ol>
          </nav>
        </div>
        <h1 className="v7-index-title" data-lens="">
          {about.title}
        </h1>
        <p className="v7-more-lede">{about.lede}</p>
        {about.sections.map((s) => (
          <section key={s.id} className="vn-about-sec" aria-labelledby={`about-${s.id}`}>
            <h2 id={`about-${s.id}`}>{s.title}</h2>
            <ol className="vn-about-list">
              {s.entries.map((e) => (
                <li key={e.what}>
                  <span className="vn-about-when">{e.when}</span>
                  <div>
                    <h3>
                      {!e.href ? (
                        e.what
                      ) : external(e.href) ? (
                        <a href={e.href} rel="noopener" target="_blank">
                          {e.what} ↗
                        </a>
                      ) : (
                        <Link href={e.href}>{e.what}</Link>
                      )}
                    </h3>
                    {e.where ? <p className="vn-about-where">{e.where}</p> : null}
                    {e.note ? <p>{e.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </section>
    </>
  )
}
