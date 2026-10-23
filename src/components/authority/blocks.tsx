import Image from 'next/image'
import Link from 'next/link'

import type {
  ArticleBlock,
  AuthorityMedia,
  AuthoritySource,
  ProjectAnswer,
  ProjectMeasurement,
  ProjectStage,
} from '@/content/authority/types'
import { getTopic } from '@/content/authority/topics'
import { plainText } from '@/components/vneo/inline-text'

import styles from './authority.module.css'

export function ReviewNotice() {
  return (
    <p className={styles.reviewNotice} role="note">
      <strong>Editorial review draft.</strong> This page is a private review draft. It is not indexed and is
      not linked from public indexes; content may change before publication.
    </p>
  )
}

interface MediaFigureProps {
  media: AuthorityMedia
  priority?: boolean
  sizes?: string
}

export function MediaFigure({ media, priority, sizes }: MediaFigureProps) {
  return (
    <figure className={styles.projectMedia}>
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width ?? 1600}
        height={media.height ?? 900}
        priority={priority}
        sizes={sizes ?? '(min-width: 960px) 60vw, 100vw'}
        unoptimized={media.src.endsWith('.gif')}
      />
      {media.caption ? <figcaption className={styles.mediaCaption}>{media.caption}</figcaption> : null}
    </figure>
  )
}

interface GalleryProps {
  items: AuthorityMedia[]
}

export function MediaGallery({ items }: GalleryProps) {
  return (
    <div className={styles.gallery}>
      {items.map((item) => (
        <figure key={item.src} className={styles.galleryFigure}>
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width ?? 1200}
            height={item.height ?? 800}
            sizes="(min-width: 720px) 40vw, 100vw"
            unoptimized={item.src.endsWith('.gif')}
          />
          {item.caption ? <figcaption className={styles.galleryCaption}>{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  )
}

interface AnswerBlockProps {
  answer: ProjectAnswer
}

export function AnswerBlock({ answer }: AnswerBlockProps) {
  const entries: Array<{ key: keyof ProjectAnswer; label: string }> = [
    { key: 'what', label: 'What it is' },
    { key: 'problem', label: 'Problem it addresses' },
    { key: 'how', label: 'How it works' },
    { key: 'role', label: "Rami's role" },
  ]
  return (
    <dl className={styles.answerGrid}>
      {entries.map(({ key, label }) => (
        <div key={key} className={styles.answerCard}>
          <dt>{label}</dt>
          <dd>{answer[key]}</dd>
        </div>
      ))}
    </dl>
  )
}

interface StagesProps {
  stages: ProjectStage[]
}

export function StageList({ stages }: StagesProps) {
  return (
    <ol className={styles.stages}>
      {stages.map((stage) => (
        <li key={stage.step + stage.title} className={styles.stage}>
          <span className={styles.stageStep}>{stage.step}</span>
          <h3 className={styles.stageTitle}>{stage.title}</h3>
          <p className={styles.stageDetail}>{stage.detail}</p>
        </li>
      ))}
    </ol>
  )
}

interface MeasurementsProps {
  measurements: ProjectMeasurement[]
}

export function MeasurementGrid({ measurements }: MeasurementsProps) {
  return (
    <div className={styles.measurements} role="list">
      {measurements.map((m) => (
        <div key={m.label + m.value} role="listitem" className={styles.measurement}>
          <span className={styles.measurementValue}>{m.value}</span>
          <span className={styles.measurementLabel}>{m.label}</span>
          {m.context ? <span className={styles.measurementContext}>{m.context}</span> : null}
        </div>
      ))}
    </div>
  )
}

interface LimitsProps {
  limits: string[]
}

export function LimitList({ limits }: LimitsProps) {
  return (
    <ul className={styles.limits}>
      {limits.map((limit) => (
        <li key={limit}>{limit}</li>
      ))}
    </ul>
  )
}

interface SourceListProps {
  sources: AuthoritySource[]
}

const KIND_LABEL: Record<AuthoritySource['kind'], string> = {
  repository: 'Repository',
  demo: 'Demo',
  documentation: 'Docs',
  article: 'Article',
  institution: 'Institution',
  listing: 'Listing',
  cv: 'CV',
  video: 'Video',
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <p className={styles.topicReview}>
        Evidence links will be attached before publication. This draft is not indexable.
      </p>
    )
  }
  return (
    <ul className={styles.sourceList}>
      {sources.map((source) => (
        <li key={source.href + source.label} className={styles.sourceItem}>
          <span className={styles.sourceKind}>{KIND_LABEL[source.kind]}</span>
          <span>
            <a
              className={styles.sourceLabel}
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {source.label}
            </a>
            {source.note ? <span className={styles.sourceNote}> — {source.note}</span> : null}
          </span>
        </li>
      ))}
    </ul>
  )
}

interface TopicPillsProps {
  topics: string[]
}

function humanizeSlug(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function TopicPills({ topics }: TopicPillsProps) {
  if (topics.length === 0) return null
  return (
    <div className={styles.topicPills}>
      {topics.map((slug) => {
        const topic = getTopic(slug)
        if (topic) {
          return (
            <Link key={slug} href={`/topics/${slug}`} className={styles.topicPill}>
              {topic.title}
            </Link>
          )
        }
        return (
          <span key={slug} className={styles.topicPill} aria-label={`Topic label: ${humanizeSlug(slug)}`}>
            {humanizeSlug(slug)}
          </span>
        )
      })}
    </div>
  )
}

interface CrossLinkCardProps {
  kind: string
  title: string
  href: string
  summary: string
}

export function CrossLinkCard({ kind, title, href, summary }: CrossLinkCardProps) {
  return (
    <Link href={href} className={styles.crossLink} data-cross-kind={kind.toLowerCase()}>
      <span className={styles.crossLinkTitle}>{title}</span>
      <span className={styles.crossLinkSummary}>{summary}</span>
    </Link>
  )
}

interface ArticleBodyProps {
  blocks: ArticleBlock[]
}

export function ArticleBodyContent({ blocks }: ArticleBodyProps) {
  return (
    <div className={styles.articleBody}>
      {blocks.map((block, index) => {
        if (block.kind === 'p') {
          return <p key={index}>{plainText(block.text)}</p>
        }
        if (block.kind === 'h2') {
          return <h2 key={index}>{block.text}</h2>
        }
        if (block.kind === 'figure') {
          return null
        }
        return <h3 key={index}>{block.text}</h3>
      })}
    </div>
  )
}
