'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { vneoChrome } from '@/content/vneo/site'

// "S.T.A.Y." from Hans Zimmer's Interstellar score, whole, as a seamless 6:09 loop:
// its quiet ending laid over its quiet opening, evened out a little and set quiet
// (-24 LUFS). Built by soundtrack/calm.py --stay.
const SRC = '/audio/stay-loop.m4a'
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

const touch = () => matchMedia('(hover: none)').matches

/*
 * Music under the site, on unless the visitor mutes it. It starts as
 * the page opens, so it fades in with the intro wherever the browser allows sound
 * on its own; where it holds it until a gesture (an iPhone always, most browsers
 * on a first visit), it fades in on the visitor's first click, tap or key,
 * anywhere. A visitor who muted it on an earlier visit hears nothing. The button
 * mutes and unmutes and remembers; a caption under it says it can be muted when
 * the music starts. It fades out while the tab is hidden and back in when it
 * returns.
 */
export function Sound() {
  const [wanting, setWanting] = useState(false)
  const [running, setRunning] = useState(false)
  const playing = wanting && running
  const [said, setSaid] = useState<string | null>(null)
  const sayTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const player = useRef<Player | null>(null)
  const wanted = useRef(false)
  const chosen = useRef(false) // the visitor has used the button: page gestures no longer start it
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

  const start = useCallback(
    (gesture: boolean) => {
      wanted.current = true
      setWanting(true)
      if (!player.current) {
        // on an iPhone, Web Audio is silenced by the ring/silent switch unless the
        // page says it is playing music (Safari 17+)
        const session = (navigator as { audioSession?: { type: string } }).audioSession
        if (session) session.type = 'playback'
        const ctx = new AudioContext()
        const gain = ctx.createGain()
        gain.gain.value = 0
        gain.connect(ctx.destination)
        const p: Player = { ctx, gain }
        player.current = p
        // the music can be heard: say it can be muted, the first time
        let told = false
        const heard = () => {
          const on = ctx.state === 'running'
          setRunning(on)
          if (on && !told && wanted.current) {
            told = true
            say(touch() ? vneoChrome.sound.started.touch : vneoChrome.sound.started.mouse, SAID)
          }
        }
        ctx.addEventListener('statechange', heard)
        heard()
      }
      const p = player.current
      void p.ctx.resume()
      if (gesture) {
        // older iOS only lets a context sound after something has played inside the gesture
        const hush = p.ctx.createBufferSource()
        hush.buffer = p.ctx.createBuffer(1, 1, p.ctx.sampleRate)
        hush.connect(p.ctx.destination)
        hush.start()
      }
      p.buffer ??= fetch(SRC, { priority: 'low' } as RequestInit)
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
          // scheduled on the context's clock: if it is still held, the fade waits for it
          fadeTo(p, VOLUME, FADE_IN)
        })
        .catch(() => {
          wanted.current = false
          setWanting(false)
        })
      if (p.node) fadeTo(p, VOLUME, FADE_IN)
    },
    [say]
  )

  const stop = useCallback(() => {
    wanted.current = false
    setWanting(false)
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

  // as the page opens: play at once, and listen for the first gesture in case the browser holds it
  useEffect(() => {
    let off = false
    try {
      off = localStorage.getItem(KEY) === 'off'
    } catch {}
    if (off) return
    start(false)
    // every kind of gesture a browser may count, kept until one of them has really
    // let the sound start: a tap that ends a scroll doesn't, on an iPhone
    const events = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'] as const
    const first = (e: Event) => {
      if (button.current?.contains(e.target as Node)) return
      if (chosen.current || player.current?.ctx.state === 'running') {
        events.forEach((t) => window.removeEventListener(t, first, true))
        return
      }
      start(true)
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
    chosen.current = true
    const on = !playing
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off')
    } catch {}
    if (on) start(true)
    else stop()
  }

  return (
    <>
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
    </>
  )
}
