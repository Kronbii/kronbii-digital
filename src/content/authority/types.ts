/** ready: public. review: a draft, local builds only. hold: kept in the record, never rendered. */
export type PublicationState = 'ready' | 'review' | 'hold'

export interface AuthorityMedia {
  src: string
  alt: string
  caption?: string
  credit?: string
  width?: number
  height?: number
  /** On a project page: the title of the step it is shown under. */
  step?: string
}

export interface AuthoritySource {
  label: string
  href: string
  kind: 'repository' | 'demo' | 'documentation' | 'article' | 'institution' | 'listing' | 'cv' | 'video'
  note?: string
}

export interface ArticleParagraph {
  kind: 'p'
  text: string
}

export interface ArticleHeading {
  kind: 'h2' | 'h3'
  text: string
}

/** A picture inside an article's body: a path under /images, its alt text, and an optional caption. */
export interface ArticleFigure {
  kind: 'figure'
  src: string
  alt: string
  caption?: string
}

/**
 * A paragraph's text may carry inline links as [label](/path) or
 * [label](https://…); the reader renders them, and every other use
 * (metadata, JSON-LD, RSS descriptions, counts) keeps the label alone.
 */
/** A short code listing, shown as written. */
export interface ArticleCode {
  kind: 'code'
  lang: string
  text: string
}

export type ArticleBlock = ArticleParagraph | ArticleHeading | ArticleFigure | ArticleCode

export interface AuthorityBreadcrumb {
  label: string
  href: string
}

export interface ProjectAnswer {
  what: string
  problem: string
  how: string
  role: string
}

export interface ProjectStage {
  step: string
  title: string
  detail: string
}

export interface ProjectMeasurement {
  label: string
  value: string
  context?: string
}

export interface ProjectRecord {
  slug: string
  state: PublicationState
  title: string
  metaTitle: string
  metaDescription: string
  summary: string
  role: string
  form: 'artifact' | 'diagram'
  hero:
    | { kind: 'image'; media: AuthorityMedia }
    | { kind: 'gallery'; items: AuthorityMedia[] }
    | { kind: 'diagram'; diagramId: string; caption: string; alt: string }
  answer: ProjectAnswer
  stages: ProjectStage[]
  measurements?: ProjectMeasurement[]
  limits: string[]
  media?: AuthorityMedia[]
  /** Real footage: the first leads the page, the rest join the media section. MP4, muted, with a poster frame. */
  videos?: { src: string; poster: string; alt: string; caption?: string; step?: string }[]
  diagramIds?: string[]
  sources: AuthoritySource[]
  articleSlug: string
  topics: string[]
  schemaType: 'SoftwareSourceCode' | 'CreativeWork'
  keywords: string[]
}

export interface ArticleRecord {
  slug: string
  state: PublicationState
  title: string
  metaTitle: string
  metaDescription: string
  dek: string
  body: ArticleBlock[]
  sources: AuthoritySource[]
  projectSlug: string
  topics: string[]
  heroMedia?: AuthorityMedia
  keywords: string[]
}

export interface TopicRecord {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  definition: string
  questions: string[]
  reviewMentions?: string[]
}
