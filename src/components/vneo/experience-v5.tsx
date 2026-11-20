'use client'

import { gsap } from 'gsap'
import { X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react'

import { B, focusIn, hash } from '@/components/v7/tempo'
import type { BoardRole } from '@/content/vneo/experience-board'
import { experience as c } from '@/content/vneo/experience'

import { Slate } from './slate'
import './experience-v5.css'

/*
 * Experience, variant v5: the departures board. Not the controller's strips
 * but the public display in the terminal, made of split-flap tiles. Where I
 * work now is the top panel, in big tiles, its status lit; everything else
 * is logged under it, landed. When the board first comes into view its flaps
 * fall through the drum and settle on the text, row by row, an eighth note
 * apart at 96 BPM. Selecting a flight re-flips its row and opens the gate
 * information under the board (under the row on a phone).
 *
 * The tiles are drawn from data attributes: `data-c` is the character the
 * tile rests on (React's), `data-u` and `data-l` the top and bottom halves
 * while it moves (the flip engine's). Screen readers get a plain line per
 * flight instead.
 */

const TITLE = 'Departures.'
const HOT = 'Departures'
const GATE = 'xv5-gate'
/** Below this the board drops to flight, destination and status, the role beneath. */
const COMPACT = '(max-width: 859px)'

/** One flap falls in a sixteenth note; rows start an eighth note apart. */
const FLIP = B / 4
const ROW_GAP = B / 2
const TILE_GAP = 0.012

/** Tiles per column. */
const LEAD = { time: 4, call: 3, dest: 8, status: 8, role: 34 }
const REST = { time: 4, call: 3, dest: 11, role: 22, status: 11 }
const SMALL = { dest: 8, status: 6 }

/* ---------- fitting words into tiles ---------- */

const SHORT: [RegExp, string][] = [
  [/\bUNIVERSITY\b/g, 'UNIV'],
  [/\bASSISTANT\b/g, 'ASST'],
  [/\bOPERATIONS\b/g, 'OPS'],
  [/\bDEVELOPMENT\b/g, 'DEV'],
  [/\bENGINEER\b/g, 'ENG'],
  [/\bEMBEDDED\b/g, 'EMB'],
  [/\bSYSTEMS\b/g, 'SYS'],
  [/\bRESEARCH\b/g, 'RES'],
]

/**
 * The words in at most `n` tiles, the way a board abbreviates: "and" becomes
 * "&", a repeated noun is said once, long words shorten, and an organization
 * falls back to its initials. The full words stay in the row's label.
 */
function fit(text: string, n: number, initials = false) {
  let t = text
    .toUpperCase()
    .replace(/\s+AND\s+/g, ' & ')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  if (t.length <= n) return t
  // "lab assistant & teaching assistant": "lab & teaching assistant"
  t = t.replace(/(\S+) (\S+) & (\S+) \2\b/, '$1 & $3 $2')
  for (const [re, to] of SHORT) {
    if (t.length <= n) return t
    t = t.replace(re, to)
  }
  if (t.length <= n) return t
  if (initials) {
    const ini = text
      .split(/\s+/)
      .filter((w) => /^[A-Z]/.test(w))
      .map((w) => w[0])
      .join('')
    if (ini.length >= 2 && ini.length <= n) return ini
  }
  return t.slice(0, n).trimEnd()
}

/* ---------- the flip engine ---------- */

/** The drum every tile carries, in the order its flaps fall. */
const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&-./'"

const UP: Keyframe[] = [
  { transform: 'rotateX(0deg)', easing: 'cubic-bezier(0.55, 0, 0.9, 0.5)' },
  { transform: 'rotateX(-90deg)', offset: 0.48 },
  { transform: 'rotateX(-90deg)' },
]
const DOWN: Keyframe[] = [
  { transform: 'rotateX(90deg)' },
  {
    transform: 'rotateX(90deg)',
    offset: 0.48,
    easing: 'cubic-bezier(0.25, 0.6, 0.5, 1)',
  },
  { transform: 'rotateX(0deg)', offset: 0.84, easing: 'ease-out' },
  { transform: 'rotateX(10deg)', offset: 0.92, easing: 'ease-in' },
  { transform: 'rotateX(0deg)' },
]

const gens = new WeakMap<HTMLElement, number>()
const sleep = (s: number) =>
  new Promise<void>((done) => setTimeout(done, Math.max(0, s) * 1000))
const reduced = () =>
  matchMedia('(prefers-reduced-motion: reduce)').matches

/** The last `flips` steps of the drum before `target`, ending on it. */
function steps(target: string, flips: number) {
  const i = DRUM.indexOf(target)
  const out: string[] = []
  for (let k = flips - 1; k >= 1; k--)
    out.push(
      i < 0
        ? DRUM[1 + ((k * 7 + target.charCodeAt(0)) % 26)]
        : DRUM[(i - k + DRUM.length) % DRUM.length]
    )
  out.push(target)
  return out
}

/** Stop a tile wherever it is and let it rest on its own character. */
function settle(tile: HTMLElement) {
  gens.set(tile, (gens.get(tile) ?? 0) + 1)
  tile.querySelectorAll('.xv5-f').forEach((f) => {
    f.getAnimations().forEach((a) => a.cancel())
    f.remove()
  })
  delete tile.dataset.u
  delete tile.dataset.l
}

/** Flip a tile through `seq`, one flap at a time: the top falls, the bottom lands. */
async function spin(
  tile: HTMLElement,
  seq: string[],
  delay: number,
  alive: () => boolean
) {
  const from = tile.dataset.l ?? tile.dataset.c ?? ' '
  settle(tile)
  const gen = gens.get(tile)
  const mine = () => alive() && gens.get(tile) === gen
  // hold the character it was showing while it waits its turn
  tile.dataset.u = from
  tile.dataset.l = from
  if (delay > 0) await sleep(delay)
  if (!mine()) return
  const top = document.createElement('i')
  const bottom = document.createElement('i')
  top.className = 'xv5-f xv5-fu'
  bottom.className = 'xv5-f xv5-fl'
  tile.append(top, bottom)
  let cur = from
  for (const next of seq) {
    if (next === cur) continue
    top.textContent = cur
    bottom.textContent = next
    tile.dataset.u = next
    const fall = top.animate(UP, { duration: FLIP * 1000, fill: 'both' })
    bottom.animate(DOWN, { duration: FLIP * 1000, fill: 'both' })
    try {
      await fall.finished
    } catch {
      return
    }
    if (!mine()) return
    tile.dataset.l = next
    cur = next
  }
  top.remove()
  bottom.remove()
  delete tile.dataset.u
  delete tile.dataset.l
}

/** A row's tiles, left to right: the first time a few turns of the drum, after that two. */
function flipRow(
  row: HTMLElement,
  delay: number,
  first: boolean,
  alive: () => boolean
) {
  const seed = Number(row.dataset.i ?? 0) + 1
  row
    .querySelectorAll<HTMLElement>('.xv5-hit .xv5-t')
    .forEach((t, j) => {
      const target = t.dataset.c ?? ' '
      if (!t.offsetParent || target === ' ') return settle(t)
      const h = hash(j, seed)
      spin(
        t,
        steps(target, first ? 3 + Math.floor(h * 4) : 2),
        delay + j * TILE_GAP + (first ? h * 0.05 : 0),
        alive
      )
    })
}

/* ---------- the board ---------- */

function useCompact() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const mq = matchMedia(COMPACT)
    const set = () => setOn(mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])
  return on
}

export function ExperienceV5({
  roles,
  now,
}: {
  roles: BoardRole[]
  now: number
}) {
  const board = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState<string | null>(null)
  const compact = useCompact()
  const mounted = useRef(false)
  const alive = useCallback(() => mounted.current, [])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // only the roles kept; community work is a line under the board
  const kept = roles.filter((r) => r.kept)
  const lead = kept.filter((r) => r.lead && !r.side)
  const end = (r: BoardRole) => (r.to === 'now' ? now : r.to)
  const rest = kept
    .filter((r) => !r.lead && !r.side)
    .sort(
      (a, b) => end(b) - end(a) || (b.from ?? now) - (a.from ?? now)
    )
  const side = kept
    .filter((r) => r.side)
    .sort((a, b) => (b.from ?? now) - (a.from ?? now))
  const picked = kept.find((r) => r.id === on) ?? null

  // first sight: the board rests blank, then each panel lands row by row
  useEffect(() => {
    const el = board.current
    if (!el || reduced()) return
    let live = true
    const still = () => live && mounted.current
    const tiles = el.querySelectorAll<HTMLElement>('.xv5-row .xv5-t')
    tiles.forEach((t) => {
      t.dataset.u = ' '
      t.dataset.l = ' '
    })
    // rows keep one beat-tied queue, so two panels in view at once land in turn
    let clock = 0
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          io.unobserve(e.target)
          let at = Math.max(performance.now(), clock)
          e.target
            .querySelectorAll<HTMLElement>('.xv5-row')
            .forEach((row) => {
              flipRow(row, (at - performance.now()) / 1000, true, still)
              at += ROW_GAP * 1000
            })
          clock = at
        }
      },
      { rootMargin: '0px 0px -18% 0px' }
    )
    el.querySelectorAll('.xv5-panel').forEach((p) => io.observe(p))
    return () => {
      live = false
      io.disconnect()
      tiles.forEach(settle)
    }
  }, [])

  const pick = (id: string, row: HTMLElement | null) => {
    const opening = on !== id
    setOn(opening ? id : null)
    if (opening && row && !reduced()) flipRow(row, 0, false, alive)
  }

  const close = useCallback(() => {
    if (!on) return
    const id = on
    setOn(null)
    requestAnimationFrame(() =>
      board.current
        ?.querySelector<HTMLButtonElement>(`[data-id="${id}"] .xv5-hit`)
        ?.focus()
    )
  }, [on])

  // bring the gate into view when it opens below the fold, never pushing its
  // top (or, on a phone, the chosen row) under the top bar
  useEffect(() => {
    if (!on) return
    const id = requestAnimationFrame(() => {
      const g = document.getElementById(GATE)
      if (!g) return
      const box = g.getBoundingClientRect()
      const row = compact
        ? board.current?.querySelector(`[data-id="${on}"]`)
        : null
      const ceiling = (row ?? g).getBoundingClientRect().top - 88
      const by = Math.min(box.bottom - innerHeight + 24, ceiling)
      if (by > 0)
        scrollBy({ top: by, behavior: reduced() ? 'auto' : 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [on, compact])

  const keys = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && on) {
      e.preventDefault()
      close()
      return
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const hits = Array.from(
      board.current?.querySelectorAll<HTMLButtonElement>('.xv5-hit') ?? []
    )
    const i = hits.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    e.preventDefault()
    hits[(i + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length]?.focus()
  }

  const gate = (r: BoardRole) => (
    <Gate key={r.id} r={r} close={close} alive={alive} />
  )

  let i = 0
  const rows = (list: BoardRole[], isLead: boolean) =>
    list.map((r) => (
      <Row
        key={r.id}
        r={r}
        i={i++}
        lead={isLead}
        on={on === r.id}
        pick={pick}
      >
        {compact && on === r.id ? gate(r) : null}
      </Row>
    ))

  return (
    <section
      id="experience"
      className="vn-xv5"
      aria-labelledby="exp-h"
      data-on={on ?? undefined}
      onKeyDown={keys}
    >
      <Slate no={c.no} label={c.label} title={TITLE} hot={HOT} id="exp-h">
        <p className="xv5-lede">{c.lede}</p>
      </Slate>

      <div ref={board} className="xv5-board">
        <div className="xv5-panel is-lead">
          <h3>
            <i className="xv5-lamp" aria-hidden="true" />
            {c.bays.lead}
          </h3>
          <Labels
            desk={[
              ['Time', LEAD.time],
              ['Flight', LEAD.call],
              ['Destination', LEAD.dest],
              ['Status', LEAD.status],
            ]}
            small={[
              ['Flight', LEAD.call],
              ['Destination', SMALL.dest],
            ]}
          />
          <ol className="xv5-rows">{rows(lead, true)}</ol>
        </div>

        <div className="xv5-panel is-rest">
          <h3>{c.bays.rest}</h3>
          <Labels
            desk={[
              ['Time', REST.time],
              ['Flight', REST.call],
              ['Destination', REST.dest],
              ['Role', REST.role],
              ['Status', REST.status],
            ]}
            small={[
              ['Flight', REST.call],
              ['Destination', SMALL.dest],
              ['Status', SMALL.status],
            ]}
          />
          <ol className="xv5-rows">{rows(rest, false)}</ol>
        </div>

        <p className="xv5-hint" aria-hidden="true">
          Select a flight for more
        </p>
      </div>

      {!compact && picked ? gate(picked) : null}

      {side.length ? (
        <p className="xv5-also">
          <span className="xv5-also-label">{c.also.label}</span>
          {side.map((r) => (
            <a key={r.id} href="#community">
              <span className="xv5-also-call" aria-hidden="true">
                <Tiles text={r.call} n={3} />
              </span>
              {r.org}
              <small>{r.when}</small>
            </a>
          ))}
          <a className="xv5-also-to" href="#community">
            {c.also.to}
          </a>
        </p>
      ) : null}
    </section>
  )
}

function Tiles({ text, n }: { text: string; n: number }) {
  const s = Array.from(text.toUpperCase().padEnd(n, ' ')).slice(0, n)
  return (
    <>
      {s.map((ch, i) => (
        <span key={i} className="xv5-t" data-c={ch} />
      ))}
    </>
  )
}

function Col({
  k,
  n,
  text,
  at,
  lit,
}: {
  k: string
  n: number
  text: string
  /** only on the full board, or only on the compact one */
  at?: 'desk' | 'small'
  lit?: boolean
}) {
  return (
    <span
      className={`xv5-col xv5-c-${k}`}
      data-at={at}
      data-lit={lit ? '' : undefined}
    >
      <Tiles text={text} n={n} />
    </span>
  )
}

function Labels({
  desk,
  small,
}: {
  desk: [string, number][]
  small: [string, number][]
}) {
  return (
    <>
      {(
        [
          ['desk', desk],
          ['small', small],
        ] as const
      ).map(([at, set]) => (
        <p key={at} className="xv5-labels" data-at={at} aria-hidden="true">
          {set.map(([label, n]) => (
            <span key={label} style={{ '--n': n } as CSSProperties}>
              {label}
            </span>
          ))}
        </p>
      ))}
    </>
  )
}

function Row({
  r,
  i,
  lead,
  on,
  pick,
  children,
}: {
  r: BoardRole
  i: number
  lead: boolean
  on: boolean
  pick: (id: string, row: HTMLElement | null) => void
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLLIElement>(null)
  const live = r.to === 'now'
  const L = lead ? LEAD : REST
  const time = r.from !== undefined ? String(Math.floor(r.from)) : c.now
  const landed = r.to === 'now' ? '' : String(Math.floor(r.to))
  const dest = fit(r.org, L.dest, true)
  const destSmall = fit(r.org, SMALL.dest, true)
  const since =
    r.from !== undefined ? `${c.strip.since} ${Math.floor(r.from)}` : c.now

  return (
    <li
      ref={ref}
      className="xv5-row"
      data-id={r.id}
      data-i={i}
      data-live={live ? '' : undefined}
      data-on={on ? '' : undefined}
    >
      <button
        type="button"
        className="xv5-hit"
        aria-expanded={on}
        aria-controls={on ? GATE : undefined}
        data-lock={on ? 'Close' : 'Open'}
        onClick={() => pick(r.id, ref.current)}
      >
        <span className="v7-vh">
          {r.org}
          {r.orgLong ? `, ${r.orgLong}` : ''}: {r.role}, {r.when}
        </span>
        <span className="xv5-cols" aria-hidden="true">
          <Col k="time" n={L.time} text={time} at="desk" />
          <Col k="call" n={L.call} text={r.call} />
          {dest === destSmall ? (
            <Col k="dest" n={L.dest} text={dest} />
          ) : (
            <>
              <Col k="dest" n={L.dest} text={dest} at="desk" />
              <Col k="dest" n={SMALL.dest} text={destSmall} at="small" />
            </>
          )}
          {!lead ? (
            <Col k="role" n={REST.role} text={fit(r.role, REST.role)} at="desk" />
          ) : null}
          <Col
            k="status"
            n={L.status}
            text={live ? 'AIRBORNE' : `LANDED ${landed}`}
            at="desk"
            lit={live}
          />
          {!lead ? (
            <Col
              k="status"
              n={SMALL.status}
              text={live ? 'NOW' : 'LANDED'}
              at="small"
              lit={live}
            />
          ) : null}
        </span>
        {lead ? (
          <span className="xv5-cols xv5-roleline" data-at="desk" aria-hidden="true">
            <Col k="role" n={LEAD.role} text={fit(r.role, LEAD.role)} />
          </span>
        ) : null}
        <span className="xv5-sub" aria-hidden="true">
          {r.role}
          <small data-lit={lead ? '' : undefined}>
            {lead ? <i className="xv5-lamp" /> : null}
            {lead ? since : r.when}
          </small>
        </span>
      </button>
      {children}
    </li>
  )
}

/* ---------- the gate information ---------- */

function Gate({
  r,
  close,
  alive,
}: {
  r: BoardRole
  close: () => void
  alive: () => boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  // the callsign flaps in and the rest comes into focus
  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) return
    let live = true
    const tiles = el.querySelectorAll<HTMLElement>('.xv5-gate-call .xv5-t')
    tiles.forEach((t, j) => {
      t.dataset.u = ' '
      t.dataset.l = ' '
      spin(t, steps(t.dataset.c ?? ' ', 4 + j), 0.1 + j * 0.08, () => live && alive())
    })
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      focusIn(tl, el.querySelectorAll('.xv5-gin'), 0.15, {
        y: 10,
        blur: 8,
        ca: 6,
        stagger: 0.16 * B,
      })
    }, el)
    return () => {
      live = false
      ctx.revert()
      tiles.forEach(settle)
    }
  }, [alive])

  return (
    <div
      ref={ref}
      id={GATE}
      className="xv5-gate"
      role="region"
      aria-labelledby={`${GATE}-h`}
    >
      <div className="xv5-gate-head">
        <span className="xv5-gate-call" aria-hidden="true">
          <Tiles text={r.call} n={3} />
        </span>
        <div className="xv5-gate-id xv5-gin">
          <h3 id={`${GATE}-h`} className="fx">
            {r.org}
            {r.orgLong ? <small>{r.orgLong}</small> : null}
          </h3>
          <p>
            {r.role}
            <span>{r.kindName}</span>
          </p>
        </div>
        <button
          type="button"
          className="xv5-gate-x"
          onClick={close}
          data-lock="Close"
        >
          <X aria-hidden="true" size={18} strokeWidth={1.75} />
          <span className="v7-vh">Close {r.org}</span>
        </button>
      </div>

      <div className="xv5-gate-body">
        <div className="xv5-gate-main xv5-gin">
          <p className="xv5-gate-note">{r.note}</p>
          {r.more ? <p className="xv5-gate-more">{r.more}</p> : null}
        </div>
        <dl className="xv5-gate-fields xv5-gin">
          <div>
            <dt>When</dt>
            <dd>{r.when}</dd>
          </div>
          {r.where ? (
            <div>
              <dt>Where</dt>
              <dd>{r.where}</dd>
            </div>
          ) : null}
          {r.with?.length ? (
            <div>
              <dt>{c.strip.with}</dt>
              <dd>{r.with.join(', ')}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {r.projects.length || r.writing.length || r.href ? (
        <div className="xv5-gate-out xv5-gin">
          {r.projects.length ? (
            <div>
              <p className="xv5-gate-k">{c.strip.projects}</p>
              <ul className="xv5-gate-work">
                {r.projects.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href}>
                      {p.image ? (
                        <span className="xv5-thumb">
                          <Image
                            src={p.image.src}
                            alt=""
                            fill
                            sizes="128px"
                            style={{ objectPosition: p.image.position }}
                          />
                        </span>
                      ) : null}
                      <span>{p.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {r.writing.length ? (
            <div>
              <p className="xv5-gate-k">{c.strip.writing}</p>
              <p className="xv5-gate-links">
                {r.writing.map((w) => (
                  <Link key={w.href} href={w.href}>
                    {w.title}
                  </Link>
                ))}
              </p>
            </div>
          ) : null}
          {r.href ? (
            <p className="xv5-gate-links xv5-gate-site">
              <a href={r.href} target="_blank" rel="noopener">
                {c.strip.site} {r.org}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
