'use client'

import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { B, focusIn } from '@/components/v7/tempo'
import type { BoardRole } from '@/content/vneo/experience-board'
import { experience as c, kindLabel, type RoleKind } from '@/content/vneo/experience'

import { Slate } from './slate'
import './experience-v2.css'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrambleTextPlugin)

/*
 * Experience as a radar scope, the way a ground station watches its traffic.
 * The centre is now and every ring a year further back, out to 2021. Each
 * role is a contact on its own bearing, grouped by kind into sectors: its
 * track runs in from the ring of the year it started to the ring of the year
 * it ended, and the ones still going reach the centre. A sweep turns once
 * every two bars and leaves a phosphor afterglow on what it passes; on first
 * sight its first turn is what finds the contacts. Pointing at a contact (or
 * focusing, or tapping it) reads it out beside the scope. Where I work now is
 * listed next to it as plain text, for anyone who only skims. Community work
 * sits outside the range, as faint marks and one line pointing to its section.
 */

const START = 2021
/** the scope in viewBox units: the outer ring (2021) and the now disc */
const R = 420
const R0 = 52
/** recent years get more room: the range scale is (years back)^GAMMA */
const GAMMA = 0.72
/** sectors in this order, clockwise from north; community (side) roles last, outside the range */
const SECTORS: RoleKind[] = ['work', 'research', 'venture', 'teaching', 'study', 'community']
const SLOT = 1
const SIDE_SLOT = 0.7
const GAP = 1
/** one turn of the sweep: two bars, five seconds */
const TURN = 8 * B
const LABEL_R = R + 36

const CAPTION = 'Now is the centre; each ring is a year back.'
const IN_RANGE = 'In range now'

type Anchor = 'r' | 'l' | 't' | 'b'

interface Contact {
  r: BoardRole
  bearing: number
  /** the radius where it ended (the centre's edge while it is still going) */
  head: number
  /** the radius where it started */
  tail: number
  going: boolean
  unsure: boolean
  tag: { x: number; y: number; a: Anchor }
}

interface Sector {
  key: string
  name: string
  from: number
  to: number
  side: boolean
}

const rad = (d: number) => (d * Math.PI) / 180
const fix = (n: number) => Math.round(n * 100) / 100
/** a point at a bearing (0 = north, clockwise) and a range, in viewBox units */
const at = (bearing: number, r: number): [number, number] => [
  fix(Math.sin(rad(bearing)) * r),
  fix(-Math.cos(rad(bearing)) * r),
]
const pct = (v: number) => `${((v + 500) / 10).toFixed(3)}%`

function arc(r: number, a0: number, a1: number, reverse = false) {
  const [x0, y0] = at(a0, r)
  const [x1, y1] = at(a1, r)
  const large = a1 - a0 > 180 ? 1 : 0
  return reverse
    ? `M${x1} ${y1}A${r} ${r} 0 ${large} 0 ${x0} ${y0}`
    : `M${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

function layout(roles: BoardRole[], now: number) {
  const span = Math.max(1, now - START)
  const range = (year: number) =>
    R0 + (R - R0) * Math.pow(Math.min(1, Math.max(0, (now - year) / span)), GAMMA)
  const end = (r: BoardRole) => (r.to === 'now' ? now : r.to)
  // where I work now first, in the record's order; then the latest first
  const order = (a: BoardRole, b: BoardRole) =>
    Number(!!b.lead) - Number(!!a.lead) ||
    (a.lead && b.lead ? roles.indexOf(a) - roles.indexOf(b) : 0) ||
    end(b) - end(a) ||
    (b.from ?? now) - (a.from ?? now)

  const main = roles.filter((r) => r.kept && !r.side)
  const side = roles.filter((r) => r.kept && r.side).sort(order)
  const groups = SECTORS.map((k) => ({
    key: k as string,
    name: kindLabel[k],
    roles: main.filter((r) => r.kind === k).sort(order),
    side: false,
  })).filter((g) => g.roles.length)
  if (side.length)
    groups.push({ key: 'side', name: kindLabel.community, roles: side, side: true })

  const units = groups.reduce(
    (s, g) => s + g.roles.length * (g.side ? SIDE_SLOT : SLOT) + GAP,
    0
  )
  const deg = 360 / Math.max(units, 1)
  const sectors: Sector[] = []
  const contacts: Contact[] = []
  const marks: { r: BoardRole; bearing: number }[] = []
  let u = GAP / 2
  for (const g of groups) {
    const w = g.side ? SIDE_SLOT : SLOT
    const from = u
    g.roles.forEach((r, i) => {
      const bearing = fix((u + w * (i + 0.5)) * deg)
      if (g.side) {
        marks.push({ r, bearing })
        return
      }
      const going = r.to === 'now'
      const unsure = r.from === undefined
      const head = going ? R0 : range(end(r))
      // a start not settled yet: a short dashed track off the centre
      let tail = unsure ? head + 62 : range(Math.min(r.from!, end(r)))
      if (tail - head < 8) tail = head
      // the data tag sits just beyond where the contact came into range
      const s = Math.sin(rad(bearing))
      const y = -Math.cos(rad(bearing))
      let a: Anchor = Math.abs(s) >= 0.4 ? (s > 0 ? 'r' : 'l') : y < 0 ? 't' : 'b'
      let [tx, ty] = at(bearing, tail + 16)
      // a long track lying across the scope near the rim: the tag rides above its middle
      if (tail > 0.7 * R && Math.abs(s) > 0.75) {
        ;[tx, ty] = at(bearing, (head + tail) / 2)
        ty = fix(ty - 16)
        a = 't'
      }
      contacts.push({
        r,
        bearing,
        head: fix(head),
        tail: fix(tail),
        going,
        unsure,
        tag: { x: tx, y: ty, a },
      })
    })
    u += g.roles.length * w
    sectors.push({ key: g.key, name: g.name, from: from * deg, to: u * deg, side: g.side })
    u += GAP
  }

  const rings: { year: number; r: number }[] = []
  for (let y = Math.floor(now); y >= START; y--) {
    const r = range(y)
    if (r - R0 > 24) rings.push({ year: y, r: fix(r) })
  }
  // the gaps between sectors, where the faint sector lines run
  const bounds = sectors.map((s) => fix(s.from - (GAP / 2) * deg))
  return { sectors, contacts, marks, rings, bounds }
}

/** the scale's ticks around the rim: every 5 degrees, longer every 30 */
const TICKS = (() => {
  let d = ''
  for (let a = 0; a < 360; a += 5) {
    const [x0, y0] = at(a, R - (a % 30 === 0 ? 14 : 6))
    const [x1, y1] = at(a, R)
    d += `M${x0} ${y0}L${x1} ${y1}`
  }
  return d
})()

const since = (r: BoardRole) =>
  r.from !== undefined ? `${c.strip.since} ${Math.floor(r.from)}` : c.now

export function ExperienceV2({ roles, now }: { roles: BoardRole[]; now: number }) {
  const root = useRef<HTMLElement>(null)
  const disc = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const { sectors, contacts, marks, rings, bounds } = useMemo(
    () => layout(roles, now),
    [roles, now]
  )
  const lead = useMemo(
    () => roles.filter((r) => r.kept && r.lead && !r.side),
    [roles]
  )
  const side = useMemo(
    () =>
      roles
        .filter((r) => r.kept && r.side)
        .sort((a, b) => (b.from ?? now) - (a.from ?? now)),
    [roles, now]
  )
  // the tags in reading order: where I work now first, then the rest, latest first
  const tagOrder = useMemo(
    () =>
      [...contacts].sort((a, b) => {
        const end = (r: BoardRole) => (r.to === 'now' ? now : r.to)
        return (
          Number(!!b.r.lead) - Number(!!a.r.lead) ||
          (a.r.lead && b.r.lead ? roles.indexOf(a.r) - roles.indexOf(b.r) : 0) ||
          end(b.r) - end(a.r) ||
          (b.r.from ?? now) - (a.r.from ?? now)
        )
      }),
    [contacts, roles, now]
  )

  const [sel, setSel] = useState<string | null>(
    lead[0]?.id ?? contacts[0]?.r.id ?? null
  )
  const [peek, setPeek] = useState<string | null>(null)
  // viewBox units per CSS pixel, so lines and labels keep their size at any width
  const [k, setK] = useState(0.62)
  const px = (n: number) => fix(n / k)

  const shownId = peek ?? sel
  const shown = roles.find((r) => r.id === shownId)

  useEffect(() => {
    const el = disc.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width
      if (w) setK(Math.round((w / 1000) * 1000) / 1000)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const select = useCallback((id: string, fromScope = false) => {
    setSel(id)
    setPeek(null)
    // on a phone the readout is under the scope: bring it up if it is out of sight
    const el = card.current
    if (!fromScope || !el || !matchMedia('(max-width: 899px)').matches) return
    requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top
      if (top > innerHeight * 0.6)
        el.scrollIntoView({
          block: 'nearest',
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        })
    })
  }, [])
  const hover = (id: string | null) => (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') setPeek(id)
  }

  // the scope comes on once, on first sight; then the sweep keeps turning
  useEffect(() => {
    const el = root.current
    const scope = disc.current
    if (!el || !scope) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.still = ''
      return
    }
    const q = gsap.utils.selector(el)
    const sweep = scope.querySelector<HTMLElement>('.vn-xv2-sweep')
    type Item = {
      b: number
      el: SVGGElement
      tag: HTMLElement | null
      acq: boolean
    }
    const items: Item[] = [
      ...el.querySelectorAll<SVGGElement>('[data-b]'),
    ].map((n) => ({
      b: Number(n.dataset.b),
      el: n,
      tag: el.querySelector<HTMLElement>(`[data-t="${n.dataset.c}"]`),
      acq: false,
    }))
    let t0 = -1
    let live = false
    let io: IntersectionObserver | null = null
    let seen: IntersectionObserver | null = null

    const ctx = gsap.context(() => {
      // nothing on the scope until the sweep finds it
      gsap.set(q('.vn-xv2-acq'), { opacity: 0 })
      gsap.set(q('.vn-xv2-tag-in'), { opacity: 0 })

      const acquire = (it: Item) => {
        it.acq = true
        const tl = gsap.timeline()
        const inner = it.el.querySelector('.vn-xv2-acq')
        const lines = it.el.querySelectorAll('.vn-xv2-draw')
        const head = it.el.querySelector('.vn-xv2-head')
        tl.to(inner, { opacity: 1, duration: 0.3 * B, ease: 'none' }, 0)
        if (lines.length)
          tl.fromTo(
            lines,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.5 * B, ease: 'power2.out' },
            0
          )
        if (head)
          tl.fromTo(
            head,
            { scale: 0, transformOrigin: '50% 50%' },
            { scale: 1, duration: 0.7 * B, ease: 'back.out(2.2)' },
            lines.length ? 1.1 * B : 0
          )
        const tagIn = it.tag?.querySelector('.vn-xv2-tag-in')
        if (tagIn) focusIn(tl, tagIn, 0.15 * B, { dur: 1.1 * B, blur: 8, ca: 6 })
      }

      const intro = gsap.timeline({ paused: true })
      intro.fromTo(
        q('.vn-xv2-ring'),
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 1.8 * B,
          ease: 'power2.inOut',
          stagger: 0.1 * B,
        },
        0
      )
      focusIn(intro, q('.vn-xv2-base'), 0, { dur: 1.6 * B, blur: 14, ca: 8, scale: 1 })
      intro.fromTo(
        q('.vn-xv2-ticks, .vn-xv2-bounds'),
        { opacity: 0 },
        { opacity: 1, duration: 1.4 * B, ease: 'power1.out' },
        0.4 * B
      )
      intro.fromTo(
        q('.vn-xv2-ringlabel'),
        { opacity: 0 },
        { opacity: 1, duration: B, stagger: 0.08 * B },
        0.7 * B
      )
      focusIn(intro, q('.vn-xv2-sector'), 0.9 * B, {
        stagger: 0.12 * B,
        blur: 6,
        ca: 5,
        scale: 1,
      })
      focusIn(intro, q('.vn-xv2-now-h, .vn-xv2-row'), 0.3 * B, {
        stagger: 0.18 * B,
        y: 8,
      })
      focusIn(intro, q('.vn-xv2-card'), 1.1 * B, { y: 10 })
      focusIn(intro, q('.vn-xv2-foot > *'), 1.6 * B, { stagger: 0.15 * B, blur: 6 })
      if (sweep)
        intro.fromTo(sweep, { opacity: 0 }, { opacity: 1, duration: B }, 1.5 * B)
      intro.call(() => {
        t0 = gsap.ticker.time
      }, [], 1.5 * B)

      seen = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return
          seen?.disconnect()
          el.dataset.seen = ''
          intro.play(0)
        },
        { rootMargin: '0px 0px -22% 0px' }
      )
      seen.observe(scope)

      // the sweep turns only while the scope is on screen
      io = new IntersectionObserver(([e]) => {
        live = e.isIntersecting
      })
      io.observe(scope)

      const tick = () => {
        if (t0 < 0 || !live) return
        const turns = (gsap.ticker.time - t0) / TURN
        const a = (turns % 1) * 360
        if (sweep) sweep.style.transform = `rotate(${a.toFixed(2)}deg)`
        const total = turns * 360
        for (const it of items) {
          if (!it.acq && total >= it.b) acquire(it)
          if (!it.acq) continue
          // phosphor: bright as the sweep passes, then a slow fade
          const g = Math.exp(-((a - it.b + 360) % 360) / 105).toFixed(3)
          it.el.style.setProperty('--glow', g)
          it.tag?.style.setProperty('--glow', g)
        }
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    }, el)

    return () => {
      seen?.disconnect()
      io?.disconnect()
      ctx.revert()
    }
  }, [])

  // a new contact on the readout comes into focus, its callsign scrambling in
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = card.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      focusIn(tl, el.querySelectorAll('.vn-xv2-card-in > *'), 0, {
        dur: 0.8 * B,
        blur: 6,
        ca: 5,
        stagger: 0.04 * B,
        scale: 1,
        y: 4,
      })
      const call = el.querySelector('.vn-xv2-card-call')
      if (call)
        tl.to(
          call,
          {
            duration: 0.7 * B,
            scrambleText: {
              text: call.textContent ?? '',
              chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
              speed: 0.6,
            },
          },
          0
        )
    }, el)
    return () => ctx.revert()
  }, [shownId])

  return (
    <section
      ref={root}
      id="experience"
      className="vn-xv2"
      aria-labelledby="exp-h"
      data-peek={peek ? '' : undefined}
    >
      <Slate no={c.no} label={c.label} title={c.title} hot={c.hot} id="exp-h">
        <p className="vn-xv2-lede">{c.lede}</p>
      </Slate>

      <div className="vn-xv2-grid">
        <figure className="vn-xv2-scope">
          <div
            ref={disc}
            className="vn-xv2-disc"
            style={{ '--k': k } as React.CSSProperties}
          >
            {/* the scope itself: rings, scale, sectors */}
            <svg className="vn-xv2-svg" viewBox="-500 -500 1000 1000" aria-hidden="true">
              <defs>
                <radialGradient id="xv2-glass">
                  <stop offset="0" stopColor="rgb(183 211 168 / 0.09)" />
                  <stop offset="0.7" stopColor="rgb(183 211 168 / 0.035)" />
                  <stop offset="1" stopColor="rgb(183 211 168 / 0.01)" />
                </radialGradient>
              </defs>
              <g className="vn-xv2-base">
                <circle r={R} className="vn-xv2-glass" />
              </g>
              <g
                className="vn-xv2-bounds"
                strokeWidth={px(1)}
                strokeDasharray={`${px(2)} ${px(5)}`}
              >
                {bounds.map((b) => {
                  const [x0, y0] = at(b, R0)
                  const [x1, y1] = at(b, R)
                  return <path key={b} d={`M${x0} ${y0}L${x1} ${y1}`} />
                })}
              </g>
              {rings.map((g, i) => (
                <circle
                  key={g.year}
                  r={g.r}
                  pathLength={1}
                  transform="rotate(-90)"
                  className="vn-xv2-ring"
                  data-outer={i === rings.length - 1 ? '' : undefined}
                  strokeWidth={px(i === rings.length - 1 ? 1.25 : 1)}
                />
              ))}
              <path className="vn-xv2-ticks" d={TICKS} strokeWidth={px(1)} />
              {rings.map((g) => (
                <text
                  key={g.year}
                  className="vn-xv2-ringlabel"
                  x={-px(5)}
                  y={fix(-g.r - px(4))}
                  fontSize={px(9.5)}
                  textAnchor="end"
                >
                  {g.year}
                </text>
              ))}
              {sectors.map((s) => {
                const mid = (s.from + s.to) / 2
                const flip = mid > 100 && mid < 260
                return (
                  <g key={s.key} className="vn-xv2-sector" data-side={s.side ? '' : undefined}>
                    {s.side ? null : (
                      <path
                        className="vn-xv2-sarc"
                        d={arc(R + 12, s.from + 1.5, s.to - 1.5)}
                        strokeWidth={px(1)}
                      />
                    )}
                    <path
                      id={`xv2-s-${s.key}`}
                      d={arc(LABEL_R + (flip ? px(3.5) : -px(3.5)), mid - 40, mid + 40, flip)}
                      fill="none"
                    />
                    <text fontSize={px(10)} letterSpacing={px(1.4)} textAnchor="middle">
                      <textPath href={`#xv2-s-${s.key}`} startOffset="50%">
                        {s.name}
                      </textPath>
                    </text>
                  </g>
                )
              })}
              <g className="vn-xv2-base">
                <circle r={R0} className="vn-xv2-now" strokeWidth={px(1)} />
                <text
                  className="vn-xv2-nowlabel"
                  fontSize={px(10)}
                  dy="0.35em"
                  textAnchor="middle"
                >
                  {c.now}
                </text>
              </g>
            </svg>

            <div className="vn-xv2-sweep" aria-hidden="true" />

            {/* the traffic: tracks, heads, and the community marks outside the range */}
            <svg className="vn-xv2-svg is-fg" viewBox="-500 -500 1000 1000" aria-hidden="true">
              <defs>
                {contacts.map((t) => {
                  const [x1, y1] = at(t.bearing, t.tail)
                  const [x2, y2] = at(t.bearing, t.head)
                  return (
                    <linearGradient
                      key={t.r.id}
                      id={`xv2-g-${t.r.id}`}
                      gradientUnits="userSpaceOnUse"
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                    >
                      <stop offset="0" stopColor="var(--sage)" stopOpacity={t.unsure ? 0 : 0.28} />
                      <stop offset="1" stopColor="var(--sage)" stopOpacity="1" />
                    </linearGradient>
                  )
                })}
              </defs>
              {contacts.map((t) => {
                const [x1, y1] = at(t.bearing, t.tail)
                const [x2, y2] = at(t.bearing, t.head)
                const d = `M${x1} ${y1}L${x2} ${y2}`
                const on = shownId === t.r.id
                const point = t.tail === t.head
                return (
                  <g
                    key={t.r.id}
                    className="vn-xv2-c"
                    data-c={t.r.id}
                    data-b={t.bearing}
                    data-on={on ? '' : undefined}
                    data-unsure={t.unsure ? '' : undefined}
                  >
                    <g className="vn-xv2-acq">
                      {point ? null : (
                        <>
                          <path
                            className="vn-xv2-halo vn-xv2-draw"
                            d={d}
                            pathLength={1}
                            strokeWidth={px(9)}
                          />
                          <path
                            className={`vn-xv2-line${t.unsure ? '' : ' vn-xv2-draw'}`}
                            d={d}
                            pathLength={1}
                            stroke={`url(#xv2-g-${t.r.id})`}
                            strokeWidth={px(on ? 3 : 2)}
                          />
                        </>
                      )}
                      <circle
                        className="vn-xv2-ping"
                        cx={x2}
                        cy={y2}
                        r={px(9)}
                        strokeWidth={px(1)}
                      />
                      <circle
                        className="vn-xv2-head"
                        data-going={t.going ? '' : undefined}
                        cx={x2}
                        cy={y2}
                        r={px(t.going ? 3.6 : 3.2)}
                        strokeWidth={px(1.5)}
                      />
                      {/* the hit area: the whole track, for a pointer */}
                      <path
                        className="vn-xv2-hit"
                        d={point ? `M${x2} ${y2}l0.01 0` : d}
                        strokeWidth={px(22)}
                        onPointerEnter={hover(t.r.id)}
                        onPointerLeave={hover(null)}
                        onClick={() => select(t.r.id, true)}
                      />
                    </g>
                  </g>
                )
              })}
              {marks.map((m) => {
                const [x, y] = at(m.bearing, R + 14)
                const s = px(4.2)
                return (
                  <g key={m.r.id} className="vn-xv2-c is-side" data-c={m.r.id} data-b={m.bearing}>
                    <g className="vn-xv2-acq">
                      <path
                        className="vn-xv2-mark"
                        d={`M${x} ${fix(y - s)}L${fix(x + s)} ${y}L${x} ${fix(y + s)}L${fix(x - s)} ${y}Z`}
                        strokeWidth={px(1)}
                      />
                    </g>
                  </g>
                )
              })}
            </svg>

            <ul className="vn-xv2-tags">
              {tagOrder.map((t) => (
                <li key={t.r.id}>
                  <button
                    type="button"
                    className="vn-xv2-tag"
                    data-t={t.r.id}
                    data-a={t.tag.a}
                    data-on={shownId === t.r.id ? '' : undefined}
                    data-going={t.going ? '' : undefined}
                    style={{ left: pct(t.tag.x), top: pct(t.tag.y) }}
                    aria-pressed={sel === t.r.id}
                    aria-controls="xv2-card"
                    aria-label={`${t.r.org}, ${t.r.role}, ${t.r.when}`}
                    data-lock="Show"
                    onPointerEnter={hover(t.r.id)}
                    onPointerLeave={hover(null)}
                    onFocus={() => select(t.r.id)}
                    onClick={() => select(t.r.id, true)}
                  >
                    <span className="vn-xv2-tag-in">
                      <b>{t.r.call}</b>
                      <span>{t.r.org}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <figcaption className="vn-xv2-cap">{CAPTION}</figcaption>
        </figure>

        <div className="vn-xv2-now-list">
          <h3 className="vn-xv2-now-h">
            <i aria-hidden="true" />
            {IN_RANGE}
          </h3>
          <ol>
            {lead.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="vn-xv2-row"
                  data-on={shownId === r.id ? '' : undefined}
                  aria-pressed={sel === r.id}
                  aria-controls="xv2-card"
                  data-lock="Show"
                  onPointerEnter={hover(r.id)}
                  onPointerLeave={hover(null)}
                  onFocus={() => select(r.id)}
                  onClick={() => select(r.id)}
                >
                  <span className="vn-xv2-row-call" aria-hidden="true">
                    {r.call}
                  </span>
                  <span className="vn-xv2-row-id">
                    <span className="vn-xv2-row-org">{r.org}</span>
                    <span className="vn-xv2-row-role">{r.role}</span>
                  </span>
                  <span className="vn-xv2-row-since">{since(r)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div ref={card} className="vn-xv2-card" id="xv2-card">
          {shown ? <Readout key={shown.id} r={shown} /> : null}
        </div>

        {side.length ? (
          <div className="vn-xv2-foot">
            <p className="vn-xv2-also">
              <span>{c.also.label}:</span>{' '}
              {side.map((r, i) => (
                <Fragment key={r.id}>
                  {i ? <span aria-hidden="true"> · </span> : null}
                  <a href="#community">
                    {r.org} <small>{r.when}</small>
                  </a>
                </Fragment>
              ))}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** The contact readout: everything one role says. */
function Readout({ r }: { r: BoardRole }) {
  const going = r.to === 'now'
  return (
    <div className="vn-xv2-card-in">
      <p className="vn-xv2-card-bar">
        <b className="vn-xv2-card-call" aria-hidden="true">
          {r.call}
        </b>
        <span>{r.kindName}</span>
        <span className="vn-xv2-card-when" data-going={going ? '' : undefined}>
          {r.when}
        </span>
      </p>
      <h3 className="vn-xv2-card-org fx">{r.org}</h3>
      {r.orgLong ? <p className="vn-xv2-card-long">{r.orgLong}</p> : null}
      <p className="vn-xv2-card-role">{r.role}</p>
      <p className="vn-xv2-card-note">{r.note}</p>
      {r.more ? <p className="vn-xv2-card-more">{r.more}</p> : null}
      {r.where || r.with?.length ? (
        <dl className="vn-xv2-card-fields">
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
        <ul className="vn-xv2-card-work" aria-label={c.strip.projects}>
          {r.projects.map((p) => (
            <li key={p.href}>
              <Link href={p.href}>
                {p.image ? (
                  <span className="vn-xv2-thumb">
                    <Image
                      src={p.image.src}
                      alt=""
                      fill
                      sizes="72px"
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
        <p className="vn-xv2-card-links">
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
  )
}
