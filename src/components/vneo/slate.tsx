'use client'

import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText } from 'gsap/SplitText'
import { useEffect, useRef, type ReactNode } from 'react'

import { B } from '@/components/v7/tempo'

if (typeof window !== 'undefined')
  gsap.registerPlugin(ScrambleTextPlugin, SplitText)

/*
 * A section opens like a shot (v4's slate): its scene number scrambles in, a
 * rule draws across, and the title rises word by word out of a mask, its one
 * human word in the serif. Once, on first sight; under reduced motion the
 * slate is simply there.
 */
export function Slate({
  no,
  label,
  title,
  hot,
  id,
  children,
}: {
  no: number
  label: string
  title: string
  hot: string
  id: string
  children?: ReactNode
}) {
  const root = useRef<HTMLElement>(null)
  const sc = `SC ${String(no).padStart(2, '0')}`

  useEffect(() => {
    const el = root.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let split: SplitText | null = null
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      split = SplitText.create(el.querySelector('h2')!, {
        type: 'words',
        mask: 'words',
      })
      tl.fromTo(
        '.vn-rule',
        { scaleX: 0 },
        { scaleX: 1, duration: 2 * B, ease: 'power3.out' },
        0
      )
      tl.fromTo(
        '.vn-sc',
        { opacity: 0 },
        {
          opacity: 1,
          duration: B,
          scrambleText: { text: sc, chars: '0123456789', speed: 0.5 },
        },
        0
      )
      tl.fromTo(
        split.words,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.3 * B,
          ease: 'power3.out',
          stagger: 0.12 * B,
        },
        0.2 * B
      )
      tl.fromTo(
        '.vn-slate-extra',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: B, ease: 'power2.out', stagger: 0.3 * B },
        1.1 * B
      )
      tl.progress(0)
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io.disconnect()
            tl.play(0)
          }
        },
        { rootMargin: '0px 0px -15% 0px' }
      )
      io.observe(el)
      return () => io.disconnect()
    }, el)
    return () => {
      ctx.revert()
      split?.revert()
    }
  }, [sc])

  const [a, b] = title.split(hot)
  return (
    <header ref={root} className="vn-slate">
      <div className="vn-slate-meta" aria-hidden="true">
        <span className="vn-sc">{sc}</span>
        <span className="vn-slate-label">{label}</span>
        <span className="vn-rule" />
      </div>
      <h2 id={id} data-lens="">
        {a}
        <em>{hot}</em>
        {b}
      </h2>
      {children ? <div className="vn-slate-extra">{children}</div> : null}
    </header>
  )
}

/**
 * Just the slate's mark, for a section that brings its own heading: the scene
 * number scrambles in and the rule draws across, once, on first sight.
 */
export function SlateMark({ no, label }: { no: number; label: string }) {
  const root = useRef<HTMLDivElement>(null)
  const sc = `SC ${String(no).padStart(2, '0')}`

  useEffect(() => {
    const el = root.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true })
      tl.fromTo(
        '.vn-rule',
        { scaleX: 0 },
        { scaleX: 1, duration: 2 * B, ease: 'power3.out' },
        0
      )
      tl.fromTo(
        '.vn-sc',
        { opacity: 0 },
        {
          opacity: 1,
          duration: B,
          scrambleText: { text: sc, chars: '0123456789', speed: 0.5 },
        },
        0
      )
      tl.progress(0)
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io.disconnect()
            tl.play(0)
          }
        },
        { rootMargin: '0px 0px -15% 0px' }
      )
      io.observe(el)
      return () => io.disconnect()
    }, el)
    return () => ctx.revert()
  }, [sc])

  return (
    <div ref={root} className="vn-slate-meta" aria-hidden="true">
      <span className="vn-sc">{sc}</span>
      <span className="vn-slate-label">{label}</span>
      <span className="vn-rule" />
    </div>
  )
}
