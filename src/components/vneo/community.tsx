'use client'

import { gsap } from 'gsap'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

import { FringePath } from '@/components/v7/optic'
import { B, drawIn, focusIn } from '@/components/v7/tempo'
import { community, vneo } from '@/content/vneo/site'

import { Motion, replayIn } from './motion'
import { Slate } from './slate'

/*
 * In the community: the work built for people (each with its explainer
 * motion), and the rooms where it is shared: a talk, workshops, four years
 * of mentoring, each a compact tile with one small piece of motion of its
 * own. Then the writing, as a slim row. One tight bento, not a chapter each.
 */

function useOnSight(build: (el: HTMLElement, tl: gsap.core.Timeline) => void) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      build(el, tl)
      tl.progress(0)
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.intersectionRatio >= 0.5) {
            io.disconnect()
            tl.play(0)
          }
        },
        { threshold: [0, 0.5] }
      )
      io.observe(el)
      const again = () => {
        if (!tl.isActive() && tl.progress() === 1) tl.play(0)
      }
      el.addEventListener('pointerenter', again)
      return () => {
        io.disconnect()
        el.removeEventListener('pointerenter', again)
      }
    }, el)
    return () => ctx.revert()
    // build is static per tile
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

function Talk() {
  const t = community.talk
  const ref = useOnSight((_, tl) => {
    focusIn(tl, '.vn-talk-slide', 0, { ca: 12, blur: 14, scale: 1.04 })
    focusIn(tl, '.vn-talk-title', 0.6 * B, { ca: 8, y: 14 })
    tl.fromTo(
      '.vn-demo',
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2)' },
      2 * B
    )
    tl.fromTo(
      '.vn-demo i',
      { opacity: 1 },
      {
        opacity: 0.25,
        duration: B / 2,
        repeat: 5,
        yoyo: true,
        ease: 'sine.inOut',
      },
      2.4 * B
    )
  })
  return (
    <li ref={ref} className="vn-ctile is-talk">
      <Link
        href={t.href}
        className="vn-tile-link"
        aria-label={`${t.label}, ${t.event}: ${t.title}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="vn-ctile-photo" src={t.image.src} alt={t.image.alt} loading="lazy" />
      <div className="vn-talk-slide" aria-hidden="true">
        <span className="vn-talk-event">
          {t.event} · {t.when}
        </span>
        <span className="vn-talk-title fx">{t.title}</span>
        <span className="vn-demo">
          <i />
          {t.demo}
        </span>
      </div>
      <div className="vn-tile-cap">
        <span className="vn-tile-kind">{t.label}</span>
        <h3>{t.event}</h3>
        <p>{t.note}</p>
      </div>
    </li>
  )
}

function Workshops() {
  const w = community.workshops
  const ref = useOnSight((_, tl) => {
    drawIn(tl, '.vn-git-main', 0, 1.4 * B)
    drawIn(tl, '.vn-git-branch', 0.8 * B, 1.2 * B, 0.3 * B)
    tl.fromTo(
      '.vn-git circle',
      { scale: 0, transformOrigin: '50% 50%' },
      { scale: 1, duration: 0.4 * B, ease: 'back.out(2.4)', stagger: 0.2 * B },
      1.2 * B
    )
  })
  return (
    <li ref={ref} className="vn-ctile is-workshops">
      <Link
        href={w.href}
        className="vn-tile-link"
        aria-label={`${w.label}: ${w.title}`}
      />
      <svg className="vn-git" viewBox="0 0 400 160" aria-hidden="true">
        <FringePath className="vn-git-main" d="M 20 110 L 380 110" width={4} />
        <FringePath
          className="vn-git-branch"
          d="M 80 110 C 110 110 110 50 150 50 L 220 50 C 260 50 260 110 290 110"
          width={3}
        />
        <FringePath
          className="vn-git-branch"
          d="M 170 110 C 195 110 195 140 225 140 L 250 140"
          width={3}
        />
        <circle cx="80" cy="110" r="8" />
        <circle cx="150" cy="50" r="7" />
        <circle cx="220" cy="50" r="7" />
        <circle cx="290" cy="110" r="9" />
        <circle cx="250" cy="140" r="7" />
      </svg>
      <div className="vn-tile-cap">
        <span className="vn-tile-kind">{w.label}</span>
        <h3>{w.title}</h3>
        <ul className="vn-tile-list">
          {w.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      </div>
    </li>
  )
}

function Mentoring() {
  const m = community.mentoring
  const ref = useOnSight((_, tl) => {
    focusIn(tl, '.vn-year', 0, { stagger: 0.5 * B, ca: 10, y: 10 })
    tl.fromTo(
      '.vn-years-line',
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 2 * B,
        ease: 'power2.inOut',
        transformOrigin: '0 50%',
      },
      0
    )
  })
  return (
    <li ref={ref} className="vn-ctile is-mentoring">
      <Link
        href={m.href}
        className="vn-tile-link"
        aria-label={`${m.label}: ${m.title}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="vn-ctile-photo" src={m.image.src} alt={m.image.alt} loading="lazy" />
      <div className="vn-years" aria-hidden="true">
        <span className="vn-years-line" />
        {m.years.map((y) => (
          <span key={y} className="vn-year fx">
            {y}
          </span>
        ))}
      </div>
      <div className="vn-tile-cap">
        <span className="vn-tile-kind">{m.label}</span>
        <h3>{m.title}</h3>
        <p>{m.note}</p>
      </div>
    </li>
  )
}

export function Community() {
  const c = community
  return (
    <section
      id="community"
      className="vn-community"
      aria-labelledby="community-h"
    >
      <Slate
        no={4}
        label={c.label}
        title={c.title}
        hot={c.hot}
        lede={c.lede}
        id="community-h"
      />
      <ul className="vn-cbento">
        {c.built.map((b) => (
          <li
            key={b.id}
            className={`vn-ctile is-built is-${b.size}`}
            onPointerEnter={(ev) => replayIn(ev.currentTarget)}
            onFocusCapture={(ev) => replayIn(ev.currentTarget)}
          >
            <Link
              href={b.link.href}
              className="vn-tile-link"
              aria-label={`${b.name}: ${b.title}`}
            />
            <div className="vn-tile-media" aria-hidden="true">
              <Motion motion={{ kind: 'scene', id: b.id }} label={b.alt} tile />
            </div>
            <div className="vn-tile-cap">
              <span className="vn-tile-kind">{b.label}</span>
              <h3>
                {b.name}: {b.title}
              </h3>
              {b.size === 'big' ? <p>{b.line}</p> : null}
            </div>
          </li>
        ))}
        <Talk />
        <Workshops />
        <Mentoring />
      </ul>

      <div className="vn-writing" aria-labelledby="writing-h">
        <h3 id="writing-h" className="vn-writing-h">
          {vneo.notes.label}
        </h3>
        <ul>
          {vneo.notes.items.map((n) => (
            <li key={n.href}>
              <Link href={n.href}>
                <b>{n.title}</b>
                <span>{n.dek}</span>
              </Link>
            </li>
          ))}
          <li className="vn-writing-all">
            <Link className="v7-go quiet" href={vneo.notes.all.href}>
              {vneo.notes.all.label} →
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
