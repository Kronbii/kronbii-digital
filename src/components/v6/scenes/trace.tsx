'use client'

import type { CSSProperties } from 'react'

import {
  traceBridges,
  traceNodes,
  traceRuns,
  traceSkeleton,
} from '@/content/v6/frames'

import { B, BAR, driver, type Impact } from '../armed'
import { Shot, type Rect } from '../shot'

/* 08 TRACE: a crack mask is thinned to a skeleton, read as a graph of ends,
   junctions and bridged breaks, and redrawn with its width at every point. */

const IMPACTS: Impact[] = [
  { t: 0, k: 0.6, flash: 0.35, ghost: 0.6 },
  { t: 2 * B, k: 0.3 },
]
const CROP: Rect = [1130, 48, 710, 984]
const STEPS = [
  'Mask from any model',
  'Thinned to a skeleton',
  'Ends · junctions · gaps bridged',
  'Width along the crack',
]
const TAGS = ['Mask', 'Skeleton', 'Graph', 'Width']
const NN = traceNodes.length
const NR = traceRuns.length
const NS = traceSkeleton.length

function build(root: HTMLElement, tl: gsap.core.Timeline) {
  const tag = root.querySelector<HTMLElement>('.s10-tag')!
  const steps = root.querySelectorAll<HTMLElement>('.s10-step')
  // the plate swings in on its hinge; the mask scans in
  tl.fromTo(
    '.s10-plate',
    { rotationY: -38, x: 260, opacity: 0 },
    { rotationY: 0, x: 0, opacity: 1, duration: 0.3, ease: 'expo.out' },
    0
  )
  tl.fromTo(
    '.s10-no',
    { opacity: 0, x: -40 },
    { opacity: 1, x: 0, duration: 0.2, ease: 'expo.out' },
    0.02
  )
  tl.fromTo(
    '.s10-title .w',
    { yPercent: 115 },
    { yPercent: 0, duration: 0.3, ease: 'expo.out', stagger: 0.045 },
    0.03
  )
  tl.fromTo(
    '.s10-step',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 0.2, ease: 'expo.out', stagger: 0.03 },
    0.08
  )
  tl.fromTo(
    '.s10-who',
    { opacity: 0 },
    { opacity: 1, duration: 0.2, ease: 'none' },
    0.2
  )
  tl.fromTo(
    '.s10-ink',
    { clipPath: 'inset(0 0 100% 0)' },
    { clipPath: 'inset(0 0 0% 0)', duration: 0.3, ease: 'power2.out' },
    0.04
  )
  tl.fromTo(
    '.s10-scan',
    { y: 0, opacity: 1 },
    { y: 940, duration: 0.3, ease: 'power2.out' },
    0.04
  )
  tl.to('.s10-scan', { opacity: 0, duration: 0.05, ease: 'none' }, 0.34)
  // the skeleton thins out of the mask, top to bottom
  root.querySelectorAll<SVGPolylineElement>('.s10-ed').forEach((e) => {
    const k = +e.dataset.k!
    const len = +e.getAttribute('stroke-dasharray')!
    tl.fromTo(
      e,
      { strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.12, ease: 'none' },
      B + (k / NS) * 0.26
    )
  })
  // its ends and junctions are marked, and the break is bridged
  root.querySelectorAll<SVGCircleElement>('.s10-pt').forEach((c) => {
    const k = +c.dataset.k!
    const x = +c.getAttribute('cx')!,
      y = +c.getAttribute('cy')!
    tl.fromTo(
      c,
      { scale: 0, svgOrigin: `${x} ${y}` },
      { scale: 1, svgOrigin: `${x} ${y}`, duration: 0.14, ease: 'back.out(3)' },
      2 * B + (k / NN) * 0.24
    )
  })
  tl.fromTo(
    '.s10-bridge',
    { opacity: 0 },
    { opacity: 1, duration: 0.12, ease: 'none' },
    2 * B + 0.12
  )
  // the centreline is redrawn, coloured by the crack's width as it goes
  tl.to(
    '.s10-ed',
    { opacity: 0.18, duration: 0.2, ease: 'none' },
    3 * B
  )
  root.querySelectorAll<SVGPolylineElement>('.s10-run').forEach((r) => {
    const k = +r.dataset.k!
    const len = +r.getAttribute('stroke-dasharray')!
    tl.fromTo(
      r,
      { strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.04, ease: 'none' },
      3 * B + (k / NR) * 0.34
    )
  })
  tl.fromTo(
    '.s10-ink',
    { opacity: 0.42 },
    { opacity: 0.22, duration: 0.2, ease: 'none', immediateRender: false },
    3 * B
  )
  tl.fromTo(
    '.s10-file',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.18, ease: 'back.out(2.4)', stagger: 0.06 },
    3 * B + 0.2
  )
  let shown = -1
  const state = driver((l) => {
    const k = Math.max(0, Math.min(3, Math.floor(l / B + 1e-6)))
    if (k === shown) return
    tag.innerHTML = `<b>0${k + 1}</b> ${TAGS[k]}`
    steps.forEach((s, j) => s.classList.toggle('on', j === k))
    shown = k
  })
  tl.fromTo(state, { p: 0 }, { p: BAR, duration: BAR, ease: 'none' }, 0)
  ;[0, B, 2 * B, 3 * B].forEach((at) =>
    tl.fromTo(
      '.s10-tag',
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
}

export function TraceShot({
  label,
  replay,
}: {
  label: string
  replay?: string
}) {
  return (
    <Shot
      scene="s10"
      label={label}
      impacts={IMPACTS}
      build={build}
      crop={CROP}
      replay={replay}
    >
      <div className="m s10-no">08 · Trace</div>
      <div className="s10-title">
        <span className="ln">
          <span className="w">Fine-crack</span>
        </span>
        <span className="ln">
          <span className="w">
            <em>tracing</em>
          </span>
        </span>
        <span className="ln">
          <span className="w">toolkit</span>
        </span>
      </div>
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={`m s10-step s10-s${i + 1}${i === 0 ? ' on' : ''}`}
        >
          <b>0{i + 1}</b>
          {s}
        </div>
      ))}
      <div className="m s10-who">
        Python package · CLI
        <br />
        repository owner and maintainer
      </div>
      <div className="s10-stage">
        <div className="s10-plate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            loading="lazy"
            decoding="async"
            className="s10-ink"
            src="/images/v6/crack-ink.png"
            alt=""
          />
          <svg viewBox="0 0 470 944">
            {traceSkeleton.map(({ points, length }, k) => (
              <polyline
                key={`e${k}`}
                className="s10-ed"
                points={points}
                strokeDasharray={length}
                strokeDashoffset={length}
                data-k={k}
              />
            ))}
            {traceBridges.map(([x1, y1, x2, y2], k) => (
              <line
                key={`b${k}`}
                className="s10-bridge"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              />
            ))}
            {traceRuns.map(({ points, w, length }, k) => (
              <polyline
                key={`r${k}`}
                className="s10-run"
                points={points}
                strokeDasharray={length}
                strokeDashoffset={length}
                style={{ '--w': `${Math.round(w * 100)}%` } as CSSProperties}
                data-k={k}
              />
            ))}
            {traceNodes.map(([x, y, kind], k) => (
              <circle
                key={`n${k}`}
                className={`s10-pt s10-${kind}`}
                cx={x}
                cy={y}
                r={kind === 'j' ? 11 : 5}
                data-k={k}
              />
            ))}
          </svg>
          <div className="s10-scan" />
          <div className="s10-tag">
            <b>01</b> Mask
          </div>
          <div className="s10-out">
            <span className="s10-file">CSV</span>
            <span className="s10-file">JSON</span>
            <span className="s10-file">GeoJSON</span>
          </div>
        </div>
      </div>
    </Shot>
  )
}
