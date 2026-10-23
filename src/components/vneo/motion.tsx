'use client'

import { HeatShot } from '@/components/v6/scenes/heat'
import { MapShot } from '@/components/v6/scenes/map'
import { SeeShot } from '@/components/v6/scenes/see'
import { refinedSee } from '@/content/vneo/see-refined'
import { ShipShot } from '@/components/v6/scenes/ship'
import { TraceShot } from '@/components/v6/scenes/trace'
import { TuneShot } from '@/components/v6/scenes/tune'
import { ShotModeContext } from '@/components/v6/shot'
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
}: {
  motion: MotionRef
  label: string
  /** In a grid of tiles: rest on the last frame where a hover exists, no ambient loops. */
  tile?: boolean
}) {
  const autoplay = !(tile && hoverable())
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
