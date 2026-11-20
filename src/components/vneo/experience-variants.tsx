'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ComponentType } from 'react'

import type { BoardRole } from '@/content/vneo/experience-board'

import { Experience } from './experience'

/*
 * The experience section and, in development only, its variants to compare in
 * place: ?exp=v2 … ?exp=v5 swaps the section on the real page, and a small
 * switch in the corner steps between them. Production renders v1 and never
 * loads the others.
 */

type Props = { roles: BoardRole[]; now: number }
type Variant = 'v1' | 'v2' | 'v3' | 'v4' | 'v5'

const DEV = process.env.NODE_ENV === 'development'

const VARIANTS: Partial<Record<Variant, ComponentType<Props>>> | null = DEV
  ? {
      v2: dynamic(() => import('./experience-v2').then((m) => m.ExperienceV2)),
      v3: dynamic(() => import('./experience-v3').then((m) => m.ExperienceV3)),
      v4: dynamic(() => import('./experience-v4').then((m) => m.ExperienceV4)),
      v5: dynamic(() => import('./experience-v5').then((m) => m.ExperienceV5)),
    }
  : null

const NAMES: Record<Variant, string> = {
  v1: 'Strips',
  v2: 'Radar',
  v3: 'Index',
  v4: 'Passes',
  v5: 'Departures',
}

export function ExperienceSection(props: Props) {
  const [v, setV] = useState<Variant>('v1')

  useEffect(() => {
    if (!DEV) return
    const q = new URLSearchParams(window.location.search).get('exp')
    if (q && q in NAMES) setV(q as Variant)
  }, [])

  const choose = (next: Variant) => {
    setV(next)
    const url = new URL(window.location.href)
    if (next === 'v1') url.searchParams.delete('exp')
    else url.searchParams.set('exp', next)
    url.hash = 'experience'
    window.history.replaceState(null, '', url)
    requestAnimationFrame(() =>
      document.getElementById('experience')?.scrollIntoView({ block: 'start' })
    )
  }

  const Chosen = (v !== 'v1' && VARIANTS?.[v]) || null
  return (
    <>
      {Chosen ? <Chosen {...props} /> : <Experience {...props} />}
      {DEV ? (
        <nav className="vn-exp-switch" aria-label="Experience variants (development only)">
          <span>Experience</span>
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
