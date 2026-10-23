import { type MetadataRoute } from 'next'

import { readyArticles } from '@/content/authority/articles'
import { readyProjects } from '@/content/authority/projects'
import { topics } from '@/content/authority/topics'
import { siteConfig } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url

  const eligibleTopics = topics.filter((topic) => {
    const count =
      readyProjects.filter((p) => p.topics.includes(topic.slug)).length +
      readyArticles.filter((a) => a.topics.includes(topic.slug)).length
    return count >= 2
  })

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/projects`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/writing`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/topics`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.7 },
    ...readyProjects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...readyArticles.map((article) => ({
      url: `${base}/writing/${article.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...eligibleTopics.map((topic) => ({
      url: `${base}/topics/${topic.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
