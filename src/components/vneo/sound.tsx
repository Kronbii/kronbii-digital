'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { vneoChrome } from '@/content/vneo/site'

// Bach's Prelude in C (BWV 846), Kimiko Ishizaka's Open Well-Tempered Clavier
// recording (CC0), cut into a seamless 2:33 loop and set quiet (-24 LUFS).
const SRC = '/audio/prelude-loop.m4a'
const KEY = 'vn-sound'
const VOLUME = 0.8
const FADE_IN = 4
const FADE_OUT = 0.8
const SAID = 5000 // how long the caption stays out when the music starts
const ASK_AFTER = 1200 // if the browser hasn't let it play by then, invite a tap
const ASK_FOR = 9000

type Player = {
  ctx: AudioContext
  gain: GainNode
  node?: AudioBufferSourceNode
  buffer?: Promise<AudioBuffer>
}

const touch = () => matchMedia('(hover: none)').matches

/*
 * A quiet piano loop under the site. It tries to start as the page opens, so it
 * fades in with the intro wherever the browser allows sound on its own; where
 * it doesn't (an iPhone always, most browsers on a first visit), a line at the
 * foot of the screen, above the intro, invites a tap, and the first click, tap
 * or key fades it in. A visitor who turned it off on an earlier visit hears
 * nothing and sees no invitation. The button turns it on and off and remembers;
 * a caption under it says it can be muted when the music starts. It fades out
 * while the tab is hidden and back in when it returns.
 */
export function Sound() {
  const [wanting, setWanting] = useState(false)
  const [running, setRunning] = useState(false)
  const playing = wanting && running
  const [said, setSaid] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [root, setRoot] = useState<HTMLElement | null>(null)
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
          if (on) setAsking(false)
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

  // as the page opens: try to play at once, and listen for the first gesture in case the browser holds it
  useEffect(() => {
    setRoot(document.querySelector<HTMLElement>('[data-vneo]'))
    let off = false
    try {
      off = localStorage.getItem(KEY) === 'off'
    } catch {}
    if (off) return
    start(false)
    const ask = setTimeout(() => {
      if (!chosen.current && player.current?.ctx.state !== 'running') setAsking(true)
    }, ASK_AFTER)
    const stopAsking = setTimeout(() => setAsking(false), ASK_AFTER + ASK_FOR)
    // every kind of gesture a browser may count, kept until one of them has really
    // let the sound start: a tap that ends a scroll doesn't, on an iPhone
    const events = ['pointerup', 'touchend', 'click', 'keydown'] as const
    const first = (e: Event) => {
      if (button.current?.contains(e.target as Node)) return
      if (chosen.current || player.current?.ctx.state === 'running') {
        events.forEach((t) => window.removeEventListener(t, first, true))
        return
      }
      start(true)
    }
    events.forEach((t) => window.addEventListener(t, first, true))
    return () => {
      clearTimeout(ask)
      clearTimeout(stopAsking)
      events.forEach((t) => window.removeEventListener(t, first, true))
    }
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
    setAsking(false)
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
      {/* outside the top bar, so it shows above the intro too */}
      {root
        ? createPortal(
            <p
              className="vn-sound-ask"
              aria-hidden="true"
              data-asking={asking ? '' : undefined}
            >
              {touch() ? vneoChrome.sound.ask.touch : vneoChrome.sound.ask.mouse}
            </p>,
            root
          )
        : null}
    </>
  )
}
