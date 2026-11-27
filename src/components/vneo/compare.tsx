'use client'

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import './compare.css'

/*
 * Before and after, side by side on the real page (development only): each
 * proposed change to the home page can be flipped between the page as it is
 * ("old") and the proposal ("new") from a small panel in the corner, so the
 * choice is made by looking. The picks persist in this browser and can be
 * shared as ?old=loop,cards. Production always renders the new versions;
 * once Rami settles, the losing side of each change is deleted along with
 * this file.
 */

export type Change = 'glance' | 'cards' | 'community' | 'loop'
type Side = 'old' | 'new'

export const CHANGES: { id: Change; name: string; old: string; new: string }[] =
  [
    {
      id: 'glance',
      name: 'At a glance',
      old: 'The row of four facts',
      new: 'Gone; one line under the hero',
    },
    {
      id: 'cards',
      name: 'Selected projects',
      old: 'Mixed card shapes',
      new: 'One card format, 3 × 2',
    },
    {
      id: 'community',
      name: 'Community',
      old: 'Built for people + shared in person',
      new: 'Shared in person only',
    },
    {
      id: 'loop',
      name: 'Sense, decide, act',
      old: 'The 3D quad section',
      new: 'Gone',
    },
  ]

const DEV = process.env.NODE_ENV === 'development'
const KEY = 'vn-compare'

let picks: Partial<Record<Change, Side>> = {}
let loaded = false
const listeners = new Set<() => void>()

function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    picks = JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {}
  // a shared link wins: ?old=loop,cards shows those two as they are
  const q = new URLSearchParams(location.search).get('old')
  if (q !== null) {
    const old = new Set(q.split(',').filter(Boolean))
    for (const c of CHANGES) picks[c.id] = old.has(c.id) ? 'old' : 'new'
  }
}

function set(next: Partial<Record<Change, Side>>) {
  picks = { ...picks, ...next }
  try {
    localStorage.setItem(KEY, JSON.stringify(picks))
  } catch {}
  const url = new URL(location.href)
  const old = CHANGES.filter((c) => picks[c.id] === 'old').map((c) => c.id)
  if (old.length) url.searchParams.set('old', old.join(','))
  else url.searchParams.delete('old')
  history.replaceState(null, '', url)
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Which side of a change this page shows: always "new" outside development. */
export function useChoice(id: Change): Side {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!DEV) return 'new'
      load()
      return picks[id] ?? 'new'
    },
    () => 'new'
  )
}

/** Renders `old` or `neu` for a change, by the pick. */
export function Choose({
  id,
  old,
  neu,
}: {
  id: Change
  old: ReactNode
  neu: ReactNode
}) {
  return <>{useChoice(id) === 'old' ? old : neu}</>
}

const all = (s: Side) =>
  Object.fromEntries(CHANGES.map((c) => [c.id, s])) as Record<Change, Side>

/** The panel in the corner that flips each change (development only). */
export function ComparePanel() {
  const glance = useChoice('glance')
  const cards = useChoice('cards')
  const community = useChoice('community')
  const loop = useChoice('loop')
  // folded to a pill on a phone, where the open panel would cover the page
  const [open, setOpen] = useState(true)
  useEffect(() => {
    if (matchMedia('(max-width: 720px)').matches) setOpen(false)
  }, [])
  if (!DEV) return null
  const now: Record<Change, Side> = { glance, cards, community, loop }
  const jump: Record<Change, string> = {
    glance: 'top',
    cards: 'work',
    community: 'community',
    loop: 'laps',
  }
  const oldCount = CHANGES.filter((c) => now[c.id] === 'old').length
  if (!open)
    return (
      <button
        type="button"
        className="vn-compare-pill"
        onClick={() => setOpen(true)}
        aria-label="Open the before and after panel (development only)"
      >
        Compare{oldCount ? ` · ${oldCount} old` : ''}
      </button>
    )
  return (
    <aside
      className="vn-compare"
      aria-label="Compare the home page before and after (development only)"
    >
      <p className="vn-compare-h">
        Compare
        <span>
          <button type="button" onClick={() => setOpen(false)}>
            Hide
          </button>
          <button type="button" onClick={() => set(all('old'))}>
            All old
          </button>
          <button type="button" onClick={() => set(all('new'))}>
            All new
          </button>
        </span>
      </p>
      <ol>
        {CHANGES.map((c, i) => (
          <li key={c.id}>
            <a href={`#${jump[c.id]}`} className="vn-compare-name">
              <b>{i + 1}</b> {c.name}
              <small>{now[c.id] === 'old' ? c.old : c.new}</small>
            </a>
            <span className="vn-compare-seg" role="group" aria-label={c.name}>
              {(['old', 'new'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={now[c.id] === s}
                  onClick={() => set({ [c.id]: s })}
                >
                  {s === 'old' ? 'Old' : 'New'}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ol>
    </aside>
  )
}
