'use client'

import { useEffect, useRef } from 'react'

/*
 * The lock-on cursor (from v3), in Sage. At rest: four corner brackets
 * around a dot that sits exactly on the pointer, so aiming never lags. Over
 * anything you can act on, the brackets spring out to frame it and a small
 * tag names the action. The dot is a point of light: moved fast it disperses
 * into green and magenta along the motion, and gathers when it stops. Fine
 * pointers only; touch keeps the platform's behaviour, reduced motion snaps.
 */

const TARGETS =
  'a[href], button, [role="button"], [role="tab"], summary, [data-lock]'
const REST = 22
const PAD = 7

function labelFor(el: HTMLElement): string {
  if (el.dataset.lock) return el.dataset.lock
  if (el instanceof HTMLAnchorElement) {
    const href = el.getAttribute('href') ?? ''
    if (href.startsWith('mailto:')) return 'Email'
    if (
      href.startsWith('#') ||
      (href.includes('#') && el.pathname === location.pathname)
    )
      return 'Jump'
    if (el.origin !== location.origin) return 'External'
    return 'Open'
  }
  if (el.getAttribute('role') === 'tab') return 'Show'
  if (el.getAttribute('aria-pressed') !== null) return 'Toggle'
  return 'Press'
}

export function Cursor() {
  const box = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-vneo]')
    const b = box.current,
      d = dot.current,
      t = tag.current
    if (!root || !b || !d || !t) return
    if (!matchMedia('(pointer: fine)').matches) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const px = { x: -100, y: -100 }
    const vel = { x: 0, y: 0 }
    const cur = { x: -100, y: -100, w: REST, h: REST }
    let lastEvent = 0
    let target: HTMLElement | null = null
    let visible = false
    let pressed = false
    let raf = 0
    let last = 0
    const shown = { vx: '', vy: '', w: '', h: '' }
    // the target's box: measured as the cursor locks on and a few times in the
    // moment after (its hover styles may still be moving it), then followed by
    // the scroll alone, since measuring it every frame would force a fresh
    // layout each time
    let aim: DOMRect | null = null
    let aimAt = 0
    let aimNext = 0
    let aimY = 0
    let pageY = scrollY

    const goal = (now: number) => {
      if (target && target.isConnected) {
        if (!aim || (now - aimAt < 600 && now >= aimNext)) {
          aim = target.getBoundingClientRect()
          aimY = pageY
          aimNext = now + 150
        }
        const dy = aimY - pageY
        const r = {
          left: aim.left,
          right: aim.right,
          top: aim.top + dy,
          bottom: aim.bottom + dy,
        }
        const x0 = Math.max(4, r.left - PAD),
          y0 = Math.max(4, r.top - PAD)
        const x1 = Math.min(innerWidth - 4, r.right + PAD),
          y1 = Math.min(innerHeight - 4, r.bottom + PAD)
        const inset = pressed ? 3 : 0
        return {
          x: x0 + inset,
          y: y0 + inset,
          w: Math.max(REST, x1 - x0 - inset * 2),
          h: Math.max(REST, y1 - y0 - inset * 2),
        }
      }
      const s = pressed ? REST - 6 : REST
      return { x: px.x - s / 2, y: px.y - s / 2, w: s, h: s }
    }
    const frame = (now: number) => {
      raf = 0
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60
      last = now
      const g = goal(now)
      const k = reduced ? 1 : 1 - Math.exp(-dt * (target ? 20 : 34))
      cur.x += (g.x - cur.x) * k
      cur.y += (g.y - cur.y) * k
      cur.w += (g.w - cur.w) * k
      cur.h += (g.h - cur.h) * k
      const decay = Math.exp(-dt * 10)
      vel.x *= decay
      vel.y *= decay
      const sx = reduced ? 0 : Math.max(-9, Math.min(9, vel.x * 0.006))
      const sy = reduced ? 0 : Math.max(-9, Math.min(9, vel.y * 0.006))
      // write only what changed: a new size means a layout, and a value written
      // again every frame keeps the style dirty for everything that reads it
      const vx = sx.toFixed(1)
      const vy = sy.toFixed(1)
      if (vx !== shown.vx) d.style.setProperty('--vx', (shown.vx = vx))
      if (vy !== shown.vy) d.style.setProperty('--vy', (shown.vy = vy))
      b.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`
      const bw = `${cur.w.toFixed(1)}px`
      const bh = `${cur.h.toFixed(1)}px`
      if (bw !== shown.w) b.style.width = shown.w = bw
      if (bh !== shown.h) b.style.height = shown.h = bh
      d.style.transform = `translate3d(${px.x}px, ${px.y}px, 0)`
      const moving =
        Math.abs(g.x - cur.x) +
          Math.abs(g.y - cur.y) +
          Math.abs(g.w - cur.w) +
          Math.abs(g.h - cur.h) >
          0.2 || Math.abs(sx) + Math.abs(sy) > 0.05
      if (visible && (moving || target)) raf = requestAnimationFrame(frame)
      else last = 0
    }
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const setTarget = (el: HTMLElement | null) => {
      if (el === target) return
      target = el
      aim = null
      aimAt = performance.now()
      t.textContent = el ? labelFor(el) : ''
      b.dataset.lock = el ? 'on' : 'off'
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        root.dataset.cursor = 'off'
        b.dataset.show = d.dataset.show = 'off'
        visible = false
        return
      }
      if (lastEvent && visible) {
        const dts = Math.max(0.004, (e.timeStamp - lastEvent) / 1000)
        vel.x += ((e.clientX - px.x) / dts - vel.x) * 0.35
        vel.y += ((e.clientY - px.y) / dts - vel.y) * 0.35
      }
      lastEvent = e.timeStamp
      px.x = e.clientX
      px.y = e.clientY
      if (!visible) {
        visible = true
        root.dataset.cursor = 'on'
        b.dataset.show = d.dataset.show = 'on'
        cur.x = px.x - REST / 2
        cur.y = px.y - REST / 2
      }
      const hit =
        (e.target as Element | null)?.closest?.<HTMLElement>(TARGETS) ?? null
      setTarget(hit && !hit.closest('[data-lock="none"]') ? hit : null)
      wake()
    }
    const onDown = () => {
      pressed = true
      wake()
    }
    const onUp = () => {
      pressed = false
      wake()
    }
    const onLeave = (e: PointerEvent) => {
      if (e.relatedTarget) return
      visible = false
      b.dataset.show = d.dataset.show = 'off'
    }
    const onScroll = () => {
      pageY = scrollY
      if (!visible) return
      const el = document.elementFromPoint(px.x, px.y)
      setTarget(el?.closest<HTMLElement>(TARGETS) ?? null)
      // measured here, at the start of a frame, while the layout is still clean
      // (and right for a target that doesn't scroll, like the header's links)
      if (target) {
        aim = target.getBoundingClientRect()
        aimY = pageY
      }
      wake()
    }
    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('pointerdown', onDown, { passive: true })
    addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointerout', onLeave)
    addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => {
      aim = null
    }
    addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerdown', onDown)
      removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerout', onLeave)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      root.dataset.cursor = 'off'
    }
  }, [])

  return (
    <div className="vn-cursor" aria-hidden="true">
      <div ref={box} className="vn-cbox" data-show="off" data-lock="off">
        <i data-c="tl" />
        <i data-c="tr" />
        <i data-c="bl" />
        <i data-c="br" />
        <span ref={tag} className="vn-ctag" />
      </div>
      <div ref={dot} className="vn-cdot" data-show="off" />
    </div>
  )
}
