import Link from 'next/link'
import { notFound } from 'next/navigation'

import { JsonLd } from '@/components/v2/json-ld'
import { liveCrumbs, projectJsonLd } from '@/components/v2/schema'
import { SceneFor } from '@/components/v7/chapter'
import { Plate } from '@/components/v7/plate'
import { AutoVideo } from '@/components/vneo/auto-video'
import { DeminingScene } from '@/components/vneo/scenes/demining'
import { getArticle } from '@/content/authority'
import { mediaSize } from '@/content/v2/media-size'
import { projectImages, sourceKindLabel } from '@/content/v2/record'
import { workBySlug, works } from '@/content/v3/work'
import {
  HOME,
  VN,
  chapterOf,
  ownAlt,
  RACE_PHOTO,
  racePhoto,
  reel,
  workHref,
  writingHref,
} from '@/content/vneo/site'
import { siteConfig } from '@/lib/site'

import { BackButton } from './back'
import { TopicLinks } from './topics'
import { CaseShot } from './case-shot'
import { HeroDiagram, hasDiagram } from './hero-diagram'
import './figures.css'

/*
 * A project in Vneo: who it is for and what it does, beside its picture in
 * motion (its chapter's scene, or its reel shot, or its own photograph
 * coming into focus, or its architecture diagram); then the short answer and the steps for everyone; the
 * engineering folded under "For engineers" (v3's idea); its links, always
 * visible.
 */

const T = {
  home: 'Home',
  projects: 'Projects',
  short: 'In short',
  what: 'What it is',
  why: 'Why it matters',
  role: 'My part',
  steps: 'Step by step',
  results: 'Results',
  media: 'From the project',
  engineers: 'For engineers',
  engineersSub: 'How it is built, its limits, and its keywords.',
  how: 'How it works',
  limits: 'Limits',
  keywords: 'Keywords',
  links: 'Links',
  note: 'Read the write-up',
  next: 'Next project',
}

/** Imagen's photographs belong to its client; that page shows none. */
const PRIVATE_MEDIA = new Set(['imagen-raw-to-edit-dataset-pipeline'])

/** A phone screen keeps its own shape, and a picture far from 4:3 is shown whole. */
function tileFit(src: string): 'tall' | 'whole' | undefined {
  const size = mediaSize[src]
  if (!size) return undefined
  const r = size[0] / size[1]
  if (r < 0.8) return 'tall'
  return Math.abs(r / (4 / 3) - 1) > 0.03 ? 'whole' : undefined
}

/** One picture or clip from the project, placed in the page where it belongs. */
type Inline =
  | { kind: 'image'; src: string; alt: string; caption?: string; step?: string }
  | { kind: 'video'; src: string; poster: string; alt: string; caption?: string; step?: string }

function InlineFigure({ m }: { m: Inline }) {
  return (
    <figure className="vn-inline-fig" data-fit={m.kind === 'image' ? tileFit(m.src) : undefined}>
      {m.kind === 'video' ? (
        <video
          src={m.src}
          poster={m.poster}
          aria-label={m.alt}
          controls
          muted
          loop
          playsInline
          preload="none"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.src} alt={m.alt} loading="lazy" />
      )}
      {m.caption ? <figcaption>{m.caption}</figcaption> : null}
    </figure>
  )
}

export function Case({ slug }: { slug: string }) {
  const w = workBySlug(slug)
  if (!w) notFound()
  const { project: p, plain } = w
  const chapter = chapterOf(slug)
  const shot = reel.find((r) => r.slug === slug)
  const at = works.findIndex((x) => x.project.slug === slug)
  const next = works[(at + 1) % works.length]
  const images = PRIVATE_MEDIA.has(slug) ? [] : projectImages(p).map(racePhoto)
  const lead = PRIVATE_MEDIA.has(slug)
    ? undefined
    : plain.image
      ? racePhoto(plain.image)
      : images[0]
  const article = getArticle(p.articleSlug)
  const note =
    article && article.state === 'ready' ? writingHref(article.slug) : undefined
  // the car's page opens on its own reel shot (the camera reading the course), not its chapter's scene
  const ownShot = chapter?.id === 'machines' ? shot : undefined
  const diagram =
    p.hero.kind === 'diagram' && hasDiagram(p.hero.diagramId) ? p.hero : undefined
  // what the header already shows is not repeated below it
  const headShowsLead =
    !p.videos?.length &&
    slug !== 'landmine-detection-extraction-robot' &&
    !ownShot &&
    !chapter &&
    !shot &&
    !!lead
  const posters = new Set((p.videos ?? []).map((v) => v.poster))
  const inline: Inline[] = [
    ...(p.videos ?? []).slice(1).map((v) => ({ kind: 'video' as const, ...v })),
    ...images
      .filter((m) => !posters.has(m.src) && !(headShowsLead && m.src === lead?.src))
      .map((m) => ({ kind: 'image' as const, ...m })),
  ]
  // a piece that names its step goes under it; of the rest, one follows the short answer and
  // the others spread over the steps still without a picture; any left over close the page
  const inSteps = new Map<number, Inline[]>()
  const put = (k: number, m: Inline) => inSteps.set(k, [...(inSteps.get(k) ?? []), m])
  const loose: Inline[] = []
  for (const m of inline) {
    const k = m.step ? p.stages.findIndex((s) => s.title === m.step) : -1
    if (k >= 0) put(k, m)
    else loose.push(m)
  }
  const first = loose[0]
  const rest = loose.slice(1)
  const open = p.stages.map((_, k) => k).filter((k) => !inSteps.has(k))
  const spread = Math.min(rest.length, open.length)
  for (let j = 0; j < spread; j++) {
    put(open[Math.floor(((j + 0.5) * open.length) / spread)], rest[j])
  }
  const leftover = rest.slice(spread)
  const src =
    p.sources.find((s) => s.kind === 'demo') ??
    p.sources.find((s) => s.kind === 'repository')

  return (
    <>
      <JsonLd
        data={[
          // the car's image for search is its refined photograph, not the old one on the bench
          slug === 'brainiacs-autonomous-race-car'
            ? { ...projectJsonLd(p), image: `${siteConfig.url}${RACE_PHOTO}` }
            : projectJsonLd(p),
          liveCrumbs([
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/projects' },
            { label: p.title, href: `/projects/${p.slug}` },
          ]),
        ]}
      />
      <article className="v7-case">
        <div className="vn-backbar">
          <BackButton fallback={`${VN}/projects`} label="Back" />
          <nav className="v7-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href={HOME}>{T.home}</Link>
              </li>
              <li>
                <Link href={`${VN}/projects`}>{T.projects}</Link>
              </li>
              <li aria-current="page">{p.title.split(' — ')[0]}</li>
            </ol>
          </nav>
        </div>
        <header className="v7-ch v7-case-head">
          <div className="v7-ch-text">
            <span className="v7-label">
              <i aria-hidden="true" />
              {chapter ? chapter.label : plain.kind}
            </span>
            <h1 className="v7-case-title" data-lens="">
              {p.title}
            </h1>
            <p className="v7-ch-line">{plain.line}</p>
            <p className="v7-part">
              <span>{T.role}</span>
              {plain.part}
            </p>
            <p className="v7-ch-links">
              {src ? (
                <a
                  className="v7-go"
                  href={src.href}
                  rel="noopener"
                  target="_blank"
                >
                  {src.label} ↗
                </a>
              ) : null}
              {note ? (
                <Link className="v7-go quiet" href={note}>
                  {T.note} →
                </Link>
              ) : null}
            </p>
          </div>
          {p.videos?.length ? (
            <figure className="vn-case-video">
              <AutoVideo src={p.videos[0].src} poster={p.videos[0].poster} alt={p.videos[0].alt} />
              {p.videos[0].caption ? <figcaption>{p.videos[0].caption}</figcaption> : null}
            </figure>
          ) : slug === 'landmine-detection-extraction-robot' ? (
            <DeminingScene
              label={ownAlt.demining}
              replay="Play again"
              note="Illustration"
            />
          ) : ownShot ? (
            <CaseShot id={ownShot.id} label={ownShot.alt} />
          ) : chapter ? (
            <SceneFor chapter={chapter} />
          ) : shot ? (
            <CaseShot id={shot.id} label={shot.alt} />
          ) : lead ? (
            <Plate src={lead.src} alt={lead.alt} />
          ) : diagram ? (
            <HeroDiagram
              id={diagram.diagramId}
              caption={diagram.caption}
              alt={diagram.alt}
            />
          ) : (
            <Plate text={p.title.split(' — ')[0]} />
          )}
        </header>

        <section className="v7-case-sec" aria-labelledby="short-h">
          <h2 id="short-h" className="v7-case-h" data-lens="">
            {T.short}
          </h2>
          <p className="v7-case-summary">{p.summary}</p>
          <dl className="v7-answer">
            {(
              [
                [T.what, p.answer.what],
                [T.why, p.answer.problem],
                [T.role, p.answer.role],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {first ? <InlineFigure m={first} /> : null}
        </section>

        <section className="v7-case-sec" aria-labelledby="steps-h">
          <h2 id="steps-h" className="v7-case-h" data-lens="">
            {T.steps}
          </h2>
          <ol className="v7-steps">
            {p.stages.map((s, i) => (
              <li key={s.step}>
                <span className="v7-step-no">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.detail}</p>
                  {(inSteps.get(i) ?? []).map((m) => (
                    <InlineFigure key={m.src} m={m} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {p.measurements?.length ? (
          <section className="v7-case-sec" aria-labelledby="results-h">
            <h2 id="results-h" className="v7-case-h" data-lens="">
              {T.results}
            </h2>
            <dl className="v7-results">
              {p.measurements.map((m) => (
                <div key={m.label}>
                  <dd className="v7-result-v">{m.value}</dd>
                  <dt>{m.label}</dt>
                  {m.context ? (
                    <dd className="v7-result-c">{m.context}</dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {leftover.length ? (
          <section className="v7-case-sec" aria-labelledby="media-h">
            <h2 id="media-h" className="v7-case-h" data-lens="">
              {T.media}
            </h2>
            <div className="v7-media">
              {leftover.map((m) => (
                <InlineFigure key={m.src} m={m} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="v7-case-sec" aria-label={T.engineers}>
          <details className="vn-engineers">
            <summary>
              <span>
                {T.engineers}
                <small>{T.engineersSub}</small>
              </span>
              <i aria-hidden="true" />
            </summary>
            <div className="vn-engineers-body">
              <h3>{T.how}</h3>
              <p>{p.answer.how}</p>
              {p.limits.length ? (
                <>
                  <h3>{T.limits}</h3>
                  <ul className="v7-limits">
                    {p.limits.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {p.keywords.length ? (
                <>
                  <h3>{T.keywords}</h3>
                  <ul className="vn-keywords">
                    {p.keywords.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </details>
        </section>

        <section className="v7-case-sec" aria-labelledby="links-h">
          <h2 id="links-h" className="v7-case-h" data-lens="">
            {T.links}
          </h2>
          {p.sources.length ? (
            <ul className="v7-sources">
              {p.sources.map((s) => (
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
          {note ? (
            <p className="vn-case-note">
              <Link className="v7-go quiet" href={note}>
                {T.note} →
              </Link>
            </p>
          ) : null}
          <TopicLinks slugs={p.topics} />
        </section>

        <div className="vn-case-foot">
          <BackButton fallback={`${VN}/projects`} label="Back" />
          <Link className="v7-go quiet" href={`${VN}/projects`}>
            All projects →
          </Link>
        </div>
        <nav className="v7-next" aria-label={T.next}>
          <Link href={workHref(next.project.slug, VN)}>
            <span>{T.next}</span>
            <b>{next.project.title} →</b>
          </Link>
        </nav>
      </article>
    </>
  )
}
