'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AutoVideo } from '@/components/vneo/auto-video'
import { showcase, vneo, VN } from '@/content/vneo/site'

import { Motion, fitStyle, fitVars, playIn, restIn } from './motion'
import { Slate } from './slate'

/*
 * Selected work, with no scroll to sit through: v4's slate, then one tight
 * v3 bento. Every card rests on a still, so the grid reads calmly: a card
 * plays while it is pointed at or focused, and on a touch screen while it
 * crosses the middle of the screen. "Watch" opens a theater: the piece at full
 * size with what it shows, what it is, my part, and the fact to check,
 * stepping to the previous or next piece.
 */

export function Work() {
  const c = vneo.work
  const grid = useRef<HTMLUListElement>(null)
  const theater = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const watchable = showcase
    .map((t, i) => (t.motion ? i : -1))
    .filter((i) => i >= 0)

  // with no pointer to hover with, the card crossing the middle of the screen plays, and only that one
  useEffect(() => {
    const el = grid.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) =>
          (e.isIntersecting ? playIn : restIn)(e.target as HTMLElement)
        ),
      { rootMargin: '-40% -30% -40% -30%' }
    )
    el.querySelectorAll<HTMLElement>(':scope > .vn-tile').forEach((t) =>
      io.observe(t)
    )
    return () => io.disconnect()
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
            onPointerEnter={(ev) => playIn(ev.currentTarget)}
            onPointerLeave={(ev) => restIn(ev.currentTarget)}
            onFocusCapture={(ev) => playIn(ev.currentTarget)}
            onBlurCapture={(ev) => restIn(ev.currentTarget)}
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
                // a piece fills its tile as far as its focus allows (fitStyle), except the upstream
                // graph, which is shown whole; a scene always keeps its drawing whole
                item.motion?.kind === 'shot' && item.motion.id === 'ship' ? 'full' : 'crop'
              }
              data-media={item.image?.size ? 'fit' : undefined}
              style={
                item.motion
                  ? fitStyle(item.motion)
                  : item.image?.size
                    ? fitVars(item.image)
                    : undefined
              }
            >
              {item.motion ? (
                <Motion motion={item.motion} label={item.alt} tile held />
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
                  held
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
