'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ComponentType } from 'react'

import { Build } from './build'
import { Hero } from './hero'
import './hero-switch.css'

/*
 * The first screen and the "What I build" section under it, as one pair, and
 * in development only the three cedars heroes still in the running, to
 * compare in place: ?hero=v6 or v8 (v2 by default), or the small switch in
 * the corner. Every one of them shows me under the cedars, so the section
 * under them shows the studio portrait; a hero with the portrait would pair
 * with the field photo instead (Build's photo prop), so the same picture
 * never shows twice in a row. Production still renders the drone (v1) until
 * one is picked. Benched, still in the code: v1 the drone (maybe for another
 * section), v3 contact sheet, v4 sentence, v5 specimen, v7 matched.
 */

type Variant = 'v2' | 'v6' | 'v8'

const DEV = process.env.NODE_ENV === 'development'

const VARIANTS: Partial<Record<Variant, ComponentType>> | null = DEV
  ? {
      v2: dynamic(() => import('./hero-v2').then((m) => m.HeroV2)),
      v6: dynamic(() => import('./hero-v6').then((m) => m.HeroV6)),
      v8: dynamic(() => import('./hero-v8').then((m) => m.HeroV8)),
    }
  : null

const NAMES: Record<Variant, string> = {
  v2: 'Cedars',
  v6: 'Cedars, open',
  v8: 'Cedars specimen',
}

/** which picture of me the section under the hero shows */
const ABOUT: Record<Variant, 'portrait' | 'field'> = {
  v2: 'portrait',
  v6: 'portrait',
  v8: 'portrait',
}

export function HeroSection() {
  const [v, setV] = useState<Variant>('v2')

  useEffect(() => {
    if (!DEV) return
    const q = new URLSearchParams(window.location.search).get('hero')
    if (q && q in NAMES) setV(q as Variant)
  }, [])

  const choose = (next: Variant) => {
    setV(next)
    const url = new URL(window.location.href)
    if (next === 'v2') url.searchParams.delete('hero')
    else url.searchParams.set('hero', next)
    window.history.replaceState(null, '', url)
    window.scrollTo({ top: 0 })
  }

  const Chosen = VARIANTS?.[v] ?? null
  return (
    <>
      {Chosen ? <Chosen key={v} /> : <Hero />}
      <Build
        key={`build-${Chosen ? ABOUT[v] : 'portrait'}`}
        photo={Chosen ? ABOUT[v] : 'portrait'}
      />
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
