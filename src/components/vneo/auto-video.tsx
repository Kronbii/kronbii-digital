'use client'

import { useEffect, useRef } from 'react'

/** A touch screen: no pointer to hover with, and phones that may refuse footage that plays on its own. */
const TOUCH = '(hover: none), (pointer: coarse)'

/** The footage a touch screen refused to start, waiting for the visitor's first tap anywhere. */
const refused = new Set<HTMLVideoElement>()
const onScreen = new WeakSet<HTMLVideoElement>()
let listening = false
function startOnTap() {
  if (listening) return
  listening = true
  const go = () => {
    document.removeEventListener('touchend', go, true)
    document.removeEventListener('click', go, true)
    listening = false
    // played inside the tap, each one may play on its own from now on; the ones off screen rest again
    refused.forEach((v) => {
      void v
        .play()
        .then(() => {
          refused.delete(v)
          if (!onScreen.has(v)) v.pause()
        })
        .catch(() => {})
    })
  }
  document.addEventListener('touchend', go, { capture: true, passive: true })
  document.addEventListener('click', go, { capture: true, passive: true })
}

/** The row it sits in when that row scrolls sideways (a phone's swipe rows), else itself. */
function row(el: HTMLElement) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const x = getComputedStyle(p).overflowX
    if (x === 'auto' || x === 'scroll') return p
  }
  return el
}

/**
 * Muted looping footage that plays on its own, unless the visitor asks for less motion. It loads
 * nothing, not even its poster, until it is near the screen, plays while it is, and rests off it, so
 * footage further down never takes the connection from what the visitor is looking at. Footage at
 * the top of a page (`eager`) has its poster in the page from the start, and starts loading with it.
 */
export function AutoVideo({
  src,
  poster,
  alt,
  eager = false,
}: {
  src: string
  poster: string
  alt: string
  eager?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const show = () => {
      if (!v.poster) v.poster = poster
    }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show()
      v.controls = true
      return
    }
    // the poster comes with its row, so a tile further along a swipe row is ready when it is swiped to
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        show()
        near.disconnect()
      },
      { rootMargin: '50% 0px' }
    )
    near.observe(row(v))
    // on a touch screen it never shows a play button: a phone that refuses footage on its own
    // (iOS in Low Power Mode) starts it with the visitor's first tap anywhere
    const touch = matchMedia(TOUCH).matches
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          onScreen.add(v)
          show()
          v.play().catch(() => {
            if (!touch) v.controls = true
            else {
              refused.add(v)
              startOnTap()
            }
          })
        } else {
          onScreen.delete(v)
          v.pause()
        }
      },
      { rootMargin: '50% 0px' }
    )
    io.observe(v)
    return () => {
      near.disconnect()
      io.disconnect()
      refused.delete(v)
    }
  }, [poster])
  return (
    <video
      ref={ref}
      src={src}
      poster={eager ? poster : undefined}
      aria-label={alt}
      muted
      loop
      playsInline
      preload={eager ? 'metadata' : 'none'}
    />
  )
}
