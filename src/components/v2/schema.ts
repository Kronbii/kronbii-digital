/*
 * JSON-LD for /v2, identical in shape to the live pages: every URL is the
 * canonical live URL and every work points at the site's Person node, so the
 * markup carries over unchanged when a page is promoted.
 */

import { getTopic, type ArticleRecord, type ProjectRecord, type TopicRecord } from '@/content/authority'
import { projectImages, projectPlate, companionProject } from '@/content/v2/record'
import { racePhoto } from '@/content/vneo/site'
import { CARD } from '@/components/vneo/meta'
import { siteConfig } from '@/lib/site'

const url = (path: string) => `${siteConfig.url}${path}`
const about = (slugs: string[]) => slugs.map((slug) => getTopic(slug)?.title ?? slug)
const personRef = { '@id': `${siteConfig.url}/#person` }

/** Sets a list field only when it has something in it. */
function list(schema: Record<string, unknown>, key: string, items: string[], join = false) {
  if (items.length) schema[key] = join ? items.join(', ') : items
}

/** Languages a project names in its keywords, its "how", or its steps. Frameworks map to their language; ROS 2 and the like are not languages. */
const LANGUAGES: [RegExp, string][] = [
  [/\bpython\b/i, 'Python'],
  [/\btypescript\b/i, 'TypeScript'],
  [/\bjavascript\b/i, 'JavaScript'],
  [/\bc\+\+/i, 'C++'],
  [/\barduino\b/i, 'C++'],
  [/\bmatlab\b/i, 'MATLAB'],
  [/\b(?:dart|flutter)\b/i, 'Dart'],
]
function programmingLanguages(project: ProjectRecord): string[] {
  const text = [project.answer.how, ...project.stages.map((s) => `${s.title} ${s.detail}`), ...project.keywords].join(' \n ')
  const found = new Set(LANGUAGES.filter(([re]) => re.test(text)).map(([, name]) => name))
  if (project.keywords.some((k) => k.trim() === 'C')) found.add('C')
  return [...found]
}

/** Write-ups that belong to no project (essays, community notes) are blog posts; the rest are technical articles. */
const articleType = (article: ArticleRecord) => (article.projectSlug ? 'TechArticle' : 'BlogPosting')

/** Imagen's photographs belong to its client: none of them stand in for its write-up. */
const PRIVATE_MEDIA = new Set(['imagen-raw-to-edit-dataset-pipeline'])

/** The picture for a write-up: its own lead image, else its project's first, else the site's card. */
function articleImage(article: ArticleRecord): string {
  if (article.heroMedia) return racePhoto(article.heroMedia).src
  const project = companionProject(article)
  const first = project && !PRIVATE_MEDIA.has(project.slug) ? projectImages(project)[0] : undefined
  return first ? racePhoto(first).src : CARD.src
}

/** Copies of a write-up published elsewhere (Medium, DEV, Hashnode, Substack). */
const SYNDICATION = /^https:\/\/([a-z0-9-]+\.)*(medium\.com|dev\.to|hashnode\.(dev|com)|substack\.com)\//i
const syndicated = (article: ArticleRecord) =>
  article.sources
    .filter((s) => SYNDICATION.test(s.href) && (s.kind === 'article' || /^also on\b/i.test(s.label)))
    .map((s) => s.href)

export const liveCrumbs = (items: { label: string; href: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: url(item.href.replace(/^\/v2/, '') || '/'),
  })),
})

export function projectJsonLd(project: ProjectRecord) {
  const canonical = `/projects/${project.slug}`
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': project.schemaType,
    '@id': `${url(canonical)}#work`,
    name: project.title,
    headline: project.title,
    description: project.metaDescription,
    url: url(canonical),
    inLanguage: 'en',
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    author: personRef,
    creator: personRef,
  }
  list(schema, 'keywords', project.keywords, true)
  list(schema, 'about', about(project.topics))
  if (project.schemaType === 'SoftwareSourceCode') {
    const repo = project.sources.find((s) => s.kind === 'repository')
    if (repo) schema.codeRepository = repo.href
    list(schema, 'programmingLanguage', programmingLanguages(project))
  }
  const plate = projectPlate(project)
  if (plate) schema.image = url(plate.src)
  return schema
}

export function articleJsonLd(article: ArticleRecord) {
  const canonical = `/writing/${article.slug}`
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': articleType(article),
    '@id': `${url(canonical)}#article`,
    headline: article.title,
    description: article.metaDescription,
    url: url(canonical),
    mainEntityOfPage: url(canonical),
    inLanguage: 'en',
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    author: personRef,
    image: url(articleImage(article)),
  }
  list(schema, 'keywords', article.keywords, true)
  list(schema, 'about', about(article.topics))
  list(schema, 'sameAs', syndicated(article))
  const events = ARTICLE_EVENTS[article.slug]
  if (events) schema.mentions = events.map((e) => ({ '@id': e['@id'] }))
  const project = companionProject(article)
  if (project) {
    schema.mentions = {
      '@type': project.schemaType,
      name: project.title,
      url: url(`/projects/${project.slug}`),
    }
  }
  return schema
}

/** Events a write-up records, as their own nodes: the talk I gave at DevFest. */
const ARTICLE_EVENTS: Record<string, { '@id': string; [key: string]: unknown }[]> = {
  'talks-workshops-and-teaching': [
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      '@id': 'https://north25.gdglebanon.com/#event',
      name: 'GDG DevFest North Lebanon 2025',
      description:
        'Talk by Rami Kronbi: “On-Device Multimodal Assistants: Can We Fit GPT-Vision on Small Hardware?”',
      startDate: '2025-12-20',
      // schema.org has no "completed" status; a past event that ran as planned stays EventScheduled
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Beirut Arab University, Tripoli campus',
        address: { '@type': 'PostalAddress', addressLocality: 'Tripoli', addressCountry: 'LB' },
      },
      url: 'https://north25.gdglebanon.com/',
      organizer: { '@type': 'Organization', name: 'GDG North Lebanon' },
      performer: personRef,
    },
  ],
}

/** The event nodes a write-up's page carries beside its article. */
export const articleEventsJsonLd = (article: ArticleRecord) => ARTICLE_EVENTS[article.slug] ?? []

interface CollectionInput {
  path: string
  name: string
  description: string
  projects?: ProjectRecord[]
  articles?: ArticleRecord[]
  topics?: TopicRecord[]
}

export function collectionJsonLd({ path, name, description, projects = [], articles = [], topics = [] }: CollectionInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url(path),
    url: url(path),
    name,
    description,
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    about: { '@id': `${siteConfig.url}/#person` },
    hasPart: [
      ...projects.map((p) => ({
        '@type': p.schemaType,
        name: p.title,
        url: url(`/projects/${p.slug}`),
        description: p.summary,
      })),
      ...articles.map((a) => ({
        '@type': articleType(a),
        name: a.title,
        url: url(`/writing/${a.slug}`),
        description: a.metaDescription,
      })),
      ...topics.map((t) => ({
        '@type': 'CollectionPage',
        name: t.title,
        url: url(`/topics/${t.slug}`),
        description: t.definition,
      })),
    ],
  }
}

/** Metadata shared by every /v2 page: noindex, canonical to the live route. */
export function v2Meta(livePath: string, title: string, description: string) {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: livePath },
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    openGraph: { title, description, url: url(livePath), type: 'website' as const },
  }
}
