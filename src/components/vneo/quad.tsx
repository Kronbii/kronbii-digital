'use client'

import { useContext } from 'react'

import { B, type Impact } from '@/components/v6/armed'
import { Shot, ShotModeContext } from '@/components/v6/shot'

import { ALARM, HOLD, QuadGL, shotAt } from './gl/quad'
import './quad.css'

/*
 * The quad, the closing shot: Rami's engineering core in one machine, a 5-inch
 * carbon quad like his build. Bar one, sense: it hovers, its body axes draw
 * out, the gyro strip hums. Bar two, decide: time slows, the front-right
 * rotor stops, and the fault is caught 22 ms later (the record's simulated
 * run). Bar three, act: it leans, spins, and holds its hover point on three
 * rotors. Bar four holds on it, the three words together. The 3D and the
 * strip are gl/quad.tsx.
 */

const bt = (n: number) => n * B
const IMPACTS: Impact[] = [
  { t: 0, k: 0.6, ghost: 0.6 },
  { t: bt(4), k: 0.8, ghost: 1 },
  { t: bt(8), k: 0.5, ghost: 0.6 },
  { t: bt(12), k: 0.4, ghost: 0.4 },
]
/** On a phone the frame narrows to 3:2: the left column and the whole quad. */
const CROP: [number, number, number, number] = [180, 0, 1620, 1080]
const CAUGHT = shotAt(ALARM)

const WORDS = ['Sense', 'Decide', 'Act']
const STATUS: { text: string; at: number; lost?: boolean }[] = [
  { text: 'Four rotors · hovering', at: 0.3 },
  { text: 'Front-right rotor lost', at: bt(4), lost: true },
  { text: 'Caught in 22 ms', at: CAUGHT },
  { text: 'Flying on three rotors', at: bt(8.4) },
]
const LABEL =
  'An illustration of a simulated run: a 5-inch carbon-fiber quad hovers over a faint grid as its body axes draw out and a gyro strip scrolls beside the word sense. Then time slows on the word decide: the front-right rotor stops, marked magenta, and the fault is caught 22 milliseconds later. On the word act, time runs again and the quad leans into a fast spin, holding its hover point on three rotors, while the gyro trace for its yaw climbs and stays high; the three words, sense, decide, act, end the shot.'

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  tl.fromTo(
    '.lq-gyro, .lq-note',
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.12 },
    0.25
  )
  // one word to each bar, in on its downbeat
  root.querySelectorAll('.lq-word').forEach((w, i) => {
    tl.fromTo(
      w,
      { opacity: 0, y: 36, filter: 'blur(14px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.45,
        ease: 'expo.out',
      },
      bt(4 * i) + 0.02
    )
    tl.to(w, { opacity: 0, duration: 0.18, ease: 'none' }, bt(4 * i + 4) - 0.18)
  })
  // the status line, one state at a time
  root.querySelectorAll('.lq-st').forEach((el, i) => {
    tl.fromTo(
      el,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.25, ease: 'expo.out' },
      STATUS[i].at
    )
    const next = STATUS[i + 1]?.at
    if (next) tl.to(el, { opacity: 0, duration: 0.12, ease: 'none' }, next - 0.12)
  })
  // bar four: the three words together
  tl.fromTo(
    '.lq-end span',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.1 },
    bt(12) + 0.04
  )
}

export function QuadShot({ replay }: { replay: string }) {
  const { speed } = useContext(ShotModeContext)
  return (
    <Shot
      scene="vn-quad"
      label={LABEL}
      impacts={IMPACTS}
      build={build}
      hold={HOLD}
      replay={replay}
      crop={CROP}
      gl={(clock) => <QuadGL clock={clock} speed={speed} />}
    >
      <div className="lq-status">
        {STATUS.map((s) => (
          <div key={s.text} className={`m lq-st${s.lost ? ' is-lost' : ''}`}>
            <i />
            {s.text}
          </div>
        ))}
      </div>
      <div className="lq-gyro">
        <span className="m lq-gyro-t">Gyro</span>
        <svg viewBox="0 0 520 130" aria-hidden="true">
          <line x1="0" y1="65" x2="520" y2="65" />
          <path data-gyro="x" className="x" />
          <path data-gyro="y" className="y" />
          <path data-gyro="z" className="z" />
        </svg>
        <span className="m lq-axes">
          <b className="x">X</b> <b className="y">Y</b> <b className="z">Z</b>
        </span>
      </div>
      <div className="m lq-note">Illustration · a simulated 5-inch quad</div>
      {WORDS.map((w) => (
        <div key={w} className="lq-word">
          {w.toUpperCase()}
          <i>.</i>
        </div>
      ))}
      <div className="lq-end">
        {WORDS.map((w) => (
          <span key={w}>
            {w}
            <i>.</i>
          </span>
        ))}
      </div>
    </Shot>
  )
}
