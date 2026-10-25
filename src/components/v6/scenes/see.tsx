'use client'

import { seeFeatures, seeLinks } from '@/content/v6/frames'

import { B, BAR, driver, type Impact } from '../armed'
import { Shot, type Rect } from '../shot'

/* 04 SEE: the race car through a vision stack, one pass per beat: raw, edges, features, lock. */

const IMPACTS: Impact[] = [{ t: 0, k: 0.55, flash: 0.3, ghost: 0.6 }]
const CROP: Rect = [930, 80, 920, 960]
const STEP = ['Raw', 'Edges', 'Features', 'Lock']

/** The plate's photograph and what the vision passes found in it; a host can bring its own. */
export interface SeePlate {
  img: string
  edges: string
  features: [number, number][]
  links: [number, number, number, number][]
  /** The lock box around the vehicle, in plate pixels. */
  box: [number, number, number, number]
}
const REEL_PLATE: SeePlate = {
  img: '/images/v6/race-crop.jpg',
  edges: '/images/v6/race-edges.png',
  features: seeFeatures,
  links: seeLinks,
  box: [40, 140, 780, 800],
}

const builds = new WeakMap<
  SeePlate,
  (root: HTMLElement, tl: gsap.core.Timeline) => void
>()
const buildFor = (plate: SeePlate) => {
  let b = builds.get(plate)
  if (!b) {
    b = (root, tl) => build(root, tl, plate.box)
    builds.set(plate, b)
  }
  return b
}

function build(
  root: HTMLElement,
  tl: gsap.core.Timeline,
  BOX: SeePlate['box']
) {
  const tag = root.querySelector<HTMLElement>('.s04-tag')!
  const steps = root.querySelectorAll<HTMLElement>('.s04-steps span')

  // arrive: the plate whips in from the right
  tl.fromTo(
    '.s04-plate',
    { x: 760, filter: 'blur(22px)' },
    { x: 0, filter: 'blur(0px)', duration: 0.24, ease: 'expo.out' },
    0
  )
  tl.fromTo(
    '.s04-no',
    { opacity: 0, x: -40 },
    { opacity: 1, x: 0, duration: 0.25, ease: 'expo.out' },
    0.02
  )
  tl.fromTo(
    '.s04-title .w',
    { yPercent: 115 },
    { yPercent: 0, duration: 0.32, ease: 'expo.out', stagger: 0.045 },
    0.04
  )
  tl.fromTo(
    '.s04-steps span',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.2, ease: 'expo.out', stagger: 0.03 },
    0.08
  )

  // the passes, one per beat: the tag and the step index are a pure function of time
  let shown = -1
  const state = driver((l) => {
    const k = Math.max(0, Math.min(3, Math.floor(l / B + 1e-6)))
    if (k === shown) return
    tag.innerHTML = `<b>0${k + 1}</b> ${STEP[k]}`
    steps.forEach((s, j) => s.classList.toggle('on', j === k))
    shown = k
  })
  tl.fromTo(state, { p: 0 }, { p: BAR, duration: BAR, ease: 'none' }, 0)
  ;[0, B, 2 * B, 3 * B].forEach((at) =>
    tl.fromTo(
      '.s04-tag',
      { scale: 1.35 },
      {
        scale: 1,
        duration: 0.2,
        ease: 'back.out(2.4)',
        immediateRender: false,
      },
      at
    )
  )
  // 02 edges: the photo cuts to its Sobel map, a scan bar draws it top to bottom
  tl.fromTo(
    '.s04-img',
    { opacity: 1 },
    { opacity: 0, duration: 0.001, ease: 'none', immediateRender: false },
    B
  )
  tl.fromTo(
    '.s04-edges',
    { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
    {
      opacity: 1,
      clipPath: 'inset(0 0 0% 0)',
      duration: 0.22,
      ease: 'power2.out',
    },
    B
  )
  tl.fromTo(
    '.s04-scan',
    { opacity: 0, y: 0 },
    { opacity: 1, y: 896, duration: 0.22, ease: 'power2.out' },
    B
  )
  tl.to('.s04-scan', { opacity: 0, duration: 0.06, ease: 'none' }, B + 0.22)
  // 03 features: the photo comes back dim, the corners pop as a radial wave
  tl.fromTo(
    '.s04-img',
    { opacity: 0 },
    { opacity: 0.55, duration: 0.001, ease: 'none', immediateRender: false },
    2 * B
  )
  tl.to('.s04-edges', { opacity: 0.32, duration: 0.12, ease: 'none' }, 2 * B)
  root.querySelectorAll<SVGCircleElement>('.s04-feat circle').forEach((c) => {
    const x = +c.getAttribute('cx')!,
      y = +c.getAttribute('cy')!
    const d = Math.hypot(x - 450, y - 470) / 640
    tl.fromTo(
      c,
      { scale: 0, svgOrigin: `${x} ${y}` },
      { scale: 1, svgOrigin: `${x} ${y}`, duration: 0.16, ease: 'back.out(3)' },
      2 * B + d * 0.26
    )
  })
  tl.fromTo(
    '.s04-feat line',
    { opacity: 0 },
    { opacity: 1, duration: 0.12, ease: 'none', stagger: 0.004 },
    2 * B + 0.18
  )
  // the facts land with the passes
  tl.fromTo(
    '.s04-fig, .s04-fig-k',
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.25, ease: 'expo.out', stagger: 0.04 },
    B
  )
  tl.fromTo(
    '.s04-place',
    { opacity: 0, x: -50 },
    { opacity: 1, x: 0, duration: 0.25, ease: 'expo.out' },
    2 * B
  )
  // 04 lock: brackets fly from the plate's corners onto the vehicle
  const [x0, y0, x1, y1] = BOX
  const corners: [string, number, number, number, number][] = [
    ['.s04-b1', 0, 0, x0, y0],
    ['.s04-b2', 836, 0, x1 - 64, y0],
    ['.s04-b3', 0, 836, x0, y1 - 64],
    ['.s04-b4', 836, 836, x1 - 64, y1 - 64],
  ]
  corners.forEach(([s, fx, fy, tx, ty], i) => {
    tl.fromTo(
      s,
      { x: fx, y: fy, opacity: 0 },
      { x: tx, y: ty, opacity: 1, duration: 0.24, ease: 'expo.out' },
      3 * B + i * 0.02
    )
  })
  tl.to('.s04-feat', { opacity: 0.45, duration: 0.1, ease: 'none' }, 3 * B)
  tl.fromTo(
    '.s04-arch',
    { opacity: 0, x: -50 },
    { opacity: 1, x: 0, duration: 0.25, ease: 'expo.out' },
    3 * B
  )
  tl.fromTo(
    '.s04-schem',
    { opacity: 0, x: -220, y: 120, rotation: -14 },
    { opacity: 1, x: 0, y: 0, rotation: -4, duration: 0.3, ease: 'expo.out' },
    3 * B + 0.06
  )
}

export function SeeShot({
  label,
  replay,
  plate = REEL_PLATE,
}: {
  label: string
  replay?: string
  plate?: SeePlate
}) {
  return (
    <Shot
      scene="s04"
      label={label}
      impacts={IMPACTS}
      build={buildFor(plate)}
      crop={CROP}
      replay={replay}
    >
      <div className="m s04-no">04 · See</div>
      <div className="s04-title">
        <span className="ln">
          <span className="w">Brainiacs</span>
        </span>
        <span className="ln">
          <span className="w">autonomous</span>
        </span>
        <span className="ln">
          <span className="w">
            <em>race</em> car
          </span>
        </span>
      </div>
      <div className="fig s04-fig">
        20<small>days</small>
      </div>
      <div className="m s04-fig-k">Built from scratch</div>
      <div className="s04-place">
        2nd · WRO Future Engineers 2023<span>with Wassim Ghaddar</span>
      </div>
      <div className="m s04-arch">
        <b>Jetson Nano</b> → perception
        <br />
        <b>Arduino Mega</b> → real-time control
      </div>
      <div className="s04-plate">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          decoding="async"
          className="s04-img"
          src={plate.img}
          alt=""
        />
        <div className="s04-edges">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img loading="lazy" decoding="async" src={plate.edges} alt="" />
        </div>
        <svg className="s04-feat" viewBox="0 0 900 900">
          {plate.links.map(([a, b, c, d], i) => (
            <line key={`l${i}`} x1={a} y1={b} x2={c} y2={d} />
          ))}
          {plate.features.map(([x, y], i) => (
            <circle key={`c${i}`} cx={x} cy={y} r={8} />
          ))}
        </svg>
        <div className="s04-scan" />
        <div className="s04-box">
          <div
            className="s04-l s04-b1"
            style={{ borderTopWidth: 5, borderLeftWidth: 5 }}
          />
          <div
            className="s04-l s04-b2"
            style={{ borderTopWidth: 5, borderRightWidth: 5 }}
          />
          <div
            className="s04-l s04-b3"
            style={{ borderBottomWidth: 5, borderLeftWidth: 5 }}
          />
          <div
            className="s04-l s04-b4"
            style={{ borderBottomWidth: 5, borderRightWidth: 5 }}
          />
        </div>
        <div className="s04-tag">
          <b>01</b> Raw
        </div>
      </div>
      <div className="s04-steps">
        {STEP.map((s, i) => (
          <span key={s}>
            0{i + 1} {s}
          </span>
        ))}
      </div>
      <div className="s04-schem">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          decoding="async"
          src="/images/v6/race-schematic.png"
          alt=""
        />
      </div>
    </Shot>
  )
}
