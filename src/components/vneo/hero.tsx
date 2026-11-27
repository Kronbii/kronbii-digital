'use client'

import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

import { Specimen } from '@/components/v2/home/specimen'
import { decode, driver } from '@/components/v6/armed'
import { B } from '@/components/v7/tempo'
import { vneo } from '@/content/vneo/site'

/*
 * The first screen: v6's name slam, at Vneo's calmer tempo, beside v2's
 * drone. RAMI drops in out of a colour fringe, KRONBI slides in on the next
 * beat, the ID-lock brackets close on the name, and the title decodes out of
 * glyph noise, and the links rise in; beside it, the E58 you can tilt, which levels itself.
 */

const LOCK = 2 * B

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const c = vneo.hero

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const sub = el.querySelector<HTMLElement>('.vn-hero-sub')!

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      // RAMI arrives out of focus and colour fringe, and settles
      tl.fromTo(
        '.vn-n1',
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
        '.vn-hero-glow',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 2 * B, ease: 'power2.out' },
        0
      )
      // KRONBI slides in on the next beat
      tl.fromTo(
        '.vn-n2',
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
        '.vn-n2 > span',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.6 * B, ease: 'back.out(2.4)' },
        B + 0.5 * B
      )
      // the ID lock closes on the name
      el.querySelectorAll('.vn-lock i').forEach((b, i) => {
        tl.fromTo(
          b,
          { opacity: 0, x: [-70, 70, -70, 70][i], y: [-50, -50, 50, 50][i] },
          { opacity: 1, x: 0, y: 0, duration: 0.8 * B, ease: 'power3.out' },
          LOCK + i * 0.04
        )
      })
      tl.fromTo(
        '.vn-hero-id',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        LOCK + 0.1
      )
      // the title decodes out of glyph noise
      let last = ''
      const dec = driver((p) => {
        const shown = decode(c.sub, p, Math.floor(p * 20))
        if (shown !== last) sub.textContent = last = shown
      })
      tl.fromTo(dec, { p: 0 }, { p: 1, duration: 1.2 * B, ease: 'none' }, LOCK)
      tl.fromTo(
        '.vn-chip',
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
      tl.fromTo(
        '.vn-hero-cred',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 * B, ease: 'power2.out' },
        3 * B - B / 3
      )
      tl.fromTo(
        '.vn-hero-drone',
        { opacity: 0, y: 24, filter: 'blur(12px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.6 * B,
          ease: 'power2.out',
          clearProps: 'filter',
        },
        1.5 * B
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
    <section
      ref={root}
      id="top"
      className="vn-hero"
      aria-labelledby="vneo-name"
    >
      <div className="vn-hero-glow" aria-hidden="true" />
      <div className="vn-hero-text">
        <p className="vn-hero-id" aria-hidden="true">
          {c.id}
        </p>
        <div className="vn-name-box">
          {/* exactly two lines: the preflight's name lands on them one to one */}
          <h1 id="vneo-name" className="vn-name" data-lens="">
            <span className="vn-n1 fx">{c.first}</span>
            <span className="vn-n2 fx">
              {c.last}
              <span>.</span>
            </span>
          </h1>
          <span className="vn-lock" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
        <p className="vn-hero-sub" aria-label={c.sub}>
          {c.sub}
        </p>
        {/* the one fact the at-a-glance row held that nothing else on the page says */}
        <p className="vn-hero-cred">
          <a href={c.cred.href} target="_blank" rel="noopener">
            {c.cred.text}
          </a>
        </p>
        <nav className="vn-chips" aria-label="On this page">
          {c.chips.map((ch) => (
            <a key={ch.href} className="vn-chip" href={ch.href}>
              {ch.label}
            </a>
          ))}
          <span className="vn-where">{c.where}</span>
        </nav>
      </div>
      <div className="vn-hero-drone vn-v2">
        <Specimen />
      </div>
    </section>
  )
}
