'use client'

import {
  B,
  BAR,
  E,
  clamp,
  driver,
  lerp,
  prog,
  type Impact,
} from '@/components/v6/armed'
import { Shot } from '@/components/v6/shot'

import './light.css'

/*
 * Through the lens, on the light tracker's page: light, the way the machines meet it, carried by
 * chromatic aberration. Bar one (sense): a lamp's light crosses a lens and
 * splits green and magenta, landing soft on the sensor, which reads the raw,
 * low-resolution thermal frame. Bar two (decide): a second element closes the
 * lens into an achromat, both colours meet in one point, and the frame
 * resolves three times over, as the thermal super-resolution model does. Bars
 * three and four (act): the light moves and the head turns after it,
 * overshooting a little and settling, as the two-axis light tracker does in
 * its own footage. Every frame is a pure function of the shot's time.
 */

const HOLD = 4 * BAR
const T_DECIDE = BAR
const T_ACT = 2 * BAR
/** The bench, in stage pixels: optical axis, lens, sensor, lamp, plate. */
const AX = 480
const LX = 600
const LH = 124
const SX = 960
const SH = 104
const SRC_X = 300
/** The rays leave the lamp for these heights on the lens. */
const RAYS = [-1, -0.66, -0.33, 0, 0.33, 0.66, 1].map((k) => k * (LH - 12))
/** Where each colour comes to focus before the achromat closes: magenta short, green long. */
const FOCUS_M = 830
const FOCUS_G = 1130
/** Seconds into the tracker's footage where the shot picks it up: the lamp starts to move. */
const VIDEO_FROM = 6.5
const CROP: [number, number, number, number] = [240, 0, 1440, 1080]
const IMPACTS: Impact[] = [
  { t: 0, k: 0, ghost: 0.7 },
  { t: T_ACT, k: 0, ghost: 0.35 },
]

const LABEL =
  'An illustration: light from a lamp passes a lens and splits into green and magenta, landing soft on a sensor that reads a raw, low-resolution thermal street scene; a second lens element joins, both colours meet in one point, and the frame resolves three times sharper; then the lamp moves and the head turns to follow it, beside footage of the two-axis light tracker doing the same. The words sense, decide, act appear in turn.'

/** SVG's rotate(deg, cx, cy): positive turns clockwise on screen, so the head looks up-left. */
function turn(x: number, y: number, deg: number, cx = LX, cy = AX) {
  const r = (deg * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]
}

/** Smooth steps between keyframes [time, value]. */
function keys(t: number, k: [number, number][]) {
  if (t <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0])
      return lerp(
        k[i - 1][1],
        k[i][1],
        E.inOut(prog(t, k[i - 1][0], k[i][0]))
      )
  }
  return k[k.length - 1][1]
}

/** The lamp's height while it is moved, as the tracker's lamp is in its footage. */
const lampY = (t: number) =>
  keys(t, [
    [T_ACT + 0.5 * B, AX],
    [T_ACT + 2.6 * B, AX - 95],
    [T_ACT + 5.4 * B, AX + 80],
    [T_ACT + 7.6 * B, AX],
  ])
const lampAngle = (t: number) =>
  (Math.atan2(AX - lampY(t), LX - SRC_X) * 180) / Math.PI

/**
 * The head's angle: a damped follower of the lamp (a little overshoot, then
 * it settles), integrated from the start of the act at a fixed step so it is
 * the same for the same time; the last state is kept to step on from.
 */
function follower() {
  const DT = 1 / 240
  const W = 2 * Math.PI * 0.95
  const Z = 0.48
  let at = T_ACT
  let b = 0
  let v = 0
  return (t: number) => {
    if (t < at) {
      at = T_ACT
      b = 0
      v = 0
    }
    while (at + DT <= t) {
      const a = lampAngle(at)
      v += (W * W * (a - b) - 2 * Z * W * v) * DT
      b += v * DT
      at += DT
    }
    return b
  }
}

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  const q = <T extends Element>(s: string) => root.querySelector(s) as T
  const qa = <T extends Element>(s: string) =>
    Array.from(root.querySelectorAll(s)) as T[]
  const lamp = q<SVGGElement>('.ll-lamp')
  const head = q<SVGGElement>('.ll-head')
  const lens = q<SVGPathElement>('.ll-crown')
  const flint = q<SVGPathElement>('.ll-flint')
  const sensor = q<SVGRectElement>('.ll-sensor')
  const spot = q<SVGCircleElement>('.ll-spot')
  const cone = q<SVGPolygonElement>('.ll-cone')
  const coneM = q<SVGPolygonElement>('.ll-cone-m')
  const coneG = q<SVGPolygonElement>('.ll-cone-g')
  const rays = qa<SVGLineElement>('.ll-ray')
  const raysM = qa<SVGLineElement>('.ll-ray-m')
  const raysG = qa<SVGLineElement>('.ll-ray-g')
  const proj = qa<SVGLineElement>('.ll-proj')
  const plate = q<HTMLElement>('.ll-plate')
  const raw = q<HTMLElement>('.ll-base')
  const fg = q<HTMLElement>('.ll-fg')
  const fm = q<HTMLElement>('.ll-fm')
  const coarse = q<HTMLElement>('.ll-coarse')
  const clip = q<HTMLElement>('.ll-clip')
  const clipIn = q<HTMLElement>('.ll-clip-in')
  const fine = q<HTMLElement>('.ll-fine')
  const sweep = q<HTMLElement>('.ll-sweep')
  const act = q<HTMLElement>('.ll-act')
  const video = q<HTMLVideoElement>('.ll-vid')
  const caps = qa<HTMLElement>('.ll-cap')
  const chip = q<HTMLElement>('.ll-chip')
  const head0 = follower()

  const set = (el: Element, a: Record<string, number | string>) => {
    for (const k in a) el.setAttribute(k, String(a[k]))
  }

  const draw = (t: number) => {
    // sense: the light arrives, the lens shows, the colours part on the way to the sensor
    const pIn = E.out(prog(t, 0.05, 1.3 * B))
    const pLens = E.out(prog(t, 0.3 * B, 1.3 * B))
    const pOut = E.out(prog(t, 1.0 * B, 2.3 * B))
    const pSensor = E.out(prog(t, 1.5 * B, 2.6 * B))
    // decide: the second element closes the lens, the focus meets on the sensor
    const pFlint = E.out(prog(t, T_DECIDE, T_DECIDE + 1.0 * B))
    const c = E.inOut(prog(t, T_DECIDE + 0.4 * B, T_DECIDE + 2.8 * B))
    const pSweep = E.inOut(prog(t, T_DECIDE + 0.8 * B, T_DECIDE + 3.4 * B))
    // act: the plate turns to the tracker, the lamp moves, the head follows
    const pAct = E.soft(prog(t, T_ACT, T_ACT + 1.4 * B))

    const a = lampAngle(t)
    const b = t > T_ACT ? head0(t) : 0
    const ly = lampY(t)
    const th = ((a - b) * Math.PI) / 180

    set(lamp, {
      transform: `translate(${SRC_X} ${ly.toFixed(2)})`,
      opacity: pIn.toFixed(3),
    })
    set(head, { transform: `rotate(${b.toFixed(3)} ${LX} ${AX})` })

    // the lamp, in the head's own frame
    const [sx, sy] = turn(SRC_X, ly, -b)
    const reach = pIn
    rays.forEach((r, i) => {
      const y = AX + RAYS[i]
      set(r, {
        x1: sx.toFixed(2),
        y1: sy.toFixed(2),
        x2: lerp(sx, LX, reach).toFixed(2),
        y2: lerp(sy, y, reach).toFixed(2),
      })
    })
    set(cone, {
      points: `${sx.toFixed(1)},${sy.toFixed(1)} ${lerp(sx, LX, reach).toFixed(1)},${lerp(sy, AX - LH + 12, reach).toFixed(1)} ${lerp(sx, LX, reach).toFixed(1)},${lerp(sy, AX + LH - 12, reach).toFixed(1)}`,
    })

    // each colour heads for its own focus; the image of the lamp sits off the axis by its angle
    const ends = (f: number) =>
      RAYS.map((h) => {
        const fy = AX + (f - LX) * Math.tan(th)
        const y0 = AX + h
        const k = (SX - LX) / (f - LX)
        return [SX, y0 + (fy - y0) * k] as const
      })
    const fM = lerp(FOCUS_M, SX, c)
    const fG = lerp(FOCUS_G, SX, c)
    const eM = ends(fM)
    const eG = ends(fG)
    const drawOut = (lines: SVGLineElement[], e: (readonly [number, number])[]) =>
      lines.forEach((r, i) => {
        const y0 = AX + RAYS[i]
        set(r, {
          x1: LX,
          y1: y0.toFixed(2),
          x2: lerp(LX, e[i][0], pOut).toFixed(2),
          y2: lerp(y0, e[i][1], pOut).toFixed(2),
        })
      })
    drawOut(raysM, eM)
    drawOut(raysG, eG)
    const conePts = (e: (readonly [number, number])[]) =>
      `${LX},${AX - LH + 12} ${lerp(LX, e[0][0], pOut).toFixed(1)},${lerp(AX - LH + 12, e[0][1], pOut).toFixed(1)} ${lerp(LX, e[6][0], pOut).toFixed(1)},${lerp(AX + LH - 12, e[6][1], pOut).toFixed(1)} ${LX},${AX + LH - 12}`
    set(coneM, { points: conePts(eM) })
    set(coneG, { points: conePts(eG) })

    set(lens, {
      opacity: pLens.toFixed(3),
      transform: `translate(0 ${AX}) scale(1 ${lerp(0.4, 1, pLens).toFixed(4)}) translate(0 ${-AX})`,
    })
    set(flint, {
      opacity: pFlint.toFixed(3),
      transform: `translate(0 ${lerp(-150, 0, pFlint).toFixed(2)})`,
    })
    set(sensor, { opacity: pSensor.toFixed(3) })
    const spotY = AX + (SX - LX) * Math.tan(th)
    set(spot, {
      cy: spotY.toFixed(2),
      opacity: (c * pOut).toFixed(3),
      r: lerp(10, 34, c).toFixed(2),
    })

    // the sensor's ends, out to the plate: what it reads, at size; they let go when the plate turns to the tracker
    const [p1x, p1y] = turn(SX, AX - SH, b)
    const [p2x, p2y] = turn(SX, AX + SH, b)
    const pProj = E.out(prog(t, 2.0 * B, 3.0 * B)) * (1 - pAct)
    set(proj[0], {
      x1: p1x.toFixed(2),
      y1: p1y.toFixed(2),
      x2: lerp(p1x, 1100, pProj).toFixed(2),
      y2: lerp(p1y, 120, pProj).toFixed(2),
      opacity: pProj.toFixed(3),
    })
    set(proj[1], {
      x1: p2x.toFixed(2),
      y1: p2y.toFixed(2),
      x2: lerp(p2x, 1100, pProj).toFixed(2),
      y2: lerp(p2y, 840, pProj).toFixed(2),
      opacity: pProj.toFixed(3),
    })

    // the plate: soft and fringed, then sharp, then three times finer behind the sweep
    const pPlate = E.out(prog(t, 2.0 * B, 3.4 * B))
    plate.style.opacity = pPlate.toFixed(3)
    plate.style.transform = `translateY(${lerp(18, 0, pPlate).toFixed(2)}px)`
    // the raw read is its two colours, apart; as the focus meets they close up and give way to one sharp frame
    raw.style.opacity = c.toFixed(3)
    const off = lerp(16, 0, c)
    const fo = (1 - E.soft(prog(c, 0.55, 1))).toFixed(3)
    fg.style.transform = `translateX(${off.toFixed(2)}px)`
    fm.style.transform = `translateX(${(-off).toFixed(2)}px)`
    fg.style.opacity = fo
    fm.style.opacity = fo
    coarse.style.opacity = (
      0.9 *
      prog(t, T_DECIDE, T_DECIDE + 0.8 * B) *
      (1 - prog(t, T_DECIDE + 3.4 * B, T_DECIDE + 4 * B))
    ).toFixed(3)
    clip.style.transform = `translateX(${(-(1 - pSweep) * 100).toFixed(3)}%)`
    clipIn.style.transform = `translateX(${((1 - pSweep) * 100).toFixed(3)}%)`
    fine.style.opacity = (
      1 - prog(t, T_DECIDE + 3.6 * B, T_ACT + 0.2 * B)
    ).toFixed(3)
    sweep.style.transform = `translateX(${(pSweep * 540).toFixed(2)}px)`
    sweep.style.opacity = (
      prog(t, T_DECIDE + 0.8 * B, T_DECIDE + 1.1 * B) *
      (1 - prog(t, T_DECIDE + 3.2 * B, T_DECIDE + 3.6 * B))
    ).toFixed(3)
    chip.dataset.x = pSweep > 0.5 ? '3' : '1'
    chip.style.opacity = (
      prog(t, T_DECIDE + 0.2 * B, T_DECIDE + 0.8 * B) * (1 - pAct)
    ).toFixed(3)
    act.style.opacity = pAct.toFixed(3)
    act.style.transform = `scale(${lerp(1.05, 1, pAct).toFixed(4)})`

    // one caption at a time, under the plate
    const capOn = [
      prog(t, 2.2 * B, 3.0 * B) * (1 - prog(t, T_DECIDE + 0.6 * B, T_DECIDE + 1.0 * B)),
      prog(t, T_DECIDE + 1.0 * B, T_DECIDE + 1.6 * B) *
        (1 - prog(t, T_ACT, T_ACT + 0.4 * B)),
      prog(t, T_ACT + 0.5 * B, T_ACT + 1.2 * B),
    ]
    caps.forEach((cp, i) => {
      cp.style.opacity = capOn[i].toFixed(3)
      cp.style.transform = `translateY(${lerp(10, 0, capOn[i]).toFixed(2)}px)`
    })

    // the footage runs in real time from the act; it waits, cued, before it, and rests on its frame after
    const speed = tl.timeScale() || 1
    const want = VIDEO_FROM + Math.max(0, t - T_ACT) / speed
    if (t < T_ACT - 0.2) {
      if (!video.paused) video.pause()
      if (Math.abs(video.currentTime - VIDEO_FROM) > 0.05)
        video.currentTime = VIDEO_FROM
    } else if (tl.isActive() && t < HOLD) {
      if (video.paused) void video.play().catch(() => {})
      if (Math.abs(video.currentTime - want) > 0.35) video.currentTime = want
    } else {
      if (!video.paused) video.pause()
      if (Math.abs(video.currentTime - want) > 0.05) video.currentTime = want
    }
  }

  tl.to(
    driver((p) => draw(clamp(p) * HOLD)),
    { p: 1, duration: HOLD, ease: 'none' },
    0
  )

  // the words: each arrives fringed and soft and pulls into focus; the last beat brings all three back
  const words = qa<HTMLElement>('.ll-w')
  words.forEach((w, i) => {
    const at = [0, T_DECIDE, T_ACT][i]
    tl.fromTo(
      w,
      { opacity: 0, y: 26, '--ca': 16, filter: 'blur(12px)' },
      {
        opacity: 1,
        y: 0,
        '--ca': 0,
        filter: 'blur(0px)',
        duration: 1.6 * B,
        ease: 'expo.out',
      },
      at + 0.05
    )
    if (i < 2)
      tl.to(
        w,
        { opacity: 0.26, duration: 0.8 * B, ease: 'power2.out' },
        [T_DECIDE, T_ACT][i]
      )
  })
  tl.to(
    words.slice(0, 2),
    { opacity: 1, duration: 1.4 * B, ease: 'power2.inOut', stagger: 0.15 },
    3 * BAR + 1.2 * B
  )

  return () => video.pause()
}

export function LightShot({ replay }: { replay: string }) {
  const lensPath = `M${LX} ${AX - LH} Q${LX + 56} ${AX} ${LX} ${AX + LH} Q${LX - 56} ${AX} ${LX} ${AX - LH} Z`
  const flintPath = `M${LX} ${AX - LH} Q${LX + 56} ${AX} ${LX} ${AX + LH} L${LX + 44} ${AX + LH + 4} Q${LX + 30} ${AX} ${LX + 44} ${AX - LH - 4} Z`
  return (
    <Shot
      scene="vn-light"
      label={LABEL}
      impacts={IMPACTS}
      hold={HOLD}
      build={build}
      replay={replay}
      crop={CROP}
    >
      <svg className="ll-defs" width="0" height="0" aria-hidden="true">
        <filter id="ll-tint-g" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.12 0.404 0.043 0 0 0.163 0.559 0.06 0 0 0.103 0.344 0.034 0 0 0 0 0 1 0"
          />
        </filter>
        <filter id="ll-tint-m" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.163 0.542 0.06 0 0 0.103 0.344 0.034 0 0 0.155 0.507 0.052 0 0 0 0 0 1 0"
          />
        </filter>
        <radialGradient id="ll-glow">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.25" stopColor="#eef1ec" stopOpacity="0.75" />
          <stop offset="1" stopColor="#b7d3a8" stopOpacity="0" />
        </radialGradient>
      </svg>

      <svg className="ll-bench" viewBox="0 0 1920 1080">
        <g className="ll-head">
          <polygon className="ll-cone" />
          <polygon className="ll-cone-m" />
          <polygon className="ll-cone-g" />
          {RAYS.map((h) => (
            <line key={`w${h}`} className="ll-ray" />
          ))}
          <g className="ll-out">
            {RAYS.map((h) => (
              <line key={`m${h}`} className="ll-ray-m" />
            ))}
            {RAYS.map((h) => (
              <line key={`g${h}`} className="ll-ray-g" />
            ))}
          </g>
          <path className="ll-crown" d={lensPath} />
          <path className="ll-flint" d={flintPath} />
          <rect
            className="ll-sensor"
            x={SX - 4}
            y={AX - SH}
            width="8"
            height={2 * SH}
            rx="4"
          />
          <circle className="ll-spot" cx={SX} cy={AX} r="10" />
        </g>
        <line className="ll-proj" />
        <line className="ll-proj" />
        <g className="ll-lamp">
          <circle r="70" fill="url(#ll-glow)" opacity="0.55" />
          <circle r="9" fill="#fff" />
        </g>
      </svg>

      <div className="ll-plate">
        <div className="ll-img ll-raw ll-base" />
        <div className="ll-grid ll-coarse" />
        <div className="ll-clip">
          <div className="ll-clip-in">
            <div className="ll-img ll-sr" />
            <div className="ll-grid ll-fine" />
          </div>
        </div>
        <div className="ll-act">
          <video
            className="ll-vid"
            src="/images/authority/pid-light-tracker/video-two-axis-final.mp4"
            poster="/images/authority/pid-light-tracker/video-two-axis-final-poster.jpg"
            muted
            playsInline
            preload="auto"
          />
        </div>
        {/* everything under this reads in Sage; the fringes and the sweep sit above it, in their own colours */}
        <div className="ll-tint" />
        <div className="ll-img ll-raw ll-fr ll-fg" />
        <div className="ll-img ll-raw ll-fr ll-fm" />
        <div className="ll-sweep" />
        <div className="m ll-chip" data-x="1">
          <span className="x1">×1</span>
          <span className="x3">×3</span>
        </div>
      </div>

      <div className="m ll-cap">Low-resolution thermal frame</div>
      <div className="m ll-cap">Thermal super-resolution · ×3</div>
      <div className="m ll-cap">
        Two-axis light tracker · with Wassim Ghaddar
      </div>

      <div className="ll-words">
        {['Sense', 'Decide', 'Act'].map((w) => (
          <div key={w} className="ll-w">
            {w.toUpperCase()}
            <i>.</i>
          </div>
        ))}
      </div>
    </Shot>
  )
}
