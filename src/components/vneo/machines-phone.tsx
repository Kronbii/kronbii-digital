'use client'

import { useEffect, useRef } from 'react'

import { B, E, clamp, driver, lerp, prog, type Impact } from '@/components/v6/armed'
import { Shot } from '@/components/v6/shot'

import { LABEL, LAPS, PAN, TILT, WORDS } from './machines'
import './machines-phone.css'

/*
 * Three machines, one loop, cut for a phone: a 2:3 column of the stage, so
 * its type reads at a phone's size. The machine's name on top, the three
 * words in a row, and under them one big plate that the loop runs round:
 * the pulse crosses the words, lighting each as the plate pulls that step's
 * footage into focus, then runs back round the plate as the feedback. Each
 * machine once around, then the plate grows and splits into the three by
 * three, a row per machine. The column is composed before it rolls (the
 * words, the loop, the empty plate, the first machine's name), so the frame
 * is never empty while the page catches up. The desktop's own scene is
 * machines.tsx; this one uses its laps, captions, and credits.
 */

/** The part of the 1920 x 1080 stage a phone shows. */
const OX = 600
const CROP: [number, number, number, number] = [OX, 0, 720, 1080]

// the plate, under the words, and its three by three at the end, grown down over the caption's band
const PX = 40
const PY = 376
const PW = 640
const PH = 480
const PH_END = 624
const GAP = 12
const CW = (PW - 2 * GAP) / 3
const CH_END = (PH_END - 2 * GAP) / 3
/** The centre of column k: a word, its node on the loop, its column of the grid. */
const colX = (k: number) => PX + k * (CW + GAP) + CW / 2

// the loop round the plate
const LL = 20
const RR = 700
const TT = 346
const RC = 28
const bottomAt = (m: number) => lerp(PY + PH + 28, PY + PH_END + 28, m)

const START = B
const STEP = 3 * B
const LAP = 3 * STEP
const OUTRO = START + 3 * LAP
const HOLD = OUTRO + 3 * B
/** When plate k lights on lap i: a lap three steps, a step three beats. */
const onAt = (i: number, k: number) => START + i * LAP + k * STEP

const M = '/images/vneo/loop'
/** Each step's picture, cut to the plate's 4:3 window and to the seconds it plays. */
const MEDIA: { src?: string; img?: string; poster?: string; rate?: number }[][] = [
  [
    { img: `${M}/phone-rover-map.jpg` },
    {
      src: `${M}/phone-rover-detection.mp4`,
      poster: `${M}/phone-rover-detection.jpg`,
      rate: 0.88,
    },
    { src: `${M}/phone-rover-arm.mp4`, poster: `${M}/phone-rover-arm.jpg` },
  ],
  [
    {
      src: `${M}/phone-tracker-sensors.mp4`,
      poster: `${M}/phone-tracker-sensors.jpg`,
    },
    {},
    {
      src: `${M}/phone-tracker-servos.mp4`,
      poster: `${M}/phone-tracker-servos.jpg`,
    },
  ],
  [
    { src: `${M}/phone-quad-sense.mp4`, poster: `${M}/phone-quad-sense.jpg` },
    { src: `${M}/phone-quad-decide.mp4`, poster: `${M}/phone-quad-decide.jpg` },
    { src: `${M}/phone-quad-act.mp4`, poster: `${M}/phone-quad-act.jpg` },
  ],
]

/** The loop as a rounded rectangle round the plate: its path, and a point at arc length s along it. */
function loop(bottom: number) {
  const top = RR - LL - 2 * RC
  const side = bottom - TT - 2 * RC
  const q = (Math.PI * RC) / 2
  const legs = [top, q, side, q, top, q, side, q]
  const total = legs.reduce((a, b) => a + b, 0)
  const arc = (cx: number, cy: number, a0: number, k: number): [number, number] => {
    const a = a0 + (k * Math.PI) / 2
    return [cx + RC * Math.cos(a), cy + RC * Math.sin(a)]
  }
  const at = (s: number): [number, number] => {
    s = ((s % total) + total) % total
    const seg = [
      (k: number): [number, number] => [LL + RC + k * top, TT],
      (k: number) => arc(RR - RC, TT + RC, -Math.PI / 2, k),
      (k: number): [number, number] => [RR, TT + RC + k * side],
      (k: number) => arc(RR - RC, bottom - RC, 0, k),
      (k: number): [number, number] => [RR - RC - k * top, bottom],
      (k: number) => arc(LL + RC, bottom - RC, Math.PI / 2, k),
      (k: number): [number, number] => [LL, bottom - RC - k * side],
      (k: number) => arc(LL + RC, TT + RC, Math.PI, k),
    ]
    for (let i = 0; i < 8; i++) {
      if (s <= legs[i]) return seg[i](s / legs[i])
      s -= legs[i]
    }
    return [LL + RC, TT]
  }
  const d = `M ${LL + RC} ${TT} H ${RR - RC} Q ${RR} ${TT} ${RR} ${TT + RC} V ${bottom - RC} Q ${RR} ${bottom} ${RR - RC} ${bottom} H ${LL + RC} Q ${LL} ${bottom} ${LL} ${bottom - RC} V ${TT + RC} Q ${LL} ${TT} ${LL + RC} ${TT} Z`
  const node = (k: number) => colX(k) - (LL + RC)
  return { at, d, total, node }
}

/** The arrowheads: two along the top, between the words, and the feedback's, up the left side into Sense. */
function heads() {
  const right = (x: number) => `M ${x - 9} ${TT - 10} L ${x + 3} ${TT} L ${x - 9} ${TT + 10}`
  const mid = (k: number) => (colX(k) + colX(k + 1)) / 2
  const y = TT + RC + 40
  return `${right(mid(0))} ${right(mid(1))} M ${LL - 10} ${y + 9} L ${LL} ${y - 3} L ${LL + 10} ${y + 9}`
}

/** Where the pulse is, lap beat tau: Sense on 0, Decide on 3, Act on 6, then back round to Sense on 9. */
function pulseAt(l: ReturnType<typeof loop>, tau: number) {
  const n = [l.node(0), l.node(1), l.node(2), l.total + l.node(0)]
  if (tau < 0) return n[0]
  const seg = Math.min(2, Math.floor(tau / 3))
  return lerp(n[seg], n[seg + 1], E.inOut((tau - seg * 3) / 3))
}

/** The light tracker's PID trace, error against time, drawn into the plate's own 640 x 480. */
function trace(amp: number, decay: number, freq: number, phase: number, q: number) {
  const pts: string[] = []
  const n = Math.max(2, Math.round(q * 120))
  for (let j = 0; j <= n; j++) {
    const x = j / 120
    const e = amp * Math.exp(-decay * x) * Math.cos(2 * Math.PI * freq * x + phase)
    pts.push(`${(42 + x * 556).toFixed(1)},${(240 - e * 140).toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
}

const IMPACTS: Impact[] = [0, 1, 2].map((i) => ({
  t: onAt(i, 0),
  k: 0,
  ghost: 0.35,
}))

/** The steps in the order they light, so each one knows the one it covers. */
const ORDER = [0, 1, 2].flatMap((i) => [0, 1, 2].map((k) => [i, k] as const))

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  const $ = <T extends Element = HTMLElement>(s: string) =>
    root.querySelector(s) as T
  const $$ = <T extends Element = HTMLElement>(s: string) =>
    Array.from(root.querySelectorAll(s)) as T[]
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  LAPS.forEach((_, i) => {
    const L = START + i * LAP
    // the first machine is already named when the shot rolls; the next two take its place
    if (i > 0) {
      tl.fromTo(
        `.mp-name-${i}`,
        { opacity: 0, y: 24, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 * B, ease: 'expo.out' },
        L
      )
      tl.fromTo(
        `.mp-n-${i}`,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5 * B, ease: 'expo.out' },
        L
      )
    }
    const out = i < 2 ? L + LAP - 0.3 * B : OUTRO
    tl.to(`.mp-name-${i}`, { opacity: 0, y: -20, duration: 0.4 * B, ease: 'power2.in' }, out)
    tl.to(`.mp-n-${i}`, { opacity: 0, y: -12, duration: 0.3 * B }, out + 0.1 * B)
  })

  ORDER.forEach(([i, k], j) => {
    const on = onAt(i, k)
    // the step comes into focus: blur to sharp, and the fringe converges
    tl.fromTo(
      `.mp-y${i}${k}`,
      { opacity: 0, scale: 1.07, filter: 'blur(18px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9 * B, ease: 'expo.out' },
      on
    )
    if (j > 0) {
      const [pi, pk] = ORDER[j - 1]
      tl.set(`.mp-y${pi}${pk}`, { opacity: 0 }, on + 0.9 * B)
    }
    tl.fromTo(
      '.mp-plate',
      { '--ca': 11 },
      { '--ca': 0, duration: 0.9 * B, ease: 'power3.out', immediateRender: false },
      on
    )
    tl.fromTo(
      '.mp-ring',
      { opacity: 0 },
      { opacity: 1, duration: 0.15 * B, ease: 'none', immediateRender: false },
      on
    )
    tl.to('.mp-ring', { opacity: 0, duration: 0.6 * B, ease: 'none' }, on + 1.9 * B)
    tl.fromTo(
      `.mp-w${k}`,
      { color: 'rgba(238, 241, 236, 0.52)' },
      { color: 'rgba(238, 241, 236, 1)', duration: 0.2 * B, ease: 'none', immediateRender: false },
      on
    )
    if (j < ORDER.length - 1)
      tl.to(
        `.mp-w${k}`,
        { color: 'rgba(238, 241, 236, 0.52)', duration: 0.5 * B, ease: 'none' },
        on + STEP - 0.4 * B
      )
    tl.fromTo(
      `.mp-c${i}${k}`,
      { opacity: 0, x: -14 },
      { opacity: 1, x: 0, duration: 0.6 * B, ease: 'expo.out' },
      on + 0.2 * B
    )
    tl.to(
      `.mp-c${i}${k}`,
      { opacity: 0, duration: 0.25 * B },
      j < ORDER.length - 1 ? on + STEP - 0.15 * B : OUTRO
    )
  })

  // the outro: every word lit, the machines listed up top, the earlier steps back in their cells
  tl.to('.mp-word', { color: 'rgba(238, 241, 236, 1)', duration: 0.6 * B }, OUTRO)
  tl.to('.mp-count', { opacity: 0, duration: 0.4 * B }, OUTRO)
  tl.fromTo(
    '.mp-legend > span',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.7 * B, ease: 'expo.out', stagger: 0.2 * B },
    OUTRO + 0.5 * B
  )
  ORDER.slice(0, -1).forEach(([i, k]) =>
    tl.fromTo(
      `.mp-y${i}${k}`,
      { opacity: 0, filter: 'blur(12px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 0.9 * B, ease: 'expo.out', immediateRender: false },
      OUTRO + (0.5 + i * 0.3) * B
    )
  )
  tl.fromTo(
    '.mp-tag',
    { opacity: 0, x: -10 },
    { opacity: 1, x: 0, duration: 0.6 * B, ease: 'expo.out', stagger: 0.2 * B },
    OUTRO + 1.4 * B
  )

  const plate = $('.mp-plate')
  const layers = ORDER.map(([i, k]) => $(`.mp-y${i}${k}`))
  const inner = layers.map((l) => l.querySelector<HTMLElement>('.mp-in')!)
  const line = $<SVGPathElement>('.mp-loop')
  const fbWord = $('.mp-fb')
  const pulse = $<SVGGElement>('.mp-pulse')
  const comet = $$<SVGCircleElement>('.mp-pulse circle')
  const pan = $<SVGPathElement>('.mp-pid-pan')
  const tilt = $<SVGPathElement>('.mp-pid-tilt')
  const dots = $$<SVGCircleElement>('.mp-pid-dot')
  const map = $('.mp-y00 img')
  const vids = ORDER.map(([i, k]) => ({
    c: MEDIA[i][k],
    on: onAt(i, k),
    v: root.querySelector<HTMLVideoElement>(`.mp-y${i}${k} video`),
  })).filter((x) => x.v)

  const placePulse = (l: ReturnType<typeof loop>, tau: number, alpha: number) => {
    const s = pulseAt(l, tau)
    comet.forEach((el, j) => {
      const [x, y] = l.at(s - j * 13)
      el.setAttribute('cx', x.toFixed(1))
      el.setAttribute('cy', y.toFixed(1))
    })
    pulse.style.opacity = alpha.toFixed(3)
  }

  let lastM = -1
  const frame = (t: number) => {
    const m = E.inOut(prog(t, OUTRO, OUTRO + 2 * B))
    const l = loop(bottomAt(m))
    if (m !== lastM) {
      lastM = m
      const ch = lerp(PH, CH_END, m)
      const cw = lerp(PW, CW, m)
      plate.style.height = `${lerp(PH, PH_END, m)}px`
      ORDER.forEach(([i, k], j) => {
        const el = layers[j]
        el.style.left = `${lerp(0, k * (CW + GAP), m)}px`
        el.style.top = `${lerp(0, i * (CH_END + GAP), m)}px`
        el.style.width = `${cw}px`
        el.style.height = `${ch}px`
        // the whole 4:3 picture in its cell, so no label is cut (the cells run a little taller than 4:3)
        inner[j].style.transform = `translate(-50%, -50%) scale(${Math.min(cw / PW, ch / PH).toFixed(4)})`
      })
      line.setAttribute('d', l.d)
      fbWord.style.top = `${bottomAt(m) - 15}px`
    }

    // the pulse: waiting at Sense until the first step, then once round per step, and on round after
    const lapT = (t - START) / B
    placePulse(l, lapT < 0 ? -1 : lapT % 9, clamp(t / (0.5 * B)))

    // the rover's map drifts in while it is on
    if (map) {
      const k = prog(t, onAt(0, 0), onAt(0, 1) + 0.9 * B)
      map.style.transform = `scale(${(1 + 0.07 * E.soft(k)).toFixed(4)})`
    }

    // the light tracker's PID trace draws while its step is on
    const q = prog(t, onAt(1, 1), onAt(1, 1) + STEP)
    pan.setAttribute('d', trace(...PAN, q))
    tilt.setAttribute('d', trace(...TILT, q))
    ;[PAN, TILT].forEach((p, j) => {
      const e = p[0] * Math.exp(-p[1] * q) * Math.cos(2 * Math.PI * p[2] * q + p[3])
      dots[j].setAttribute('cx', (42 + q * 556).toFixed(1))
      dots[j].setAttribute('cy', (240 - e * 140).toFixed(1))
    })

    // the footage: each clip plays through its step and rests on its last frame
    const ts = tl.timeScale() || 1
    const live = tl.isActive()
    vids.forEach(({ c, on, v }) => {
      const video = v!
      const rate = c.rate ?? 1
      const inside = t >= on && t < on + STEP
      const want = ((clamp(t, on, on + STEP) - on) / ts) * rate
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

  // past the hold the pulse keeps going round, a step every three beats
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
    placePulse(loop(bottomAt(1)), ((HOLD - START) / B + beats) % 9, 1)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

export function MachinesPhoneShot({ replay }: { replay: string }) {
  const near = useRef<HTMLDivElement>(null)

  // the footage loads three screens ahead, the first machine's first; a muted play and pause
  // gets a phone to buffer it (one that saves power refuses, and the posters stand in)
  useEffect(() => {
    const el = near.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const shot = el.closest('.v6-shot')
        const vids = Array.from(el.parentElement?.querySelectorAll('video') ?? [])
        vids.forEach((v, j) => {
          v.preload = 'auto'
          v.load()
          if (j < 2 && shot?.getAttribute('data-state') === 'idle')
            void v
              .play()
              .then(() => {
                if (shot.getAttribute('data-state') !== 'idle') return
                v.pause()
                v.currentTime = 0
              })
              .catch(() => {})
        })
      },
      { rootMargin: '300% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Shot
      scene="vn-machines-phone"
      label={LABEL}
      impacts={IMPACTS}
      build={build}
      hold={HOLD}
      replay={replay}
      crop={CROP}
    >
      <div className="mp-r">
        <div ref={near} className="mp-near" />

        <div className="m mp-count">
          {LAPS.map((_, i) => (
            <span key={i} className={`mp-n mp-n-${i}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
          ))}
          <span className="mp-of">/ 03</span>
        </div>
        {LAPS.map((lap, i) => (
          <div key={lap.name} className={`mp-name mp-name-${i}`}>
            <b>{lap.name}</b>
            <i>{lap.credit}</i>
          </div>
        ))}
        <div className="m mp-legend">
          {LAPS.map((lap, i) => (
            <span key={lap.tag}>
              <b>{String(i + 1).padStart(2, '0')}</b> {lap.tag}
            </span>
          ))}
        </div>

        {WORDS.map((w, k) => (
          <div key={w} className={`mp-word mp-w${k}`} style={{ left: colX(k) }}>
            {w}
            <i>.</i>
          </div>
        ))}

        <svg className="mp-lines" viewBox="0 0 720 1080" aria-hidden="true">
          <path className="mp-loop" />
          <path className="mp-heads" d={heads()} />
          <g className="mp-pulse">
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <circle key={j} r={j ? 8 - j * 1.1 : 9} />
            ))}
          </g>
        </svg>
        <div className="m mp-fb">feedback</div>

        <div className="mp-plate" style={{ left: PX, top: PY, width: PW }}>
          <div className="mp-empty" />
          {ORDER.map(([i, k]) => {
            const c = MEDIA[i][k]
            return (
              <div key={`${i}${k}`} className={`mp-layer mp-y${i}${k}`}>
                <div className="mp-in">
                  {c.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.img} alt="" />
                  ) : c.src ? (
                    <video src={c.src} poster={c.poster} muted playsInline preload="none" />
                  ) : (
                    <div className="mp-pid">
                      <svg viewBox="0 0 640 480">
                        <path className="mp-pid-zero" d="M 42 240 H 598" />
                        <path className="mp-pid-pan" />
                        <path className="mp-pid-tilt" />
                        <circle className="mp-pid-dot mp-pid-dot-pan" r={9} />
                        <circle className="mp-pid-dot mp-pid-dot-tilt" r={9} />
                      </svg>
                      <span className="m mp-pid-key">
                        <b className="g">Pan</b> <b className="mg">Tilt</b> error
                      </span>
                      <span className="m mp-pid-note">Illustration</span>
                    </div>
                  )}
                </div>
                {k === 0 ? (
                  <span className="m mp-tag">{String(i + 1).padStart(2, '0')}</span>
                ) : null}
              </div>
            )
          })}
          <div className="mp-ring" />
        </div>

        {ORDER.map(([i, k]) => (
          <div key={`${i}${k}`} className={`mp-cap mp-c${i}${k}`}>
            {LAPS[i].clips[k].cap}
          </div>
        ))}
      </div>
    </Shot>
  )
}
