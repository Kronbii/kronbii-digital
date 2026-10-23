'use client'

import { gsap } from 'gsap'

import { FringePath } from '@/components/v7/optic'
import { Scene } from '@/components/v7/scene'
import { B, BAR, drawIn, focusIn } from '@/components/v7/tempo'

/*
 * The landmine robot, drawn only from what the CV says: a georeferenced grid,
 * a planned sweep, the rover carrying out its mission and marking what its
 * vision and LiDAR find, and the 6-DoF arm. Nothing here is the real field,
 * hardware, or data; it is an illustration.
 */

const X0 = 300
const X1 = 1000
const LANES = [400, 520, 640, 760, 880]
/** A back-and-forth sweep over the grid: the planned path. */
const SWEEP = LANES.map((y, i) => {
  const from = i % 2 ? X1 : X0
  const to = i % 2 ? X0 : X1
  return i === 0 ? `M ${from} ${y} H ${to}` : `V ${y} H ${to}`
}).join(' ')
/** Where the rover marks a find, in the order it passes them. */
const FINDS = [
  { x: 720, y: 400 },
  { x: 470, y: 520 },
  { x: 840, y: 640 },
]
/** The rover's route for the scene: the first three lanes. */
const ROUTE = [
  { x: X1, y: LANES[0] },
  { x: X1, y: LANES[1] },
  { x: X0, y: LANES[1] },
  { x: X0, y: LANES[2] },
  { x: X1, y: LANES[2] },
]
const ROVER = { w: 74, h: 52 }

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  focusIn(tl, '.dm-grid', 0, { dur: 1.4 * B, blur: 14, ca: 10, scale: 0.97 })
  focusIn(tl, '.dm-geo', 0.6 * B, { y: 12 })
  focusIn(tl, '.dm-fig, .dm-fig-k', 0.9 * B, { y: 16, stagger: 0.2 * B })
  drawIn(tl, '.dm-path', 1.2 * B, 1.8 * B)
  focusIn(tl, '.dm-rover', 2.4 * B, { scale: 0.8 })

  // the mission: lane by lane, a find marked as the rover passes it
  const at0 = 3 * B
  const seg = 0.9 * B
  tl.set('.dm-rover', { x: X0 - ROVER.w / 2, y: LANES[0] - ROVER.h / 2 }, 0)
  ROUTE.forEach((p, i) => {
    tl.to(
      '.dm-rover',
      {
        x: p.x - ROVER.w / 2,
        y: p.y - ROVER.h / 2,
        duration: i % 2 ? seg * 0.45 : seg,
        ease: 'sine.inOut',
      },
      i === 0 ? at0 : '>'
    )
  })
  // the finds light in turn, roughly as the rover reaches each
  ;[0.55, 1.95, 3.2].forEach((t, i) => {
    tl.fromTo(
      `.dm-find${i}`,
      { scale: 0.4, opacity: 0, '--ca': 8 },
      { scale: 1, opacity: 1, '--ca': 0, duration: 0.6 * B, ease: 'back.out(2)' },
      at0 + t * seg
    )
  })
  focusIn(tl, '.dm-stack', at0 + 3.6 * seg, { y: 18 })
  focusIn(tl, '.dm-tag', at0 + 3.9 * seg, { y: 12, stagger: 0.15 * B })
}

/** The marked finds keep pulsing, slowly. */
function ambient(root: HTMLElement) {
  return gsap.to(root.querySelectorAll('.dm-ping'), {
    scale: 1.6,
    opacity: 0,
    duration: BAR,
    ease: 'sine.out',
    repeat: -1,
    stagger: { each: BAR / 3 },
  })
}

export function DeminingScene({
  label,
  replay,
  note,
}: {
  label: string
  replay: string
  note: string
}) {
  return (
    <Scene
      name="demining"
      label={label}
      build={build}
      ambient={ambient}
      replay={replay}
      note={note}
    >
      <div className="dm-fig fx">6-DoF</div>
      <div className="dm-fig-k">extraction arm, on a ROS 2 rover</div>
      <span className="dm-geo tag">Georeferenced to satellite maps</span>
      <svg className="v7-lines" viewBox="0 0 1200 1200">
        <g className="dm-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={X0 + i * 100} y1={340} x2={X0 + i * 100} y2={940} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1={X0} y1={340 + i * 100} x2={X1} y2={340 + i * 100} />
          ))}
        </g>
        <FringePath className="dm-path" d={SWEEP} width={3} />
      </svg>
      {FINDS.map((f, i) => (
        <span
          key={i}
          className={`dm-find dm-find${i}`}
          style={{ left: f.x - 22, top: f.y - 22 }}
        >
          <i className="dm-ping" />
        </span>
      ))}
      <div className="dm-rover">
        <i className="dm-arm" />
      </div>
      <div className="dm-stack card">
        <span className="t">Sense · perceive · localize · plan · act</span>
        <span className="dm-tags">
          <span className="dm-tag">Vision + LiDAR</span>
          <span className="dm-tag">Sensor fusion</span>
          <span className="dm-tag">Path planning</span>
          <span className="dm-tag">Mission</span>
        </span>
      </div>
    </Scene>
  )
}
