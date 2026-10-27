'use client'

import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

import { B, BAR, hash, type Impact } from '@/components/v6/armed'
import { Shot } from '@/components/v6/shot'

import './aim.css'

/*
 * Rā' takes aim, on the About page: the emblem acts out sense, decide, act, as a robot
 * would. Bar one: a small Rā' sweeps a scan across a dark field, the points
 * it passes light, and the ID lock closes on one of them. Bar two: nine
 * possible arcs fan out toward it, the weak ones fade, and all of them swing
 * onto the one it picks, overshooting and settling like a step response,
 * while the bird turns to its heading. Bar three: it flies the arc; at the
 * end of its trail the two wings sweep open, the ر writes itself, and the
 * full mark comes into focus, its green and magenta fringes closing to none.
 * Bar four holds the mark, framed by the lock. Every element is tweened on
 * the shot's timeline, so a replay lands the same.
 */

if (typeof window !== 'undefined') gsap.registerPlugin(MotionPathPlugin)

type V2 = [number, number]
const deg = Math.PI / 180
const dir = (a: number, r = 1): V2 => [Math.cos(a * deg) * r, Math.sin(a * deg) * r]
const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]]
const f = (v: V2) => `${v[0].toFixed(1)} ${v[1].toFixed(1)}`
const cubic = (a: V2, b: V2, c: V2, d: V2) =>
  `M${f(a)} C${f(b)} ${f(c)} ${f(d)}`

/** The emblem's own paths (emblem.tsx), in its 108 x 96 units. */
const UPPER =
  'M12 19 C20 36 46 49.5 111 54 C66 57.5 40 56 26 44 C20 38.5 15.5 30 12 19 Z'
const LOWER =
  'M12 98 C20 76.6 46 59.7 111 54 C66 49.6 40 51.5 26 66.6 C20 73.5 15.5 84.2 12 98 Z'
const RA =
  'M44.5 76 L51 79.5 C50 87.5 44 93.5 36 98 C32.5 100 29.5 102.5 26.5 106 C29 98 33 92.5 38.5 87.5 C42.5 84 44.6 80.5 44.5 76 Z'
/** The ر's spine, top to tail: the pen that writes it. */
const RA_PEN = 'M47.8 77.6 C47 86 41.5 92 35.5 96.5 C31.5 99.5 28.5 102.5 26.5 106'

/** Where the mark lands: its (12, 19) corner, and its scale. Centred, above the words. */
const K = 6.4
const O: V2 = [643.2, 151.6]
const onStage = (x: number, y: number): V2 => [O[0] + (x - 12) * K, O[1] + (y - 19) * K]
/** The beak, which is also the arrowhead: the target, and where the bird lands. */
const BEAK = onStage(111, 54)
const EMBLEM = `translate(${f(O)}) scale(${K}) translate(-12 -19)`
/** The mark's box, for the lock's final frame. */
const BOX = [onStage(12, 19), onStage(111, 106)] as const

/** Where the bird waits, and its sensor's field (degrees from straight ahead). */
const S: V2 = [330, 620]
const A0 = -58
const A1 = 42
const SCAN: V2 = [0.22, 1.6]
const sweptAt = (a: number) =>
  SCAN[0] + ((a - A0) / (A1 - A0)) * (SCAN[1] - SCAN[0])
const TARGET_A =
  Math.atan2(BEAK[1] - S[1], BEAK[0] - S[0]) / deg
const LOCKED = sweptAt(TARGET_A)
const REACH = 1290
const RINGS = [360, 720, 1080]
const arcAt = (r: number) =>
  `M${f(add(S, dir(A0, r)))} A${r} ${r} 0 0 1 ${f(add(S, dir(A1, r)))}`
const SLICES = Array.from({ length: 12 }, (_, i) => {
  const a = -(i + 1) * 1.5
  const b = -i * 1.5
  return {
    d: `M${f(S)} L${f(add(S, dir(a, REACH)))} A${REACH} ${REACH} 0 0 1 ${f(add(S, dir(b, REACH)))} Z`,
    o: 0.2 * (1 - i / 12) ** 1.6,
  }
})

/** The field the scan finds: points in its cone, more of them far than near. */
const DOTS = (() => {
  const out: { p: V2; r: number; t: number }[] = []
  for (let i = 0; out.length < 64 && i < 800; i++) {
    const a = A0 + 3 + hash(i, 3) * (A1 - A0 - 6)
    const p = add(S, dir(a, 200 + Math.sqrt(hash(i, 7)) * 1100))
    if (p[0] < 60 || p[0] > 1860 || p[1] < 60 || p[1] > 790) continue
    if (Math.hypot(p[0] - BEAK[0], p[1] - BEAK[1]) < 110) continue
    // rounded, so the server's and the browser's floating point agree on the markup
    const at = (n: number) => Math.round(n * 10) / 10
    out.push({ p: [at(p[0]), at(p[1])], r: at(2.4 + hash(i, 11) * 2.6), t: sweptAt(a) })
  }
  return out
})()

/** The planner's rollouts: nine arcs toward the target; the middle one is picked. */
const PICK = 4
const HEADING = -41.3
const CANDS = Array.from({ length: 9 }, (_, k) => {
  const u = (k - PICK) / 4
  const end = add(BEAK, [30 * u - 60 * Math.abs(u), 150 * u])
  return {
    u,
    end,
    d: cubic(S, add(S, dir(HEADING + 26 * u, 333)), add(end, [-397, 40 * u]), end),
  }
})
const PATH = CANDS[PICK].d
const STUB = cubic(S, S, S, S)

/** The wings open from the trail: a wedge about the beak, per wing, in the emblem's units. */
const BE: V2 = [111, 54]
const wedge = (a: number, b: number) =>
  `M${f(BE)} L${f(add(BE, dir(a, 200)))} L${f(add(BE, dir(b, 200)))} Z`

/** The lock's corners: [sign x, sign y, path]. */
const CORNERS: [number, number, string][] = [
  [-1, -1, 'M0 30 V0 H30'],
  [1, -1, 'M-30 0 H0 V30'],
  [-1, 1, 'M0 -30 V0 H30'],
  [1, 1, 'M-30 0 H0 V-30'],
]
const FRAME_PAD = 56
const frameAt = (sx: number, sy: number): V2 => [
  sx < 0 ? BOX[0][0] - FRAME_PAD : BOX[1][0] + FRAME_PAD,
  sy < 0 ? BOX[0][1] - FRAME_PAD : BOX[1][1] + FRAME_PAD,
]

const WORDS = ['Sense', 'Decide', 'Act']
const FLY = 0.72
const LAND = 8 * B + FLY

const IMPACTS: Impact[] = [
  { t: 0, k: 0.6, ghost: 0.5 },
  { t: LOCKED + 0.06, k: 0.3, ghost: 0.35 },
  { t: LAND, k: 0.8, ghost: 0.9 },
]
/** On a phone the frame narrows to 4:3: the middle of the stage, the bird's start and the mark. */
const CROP: [number, number, number, number] = [200, 0, 1440, 1080]

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  const q = gsap.utils.selector(root)
  const ag = q('.la-ag')[0]
  gsap.set(ag, { x: S[0], y: S[1], transformOrigin: '100% 40.23%' })
  CORNERS.forEach(([sx, sy], i) =>
    gsap.set(q(`.la-c${i}`), { x: BEAK[0] + sx * 96, y: BEAK[1] + sy * 96 })
  )
  gsap.set('.la-em-m', { x: -2.8 })
  gsap.set('.la-em-g', { x: 2.8 })

  // the words, one at each phase: the one in play lit, the ones before it resting
  WORDS.forEach((_, i) => {
    const at = i * BAR
    tl.fromTo(
      `.la-w${i}`,
      { opacity: 0, y: 26, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.3, ease: 'expo.out' },
      at
    )
    if (i < WORDS.length - 1)
      tl.to(`.la-w${i}`, { opacity: 0.3, duration: 0.25, ease: 'none' }, (i + 1) * BAR)
  })
  tl.to(['.la-w0', '.la-w1'], { opacity: 1, duration: 0.5, ease: 'power2.out' }, LAND + 1.2)

  // sense: the bird wakes, its range draws out, the scan sweeps once and lights what it passes
  tl.fromTo(ag, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'expo.out' }, 0)
  q('.la-ring').forEach((r, i) =>
    tl.to(r, { attr: { 'stroke-dashoffset': 0 }, duration: 0.7, ease: 'power2.out' }, 0.05 + i * 0.08)
  )
  tl.fromTo('.la-beam', { opacity: 0 }, { opacity: 1, duration: 0.08, ease: 'none' }, SCAN[0] - 0.04)
  tl.fromTo(
    '.la-beam',
    { rotation: A0, svgOrigin: f(S) },
    { rotation: A1, svgOrigin: f(S), duration: SCAN[1] - SCAN[0], ease: 'none', immediateRender: true },
    SCAN[0]
  )
  tl.to('.la-beam', { opacity: 0, duration: 0.22, ease: 'none' }, SCAN[1])
  q('.la-dot').forEach((d, i) => {
    const t = DOTS[i].t
    tl.to(d, { opacity: 1, duration: 0.05, ease: 'none' }, t)
    tl.to(d, { opacity: 0.26, duration: 0.55, ease: 'power2.out' }, t + 0.06)
  })
  // the target lights, and the lock closes on it
  tl.to('.la-tg', { opacity: 1, duration: 0.05, ease: 'none' }, LOCKED)
  tl.fromTo(
    '.la-tg-ring',
    { opacity: 0, scale: 2.6, svgOrigin: f(BEAK) },
    { opacity: 1, scale: 1, svgOrigin: f(BEAK), duration: 0.4, ease: 'expo.out' },
    LOCKED
  )
  CORNERS.forEach(([sx, sy], i) => {
    const c = `.la-c${i}`
    tl.to(c, { opacity: 1, duration: 0.05, ease: 'none' }, LOCKED + 0.06 + i * 0.02)
    tl.to(
      c,
      { x: BEAK[0] + sx * 34, y: BEAK[1] + sy * 34, duration: 0.36, ease: 'expo.out' },
      LOCKED + 0.06 + i * 0.02
    )
  })
  tl.fromTo(
    '.la-tag',
    { opacity: 0 },
    { opacity: 1, duration: 0.04, ease: 'none', repeat: 4, yoyo: true },
    LOCKED + 0.12
  )
  tl.to(ag, { rotation: TARGET_A, duration: 0.5, ease: 'back.out(2)' }, 2 * B + 0.1)

  // decide: nine arcs fan out toward the target, the weak ones fade, then all swing onto the pick
  q('.la-cand').forEach((c, i) => {
    const { u } = CANDS[i]
    const at = 4 * B + 0.05 + Math.abs(u) * 0.12
    tl.to(c, { attr: { d: CANDS[i].d }, duration: 0.55, ease: 'expo.out' }, at)
    tl.to(c, { opacity: 0.55, duration: 0.2, ease: 'none' }, at)
    tl.to(c, { opacity: 0.55 - 0.38 * Math.abs(u), duration: 0.35, ease: 'power1.out' }, 5 * B + 0.1 + (1 - Math.abs(u)) * 0.1)
    tl.to(c, { attr: { d: PATH }, duration: 1.05, ease: 'elastic.out(1, 0.42)' }, 6 * B)
    tl.to(c, { opacity: 0, duration: 0.35, ease: 'power1.in' }, 6 * B + 0.6)
  })
  q('.la-end').forEach((e, i) => {
    const { u, end } = CANDS[i]
    const at = 4 * B + 0.05 + Math.abs(u) * 0.12
    tl.to(e, { attr: { cx: end[0], cy: end[1] }, duration: 0.55, ease: 'expo.out' }, at)
    tl.to(e, { opacity: 0.7 - 0.4 * Math.abs(u), duration: 0.2, ease: 'none' }, at + 0.25)
    tl.to(e, { attr: { cx: BEAK[0], cy: BEAK[1] }, duration: 1.05, ease: 'elastic.out(1, 0.42)' }, 6 * B)
    tl.to(e, { opacity: 0, duration: 0.3, ease: 'none' }, 6 * B + 0.55)
  })
  tl.to(ag, { rotation: HEADING, duration: 1.05, ease: 'elastic.out(1, 0.42)' }, 6 * B)
  tl.to('.la-pick', { opacity: 0.9, duration: 0.35, ease: 'power1.out' }, 6 * B + 0.45)

  // act: it flies the arc, drawing its trail; the field and the range let go
  tl.to(
    ag,
    { motionPath: { path: PATH, autoRotate: true }, duration: FLY, ease: 'power2.inOut' },
    8 * B
  )
  tl.to('.la-trail', { attr: { 'stroke-dashoffset': 0 }, duration: FLY, ease: 'power2.inOut' }, 8 * B)
  tl.to('.la-pick', { opacity: 0.22, duration: 0.4, ease: 'none' }, 8 * B)
  tl.to(['.la-dot', '.la-ring'], { opacity: 0, duration: 0.6, ease: 'power1.in' }, 8 * B + 0.1)
  // it lands: the wings sweep open from the trail, the bird becomes the beak, the ر writes itself
  tl.to('.la-em', { opacity: 1, duration: 0.12, ease: 'none' }, LAND - 0.06)
  tl.to('.la-up', { attr: { d: wedge(170, 215) }, duration: 0.62, ease: 'expo.out' }, LAND - 0.05)
  tl.to('.la-lo', { attr: { d: wedge(190, 145) }, duration: 0.62, ease: 'expo.out' }, LAND)
  tl.to(ag, { opacity: 0, duration: 0.2, ease: 'none' }, LAND + 0.02)
  tl.to(['.la-tg', '.la-tg-ring', '.la-tag'], { opacity: 0, duration: 0.15, ease: 'none' }, LAND)
  tl.to(['.la-trail', '.la-pick'], { opacity: 0, duration: 0.6, ease: 'power1.out' }, LAND + 0.25)
  tl.to('.la-pen', { attr: { 'stroke-dashoffset': 0 }, duration: 0.45, ease: 'power2.inOut' }, LAND + 0.4)
  // and comes into focus: the blur pulls to none and the fringes close onto the mark
  tl.to('.la-blur', { attr: { stdDeviation: 0 }, duration: 1.5, ease: 'power3.inOut' }, LAND + 0.3)
  tl.to(['.la-em-m', '.la-em-g'], { x: 0, duration: 1.5, ease: 'power3.inOut' }, LAND + 0.3)
  tl.to(['.la-em-m', '.la-em-g'], { opacity: 0, duration: 0.35, ease: 'none' }, LAND + 1.55)
  // the lock opens out to frame the mark
  CORNERS.forEach(([sx, sy], i) => {
    const [x, y] = frameAt(sx, sy)
    tl.to(`.la-c${i}`, { x, y, opacity: 0.55, duration: 0.8, ease: 'expo.inOut' }, LAND + 0.35)
  })
  tl.fromTo(
    '.la-tag2',
    { opacity: 0 },
    { opacity: 1, duration: 0.04, ease: 'none', repeat: 4, yoyo: true },
    LAND + 1.1
  )
}

function Mark({ mask }: { mask: boolean }) {
  return (
    <>
      <path d={UPPER} mask={mask ? 'url(#la-m-up)' : undefined} />
      <path d={LOWER} mask={mask ? 'url(#la-m-lo)' : undefined} />
      <path d={RA} mask={mask ? 'url(#la-m-ra)' : undefined} />
    </>
  )
}

export function AimShot({ replay }: { replay: string }) {
  return (
    <Shot
      scene="vn-aim"
      label="An illustration: a small version of Rami’s emblem, the archer’s bird Rā’, sweeps a scan across a dark field, lights the points it passes, and locks onto one; nine possible arcs fan out toward it and settle onto one; the bird flies that arc, its two wings sweep open from the trail, the Arabic letter ra writes itself, and the full mark comes into focus, framed, above the words sense, decide, act."
      impacts={IMPACTS}
      build={build}
      hold={4 * BAR}
      replay={replay}
      crop={CROP}
    >
      <svg className="la-svg" viewBox="0 0 1920 1080" aria-hidden="true">
        <defs>
          <filter id="la-glow" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="la-focus" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur className="la-blur" stdDeviation="1.4" />
          </filter>
          <mask id="la-m-up" maskUnits="userSpaceOnUse" x="-100" y="-100" width="400" height="400">
            <path className="la-up" d={wedge(170, 170)} fill="#fff" />
          </mask>
          <mask id="la-m-lo" maskUnits="userSpaceOnUse" x="-100" y="-100" width="400" height="400">
            <path className="la-lo" d={wedge(190, 190)} fill="#fff" />
          </mask>
          <mask id="la-m-ra" maskUnits="userSpaceOnUse" x="-100" y="-100" width="400" height="400">
            <path
              className="la-pen"
              d={RA_PEN}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="1 2"
              strokeDashoffset={1.05}
            />
          </mask>
        </defs>

        {/* sense: the range, the field, the scan, the target */}
        {RINGS.map((r) => (
          <path key={r} className="la-ring" d={arcAt(r)} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />
        ))}
        {DOTS.map(({ p, r }, i) => (
          <circle key={i} className="la-dot" cx={p[0]} cy={p[1]} r={r} />
        ))}
        <g className="la-beam">
          {SLICES.map((s, i) => (
            <path key={i} d={s.d} fillOpacity={s.o} />
          ))}
          <path className="la-beam-line" d={`M${f(S)} L${f(add(S, [REACH, 0]))}`} />
        </g>
        <circle className="la-tg-ring" cx={BEAK[0]} cy={BEAK[1]} r={20} />
        <circle className="la-tg" cx={BEAK[0]} cy={BEAK[1]} r={7} />

        {/* decide: the rollouts and the pick */}
        {CANDS.map((_, i) => (
          <path key={i} className="la-cand" d={STUB} />
        ))}
        {CANDS.map((_, i) => (
          <circle key={i} className="la-end" cx={S[0]} cy={S[1]} r={6} />
        ))}
        <path className="la-pick" d={PATH} />

        {/* act: the trail, the mark, the bird */}
        <path className="la-trail" d={PATH} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1.05} />
        <g className="la-em" transform={EMBLEM} filter="url(#la-focus)">
          <g className="la-em-m">
            <Mark mask />
          </g>
          <g className="la-em-g">
            <Mark mask />
          </g>
          <g className="la-em-s">
            <Mark mask />
          </g>
        </g>
        <g className="la-ag">
          <g transform="scale(0.78) translate(-111 -54)">
            <Mark mask={false} />
          </g>
        </g>

        {CORNERS.map(([, , d], i) => (
          <path key={i} className={`la-c la-c${i}`} d={d} />
        ))}
      </svg>

      <div
        className="m la-tag"
        style={{ left: BEAK[0] - 34, top: BEAK[1] - 34 - 44 }}
      >
        Target
      </div>
      <div
        className="m la-tag2"
        style={{ left: BOX[0][0] - FRAME_PAD, top: BOX[0][1] - FRAME_PAD - 44 }}
      >
        ID lock · Rā’
      </div>
      <div className="la-words">
        {WORDS.map((w, i) => (
          <span key={w} className={`la-w la-w${i}`}>
            {w}
            <i>.</i>
          </span>
        ))}
      </div>
    </Shot>
  )
}
