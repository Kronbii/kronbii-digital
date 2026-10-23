import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/v2/json-ld'
import { liveCrumbs } from '@/components/v2/schema'
import { BackButton } from '@/components/vneo/back'
import { pageMeta } from '@/components/vneo/meta'
import { about } from '@/content/vneo/about'
import { HOME } from '@/content/vneo/site'

export const metadata: Metadata = pageMeta({
  path: '/about',
  title: 'About — Rami Kronbi',
  description: about.description,
})

export default function VneoAbout() {
  return (
    <>
      <JsonLd
        data={[
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
                    <h3>{e.href ? <Link href={e.href}>{e.what}</Link> : e.what}</h3>
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
