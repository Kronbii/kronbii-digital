'use client'

import { HeatShot } from '@/components/v6/scenes/heat'
import { MapShot } from '@/components/v6/scenes/map'
import { SeeShot } from '@/components/v6/scenes/see'
import { refinedSee } from '@/content/vneo/see-refined'
import { ShipShot } from '@/components/v6/scenes/ship'
import { TraceShot } from '@/components/v6/scenes/trace'
import { TuneShot } from '@/components/v6/scenes/tune'
import { ShotModeContext, type Rect } from '@/components/v6/shot'
import { DeminingScene } from '@/components/vneo/scenes/demining'
import { SceneFor } from '@/components/v7/chapter'
import { SceneHostContext } from '@/components/v7/scene'
import { chapters, type ReelId } from '@/content/vneo/site'
import type { Chapter } from '@/content/v7/home'

/*
 * One piece of motion, whichever it is: a reel shot (v6, played calm: 96 BPM,
 * no shake or flash, a green and magenta ghost) or an explainer scene (v7).
 * The host decides its frame; the motion fills it.
 */

const SHOTS: Record<
  ReelId,
  (p: { label: string; replay?: string }) => React.ReactNode
> = {
  see: (p) => <SeeShot {...p} plate={refinedSee} />,
  map: MapShot,
  heat: HeatShot,
  tune: TuneShot,
  trace: TraceShot,
  ship: ShipShot,
}
const CALM = { calm: true, speed: 0.75 }
const STILL = { ...CALM, autoplay: false }
const SCENE_ON = { ambient: false, autoplay: true }
const SCENE_STILL = { ambient: false, autoplay: false }
/** Where a hover exists, a tile rests on its last frame and plays when pointed at; on touch it plays on sight. */
const hoverable = () =>
  typeof window !== 'undefined' &&
  matchMedia('(hover: hover) and (pointer: fine)').matches

export type MotionRef =
  | { kind: 'shot'; id: ReelId }
  | { kind: 'scene'; id: Chapter['id'] }
  | { kind: 'own'; id: 'demining' }

/** Scenes that belong to one project rather than to a community chapter. */
const OWN = {
  demining: DeminingScene,
}

export function Motion({
  motion,
  label,
  tile = false,
  held = false,
}: {
  motion: MotionRef
  label: string
  /** In a grid of tiles: rest on the last frame where a hover exists, no ambient loops. */
  tile?: boolean
  /** Rest on touch screens too, until the host plays it (playIn). */
  held?: boolean
}) {
  const autoplay = !(held || (tile && hoverable()))
  if (motion.kind === 'shot') {
    const S = SHOTS[motion.id]
    return (
      <ShotModeContext.Provider value={autoplay ? CALM : STILL}>
        <S label={label} />
      </ShotModeContext.Provider>
    )
  }
  if (motion.kind === 'own') {
    const S = OWN[motion.id]
    return (
      <SceneHostContext.Provider value={autoplay ? SCENE_ON : SCENE_STILL}>
        <S label={label} replay="Play again" note="Illustration" />
      </SceneHostContext.Provider>
    )
  }
  const ch = chapters.find((c) => c.id === motion.id)!
  // scenes share the screen here: no ambient loops
  return (
    <SceneHostContext.Provider value={autoplay ? SCENE_ON : SCENE_STILL}>
      <SceneFor chapter={ch} />
    </SceneHostContext.Provider>
  )
}

/** Replays whatever motion is inside `el` (its own replay control, hidden). */
export function replayIn(el: HTMLElement | null) {
  el?.querySelector<HTMLButtonElement>(
    '.v6-replay:not(:disabled), .v7-replay:not(:disabled)'
  )?.click()
}

/** Plays what is inside `el`: its motion from the start, its footage from where it rested. */
export function playIn(el: HTMLElement | null) {
  replayIn(el)
  // footage showing its controls (less motion asked for, or refused) is the visitor's to start
  el?.querySelectorAll('video').forEach((v) => {
    if (!v.controls) v.play().catch(() => {})
  })
}

/** Rests what is inside `el`: footage pauses where it is (motion rests on its last frame by itself). */
export function restIn(el: HTMLElement | null) {
  el?.querySelectorAll('video').forEach((v) => v.pause())
}

/*
 * How a piece sits in a card, in its own stage pixels (vneo.css says how the card uses them): the
 * region that should fill the card, and the one that must stay whole. Measured from each piece's
 * last frame. A picture fills the card and keeps its label and subject; a scene's region is
 * everything it draws, with a margin, so its empty edges give way and the drawing fills the card.
 */
const FIT: Partial<Record<string, { fill?: Rect; focus?: Rect }>> = {
  // pictures: the photo or panel fills the card, never a title cut mid-word beside it
  'shot:heat': { fill: [820, 144, 1000, 795], focus: [845, 165, 440, 520] },
  'shot:map': { fill: [280, 64, 1180, 956], focus: [600, 380, 720, 420] },
  'shot:see': { fill: [720, 60, 1180, 1000] },
  'shot:trace': { fill: [1100, 30, 760, 1020] },
  // scenes: everything they draw, so their empty edges give way
  'scene:signers': { fill: [63, 52, 1071, 1078], focus: [63, 52, 1071, 1078] },
  'scene:families': { fill: [72, 286, 1066, 853], focus: [72, 286, 1066, 853] },
  'scene:clinics': { fill: [42, 22, 980, 1151], focus: [42, 22, 980, 1151] },
  'scene:students': { fill: [42, 42, 1126, 1104], focus: [42, 42, 1126, 1104] },
}

/** The card's style for its piece: where the piece's fill and focus are. */
export function fitStyle(motion: MotionRef): React.CSSProperties | undefined {
  const fit = FIT[`${motion.kind}:${motion.id}`]
  return fit ? fitVars(fit) : undefined
}

/** The custom properties a card reads to fit what it shows (vneo.css); `size` for footage or a picture. */
export function fitVars({ fill, focus, size }: { fill?: Rect; focus?: Rect; size?: [number, number] }) {
  const px = (name: string, keys: string[], v?: number[]) =>
    v ? Object.fromEntries(keys.map((k, i) => [`--${name}-${k}`, `${v[i]}px`])) : {}
  const xywh = ['x', 'y', 'w', 'h']
  return {
    ...px('fill', xywh, fill),
    ...px('focus', xywh, focus),
    ...px('media', ['w', 'h'], size),
  } as React.CSSProperties
}
