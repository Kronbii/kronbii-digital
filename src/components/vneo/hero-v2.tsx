'use client'

import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

import { decode, driver } from '@/components/v6/armed'
import { B, focusIn } from '@/components/v7/tempo'
import { vneo } from '@/content/vneo/site'

import './hero-v2.css'

/*
 * Hero v2, "Under the cedars": the name as the current hero sets it, and
 * beside it, where the drone stood, Rami himself under Lebanon's cedars.
 * RAMI and KRONBI arrive out of blur and fringe as they do now, the photo
 * comes into focus through the page lens, and then the ID-lock brackets,
 * which start at the photo's corners, close in on him: the identity is the
 * person. Pointing at (or focusing) the photo shows the two patches on his
 * backpack; on a touch screen they are always there, small.
 */

const PHOTO = {
  src: '/images/vneo/rami-cedars-2.webp',
  /** 600 × 800, for phones */
  small: '/images/vneo/rami-cedars-2-sm.webp',
  alt: 'Rami Kronbi seen from behind under the cedars in Lebanon, a tan backpack with a Lebanese flag patch and a drone pilot patch.',
}
const PHONE = '(max-width: 640px)'

/**
 * The patches, in percent of the photo (1050 × 1400): the dot sits on the
 * patch's outer edge, the leader drops to an elbow and runs out to the label.
 * Flag patch: x 661–699, y 908–932; DRONE PILOT patch: x 749–787, y 915–937.
 */
const SPOTS = [
  {
    key: 'flag',
    label: 'Lebanon',
    side: 'left',
    dot: [63, 65.7],
    elbow: [56.5, 71.5],
    end: [38, 71.5],
  },
  {
    key: 'pilot',
    label: 'Drone pilot',
    side: 'right',
    dot: [75, 66.1],
    elbow: [81, 71.5],
    end: [96, 71.5],
  },
] as const

const pc = (n: number) => `${n}%`

/** The photograph through the page lens: lens.tsx's LensImage, with a phone-sized file and the hero's loading priority. */
function CedarsLayer({ className, alt }: { className: string; alt: string }) {
  return (
    <picture>
      <source media={PHONE} srcSet={PHOTO.small} />
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

export function HeroV2() {
  const root = useRef<HTMLElement>(null)
  const c = vneo.hero

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const sub = el.querySelector<HTMLElement>('.vn-h2-sub-shown')!
    const plate = el.querySelector<HTMLElement>('.vn-h2-plate')!
    const lock = el.querySelector<HTMLElement>('.vn-h2-lock')!

    const ctx = gsap.context(() => {
      // the brackets start at the photo's corners: measured once, before anything moves
      const p = plate.getBoundingClientRect()
      const k = lock.getBoundingClientRect()
      const IN = 18
      const start = [
        [p.left + IN - k.left, p.top + IN - k.top],
        [p.right - IN - k.right, p.top + IN - k.top],
        [p.left + IN - k.left, p.bottom - IN - k.bottom],
        [p.right - IN - k.right, p.bottom - IN - k.bottom],
      ]

      const tl = gsap.timeline({ paused: true })
      // RAMI arrives out of focus and colour fringe, and settles
      tl.fromTo(
        '.vn-h2-n1',
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
      tl.fromTo(
        '.vn-h2-glow',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 2 * B, ease: 'power2.out' },
        0
      )
      // KRONBI slides in on the next beat
      tl.fromTo(
        '.vn-h2-n2',
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
        '.vn-h2-n2 > span',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2.4)' },
        1.5 * B
      )
      // the photo finds focus: its green and magenta layers converge as the blur clears
      focusIn(tl, plate, 0.6 * B, { dur: 2 * B, blur: 14, ca: 8, scale: 1.04 })
      // the title decodes out of glyph noise
      let last = ''
      const dec = driver((q) => {
        const shown = decode(c.sub, q, Math.floor(q * 20))
        if (shown !== last) sub.textContent = last = shown
      })
      tl.fromTo(dec, { p: 0 }, { p: 1, duration: 1.2 * B, ease: 'none' }, 2 * B)
      tl.fromTo(
        '.vn-h2-cred',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 * B, ease: 'power2.out' },
        2.6 * B
      )
      tl.fromTo(
        '.vn-h2-chip',
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
      // the ID lock: the brackets appear at the photo's corners, then close in on him
      lock.querySelectorAll('i').forEach((b, i) => {
        const [x, y] = start[i]
        tl.fromTo(
          b,
          { opacity: 0, x, y },
          { opacity: 1, x, y, duration: 0.5 * B, ease: 'power1.out' },
          2 * B
        )
        tl.to(
          b,
          { x: 0, y: 0, duration: 1.2 * B, ease: 'power3.inOut' },
          2.5 * B + i * 0.04
        )
      })
      // it holds: the tag reads out, and the label over the name with it
      tl.fromTo(
        '.vn-h2-tag, .vn-h2-id',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        3.75 * B
      )
      tl.fromTo(
        '.vn-h2-cap',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.8 * B, ease: 'power2.out' },
        4.1 * B
      )
      tl.fromTo(
        '.vn-h2-spots',
        { opacity: 0 },
        { opacity: 1, duration: 0.8 * B, ease: 'power1.out' },
        4.1 * B
      )

      if (reduce) {
        tl.progress(1)
        sub.textContent = c.sub
        el.dataset.rolled = ''
        return
      }
      el.dataset.rolled = ''
      tl.play(0)
    }, el)
    return () => ctx.revert()
  }, [c.sub])

  return (
    <section ref={root} id="top" className="vn-h2" aria-labelledby="vneo-name">
      <div className="vn-h2-glow" aria-hidden="true" />
      <div className="vn-h2-text">
        <p className="vn-h2-id" aria-hidden="true">
          {c.id}
        </p>
        <h1 id="vneo-name" className="vn-h2-name" data-lens="">
          <span className="vn-h2-n1 fx">{c.first}</span>
          <span className="vn-h2-n2 fx">
            {c.last}
            <span>.</span>
          </span>
        </h1>
        <p className="vn-h2-sub">
          <span className="vn-h2-sub-shown" aria-hidden="true">
            {c.sub}
          </span>
          <span className="v7-vh">{c.sub}</span>
        </p>
        <p className="vn-h2-cred">
          <a href={c.cred.href} target="_blank" rel="noopener">
            {c.cred.text}
          </a>
        </p>
        <nav className="vn-h2-chips" aria-label="On this page">
          {c.chips.map((ch) => (
            <a key={ch.href} className="vn-h2-chip" href={ch.href}>
              {ch.label}
            </a>
          ))}
          <span className="vn-h2-where">{c.where}</span>
        </nav>
      </div>

      <figure className="vn-h2-fig">
        {/* focusable, so a keyboard can bring up the patches the way a pointer does */}
        <div
          className="vn-h2-plate"
          tabIndex={0}
          role="group"
          aria-labelledby="vn-h2-cap"
        >
          <div className="vn-h2-stage">
            <span
              className="vn-lens-img vn-h2-photo"
              data-lens-img=""
              // a busy canopy: a lighter split than the lens gives a portrait
              data-lens="0.4"
            >
              <CedarsLayer className="vn-li-base" alt={PHOTO.alt} />
              <CedarsLayer className="vn-li-g" alt="" />
              <CedarsLayer className="vn-li-m" alt="" />
            </span>

            <span className="vn-h2-spots" aria-hidden="true">
              {SPOTS.map((s) => (
                <span key={s.key} className="vn-h2-spot" data-side={s.side}>
                  <svg className="vn-h2-lead" focusable="false">
                    {(['vn-h2-halo', 'vn-h2-line'] as const).map((cls) => (
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
                    className="vn-h2-dot"
                    style={{ left: pc(s.dot[0]), top: pc(s.dot[1]) }}
                  />
                  <span
                    className="vn-h2-label"
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

            <span className="vn-h2-lock" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <span className="vn-h2-tag">ID lock · {c.first}</span>
            </span>
          </div>
        </div>
        <figcaption id="vn-h2-cap" className="vn-h2-cap">
          <span className="vn-h2-fig-no">Fig. 0</span>
          <span>Under the cedars, Lebanon.</span>
        </figcaption>
      </figure>
    </section>
  )
}
