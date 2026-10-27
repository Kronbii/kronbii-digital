'use client'

import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { Shot, ShotModeContext, type ShotClock } from '@/components/v6/shot'

import { HOLD, PHONE_CROP, QuadGL } from './gl/quad'
import { build, IMPACTS, LABEL, QuadLayers } from './quad'

/*
 * The closing shot on a phone: the same quad, beats and words as quad.tsx,
 * composed for a portrait frame (4:5) instead of the desktop scene shrunk:
 * the status and the gyro strip at the top, the quad in the middle, the
 * words at the bottom (quad.css). It rolls only once its 3D has drawn and
 * the frame is well on screen, so no beat plays over an empty frame or half
 * out of view; until then the frame holds the quad's first pose.
 */

/** Without WebGL it rolls anyway after this long on screen, so the words still play. */
const NO_GL = 4000

export function QuadPhoneShot({ replay }: { replay: string }) {
  const { speed } = useContext(ShotModeContext)
  const wrap = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [seen, setSeen] = useState(false)
  const [late, setLate] = useState(false)
  const onReady = useCallback(() => setReady(true), [])

  // well on screen: most of the frame inside the top three quarters of the screen
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        setSeen(true)
      },
      { rootMargin: '0px 0px -25% 0px', threshold: 0.6 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!seen || ready) return
    const t = setTimeout(() => setLate(true), NO_GL)
    return () => clearTimeout(t)
  }, [seen, ready])

  const gl = useCallback(
    (clock: ShotClock) => (
      <QuadGL clock={clock} speed={speed} phone onReady={onReady} />
    ),
    [speed, onReady]
  )
  return (
    <div ref={wrap}>
      <Shot
        scene="vn-quad vn-quad-phone"
        label={LABEL}
        impacts={IMPACTS}
        build={build}
        hold={HOLD}
        replay={replay}
        crop={PHONE_CROP}
        armed={seen && (ready || late)}
        gl={gl}
      >
        <QuadLayers />
      </Shot>
    </div>
  )
}
