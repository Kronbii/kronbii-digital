'use client'

import { gsap } from 'gsap'
import { useEffect, useRef, type CSSProperties } from 'react'

import { decode, driver } from '@/components/v6/armed'
import { B, focusIn } from '@/components/v7/tempo'
import cedars from '@/content/vneo/cedars-matches.json'
import { vneo } from '@/content/vneo/site'

import './hero-v7.css'

/*
 * Hero v7, "Cedars, matched": the name as v2 sets it, and beside it two
 * photographs of Rami under the cedars, taken moments apart from two places,
 * matched the way a vision system matches them. Real SIFT keypoints scatter
 * over both frames, the correspondences that survived RANSAC draw across in a
 * left-to-right sweep (the trees first and faint, then the ones on him, in the
 * green and magenta fringe), and the ID-lock brackets close on him in both
 * frames at once, joined under one tag. Identity, established by matching the
 * same person across two views. Pointing at the pair (or focusing it) brings
 * the matches on him forward; on touch the finished picture simply stays.
 *
 * Everything over the photographs lives in one coordinate system, in image
 * pixels: frame 1 at x 0–1050, a gap, frame 2 at x 1110–2160, both 1400 tall.
 * The pair box keeps that aspect ratio, the frames sit in it by percent, and
 * every overlay is an SVG with the same viewBox, so the lines land on the
 * right points at any size without measuring anything.
 */

/** one frame, in image pixels (both photos are 1050 × 1400) */
const FW = 1050
const FH = 1400
const GAP = 60
/** the pair: two frames and the gap */
const VW = FW * 2 + GAP
/** where frame 2 starts */
const OX = FW + GAP
const VIEW = `0 0 ${VW} ${FH}`
const pct = (v: number, of: number) => `${+((v / of) * 100).toFixed(4)}%`
const r1 = (v: number) => Math.round(v * 10) / 10

const PHOTOS = [
  {
    src: '/images/vneo/rami-cedars-1.webp',
    small: '/images/vneo/rami-cedars-1-sm.webp',
    alt: 'Rami Kronbi seen from behind under the cedars in Lebanon, a tan backpack with patches.',
  },
  {
    src: '/images/vneo/rami-cedars-2.webp',
    small: '/images/vneo/rami-cedars-2-sm.webp',
    alt: "The same moment from a step away: Rami under the cedars, his backpack's patches facing the camera.",
  },
] as const
/** each frame is 1050/2160 of the pair: under 44vw on a phone, under 24.3vw (and 418px) beside the name */
const SIZES = '(max-width: 900px) min(44vw, 302px), min(24.3vw, 418px)'

/** a correspondence, from frame 1 (a) to frame 2 (b), in pair pixels */
interface Seg {
  ax: number
  ay: number
  bx: number
  by: number
}
const seg = ([x1, y1, x2, y2]: number[]): Seg => ({
  ax: r1(x1 * FW),
  ay: r1(y1 * FH),
  bx: r1(OX + x2 * FW),
  by: r1(y2 * FH),
})
const SCENE = cedars.scene.map(seg)
const PERSON = cedars.person.map(seg)
const nf = new Intl.NumberFormat('en-US')

/**
 * A light scatter of real SIFT keypoints (the same detector the matches came
 * from): the strongest in each cell of a 9 × 12 grid, 56 of them per frame,
 * as [x, y] normalised and the ring's radius in image pixels (half the
 * keypoint's scale, 6–24).
 */
// prettier-ignore
const KEYPOINTS: [number, number, number][][] = [
  [
    [0.391, 0.309, 11], [0.2, 0.495, 24], [0.164, 0.693, 24], [0.086, 0.123, 6],
    [0.656, 0.868, 11], [0.872, 0.465, 6], [0.892, 0.831, 8], [0.249, 0.294, 13],
    [0.879, 0.597, 6], [0.623, 0.666, 24], [0.669, 0.851, 8], [0.688, 0.201, 19],
    [0.366, 0.188, 15], [0.626, 0.923, 24], [0.922, 0.225, 6], [0.387, 0.73, 11],
    [0.351, 0.518, 24], [0.957, 0.051, 7], [0.104, 0.309, 12], [0.956, 0.491, 6],
    [0.686, 0.334, 13], [0.578, 0.724, 24], [0.927, 0.568, 14], [0.334, 0.478, 6],
    [0.655, 0.276, 7], [0.506, 0.139, 7], [0.165, 0.581, 19], [0.506, 0.94, 19],
    [0.431, 0.623, 20], [0.915, 0.92, 23], [0.562, 0.46, 21], [0.742, 0.577, 24],
    [0.19, 0.645, 14], [0.495, 0.866, 7], [0.261, 0.086, 6], [0.492, 0.168, 6],
    [0.555, 0.618, 8], [0.22, 0.053, 6], [0.555, 0.497, 12], [0.101, 0.715, 6],
    [0.468, 0.043, 13], [0.934, 0.123, 10], [0.698, 0.451, 6], [0.223, 0.94, 21],
    [0.133, 0.364, 7], [0.256, 0.89, 24], [0.203, 0.969, 6], [0.224, 0.593, 7],
    [0.607, 0.388, 6], [0.426, 0.107, 20], [0.803, 0.82, 13], [0.716, 0.923, 8],
    [0.759, 0.821, 24], [0.888, 0.225, 16], [0.402, 0.033, 6], [0.895, 0.629, 13],
  ],
  [
    [0.795, 0.834, 17], [0.818, 0.329, 7], [0.71, 0.645, 6], [0.612, 0.409, 16],
    [0.704, 0.089, 6], [0.452, 0.131, 9], [0.399, 0.134, 12], [0.256, 0.617, 20],
    [0.567, 0.702, 24], [0.854, 0.355, 20], [0.75, 0.19, 6], [0.916, 0.542, 7],
    [0.374, 0.223, 10], [0.076, 0.197, 18], [0.85, 0.725, 6], [0.917, 0.475, 6],
    [0.245, 0.382, 11], [0.747, 0.058, 6], [0.58, 0.873, 24], [0.358, 0.044, 8],
    [0.143, 0.639, 13], [0.387, 0.935, 6], [0.106, 0.581, 8], [0.116, 0.757, 19],
    [0.22, 0.034, 6], [0.709, 0.96, 16], [0.967, 0.355, 6], [0.818, 0.545, 24],
    [0.699, 0.775, 24], [0.577, 0.816, 22], [0.039, 0.623, 6], [0.537, 0.742, 13],
    [0.79, 0.811, 24], [0.532, 0.84, 18], [0.413, 0.915, 24], [0.255, 0.931, 10],
    [0.49, 0.077, 8], [0.572, 0.451, 10], [0.657, 0.658, 6], [0.763, 0.308, 24],
    [0.383, 0.512, 6], [0.779, 0.214, 16], [0.607, 0.173, 7], [0.142, 0.926, 9],
    [0.719, 0.394, 24], [0.784, 0.132, 10], [0.625, 0.543, 12], [0.407, 0.703, 7],
    [0.038, 0.461, 11], [0.907, 0.628, 16], [0.251, 0.095, 7], [0.211, 0.398, 7],
    [0.106, 0.034, 6], [0.902, 0.152, 6], [0.267, 0.722, 8], [0.891, 0.752, 24],
  ],
]
/** every ring, in pair pixels: the scatter, and the matched points (they were keypoints too) */
const RINGS = [
  ...KEYPOINTS.flatMap((pts, f) =>
    pts.map(([x, y, r]) => [r1(f * OX + x * FW), r1(y * FH), r] as const)
  ),
  ...[...SCENE, ...PERSON].flatMap((s) => [
    [s.ax, s.ay, 9] as const,
    [s.bx, s.by, 9] as const,
  ]),
]

/**
 * The ID lock, on him in each frame: head to the bottom of the backpack.
 * Frame 1: x 628–908, y 695–1160; frame 2 as hero v2 locks it: x 611–893,
 * y 638–1131 (of 1050 × 1400). fx is where the frame starts in the pair.
 */
const LOCKS = [
  { x0: 628, y0: 695, x1: 908, y1: 1160, fx: 0 },
  { x0: OX + 611, y0: 638, x1: OX + 893, y1: 1131, fx: OX },
]
/** a bracket's arm, and how far in from the frame's corner it starts, in image pixels */
const ARM = 64
const IN = 54
type Pt = readonly [number, number]
const BRACKETS = LOCKS.flatMap((l) => {
  const [L, R, T, Bo] = [l.fx + IN, l.fx + FW - IN, IN, FH - IN]
  return [
    {
      pts: [
        [l.x0, l.y0 + ARM],
        [l.x0, l.y0],
        [l.x0 + ARM, l.y0],
      ] as Pt[],
      from: [L - l.x0, T - l.y0],
    },
    {
      pts: [
        [l.x1 - ARM, l.y0],
        [l.x1, l.y0],
        [l.x1, l.y0 + ARM],
      ] as Pt[],
      from: [R - l.x1, T - l.y0],
    },
    {
      pts: [
        [l.x0, l.y1 - ARM],
        [l.x0, l.y1],
        [l.x0 + ARM, l.y1],
      ] as Pt[],
      from: [L - l.x0, Bo - l.y1],
    },
    {
      pts: [
        [l.x1 - ARM, l.y1],
        [l.x1, l.y1],
        [l.x1, l.y1 - ARM],
      ] as Pt[],
      from: [R - l.x1, Bo - l.y1],
    },
  ]
})
/** the two locks are joined: a leader rises from each one's inner corner and they meet under the tag */
const BAR_Y = 560
const MID = (LOCKS[0].x1 + LOCKS[1].x0) / 2
const BAR: Pt[][] = [
  [
    [LOCKS[0].x1, LOCKS[0].y0],
    [LOCKS[0].x1, BAR_Y],
    [MID, BAR_Y],
  ],
  [
    [LOCKS[1].x0, LOCKS[1].y0],
    [LOCKS[1].x0, BAR_Y],
    [MID, BAR_Y],
  ],
]

/** a polyline drawn to fraction q of its length, as a path */
function trace(pts: Pt[], q = 1) {
  const lens = pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  let left = q * lens.reduce((a, b) => a + b, 0)
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length && left > 0; i++) {
    const k = Math.min(1, left / lens[i - 1])
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i]
    d += ` L${r1(ax + (bx - ax) * k)} ${r1(ay + (by - ay) * k)}`
    left -= lens[i - 1]
  }
  return d
}

/** one match's line, from its point in frame 1 to its point in frame 2 */
function MatchLine({ s, i }: { s: Seg; i: number }) {
  return (
    <line
      data-i={i}
      x1={s.ax}
      y1={s.ay}
      x2={s.bx}
      y2={s.by}
      vectorEffect="non-scaling-stroke"
    />
  )
}
/** its two ends: the point in frame 1 (a) and the same point in frame 2 (b) */
function MatchDots({ s, i, r }: { s: Seg; i: number; r: number }) {
  return (
    <>
      <circle data-a={i} cx={s.ax} cy={s.ay} r={r} />
      <circle data-b={i} cx={s.bx} cy={s.by} r={r} />
    </>
  )
}

/** the live elements of each match, so a sweep can draw it */
interface Live extends Seg {
  k: number
  lines: SVGLineElement[]
  a: SVGElement[]
  b: SVGElement[]
}

/**
 * A sweep: a front runs left to right across the pair, and each line is drawn
 * as far as the front has gone, so its tip travels with it; a line's far dot
 * lands when the front reaches it. Writes attributes only, never reads layout.
 */
function sweep(ms: Live[]) {
  const x0 = Math.min(...ms.map((m) => m.ax))
  const x1 = Math.max(...ms.map((m) => m.bx))
  return driver((p) => {
    const f = x0 + (x1 - x0) * p
    for (const m of ms) {
      const k = Math.min(1, Math.max(0, (f - m.ax) / (m.bx - m.ax)))
      if (k === m.k) continue
      m.k = k
      const x = String(r1(m.ax + (m.bx - m.ax) * k))
      const y = String(r1(m.ay + (m.by - m.ay) * k))
      for (const l of m.lines) {
        l.setAttribute('x2', x)
        l.setAttribute('y2', y)
      }
      for (const d of m.a) d.style.opacity = k > 0 ? '' : '0'
      for (const d of m.b) d.style.opacity = k >= 1 ? '' : '0'
    }
  })
}

export function HeroV7() {
  const root = useRef<HTMLElement>(null)
  const c = vneo.hero

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const sub = el.querySelector<HTMLElement>('.vn-h7-sub-shown')!
    const live = (layer: string, segs: Seg[]): Live[] =>
      segs.map((s, i) => ({
        ...s,
        k: -1,
        lines: Array.from(
          el.querySelectorAll<SVGLineElement>(`${layer} line[data-i="${i}"]`)
        ),
        a: Array.from(
          el.querySelectorAll<SVGElement>(`${layer} [data-a="${i}"]`)
        ),
        b: Array.from(
          el.querySelectorAll<SVGElement>(`${layer} [data-b="${i}"]`)
        ),
      }))
    const scene = live('.vn-h7-scene', SCENE)
    const person = live(':is(.vn-h7-him-halo, .vn-h7-him)', PERSON)
    const bars = Array.from(el.querySelectorAll<SVGPathElement>('.vn-h7-bar'))
    const brackets = Array.from(el.querySelectorAll<SVGGElement>('.vn-h7-br'))

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      // RAMI arrives out of focus and colour fringe, and settles
      tl.fromTo(
        '.vn-h7-n1',
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
        '.vn-h7-glow',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 2 * B, ease: 'power2.out' },
        0
      )
      // KRONBI slides in on the next beat
      tl.fromTo(
        '.vn-h7-n2',
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
        '.vn-h7-n2 > span',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2.4)' },
        1.5 * B
      )
      // the two frames find focus, the second a moment after the first; they
      // arrive in grey, the way the matcher reads them
      focusIn(tl, '.vn-h7-frame[data-f="1"]', 0.5 * B, {
        dur: 1.6 * B,
        blur: 12,
        ca: 8,
        scale: 1.04,
      })
      focusIn(tl, '.vn-h7-frame[data-f="2"]', 0.9 * B, {
        dur: 1.6 * B,
        blur: 12,
        ca: 8,
        scale: 1.04,
      })
      tl.fromTo(
        '.vn-h7-photo',
        { filter: 'grayscale(1) brightness(0.82)' },
        {
          filter: 'grayscale(0) brightness(1)',
          duration: 1.4 * B,
          ease: 'power1.inOut',
          clearProps: 'filter',
        },
        5.2 * B
      )
      // the title decodes out of glyph noise
      let last = ''
      const dec = driver((q) => {
        const shown = decode(c.sub, q, Math.floor(q * 20))
        if (shown !== last) sub.textContent = last = shown
      })
      tl.fromTo(dec, { p: 0 }, { p: 1, duration: 1.2 * B, ease: 'none' }, 2 * B)
      tl.fromTo(
        '.vn-h7-cred',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 * B, ease: 'power2.out' },
        2.6 * B
      )
      tl.fromTo(
        '.vn-h7-chip',
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
      // detection: keypoints come up over both frames, then settle back once matching starts
      tl.fromTo(
        '.vn-h7-kp circle',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.3 * B,
          ease: 'power1.out',
          stagger: { amount: 1.1 * B, from: 'random' },
        },
        1.8 * B
      )
      tl.fromTo(
        '.vn-h7-kp',
        { '--lift': 1 },
        { '--lift': 0, duration: 1.2 * B, ease: 'power1.inOut' },
        3.8 * B
      )
      // matching: the trees sweep across first, faint; then the matches on him, their fringe converging as they land
      tl.fromTo(
        sweep(scene),
        { p: 0 },
        { p: 1, duration: 1.6 * B, ease: 'sine.inOut' },
        2.6 * B
      )
      tl.fromTo(
        sweep(person),
        { p: 0 },
        { p: 1, duration: 1.3 * B, ease: 'power2.inOut' },
        3.6 * B
      )
      tl.fromTo(
        '.vn-h7-him',
        { '--ca': 5 },
        { '--ca': 0, duration: 1.6 * B, ease: 'power2.out' },
        3.6 * B
      )
      // the ID lock: brackets appear at both frames' corners and close on him in both at once
      brackets.forEach((b, i) => {
        const [x, y] = BRACKETS[i].from
        tl.fromTo(
          b,
          { opacity: 0, x, y },
          { opacity: 1, x, y, duration: 0.5 * B, ease: 'power1.out' },
          4 * B
        )
        tl.to(
          b,
          { x: 0, y: 0, duration: 1.2 * B, ease: 'power3.inOut' },
          4.5 * B + (i % 4) * 0.04
        )
      })
      // the two locks join, and the tag reads out over the join (the label over the name with it)
      const bar = driver((q) =>
        bars.forEach((p, i) => p.setAttribute('d', trace(BAR[i % 2], q)))
      )
      tl.fromTo(
        bar,
        { p: 0 },
        { p: 1, duration: 0.7 * B, ease: 'power2.out' },
        5.5 * B
      )
      tl.fromTo(
        '.vn-h7-tag, .vn-h7-id',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        5.95 * B
      )
      tl.fromTo(
        '.vn-h7-cap',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8 * B, ease: 'power2.out' },
        6.1 * B
      )

      if (reduce) {
        tl.progress(1)
        sub.textContent = c.sub
        el.dataset.rolled = ''
        return
      }
      el.dataset.rolled = ''
      tl.play(0)
    }, el)
    return () => ctx.revert()
  }, [c.sub])

  return (
    <section
      ref={root}
      id="top"
      className="vn-h7"
      aria-labelledby="vneo-name"
      style={{ '--h7-ar': VW / FH } as CSSProperties}
    >
      <div className="vn-h7-glow" aria-hidden="true" />
      <div className="vn-h7-text">
        <p className="vn-h7-id" aria-hidden="true">
          {c.id}
        </p>
        <h1 id="vneo-name" className="vn-h7-name" data-lens="">
          <span className="vn-h7-n1 fx">{c.first}</span>
          <span className="vn-h7-n2 fx">
            {c.last}
            <span>.</span>
          </span>
        </h1>
        <p className="vn-h7-sub">
          <span className="vn-h7-sub-shown" aria-hidden="true">
            {c.sub}
          </span>
          <span className="v7-vh">{c.sub}</span>
        </p>
        <p className="vn-h7-cred">
          <a href={c.cred.href} target="_blank" rel="noopener">
            {c.cred.text}
          </a>
        </p>
        <nav className="vn-h7-chips" aria-label="On this page">
          {c.chips.map((ch) => (
            <a key={ch.href} className="vn-h7-chip" href={ch.href}>
              {ch.label}
            </a>
          ))}
          <span className="vn-h7-where">{c.where}</span>
        </nav>
      </div>

      <figure className="vn-h7-fig">
        {/* focusable, so a keyboard can bring the matches on him forward the way a pointer does */}
        <div
          className="vn-h7-pair"
          tabIndex={0}
          role="group"
          aria-labelledby="vn-h7-cap"
          style={{ aspectRatio: `${VW} / ${FH}` }}
        >
          {PHOTOS.map((p, i) => (
            <div
              key={p.src}
              className="vn-h7-frame"
              data-f={i + 1}
              style={{ left: pct(i * OX, VW), width: pct(FW, VW) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="vn-h7-photo"
                src={p.src}
                srcSet={`${p.small} 600w, ${p.src} 1050w`}
                sizes={SIZES}
                alt={p.alt}
                width={FW}
                height={FH}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          ))}

          {/* detection: real keypoints, as rings their scale's size */}
          <svg
            className="vn-h7-kp"
            viewBox={VIEW}
            aria-hidden="true"
            focusable="false"
          >
            {RINGS.map(([x, y, r], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={r}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* the matches on the trees: faint, on a dark halo so they hold over bright sky */}
          <svg
            className="vn-h7-scene"
            viewBox={VIEW}
            aria-hidden="true"
            focusable="false"
          >
            <g className="vn-h7-halo">
              {SCENE.map((s, i) => (
                <MatchLine key={i} s={s} i={i} />
              ))}
            </g>
            <g className="vn-h7-core">
              {SCENE.map((s, i) => (
                <MatchLine key={i} s={s} i={i} />
              ))}
              {SCENE.map((s, i) => (
                <MatchDots key={i} s={s} i={i} r={5} />
              ))}
            </g>
          </svg>

          {/* the matches on him: a halo layer, then the lines in the green and magenta fringe */}
          <svg
            className="vn-h7-him-halo"
            viewBox={VIEW}
            aria-hidden="true"
            focusable="false"
          >
            {PERSON.map((s, i) => (
              <MatchLine key={i} s={s} i={i} />
            ))}
            {PERSON.map((s, i) => (
              <MatchDots key={i} s={s} i={i} r={9} />
            ))}
          </svg>
          <svg
            className="vn-h7-him"
            viewBox={VIEW}
            aria-hidden="true"
            focusable="false"
          >
            {PERSON.map((s, i) => (
              <MatchLine key={i} s={s} i={i} />
            ))}
            {PERSON.map((s, i) => (
              <MatchDots key={i} s={s} i={i} r={7} />
            ))}
          </svg>

          {/* the ID lock in both frames, joined (the join's halo under the brackets, its line over them, so the corners stay clean) */}
          <svg
            className="vn-h7-lock"
            viewBox={VIEW}
            aria-hidden="true"
            focusable="false"
          >
            {BAR.map((pts, i) => (
              <path
                key={i}
                className="vn-h7-bar vn-h7-lock-halo"
                d={trace(pts)}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {BRACKETS.map((b, i) => (
              <g key={i} className="vn-h7-br">
                <path
                  className="vn-h7-lock-halo"
                  d={trace(b.pts)}
                  vectorEffect="non-scaling-stroke"
                />
                <path d={trace(b.pts)} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            {BAR.map((pts, i) => (
              <path
                key={i}
                className="vn-h7-bar"
                d={trace(pts)}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
          <span
            className="vn-h7-tag"
            aria-hidden="true"
            style={{ left: pct(MID, VW), top: pct(BAR_Y, FH) }}
          >
            ID lock · {c.first}
          </span>
        </div>
        <figcaption id="vn-h7-cap" className="vn-h7-cap">
          <span className="vn-h7-fig-no">Fig. 0</span>
          <span>
            Two frames, one person: {nf.format(cedars.matches)} matches,{' '}
            {nf.format(cedars.inliers)} kept by RANSAC.
          </span>
        </figcaption>
      </figure>
    </section>
  )
}
