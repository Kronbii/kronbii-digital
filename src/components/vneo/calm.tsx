'use client'

import { ShotModeContext } from '@/components/v6/shot'

const CALM = { calm: true, speed: 0.75 }

/**
 * A shot set into a page that is not the home (a project, a hub, the About
 * page): played the way Vneo plays its shots, calm, at 96 BPM, with its
 * Play again under it.
 */
export function CalmShot({ children }: { children: React.ReactNode }) {
  return (
    <div className="vn-page-shot vn-replays">
      <ShotModeContext.Provider value={CALM}>{children}</ShotModeContext.Provider>
    </div>
  )
}
