'use client'

import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

import { decode, driver } from '@/components/v6/armed'
import { B, focusIn } from '@/components/v7/tempo'
import { vneo } from '@/content/vneo/site'

import './hero.css'

/*
 * Hero v6, "Cedars, open": v2's name column and ID lock, without the plate.
 * The photograph has no frame. It comes in from the right edge, runs off the
 * top under the header and fades into the page's dark toward the name, so
 * the first screen is one clearing under the cedars with Rami standing at its
 * lower right. The big trunk at the photo's left edge is where it melts into
 * the page, so the dark beside the name reads as that tree's shade.
 *
 * It arrives in one slow breath: a touch large, settling, the way a camera
 * finds focus. The canopy sharpens first and he does a beat later, and the
 * ID-lock brackets ride that focus from the trees down onto him. After that
 * nothing moves unless the visitor does. On a phone (or any portrait screen
 * up to a tablet) the photo is a full-bleed backdrop across the top, with the
 * name over its darkened canopy.
 */

const PHOTO = {
  /** WebP for browsers without AVIF */
  src: '/images/vneo/rami-cedars-1.webp',
  /** 600 × 800, for phones */
  small: '/images/vneo/rami-cedars-1-sm.webp',
  /** AVIF at 600, 1050 and 1500 wide: sharp on a retina laptop at a fraction of the size */
  avif: (w: 600 | 1050 | 1500) => `/images/vneo/rami-cedars-1-${w}.avif`,
  alt: 'Rami Kronbi seen from behind under the cedars in Lebanon, a tan backpack with a Lebanese flag patch and a drone pilot patch.',
}
const PHONE = '(max-width: 640px)'
/** the stacked layout, as hero.css switches to it */
const STACKED = '(orientation: portrait) and (max-width: 1100px)'

/**
 * The patches, in percent of the photo (1050 × 1400): the dot sits on the
 * patch's outer edge, the leader drops to an elbow under his elbows and runs
 * out to the label. Flag patch: x 710–748, y 954–976; DRONE PILOT patch:
 * x 794–832, y 961–982.
 */
const SPOTS = [
  {
    key: 'flag',
    label: 'Lebanon',
    side: 'left',
    dot: [67.6, 68.9],
    elbow: [61.5, 77],
    end: [44, 77],
  },
  {
    key: 'pilot',
    label: 'Drone pilot',
    side: 'right',
    dot: [79.2, 69.4],
    elbow: [85, 77],
    end: [95, 77],
  },
] as const

/** The ID lock on him, from above his head to under the backpack (x 632–905, y 700–1165), in percent. */
const LOCK = { l: 60.2, t: 50, w: 26, h: 33.2 }

/**
 * Where the brackets first appear, as [left, top, right, bottom] in percent of
 * the photo: across the canopy above him, where the focus lands first; on the
 * stacked layout the name sits over that canopy, so a looser box round him.
 */
const FROM = {
  open: [36, 36, 94, 52],
  stacked: [46, 48, 97, 94],
} as const

const pc = (n: number) => `${n}%`

/** The photograph through the page lens: lens.tsx's LensImage, with a phone-sized file and the hero's loading priority. */
function CedarsLayer({ className, alt }: { className: string; alt: string }) {
  return (
    <picture>
      <source media={PHONE} type="image/avif" srcSet={PHOTO.avif(600)} />
      <source media={PHONE} srcSet={PHOTO.small} />
      <source
        type="image/avif"
        srcSet={`${PHOTO.avif(1050)} 1050w, ${PHOTO.avif(1500)} 1500w`}
        sizes={`${STACKED} 100vw, 62vw`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={className}
        src={PHOTO.src}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        width={1050}
        height={1400}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  )
}

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const c = vneo.hero

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const sub = el.querySelector<HTMLElement>('.vn-h6-sub-shown')!
    const stage = el.querySelector<HTMLElement>('.vn-h6-stage')!
    const lock = el.querySelector<HTMLElement>('.vn-h6-lock')!
    const rack = el.querySelector<HTMLElement>('.vn-h6-rack')!
    const photo = el.querySelector<HTMLImageElement>('.vn-h6-photo img')
    let dead = false
    let wait = 0

    // the whole entrance, built when it starts (so nothing shows half-set while the photo loads)
    const build = () => {
      // the brackets' first box, in pixels from where they land: measured once, before anything moves
      const s = stage.getBoundingClientRect()
      const [l, t, r, b] = matchMedia(STACKED).matches
        ? FROM.stacked
        : FROM.open
      const dl = ((l - LOCK.l) * s.width) / 100
      const dr = ((r - LOCK.l - LOCK.w) * s.width) / 100
      const dt = ((t - LOCK.t) * s.height) / 100
      const db = ((b - LOCK.t - LOCK.h) * s.height) / 100
      const start = [
        [dl, dt],
        [dr, dt],
        [dl, db],
        [dr, db],
      ]

      const tl = gsap.timeline({ paused: true })
      // RAMI arrives out of focus and colour fringe, and settles
      tl.fromTo(
        '.vn-h6-n1',
        { opacity: 0, scale: 1.35, filter: 'blur(18px)', '--ca': 14 },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          '--ca': 0,
          duration: 1.2 * B,
          ease: 'power3.out',
          clearProps: 'filter',
        },
        0
      )
      // the one breath: the whole clearing starts a touch large and settles round him
      tl.fromTo(
        '.vn-h6-air',
        { scale: 1.06 },
        { scale: 1, duration: 3.6 * B, ease: 'power2.out' },
        0
      )
      // the photo finds focus: its green and magenta layers converge as the blur clears,
      // and the canopy is sharp by the time KRONBI lands
      focusIn(tl, '.vn-h6-veil', 0.15 * B, {
        dur: 1.6 * B,
        blur: 16,
        ca: 8,
        scale: 1,
      })
      // he stays soft a beat longer: a blur over him alone clears after the trees have
      tl.set(rack, { display: 'block', '--rack': 10 }, 0)
      tl.to(
        rack,
        { '--rack': 0, duration: 1.5 * B, ease: 'power2.inOut' },
        1.7 * B
      )
      tl.set(rack, { display: 'none' }, 3.25 * B)
      // KRONBI slides in on the next beat
      tl.fromTo(
        '.vn-h6-n2',
        { opacity: 0, x: '18vw', filter: 'blur(16px)', '--ca': 12 },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          '--ca': 0,
          duration: 1.1 * B,
          ease: 'power3.out',
          clearProps: 'filter',
        },
        B
      )
      tl.fromTo(
        '.vn-h6-n2 > span',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2.4)' },
        1.5 * B
      )
      // the title decodes out of glyph noise
      let last = ''
      const dec = driver((q) => {
        const shown = decode(c.sub, q, Math.floor(q * 20))
        if (shown !== last) sub.textContent = last = shown
      })
      tl.fromTo(dec, { p: 0 }, { p: 1, duration: 1.2 * B, ease: 'none' }, 2 * B)
      tl.fromTo(
        '.vn-h6-cred',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 * B, ease: 'power2.out' },
        2.6 * B
      )
      tl.fromTo(
        '.vn-h6-chip',
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7 * B,
          ease: 'power2.out',
          stagger: B / 3,
        },
        3 * B
      )
      // the ID lock: the brackets appear where the focus is, in the canopy, then follow it down onto him
      lock.querySelectorAll('i').forEach((br, i) => {
        const [x, y] = start[i]
        tl.fromTo(
          br,
          { opacity: 0, x, y },
          { opacity: 1, x, y, duration: 0.5 * B, ease: 'power1.out' },
          1.4 * B
        )
        tl.to(
          br,
          { x: 0, y: 0, duration: 1.3 * B, ease: 'power3.inOut' },
          2 * B + i * 0.04
        )
      })
      // it holds: the tag reads out, and the label over the name with it
      tl.fromTo(
        '.vn-h6-tag, .vn-h6-id',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        3.4 * B
      )
      tl.fromTo(
        '.vn-h6-cap',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8 * B, ease: 'power2.out' },
        3.6 * B
      )
      tl.fromTo(
        '.vn-h6-spots',
        { opacity: 0 },
        { opacity: 1, duration: 0.8 * B, ease: 'power1.out' },
        3.6 * B
      )
      return tl
    }

    const ctx = gsap.context(() => {}, el)
    if (reduce) {
      ctx.add(() => {
        build().progress(1)
        gsap.set(rack, { display: 'none' })
        sub.textContent = c.sub
      })
      el.dataset.rolled = ''
    } else {
      // the photo is the moment: wait (briefly) for it to be decoded, so the breath isn't spent on an empty box
      const go = () => {
        if (dead) return
        ctx.add(() => {
          const tl = build()
          el.dataset.rolled = ''
          tl.play(0)
        })
      }
      const ready = photo ? photo.decode() : Promise.resolve()
      const late = new Promise((ok) => {
        wait = window.setTimeout(ok, 700)
      })
      Promise.race([ready, late]).then(go, go)
    }
    return () => {
      dead = true
      clearTimeout(wait)
      ctx.revert()
      delete el.dataset.rolled
    }
  }, [c.sub])

  return (
    <section ref={root} id="top" className="vn-h6" aria-labelledby="vneo-name">
      <div className="vn-h6-text">
        <div className="vn-h6-head">
          <p className="vn-h6-id" aria-hidden="true">
            {c.id}
          </p>
          <h1 id="vneo-name" className="vn-h6-name" data-lens="">
            <span className="vn-h6-n1 fx">{c.first}</span>
            <span className="vn-h6-n2 fx">
              {c.last}
              <span>.</span>
            </span>
          </h1>
        </div>
        <div className="vn-h6-more">
          <p className="vn-h6-sub">
            <span className="vn-h6-sub-shown" aria-hidden="true">
              {c.sub}
            </span>
            <span className="v7-vh">{c.sub}</span>
          </p>
          <p className="vn-h6-cred">
            <a href={c.cred.href} target="_blank" rel="noopener">
              {c.cred.text}
            </a>
          </p>
          <nav className="vn-h6-chips" aria-label="On this page">
            {c.chips.map((ch) => (
              <a key={ch.href} className="vn-h6-chip" href={ch.href}>
                {ch.label}
              </a>
            ))}
            <span className="vn-h6-where">{c.where}</span>
          </nav>
        </div>
      </div>
      <div className="vn-h6-bleed">
        <figure className="vn-h6-fig">
          {/* the photo at its own 3:4, so everything on it is placed in the photo's percent */}
          <div className="vn-h6-stage">
            <div className="vn-h6-air">
              <div className="vn-h6-veil">
                <span
                  className="vn-lens-img vn-h6-photo"
                  data-lens-img=""
                  // a busy canopy: a lighter split than the lens gives a portrait
                  data-lens="0.4"
                >
                  <CedarsLayer className="vn-li-base" alt={PHOTO.alt} />
                  <CedarsLayer className="vn-li-g" alt="" />
                  <CedarsLayer className="vn-li-m" alt="" />
                </span>
                <span className="vn-h6-rack" aria-hidden="true" />
              </div>

              {/* focusable, so a keyboard can bring up the patches the way a pointer does */}
              <div
                className="vn-h6-hit"
                tabIndex={0}
                role="group"
                aria-labelledby="vn-h6-cap"
              />

              <span className="vn-h6-spots" aria-hidden="true">
                {SPOTS.map((s) => (
                  <span key={s.key} className="vn-h6-spot" data-side={s.side}>
                    <svg className="vn-h6-lead" focusable="false">
                      {(['vn-h6-halo', 'vn-h6-line'] as const).map((cls) => (
                        <g key={cls} className={cls}>
                          <line
                            x1={pc(s.dot[0])}
                            y1={pc(s.dot[1])}
                            x2={pc(s.elbow[0])}
                            y2={pc(s.elbow[1])}
                          />
                          <line
                            x1={pc(s.elbow[0])}
                            y1={pc(s.elbow[1])}
                            x2={pc(s.end[0])}
                            y2={pc(s.end[1])}
                          />
                        </g>
                      ))}
                    </svg>
                    <i
                      className="vn-h6-dot"
                      style={{ left: pc(s.dot[0]), top: pc(s.dot[1]) }}
                    />
                    <span
                      className="vn-h6-label"
                      style={
                        s.side === 'left'
                          ? {
                              left: pc(s.end[0]),
                              top: `calc(${pc(s.end[1])} + 5px)`,
                            }
                          : {
                              right: pc(100 - s.end[0]),
                              top: `calc(${pc(s.end[1])} + 5px)`,
                            }
                      }
                    >
                      {s.label}
                    </span>
                  </span>
                ))}
              </span>

              <span
                className="vn-h6-lock"
                aria-hidden="true"
                style={{
                  left: pc(LOCK.l),
                  top: pc(LOCK.t),
                  width: pc(LOCK.w),
                  height: pc(LOCK.h),
                }}
              >
                <i />
                <i />
                <i />
                <i />
                <span className="vn-h6-tag">ID lock · {c.first}</span>
              </span>
            </div>
          </div>
          <figcaption id="vn-h6-cap" className="vn-h6-cap">
            <span className="vn-h6-fig-no">Fig. 0</span>
            <span>Under the cedars, Lebanon.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
