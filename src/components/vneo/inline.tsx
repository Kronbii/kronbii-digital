import Link from 'next/link'

import { inlineParts } from './inline-text'

export { inlineParts, plainText, type InlinePart } from './inline-text'

const web = (href: string) => /^https?:\/\//.test(href)

/** A paragraph's text, its links live. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {inlineParts(text).map((p, i) =>
        typeof p === 'string' ? (
          p
        ) : !p.href.startsWith('/') ? (
          <a
            key={i}
            className="vn-inline-link"
            href={p.href}
            {...(web(p.href) ? { rel: 'noopener', target: '_blank' } : {})}
          >
            {p.label}
          </a>
        ) : (
          <Link key={i} className="vn-inline-link" href={p.href}>
            {p.label}
          </Link>
        )
      )}
    </>
  )
}
