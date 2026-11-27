'use client'

import { gsap } from 'gsap'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { decode, driver } from '@/components/v6/armed'
import { B, focusIn } from '@/components/v7/tempo'
import { vneo } from '@/content/vneo/site'

import './hero-v8.css'

/*
 * Hero v8, "Cedars specimen": v2 and v5 in one. Rami under the cedars, seen
 * from behind, stands on v5's instrument plate: its frame, its faint grid and
 * the dark band of readouts at the bottom. The callouts mark what the picture
 * shows: his eye (he is looking up at the canopy), the Lebanese flag on his
 * backpack and the DRONE PILOT patch beside it. Each is a button that opens a
 * small card of three examples. The ID-lock brackets close on him, as in v2.
 *
 * Entrance: the name lands as the current hero's does, the photo comes into
 * focus out of blur and green/magenta fringe, the lock closes on him, the
 * three leaders draw in one a beat with their words decoding out of glyph
 * noise, and the readouts count up once. Then nothing moves unless asked.
 */

const PHOTO = {
  src: '/images/vneo/rami-cedars-2.webp',
  /** 600 × 800, for phones */
  small: '/images/vneo/rami-cedars-2-sm.webp',
  alt: 'Rami Kronbi seen from behind under the cedars in Lebanon, a tan backpack with a Lebanese flag patch and a drone pilot patch.',
}
const PHONE = '(max-width: 640px)'

type Key = 'sense' | 'lebanon' | 'fly'

interface Callout {
  key: Key
  label: string
  sub: string
  examples: readonly string[]
  /** the point on the photo, in % of the picture (1050 × 1400) */
  at: readonly [number, number]
  /** the leader's level run: its height, and where it turns toward the point (% of the picture) */
  run: number
  turn: number
  /** the label stands on its run, or hangs under it where the run above it leaves no room */
  hang?: boolean
}

/*
 * Points read off the picture on zoomed crops: his glasses at the left edge of
 * his head (x 714–731, y 727–747), the flag patch (x 661–699, y 908–932; the
 * dot on its left edge) and the DRONE PILOT patch (x 749–787, y 915–937; the
 * dot under its bottom edge). All three labels sit on the left, over the
 * trees: the right of the picture is too narrow beside him, and a leader to
 * his head from above would cross the lock's tag. The runs pass the lock's
 * left edge between its corner brackets.
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
    at: [68.8, 52.6],
    run: 56.5,
    turn: 62,
  },
  {
    key: 'lebanon',
    label: 'Lebanon',
    sub: 'where I build',
    examples: ['CNRS-L', 'Chronos', 'NASA Space Apps Beirut'],
    at: [63.1, 65.7],
    run: 69,
    turn: 58.5,
  },
  {
    key: 'fly',
    label: 'Fly',
    sub: 'a 5-inch FPV I built and tuned',
    examples: [
      '5-inch carbon-fiber FPV drone',
      'Rotor-fault recovery',
      'A drone-control bootcamp',
    ],
    at: [73.1, 67.2],
    run: 74.5,
    turn: 68,
    hang: true,
  },
]

/** Where every leader starts, in from the plate's left edge (% of the picture). */
const EDGE = 4
const DOT = 3.5

const READOUTS = [
  { k: 'Now', n: 3, unit: ' roles' },
  { k: 'Projects', n: vneo.work.total, unit: '' },
  { k: 'Top 10', n: 6, unit: '×' },
] as const

const PIN = 'Beirut'
const FIG = { no: 'Fig. 0', caption: 'Rami Kronbi, in the field.' }

const pc = (n: number) => `${n}%`

interface Open {
  i: number
  /** opened by a click or tap: it stays when the pointer leaves */
  pin: boolean
}

/** The photograph through the page lens: lens.tsx's LensImage, with a phone-sized file and the hero's loading priority. */
function CedarsLayer({ className, alt }: { className: string; alt: string }) {
  return (
    <picture>
      <source media={PHONE} srcSet={PHOTO.small} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={className}
        src={PHOTO.src}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        width={1050}
        height={1400}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  )
}

export function HeroV8() {
  const root = useRef<HTMLElement>(null)
  const c = vneo.hero
  const [open, setOpen] = useState<Open | null>(null)

  // the entrance: once, on mount
  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const sub = el.querySelector<HTMLElement>('.vn-h8-sub-shown')!
    const plate = el.querySelector<HTMLElement>('.vn-h8-plate')!
    const lock = el.querySelector<HTMLElement>('.vn-h8-lock')!

    const ctx = gsap.context(() => {
      // the brackets start at the plate's corners: measured once, before anything moves
      const p = plate.getBoundingClientRect()
      const k = lock.getBoundingClientRect()
      const IN = 18
      const start = [
        [p.left + IN - k.left, p.top + IN - k.top],
        [p.right - IN - k.right, p.top + IN - k.top],
        [p.left + IN - k.left, p.bottom - IN - k.bottom],
        [p.right - IN - k.right, p.bottom - IN - k.bottom],
      ]

      const tl = gsap.timeline({ paused: true })

      // RAMI arrives out of focus and colour fringe, and settles
      tl.fromTo(
        '.vn-h8-n1',
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
        '.vn-h8-glow',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 2 * B, ease: 'power2.out' },
        0
      )
      // KRONBI slides in on the next beat
      tl.fromTo(
        '.vn-h8-n2',
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
        '.vn-h8-stop',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2.4)' },
        1.5 * B
      )
      // the title decodes out of glyph noise
      let shownSub = ''
      const dec = driver((q) => {
        const s = decode(c.sub, q, Math.floor(q * 20))
        if (s !== shownSub) sub.textContent = shownSub = s
      })
      tl.fromTo(dec, { p: 0 }, { p: 1, duration: 1.2 * B, ease: 'none' }, 2 * B)
      tl.fromTo(
        '.vn-h8-cred',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 * B, ease: 'power2.out' },
        2.6 * B
      )
      tl.fromTo(
        '.vn-h8-chip',
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
        '.vn-h8-plate',
        { opacity: 0 },
        { opacity: 1, duration: 1.2 * B, ease: 'power1.out' },
        0.4 * B
      )
      focusIn(tl, '.vn-h8-box', 0.6 * B, {
        dur: 2 * B,
        blur: 14,
        ca: 8,
        scale: 1.04,
      })

      // the ID lock: the brackets appear at the plate's corners, then close in on him
      lock.querySelectorAll('i').forEach((b, i) => {
        const [x, y] = start[i]
        tl.fromTo(
          b,
          { opacity: 0, x, y },
          { opacity: 1, x, y, duration: 0.5 * B, ease: 'power1.out' },
          1.8 * B
        )
        tl.to(
          b,
          { x: 0, y: 0, duration: 1.2 * B, ease: 'power3.inOut' },
          2.2 * B + i * 0.04
        )
      })
      // it holds: the tag reads out, and the label over the name with it
      tl.fromTo(
        '.vn-h8-tag, .vn-h8-id',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        3.4 * B
      )

      // the callouts, one a beat: the run draws, turns to the point, the dot
      // lands, and the word decodes as the line goes
      CALLOUTS.forEach((co, i) => {
        const at = (3 + i) * B
        const g = el.querySelector(`[data-leader="${co.key}"]`)!
        const tag = el.querySelector<HTMLElement>(`[data-callout="${co.key}"]`)!
        const word = tag.querySelector<HTMLElement>('.vn-h8-k')!
        const [x, y] = co.at
        tl.fromTo(
          g.querySelectorAll('.vn-h8-run'),
          { attr: { x2: pc(EDGE) } },
          {
            attr: { x2: pc(co.turn) },
            duration: 0.45 * B,
            ease: 'power1.in',
          },
          at
        )
        tl.fromTo(
          g.querySelectorAll('.vn-h8-turn'),
          { attr: { x2: pc(co.turn), y2: pc(co.run) } },
          {
            attr: { x2: pc(x), y2: pc(y) },
            duration: 0.4 * B,
            ease: 'power2.out',
          },
          at + 0.45 * B
        )
        tl.fromTo(
          g.querySelector('.vn-h8-dot'),
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
        const dw = driver((q) => {
          const s = decode(co.label, q, Math.floor(q * 14))
          if (s !== shown) word.textContent = shown = s
        })
        tl.fromTo(dw, { p: 0 }, { p: 1, duration: 0.9 * B, ease: 'none' }, at)
        focusIn(tl, tag.querySelector('.vn-h8-s'), at + 0.45 * B, {
          dur: 0.9 * B,
          blur: 6,
          ca: 0,
          scale: 1,
        })
      })

      // the readouts: the row rises, and each figure counts up once
      tl.fromTo(
        '.vn-h8-hud > *',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8 * B, ease: 'power2.out' },
        3 * B
      )
      el.querySelectorAll<HTMLElement>('[data-count]').forEach((b) => {
        const n = Number(b.dataset.count)
        let shown = -1
        const count = driver((q) => {
          const v = Math.round(q * n)
          if (v !== shown) b.textContent = String((shown = v))
        })
        tl.fromTo(
          count,
          { p: 0 },
          { p: 1, duration: 2 * B, ease: 'power2.out' },
          3.5 * B
        )
      })
      tl.fromTo(
        '.vn-h8-cap',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: B, ease: 'power2.out' },
        3.5 * B
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

  // an open card closes on Escape, or on a tap or click anywhere but a callout or its card
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (t?.closest?.('.vn-h8-callout, .vn-h8-card')) return
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
    <section ref={root} id="top" className="vn-h8" aria-labelledby="vneo-name">
      <div className="vn-h8-glow" aria-hidden="true" />
      <div className="vn-h8-text">
        <p className="vn-h8-id" aria-hidden="true">
          {c.id}
        </p>
        <h1 id="vneo-name" className="vn-h8-name" data-lens="">
          <span className="vn-h8-n1 fx">{c.first}</span>
          <span className="vn-h8-n2 fx">
            {c.last}
            <span className="vn-h8-stop">.</span>
          </span>
        </h1>
        <p className="vn-h8-sub">
          <span className="vn-h8-sub-shown" aria-hidden="true">
            {c.sub}
          </span>
          <span className="v7-vh">{c.sub}</span>
        </p>
        <p className="vn-h8-cred">
          <a href={c.cred.href} target="_blank" rel="noopener">
            {c.cred.text}
          </a>
        </p>
        <nav className="vn-h8-chips" aria-label="On this page">
          {c.chips.map((ch) => (
            <a key={ch.href} className="vn-h8-chip" href={ch.href}>
              {ch.label}
            </a>
          ))}
          <span className="vn-h8-where">{c.where}</span>
        </nav>
      </div>

      <figure className="vn-h8-fig">
        <div className="vn-h8-plate" data-card={open ? '' : undefined}>
          {/* the photograph, through the page lens; it fades into the plate's dark band */}
          <div className="vn-h8-photo">
            <div className="vn-h8-box vn-h8-geo">
              <span
                className="vn-lens-img vn-h8-img"
                data-lens-img=""
                // a busy canopy: a lighter split than the lens gives a portrait
                data-lens="0.4"
              >
                <CedarsLayer className="vn-li-base" alt={PHOTO.alt} />
                <CedarsLayer className="vn-li-g" alt="" />
                <CedarsLayer className="vn-li-m" alt="" />
              </span>
            </div>
          </div>

          {/* the marks, in the picture's own frame so their points hold at any size */}
          <div className="vn-h8-marks vn-h8-geo">
            <span className="vn-h8-lock" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <span className="vn-h8-tag">ID lock · {c.first}</span>
            </span>

            <svg className="vn-h8-leaders" aria-hidden="true" focusable="false">
              {CALLOUTS.map((co, i) => {
                const [x, y] = co.at
                return (
                  <g
                    key={co.key}
                    className="vn-h8-leader"
                    data-leader={co.key}
                    data-on={open?.i === i || undefined}
                  >
                    {(['vn-h8-case', 'vn-h8-core'] as const).map((k) => (
                      <g key={k} className={k}>
                        <line
                          className="vn-h8-run"
                          x1={pc(EDGE)}
                          y1={pc(co.run)}
                          x2={pc(co.turn)}
                          y2={pc(co.run)}
                        />
                        <line
                          className="vn-h8-turn"
                          x1={pc(co.turn)}
                          y1={pc(co.run)}
                          x2={pc(x)}
                          y2={pc(y)}
                        />
                      </g>
                    ))}
                    <circle
                      className="vn-h8-ring"
                      cx={pc(x)}
                      cy={pc(y)}
                      r="9"
                    />
                    <circle
                      className="vn-h8-dot"
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
                  id={`vn-h8-callout-${co.key}`}
                  type="button"
                  className="vn-h8-callout"
                  data-callout={co.key}
                  data-hang={co.hang || undefined}
                  style={
                    { '--x': pc(EDGE), '--y': pc(co.run) } as CSSProperties
                  }
                  aria-label={`${co.label}: ${co.sub}`}
                  aria-expanded={on}
                  aria-controls={`vn-h8-card-${co.key}`}
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
                    if (next?.closest?.('.vn-h8-callout')) return
                    setOpen((o) => (o && o.i === i ? null : o))
                  }}
                  onClick={() =>
                    setOpen((o) =>
                      o && o.i === i && o.pin ? null : { i, pin: true }
                    )
                  }
                >
                  <span className="vn-h8-k" aria-hidden="true">
                    {co.label}
                  </span>
                  <span className="vn-h8-s" aria-hidden="true">
                    {co.sub}
                  </span>
                </button>
              )
            })}
          </div>

          {CALLOUTS.map((co, i) => (
            <div
              key={co.key}
              id={`vn-h8-card-${co.key}`}
              className="vn-h8-card"
              role="group"
              aria-labelledby={`vn-h8-callout-${co.key}`}
              data-open={open?.i === i || undefined}
            >
              <p className="vn-h8-card-k">
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

          <div className="vn-h8-hud">
            <dl className="vn-h8-read">
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
            <span className="vn-h8-pin">{PIN}</span>
          </div>
        </div>
        <figcaption className="vn-h8-cap">
          <span className="vn-h8-figno">{FIG.no}</span>
          <span>{FIG.caption}</span>
        </figcaption>
      </figure>
    </section>
  )
}
