'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { BoardRole } from '@/content/vneo/experience-board'
import { experience as c } from '@/content/vneo/experience'

import { Slate } from './slate'
import './experience.css'

/*
 * Experience as a flight-strip board, the way a tower keeps its traffic.
 * First the flight paths: every role a contrail from the year it started to
 * the year it ended, in the order they took off; the ones still flying run
 * into the "now" line and blink there like a transponder. Pointing at a
 * contrail lights its strip and the other way round. Then the strips: the
 * places I work now as big strips, everything else logged under them, each
 * opening to what I did there and what came out of it.
 *
 * In development only, each strip can be kept or dropped and a title chosen,
 * and the dock copies the picks, so the board can be decided by looking at it.
 */

const PICKING = process.env.NODE_ENV === 'development'
const PICKS_KEY = 'vn-exp-picks'
const START = 2021

type Picks = Record<string, { keep: boolean; role?: string }>

const isNow = (r: BoardRole) => r.to === 'now'
const isPoint = (r: BoardRole) => r.to !== 'now' && r.to === r.from

/** "2024" for a whole year, the printed dates otherwise */
const since = (r: BoardRole) =>
  r.from === undefined ? c.strip.unknown : String(Math.floor(r.from))

export function Experience({
  roles,
  now,
}: {
  roles: BoardRole[]
  now: number
}) {
  const root = useRef<HTMLElement>(null)
  const [hot, setHot] = useState<string | null>(null)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [picks, setPicks] = useState<Picks>({})

  // the picker remembers its choices in this browser
  useEffect(() => {
    if (!PICKING) return
    try {
      const saved = localStorage.getItem(PICKS_KEY)
      if (saved) setPicks(JSON.parse(saved) as Picks)
    } catch {}
  }, [])
  const pick = useCallback((id: string, p: Partial<Picks[string]>) => {
    setPicks((all) => {
      const next = { ...all, [id]: { ...{ keep: true }, ...all[id], ...p } }
      try {
        localStorage.setItem(PICKS_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const kept = useCallback(
    (r: BoardRole) => picks[r.id]?.keep ?? r.kept,
    [picks]
  )
  const title = useCallback(
    (r: BoardRole) => (PICKING && picks[r.id]?.role) || r.role,
    [picks]
  )

  // the contrails draw in once, on first sight
  useEffect(() => {
    const el = root.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.seen = ''
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.seen = ''
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -25% 0px' }
    )
    const chart = el.querySelector('.vn-exp-chart')
    if (chart) io.observe(chart)
    return () => io.disconnect()
  }, [])

  // contrails in take-off order; roles whose start is not settled yet sit just before now
  const flights = useMemo(
    () =>
      [...roles].sort(
        (a, b) => (a.from ?? now - 0.3) - (b.from ?? now - 0.3)
      ),
    [roles, now]
  )
  const span = now - START
  const x = (year: number) =>
    `${(Math.max(0, Math.min(year, now) - START) / span) * 100}%`
  const years = Array.from(
    { length: Math.floor(now) - START + 1 },
    (_, i) => START + i
  )

  const lead = roles.filter((r) => r.lead)
  const rest = roles
    .filter((r) => !r.lead)
    .sort((a, b) => {
      const end = (r: BoardRole) => (r.to === 'now' ? now : r.to)
      return end(b) - end(a) || (b.from ?? now) - (a.from ?? now)
    })

  const show = (id: string) => {
    setOpen((o) => ({ ...o, [id]: true }))
    requestAnimationFrame(() =>
      document
        .getElementById(`strip-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    )
  }

  const hotRole = roles.find((r) => r.id === hot)

  return (
    <section
      ref={root}
      id="experience"
      className="vn-exp"
      aria-labelledby="exp-h"
      data-hot={hot ?? undefined}
    >
      <Slate no={c.no} label={c.label} title={c.title} hot={c.hot} id="exp-h">
        <p className="vn-exp-lede">{c.lede}</p>
      </Slate>

      <figure
        className="vn-exp-chart"
        style={{ '--rows': flights.length } as React.CSSProperties}
      >
        <p className="vn-exp-readout" aria-hidden="true">
          {hotRole ? (
            <>
              <b>{hotRole.call}</b>
              <span>{hotRole.org}</span>
              <span>{title(hotRole)}</span>
              <span>{hotRole.when}</span>
            </>
          ) : (
            <span className="vn-exp-readout-idle">{c.chart.label}</span>
          )}
        </p>
        {/* the strips below say everything the chart does: it is for the eye and the pointer */}
        <ol className="vn-exp-paths" aria-hidden="true">
          {flights.map((r, i) => {
            const from = r.from ?? now - 0.3
            const to = r.to === 'now' ? now : r.to
            return (
              <li
                key={r.id}
                className="vn-exp-path"
                data-id={r.id}
                data-now={isNow(r) ? '' : undefined}
                data-point={isPoint(r) ? '' : undefined}
                data-unsure={r.from === undefined ? '' : undefined}
                data-dropped={kept(r) ? undefined : ''}
                data-hot={hot === r.id ? '' : undefined}
                style={{ '--i': i } as React.CSSProperties}
              >
                <button
                  type="button"
                  className="vn-exp-path-hit"
                  tabIndex={-1}
                  onPointerEnter={(e) => e.pointerType === 'touch' || setHot(r.id)}
                  onPointerLeave={() => setHot(null)}
                  onClick={() => show(r.id)}
                  aria-label={`${r.org}, ${title(r)}, ${r.when}`}
                >
                  <span className="vn-exp-call">{r.call}</span>
                  <span className="vn-exp-track">
                    <span
                      className="vn-exp-trail"
                      style={{
                        left: x(from),
                        width: `calc(${x(to)} - ${x(from)})`,
                      }}
                    />
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <div className="vn-exp-axis" aria-hidden="true">
          <span className="vn-exp-call" />
          <span className="vn-exp-track">
            {years.map((y) => (
              <span key={y} className="vn-exp-year" style={{ left: x(y) }}>
                {y}
              </span>
            ))}
            <span className="vn-exp-nowmark">{c.chart.now}</span>
          </span>
        </div>
      </figure>

      <div className="vn-exp-bay is-lead">
        <h3>{c.bays.lead}</h3>
        <ol>
          {lead.map((r) => (
            <Strip
              key={r.id}
              r={r}
              lead
              open
              title={title(r)}
              kept={kept(r)}
              hot={hot === r.id}
              onHot={setHot}
              pick={pick}
            />
          ))}
        </ol>
      </div>

      <div className="vn-exp-bay">
        <h3>{c.bays.rest}</h3>
        <ol>
          {rest.map((r) => (
            <Strip
              key={r.id}
              r={r}
              open={!!open[r.id]}
              onToggle={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
              title={title(r)}
              kept={kept(r)}
              hot={hot === r.id}
              onHot={setHot}
              pick={pick}
            />
          ))}
        </ol>
      </div>

      {PICKING ? (
        <PickDock roles={roles} kept={kept} title={title} reset={() => {
          setPicks({})
          try {
            localStorage.removeItem(PICKS_KEY)
          } catch {}
        }} />
      ) : null}
    </section>
  )
}

function Strip({
  r,
  lead,
  open,
  onToggle,
  title,
  kept,
  hot,
  onHot,
  pick,
}: {
  r: BoardRole
  lead?: boolean
  open: boolean
  onToggle?: () => void
  title: string
  kept: boolean
  hot: boolean
  onHot: (id: string | null) => void
  pick: (id: string, p: { keep?: boolean; role?: string }) => void
}) {
  const detail = `strip-${r.id}-more`
  return (
    <li
      id={`strip-${r.id}`}
      className={`vn-strip${lead ? ' is-lead' : ''}`}
      data-now={isNow(r) ? '' : undefined}
      data-open={open ? '' : undefined}
      data-hot={hot ? '' : undefined}
      data-dropped={kept ? undefined : ''}
      onPointerEnter={(e) => e.pointerType === 'touch' || onHot(r.id)}
      onPointerLeave={() => onHot(null)}
    >
      <div className="vn-strip-head">
        <span className="vn-strip-call" aria-hidden="true">
          {r.call}
          {isNow(r) ? <i className="vn-strip-live">{c.now}</i> : null}
        </span>
        <div className="vn-strip-id">
          <p className="vn-strip-org">
            {r.org}
            {r.orgLong ? <span> {r.orgLong}</span> : null}
          </p>
          <h4 className="vn-strip-role">{title}</h4>
          {lead ? <p className="vn-strip-note">{r.note}</p> : null}
        </div>
        <span className="vn-strip-when">
          {lead && isNow(r) ? (
            <>
              <small>{c.strip.since}</small>
              {since(r)}
            </>
          ) : (
            r.when
          )}
        </span>
        <span className="vn-strip-kind">{r.kindName}</span>
        {!lead ? (
          <button
            type="button"
            className="vn-strip-toggle"
            aria-expanded={open}
            aria-controls={detail}
            onClick={onToggle}
          >
            <span className="v7-vh">
              {open ? c.strip.close : c.strip.open}: {r.org}, {title}
            </span>
          </button>
        ) : null}
      </div>

      <div className="vn-strip-more" id={detail} hidden={!open && !lead}>
        <div className="vn-strip-more-in">
          {!lead ? <p className="vn-strip-note">{r.note}</p> : null}
          {r.more ? <p className="vn-strip-text">{r.more}</p> : null}
          {r.where || r.with?.length ? (
            <dl className="vn-strip-fields">
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
          ) : null}
          {r.projects.length ? (
            <ul className="vn-strip-work" aria-label={c.strip.projects}>
              {r.projects.map((p) => (
                <li key={p.href}>
                  <Link href={p.href}>
                    {p.image ? (
                      <span className="vn-strip-thumb">
                        <Image
                          src={p.image.src}
                          alt=""
                          fill
                          sizes="96px"
                          style={{ objectPosition: p.image.position }}
                        />
                      </span>
                    ) : null}
                    <span>{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {r.writing.length || r.href ? (
            <p className="vn-strip-links">
              {r.writing.map((w) => (
                <Link key={w.href} href={w.href}>
                  {w.title}
                </Link>
              ))}
              {r.href ? (
                <a href={r.href} target="_blank" rel="noopener">
                  {c.strip.site} {r.org}
                </a>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>

      {PICKING ? (
        <div className="vn-strip-pick">
          <button
            type="button"
            aria-pressed={kept}
            onClick={() => pick(r.id, { keep: !kept })}
          >
            {kept ? 'Keep' : 'Dropped'}
          </button>
          {r.roles?.length ? (
            <select
              value={title}
              onChange={(e) => pick(r.id, { keep: kept, role: e.target.value })}
              aria-label={`Title at ${r.org}`}
            >
              {r.roles.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          ) : null}
          {r.pending ? (
            <span className="vn-strip-pending">
              Not public yet{r.open ? `: ${r.open}` : ''}
            </span>
          ) : r.open ? (
            <span className="vn-strip-pending">To settle: {r.open}</span>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

function PickDock({
  roles,
  kept,
  title,
  reset,
}: {
  roles: BoardRole[]
  kept: (r: BoardRole) => boolean
  title: (r: BoardRole) => string
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)
  const keep = roles.filter(kept)
  const drop = roles.filter((r) => !kept(r))
  const text = [
    'Flight log picks',
    `Keep (${keep.length}): ${keep.map((r) => `${r.call} ${r.org}, ${title(r)}`).join('; ')}`,
    `Drop (${drop.length}): ${drop.map((r) => `${r.call} ${r.org}`).join('; ') || 'none'}`,
  ].join('\n')
  return (
    <div className="vn-exp-dock" role="region" aria-label="Pick the roles to keep">
      <span>
        Picking roles: <b>{keep.length}</b> of {roles.length} kept
      </span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(text).then(
            () => {
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            },
            () => {}
          )
        }}
      >
        {copied ? 'Copied' : 'Copy my picks'}
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
      <output hidden data-picks={text} />
    </div>
  )
}
