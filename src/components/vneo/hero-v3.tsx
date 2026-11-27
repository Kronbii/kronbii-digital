'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import { useEffect, useId, useRef, type ReactNode } from 'react'

import { B, focusIn } from '@/components/v7/tempo'
import { vneo } from '@/content/vneo/site'

import './hero-v3.css'

/*
 * Hero v3, "Contact sheet". The name stays the big type; beside it, a
 * photographer's contact sheet of the life and the work, so the breadth
 * reads at a glance and the drone is one frame among nine. The frames rest
 * in the site's Sage duotone. The loupe (pointing at or focusing a frame)
 * lifts it, brings its colour back and writes its note in the sheet's
 * margin; on touch and narrow screens every note sits under its frame. The
 * cedars are the pick, circled in grease pencil.
 *
 * The entrance, at 96 BPM: the name lands as it always has, the sheet is
 * laid down as blank paper, the frames develop one by one half a beat apart,
 * and the pick is circled. Then nothing moves unless the visitor asks.
 */

interface Frame {
  src: string
  w: number
  h: number
  /** object-position: keeps the subject inside the 4:3 window */
  pos: string
  alt: string
  verb: string
  line: string
  href?: string
  /** the frame circled in grease pencil */
  pick?: true
}

const FRAMES: Frame[] = [
  {
    src: '/images/authority/landmine/navigation-tile-poster.jpg',
    w: 720,
    h: 704,
    pos: '50% 42%',
    alt: 'RViz on a laptop screen: the rover’s 2D map of the arena and its planned path.',
    verb: 'built',
    line: 'a demining rover’s autonomy',
    href: '/projects/landmine-detection-extraction-robot',
  },
  {
    src: '/images/authority/fpv-drone/build.jpg',
    w: 1200,
    h: 1600,
    pos: '50% 54%',
    alt: 'The drone mid-build on an ESD mat: the 5-inch carbon-fiber frame with its four motors, beside the electronics, a battery and the radio transmitter.',
    verb: 'flew',
    line: 'a 5-inch FPV drone I built and tuned',
    href: '/projects/five-inch-carbon-fiber-fpv-drone',
  },
  {
    src: '/images/vneo/rami-cedars-1-sm.webp',
    w: 600,
    h: 800,
    pos: '50% 96%',
    alt: 'Rami Kronbi seen from behind, with a backpack, standing under tall cedar trees.',
    verb: 'walked',
    line: 'under the cedars, in Lebanon',
    pick: true,
  },
  {
    src: '/images/authority/injaz/dosely-team.jpg',
    w: 1396,
    h: 1047,
    pos: '50% 50%',
    alt: 'The Dosely team on stage at the INJAZ Lebanon final, wearing medals, in front of a screen showing their logo.',
    verb: 'mentored',
    line: 'two school teams at INJAZ',
    href: '#community',
  },
  {
    src: '/images/authority/talks/devfest-title.jpg',
    w: 1100,
    h: 619,
    pos: '15% 50%',
    alt: 'Title slide of the DevFest Tripoli 2025 talk, “Can we make Jarvis real?”, with a photo of Rami Kronbi holding a trophy.',
    verb: 'spoke',
    line: 'at GDG DevFest Tripoli 2025',
    href: '#community',
  },
  {
    src: '/images/authority/space-apps/hackathon-hall.jpg',
    w: 1600,
    h: 1200,
    pos: '50% 50%',
    alt: 'Rami Kronbi taking a selfie in front of a hall full of teams working at laptops during NASA Space Apps Beirut.',
    verb: 'organized',
    line: 'NASA Space Apps Beirut, four years',
    href: '#community',
  },
  {
    src: '/images/authority/road-speed-audit/a40-tile-poster.jpg',
    w: 960,
    h: 540,
    pos: '0% 50%',
    alt: 'A highway seen from above, each car boxed with the speed measured for it.',
    verb: 'measured',
    line: 'road speed from one camera',
    href: '/projects/road-speed-audit',
  },
  {
    src: '/images/authority/awards/with-trophy.jpg',
    w: 1280,
    h: 854,
    pos: '46% 50%',
    alt: 'Rami Kronbi holding a large trophy in the RHU mechanical engineering lab, in front of a table of competition robots.',
    verb: 'won',
    line: 'competitions, with my teams',
    href: '/about',
  },
  {
    src: '/images/vneo/portrait-sage.webp',
    w: 1200,
    h: 1500,
    pos: '50% 20%',
    alt: 'Rami Kronbi in profile, in black and white.',
    verb: 'me',
    line: 'Rami',
    href: '#build',
  },
]

/*
 * The grease-pencil loop, in a box 10% wider than the frame on each side and
 * reaching from above it to past the edge number below: one stroke from the
 * top right, round anticlockwise, overshooting where it began.
 */
const LOOP =
  'M98 5.5C74 2 38 2.4 20 4.2C6 4.8 2 11 2.8 26C2.6 46 2.4 68 3.6 84C4.6 95.5 11 98.4 26 98.4C52 98.6 84 98.6 104 96.6C114 95.4 117.6 90 117.8 76C118 56 118.2 34 117 18C116.6 6.4 111 3.4 96 3.6C88 3.3 80 4.6 73 7.2'

function Loop() {
  return (
    <svg
      className="vn-h3-loop"
      viewBox="0 0 120 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="vn-h3-loop-m" d={LOOP} pathLength={1} />
      <path className="vn-h3-loop-g" d={LOOP} pathLength={1} />
      <path className="vn-h3-loop-c" d={LOOP} pathLength={1} />
      <path className="vn-h3-loop-w" d={LOOP} pathLength={1} />
    </svg>
  )
}

/** The name's entrance, then the sheet's: when each part starts, in beats. */
const LOCK = 1.5 * B
const DEV = 1.5 * B
const DEV_DUR = 0.9 * B
const PICK = FRAMES.findIndex((f) => f.pick)

export function HeroV3() {
  const root = useRef<HTMLElement>(null)
  const uid = useId()
  const c = vneo.hero

  useEffect(() => {
    const el = root.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.rolled = ''
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      // RAMI arrives out of focus and colour fringe, and settles
      tl.fromTo(
        '.vn-h3-n1',
        { opacity: 0, scale: 1.3, filter: 'blur(16px)', '--ca': 14 },
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
        '.vn-h3-glow',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 2 * B, ease: 'power2.out' },
        0
      )
      // KRONBI slides in half a beat later, and its full stop lands
      tl.fromTo(
        '.vn-h3-n2',
        { opacity: 0, x: '12vw', filter: 'blur(14px)', '--ca': 12 },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          '--ca': 0,
          duration: 1.1 * B,
          ease: 'power3.out',
          clearProps: 'filter',
        },
        0.5 * B
      )
      tl.fromTo(
        '.vn-h3-dot',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2.4)' },
        B
      )
      // the ID lock closes on the name
      el.querySelectorAll('.vn-h3-lock i').forEach((b, i) => {
        tl.fromTo(
          b,
          { opacity: 0, x: [-48, 48, -48, 48][i], y: [-36, -36, 36, 36][i] },
          { opacity: 1, x: 0, y: 0, duration: 0.8 * B, ease: 'power3.out' },
          LOCK + i * 0.04
        )
      })
      tl.fromTo(
        '.vn-h3-id',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        LOCK + 0.1
      )
      // the title comes into focus; the line and the links rise under it
      focusIn(tl, '.vn-h3-sub', 1.6 * B, { dur: 1.1 * B, y: 10, ca: 6 })
      tl.fromTo(
        '.vn-h3-cred',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 * B, ease: 'power2.out' },
        2.1 * B
      )
      tl.fromTo(
        '.vn-h3-chips > *',
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7 * B,
          ease: 'power2.out',
          stagger: B / 3,
        },
        2.4 * B
      )
      // the sheet is laid down as blank paper...
      tl.fromTo(
        '.vn-h3-board',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1 * B,
          ease: 'power2.out',
          clearProps: 'transform',
        },
        0.8 * B
      )
      // ...and its frames develop, one by one, half a beat apart
      tl.fromTo(
        '.vn-h3-dev',
        { opacity: 1 },
        {
          opacity: 0,
          duration: DEV_DUR,
          ease: 'power1.inOut',
          stagger: B / 2,
        },
        DEV
      )
      // once the pick is up, it is circled, and its note is written
      const circled = DEV + PICK * (B / 2) + DEV_DUR
      tl.fromTo(
        '.vn-h3-loop',
        { '--draw': 1.02, '--ca': 4 },
        { '--draw': 0, '--ca': 0, duration: 1.4 * B, ease: 'sine.inOut' },
        circled
      )
      tl.call(
        () => {
          delete el.dataset.rolling
        },
        undefined,
        circled + 1.4 * B
      )

      el.dataset.rolling = ''
      el.dataset.rolled = ''
      tl.play(0)
    }, el)
    return () => {
      ctx.revert()
      delete el.dataset.rolling
    }
  }, [])

  return (
    <section ref={root} id="top" className="vn-h3" aria-labelledby="vneo-name">
      <div className="vn-h3-glow" aria-hidden="true" />
      <div className="vn-h3-text">
        <p className="vn-h3-id" aria-hidden="true">
          {c.id}
        </p>
        <div className="vn-h3-namebox">
          <h1 id="vneo-name" className="vn-h3-name" data-lens="">
            <span className="vn-h3-n1 fx">{c.first}</span>{' '}
            <span className="vn-h3-n2 fx">
              {c.last}
              <span className="vn-h3-dot">.</span>
            </span>
          </h1>
          <span className="vn-h3-lock" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <p className="vn-h3-sub fx">{c.sub}</p>
        <p className="vn-h3-cred">
          <a href={c.cred.href} target="_blank" rel="noopener">
            {c.cred.text}
          </a>
        </p>
        <nav className="vn-h3-chips" aria-label="On this page">
          {c.chips.map((ch) => (
            <a key={ch.href} className="vn-h3-chip" href={ch.href}>
              {ch.label}
            </a>
          ))}
          <span className="vn-h3-where">{c.where}</span>
        </nav>
      </div>

      <div className="vn-h3-board">
        <ul className="vn-h3-sheet" role="list">
          {FRAMES.map((f, i) => {
            const cap = `${uid}-cap${i}`
            const pic = `${uid}-pic${i}`
            const body: ReactNode = (
              <>
                <span className="vn-h3-film">
                  <span className="vn-h3-pic">
                    <span className="vn-h3-win">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        id={pic}
                        src={f.src}
                        width={f.w}
                        height={f.h}
                        alt={f.alt}
                        decoding="async"
                        loading={i < 3 ? 'eager' : 'lazy'}
                        style={{ objectPosition: f.pos }}
                      />
                      <span className="vn-h3-dev" />
                    </span>
                    {f.pick ? <Loop /> : null}
                  </span>
                  <span className="vn-h3-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}A
                  </span>
                </span>
                <span className="vn-h3-cap" id={cap}>
                  <em className="vn-h3-verb">{f.verb}</em>{' '}
                  <span className="vn-h3-line">{f.line}</span>
                </span>
              </>
            )
            const link = {
              className: 'vn-h3-frame',
              'aria-labelledby': cap,
              'aria-describedby': pic,
            }
            return (
              <li key={f.src} className="vn-h3-cell">
                {!f.href ? (
                  <div className="vn-h3-frame" data-pick="">
                    {body}
                  </div>
                ) : f.href.startsWith('#') ? (
                  // in-page: the cursor names it "Jump", as it does every anchor
                  <a href={f.href} {...link}>
                    {body}
                  </a>
                ) : (
                  <Link
                    href={f.href}
                    prefetch={false}
                    data-lock="Open"
                    {...link}
                  >
                    {body}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
