'use client'

import { useEffect, useRef } from 'react'

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
    v.play().catch(() => {
      v.controls = true
    })
  }, [])
  return <video ref={ref} src={src} poster={poster} aria-label={alt} muted loop playsInline preload="metadata" />
}
