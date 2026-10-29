import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/v2/json-ld'
import { collectionJsonLd, liveCrumbs } from '@/components/v2/schema'
import { BackButton } from '@/components/vneo/back'
import { CalmShot } from '@/components/vneo/calm'
import { pageMeta } from '@/components/vneo/meta'
import { RobotsShot } from '@/components/vneo/robots'
import { TopicLinks } from '@/components/vneo/topics'
import { HOME, VN, vneo, workHref, writingHref } from '@/content/vneo/site'
import { hubArticles, hubProjects, hubs } from '@/content/vneo/topics'

/** The robot pack, which closed the home page before the quad, opens this hub. */
const PACK_HUB = 'robotics-perception'

interface Props {
  params: Promise<{ slug: string }>
}

const hub = (slug: string) => hubs.find((t) => t.slug === slug)

export const dynamicParams = false
export function generateStaticParams() {
  return hubs.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const t = hub(slug)
  if (!t) return { title: 'Not found', robots: { index: false, follow: false } }
  return pageMeta({
    path: `/topics/${t.slug}`,
    title: t.metaTitle,
    description: t.metaDescription,
  })
}

/** A topic hub: what the field is, and the work and writing behind it. */
export default async function Topic({ params }: Props) {
  const { slug } = await params
  const t = hub(slug)
  if (!t) notFound()
  const projects = hubProjects(t.slug)
  const articles = hubArticles(t.slug)
  const path = `/topics/${t.slug}`
  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Topics', href: '/topics' },
    { label: t.title, href: path },
  ]

  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd({
            path,
            name: t.metaTitle,
            description: t.metaDescription,
            projects,
            articles,
          }),
          liveCrumbs(crumbs),
        ]}
      />
      <section className="v7-index vn-index vn-topic">
        <div className="vn-backbar">
          <BackButton fallback="/topics" label="Back" />
          <nav className="v7-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href={HOME}>Home</Link>
              </li>
              <li>
                <Link href="/topics">Topics</Link>
              </li>
              <li aria-current="page">{t.title}</li>
            </ol>
          </nav>
        </div>
        <h1 className="v7-index-title" data-lens="">
          {t.title}
        </h1>
        <p className="v7-more-lede">{t.definition}</p>
        {t.intro ? (
          <div className="vn-topic-intro">
            {t.intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        ) : null}

        {t.slug === PACK_HUB ? (
          <figure className="vn-topic-shot">
            <CalmShot>
              <RobotsShot replay={vneo.pack.replay} accent={vneo.pack.accent} />
            </CalmShot>
            <figcaption className="vn-loop-credit">{vneo.pack.credit}</figcaption>
          </figure>
        ) : null}

        {projects.length ? (
          <>
            <h2 className="vn-topic-h">Projects</h2>
            <ul className="vn-notes-list">
              {projects.map((p) => (
                <li key={p.slug}>
                  <Link href={workHref(p.slug, VN)}>
                    <b>{p.title}</b>
                    <span>{p.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {articles.length ? (
          <>
            <h2 className="vn-topic-h">Writing</h2>
            <ul className="vn-notes-list">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link href={writingHref(a.slug)}>
                    <b>{a.title}</b>
                    <span>{a.dek}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <TopicLinks
          slugs={hubs.filter((o) => o.slug !== t.slug).map((o) => o.slug)}
          label="Other topics"
        />
      </section>
    </>
  )
}
