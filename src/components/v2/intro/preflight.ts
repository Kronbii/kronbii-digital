import { gsap } from 'gsap'

import { v2Intro } from '@/content/v2/home'

import type { FlightReadout, PreflightScene, PreflightSize } from './preflight-scene'
import { FLIGHT_SPEED, INTRO_COOKIE, PREFLIGHT as PF, introModelBytes } from './timing'

/*
 * The preflight's driver. Plain DOM and GSAP over the server-rendered overlay,
 * so it starts the moment its script arrives instead of waiting for the page
 * to hydrate. The opening (the display booting, the arm switch, ARMED) is CSS
 * and runs from the first paint with no script at all; this reads when that
 * arm happened and runs the rest of the flight on the same clock. The 3D
 * layer never holds anything up: it fades in at whatever point the flight
 * has reached when it is ready, and where the browser allows it renders in a
 * worker (./preflight.worker) on an OffscreenCanvas, so the page hydrating and
 * building underneath cannot drop its frames. React only renders the markup
 * and removes it when this reports the end.
 */

const SKIP_KEYS = new Set(['Escape', 'Enter', ' ', 'ArrowDown', 'PageDown', 'Tab'])

/** The 3D layer, wherever it renders. */
interface Layer {
  ready: Promise<void>
  /** the latest flight readout (drawing the frame, on the page path) */
  readout(t: number): FlightReadout | null
  /** the arm moment moved (the late-3D jump) */
  arm(): void
  resize(): void
  stop(): void
}

/** A worker with an OffscreenCanvas, where the model decodes the way it does on the page. */
function workerCapable() {
  try {
    if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return false
    if (!('transferControlToOffscreen' in HTMLCanvasElement.prototype)) return false
    // GLTFLoader decodes textures with ImageBitmap in a worker; Safari takes an <img> path that workers lack
    return !/^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  } catch {
    return false
  }
}

const deg = (r: number) => {
  const d = ((((r * 180) / Math.PI) % 360) + 540) % 360 - 180
  return `${d < 0 ? '−' : '+'}${Math.abs(d).toFixed(1).padStart(5, '0')}°`
}

const now = () => (document.timeline?.currentTime as number | null) ?? performance.now()

export interface PreflightRun {
  /** Called once, when the overlay has finished (played out or skipped). */
  onEnd(cb: () => void): void
}

let current: PreflightRun | null = null
export const currentRun = () => current

/**
 * Drive the overlay `el` inside its host root. Idempotent: a second call returns
 * the running one. The root names its own session cookie (data-intro-cookie) and
 * the heading the name lands on (data-intro-name); the overlay's --i-brand tints
 * the 3D scene, so each version flies in its own colours.
 */
export function runPreflight(el: HTMLElement, root: HTMLElement): PreflightRun {
  if (current) return current
  const ends: (() => void)[] = []
  let ended = false
  const run: PreflightRun = {
    onEnd(cb) {
      if (ended) cb()
      else ends.push(cb)
    },
  }
  current = run

  // seen in this tab: a new visit (a new tab) plays it again, a reload does not
  try {
    sessionStorage.setItem(root.dataset.introCookie || INTRO_COOKIE, 'seen')
  } catch {
    /* storage off: it simply plays again next time */
  }
  root.dataset.intro = 'playing'
  if (!window.location.hash) window.scrollTo(0, 0)

  const q = <T extends HTMLElement = HTMLElement>(part: string) => el.querySelector<T>(`[data-part="${part}"]`)!
  const stage = q('stage')
  const canvas = q<HTMLCanvasElement>('canvas')
  const fill = q('fill')
  const thrV = q('thr')
  const rollV = q('roll')
  const altV = q('alt')
  const mode = q('mode')
  const horizon = q('horizon')
  const word = q('word')
  const nameBox = q('name')
  const lines = [q('n1'), q('n2')]
  const dot = q('dot')
  const tint = getComputedStyle(el).getPropertyValue('--i-brand').trim() || undefined

  let layer: Layer | null = null
  let layerIn = false
  let shown = false
  let tl: gsap.core.Timeline | null = null
  let hand: gsap.core.Timeline | null = null
  let ending = false
  // when the CSS arm switch flipped, on the document timeline (ms)
  let armAt = now() + 350

  const stopDrawing = () => gsap.ticker.remove(tick)
  const finish = () => {
    if (ended) return
    ended = true
    stopDrawing()
    tl?.kill()
    hand?.kill()
    layer?.stop()
    layer = null
    window.removeEventListener('resize', onResize)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('wheel', skip)
    window.removeEventListener('touchmove', skip)
    el.removeEventListener('pointerdown', skip)
    root.dataset.intro = 'done'
    el.dataset.gone = ''
    ends.splice(0).forEach((cb) => cb())
  }
  const skip = () => {
    if (ending || ended) return
    ending = true
    tl?.kill()
    hand?.kill()
    stopDrawing()
    layer?.stop()
    layer = null
    el.dataset.exiting = ''
    root.dataset.intro = 'done'
    gsap.to(el, { opacity: 0, duration: 0.45, ease: 'power2.out', onComplete: finish })
  }
  const onKey = (e: KeyboardEvent) => {
    if (!SKIP_KEYS.has(e.key)) return
    if (e.key !== 'Tab') e.preventDefault()
    skip()
  }
  window.addEventListener('keydown', onKey)
  window.addEventListener('wheel', skip, { passive: true })
  window.addEventListener('touchmove', skip, { passive: true })
  el.addEventListener('pointerdown', skip)

  // seconds of flight (the choreography's time), not real seconds
  const elapsed = () => ((now() - armAt) / 1000) * FLIGHT_SPEED
  const sizeNow = (): PreflightSize => ({
    width: canvas.clientWidth || window.innerWidth,
    height: canvas.clientHeight || window.innerHeight,
    dpr: window.devicePixelRatio || 1,
  })
  const onResize = () => layer?.resize()
  window.addEventListener('resize', onResize)

  // The model was requested at first paint (the page's preload); this picks up
  // that response, and the bytes go to whichever layer draws.
  const modelBytes = introModelBytes()

  const workerLayer = (): Layer | null => {
    let w: Worker
    try {
      w = new Worker(new URL('./preflight.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      return null
    }
    const off = canvas.transferControlToOffscreen()
    let latest: FlightReadout | null = null
    let settle: [() => void, (e: unknown) => void] = [() => {}, () => {}]
    const ready = new Promise<void>((a, b) => (settle = [a, b]))
    w.onmessage = (e: MessageEvent<{ type: string; r?: FlightReadout }>) => {
      if (e.data.type === 'frame') latest = e.data.r ?? null
      else if (e.data.type === 'ready') settle[0]()
      else if (e.data.type === 'fail') settle[1](new Error('preflight 3d'))
    }
    w.onerror = () => settle[1](new Error('preflight worker'))
    const armAbs = () => performance.timeOrigin + armAt
    w.postMessage({ type: 'init', canvas: off, size: sizeNow(), armAbs: armAbs(), tint }, [off])
    void modelBytes.then((bytes) => w.postMessage({ type: 'model', bytes }, bytes ? [bytes] : []))
    return {
      ready,
      readout: () => latest,
      arm: () => w.postMessage({ type: 'arm', armAbs: armAbs() }),
      resize: () => w.postMessage({ type: 'size', size: sizeNow() }),
      stop: () => {
        w.postMessage({ type: 'stop' })
        setTimeout(() => w.terminate(), 250)
      },
    }
  }

  const pageLayer = (): Layer => {
    let scene: PreflightScene | null = null
    const ready = import('./preflight-scene').then((m) => {
      if (ended || ending) throw new Error('ended')
      scene = m.createPreflight(canvas, sizeNow(), modelBytes, tint)
      return scene.ready
    })
    return {
      ready,
      readout: (t) => (scene ? scene.frame(t) : null),
      arm: () => {},
      resize: () => scene?.resize(sizeNow()),
      stop: () => {
        scene?.dispose()
        scene = null
      },
    }
  }


  /*
   * The handoff. Measured when it starts, so a resize along the way is fine.
   * The name leads: each line glides on one curve onto the matching line of
   * the page heading, taking on its size and, in step with the background,
   * its colour. A beat behind it, the stage pushes forward and crossfades
   * away. At rest the name sits exactly on the heading; the heading is shown
   * underneath and the copy fades off the top. The home drone drops into its
   * plate only after that, as its own beat.
   */
  const handoff = () => {
    if (ended || ending) return
    root.dataset.intro = 'reveal'
    const D = PF.handoffDur
    const h = gsap.timeline({ onComplete: finish })
    hand = h

    const h1 = document.getElementById(root.dataset.introName || 'v2-name')
    const targets = h1 ? Array.from(h1.children).filter((c): c is HTMLElement => c instanceof HTMLElement) : []
    const vh = window.innerHeight
    const onScreen =
      targets.length === lines.length &&
      targets.every((t) => {
        const r = t.getBoundingClientRect()
        return r.bottom > 0 && r.top < vh
      })

    if (onScreen) {
      gsap.set(lines, { transformOrigin: '0 0' })
      lines.forEach((line, i) => {
        const a = line.getBoundingClientRect()
        const b = targets[i].getBoundingClientRect()
        const scale = parseFloat(getComputedStyle(targets[i]).fontSize) / parseFloat(getComputedStyle(line).fontSize)
        h.to(line, { x: b.left - a.left, y: b.top - a.top, scale, duration: D, ease: 'power2.inOut' }, i * 0.05)
      })
      const ink = getComputedStyle(targets[0]).color
      const tip = targets[1].querySelector('span')
      h.to(lines, { color: ink, duration: D * 0.72, ease: 'sine.inOut' }, D * 0.16)
      if (tip) h.to(dot, { color: getComputedStyle(tip).color, duration: D * 0.72, ease: 'sine.inOut' }, D * 0.16)
      // at rest on the heading: show the heading underneath, let the copy go
      h.call(
        () => {
          root.dataset.intro = 'done'
        },
        [],
        D + 0.06,
      )
      h.to(nameBox, { opacity: 0, duration: 0.24, ease: 'power1.out' }, D + 0.08)
    } else {
      h.to(nameBox, { opacity: 0, scale: 1.04, duration: D * 0.7, ease: 'power2.in', transformOrigin: '30% 50%' }, 0)
    }

    // the stage pushes forward and crossfades away, a beat behind the name
    h.to(stage, { opacity: 0, scale: 1.045, duration: D * 0.88, ease: 'sine.inOut', transformOrigin: '50% 55%' }, D * 0.14)
  }

  const build = () => {
    const t = gsap.timeline({ paused: true })
    const corners = el.querySelectorAll('[data-part="lock"] > i')

    // (0 to 1.75 s, the arm, the slam, the caption: CSS, see intro.module.css)

    // lock: the brackets fly in from the corners as the airframe faces the lens, then tighten
    corners.forEach((c, i) => {
      t.fromTo(
        c,
        { opacity: 0, x: `${[-1, 1, -1, 1][i] * 36}vw`, y: `${[-1, -1, 1, 1][i] * 30}vh` },
        { opacity: 1, x: 0, y: 0, duration: 0.42, ease: 'expo.out' },
        PF.lock + i * 0.03,
      )
    })
    t.fromTo(q('lockk'), { opacity: 0 }, { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true }, PF.lock + 0.12)
    t.to(q('lock'), { scale: 0.42, duration: 0.42, ease: 'power3.in' }, 2.66)
    t.to([q('lock'), q('lockk'), q('osd')], { opacity: 0, duration: 0.16, ease: 'power1.in' }, 2.94)
    // into the lens: a dark iris swallows the frame
    t.fromTo(q('iris'), { scale: 0 }, { scale: 1, duration: PF.iris[1] - PF.iris[0], ease: 'power2.in' }, PF.iris[0])
    t.set(q('iris'), { opacity: 0 }, PF.name)

    // the name drops over the FPV run
    t.fromTo(q('flash'), { opacity: 0.34 }, { opacity: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, PF.name)
    t.fromTo(q('glow'), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' }, PF.name)
    t.fromTo(lines[0], { opacity: 0, scale: 1.22 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'expo.out' }, PF.name)
    t.fromTo(lines[1], { opacity: 0, x: '14vw' }, { opacity: 1, x: 0, duration: 0.42, ease: 'expo.out' }, PF.name + 0.06)
    t.fromTo(dot, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, PF.name + 0.2)

    // the handoff, and the FPV run keeps flying underneath it
    t.call(handoff, [], PF.handoff)
    t.set({}, {}, PF.handoff + PF.handoffDur + 0.4)
    return t
  }

  /*
   * When the flight starts. The CSS opening (boot, ARMED) runs from the first
   * paint on its own clock, cssArm. The flight's clock, armAt, starts with the
   * drone: when it is ready it fades in on the still prop and the motors spool up
   * a beat later, so every visit sees the same opening shot whatever the load
   * time. A drone that is in before the arm flies exactly with it, as designed.
   * On a slow connection the opening holds while the model downloads (up to
   * HARD_CAP after the arm) and gives the 3D MODEL_GRACE to build once it is in;
   * a drone that still is not ready then is skipped: the intro goes to the lens
   * iris and the name.
   */
  const MAX_WAIT = 2.5
  // a slow connection: while the model is still downloading, the opening holds this long after the arm at most
  const HARD_CAP = 7
  // once the model is in, this long to build the 3D before the flight goes on without it
  const MODEL_GRACE = 1.5
  let modelAt: number | null = null
  void modelBytes.then(() => (modelAt = now()))
  const LEAD = 0.15
  let cssArm = armAt
  let flying = false
  const deadline = () => {
    const base = cssArm + MAX_WAIT * 1000
    const cap = cssArm + HARD_CAP * 1000
    return modelAt === null ? cap : Math.max(base, Math.min(cap, modelAt + MODEL_GRACE * 1000))
  }
  armAt = deadline()

  const launch = (at: number) => {
    if (flying) return
    flying = true
    armAt = at
    layer?.arm()
  }

  // a compositor animation: the page loading underneath cannot stutter the fade
  const show = (duration: number) => {
    if (shown) return
    shown = true
    canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration * 1000, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' })
  }

  // one clock for everything: the GSAP timeline (paused, and set every frame so it
  // can never drift from the 3D), the no-drone fallback, and the readouts
  function tick() {
    if (ended) return
    if (!flying && now() >= deadline()) launch(now() - (2.96 / FLIGHT_SPEED) * 1000) // no drone: to the iris
    const t = elapsed()
    // the FPV run after the name needs only the terrain, so a very late model joins there
    if (layerIn && !shown && t >= PF.name && t < PF.handoff - 0.4) show(0.3)
    if (tl) tl.time(Math.max(0, t))
    if (!layer || !shown) return
    const r = layer.readout(t)
    if (!r) return
    fill.style.transform = `scaleY(${r.throttle.toFixed(3)})`
    thrV.textContent = `${String(Math.round(r.throttle * 100)).padStart(3, '0')}%`
    rollV.textContent = deg(r.roll)
    altV.textContent = `${r.alt.toFixed(2)} m`
    mode.textContent = r.mode === 'flip' ? v2Intro.modeFlip : v2Intro.mode
    horizon.style.transform = `rotate(${((-r.roll * 180) / Math.PI).toFixed(2)}deg)`
  }

  const start = () => {
    if (ended || ending) return
    tl = build()
    gsap.ticker.add(tick)
    tick()
  }

  // the arm is CSS (the word's slam): read when it fired
  const armAnim = word.getAnimations?.().find((a) => (a as CSSAnimation).animationName?.includes('slam'))
  const syncArm = () => {
    const st = armAnim?.startTime
    const delay = armAnim?.effect?.getTiming().delay
    if (typeof st !== 'number' || typeof delay !== 'number') return
    cssArm = st + delay
    if (!flying) armAt = deadline()
    else if (armAt < cssArm) launch(cssArm)
  }

  // the 3D layer: in a worker where the browser allows it, else on the page
  layer = (workerCapable() && workerLayer()) || pageLayer()
  void layer.ready
    .then(() => {
      layerIn = true
      if (ended || ending) return
      if (!flying) {
        show(0.35)
        launch(Math.max(cssArm, now() + LEAD * 1000))
      } else {
        const t = elapsed()
        if (t >= PF.name && t < PF.handoff - 0.4) show(0.3)
      }
    })
    .catch(() => {})

  if (armAnim && armAnim.startTime === null) void armAnim.ready.then(() => (syncArm(), start()))
  else {
    syncArm()
    start()
  }

  return run
}
