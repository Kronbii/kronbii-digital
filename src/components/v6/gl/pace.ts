'use client'

/*
 * How often a 3D layer draws. At rest, at most 60 frames a second: a 120 Hz
 * screen would double the GPU's work for no visible gain. While the page
 * scrolls, at most 30: the GPU is busy moving the whole page then, and a
 * scene's own motion reads the same at half the rate while everything around
 * it slides.
 */

const REST = 12
const SCROLLING = 30
let scrolledAt = -1e9

if (typeof window !== 'undefined')
  window.addEventListener(
    'scroll',
    () => {
      scrolledAt = performance.now()
    },
    { passive: true, capture: true }
  )

/** The shortest gap, in ms, to leave after the last drawn frame at `now` (a rAF timestamp). */
export function drawGap(now: number) {
  return now - scrolledAt < 160 ? SCROLLING : REST
}

/** Whether the page is scrolling at `now`. */
export const scrolling = (now: number) => drawGap(now) === SCROLLING
