'use client'

import { gsap } from 'gsap'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

/*
 * A scene: one square 1200 x 1200 composition, scaled to its column in CSS
 * (so it is the right size before any script runs). Its timeline plays once
 * at 96 BPM when most of it is in view, then holds; an optional ambient loop
 * keeps it breathing gently after that. No timecodes, no shake, no flash:
 * just the picture coming into focus. Reduced motion lands on the last frame.
 * The scene is illustration; the page's words carry the facts.
 */

/**
 * A host that shows many scenes at once (a grid of tiles) can turn the
 * ambient loops off, and have scenes rest on their last frame until asked.
 */
export const SceneHostContext = createContext({ ambient: true, autoplay: true })

export interface SceneProps {
  name: string
  label: string
  build: (root: HTMLElement, tl: gsap.core.Timeline) => void
  /** A gentle loop that starts once the scene holds. */
  ambient?: (root: HTMLElement) => gsap.core.Timeline | gsap.core.Tween | void
  children: ReactNode
  replay: string
  /** Marks a scene drawn as an illustration rather than from the work's own media. */
  note?: string
  className?: string
}

export function Scene({
  name,
  label,
  build,
  ambient,
  children,
  replay,
  note,
  className,
}: SceneProps) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const loop = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null)
  const played = useRef(false)
  const [state, setState] = useState<'idle' | 'playing' | 'held'>('idle')
  const hostMode = useContext(SceneHostContext)
  const ambientOn = hostMode.ambient
  const still = !hostMode.autoplay

  useEffect(() => {
    const root = stage.current
    if (!root) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ paused: true })
      build(root, t)
      t.eventCallback('onComplete', () => {
        setState('held')
        if (ambient && ambientOn && !reduce)
          loop.current = ambient(root) || null
      })
      tl.current = t
      t.progress(0)
      if (reduce || still) {
        played.current = true
        t.progress(1)
        setState('held')
      } else if (host.current) host.current.dataset.armed = ''
    }, root)
    return () => {
      loop.current?.kill()
      ctx.revert()
      tl.current = null
    }
  }, [build, ambient, ambientOn, still])

  const play = useCallback(() => {
    const t = tl.current
    if (!t) return
    loop.current?.kill()
    loop.current = null
    played.current = true
    setState('playing')
    t.restart()
  }, [])

  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.45 && !played.current) play()
        // the ambient loop rests while the scene is off screen
        const l = loop.current
        if (l) {
          if (e.isIntersecting) l.resume()
          else l.pause()
        }
      },
      { threshold: [0, 0.45, 1] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [play])

  return (
    <div
      ref={host}
      className={`v7-scene ${className ?? ''}`}
      data-scene={name}
      data-state={state}
    >
      <div className="v7-frame" role="img" aria-label={label}>
        <div ref={stage} className="v7-stage" aria-hidden="true">
          {children}
        </div>
        {note ? <span className="v7-note">{note}</span> : null}
      </div>
      <button
        type="button"
        className="v7-replay"
        onClick={play}
        disabled={state !== 'held'}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v3h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {replay}
      </button>
    </div>
  )
}
