'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ComponentType } from 'react'

import { Hero } from './hero'
import './hero-switch.css'

/*
 * The first screen and, in development only, its variants to compare in
 * place: ?hero=v2 … ?hero=v5 swaps the hero on the real page, and a small
 * switch in the corner steps between them. Production renders v1 and never
 * loads the others.
 */

type Variant = 'v1' | 'v2' | 'v3' | 'v4' | 'v5'

const DEV = process.env.NODE_ENV === 'development'

const VARIANTS: Partial<Record<Variant, ComponentType>> | null = DEV
  ? {
      v2: dynamic(() => import('./hero-v2').then((m) => m.HeroV2)),
      v3: dynamic(() => import('./hero-v3').then((m) => m.HeroV3)),
      v4: dynamic(() => import('./hero-v4').then((m) => m.HeroV4)),
      v5: dynamic(() => import('./hero-v5').then((m) => m.HeroV5)),
    }
  : null

const NAMES: Record<Variant, string> = {
  v1: 'Drone',
  v2: 'Cedars',
  v3: 'Contact sheet',
  v4: 'Sentence',
  v5: 'Specimen',
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
