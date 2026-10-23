import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/v2/json-ld'
import {
  articleEventsJsonLd,
  articleJsonLd,
  liveCrumbs,
} from '@/components/v2/schema'
import { BackButton } from '@/components/vneo/back'
import '@/components/vneo/figures.css'
import { Inline } from '@/components/vneo/inline'
import { pageMeta } from '@/components/vneo/meta'
import { TopicLinks } from '@/components/vneo/topics'
import { getArticle, getProject, readyArticles } from '@/content/authority'
import { mediaSize } from '@/content/v2/media-size'
import { sourceKindLabel } from '@/content/v2/record'
import { HOME, VN, racePhoto, workHref, writingHref } from '@/content/vneo/site'

/** A picture's intrinsic size, so the page does not shift as it loads. */
const sizeOf = (m: { src: string; width?: number; height?: number }) => {
  const [width, height] =
    m.width && m.height ? [m.width, m.height] : (mediaSize[m.src] ?? [])
  return width && height ? { width, height } : {}
}

interface Props {
  params: Promise<{ slug: string }>
}

const ready = (slug: string) => {
  const a = getArticle(slug)
  return a && a.state === 'ready' ? a : undefined
}

export function generateStaticParams() {
  return readyArticles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = ready(slug)
  if (!a) return { title: 'Not found', robots: { index: false, follow: false } }
  return pageMeta({
    path: `/writing/${slug}`,
    title: a.metaTitle,
    description: a.metaDescription,
    type: 'article',
    image: a.heroMedia
      ? { src: racePhoto(a.heroMedia).src, alt: a.heroMedia.alt ?? a.title }
      : undefined,
    keywords: a.keywords,
  })
}

/** A note, set to read, with a way back. */
export default async function VneoArticle({ params }: Props) {
  const { slug } = await params
  const a = ready(slug)
  if (!a) notFound()
  const project = a.projectSlug ? getProject(a.projectSlug) : undefined
  const companion = project && project.state === 'ready' ? project : undefined
  const at = readyArticles.findIndex((x) => x.slug === slug)
  const next = readyArticles[(at + 1) % readyArticles.length]
  const hero = a.heroMedia ? racePhoto(a.heroMedia) : undefined

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(a),
          ...articleEventsJsonLd(a),
          liveCrumbs([
            { label: 'Home', href: '/' },
            { label: 'Writing', href: '/writing' },
            { label: a.title, href: `/writing/${a.slug}` },
          ]),
        ]}
      />
      <article className="vn-article">
        <div className="vn-backbar">
          <BackButton fallback={`${VN}/writing`} label="Back" />
          <nav className="v7-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href={HOME}>Home</Link>
              </li>
              <li>
                <Link href={`${VN}/writing`}>Writing</Link>
              </li>
              <li aria-current="page">{a.title}</li>
            </ol>
          </nav>
        </div>
        <header className="vn-article-head">
          <span className="v7-label">
            <i aria-hidden="true" />
            Writing
          </span>
          <h1 data-lens="">{a.title}</h1>
          <p className="vn-article-dek">{a.dek}</p>
          {companion ? (
            <Link className="v7-go" href={workHref(companion.slug, VN)}>
              The project: {companion.title.split(' — ')[0]} →
            </Link>
          ) : null}
          {hero ? (
            <figure className="vn-article-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.src}
                alt={hero.alt}
                {...sizeOf(hero)}
                fetchPriority="high"
              />
              {hero.caption ? <figcaption>{hero.caption}</figcaption> : null}
            </figure>
          ) : null}
        </header>
        <div className="vn-article-body">
          {a.body.map((b, i) =>
            b.kind === 'h2' ? (
              <h2 key={i}>{b.text}</h2>
            ) : b.kind === 'h3' ? (
              <h3 key={i}>{b.text}</h3>
            ) : b.kind === 'figure' ? (
              <figure key={i} className="vn-article-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.src}
                  alt={b.alt}
                  {...sizeOf(b)}
                  loading="lazy"
                />
                {b.caption ? <figcaption>{b.caption}</figcaption> : null}
              </figure>
            ) : (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            )
          )}
        </div>
        <section className="vn-article-evidence" aria-label="Links and topics">
          {a.sources.length ? <h2>Links</h2> : null}
          {a.sources.length ? (
            <ul className="v7-sources">
              {a.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} rel="noopener" target="_blank">
                    <span className="v7-source-k">
                      {sourceKindLabel[s.kind]}
                    </span>
                    <span className="v7-source-l">{s.label} ↗</span>
                    {s.note ? (
                      <span className="v7-source-n">{s.note}</span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          <TopicLinks slugs={a.topics} />
        </section>
        <nav className="vn-article-foot" aria-label="More writing">
          <BackButton fallback={`${VN}/writing`} label="Back" />
          <Link className="vn-article-next" href={writingHref(next.slug)}>
            <span>Next note</span>
            <b>{next.title} →</b>
          </Link>
        </nav>
      </article>
    </>
  )
}
