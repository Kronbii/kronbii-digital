'use client'

import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

import styles from './flight-log.module.css'

export interface Waypoint {
  when: string
  what: string
  note: string
  href: string
}

/*
 * The path so far as a flight track. A curve threads the waypoints; it is
 * flown as the page scrolls, with a small quadcopter on its leading edge
 * turned along the track, and each waypoint lights as the drone passes it.
 * Everything is readable without the motion: under reduced motion the track
 * is drawn in full.
 */
export function FlightLog({ title, lede, points }: { title: string; lede?: string; points: Waypoint[] }) {
  const list = useRef<HTMLOListElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const base = useRef<SVGPathElement>(null)
  const flown = useRef<SVGPathElement>(null)
  const drone = useRef<SVGGElement>(null)

  useEffect(() => {
    const ol = list.current
    const s = svg.current
    const p0 = base.current
    const p1 = flown.current
    const d = drone.current
    if (!ol || !s || !p0 || !p1 || !d) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let length = 0
    let nodes: { el: HTMLElement; at: number }[] = []
    let raf = 0

    const build = () => {
      const box = ol.getBoundingClientRect()
      s.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`)
      s.setAttribute('width', String(box.width))
      s.setAttribute('height', String(box.height))
      const marks = Array.from(ol.querySelectorAll<HTMLElement>('[data-node]'))
      const pts = marks.map((m, i) => {
        const r = m.getBoundingClientRect()
        // the track weaves either side of the node column, like a real track between waypoints
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, i }
      })
      if (!pts.length) return
      const sway = Math.min(26, box.width * 0.04)
      let path = `M ${pts[0].x} 0 L ${pts[0].x} ${pts[0].y}`
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]
        const dy = b.y - a.y
        const side = i % 2 ? 1 : -1
        path += ` C ${a.x + side * sway} ${a.y + dy * 0.45}, ${b.x + side * sway} ${b.y - dy * 0.45}, ${b.x} ${b.y}`
      }
      const last = pts[pts.length - 1]
      path += ` L ${last.x} ${box.height}`
      p0.setAttribute('d', path)
      p1.setAttribute('d', path)
      length = p1.getTotalLength()
      p1.style.strokeDasharray = `${length}`
      // where along the track each waypoint sits
      nodes = marks.map((el, i) => {
        let lo = 0
        let hi = length
        for (let k = 0; k < 22; k++) {
          const mid = (lo + hi) / 2
          if (p1.getPointAtLength(mid).y < pts[i].y) lo = mid
          else hi = mid
        }
        return { el, at: lo }
      })
      update()
    }

    const update = () => {
      raf = 0
      if (!length) return
      const r = ol.getBoundingClientRect()
      const vh = window.innerHeight
      const k = reduced ? 1 : Math.max(0, Math.min(1, (vh * 0.62 - r.top) / r.height))
      const at = k * length
      p1.style.strokeDashoffset = `${length - at}`
      const here = p1.getPointAtLength(at)
      const ahead = p1.getPointAtLength(Math.min(length, at + 2))
      const back = p1.getPointAtLength(Math.max(0, at - 2))
      const angle = (Math.atan2(ahead.y - back.y, ahead.x - back.x) * 180) / Math.PI - 90
      d.setAttribute('transform', `translate(${here.x} ${here.y}) rotate(${angle.toFixed(1)})`)
      d.style.opacity = reduced || k <= 0 || k >= 1 ? '0' : '1'
      for (const n of nodes) n.el.dataset.visited = at >= n.at - 1 ? 'on' : 'off'
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(ol)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className={styles.section} id="log" aria-labelledby="log-h">
      <div className={styles.wrap}>
        <header className={styles.head}>
          <h2 className={styles.h2} id="log-h">
            {title}
          </h2>
          {lede ? <p className={styles.lede}>{lede}</p> : null}
        </header>

        <div className={styles.track}>
          <svg ref={svg} className={styles.svg} aria-hidden="true">
            <path ref={base} className={styles.base} />
            <path ref={flown} className={styles.flown} />
            <g ref={drone} className={styles.drone}>
              <circle cx="-7" cy="-7" r="4.2" />
              <circle cx="7" cy="-7" r="4.2" />
              <circle cx="-7" cy="7" r="4.2" />
              <circle cx="7" cy="7" r="4.2" />
              <path d="M -7 -7 L 7 7 M 7 -7 L -7 7" />
              <rect x="-3" y="-4" width="6" height="8" rx="2" />
            </g>
          </svg>

          <ol ref={list} className={styles.points}>
            {points.map((p, i) => {
              const external = p.href.startsWith('http')
              return (
                <li key={p.what} className={styles.point}>
                  <span className={styles.node} data-node="" data-visited="off" aria-hidden="true">
                    <span />
                  </span>
                  <a
                    className={styles.card}
                    href={p.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                  >
                    <span className={styles.meta}>
                      <span className={styles.wp}>WP {String(i + 1).padStart(2, '0')}</span>
                      <span className={styles.when}>{p.when}</span>
                    </span>
                    <span className={styles.what}>
                      {p.what}
                      {external ? (
                        <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
                      ) : (
                        <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
                      )}
                    </span>
                    <span className={styles.note}>{p.note}</span>
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
