'use client'

import Link from 'next/link'
import { useState } from 'react'

/*
 * Every project, v3's way: tight tiles and a filter per field, each tile just
 * its name and one sentence; the rest is on its page.
 */

export interface GridItem {
  slug: string
  title: string
  kind: string
  line: string
  proof: string
  field: string
  href: string
  image?: { src: string; position?: string; contain?: boolean }
  /** Opens outside the site. */
  external?: boolean
}

export function ProjectGrid({
  items,
  fields,
  all,
}: {
  items: GridItem[]
  fields: { id: string; label: string }[]
  all: string
}) {
  const [on, setOn] = useState<string>('all')
  const shown = on === 'all' ? items : items.filter((i) => i.field === on)
  const count = (id: string) => items.filter((i) => i.field === id).length
  return (
    <>
      <div className="vn-filters" role="group" aria-label="Filter by field">
        <button
          type="button"
          aria-pressed={on === 'all'}
          onClick={() => setOn('all')}
        >
          {all} <span>{items.length}</span>
        </button>
        {fields
          .filter((f) => count(f.id))
          .map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={on === f.id}
              onClick={() => setOn(f.id)}
            >
              {f.label} <span>{count(f.id)}</span>
            </button>
          ))}
      </div>
      <ul className="vn-grid" aria-live="polite">
        {shown.map((t) => (
          <li key={t.slug} className="vn-tile">
            <Link
              href={t.href}
              className="vn-tile-link"
              aria-label={`${t.title}: ${t.line}`}
            />
            <div className="vn-tile-media" aria-hidden="true">
              {t.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.image.src}
                  alt=""
                  loading="lazy"
                  style={{
                    objectFit: t.image.contain ? 'contain' : 'cover',
                    objectPosition: t.image.position,
                  }}
                />
              ) : (
                <span className="vn-tile-type fx">{t.title}</span>
              )}
            </div>
            <div className="vn-tile-cap">
              <h2>{t.title}</h2>
              <p>{t.line}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
