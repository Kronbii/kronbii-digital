'use client'

import { useEffect, useState } from 'react'

/** The phone layer's width, as vneo.css's 640px queries draw it. */
export const PHONE = '(max-width: 640px)'

/**
 * Whether the page is on a phone-sized screen. It is false on the server and
 * on the first render, so a desktop hydrates exactly as served and never
 * changes; a phone switches to its own version right after.
 */
export function usePhone() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    const mq = matchMedia(PHONE)
    const set = () => setOn(mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])
  return on
}
