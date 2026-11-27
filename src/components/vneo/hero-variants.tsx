'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ComponentType } from 'react'

import { Build } from './build'
import { Hero } from './hero'
import './hero-switch.css'

/*
 * The first screen and the "What I build" section under it, as one pair, and
 * in development only the variants to compare in place: ?hero=v2 … swaps
 * both on the real page, and a small switch in the corner steps between them.
 * A hero that shows my portrait pairs with the section showing me under the
 * cedars, and the other way round, so the same picture never shows twice in a
 * row. Production renders v1 and never loads the others. (v3, the contact
 * sheet, and v4, the sentence, are benched: they stay in the code.)
 */

type Variant = 'v1' | 'v2' | 'v5' | 'v6' | 'v7' | 'v8'

const DEV = process.env.NODE_ENV === 'development'

const VARIANTS: Partial<Record<Variant, ComponentType>> | null = DEV
  ? {
      v2: dynamic(() => import('./hero-v2').then((m) => m.HeroV2)),
      v5: dynamic(() => import('./hero-v5').then((m) => m.HeroV5)),
      v6: dynamic(() => import('./hero-v6').then((m) => m.HeroV6)),
      v7: dynamic(() => import('./hero-v7').then((m) => m.HeroV7)),
      v8: dynamic(() => import('./hero-v8').then((m) => m.HeroV8)),
    }
  : null

const NAMES: Record<Variant, string> = {
  v1: 'Drone',
  v2: 'Cedars',
  v6: 'Cedars, open',
  v7: 'Cedars, matched',
  v8: 'Cedars specimen',
  v5: 'Specimen',
}

/** which picture of me the section under the hero shows */
const ABOUT: Record<Variant, 'portrait' | 'field'> = {
  v1: 'portrait',
  v2: 'portrait',
  v6: 'portrait',
  v7: 'portrait',
  v8: 'portrait',
  v5: 'field',
}

export function HeroSection() {
  const [v, setV] = useState<Variant>('v1')

  useEffect(() => {
    if (!DEV) return
    const q = new URLSearchParams(window.location.search).get('hero')
    if (q && q in NAMES) setV(q as Variant)
  }, [])

  const choose = (next: Variant) => {
    setV(next)
    const url = new URL(window.location.href)
    if (next === 'v1') url.searchParams.delete('hero')
    else url.searchParams.set('hero', next)
    window.history.replaceState(null, '', url)
    window.scrollTo({ top: 0 })
  }

  const Chosen = (v !== 'v1' && VARIANTS?.[v]) || null
  return (
    <>
      {Chosen ? <Chosen key={v} /> : <Hero />}
      <Build key={`build-${ABOUT[v]}`} photo={ABOUT[v]} />
      {DEV ? (
        <nav
          className="vn-hero-switch"
          aria-label="Hero variants (development only)"
        >
          <span>Hero</span>
          {(Object.keys(NAMES) as Variant[]).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={v === k}
              title={NAMES[k]}
              onClick={() => choose(k)}
            >
              {k}
              <small>{NAMES[k]}</small>
            </button>
          ))}
        </nav>
      ) : null}
    </>
  )
}
