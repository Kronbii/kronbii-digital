'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { vneoChrome } from '@/content/vneo/site'

// "S.T.A.Y." from Hans Zimmer's Interstellar score, whole, as a seamless 6:09 loop that
// begins where the organ and bass bring in the theme:
// its quiet ending laid over its quiet opening, evened out a little and set quiet
// (-24 LUFS). Built by soundtrack/calm.py --stay, then
// `ffmpeg -i stay-loop.wav -c:a aac -b:a 96k -ar 48000 -movflags +faststart stay-loop.m4a`.
const SRC = '/audio/stay-loop.m4a'
// The loop's first 45 s, encoded the same way (the same command with `-t 45`), so it decodes
// to the same samples: it arrives in seconds on a slow connection and plays while the whole
// loop is on its way, and the loop takes over from it mid-phrase without a seam.
const OPENING = '/audio/stay-opening.m4a'
const KEY = 'vn-sound'
const VOLUME = 0.8
const FADE_IN = 1.5
const FADE_OUT = 0.8
const HANDOVER = 0.05 // the opening hands over to the loop in this long
const TAIL = 2.5 // an opening that runs out before the loop arrives fades out over its last seconds
const SAID = 5000 // how long the caption stays out when the music starts

type Player = {
  ctx: AudioContext
  gain: GainNode
  /** what is sounding, through a level of its own: the opening at first, then the loop */
  node?: AudioBufferSourceNode
  level?: GainNode
  /** when the opening started on the context's clock, while it is the one sounding */
  openedAt?: number
  opening?: Promise<AudioBuffer | undefined>
  buffer?: Promise<AudioBuffer>
  loop?: AudioBuffer
}

const load = (ctx: AudioContext, url: string) =>
  fetch(url, { priority: 'low' } as RequestInit)
    .then((r) => r.arrayBuffer())
    .then((b) => ctx.decodeAudioData(b))

/** Plays `buffer` from `offset` at `at` on the context's clock, and returns its level. */
function playFrom(p: Player, buffer: AudioBuffer, at: number, offset: number, loop: boolean) {
  const level = p.ctx.createGain()
  level.connect(p.gain)
  const node = p.ctx.createBufferSource()
  node.buffer = buffer
  node.loop = loop
  node.connect(level)
  node.start(at, offset)
  p.node = node
  p.level = level
  return level.gain
}

const touch = () => matchMedia('(hover: none)').matches

/*
 * Music under the site, on unless the visitor mutes it. It starts as
 * the page opens, so it fades in with the intro wherever the browser allows sound
 * on its own; where it holds it until a gesture (an iPhone always, most browsers
 * on a first visit), it fades in on the visitor's first click, tap or key,
 * anywhere. The button mutes and unmutes, and a mute holds for the rest of the
 * visit (the tab's session); a new visit starts with the music on again. A caption
 * under the button says it can be muted when
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
      // the opening first, then the whole loop, so the two never share the connection
      p.opening ??= load(p.ctx, OPENING).catch(() => undefined)
      p.buffer ??= p.opening.then(() => load(p.ctx, SRC))
      void p.opening.then((opening) => {
        if (!opening || !wanted.current || p.node || p.loop) return
        const at = p.ctx.currentTime
        const level = playFrom(p, opening, at, 0, false)
        p.openedAt = at
        // only on a very slow connection does it run out before the loop is in: it fades out
        level.setValueAtTime(1, at + opening.duration - TAIL)
        level.linearRampToValueAtTime(0, at + opening.duration)
        // scheduled on the context's clock: if it is still held, the fade waits for it
        fadeTo(p, VOLUME, FADE_IN)
      })
      p.buffer
        .then((buffer) => {
          p.loop = buffer
          if (!wanted.current) return
          const opened = p.openedAt
          const prev = p.node
          if (opened === undefined || !prev?.buffer) {
            if (prev) return
            playFrom(p, buffer, p.ctx.currentTime, 0, true)
            fadeTo(p, VOLUME, FADE_IN)
            return
          }
          // the loop takes over from the opening where it has got to
          const prevLevel = p.level!.gain
          const end = prev.buffer.duration
          const at = p.ctx.currentTime + HANDOVER
          const pos = at - opened
          p.openedAt = undefined
          const level = playFrom(p, buffer, at, Math.min(pos, end), true)
          level.setValueAtTime(0, at)
          if (pos < end - TAIL) {
            // the same samples: a crossfade too short to hear
            level.linearRampToValueAtTime(1, at + HANDOVER)
            prevLevel.cancelScheduledValues(at)
            prevLevel.setValueAtTime(1, at)
            prevLevel.linearRampToValueAtTime(0, at + HANDOVER)
            prev.stop(at + HANDOVER)
          } else {
            // the opening is fading out or has stopped: the loop comes back in where it got to
            level.linearRampToValueAtTime(1, at + FADE_IN)
          }
        })
        .catch(() => {
          wanted.current = false
          setWanting(false)
          fadeTo(p, 0, FADE_OUT)
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
    p.level = undefined
    p.openedAt = undefined
    setTimeout(() => {
      node?.stop()
      if (!wanted.current) void p.ctx.suspend()
    }, FADE_OUT * 1000 + 50)
  }, [say])

  // as the page opens: play at once, and listen for the first gesture in case the browser holds it
  useEffect(() => {
    let off = false
    try {
      off = sessionStorage.getItem(KEY) === 'off'
      localStorage.removeItem(KEY) // a mute was once kept for good: no longer
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
      sessionStorage.setItem(KEY, on ? 'on' : 'off')
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
