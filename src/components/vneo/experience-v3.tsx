'use client'

import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { B, focusIn } from '@/components/v7/tempo'
import type { BoardLink, BoardRole } from '@/content/vneo/experience-board'
import { experience as c } from '@/content/vneo/experience'

import { Slate } from './slate'
import './experience-v3.css'

if (typeof window !== 'undefined') gsap.registerPlugin(SplitText)

/*
 * Experience as a type-led index, the way a magazine sets its contents page:
 * no boxes, only type, whitespace and hairlines. The places I work now are
 * set huge, one name a line, each with a caption beside it, and they come
 * into focus once, letter by letter, on first sight. Everything before is a
 * quiet index under them, on the same two columns: pointing at a line floats
 * a preview by the pointer, and opening it sets the whole entry inline.
 * Community work is one line at the end; its home is the Community section.
 */

const isNow = (r: BoardRole) => r.to === 'now'
const end = (r: BoardRole, now: number) => (r.to === 'now' ? now : r.to)

/** A lead role's dates: the year it started, or just "Now" while that is not settled. */
const since = (r: BoardRole) =>
  isNow(r)
    ? r.from !== undefined
      ? `${c.strip.since} ${Math.floor(r.from)}`
      : c.now
    : r.when

const thumbOf = (r: BoardRole): BoardLink | undefined =>
  r.projects.find((p) => p.image)

export function ExperienceV3({
  roles,
  now,
}: {
  roles: BoardRole[]
  now: number
}) {
  const root = useRef<HTMLElement>(null)
  const index = useRef<HTMLOListElement>(null)
  const peekEl = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [peek, setPeek] = useState<string | null>(null)
  // the floating preview's images load once a mouse first comes near the index
  const [armed, setArmed] = useState(false)

  const shown = roles.filter((r) => r.kept)
  const lead = shown.filter((r) => r.lead && !r.side)
  const rest = shown
    .filter((r) => !r.lead && !r.side)
    .sort(
      (a, b) => end(b, now) - end(a, now) || (b.from ?? now) - (a.from ?? now)
    )
  const side = shown
    .filter((r) => r.side)
    .sort((a, b) => (b.from ?? now) - (a.from ?? now))

  // first sight: the names come into focus letter by letter, their captions after
  useEffect(() => {
    const el = root.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const splits: SplitText[] = []
    const ios: IntersectionObserver[] = []
    const once = (target: Element | null, go: () => void) => {
      if (!target) return
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            io.disconnect()
            go()
          }
        },
        { rootMargin: '0px 0px -18% 0px' }
      )
      io.observe(target)
      ios.push(io)
    }

    const ctx = gsap.context(() => {
      const leads = gsap.utils.toArray<HTMLElement>('.vn-xv3-lead', el)
      // until first sight: no names, no captions, no hairlines
      gsap.set('.vn-xv3-leads-h', { opacity: 0, '--draw': 0 })
      gsap.set(leads, { '--draw': 0 })
      gsap.set(
        el.querySelectorAll('.vn-xv3-name, .vn-xv3-cap > *, .vn-xv3-long'),
        {
          opacity: 0,
        }
      )
      const pull = () => {
        const tl = gsap.timeline()
        tl.to('.vn-xv3-leads-h', {
          opacity: 1,
          '--draw': 1,
          duration: 2 * B,
          ease: 'power3.out',
        })
        leads.forEach((li, i) => {
          const name = li.querySelector<HTMLElement>('.vn-xv3-name')!
          // the word keeps its width while it is in letters, so nothing beside it moves
          const r = document.createRange()
          r.selectNodeContents(name)
          name.style.width = `${r.getBoundingClientRect().width}px`
          const split = SplitText.create(name, {
            type: 'chars',
            charsClass: 'fx',
          })
          // inline, so the word keeps its kerning while the letters pull focus
          split.chars.forEach(
            (ch) => ((ch as HTMLElement).style.display = 'inline')
          )
          splits.push(split)
          gsap.set(name, { opacity: 1 })
          const at = 0.25 * B + i * 0.8 * B
          tl.fromTo(
            li,
            { '--draw': 0, '--rca': 5 },
            { '--draw': 1, '--rca': 0, duration: 2 * B, ease: 'power3.out' },
            at
          )
          // a focus pull (tempo's focusIn), with the fringe outlasting the blur:
          // the letters sharpen first, then their colours converge
          tl.fromTo(
            split.chars,
            { opacity: 0, filter: 'blur(16px)' },
            {
              opacity: 1,
              filter: 'blur(0px)',
              duration: 1.5 * B,
              ease: 'power2.out',
              stagger: 0.07 * B,
              clearProps: 'filter',
            },
            at
          )
          tl.fromTo(
            split.chars,
            { '--ca': 18 },
            {
              '--ca': 0,
              duration: 2.6 * B,
              ease: 'power3.out',
              stagger: 0.07 * B,
            },
            at
          )
          focusIn(
            tl,
            li.querySelectorAll('.vn-xv3-cap > *, .vn-xv3-long'),
            at + 0.7 * B,
            {
              dur: 1.3 * B,
              blur: 8,
              ca: 0,
              y: 10,
              scale: 1,
              stagger: 0.1 * B,
            }
          )
        })
        // the letters go back to one word once they are sharp
        tl.call(() => {
          splits.splice(0).forEach((s) => s.revert())
          // and hand the type back to the stylesheet (the rack focus below)
          gsap.set(
            el.querySelectorAll('.vn-xv3-name, .vn-xv3-cap > *, .vn-xv3-long'),
            {
              clearProps: 'opacity,transform,width',
            }
          )
        })
      }
      once(el.querySelector('.vn-xv3-leads'), () => ctx.add(pull))

      const itl = gsap.timeline({ paused: true })
      itl.fromTo(
        '.vn-xv3-index-h',
        { opacity: 0, '--draw': 0 },
        { opacity: 1, '--draw': 1, duration: 2 * B, ease: 'power3.out' },
        0
      )
      itl.fromTo(
        '.vn-xv3-row',
        { opacity: 0, y: 16, '--draw': 0 },
        {
          opacity: 1,
          y: 0,
          '--draw': 1,
          duration: 1.4 * B,
          ease: 'power2.out',
          stagger: 0.14 * B,
          clearProps: 'opacity,transform',
        },
        0.2 * B
      )
      itl.fromTo(
        '.vn-xv3-also',
        { opacity: 0 },
        { opacity: 1, duration: 1.4 * B, ease: 'power1.out' },
        0.9 * B
      )
      itl.progress(0)
      once(el.querySelector('.vn-xv3-index'), () => itl.play(0))
    }, el)

    return () => {
      ios.forEach((io) => io.disconnect())
      splits.forEach((s) => s.revert())
      ctx.revert()
    }
  }, [])

  // the preview follows the pointer, a beat behind, and fringes when it is thrown
  useEffect(() => {
    const list = index.current
    const pk = peekEl.current
    if (
      !list ||
      !pk ||
      !matchMedia('(hover: hover) and (pointer: fine)').matches
    )
      return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = reduced ? 0.001 : 0.9 * B
    gsap.set(pk, { yPercent: -50 })
    const xTo = gsap.quickTo(pk, 'x', { duration: dur, ease: 'power3.out' })
    const yTo = gsap.quickTo(pk, 'y', { duration: dur, ease: 'power3.out' })
    const vTo = gsap.quickTo(pk, '--xv3-v', {
      duration: 0.6 * B,
      ease: 'power2.out',
    })
    let fresh = true
    let last = { x: 0, y: 0, t: 0 }
    let calm = 0

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const w = pk.offsetWidth
      const gap = 32
      let x = e.clientX + gap
      if (x + w > innerWidth - 16) x = e.clientX - gap - w
      const y = Math.max(
        pk.offsetHeight / 2 + 12,
        Math.min(innerHeight - pk.offsetHeight / 2 - 12, e.clientY)
      )
      if (fresh) {
        xTo(x, x)
        yTo(y, y)
        fresh = false
      } else {
        xTo(x)
        yTo(y)
      }
      if (!reduced && last.t) {
        const dt = Math.max(8, e.timeStamp - last.t)
        const v = Math.hypot(e.clientX - last.x, e.clientY - last.y) / dt
        vTo(Math.min(7, v * 4))
        window.clearTimeout(calm)
        calm = window.setTimeout(() => vTo(0), 90)
      }
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp }
    }
    const leave = () => {
      fresh = true
      last = { x: 0, y: 0, t: 0 }
      vTo(0)
    }
    list.addEventListener('pointermove', move)
    list.addEventListener('pointerleave', leave)
    return () => {
      window.clearTimeout(calm)
      list.removeEventListener('pointermove', move)
      list.removeEventListener('pointerleave', leave)
    }
  }, [])

  // no preview over an open line: its thumbnail is already there
  const peeking = peek && !open[peek] ? peek : null

  return (
    <section
      ref={root}
      id="experience"
      className="vn-xv3"
      aria-labelledby="exp-h"
    >
      <Slate no={c.no} label={c.label} title={c.title} hot={c.hot} id="exp-h">
        <p className="vn-xv3-lede">{c.lede}</p>
      </Slate>

      <div className="vn-xv3-body">
        <h3 className="vn-xv3-h vn-xv3-leads-h">
          <i aria-hidden="true" />
          {c.bays.lead}
        </h3>
        <ol className="vn-xv3-leads">
          {lead.map((r) => (
            <li key={r.id} className="vn-xv3-lead">
              <div className="vn-xv3-namecol">
                <h4 className="vn-xv3-name" data-lens="">
                  {r.org}
                </h4>
                {r.orgLong ? <p className="vn-xv3-long">{r.orgLong}</p> : null}
              </div>
              <div className="vn-xv3-cap">
                <p className="vn-xv3-when">
                  {isNow(r) ? (
                    <i className="vn-xv3-live" aria-hidden="true" />
                  ) : null}
                  <b>{since(r)}</b>
                  {r.where ? <span>{r.where}</span> : null}
                </p>
                <p className="vn-xv3-role">{r.role}</p>
                <p className="vn-xv3-note">{r.note}</p>
                {r.more ? <p className="vn-xv3-more-text">{r.more}</p> : null}
                {r.with?.length || r.href ? (
                  <p className="vn-xv3-capfoot">
                    {r.with?.length ? (
                      <span>
                        {c.strip.with} {r.with.join(', ')}
                      </span>
                    ) : null}
                    {r.href ? (
                      <a href={r.href} target="_blank" rel="noopener">
                        {c.strip.site} {r.org}
                        <Arrow out />
                      </a>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <h3 className="vn-xv3-h vn-xv3-index-h">{c.bays.rest}</h3>
        <ol
          ref={index}
          className="vn-xv3-index"
          onPointerEnter={(e) => e.pointerType === 'mouse' && setArmed(true)}
          onPointerLeave={() => setPeek(null)}
        >
          {rest.map((r) => (
            <Row
              key={r.id}
              r={r}
              open={!!open[r.id]}
              onToggle={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
              onPeek={setPeek}
            />
          ))}
        </ol>

        {side.length ? (
          <p className="vn-xv3-also">
            <em>{c.also.label}:</em>{' '}
            {side.map((r, i) => (
              <span key={r.id}>
                {i ? (i === side.length - 1 ? ' and ' : ', ') : null}
                <a href="#community">{r.org}</a>
              </span>
            ))}
            .
          </p>
        ) : null}
      </div>

      {/* the floating preview: for the pointer only, the open line says it all */}
      <div
        ref={peekEl}
        className="vn-xv3-peek"
        aria-hidden="true"
        data-on={peeking ? '' : undefined}
      >
        <div className="vn-xv3-peek-in">
          {rest.map((r) => {
            const t = thumbOf(r)
            return (
              <div
                key={r.id}
                className="vn-xv3-peek-l"
                data-kind={t ? 'img' : 'note'}
                data-on={peeking === r.id ? '' : undefined}
              >
                {t?.image ? (
                  <>
                    {armed ? (
                      <Thumb
                        className="vn-xv3-peek-img"
                        image={t.image}
                        sizes="288px"
                        fit
                      />
                    ) : null}
                    {/* the project's name, when the line has not said it already */}
                    {t.title.toLowerCase() !== r.org.toLowerCase() ? (
                      <span className="vn-xv3-peek-t">{t.title}</span>
                    ) : null}
                  </>
                ) : (
                  <span className="vn-xv3-peek-note">{r.note}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Row({
  r,
  open,
  onToggle,
  onPeek,
}: {
  r: BoardRole
  open: boolean
  onToggle: () => void
  onPeek: (id: string | null) => void
}) {
  const detail = `xv3-${r.id}-more`
  // "2025 – now": the "now" in sage
  const [from, to] = isNow(r)
    ? [r.when.replace(/now$/i, ''), c.now.toLowerCase()]
    : [r.when, '']
  return (
    <li
      className="vn-xv3-row"
      data-open={open ? '' : undefined}
      style={{ '--draw': 1 } as CSSProperties}
    >
      <h4 className="vn-xv3-rowh">
        <button
          type="button"
          className="vn-xv3-hit"
          aria-expanded={open}
          aria-controls={detail}
          data-lock={open ? c.strip.close : c.strip.open}
          onClick={onToggle}
          onPointerEnter={(e) => e.pointerType === 'mouse' && onPeek(r.id)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && onPeek(null)}
        >
          <span className="vn-xv3-org">{r.org}</span>
          <span className="vn-xv3-rmain">
            <span className="vn-xv3-rrole">{r.role}</span>
            <span className="vn-xv3-rkind">{r.kindName}</span>
            <span className="vn-xv3-rwhen">
              {from}
              {to ? <b>{to}</b> : null}
            </span>
            <span className="vn-xv3-mark" aria-hidden="true" />
          </span>
        </button>
      </h4>

      <div className="vn-xv3-more" id={detail}>
        <div className="vn-xv3-more-in">
          {r.projects.length ? (
            <ul className="vn-xv3-work" aria-label={c.strip.projects}>
              {r.projects.map((p) => (
                <li key={p.href}>
                  <Link href={p.href}>
                    {p.image ? (
                      <Thumb
                        className="vn-xv3-thumb"
                        image={p.image}
                        sizes="(max-width: 820px) 90vw, 352px"
                      />
                    ) : null}
                    <span className="vn-xv3-work-t">
                      {p.title}
                      <Arrow />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="vn-xv3-text">
            <p className="vn-xv3-note">{r.note}</p>
            {r.more ? <p className="vn-xv3-more-text">{r.more}</p> : null}
            {r.where || r.with?.length ? (
              <dl className="vn-xv3-fields">
                {r.where ? (
                  <div>
                    <dt>Where</dt>
                    <dd>{r.where}</dd>
                  </div>
                ) : null}
                {r.with?.length ? (
                  <div>
                    <dt>{c.strip.with}</dt>
                    <dd>{r.with.join(', ')}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            {r.writing.length || r.href ? (
              <ul className="vn-xv3-links">
                {r.writing.map((w) => (
                  <li key={w.href}>
                    <small>{c.strip.writing}</small>
                    <Link href={w.href}>
                      {w.title}
                      <Arrow />
                    </Link>
                  </li>
                ))}
                {r.href ? (
                  <li>
                    <a href={r.href} target="_blank" rel="noopener">
                      {c.strip.site} {r.org}
                      <Arrow out />
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  )
}

/**
 * A project's picture. Shots come in every shape, from phone screens to wide
 * frames: a phone screen shows its top, and the floating preview (`fit`) takes
 * the picture's own shape, within reason.
 */
function Thumb({
  image,
  sizes,
  className,
  fit,
}: {
  image: NonNullable<BoardLink['image']>
  sizes: string
  className: string
  fit?: boolean
}) {
  const [ar, setAr] = useState<number | null>(null)
  const tall = ar !== null && ar < 1
  return (
    <span
      className={className}
      style={
        fit && ar
          ? { aspectRatio: String(Math.min(1.8, Math.max(0.8, ar))) }
          : undefined
      }
    >
      <Image
        src={image.src}
        alt=""
        fill
        sizes={sizes}
        style={{
          objectPosition: image.position ?? (tall ? '50% 0%' : undefined),
        }}
        onLoad={(e) =>
          setAr(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)
        }
      />
    </span>
  )
}

function Arrow({ out }: { out?: boolean }) {
  return (
    <svg
      className="vn-xv3-arrow"
      viewBox="0 0 12 12"
      aria-hidden="true"
      data-out={out ? '' : undefined}
    >
      <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
    </svg>
  )
}
