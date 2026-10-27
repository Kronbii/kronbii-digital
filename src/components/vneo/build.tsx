'use client'

import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'

import { B } from '@/components/v7/tempo'
import { vneo } from '@/content/vneo/site'

import { LensImage } from './lens'
import { SlateMark } from './slate'

/*
 * What I build (v3's), as one sentence a visitor reads in a breath; each
 * phrase lights up while you point at it (on a touch screen, while it
 * passes the middle of the screen). The work itself is the next
 * section down. Beside it, my portrait, seen through the page's lens, with
 * the ID lock closing on it once, on first sight.
 */
export function Build() {
  const c = vneo.build
  const plate = useRef<HTMLDivElement>(null)
  const sentence = useRef<HTMLParagraphElement>(null)

  // a touch screen has nothing to point with: the phrase nearest the middle of the screen lights instead,
  // one after another as the sentence scrolls by
  useEffect(() => {
    const el = sentence.current
    if (!el || !matchMedia('(hover: none)').matches) return
    const phrases = Array.from(el.querySelectorAll<HTMLElement>('.vn-phrase'))
    let raf = 0
    const light = () => {
      raf = 0
      const line = innerHeight / 2
      let near: HTMLElement | null = null
      let best = innerHeight * 0.3
      for (const p of phrases) {
        const r = p.getBoundingClientRect()
        const d = Math.abs((r.top + r.bottom) / 2 - line)
        if (d < best) {
          best = d
          near = p
        }
      }
      phrases.forEach((p) => p.toggleAttribute('data-lit', p === near))
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(light)
    }
    light()
    addEventListener('scroll', queue, { passive: true })
    addEventListener('resize', queue)
    return () => {
      removeEventListener('scroll', queue)
      removeEventListener('resize', queue)
      cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    const el = plate.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      el.querySelectorAll('.vn-plock i').forEach((b, i) => {
        tl.fromTo(
          b,
          { opacity: 0, x: [-40, 40, -40, 40][i], y: [-30, -30, 30, 30][i] },
          { opacity: 1, x: 0, y: 0, duration: 0.8 * B, ease: 'power3.out' },
          0.6 * B + i * 0.04
        )
      })
      tl.fromTo(
        '.vn-ptag',
        { opacity: 0 },
        { opacity: 1, duration: 0.06, ease: 'none', repeat: 4, yoyo: true },
        0.7 * B
      )
      tl.progress(0)
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.intersectionRatio >= 0.4) {
            io.disconnect()
            tl.play(0)
          }
        },
        { threshold: [0, 0.4] }
      )
      io.observe(el)
      return () => io.disconnect()
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section id="build" className="vn-build" aria-labelledby="build-h">
      <SlateMark no={2} label={c.title} />
      <div className="vn-build-top">
        <div className="vn-build-text">
          <h2 id="build-h" className="v7-vh">
            {c.title}
          </h2>
          <p ref={sentence} className="vn-build-sentence" data-lens="0.5">
            {c.lead}{' '}
            {c.groups.map((g) => (
              <span key={g.id}>
                <span className="vn-phrase">{g.phrase}</span>
                {g.joiner}{' '}
              </span>
            ))}
          </p>
        </div>

        <figure className="vn-portrait">
          <div ref={plate} className="vn-portrait-plate">
            <LensImage
              src={c.portrait.src}
              alt={c.portrait.alt}
              position="50% 100%"
              className="vn-portrait-img"
            />
            <span className="vn-plock" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="vn-ptag" aria-hidden="true">
              {c.portrait.tag}
            </span>
          </div>
        </figure>
      </div>
    </section>
  )
}
