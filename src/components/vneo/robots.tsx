'use client'

import { B, BAR, type Impact } from '@/components/v6/armed'
import { Shot } from '@/components/v6/shot'
import { vneo } from '@/content/vneo/site'

import { PackGL } from './gl/pack'

/*
 * The robot pack: FLY's equivalent for robotics, vision, and embedded work,
 * on the same three bars and the same type. Bar one: sense, decide, act, one
 * word a beat, while 36 Go2s on a circuit board are scanned and tracked (the
 * boxes are the vision layer), fall into ranks, and trot out into a ring.
 * Bar two: the focus areas fly at the lens as the pack gallops at it. Bar
 * three: the robots walk into RK., the lock closes on them, and a jump runs
 * through the letters. The 3D is gl/pack.tsx.
 */

const IMPACTS: Impact[] = [
  { t: 0, k: 1.1, flash: 0.8, ghost: 1 },
  { t: B, k: 0.4 },
  { t: 2 * B, k: 0.4 },
  { t: 3 * B, k: 0.4 },
  { t: 4 * B, k: 0.6, flash: 0.3, ghost: 0.6 },
  { t: 8 * B, k: 0.8, flash: 0.5, ghost: 0.8 },
]
const c = vneo.pack
/** On a phone the frame narrows to 4:3: the middle of the stage, where the letters and the lock sit. */
const CROP: [number, number, number, number] = [240, 0, 1440, 1080]

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  tl.fromTo(
    '.s13-swarm',
    { opacity: 0, x: 40 },
    { opacity: 1, x: 0, duration: 0.25, ease: 'expo.out' },
    0.1
  )
  // one word per beat, each with its own entrance, hard cuts between
  tl.fromTo(
    '.s13-w1',
    { opacity: 0, scale: 1.9, filter: 'blur(26px)' },
    {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.16,
      ease: 'expo.out',
    },
    0
  )
  tl.to('.s13-w1', { opacity: 0, duration: 0.001, ease: 'none' }, B)
  tl.fromTo(
    '.s13-w2',
    { opacity: 0, x: 1400, skewX: -18 },
    { opacity: 1, x: 0, skewX: 0, duration: 0.18, ease: 'expo.out' },
    B
  )
  tl.to('.s13-w2', { opacity: 0, duration: 0.001, ease: 'none' }, 2 * B)
  tl.fromTo(
    '.s13-w3',
    { opacity: 0, y: 340, rotation: -6 },
    { opacity: 1, y: 0, rotation: 0, duration: 0.2, ease: 'back.out(1.8)' },
    2 * B
  )
  tl.to('.s13-w3', { opacity: 0, duration: 0.001, ease: 'none' }, 3 * B)
  // the vision layer locks onto its robots as the scan passes, and lets go as they move off
  root.querySelectorAll('[data-track]').forEach((box, i) => {
    tl.fromTo(
      box,
      { opacity: 0 },
      { opacity: 1, duration: 0.03, ease: 'none', repeat: 4, yoyo: true },
      0.18 + i * 0.07
    )
    tl.to(box, { opacity: 0, duration: 0.12, ease: 'none' }, 2.3 * B)
  })
  tl.to('.s13-swarm', { opacity: 0, duration: 0.15, ease: 'none' }, BAR)

  // the run: the focus areas fly at the lens, one per beat
  root.querySelectorAll('.s13-fly').forEach((s, i) => {
    const at = BAR + i * B
    tl.fromTo(
      s,
      { opacity: 0, scale: 0.42, filter: 'blur(6px)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.16,
        ease: 'expo.out',
      },
      at
    )
    tl.to(
      s,
      {
        scale: 2.4,
        opacity: 0,
        filter: 'blur(18px)',
        duration: 0.24,
        ease: 'power3.in',
      },
      at + B - 0.24
    )
  })

  // the robots stand in RK.; on the next beat the lock snaps around them
  root.querySelectorAll('.s13-l').forEach((s, i) => {
    tl.fromTo(
      s,
      {
        opacity: 0,
        x: [-160, 160, -160, 160][i],
        y: [-100, -100, 100, 100][i],
      },
      { opacity: 1, x: 0, y: 0, duration: 0.24, ease: 'expo.out' },
      2 * BAR + B + i * 0.02
    )
  })
  tl.fromTo(
    '.s13-id',
    { opacity: 0 },
    { opacity: 1, duration: 0.04, ease: 'none', repeat: 4, yoyo: true },
    2 * BAR + B + 0.05
  )
  tl.fromTo(
    '.s13-cap',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.25, ease: 'expo.out' },
    2 * BAR + B + 0.1
  )
}

export function RobotsShot({
  replay,
  accent,
}: {
  replay?: string
  accent: string
}) {
  return (
    <Shot
      scene="s15"
      label={c.alt}
      impacts={IMPACTS}
      build={build}
      hold={3 * BAR}
      replay={replay}
      crop={CROP}
      gl={(clock) => <PackGL clock={clock} accent={accent} />}
    >
      {c.tracks.map((i) => (
        <div key={i} className="s15-box" data-track={i}>
          <span className="m">
            {c.track} · {String(i + 1).padStart(2, '0')}
          </span>
        </div>
      ))}
      {c.words.map((w, i) => (
        <div key={w} className={`s13-word s13-w${i + 1}`}>
          {w.toUpperCase()}
          <i>.</i>
        </div>
      ))}
      <div className="m s13-swarm">{c.note}</div>
      {c.focus.map((f) => (
        <div key={f} className="s13-fly">
          {f.toUpperCase()}
        </div>
      ))}
      <div className="m s13-id">{c.id}</div>
      <div className="s13-l s13-l1" />
      <div className="s13-l s13-l2" />
      <div className="s13-l s13-l3" />
      <div className="s13-l s13-l4" />
      <div className="m s13-cap">{c.cap}</div>
    </Shot>
  )
}
