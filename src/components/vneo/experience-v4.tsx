'use client'

import { gsap } from 'gsap'
import { Rotate3d } from 'lucide-react'
import type MatterNS from 'matter-js'
import Image from 'next/image'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
} from 'react'

import { B } from '@/components/v7/tempo'
import type { BoardRole } from '@/content/vneo/experience-board'
import { experience as c } from '@/content/vneo/experience'

import { Slate } from './slate'
import './experience-v4.css'

/*
 * Experience as staff passes, each hanging from a lanyard on a rail. The
 * places I work now hang on the first rail, big and sage, a "Now" stripe
 * across the bottom; everything before and alongside hangs on the second.
 * Each pass carries the hero's ID lock: four corner brackets that close on
 * its callsign once the pass has caught on its lanyard.
 *
 * On a wide screen the passes are physical (matter-js): on first sight they
 * drop from the rail one after another, catch, sway and settle; brushing past
 * one moves it, and you can grab one and swing it. The bodies only drive
 * transforms on DOM passes, so the type stays crisp. A click turns a pass
 * over (a drag never does) to what I did there. On a phone, or with reduced
 * motion, there is no physics: the passes hang still in rows that still turn.
 * Community work is not a pass; it is stuck on as a sticker under the rails.
 */

const WIDE = '(min-width: 1000px)'
const SWING = `${WIDE} and (prefers-reduced-motion: no-preference)`
const CALM = '(prefers-reduced-motion: reduce)'
/** how much closer a turned pass comes, to be read: the small ones more */
const LIFT_LEAD = 1.12
const LIFT = 1.26

const isNow = (r: BoardRole) => r.to === 'now'

/** The dates a pass is good for: a current role's first year (or just Now), a past one's span. */
const valid = (r: BoardRole) =>
  isNow(r)
    ? r.from !== undefined
      ? `${c.strip.since} ${Math.floor(r.from)}`
      : null
    : r.when

function useMedia(query: string) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const mq = matchMedia(query)
    const set = () => setOn(mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [query])
  return on
}

export function ExperienceV4({ roles }: { roles: BoardRole[]; now: number }) {
  const swing = useMedia(SWING)
  const calm = useMedia(CALM)
  const [turned, setTurned] = useState<Record<string, boolean>>({})
  const toggle = useCallback(
    (id: string) => setTurned((t) => ({ ...t, [id]: !t[id] })),
    []
  )

  const passes = roles.filter((r) => r.kept && !r.side)
  const lead = passes.filter((r) => r.lead)
  const end = (r: BoardRole) => (r.to === 'now' ? Infinity : r.to)
  const rest = passes
    .filter((r) => !r.lead)
    .sort((a, b) => end(b) - end(a) || (b.from ?? 0) - (a.from ?? 0))
  // community work has its own section: here it is only stuck on, small
  const side = roles
    .filter((r) => r.kept && r.side)
    .sort((a, b) => (b.from ?? 0) - (a.from ?? 0))

  return (
    <section id="experience" className="vn-xv4" aria-labelledby="exp-h">
      <Slate no={c.no} label={c.label} title={c.title} hot={c.hot} id="exp-h">
        <p className="xv4-lede">{c.lede}</p>
        <p className="xv4-hint">
          <Rotate3d aria-hidden="true" />
          {swing
            ? 'Click a pass to turn it over, or grab it and swing it.'
            : 'Tap or click a pass to turn it over.'}
        </p>
      </Slate>

      <Rack
        id="xv4-now"
        title={c.bays.lead}
        roles={lead}
        lead
        swing={swing}
        calm={calm}
        turned={turned}
        toggle={toggle}
      />
      <Rack
        id="xv4-before"
        title={c.bays.rest}
        roles={rest}
        swing={swing}
        calm={calm}
        turned={turned}
        toggle={toggle}
      />

      {side.length ? (
        <div className="xv4-also">
          <span className="xv4-also-h">{c.also.label}</span>
          <ul>
            {side.map((r, i) => (
              <li key={r.id}>
                <a
                  className="xv4-sticker"
                  href="#community"
                  style={{ '--tilt': `${i % 2 ? 1.1 : -1.6}deg` } as CSSProperties}
                >
                  <b>{r.call}</b>
                  <span>{r.org}</span>
                  <small>{r.when}</small>
                </a>
              </li>
            ))}
          </ul>
          <a className="xv4-also-to" href="#community">
            {c.also.to}
          </a>
        </div>
      ) : null}
    </section>
  )
}

interface Api {
  /** a pass being turned over jostles on its lanyard */
  kick: (i: number) => void
}

function Rack({
  id,
  title,
  roles,
  lead,
  swing,
  calm,
  turned,
  toggle,
}: {
  id: string
  title: string
  roles: BoardRole[]
  lead?: boolean
  swing: boolean
  calm: boolean
  turned: Record<string, boolean>
  toggle: (id: string) => void
}) {
  const rack = useRef<HTMLDivElement>(null)
  const api = useRef<Api | null>(null)
  // when a drag last ended: the pointer's release is not a click
  const held = useRef(0)

  useEffect(() => {
    const el = rack.current
    if (!swing || !el) return
    let off = false
    let stop: (() => void) | undefined
    import('matter-js').then(({ default: Matter }) => {
      if (off) return
      stop = hang(Matter, el, api, () => {
        held.current = performance.now()
      })
    })
    return () => {
      off = true
      stop?.()
    }
  }, [swing, roles.length])

  // phones: the row sways once into place on first sight (no physics)
  useEffect(() => {
    const el = rack.current
    if (swing || !el || matchMedia(CALM).matches) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.seen = ''
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -20% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [swing])

  // a row that scrolls sideways keeps an index of its passes: which one is showing
  const [at, setAt] = useState(0)
  useEffect(() => {
    const row = rack.current?.querySelector<HTMLElement>('.xv4-passes')
    if (swing || !row) return
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting)
            setAt(Number((e.target as HTMLElement).dataset.i))
        }),
      { root: row, threshold: 0.6 }
    )
    row.querySelectorAll('.xv4-pass').forEach((li) => io.observe(li))
    return () => io.disconnect()
  }, [swing, roles.length])
  const show = (i: number) => {
    const row = rack.current?.querySelector<HTMLElement>('.xv4-passes')
    const li = row?.querySelectorAll<HTMLElement>('.xv4-pass')[i]
    if (!row || !li) return
    row.scrollTo({
      left: li.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft),
      behavior: matchMedia(CALM).matches ? 'auto' : 'smooth',
    })
  }

  if (!roles.length) return null
  return (
    <div
      ref={rack}
      className="xv4-rack"
      data-lead={lead ? '' : undefined}
      role="group"
      aria-labelledby={`${id}-h`}
    >
      <div className="xv4-stage">
        <h3 id={`${id}-h`} className="xv4-rack-h">
          {title}
        </h3>
        {/* for the eye and the thumb; the passes themselves are the list */}
        <p className="xv4-index" aria-hidden="true">
          {roles.map((r, i) => (
            <button
              key={r.id}
              type="button"
              tabIndex={-1}
              data-on={at === i ? '' : undefined}
              data-now={isNow(r) ? '' : undefined}
              onClick={() => show(i)}
            >
              {r.org}
            </button>
          ))}
        </p>
        <div className="xv4-hang">
          <span className="xv4-rail" aria-hidden="true">
            <i />
            <i />
          </span>
          {swing ? (
            <svg className="xv4-straps" aria-hidden="true">
              {roles.map((r) => (
                <g
                  key={r.id}
                  className="xv4-strap"
                  data-now={isNow(r) ? '' : undefined}
                >
                  <path className="xv4-strap-band" />
                  <path className="xv4-strap-line" />
                </g>
              ))}
            </svg>
          ) : null}
          <ol className="xv4-passes">
            {roles.map((r, i) => (
              <Pass
                key={r.id}
                r={r}
                i={i}
                lead={lead}
                calm={calm}
                turned={!!turned[r.id]}
                onTurn={() => {
                  if (performance.now() - held.current < 260) return
                  toggle(r.id)
                  api.current?.kick(i)
                }}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

function Pass({
  r,
  i,
  lead,
  calm,
  turned,
  onTurn,
}: {
  r: BoardRole
  i: number
  lead?: boolean
  calm: boolean
  turned: boolean
  onTurn: () => void
}) {
  const card = useRef<HTMLDivElement>(null)
  const back = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const first = useRef(true)
  const now = isNow(r)
  const dates = valid(r)
  const backId = `xv4-${r.id}-back`

  // turning over: the pass comes towards you as it turns, then hangs back
  useEffect(() => {
    const el = card.current
    const bk = back.current
    if (!el || !bk) return
    // the back is out of reach while it faces the wall
    bk.inert = !turned
    if (!turned && bk.contains(document.activeElement))
      btn.current?.focus({ preventScroll: true })
    if (first.current) {
      first.current = false
      gsap.set(el, { rotationY: turned ? 180 : 0 })
      return
    }
    // on a wide screen a turned pass is lifted closer to read, from its clip
    const show = el.parentElement
    const clip = show?.querySelector<HTMLElement>('.xv4-clip')
    if (show && clip) {
      const lift =
        turned && matchMedia(WIDE).matches ? (lead ? LIFT_LEAD : LIFT) : 1
      gsap.to(show, {
        scale: lift,
        transformOrigin: `50% ${clip.offsetTop}px`,
        duration: calm ? 0 : 1.2 * B,
        ease: 'power3.inOut',
        overwrite: 'auto',
      })
    }
    if (calm) {
      gsap
        .timeline()
        .to(el, { opacity: 0, duration: 0.12, ease: 'none' })
        .set(el, { rotationY: turned ? 180 : 0 })
        .to(el, { opacity: 1, duration: 0.18, ease: 'none' })
      return
    }
    gsap.to(el, {
      rotationY: turned ? 180 : 0,
      duration: 1.2 * B,
      ease: 'power3.inOut',
      overwrite: 'auto',
    })
    gsap.to(el, {
      z: lead ? 80 : 64,
      duration: 0.55 * B,
      ease: 'sine.out',
      overwrite: 'auto',
      onComplete: () => {
        gsap.to(el, { z: 0, duration: 0.7 * B, ease: 'sine.inOut' })
      },
    })
  }, [turned, calm, lead])

  // a long back fits its pass: the type steps down a little until it does
  useEffect(() => {
    const face = back.current
    const inner = face?.querySelector<HTMLElement>('.xv4-back-in')
    if (!face || !inner) return
    const fit = () => {
      let f = 1
      face.style.setProperty('--fit', '1')
      while (f > 0.74 && inner.scrollHeight > inner.clientHeight + 1) {
        f = Math.round((f - 0.03) * 100) / 100
        face.style.setProperty('--fit', String(f))
      }
    }
    fit()
    document.fonts?.ready.then(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(face)
    return () => ro.disconnect()
  }, [])

  return (
    <li
      className="xv4-pass"
      data-now={now ? '' : undefined}
      data-turned={turned ? '' : undefined}
      data-i={i}
      style={{ '--i': i } as CSSProperties}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && turned) {
          onTurn()
          btn.current?.focus()
        }
      }}
    >
      <div className="xv4-body">
        <div className="xv4-show">
          <span className="xv4-clip" aria-hidden="true" />
          <button
            ref={btn}
            type="button"
            className="xv4-turn"
            aria-expanded={turned}
            aria-controls={backId}
            data-lock={turned ? 'Turn back' : 'Turn over'}
            onClick={onTurn}
          >
            <span className="v7-vh">
              {r.org}
              {r.orgLong ? `, ${r.orgLong}` : ''}. {r.role}.{' '}
              {now ? (dates ? `${c.now}, ${dates.toLowerCase()}` : c.now) : dates}.
            </span>
          </button>
          <div ref={card} className="xv4-card">
            <div className="xv4-face xv4-front" aria-hidden="true">
              <span className="xv4-slot" />
              <p className="xv4-kind">
                <span>{r.kindName}</span>
                <Rotate3d aria-hidden="true" />
              </p>
              <p className="xv4-org">{r.org}</p>
              {r.orgLong ? <p className="xv4-orglong">{r.orgLong}</p> : null}
              <div className="xv4-id">
                <span className="xv4-call">{r.call}</span>
                <span className="xv4-lock">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <p className="xv4-role">{r.role}</p>
              <p className="xv4-band">
                {now ? <span className="xv4-live">{c.now}</span> : null}
                {dates ? <span className="xv4-valid">{dates}</span> : null}
              </p>
            </div>

            <div
              ref={back}
              id={backId}
              className="xv4-face xv4-back"
              role="group"
              aria-label={r.org}
              data-lock="Turn back"
              onClick={(e) => {
                if (!(e.target as Element).closest('a')) onTurn()
              }}
            >
              <span className="xv4-slot" aria-hidden="true" />
              <div className="xv4-back-in">
                <p className="xv4-back-head">
                  <b>{r.call}</b>
                  <span>{r.org}</span>
                  <span>{now ? (dates ?? c.now) : dates}</span>
                </p>
                <p className="xv4-note">{r.note}</p>
                {r.more ? <p className="xv4-more">{r.more}</p> : null}
                {r.where || r.with?.length ? (
                  <dl className="xv4-fields">
                    {r.where ? (
                      <div>
                        <dt>Where</dt>
                        <dd>{r.where}</dd>
                      </div>
                    ) : null}
                    {r.with?.length ? (
                      <div>
                        <dt>{c.strip.with}</dt>
                        <dd>{r.with.join(', ')}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
                {r.projects.length ? (
                  <ul className="xv4-work" aria-label={c.strip.projects}>
                    {r.projects.map((p) => (
                      <li key={p.href}>
                        <Link href={p.href} draggable={false}>
                          {p.image ? (
                            <span className="xv4-thumb">
                              <Image
                                src={p.image.src}
                                alt=""
                                fill
                                sizes="56px"
                                draggable={false}
                                style={{ objectPosition: p.image.position }}
                              />
                            </span>
                          ) : null}
                          <span>{p.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {r.writing.length ? (
                  <ul className="xv4-writing" aria-label={c.strip.writing}>
                    {r.writing.map((w) => (
                      <li key={w.href}>
                        <Link href={w.href} draggable={false}>
                          {w.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <p className="xv4-band">
                {r.href ? (
                  <a
                    className="xv4-site"
                    href={r.href}
                    target="_blank"
                    rel="noopener"
                    draggable={false}
                  >
                    {c.strip.site} {r.org}
                  </a>
                ) : (
                  <span>{now ? (dates ?? c.now) : dates}</span>
                )}
                <Rotate3d aria-hidden="true" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

/* ---------- the physics: passes on lanyards ---------- */

type MatterLib = typeof MatterNS

interface Hung {
  body: MatterNS.Body
  rope: MatterNS.Constraint
  /** the pass's centre at rest, as the layout puts it, in the rail's frame */
  rest: { x: number; y: number }
  /** the clip's top, from the pass's centre, unrotated */
  tip: { x: number; y: number }
  /** the lanyard's length, rail to clip */
  len: number
  live: boolean
  at: number
}

const STEP = 1000 / 60
/** a light gravity: a pass sways about once a bar (96 BPM), not a jiggle */
const GRAVITY = 0.0004
/** how hard a tight lanyard pulls, and how much it gives */
const TAUT = 0.35
const TAUT_DAMP = 0.07
const AIR = 0.024

/**
 * Hangs a rack's passes on matter-js lanyards. Returns its teardown. The
 * layout stays the CSS one: each pass's place in it is its rest, and the
 * bodies only add a transform on top.
 */
function hang(
  M: MatterLib,
  rack: HTMLElement,
  api: MutableRefObject<Api | null>,
  onDragEnd: () => void
) {
  const { Engine, Bodies, Body, Composite, Constraint } = M
  const stage = rack.querySelector<HTMLElement>('.xv4-hang')
  const rail = rack.querySelector<HTMLElement>('.xv4-rail')
  if (!stage || !rail) return () => {}
  const els = Array.from(rack.querySelectorAll<HTMLElement>('.xv4-body'))
  const items = els.map((el) => el.closest<HTMLElement>('.xv4-pass')!)
  const shows = els.map((el) => el.querySelector<HTMLElement>('.xv4-show')!)
  const clips = els.map((el) => el.querySelector<HTMLElement>('.xv4-clip')!)
  const calls = els.map((el) => el.querySelector<HTMLElement>('.xv4-call')!)
  const locks = els.map((el) =>
    Array.from(el.querySelectorAll<HTMLElement>('.xv4-lock i'))
  )
  const straps = Array.from(rack.querySelectorAll<SVGGElement>('.xv4-strap'))
  const paths = straps.map((g) => Array.from(g.querySelectorAll('path')))

  const engine = Engine.create({ enableSleeping: false })
  engine.gravity.y = 1
  engine.gravity.scale = GRAVITY
  engine.constraintIterations = 4
  const tweens: gsap.core.Timeline[] = []
  // a breeze from one side as they drop: the first rail one way, the second the other
  const breeze = rack.hasAttribute('data-lead') ? 1 : -1

  let ps: Hung[] = []
  let railY = 0
  let width = 0
  let dropped = false
  let visible = false
  let awake = false
  let raf = 0
  let last = 0
  let acc = 0
  let still = 0
  // the simulation's own clock: it stops with the page off screen, so a drop resumes where it left off
  let clock = 0
  let grab: {
    i: number
    x: number
    y: number
    id: number
    from: { x: number; y: number }
    c: MatterNS.Constraint | null
  } | null = null

  rack.dataset.physics = ''
  rack.dataset.armed = ''

  const build = () => {
    Composite.clear(engine.world, false)
    grab = null
    els.forEach((el) => (el.style.transform = ''))
    const sr = stage.getBoundingClientRect()
    const rr = rail.getBoundingClientRect()
    width = sr.width
    railY = rr.top + rr.height / 2 - sr.top
    ps = els.map((el, i) => {
      const r = el.getBoundingClientRect()
      const w = el.offsetWidth
      const h = el.offsetHeight
      const rest = { x: r.left + w / 2 - sr.left, y: r.top + h / 2 - sr.top }
      const tip = { x: 0, y: clips[i].offsetTop - h / 2 }
      const len = Math.max(8, rest.y + tip.y - railY)
      const body = Bodies.rectangle(rest.x, rest.y, w, h, {
        chamfer: { radius: Math.min(w, h) * 0.055 },
        frictionAir: AIR,
        friction: 0.2,
        restitution: 0.08,
        density: 0.0016,
        // passes hang at slightly different depths: they pass, never knock
        collisionFilter: { group: -1 },
      })
      const rope = Constraint.create({
        pointA: { x: rest.x, y: railY },
        bodyB: body,
        pointB: { ...tip },
        length: len,
        stiffness: TAUT,
        damping: TAUT_DAMP,
      })
      if (dropped) Composite.add(engine.world, [body, rope])
      return { body, rope, rest, tip, len, live: dropped, at: 0 }
    })
    // re-hung mid-drop: the passes still waiting are simply there
    if (dropped) {
      tweens.forEach((t) => t.progress(1))
      gsap.set([...shows, ...straps, ...calls, ...locks.flat()], {
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'none',
      })
    }
    ps.forEach((_, i) => place(i))
  }

  /** the pass's transform, its fringe while it moves, and its lanyard */
  const place = (i: number) => {
    const p = ps[i]
    const b = p.body
    const el = els[i]
    const dx = b.position.x - p.rest.x
    const dy = b.position.y - p.rest.y
    el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${b.angle.toFixed(4)}rad)`
    const ca = Math.min(2.4, b.speed * 0.3 + Math.abs(b.angularVelocity) * 50)
    el.style.setProperty('--ca', ca < 0.05 ? '0' : ca.toFixed(2))

    const cos = Math.cos(b.angle)
    const sin = Math.sin(b.angle)
    const tx = b.position.x + p.tip.x * cos - p.tip.y * sin
    const ty = b.position.y + p.tip.x * sin + p.tip.y * cos
    const ax = p.rest.x
    const ay = railY - 3
    const vx = tx - ax
    const vy = ty - ay
    const d = Math.hypot(vx, vy) || 1
    // slack, the lanyard sags to one side (a parabola of the same length)
    const sag = d < p.len ? Math.min(p.len * 0.32, Math.sqrt((3 * d * (p.len - d)) / 8)) : 0
    let nx = -vy / d
    let ny = vx / d
    if (Math.abs(ny) < 0.2) {
      nx = breeze
      ny = 0
    } else if (ny < 0) {
      nx = -nx
      ny = -ny
    }
    const qx = (ax + tx) / 2 + nx * sag * 2
    const qy = (ay + ty) / 2 + ny * sag * 2
    const dPath = `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`
    paths[i]?.forEach((path) => path.setAttribute('d', dPath))
  }

  const tick = (t: number) => {
    raf = 0
    if (!visible || !awake) {
      last = 0
      return
    }
    const dt = last ? Math.min(50, t - last) : STEP
    last = t
    clock += dt

    ps.forEach((p, i) => {
      if (p.live || !dropped || clock < p.at) return
      p.live = true
      Composite.add(engine.world, [p.body, p.rope])
      enter(i)
    })

    acc += dt
    while (acc >= STEP) {
      // a lanyard only holds when it is pulled tight
      ps.forEach((p) => {
        if (!p.live) return
        const b = p.body
        const cos = Math.cos(b.angle)
        const sin = Math.sin(b.angle)
        const tx = b.position.x + p.tip.x * cos - p.tip.y * sin
        const ty = b.position.y + p.tip.x * sin + p.tip.y * cos
        const taut = Math.hypot(tx - p.rope.pointA.x, ty - p.rope.pointA.y) >= p.len
        p.rope.stiffness = taut ? TAUT : 0
        p.rope.damping = taut ? TAUT_DAMP : 0
      })
      Engine.update(engine, STEP)
      acc -= STEP
    }
    ps.forEach((_, i) => place(i))

    const moving =
      !!grab?.c ||
      ps.some(
        (p) =>
          !p.live ||
          p.body.speed > 0.04 ||
          Math.abs(p.body.angularVelocity) > 0.0005
      )
    still = moving ? 0 : still + 1
    if (still > 45) {
      // settled: let the page rest until someone touches a pass
      awake = false
      last = 0
      acc = 0
      ps.forEach((_, i) => els[i].style.setProperty('--ca', '0'))
      return
    }
    raf = requestAnimationFrame(tick)
  }

  const wake = () => {
    awake = true
    still = 0
    if (!raf && visible) raf = requestAnimationFrame(tick)
  }

  /** a pass appears as it drops, and the ID lock closes on it once it has caught */
  const enter = (i: number) => {
    const tl = gsap.timeline()
    tl.fromTo(
      shows[i],
      { opacity: 0, filter: 'blur(8px)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.8 * B,
        ease: 'power2.out',
        clearProps: 'filter',
      },
      0
    )
    tl.to(straps[i], { opacity: 1, duration: 0.5 * B, ease: 'none' }, 0)
    locks[i].forEach((b, k) => {
      tl.fromTo(
        b,
        { opacity: 0, x: [-1, 1, -1, 1][k] * 22, y: [-1, -1, 1, 1][k] * 16 },
        { opacity: 1, x: 0, y: 0, duration: 0.8 * B, ease: 'power3.out' },
        1.7 * B + k * 0.04
      )
    })
    tl.fromTo(
      calls[i],
      { opacity: 0.35 },
      { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
      1.8 * B
    )
    tweens.push(tl)
  }

  const drop = () => {
    if (dropped) return
    dropped = true
    const t0 = clock
    ps.forEach((p, i) => {
      const side = breeze * (12 + 7 * (i % 3))
      // the clip starts at the rail, the lanyard slack: it falls its own length and catches
      Body.setPosition(p.body, { x: p.rest.x + side, y: p.rest.y - p.len + 4 })
      Body.setAngle(p.body, side * 0.005)
      Body.setVelocity(p.body, { x: 0, y: 0 })
      Body.setAngularVelocity(p.body, 0)
      p.live = false
      p.at = t0 + i * 0.22 * B * 1000
      gsap.set([shows[i], straps[i]], { opacity: 0 })
      locks[i].forEach((b) => gsap.set(b, { opacity: 0 }))
      place(i)
    })
    rack.removeAttribute('data-armed')
    wake()
  }

  // pointer: brush a pass and it moves; grab one and swing it
  const toStage = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const indexOf = (t: EventTarget | null) => {
    const el = (t as Element | null)?.closest?.<HTMLElement>('.xv4-body')
    return el ? els.indexOf(el) : -1
  }
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || e.pointerType === 'touch' || !dropped) return
    if ((e.target as Element).closest('a')) return
    const i = indexOf(e.target)
    if (i < 0 || !ps[i]?.live) return
    grab = { i, x: e.clientX, y: e.clientY, id: e.pointerId, from: toStage(e), c: null }
  }
  const onMove = (e: PointerEvent) => {
    if (!grab || e.pointerId !== grab.id) return
    const p = ps[grab.i]
    if (!grab.c) {
      if (Math.hypot(e.clientX - grab.x, e.clientY - grab.y) < 6) return
      grab.c = Constraint.create({
        pointA: toStage(e),
        bodyB: p.body,
        pointB: {
          x: grab.from.x - p.body.position.x,
          y: grab.from.y - p.body.position.y,
        },
        length: 0.01,
        stiffness: 0.05,
        damping: 0.08,
      })
      Composite.add(engine.world, grab.c)
      try {
        els[grab.i].setPointerCapture(e.pointerId)
      } catch {}
      items[grab.i].dataset.held = ''
      rack.dataset.held = ''
      wake()
      return
    }
    const at = toStage(e)
    // keep the hand near the rail: a pass can be swung, not carried off
    grab.c.pointA = {
      x: Math.max(-80, Math.min(width + 80, at.x)),
      y: Math.max(railY - 40, Math.min(railY + p.len * 2 + 520, at.y)),
    }
    wake()
  }
  const onUp = (e: PointerEvent) => {
    if (!grab || e.pointerId !== grab.id) return
    if (grab.c) {
      Composite.remove(engine.world, grab.c)
      delete items[grab.i].dataset.held
      delete rack.dataset.held
      onDragEnd()
      wake()
    }
    grab = null
  }
  const onOver = (e: PointerEvent) => {
    if (grab || e.pointerType !== 'mouse' || !dropped) return
    const i = indexOf(e.target)
    if (i < 0 || i === indexOf(e.relatedTarget) || !ps[i]?.live) return
    const push = Math.max(-1, Math.min(1, e.movementX / 30))
    if (Math.abs(push) < 0.05) return
    const b = ps[i].body
    Body.setVelocity(b, { x: b.velocity.x + push * 0.6, y: b.velocity.y })
    Body.setAngularVelocity(b, b.angularVelocity - push * 0.004)
    wake()
  }

  api.current = {
    kick: (i) => {
      const p = ps[i]
      if (!p?.live) return
      Body.setAngularVelocity(p.body, p.body.angularVelocity + 0.004 * breeze)
      wake()
    },
  }

  build()

  stage.addEventListener('pointerdown', onDown)
  stage.addEventListener('pointerover', onOver)
  addEventListener('pointermove', onMove)
  addEventListener('pointerup', onUp)
  addEventListener('pointercancel', onUp)

  // run only while the rack is on screen
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (!visible) {
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
    } else if (awake) wake()
  })
  io.observe(rack)
  // first sight: the passes drop
  const seen = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return
      seen.disconnect()
      visible = true
      drop()
    },
    { rootMargin: '0px 0px -22% 0px' }
  )
  seen.observe(stage)

  // a new width re-hangs the passes where the layout now puts them
  let rt = 0
  const ro = new ResizeObserver(() => {
    clearTimeout(rt)
    rt = window.setTimeout(() => {
      if (Math.abs(stage.getBoundingClientRect().width - width) < 1) return
      build()
      if (dropped) wake()
    }, 120)
  })
  ro.observe(stage)

  return () => {
    cancelAnimationFrame(raf)
    clearTimeout(rt)
    io.disconnect()
    seen.disconnect()
    ro.disconnect()
    stage.removeEventListener('pointerdown', onDown)
    stage.removeEventListener('pointerover', onOver)
    removeEventListener('pointermove', onMove)
    removeEventListener('pointerup', onUp)
    removeEventListener('pointercancel', onUp)
    tweens.forEach((t) => t.kill())
    gsap.set([...shows, ...straps, ...calls, ...locks.flat()], { clearProps: 'all' })
    Composite.clear(engine.world, false)
    Engine.clear(engine)
    els.forEach((el) => {
      el.style.transform = ''
      el.style.removeProperty('--ca')
    })
    items.forEach((el) => delete el.dataset.held)
    delete rack.dataset.physics
    delete rack.dataset.armed
    delete rack.dataset.held
    api.current = null
  }
}
