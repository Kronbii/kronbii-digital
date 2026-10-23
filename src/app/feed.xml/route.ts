import { inlineParts } from '@/components/vneo/inline-text'
import { getProject, readyArticles, type ArticleBlock } from '@/content/authority'
import { racePhoto } from '@/content/vneo/site'
import { siteConfig } from '@/lib/site'

/*
 * The writing as a full-text RSS feed. Besides readers, it is what DEV,
 * Hashnode, and Medium import from: each item links back to its page here,
 * which they keep as the canonical URL.
 */

export const dynamic = 'force-static'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const attr = (s: string) => esc(s).replace(/"/g, '&quot;')
const abs = (path: string) => `${siteConfig.url}${path}`
const href = (h: string) => (h.startsWith('/') ? abs(h) : h)

/** A paragraph's text with its [label](href) links as links. */
const inline = (text: string) =>
  inlineParts(text)
    .map((p) =>
      typeof p === 'string'
        ? esc(p)
        : `<a href="${attr(href(p.href))}">${esc(p.label)}</a>`
    )
    .join('')

function block(b: ArticleBlock): string {
  switch (b.kind) {
    case 'p':
      return `<p>${inline(b.text)}</p>`
    case 'figure':
      return `<figure><img src="${attr(href(b.src))}" alt="${attr(b.alt)}"/>${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`
    default:
      return `<${b.kind}>${esc(b.text)}</${b.kind}>`
  }
}

function content(a: (typeof readyArticles)[number]): string {
  const url = abs(`/writing/${a.slug}`)
  const project = a.projectSlug ? getProject(a.projectSlug) : undefined
  const companion = project && project.state === 'ready' ? project : undefined
  const hero = a.heroMedia ? racePhoto(a.heroMedia) : undefined
  const parts = [
    hero
      ? `<figure><img src="${attr(abs(hero.src))}" alt="${attr(hero.alt)}"/>${hero.caption ? `<figcaption>${esc(hero.caption)}</figcaption>` : ''}</figure>`
      : '',
    ...a.body.map(block),
    a.sources.length
      ? `<h2>Links</h2><ul>${a.sources
          .map((s) => `<li><a href="${attr(s.href)}">${esc(s.label)}</a></li>`)
          .join('')}</ul>`
      : '',
    `<p><em>Originally published at <a href="${attr(url)}">ramikronbi.com</a>${
      companion
        ? `. The project: <a href="${attr(abs(`/projects/${companion.slug}`))}">${esc(companion.title.split(' — ')[0])}</a>`
        : ''
    }.</em></p>`,
  ]
  return parts.join('').replace(/]]>/g, ']]]]><![CDATA[>')
}

export function GET() {
  const items = readyArticles
    .map((a) => {
      const url = abs(`/writing/${a.slug}`)
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(a.dek)}</description>
      <dc:creator>${esc(siteConfig.name)}</dc:creator>
${a.keywords.map((k) => `      <category>${esc(k)}</category>`).join('\n')}
      <content:encoded><![CDATA[${content(a)}]]></content:encoded>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Writing — ${esc(siteConfig.name)}</title>
    <link>${abs('/writing')}</link>
    <atom:link href="${abs('/feed.xml')}" rel="self" type="application/rss+xml"/>
    <description>How the work was done: the decisions, the failures, and what was measured.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
