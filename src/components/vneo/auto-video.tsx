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

/** Muted looping footage that plays on its own, unless the visitor asks for less motion. */
export function AutoVideo({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.controls = true
      return
    }
    if (!matchMedia(TOUCH).matches) {
      v.play().catch(() => {
        v.controls = true
      })
      return
    }
    // on a touch screen it plays while on screen and never shows a play button: a phone that refuses
    // footage on its own (iOS in Low Power Mode) starts it with the visitor's first tap anywhere
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          onScreen.add(v)
          v.play().catch(() => {
            refused.add(v)
            startOnTap()
          })
        } else {
          onScreen.delete(v)
          v.pause()
        }
      },
      { rootMargin: '25% 0px' }
    )
    io.observe(v)
    return () => {
      io.disconnect()
      refused.delete(v)
    }
  }, [])
  return <video ref={ref} src={src} poster={poster} aria-label={alt} muted loop playsInline preload="metadata" />
}
