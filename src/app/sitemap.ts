import { type MetadataRoute } from 'next'

import { readyArticles } from '@/content/authority/articles'
import { readyProjects } from '@/content/authority/projects'
import { topics } from '@/content/authority/topics'
import { siteConfig } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const base = siteConfig.url

  const eligibleTopics = topics.filter((topic) => {
    const count =
      readyProjects.filter((p) => p.topics.includes(topic.slug)).length +
      readyArticles.filter((a) => a.topics.includes(topic.slug)).length
    return count >= 2
  })

  return [
    { url: base, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/projects`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/writing`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/topics`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    ...readyProjects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...readyArticles.map((article) => ({
      url: `${base}/writing/${article.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...eligibleTopics.map((topic) => ({
      url: `${base}/topics/${topic.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
