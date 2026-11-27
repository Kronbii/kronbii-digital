'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
} from 'react'

import { B, focusIn } from '@/components/v7/tempo'
import { getProject } from '@/content/authority'
import { vneo } from '@/content/vneo/site'

import './hero-v4.css'

/*
 * Hero v4, "One sentence": the type is the hero, and the sentence is the
 * portfolio. My name at poster size with my face in a pill after the first
 * name; under it, the line I already use for what I build, with a still from
 * the real work set into it after each noun. Pointing at a phrase lights it,
 * gives its picture its colour back and floats a preview above it; on a
 * touch screen a tap simply follows the link. The name focus-pulls in out of
 * the fringe, then the sentence rises word by word at 96 BPM, each picture
 * popping in as its word lands; after that, it only moves when you do.
 */

type Key = 'mine' | 'road' | 'quest' | 'talks'

interface Still {
  href: string
  /** the project's name: on the preview, and read out after the phrase */
  title: string
  src: string
  w: number
  h: number
  /** where the pill looks, and how close */
  pill: { pos: string; zoom?: number; origin?: string }
  /** where the preview looks */
  card: string
  /** the cursor's word for it */
  lock: string
}

const project = (slug: string) => ({
  href: `/projects/${slug}`,
  title: getProject(slug)?.title ?? '',
})

const STILLS: Record<Key, Still> = {
  mine: {
    ...project('landmine-detection-extraction-robot'),
    src: '/images/authority/landmine/navigation-tile-poster.jpg',
    w: 720,
    h: 704,
    pill: { pos: '50% 42%' },
    card: '50% 45%',
    lock: 'Open',
  },
  road: {
    ...project('road-speed-audit'),
    src: '/images/authority/road-speed-audit/a40-tile-poster.jpg',
    w: 960,
    h: 540,
    pill: { pos: '50% 50%', zoom: 1.7, origin: '46% 72%' },
    card: '50% 50%',
    lock: 'Open',
  },
  quest: {
    ...project('bsheel-quest-app'),
    src: '/images/authority/bsheel/bsheel-quest-picker.jpg',
    w: 780,
    h: 1688,
    pill: { pos: '50% 51%' },
    card: '50% 43%',
    lock: 'Open',
  },
  talks: {
    href: '#community',
    title: 'Talks and workshops',
    src: '/images/authority/talks/devfest-title.jpg',
    w: 1100,
    h: 619,
    pill: { pos: '50% 50%', zoom: 2, origin: '86% 22%' },
    card: '50% 50%',
    lock: 'Jump',
  },
}
const KEYS = Object.keys(STILLS) as Key[]

/**
 * "I build machines that move on their own, cameras that understand what they
 * see, and software and courses that people use." On a wide screen it breaks
 * after each clause; narrower, it wraps on its own.
 */
type Part = string | { k: Key; noun: string; rest?: string; brk?: boolean }
const SAY: Part[] = [
  'I build',
  { k: 'mine', noun: 'machines', rest: 'that move on their own,', brk: true },
  {
    k: 'road',
    noun: 'cameras',
    rest: 'that understand what they see,',
    brk: true,
  },
  'and',
  { k: 'quest', noun: 'software' },
  'and',
  { k: 'talks', noun: 'courses' },
  'that people use.',
]

/** One span a word, so the sentence can rise word by word; it reads as plain text. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          {i ? ' ' : null}
          <span className="vn-h4-w">{w}</span>
        </Fragment>
      ))}
    </>
  )
}

/** "Bsheel — a gamified quest app for Lebanon": the name, then its line. */
const titleParts = (title: string) => {
  const [head, ...tail] = title.split(' — ')
  return { head, tail: tail.join(' — ') }
}

/** The sentence's tempo: sixteenth-note triplets, 21 words in under two bars. */
const STEP = B / 6

export function HeroV4() {
  const root = useRef<HTMLElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const [peek, setPeek] = useState<Key | null>(null)
  const shown = useRef<Key | null>(null)
  const hideT = useRef(0)
  const fine = useRef(false)
  const still = useRef(false)
  const c = vneo.hero

  // one entrance: the name focus-pulls in, then the sentence rises word by word
  useEffect(() => {
    const el = root.current
    if (!el) return
    fine.current = matchMedia('(hover: hover) and (pointer: fine)').matches
    still.current = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still.current) {
      el.dataset.rolled = ''
      return
    }
    const words = gsap.utils.toArray<HTMLElement>('.vn-h4-w', el)
    const pills = gsap.utils.toArray<HTMLElement>('.vn-h4-pill', el)

    const ctx = gsap.context(() => {
      // while the words move they are boxes; afterwards they are plain text again
      el.dataset.run = ''
      const settle = () => {
        delete el.dataset.run
        gsap.set([...words, ...pills], { clearProps: 'all' })
      }
      const tl = gsap.timeline({ onComplete: settle })

      tl.fromTo(
        '.vn-h4-glow',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 2 * B, ease: 'power2.out' },
        0
      )
      tl.fromTo(
        '.vn-h4-id',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        0.1
      )
      // the name arrives out of focus and colour fringe, and settles
      tl.fromTo(
        '.vn-h4-first',
        { opacity: 0, scale: 1.3, filter: 'blur(18px)', '--ca': 14 },
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
        '.vn-h4-last',
        { opacity: 0, scale: 1.18, filter: 'blur(16px)', '--ca': 12 },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          '--ca': 0,
          duration: 1.2 * B,
          ease: 'power3.out',
          clearProps: 'filter',
        },
        0.5 * B
      )
      tl.fromTo(
        '.vn-h4-face',
        { opacity: 0, scale: 0.3, '--ca': 12 },
        {
          opacity: 1,
          scale: 1,
          '--ca': 0,
          duration: 0.9 * B,
          ease: 'back.out(1.8)',
        },
        0.75 * B
      )
      tl.fromTo(
        '.vn-h4-stop',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2.4)' },
        1.25 * B
      )

      // the sentence rises word by word, its fringe converging as each lands
      const S = 1.5 * B
      tl.fromTo(
        words,
        { opacity: 0, yPercent: 70, '--ca': 8 },
        {
          opacity: 1,
          yPercent: 0,
          '--ca': 0,
          duration: 1.1 * B,
          ease: 'power3.out',
          stagger: STEP,
        },
        S
      )
      // and each picture pops in, with a short fringe, as its word lands
      pills.forEach((p) => {
        const i = words.indexOf(p.previousElementSibling as HTMLElement)
        tl.fromTo(
          p,
          { opacity: 0, scale: 0.2, '--ca': 10 },
          {
            opacity: 1,
            scale: 1,
            '--ca': 0,
            duration: 0.9 * B,
            ease: 'back.out(1.7)',
          },
          S + Math.max(0, i) * STEP + 0.45 * B
        )
      })

      // the rule draws across, and the facts under it come into focus
      tl.fromTo(
        '.vn-h4-foot',
        { '--draw': 0 },
        { '--draw': 1, duration: 2 * B, ease: 'power3.out' },
        S + 2 * B
      )
      focusIn(
        tl,
        el.querySelectorAll(
          '.vn-h4-sub, .vn-h4-cred, .vn-h4-chip, .vn-h4-where'
        ),
        S + 2.25 * B,
        { dur: 1.1 * B, blur: 6, ca: 0, y: 10, scale: 1, stagger: STEP }
      )
    }, el)
    el.dataset.rolled = ''
    return () => {
      ctx.revert()
      delete el.dataset.run
    }
  }, [])

  useEffect(() => () => window.clearTimeout(hideT.current), [])

  // the preview: placed once, from the pill's box, as a phrase is pointed at
  const show = (k: Key, a: HTMLElement) => {
    window.clearTimeout(hideT.current)
    if (shown.current === k) return
    const el = root.current
    const cd = card.current
    const pill = a.querySelector<HTMLElement>('.vn-h4-pill')
    if (!el || !cd || !pill) return
    const r = pill.getBoundingClientRect()
    const s = el.getBoundingClientRect()
    const w = cd.offsetWidth
    const h = cd.offsetHeight
    const gap = 14
    const x = Math.max(
      12,
      Math.min(s.width - w - 12, r.left + r.width / 2 - s.left - w / 2)
    )
    // above the pill, unless the header would cover it
    const up = r.top - h - gap > 84
    const y = up ? r.top - s.top - h - gap : r.bottom - s.top + gap
    cd.dataset.side = up ? 'up' : 'down'
    if (shown.current && !still.current)
      gsap.to(cd, {
        x,
        y,
        duration: 0.7 * B,
        ease: 'power3.out',
        overwrite: true,
      })
    else gsap.set(cd, { x, y, overwrite: true })
    shown.current = k
    setPeek(k)
  }
  const hide = () => {
    window.clearTimeout(hideT.current)
    hideT.current = window.setTimeout(() => {
      shown.current = null
      setPeek(null)
    }, 90)
  }
  const onMove = (k: Key, e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType === 'touch' || !fine.current) return
    if (shown.current === k) {
      // back on the same phrase before the preview left: it stays
      window.clearTimeout(hideT.current)
      return
    }
    // the page scrolling under a resting pointer is not someone pointing
    if (!e.movementX && !e.movementY) return
    show(k, e.currentTarget)
  }
  const onFocus = (k: Key, e: FocusEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.matches(':focus-visible')) show(k, e.currentTarget)
  }

  const phrase = (k: Key, noun: string, rest?: string) => {
    const s = STILLS[k]
    const props = {
      className: 'vn-h4-ph',
      href: s.href,
      'aria-describedby': `vn-h4-d-${k}`,
      onPointerMove: (e: PointerEvent<HTMLAnchorElement>) => onMove(k, e),
      onPointerLeave: hide,
      onFocus: (e: FocusEvent<HTMLAnchorElement>) => onFocus(k, e),
      onBlur: hide,
    }
    const inner = (
      <>
        <span className="vn-h4-noun" data-lock={s.lock}>
          <span className="vn-h4-w">{noun}</span>
          <span className="vn-h4-pill" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.src}
              width={s.w}
              height={s.h}
              alt=""
              decoding="async"
              draggable={false}
              style={{
                objectPosition: s.pill.pos,
                transform: s.pill.zoom ? `scale(${s.pill.zoom})` : undefined,
                transformOrigin: s.pill.origin,
              }}
            />
          </span>
        </span>
        {rest ? (
          <>
            {' '}
            <Words text={rest} />
          </>
        ) : null}
      </>
    )
    return s.href.startsWith('#') ? (
      <a {...props}>{inner}</a>
    ) : (
      <Link {...props}>{inner}</Link>
    )
  }

  return (
    <section ref={root} id="top" className="vn-h4" aria-labelledby="vneo-name">
      <div className="vn-h4-glow" aria-hidden="true" />
      <div className="vn-h4-in">
        <p className="vn-h4-id" aria-hidden="true">
          {c.id}
        </p>
        <h1 id="vneo-name" className="vn-h4-name" data-lens="">
          <span className="vn-h4-l1">
            <span className="vn-h4-first fx">{c.first}</span>
            <span className="vn-h4-face" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/vneo/portrait-sage.webp"
                width={1200}
                height={1500}
                alt=""
                decoding="async"
                draggable={false}
              />
            </span>
          </span>{' '}
          <span className="vn-h4-last fx">
            {c.last}
            <span className="vn-h4-stop">.</span>
          </span>
        </h1>

        <p className="vn-h4-say">
          {SAY.map((part, i) => (
            <Fragment key={i}>
              {i ? ' ' : null}
              {typeof part === 'string' ? (
                <Words text={part} />
              ) : (
                phrase(part.k, part.noun, part.rest)
              )}
              {typeof part !== 'string' && part.brk ? (
                <br className="vn-h4-br" />
              ) : null}
            </Fragment>
          ))}
        </p>
        {/* where each phrase leads, read after it */}
        {KEYS.map((k) => (
          <span key={k} id={`vn-h4-d-${k}`} hidden>
            {STILLS[k].title}
          </span>
        ))}

        <div className="vn-h4-foot">
          <div className="vn-h4-facts">
            <p className="vn-h4-sub">{c.sub}</p>
            <p className="vn-h4-cred">
              <a href={c.cred.href} target="_blank" rel="noopener">
                {c.cred.text}
              </a>
            </p>
          </div>
          <nav className="vn-h4-chips" aria-label="On this page">
            {c.chips.map((ch) => (
              <a key={ch.href} className="vn-h4-chip" href={ch.href}>
                {ch.label}
              </a>
            ))}
            <span className="vn-h4-where">{c.where}</span>
          </nav>
        </div>
      </div>

      {/* the preview, for the pointer and the keyboard; a tap just follows the link */}
      <div
        ref={card}
        className="vn-h4-card"
        aria-hidden="true"
        data-on={peek ? '' : undefined}
      >
        <div className="vn-h4-card-in">
          {KEYS.map((k) => {
            const s = STILLS[k]
            const t = titleParts(s.title)
            return (
              <div
                key={k}
                className="vn-h4-card-l"
                data-on={peek === k ? '' : undefined}
              >
                <span className="vn-h4-card-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.src}
                    width={s.w}
                    height={s.h}
                    alt=""
                    decoding="async"
                    style={{ objectPosition: s.card }}
                  />
                </span>
                <span className="vn-h4-card-t">
                  {t.head}
                  {t.tail ? <em>{t.tail}</em> : null}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
