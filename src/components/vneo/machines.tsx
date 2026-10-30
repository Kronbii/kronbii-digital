'use client'

import { useEffect, useRef } from 'react'

import { B, E, clamp, driver, lerp, prog, type Impact } from '@/components/v6/armed'
import { Shot, ShotModeContext } from '@/components/v6/shot'
import { vneo } from '@/content/vneo/site'

import { MachinesPhoneShot } from './machines-phone'
import './machines.css'
import { Slate } from './slate'
import { PHONE, usePhone } from './use-phone'

/*
 * Three machines, one loop, after the selected projects: sense, decide, act as a block diagram
 * with its feedback path, run once per machine in that machine's own footage.
 * A pulse travels the loop; each plate comes into focus as it arrives, with a
 * green and magenta fringe that converges, and plays its clip. Lap one is
 * the demining rover, lap two the PID light tracker, lap three the rotor-fault
 * quadrotor in simulation. Then the three laps stack into one grid, rows by
 * machine, and the pulse keeps going round. Every clip's frame is a pure
 * function of the shot's time, so a replay or a jump to the end lands the same.
 */

const W = 400
const H = 300
const X = [280, 760, 1240]
const LAP = 6 * B
const START = 2 * B
const OUTRO = 21 * B
const HOLD = 24 * B

type Region = [x: number, y: number, w: number, h: number]
interface Clip {
  /** A video, or a still when `img` is set; neither: the plate draws its own (the PID trace). */
  src?: string
  img?: string
  poster?: string
  /** The source's size, and the part of it the plate shows (cover-fitted). */
  size?: [number, number]
  region?: Region
  /** Where in the video the plate starts, and how fast it plays. */
  from?: number
  rate?: number
  cap: string
}
interface Lap {
  name: string
  credit: string
  tag: string
  clips: [Clip, Clip, Clip]
}

const A = '/images/authority'
/** The clips, cut from each project's own videos to the seconds the plates play, and scaled to the plates. */
const L = '/images/vneo/loop'
const SIM = `${L}/quad-sim.mp4`
const SIM_POSTER = `${L}/quad-sim.jpg`

export const LAPS: Lap[] = [
  {
    name: 'The demining rover',
    credit: 'At RHU, for a Lebanese Army initiative, with Wassim Ghaddar',
    tag: 'Demining rover',
    clips: [
      {
        img: `${A}/landmine/rviz-costmap.jpg`,
        size: [608, 1080],
        region: [0, 330, 608, 456],
        cap: 'LiDAR SLAM: the map in RViz',
      },
      {
        src: `${L}/rover-detection.mp4`,
        poster: `${L}/rover-detection.jpg`,
        size: [854, 480],
        region: [107, 0, 640, 480],
        from: 0,
        rate: 0.88,
        cap: 'Finds the target and stops',
      },
      {
        src: `${L}/rover-arm.mp4`,
        poster: `${L}/rover-arm.jpg`,
        size: [636, 360],
        region: [80, 0, 480, 360],
        from: 0,
        cap: 'The 6-DoF arm lifts it away',
      },
    ],
  },
  {
    name: 'The PID light tracker',
    credit: 'With Wassim Ghaddar on hardware',
    tag: 'Light tracker',
    clips: [
      {
        src: `${L}/tracker-sensors.mp4`,
        poster: `${L}/tracker-sensors.jpg`,
        size: [540, 960],
        region: [0, 120, 540, 405],
        from: 0,
        cap: 'Four light sensors under a shade',
      },
      { cap: 'A PID loop on each axis' },
      {
        src: `${L}/tracker-servos.mp4`,
        poster: `${L}/tracker-servos.jpg`,
        size: [540, 960],
        region: [0, 465, 540, 405],
        from: 0,
        cap: 'Two servos follow the lamp',
      },
    ],
  },
  {
    name: 'Rotor-fault recovery',
    credit: 'A 5-inch quadrotor, in simulation',
    tag: 'Rotor-fault quad',
    clips: [
      {
        src: SIM,
        poster: SIM_POSTER,
        size: [960, 540],
        region: [577.5, 112.5, 240, 180],
        from: 0,
        cap: 'Gyro, accelerometer, velocity',
      },
      {
        src: SIM,
        poster: SIM_POSTER,
        size: [960, 540],
        region: [37.5, 364.5, 234, 175.5],
        from: 0.3,
        cap: 'Flags the lost rotor in 22 ms',
      },
      {
        src: SIM,
        poster: SIM_POSTER,
        size: [960, 540],
        region: [577.5, 112.5, 240, 180],
        from: 6.3,
        cap: 'Gives up yaw, holds its hover',
      },
    ],
  },
]
export const WORDS = ['Sense', 'Decide', 'Act']

/** When plate k lights on lap i: a lap a bar and a half, a plate every two beats. */
const onAt = (i: number, k: number) => START + i * LAP + k * 2 * B

/** The cover-fitted placement of a clip's region in its plate, kept centred as the plate changes shape. */
function place(c: Clip): React.CSSProperties {
  if (!c.size || !c.region) return {}
  const [sw, sh] = c.size
  const [rx, ry, rw, rh] = c.region
  const s = Math.max(W / rw, H / rh)
  const cx = (rx + rw / 2) * s
  const cy = (ry + rh / 2) * s
  return {
    width: sw * s,
    height: sh * s,
    marginLeft: -cx,
    marginTop: -cy,
    transformOrigin: `${cx}px ${cy}px`,
  }
}

/** The diagram's geometry at morph m: 0 is the loop of three plates, 1 the three-by-three grid. */
function geo(m: number) {
  const label = lerp(372, 150, m)
  const top = lerp(486, 226, m)
  const h = lerp(H, 616, m)
  const strip = lerp(H, 196, m)
  const cy = top + h / 2
  const bottom = top + h
  return { label, top, h, strip, cy, bottom, run: bottom + 87 }
}
type Geo = ReturnType<typeof geo>
const R = 36

function feedback(g: Geo) {
  const { bottom, run } = g
  return `M 1440 ${bottom} V ${run - R} Q 1440 ${run} ${1440 - R} ${run} H ${480 + R} Q 480 ${run} 480 ${run - R} V ${bottom + 4}`
}
const head = (g: Geo) =>
  `M 468 ${g.bottom + 20} L 480 ${g.bottom + 6} L 492 ${g.bottom + 20}`
const arrows = (g: Geo) =>
  [692, 1172]
    .map(
      (x) =>
        `M ${x} ${g.cy} H ${x + 54} M ${x + 44} ${g.cy - 9} L ${x + 56} ${g.cy} L ${x + 44} ${g.cy + 9}`
    )
    .join(' ')

/** The loop as one route, for the pulse: up into Sense, across, down out of Act, and back under. */
function route(g: Geo) {
  const q = (Math.PI * R) / 2
  const pts: [number, number][] = [
    [480, g.bottom],
    [480, g.cy],
    [1440, g.cy],
    [1440, g.run - R],
  ]
  const legs = [g.cy - g.bottom, 960, g.run - R - g.cy].map(Math.abs)
  const run = 960 - 2 * R
  const up = g.run - R - g.bottom
  const total = legs[0] + legs[1] + legs[2] + q + run + q + up
  const at = (s: number): [number, number] => {
    s = ((s % total) + total) % total
    for (let i = 0; i < 3; i++) {
      if (s <= legs[i]) {
        const k = s / legs[i]
        return [
          lerp(pts[i][0], pts[i + 1][0], k),
          lerp(pts[i][1], pts[i + 1][1], k),
        ]
      }
      s -= legs[i]
    }
    if (s <= q) {
      const a = (s / q) * (Math.PI / 2)
      return [1440 - R + R * Math.cos(a), g.run - R + R * Math.sin(a)]
    }
    s -= q
    if (s <= run) return [1440 - R - s, g.run]
    s -= run
    if (s <= q) {
      const a = Math.PI / 2 + (s / q) * (Math.PI / 2)
      return [480 + R + R * Math.cos(a), g.run - R + R * Math.sin(a)]
    }
    s -= q
    return [480, g.run - R - s]
  }
  // where the pulse is at each beat of a lap: into Sense on 0, Decide on 2, Act on 4, out of Act, back under to 6
  const across = (x: number) => legs[0] + (x - 480)
  const keys: [number, number][] = [
    [0, 0],
    [1.6, across(680)],
    [2, across(760)],
    [3.6, across(1160)],
    [4, across(1240)],
    [4.9, legs[0] + legs[1] + (g.bottom - g.cy)],
    [6, total],
  ]
  const s = (tau: number) => {
    for (let i = 1; i < keys.length; i++) {
      const [t1, s1] = keys[i]
      const [t0, s0] = keys[i - 1]
      if (tau <= t1) {
        const k = (tau - t0) / (t1 - t0)
        return lerp(s0, s1, i === keys.length - 1 ? E.soft(k) : k)
      }
    }
    return total
  }
  return { at, s }
}

/** The PID trace's two axes, error against time, settling onto the light. */
function trace(amp: number, decay: number, freq: number, phase: number, q: number) {
  const pts: string[] = []
  const n = Math.max(2, Math.round(q * 120))
  for (let j = 0; j <= n; j++) {
    const x = (j / 120) * 1
    const e = amp * Math.exp(-decay * x) * Math.cos(2 * Math.PI * freq * x + phase)
    pts.push(`${(26 + x * 348).toFixed(1)},${(150 - e * 88).toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}
export const PAN = [0.9, 4.2, 2.1, 0] as const
export const TILT = [-0.62, 3.4, 1.8, 0.35] as const

const IMPACTS: Impact[] = [0, 1, 2].map((i) => ({
  t: onAt(i, 0),
  k: 0,
  ghost: 0.35,
}))

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  const $ = <T extends Element = HTMLElement>(s: string) =>
    root.querySelector(s) as T
  const $$ = <T extends Element = HTMLElement>(s: string) =>
    Array.from(root.querySelectorAll(s)) as T[]
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  // the diagram arrives: the words, the empty plates, then the lines draw
  tl.fromTo(
    '.lm-word',
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.7 * B, ease: 'expo.out', stagger: 0.25 * B },
    0
  )
  tl.fromTo(
    '.lm-empty',
    { opacity: 0, scale: 0.96 },
    { opacity: 1, scale: 1, duration: 0.8 * B, ease: 'expo.out', stagger: 0.2 * B },
    0.3 * B
  )
  tl.fromTo(
    '.lm-draw',
    { strokeDashoffset: 1 },
    { strokeDashoffset: 0, duration: 1.1 * B, ease: 'power2.inOut', stagger: 0.15 * B },
    0.8 * B
  )
  tl.fromTo(
    '.lm-fb-word',
    { opacity: 0 },
    { opacity: 1, duration: 0.5 * B, ease: 'none' },
    1.5 * B
  )
  tl.fromTo('.lm-count', { opacity: 0 }, { opacity: 1, duration: 0.4 * B }, START)

  LAPS.forEach((_, i) => {
    const L = START + i * LAP
    // the machine's name, in on its lap, out as the next one comes
    tl.fromTo(
      `.lm-name-${i}`,
      { opacity: 0, y: 30, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 * B, ease: 'expo.out' },
      L
    )
    tl.to(
      `.lm-name-${i}`,
      { opacity: 0, y: -24, duration: 0.4 * B, ease: 'power2.in' },
      i < 2 ? L + LAP - 0.3 * B : OUTRO
    )
    tl.fromTo(
      `.lm-n-${i}`,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5 * B, ease: 'expo.out' },
      L
    )
    if (i < 2) tl.to(`.lm-n-${i}`, { opacity: 0, y: -14, duration: 0.3 * B }, L + LAP - 0.2 * B)

    for (let k = 0; k < 3; k++) {
      const on = onAt(i, k)
      // the plate comes into focus: blur to sharp, and the fringe converges
      tl.fromTo(
        `.lm-y${k}${i}`,
        { opacity: 0, scale: 1.07, filter: 'blur(18px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9 * B, ease: 'expo.out' },
        on
      )
      if (i > 0) tl.set(`.lm-y${k}${i - 1}`, { opacity: 0 }, on + 0.9 * B)
      tl.fromTo(
        `.lm-p${k}`,
        { '--ca': 11 },
        { '--ca': 0, duration: 0.9 * B, ease: 'power3.out', immediateRender: false },
        on
      )
      tl.fromTo(
        `.lm-p${k} .lm-ring`,
        { opacity: 0 },
        { opacity: 1, duration: 0.15 * B, ease: 'none', immediateRender: false },
        on
      )
      tl.to(`.lm-p${k} .lm-ring`, { opacity: 0, duration: 0.5 * B, ease: 'none' }, on + 1.7 * B)
      tl.fromTo(
        `.lm-w${k}`,
        { color: 'rgba(238, 241, 236, 0.52)' },
        { color: 'rgba(238, 241, 236, 1)', duration: 0.2 * B, ease: 'none', immediateRender: false },
        on
      )
      tl.to(
        `.lm-w${k}`,
        { color: 'rgba(238, 241, 236, 0.52)', duration: 0.5 * B, ease: 'none' },
        on + 1.8 * B
      )
      tl.fromTo(
        `.lm-c${k}${i}`,
        { opacity: 0, x: -14 },
        { opacity: 1, x: 0, duration: 0.6 * B, ease: 'expo.out' },
        on + 0.2 * B
      )
      if (i < 2) tl.to(`.lm-c${k}${i}`, { opacity: 0, duration: 0.2 * B }, onAt(i + 1, k))
      else tl.to(`.lm-c${k}${i}`, { opacity: 0, duration: 0.4 * B }, OUTRO)
    }
  })

  // the outro: the words all lit, the laps stack into rows, each row named
  tl.to('.lm-word', { color: 'rgba(238, 241, 236, 1)', duration: 0.6 * B }, OUTRO)
  tl.to(['.lm-empty', '.lm-count'], { opacity: 0, duration: 0.6 * B }, OUTRO)
  // the earlier laps come back as the grid opens, a row at a time
  ;[0, 1].forEach((i) =>
    tl.fromTo(
      [0, 1, 2].map((k) => `.lm-y${k}${i}`),
      { opacity: 0, filter: 'blur(12px)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.9 * B,
        ease: 'expo.out',
        immediateRender: false,
      },
      OUTRO + (0.5 + i * 0.3) * B
    )
  )
  tl.fromTo(
    '.lm-tag',
    { opacity: 0, x: -12 },
    { opacity: 1, x: 0, duration: 0.6 * B, ease: 'expo.out', stagger: 0.2 * B },
    OUTRO + 1.4 * B
  )

  const words = $$('.lm-word')
  const plates = $$('.lm-plate')
  const layers = plates.map((p) => Array.from(p.querySelectorAll<HTMLElement>('.lm-layer')))
  const caps = $$('.lm-cap')
  const fb = $<SVGPathElement>('.lm-fb')
  const fbHead = $<SVGPathElement>('.lm-fb-head')
  const arr = $<SVGPathElement>('.lm-arrows')
  const fbWord = $('.lm-fb-word')
  const pulse = $<SVGGElement>('.lm-pulse')
  const comet = $$<SVGCircleElement>('.lm-pulse circle')
  const pan = $<SVGPathElement>('.lm-pid-pan')
  const tilt = $<SVGPathElement>('.lm-pid-tilt')
  const dots = $$<SVGCircleElement>('.lm-pid-dot')
  const vids = LAPS.flatMap((lap, i) =>
    lap.clips.map((c, k) => ({
      c,
      on: onAt(i, k),
      v: root.querySelector<HTMLVideoElement>(`.lm-y${k}${i} video`),
    }))
  ).filter((x) => x.v && x.c.from != null)
  const still = layers[0][0].querySelector<HTMLElement>('.lm-media')

  let lastM = -1
  const placePulse = (g: Geo, tau: number, alpha: number) => {
    const r = route(g)
    const s = r.s(tau)
    comet.forEach((el, j) => {
      const [x, y] = r.at(s - j * 14)
      el.setAttribute('cx', x.toFixed(1))
      el.setAttribute('cy', y.toFixed(1))
    })
    pulse.style.opacity = alpha.toFixed(3)
  }

  const frame = (t: number) => {
    const m = E.inOut(prog(t, OUTRO, OUTRO + 2 * B))
    const g = geo(m)
    if (m !== lastM) {
      lastM = m
      words.forEach((w) => (w.style.top = `${g.label}px`))
      caps.forEach((c) => (c.style.top = `${g.label + 72}px`))
      plates.forEach((p) => {
        p.style.top = `${g.top}px`
        p.style.height = `${g.h}px`
      })
      layers.forEach((ls) =>
        ls.forEach((l, i) => {
          l.style.top = `${lerp(0, i * 210, m)}px`
          l.style.height = `${g.strip}px`
        })
      )
      fb.setAttribute('d', feedback(g))
      fbHead.setAttribute('d', head(g))
      arr.setAttribute('d', arrows(g))
      fbWord.style.top = `${g.run - 13}px`
    }

    // the pulse: in from under the loop before lap one, round every lap, and on round after
    const lapT = (t - START) / B
    const tau = lapT < 0 ? 6 + lapT : lapT % 6
    placePulse(g, tau, clamp((t - 1.4 * B) / (0.4 * B)))

    // the rover's map drifts in while it is on
    if (still) {
      const k = prog(t, onAt(0, 0), onAt(0, 0) + LAP)
      still.style.transform = `scale(${(1 + 0.07 * E.soft(k)).toFixed(4)})`
    }

    // the light tracker's PID trace draws while its plate is on
    const q = prog(t, onAt(1, 1), onAt(1, 1) + 4 * B)
    pan.setAttribute('d', trace(...PAN, q))
    tilt.setAttribute('d', trace(...TILT, q))
    ;[PAN, TILT].forEach((p, j) => {
      const x = q
      const e = p[0] * Math.exp(-p[1] * x) * Math.cos(2 * Math.PI * p[2] * x + p[3])
      dots[j].setAttribute('cx', (26 + x * 348).toFixed(1))
      dots[j].setAttribute('cy', (150 - e * 88).toFixed(1))
    })

    // the footage: each clip plays through its plate's window and rests on that window's last frame
    const ts = tl.timeScale() || 1
    const live = tl.isActive()
    vids.forEach(({ c, on, v }) => {
      const video = v!
      const rate = c.rate ?? 1
      const span = LAP
      const inside = t >= on && t < on + span
      const want = c.from! + ((clamp(t, on, on + span) - on) / ts) * rate
      if (inside && live) {
        video.playbackRate = rate
        if (video.paused) {
          video.currentTime = want
          void video.play().catch(() => {})
        } else if (Math.abs(video.currentTime - want) > 0.4) video.currentTime = want
      } else {
        if (!video.paused) video.pause()
        if (Math.abs(video.currentTime - want) > 0.04) video.currentTime = want
      }
    })
  }

  frame(0)
  tl.to(driver((p) => frame(p * HOLD)), { p: 1, duration: HOLD, ease: 'none' }, 0)

  // past the hold the pulse keeps going round, at the lap's pace
  let raf = 0
  let doneAt = 0
  const tick = () => {
    raf = requestAnimationFrame(tick)
    if (reduce || tl.isActive() || tl.progress() < 1) {
      doneAt = 0
      return
    }
    if (!doneAt) doneAt = performance.now()
    const beats = (performance.now() - doneAt) / 1000 / (B / (tl.timeScale() || 1))
    placePulse(geo(1), (4 + beats) % 6, 1)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

export const LABEL =
  'Three machines, each run once around a loop of sense, decide, act, in its own footage: the demining rover’s map in RViz, the rover finding a red stand-in target and stopping, and its arm lifting it away; the light tracker’s four light sensors under their shade, a PID trace settling on each axis, and the tracker turning to follow a lamp; and, in simulation, a 5-inch quadrotor losing a rotor, the fault flagged in 22 ms, and the drone spinning on to hold its hover. Then the three laps stack into one grid, a row for each machine, and a pulse keeps going round the loop.'

export function MachinesShot({ replay }: { replay: string }) {
  const near = useRef<HTMLDivElement>(null)

  // the footage loads once the shot is near (a phone swaps in its own cut first, and loads that instead)
  useEffect(() => {
    const el = near.current
    if (!el || matchMedia(PHONE).matches) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        el.parentElement
          ?.querySelectorAll('video')
          .forEach((v) => {
            v.preload = 'auto'
            v.load()
          })
      },
      { rootMargin: '150% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Shot
      scene="vn-machines"
      label={LABEL}
      impacts={IMPACTS}
      build={build}
      hold={HOLD}
      replay={replay}
      crop={[240, 0, 1440, 1080]}
    >
      <div ref={near} className="lm-near" />
      <svg className="lm-lines" viewBox="0 0 1920 1080" aria-hidden="true">
        <path className="lm-draw lm-arrows" pathLength={1} />
        <path className="lm-draw lm-fb" pathLength={1} />
        <path className="lm-draw lm-fb-head" pathLength={1} />
        <g className="lm-pulse">
          {[0, 1, 2, 3, 4, 5].map((j) => (
            <circle key={j} r={j ? 9 - j * 1.3 : 10} data-j={j} />
          ))}
        </g>
      </svg>
      <div className="lm-fb-word m">feedback</div>

      <div className="m lm-count">
        {LAPS.map((_, i) => (
          <span key={i} className={`lm-n lm-n-${i}`}>
            {String(i + 1).padStart(2, '0')}
          </span>
        ))}
        <span className="lm-of">/ 03</span>
      </div>
      {LAPS.map((lap, i) => (
        <div key={lap.name} className={`lm-name lm-name-${i}`}>
          <b>{lap.name}</b>
          <i>{lap.credit}</i>
        </div>
      ))}

      {WORDS.map((w, k) => (
        <div
          key={w}
          className={`lm-word lm-w${k}`}
          style={{ left: X[k] }}
        >
          {w}
          <i>.</i>
        </div>
      ))}
      {LAPS.map((lap, i) =>
        lap.clips.map((c, k) => (
          <div
            key={`${i}${k}`}
            className={`lm-cap lm-c${k}${i}`}
            style={{ left: X[k] }}
          >
            {c.cap}
          </div>
        ))
      )}

      {WORDS.map((w, k) => (
        <div key={w} className={`lm-plate lm-p${k}`} style={{ left: X[k] }}>
          <div className="lm-empty" />
          {LAPS.map((lap, i) => {
            const c = lap.clips[k]
            return (
              <div key={i} className={`lm-layer lm-y${k}${i}`}>
                {c.img ? (
                  <div className="lm-media lm-still" style={place(c)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.img} alt="" />
                  </div>
                ) : c.src ? (
                  <video
                    className="lm-media"
                    style={place(c)}
                    src={c.src}
                    poster={c.poster}
                    muted
                    playsInline
                    preload="none"
                  />
                ) : (
                  <div className="lm-pid">
                    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                      <path className="lm-pid-zero" d="M 26 150 H 374" />
                      <path className="lm-pid-pan" />
                      <path className="lm-pid-tilt" />
                      <circle className="lm-pid-dot lm-pid-dot-pan" r={6} />
                      <circle className="lm-pid-dot lm-pid-dot-tilt" r={6} />
                    </svg>
                    <span className="m lm-pid-key">
                      <b className="g">Pan</b> <b className="mg">Tilt</b> error
                    </span>
                    <span className="m lm-pid-note">Illustration</span>
                  </div>
                )}
                {k === 0 ? <span className="m lm-tag">{lap.tag}</span> : null}
              </div>
            )
          })}
          <div className="lm-ring" />
        </div>
      ))}
    </Shot>
  )
}

const CALM = { calm: true, speed: 0.75 }

/** The section after the selected projects: the loop, once around each machine (a phone plays its portrait cut). */
export function Laps() {
  const c = vneo.laps
  const phone = usePhone()
  return (
    <section id="laps" className="vn-laps vn-replays" aria-labelledby="laps-h">
      <Slate
        no={c.no}
        label={c.label}
        title={c.title}
        hot={c.hot}
        id="laps-h"
      />
      <div className="vn-laps-frame">
        <ShotModeContext.Provider value={CALM}>
          {phone ? (
            <MachinesPhoneShot replay={c.replay} />
          ) : (
            <MachinesShot replay={c.replay} />
          )}
        </ShotModeContext.Provider>
      </div>
    </section>
  )
}
