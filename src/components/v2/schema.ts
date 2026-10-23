/*
 * JSON-LD for /v2, identical in shape to the live pages: every URL is the
 * canonical live URL and every work points at the site's Person node, so the
 * markup carries over unchanged when a page is promoted.
 */

import { getTopic, type ArticleRecord, type ProjectRecord, type TopicRecord } from '@/content/authority'
import { projectPlate, companionProject } from '@/content/v2/record'
import { siteConfig } from '@/lib/site'

const url = (path: string) => `${siteConfig.url}${path}`
const about = (slugs: string[]) => slugs.map((slug) => getTopic(slug)?.title ?? slug)

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
    author: { '@id': `${siteConfig.url}/#person` },
    creator: { '@id': `${siteConfig.url}/#person` },
    keywords: project.keywords.join(', '),
    about: about(project.topics),
  }
  if (project.schemaType === 'SoftwareSourceCode') {
    const repo = project.sources.find((s) => s.kind === 'repository')
    if (repo) schema.codeRepository = repo.href
    schema.programmingLanguage = project.keywords.filter((k) =>
      /python|typescript|flutter|c\+\+|arduino|react|fastapi|matlab/i.test(k),
    )
  }
  const plate = projectPlate(project)
  if (plate) schema.image = url(plate.src)
  return schema
}

export function articleJsonLd(article: ArticleRecord) {
  const canonical = `/writing/${article.slug}`
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': `${url(canonical)}#article`,
    headline: article.title,
    description: article.metaDescription,
    url: url(canonical),
    inLanguage: 'en',
    isPartOf: { '@id': `${siteConfig.url}/#website` },
    author: { '@id': `${siteConfig.url}/#person` },
    keywords: article.keywords.join(', '),
    about: about(article.topics),
  }
  if (article.heroMedia) schema.image = url(article.heroMedia.src)
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
        '@type': 'TechArticle',
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
