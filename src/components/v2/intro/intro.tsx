'use client'

import { useEffect, useRef, useState } from 'react'

import { v2Home, v2Intro } from '@/content/v2/home'

import styles from './intro.module.css'
import { currentRun, runPreflight } from './preflight'
import { INTRO_COOKIE, INTRO_PATH } from './timing'

/*
 * The preflight: a once-per-session intro on the home page that is also the
 * loading screen. A pre-paint script in the layout decides whether it plays
 * and starts fetching the model; the display boots and arms in CSS from the
 * first paint, waiting on nothing; and the driver (./preflight) picks the
 * flight up on the same clock as soon as this module runs, not when the page
 * hydrates. The overlay's inside is a fixed HTML string that
 * React never reconciles, so the driver can animate it before and after
 * hydration alike. React renders the host and removes it at the end.
 */

const NAME = v2Home.hero.name.split(' ')

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function overlayHTML() {
  const s = styles
  const i = v2Intro
  const m = (cls: string) => `${s.m} ${cls}`
  return `<div class="${s.stage}" data-part="stage">
  <div class="${s.ground}"></div>
  <canvas class="${s.canvas}" data-part="canvas"></canvas>
  <div class="${s.glow}" data-part="glow"></div>
  <div class="${s.osd}" data-part="osd">
    <i class="${s.corner} ${s.c1}"></i><i class="${s.corner} ${s.c2}"></i><i class="${s.corner} ${s.c3}"></i><i class="${s.corner} ${s.c4}"></i>
    <div class="${s.cross}"></div>
    <div class="${s.horizon}" data-part="horizon"><i></i><b></b><i></i></div>
    <div class="${m(s.mode)}" data-part="mode">${esc(i.mode)}</div>
    <div class="${s.pillRow}"><span class="${m(s.pill)}" data-part="pill"><span class="${s.pBg}"></span><span class="${s.pOff}">${esc(i.disarmed)}</span><span class="${s.pOn}">${esc(i.armed)}</span></span></div>
    <div class="${s.thr}">
      <div class="${s.thrBar}"><div class="${s.thrFill}" data-part="fill"></div></div>
      <div class="${s.thrText}"><div class="${m(s.v)}" data-part="thr">000%</div><div class="${m(s.k)}">${esc(i.throttle)}</div></div>
    </div>
    <div class="${s.readouts}">
      <div class="${m(s.v)}" data-part="roll">+000.0°</div><div class="${m(s.k)}">${esc(i.roll)}</div>
      <div class="${m(s.v)}" data-part="alt">0.00 m</div><div class="${m(s.k)}">${esc(i.alt)}</div>
    </div>
    <div class="${m(s.status)}" data-part="status"><span class="${s.sOff}">${esc(i.preflight)}</span><span class="${s.sOn}">${esc(i.sim)}</span></div>
  </div>
  <div class="${s.center}">
    <div class="${s.word} ${s.echo}" data-part="echo">${esc(i.armed.toUpperCase())}</div>
    <div class="${s.word}" data-part="word">${esc(i.armed.toUpperCase())}</div>
  </div>
  <div class="${m(s.cap)}" data-part="cap"><b>${esc(i.cap.key)}</b> · ${esc(i.cap.text)}</div>
  <div class="${s.center}">
    <div class="${s.lockBox}">
      <div class="${m(s.lockK)}" data-part="lockk">${esc(i.lock)}</div>
      <div class="${s.lock}" data-part="lock"><i></i><i></i><i></i><i></i></div>
    </div>
  </div>
  <div class="${s.center}"><div class="${s.iris}" data-part="iris"></div></div>
  <div class="${s.flash}" data-part="flash"></div>
  <span class="${m(s.skip)}">${esc(i.skip)}</span>
</div>
<div class="${s.name}" data-part="name">
  <div class="${s.line}" data-part="n1">${esc(NAME[0])}</div>
  <div class="${s.line}" data-part="n2">${esc(NAME[1])}<span data-part="dot">.</span></div>
</div>`
}

const HTML = overlayHTML()

function wanted(root: HTMLElement) {
  try {
    if (new URLSearchParams(window.location.search).has('intro')) return true
    if (
      window.location.pathname.replace(/\/$/, '') !==
      (root.dataset.introPath ?? INTRO_PATH)
    )
      return false
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return false
    return (
      sessionStorage.getItem(root.dataset.introCookie || INTRO_COOKIE) !==
      'seen'
    )
  } catch {
    return false
  }
}

/**
 * The overlay's CSS failsafe has cleared it already: its script came after the visitor
 * had been given the page (a slow connection). It stays away rather than coming back,
 * and the page carries on as if it had landed on the name.
 */
let late = false
function cleared(root: HTMLElement, el: HTMLElement) {
  late ||= !!el.getAnimations?.().some((a) => {
    const delay = a.effect?.getTiming().delay
    return (
      (a as CSSAnimation).animationName?.includes('failsafe') &&
      typeof delay === 'number' &&
      typeof a.currentTime === 'number' &&
      a.currentTime >= delay
    )
  })
  if (late) root.dataset.intro = 'done'
  return late
}

// Start as soon as this module runs: the overlay is already in the HTML.
if (typeof window !== 'undefined') {
  const root = document.querySelector<HTMLElement>('[data-intro-root]')
  const el = document.querySelector<HTMLElement>('[data-intro-overlay]')
  if (root?.dataset.intro === 'on' && el && !cleared(root, el)) runPreflight(el, root)
}

export function Intro() {
  const [live, setLive] = useState(true)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-intro-root]')
    const el = box.current
    if (!root || !el) return
    let run = currentRun()
    if (!run) {
      if (cleared(root, el)) {
        setLive(false)
        return
      }
      const state = root.dataset.intro
      if (!(state === 'on' || (state === undefined && wanted(root)))) {
        root.dataset.intro = 'off'
        setLive(false)
        return
      }
      run = runPreflight(el, root)
    }
    let mounted = true
    run.onEnd(() => {
      if (mounted) setLive(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  if (!live) return null

  return (
    <div
      className={styles.intro}
      ref={box}
      aria-hidden="true"
      data-intro-overlay=""
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: HTML }}
    />
  )
}
