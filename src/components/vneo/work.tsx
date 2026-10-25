'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AutoVideo } from '@/components/vneo/auto-video'
import { FEATURED, showcase, vneo, VN } from '@/content/vneo/site'

import { Motion, replayIn } from './motion'
import { Slate } from './slate'

/*
 * Selected work, with no scroll to sit through: v4's slate, then one tight
 * v3 bento. The four featured pieces hold the big tiles and, when the grid
 * comes into view, play one after another like a reel, each lit while it
 * runs; any tile plays again on hover or focus. "Watch" opens a theater: the
 * piece at full size with what it shows, what it is, my part, and the fact to
 * check, stepping to the previous or next piece. On touch screens each tile
 * plays as it comes into view.
 */

const STEP = 3300 // ms per featured piece in the opening run

export function Work() {
  const c = vneo.work
  const grid = useRef<HTMLUListElement>(null)
  const theater = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const watchable = showcase
    .map((t, i) => (t.motion ? i : -1))
    .filter((i) => i >= 0)
  const featured = new Set(watchable.slice(0, FEATURED))

  // the opening run: the featured tiles play in turn, once, while the grid is in view
  useEffect(() => {
    const el = grid.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const tiles = Array.from(el.querySelectorAll<HTMLElement>('[data-feature]'))
    let timer = 0
    let stopped = false
    let k = 0
    const clear = () => tiles.forEach((t) => delete t.dataset.live)
    const stop = () => {
      stopped = true
      clearTimeout(timer)
      clear()
    }
    const next = () => {
      if (stopped) return
      clear()
      if (k >= tiles.length) return
      const t = tiles[k++]
      t.dataset.live = ''
      replayIn(t)
      timer = window.setTimeout(next, STEP)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.3) {
          io.disconnect()
          next()
        }
      },
      { threshold: [0, 0.3] }
    )
    io.observe(el)
    // the reader takes over: any hover ends the run
    el.addEventListener('pointerover', stop, { once: true })
    return () => {
      io.disconnect()
      stop()
      el.removeEventListener('pointerover', stop)
    }
  }, [])

  // the theater
  useEffect(() => {
    const d = theater.current
    if (!d) return
    if (open !== null && !d.open) d.showModal()
    if (open === null && d.open) d.close()
  }, [open])

  const step = useCallback(
    (dir: number) => {
      setOpen((i) => {
        if (i === null) return i
        const at = watchable.indexOf(i)
        return watchable[(at + dir + watchable.length) % watchable.length]
      })
    },
    [watchable]
  )

  const t = open !== null ? showcase[open] : null

  return (
    <section id="work" className="vn-work" aria-labelledby="work-h">
      <Slate
        no={c.no}
        label={c.label}
        title={c.title}
        hot={c.hot}
        lede={
          <>
            <span className="vn-on-hover">{c.lede}</span>
            <span className="vn-on-touch">{c.ledeTouch}</span>
          </>
        }
        id="work-h"
      >
        <Link className="v7-go" href={`${VN}/projects`}>
          {c.all} →
        </Link>
      </Slate>

      <ul
        ref={grid}
        className="vn-bento vn-showcase"
        aria-label="Selected work"
      >
        {showcase.map((item, i) => (
          <li
            key={item.slug}
            className={`vn-tile is-${item.size}`}
            style={{ '--area': item.area } as React.CSSProperties}
            data-feature={featured.has(i) ? '' : undefined}
            onPointerEnter={(ev) => replayIn(ev.currentTarget)}
            onFocusCapture={(ev) => replayIn(ev.currentTarget)}
          >
            {item.external ? (
              <a
                href={item.href}
                className="vn-tile-link"
                target="_blank"
                rel="noopener"
                aria-label={`${item.title}: ${item.line} (opens GitHub)`}
              />
            ) : (
              <Link
                href={item.href}
                className="vn-tile-link"
                aria-label={`${item.title}: ${item.line}`}
              />
            )}
            <div
              className="vn-tile-media"
              aria-hidden="true"
              data-fit={
                // every piece fills its tile, except the upstream graph, which needs its whole width,
                // a square explainer in a tall tile, which would lose its sides, and a project's own scene,
                // whose figure and stack sit at its edges
                (item.motion?.kind === 'shot' && item.motion.id === 'ship') ||
                (item.motion?.kind === 'scene' && item.size === 'tall') ||
                item.motion?.kind === 'own'
                  ? 'full'
                  : 'crop'
              }
            >
              {item.motion ? (
                <Motion motion={item.motion} label={item.alt} tile />
              ) : item.figure ? (
                <div className="vn-figure">
                  <span>
                    <b>{item.figure.from}</b>
                    <small>{item.figure.fromNote}</small>
                  </span>
                  <i>→</i>
                  <span>
                    <b className="fx">{item.figure.to}</b>
                    <small>{item.figure.toNote}</small>
                  </span>
                </div>
              ) : item.image?.src.endsWith('.mp4') ? (
                <AutoVideo
                  src={item.image.src}
                  poster={item.image.poster ?? ''}
                  alt={item.alt}
                />
              ) : item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image.src}
                  alt=""
                  loading="lazy"
                  style={{
                    objectFit: item.image.fit ?? 'cover',
                    objectPosition: item.image.position,
                  }}
                />
              ) : null}
            </div>
            {item.motion ? (
              <button
                type="button"
                className="vn-watch"
                onClick={() => setOpen(i)}
                aria-label={`${c.watch}: ${item.title}`}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M5 3.5v9l7.5-4.5z" />
                </svg>
                {c.watch}
              </button>
            ) : null}
            <div className="vn-tile-cap">
              <span className="vn-tile-kind">{item.kind}</span>
              <h3>{item.title}</h3>
              <p>{item.line}</p>
              <span className="vn-badge">{item.proof}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="vn-work-all">
        <Link className="vn-all-btn" href={`${VN}/projects`}>
          {c.viewAll} <span>({c.total})</span> →
        </Link>
      </p>

      <dialog
        ref={theater}
        className="vn-theater"
        aria-labelledby="theater-h"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(null)
        }}
      >
        {t && t.motion ? (
          <div className="vn-theater-in">
            <div className="vn-theater-screen">
              <div className="vn-pane" data-on="">
                <Motion key={t.slug} motion={t.motion} label={t.alt} />
              </div>
            </div>
            <div className="vn-theater-slate">
              <span className="vn-tile-kind">{t.kind}</span>
              <h3 id="theater-h">{t.title}</h3>
              <p className="vn-theater-shows">{t.shows}</p>
              <p>{t.line}</p>
              <dl className="vn-entry-facts">
                <div>
                  <dt>Proof</dt>
                  <dd>{t.proof}</dd>
                </div>
                <div>
                  <dt>My part</dt>
                  <dd>{t.part}</dd>
                </div>
              </dl>
              <div className="vn-theater-bar">
                <Link className="v7-go" href={t.href}>
                  {c.open} →
                </Link>
                <span className="vn-theater-nav">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label={c.prev}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label={c.next}
                  >
                    →
                  </button>
                </span>
              </div>
            </div>
            <button
              type="button"
              className="vn-theater-close"
              onClick={() => setOpen(null)}
              aria-label={c.close}
            >
              ×
            </button>
          </div>
        ) : null}
      </dialog>
    </section>
  )
}
