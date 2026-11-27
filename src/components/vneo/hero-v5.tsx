'use client'

import { gsap } from 'gsap'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { decode, driver } from '@/components/v6/armed'
import { B, focusIn } from '@/components/v7/tempo'
import { vneo } from '@/content/vneo/site'

import './hero-v5.css'

/*
 * Hero v5, "Specimen: Rami". The first screen keeps its layout and its
 * instrument plate, but the specimen on the plate is Rami, not the drone:
 * his profile on Sage, with the plate's grid, leader lines and readout row.
 * The callouts map the site's loop onto him (the eye senses, the head
 * decides) and add how he shares it (the mouth); pointing at or focusing one,
 * or tapping it, opens a card of three examples where the readouts were.
 *
 * Entrance: the name lands as the current hero's does, the portrait comes into
 * focus out of blur and green/magenta fringe, the three leaders draw in one a
 * beat (sense, decide, share) with their labels decoding out of glyph noise,
 * and the readouts count up once. Then nothing moves unless the visitor asks.
 */

const PORTRAIT = {
  src: '/images/vneo/portrait-sage.webp',
  alt: 'Rami Kronbi in profile against a Sage background.',
}

type Key = 'sense' | 'decide' | 'share'

interface Callout {
  key: Key
  label: string
  sub: string
  examples: readonly string[]
  /** the point on the portrait, in % of the picture (1200 × 1500) */
  at: readonly [number, number]
  /** the leader's level run: its height, and where it turns toward the point (% of the picture) */
  run: number
  turn: number
  /** the label sits on the run, or hangs under it where the face leaves no room above */
  hang?: boolean
}

/*
 * Points read off the picture: the eye's iris at (408, 540); the upper skull,
 * in the hair above the temple, at (624, 360); the parted lips at (324, 735).
 * The runs stay on the Sage in front of the profile (nose tip at x 21.5 %).
 */
const CALLOUTS: readonly Callout[] = [
  {
    key: 'sense',
    label: 'Sense',
    sub: 'computer vision',
    examples: [
      'Runway vision at Oreyeon',
      'OmniSign, Lebanese Sign Language',
      'The rover’s LiDAR map',
    ],
    at: [34, 36],
    run: 30,
    turn: 25,
  },
  {
    key: 'decide',
    label: 'Decide',
    sub: 'control and robotics',
    examples: [
      'The demining rover’s autonomy',
      'Rotor-fault recovery',
      'easyPID',
    ],
    at: [52, 24],
    run: 11,
    turn: 43,
  },
  {
    key: 'share',
    label: 'Share',
    sub: 'teaching, talks, mentoring',
    examples: [
      'INJAZ Al-Arab',
      'NASA Space Apps Beirut',
      'GDG DevFest Tripoli',
    ],
    at: [27, 49],
    run: 53,
    turn: 19,
    hang: true,
  },
]

/** Where every leader starts, in from the plate's left edge (% of the picture). */
const EDGE = 4
const DOT = 4

const READOUTS = [
  { k: 'Now', n: 3, unit: ' roles' },
  { k: 'Projects', n: vneo.work.total, unit: '' },
  { k: 'Top 10', n: 6, unit: '×' },
] as const

const PIN = 'Beirut'
const FIG = {
  no: 'Fig. 0',
  caption: 'Rami Kronbi: sense, decide, act, and share.',
}

const pc = (n: number) => `${n}%`

interface Open {
  i: number
  /** opened by a click or tap: it stays when the pointer leaves */
  pin: boolean
}

export function HeroV5() {
  const root = useRef<HTMLElement>(null)
  const c = vneo.hero
  const [open, setOpen] = useState<Open | null>(null)

  // the entrance: once, on mount
  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const sub = el.querySelector<HTMLElement>('.vn-h5-sub')!
    const LOCK = 2 * B

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })

      // RAMI arrives out of focus and colour fringe, and settles
      tl.fromTo(
        '.vn-h5-n1',
        { opacity: 0, scale: 1.35, filter: 'blur(18px)', '--ca': 14 },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          '--ca': 0,
          duration: 1.2 * B,
          ease: 'power3.out',
          clearProps: 'filter',
        },
        0
      )
      tl.fromTo(
        '.vn-h5-glow',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 2 * B, ease: 'power2.out' },
        0
      )
      // KRONBI slides in on the next beat
      tl.fromTo(
        '.vn-h5-n2',
        { opacity: 0, x: '18vw', filter: 'blur(16px)', '--ca': 12 },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          '--ca': 0,
          duration: 1.1 * B,
          ease: 'power3.out',
          clearProps: 'filter',
        },
        B
      )
      tl.fromTo(
        '.vn-h5-stop',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2.4)' },
        1.5 * B
      )
      // the ID lock closes on the name
      el.querySelectorAll('.vn-h5-lock i').forEach((b, i) => {
        tl.fromTo(
          b,
          { opacity: 0, x: [-70, 70, -70, 70][i], y: [-50, -50, 50, 50][i] },
          { opacity: 1, x: 0, y: 0, duration: 0.8 * B, ease: 'power3.out' },
          LOCK + i * 0.04
        )
      })
      tl.fromTo(
        '.vn-h5-id',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        LOCK + 0.1
      )
      // the title decodes out of glyph noise
      let shownSub = ''
      const dec = driver((p) => {
        const s = decode(c.sub, p, Math.floor(p * 20))
        if (s !== shownSub) sub.textContent = shownSub = s
      })
      tl.fromTo(dec, { p: 0 }, { p: 1, duration: 1.2 * B, ease: 'none' }, LOCK)
      tl.fromTo(
        '.vn-h5-cred',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 * B, ease: 'power2.out' },
        3 * B - B / 3
      )
      tl.fromTo(
        '.vn-h5-chip',
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7 * B,
          ease: 'power2.out',
          stagger: B / 3,
        },
        3 * B
      )

      // the plate, then Rami on it, pulled into focus out of blur and fringe
      tl.fromTo(
        '.vn-h5-plate',
        { opacity: 0 },
        { opacity: 1, duration: 1.2 * B, ease: 'power1.out' },
        0.5 * B
      )
      focusIn(tl, '.vn-h5-box', 0.75 * B, {
        dur: 2 * B,
        blur: 14,
        ca: 14,
        scale: 1.05,
      })

      // the callouts, one a beat: the run draws, turns to the point, the dot
      // lands, and the label decodes as the line goes
      CALLOUTS.forEach((co, i) => {
        const at = (2 + i) * B
        const g = el.querySelector(`[data-leader="${co.key}"]`)!
        const tag = el.querySelector<HTMLElement>(`[data-tag="${co.key}"]`)!
        const key = tag.querySelector<HTMLElement>('.vn-h5-k')!
        const [x, y] = co.at
        tl.fromTo(
          g.querySelectorAll('.vn-h5-run'),
          { attr: { x2: pc(EDGE) } },
          {
            attr: { x2: pc(co.turn) },
            duration: 0.45 * B,
            ease: 'power1.in',
          },
          at
        )
        tl.fromTo(
          g.querySelectorAll('.vn-h5-turn'),
          { attr: { x2: pc(co.turn), y2: pc(co.run) } },
          {
            attr: { x2: pc(x), y2: pc(y) },
            duration: 0.4 * B,
            ease: 'power2.out',
          },
          at + 0.45 * B
        )
        tl.fromTo(
          g.querySelector('.vn-h5-dot'),
          { attr: { r: 0 } },
          { attr: { r: DOT }, duration: 0.5 * B, ease: 'back.out(3)' },
          at + 0.8 * B
        )
        tl.fromTo(
          tag,
          { opacity: 0 },
          { opacity: 1, duration: 0.12 * B, ease: 'none' },
          at
        )
        let shown = ''
        const word = driver((p) => {
          const s = decode(co.label, p, Math.floor(p * 14))
          if (s !== shown) key.textContent = shown = s
        })
        tl.fromTo(word, { p: 0 }, { p: 1, duration: 0.9 * B, ease: 'none' }, at)
        focusIn(tl, tag.querySelector('.vn-h5-s'), at + 0.45 * B, {
          dur: 0.9 * B,
          blur: 6,
          ca: 0,
          scale: 1,
        })
      })

      // the readouts: the row rises, and each figure counts up once
      tl.fromTo(
        '.vn-h5-hud > *',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8 * B, ease: 'power2.out' },
        2.5 * B
      )
      el.querySelectorAll<HTMLElement>('[data-count]').forEach((b) => {
        const n = Number(b.dataset.count)
        let shown = -1
        const count = driver((p) => {
          const v = Math.round(p * n)
          if (v !== shown) b.textContent = String((shown = v))
        })
        tl.fromTo(
          count,
          { p: 0 },
          { p: 1, duration: 2 * B, ease: 'power2.out' },
          3 * B
        )
      })
      tl.fromTo(
        '.vn-h5-cap',
        { opacity: 0 },
        { opacity: 1, duration: B, ease: 'power1.out' },
        3 * B
      )

      el.dataset.rolled = ''
      if (reduce) {
        tl.progress(1)
        sub.textContent = c.sub
        return
      }
      tl.play(0)
    }, el)
    return () => ctx.revert()
  }, [c.sub])

  // an open card closes on Escape, or on a tap or click anywhere else
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (t?.closest?.('.vn-h5-tag')) return
      setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <section ref={root} id="top" className="vn-h5" aria-labelledby="vneo-name">
      <div className="vn-h5-glow" aria-hidden="true" />
      <div className="vn-h5-text">
        <p className="vn-h5-id" aria-hidden="true">
          {c.id}
        </p>
        <div className="vn-h5-namebox">
          <h1 id="vneo-name" className="vn-h5-name" data-lens="">
            <span className="vn-h5-n1 fx">{c.first}</span>
            <span className="vn-h5-n2 fx">
              {c.last}
              <span className="vn-h5-stop">.</span>
            </span>
          </h1>
          <span className="vn-h5-lock" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <p className="vn-h5-sub" aria-label={c.sub}>
          {c.sub}
        </p>
        <p className="vn-h5-cred">
          <a href={c.cred.href} target="_blank" rel="noopener">
            {c.cred.text}
          </a>
        </p>
        <nav className="vn-h5-chips" aria-label="On this page">
          {c.chips.map((ch) => (
            <a key={ch.href} className="vn-h5-chip" href={ch.href}>
              {ch.label}
            </a>
          ))}
          <span className="vn-h5-where">{c.where}</span>
        </nav>
      </div>

      <figure className="vn-h5-fig">
        <div className="vn-h5-plate" data-card={open ? '' : undefined}>
          {/* the portrait, through the page lens (lens.tsx's LensImage, loaded first) */}
          <div className="vn-h5-photo">
            <div className="vn-h5-box vn-h5-geo">
              <span className="vn-lens-img vn-h5-img" data-lens-img="">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="vn-li-base"
                  src={PORTRAIT.src}
                  alt={PORTRAIT.alt}
                  width={1200}
                  height={1500}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="vn-li-g"
                  src={PORTRAIT.src}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="vn-li-m"
                  src={PORTRAIT.src}
                  alt=""
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                />
              </span>
            </div>
          </div>

          {/* the callouts, in the picture's own frame so their points hold at any size */}
          <div className="vn-h5-marks vn-h5-geo">
            <svg className="vn-h5-leaders" aria-hidden="true" focusable="false">
              {CALLOUTS.map((co, i) => {
                const [x, y] = co.at
                const on = open?.i === i
                return (
                  <g
                    key={co.key}
                    className="vn-h5-leader"
                    data-leader={co.key}
                    data-on={on || undefined}
                  >
                    {(['vn-h5-case', 'vn-h5-core'] as const).map((k) => (
                      <g key={k} className={k}>
                        <line
                          className="vn-h5-run"
                          x1={pc(EDGE)}
                          y1={pc(co.run)}
                          x2={pc(co.turn)}
                          y2={pc(co.run)}
                        />
                        <line
                          className="vn-h5-turn"
                          x1={pc(co.turn)}
                          y1={pc(co.run)}
                          x2={pc(x)}
                          y2={pc(y)}
                        />
                      </g>
                    ))}
                    <circle
                      className="vn-h5-halo"
                      cx={pc(x)}
                      cy={pc(y)}
                      r="10"
                    />
                    <circle
                      className="vn-h5-dot"
                      cx={pc(x)}
                      cy={pc(y)}
                      r={DOT}
                    />
                  </g>
                )
              })}
            </svg>
            {CALLOUTS.map((co, i) => {
              const on = open?.i === i
              return (
                <button
                  key={co.key}
                  id={`vn-h5-tag-${co.key}`}
                  type="button"
                  className="vn-h5-tag"
                  data-tag={co.key}
                  data-hang={co.hang || undefined}
                  style={
                    { '--x': pc(EDGE), '--y': pc(co.run) } as CSSProperties
                  }
                  aria-label={`${co.label}: ${co.sub}`}
                  aria-expanded={on}
                  aria-controls={`vn-h5-card-${co.key}`}
                  data-lock={on && open?.pin ? 'Hide' : 'Show'}
                  onPointerMove={(e) => {
                    // a real move over it (a scroll fires pointer events too)
                    if (e.pointerType !== 'mouse' || on) return
                    if (!e.movementX && !e.movementY) return
                    setOpen({ i, pin: false })
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== 'mouse') return
                    setOpen((o) => (o && o.i === i && !o.pin ? null : o))
                  }}
                  onFocus={() =>
                    setOpen((o) => (o && o.i === i ? o : { i, pin: false }))
                  }
                  onBlur={(e) => {
                    const next = e.relatedTarget as Element | null
                    if (next?.closest?.('.vn-h5-tag')) return
                    setOpen((o) => (o && o.i === i ? null : o))
                  }}
                  onClick={() =>
                    setOpen((o) =>
                      o && o.i === i && o.pin ? null : { i, pin: true }
                    )
                  }
                >
                  <span className="vn-h5-k" aria-hidden="true">
                    {co.label}
                  </span>
                  <span className="vn-h5-s" aria-hidden="true">
                    {co.sub}
                  </span>
                </button>
              )
            })}
          </div>

          {CALLOUTS.map((co, i) => (
            <div
              key={co.key}
              id={`vn-h5-card-${co.key}`}
              className="vn-h5-card"
              role="group"
              aria-labelledby={`vn-h5-tag-${co.key}`}
              data-open={open?.i === i || undefined}
            >
              <p className="vn-h5-card-k">
                <b>{co.label}</b> · {co.sub}
              </p>
              <ol>
                {co.examples.map((ex, n) => (
                  <li key={ex}>
                    <i aria-hidden="true">{String(n + 1).padStart(2, '0')}</i>
                    {ex}
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <div className="vn-h5-hud">
            <dl className="vn-h5-read">
              {READOUTS.map((r) => (
                <div key={r.k}>
                  <dt>{r.k}</dt>
                  <dd>
                    <b
                      data-count={r.n}
                      style={{ '--d': String(r.n).length } as CSSProperties}
                    >
                      {r.n}
                    </b>
                    {r.unit}
                  </dd>
                </div>
              ))}
            </dl>
            <span className="vn-h5-pin">{PIN}</span>
          </div>
        </div>
        <figcaption className="vn-h5-cap">
          <span className="vn-h5-figno">{FIG.no}</span>
          <span>{FIG.caption}</span>
        </figcaption>
      </figure>
    </section>
  )
}
