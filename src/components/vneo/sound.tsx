'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { vneoChrome } from '@/content/vneo/site'

// Bach's Prelude in C (BWV 846), Kimiko Ishizaka's Open Well-Tempered Clavier
// recording (CC0), cut into a seamless 2:33 loop and set quiet (-24 LUFS).
const SRC = '/audio/prelude-loop.m4a'
const KEY = 'vn-sound'
const VOLUME = 0.8
const FADE_IN = 4
const FADE_OUT = 0.8
const SAID = 5000 // how long the caption stays out when the music starts

type Player = {
  ctx: AudioContext
  gain: GainNode
  node?: AudioBufferSourceNode
  buffer?: Promise<AudioBuffer>
}

/*
 * A quiet piano loop under the site. Browsers only allow sound after the
 * visitor's first click, tap or key, so it fades in then, unless they turned it
 * off on an earlier visit; the button turns it on and off and remembers. It
 * fades out while the tab is hidden and back in when it returns. The file is
 * only fetched once the music is wanted. When it starts, a caption slides out
 * from the bars to say it can be muted, then folds back; hover or focus brings
 * it out again.
 */
export function Sound() {
  const [playing, setPlaying] = useState(false)
  const [said, setSaid] = useState<string | null>(null)
  const sayTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const player = useRef<Player | null>(null)
  const wanted = useRef(false)
  const button = useRef<HTMLButtonElement>(null)

  const fadeTo = (p: Player, level: number, secs: number) => {
    const now = p.ctx.currentTime
    p.gain.gain.cancelScheduledValues(now)
    p.gain.gain.setValueAtTime(p.gain.gain.value, now)
    p.gain.gain.linearRampToValueAtTime(level, now + secs)
  }

  const say = useCallback((text: string, ms: number) => {
    clearTimeout(sayTimer.current)
    setSaid(text)
    sayTimer.current = setTimeout(() => setSaid(null), ms)
  }, [])

  const start = useCallback(() => {
    wanted.current = true
    // made and resumed inside the visitor's gesture, which is what lets it sound
    if (!player.current) {
      const ctx = new AudioContext()
      const gain = ctx.createGain()
      gain.gain.value = 0
      gain.connect(ctx.destination)
      player.current = { ctx, gain }
    }
    const p = player.current
    void p.ctx.resume()
    setPlaying(true)
    p.buffer ??= fetch(SRC)
      .then((r) => r.arrayBuffer())
      .then((b) => p.ctx.decodeAudioData(b))
    p.buffer
      .then((buffer) => {
        if (!wanted.current || p.node) return
        const node = p.ctx.createBufferSource()
        node.buffer = buffer
        node.loop = true
        node.connect(p.gain)
        node.start()
        p.node = node
        fadeTo(p, VOLUME, FADE_IN)
        const { touch, mouse } = vneoChrome.sound.started
        say(matchMedia('(hover: none)').matches ? touch : mouse, SAID)
      })
      .catch(() => {
        wanted.current = false
        setPlaying(false)
      })
    if (p.node) fadeTo(p, VOLUME, FADE_IN)
  }, [say])

  const stop = useCallback(() => {
    wanted.current = false
    setPlaying(false)
    say(vneoChrome.sound.stopped, SAID / 2)
    const p = player.current
    if (!p) return
    fadeTo(p, 0, FADE_OUT)
    const node = p.node
    p.node = undefined
    setTimeout(() => {
      node?.stop()
      if (!wanted.current) void p.ctx.suspend()
    }, FADE_OUT * 1000 + 50)
  }, [say])

  // the first click, tap or key anywhere but this button starts it, unless it was turned off before
  useEffect(() => {
    let off = false
    try {
      off = localStorage.getItem(KEY) === 'off'
    } catch {}
    if (off) return
    const events = ['pointerup', 'keydown'] as const
    const first = (e: Event) => {
      if (button.current?.contains(e.target as Node)) return
      events.forEach((t) => window.removeEventListener(t, first, true))
      start()
    }
    events.forEach((t) => window.addEventListener(t, first, true))
    return () => events.forEach((t) => window.removeEventListener(t, first, true))
  }, [start])

  // quiet while the tab is hidden
  useEffect(() => {
    const vis = () => {
      const p = player.current
      if (!p || !wanted.current) return
      if (document.hidden) {
        fadeTo(p, 0, FADE_OUT)
        setTimeout(() => document.hidden && void p.ctx.suspend(), FADE_OUT * 1000 + 50)
      } else {
        void p.ctx.resume()
        fadeTo(p, VOLUME, FADE_IN / 2)
      }
    }
    document.addEventListener('visibilitychange', vis)
    return () => {
      document.removeEventListener('visibilitychange', vis)
      clearTimeout(sayTimer.current)
    }
  }, [])

  const toggle = () => {
    const on = !playing
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off')
    } catch {}
    if (on) start()
    else stop()
  }

  return (
    <button
      ref={button}
      type="button"
      className="vn-sound"
      aria-pressed={playing}
      aria-label={playing ? vneoChrome.sound.off : vneoChrome.sound.on}
      data-playing={playing ? '' : undefined}
      onClick={toggle}
    >
      <i />
      <i />
      <i />
      <i />
      <span
        className="vn-sound-cap"
        aria-hidden="true"
        data-said={said ? '' : undefined}
      >
        {said ?? (playing ? vneoChrome.sound.mute : vneoChrome.sound.play)}
      </span>
    </button>
  )
}
