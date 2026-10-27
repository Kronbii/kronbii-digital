'use client'

import { ShotModeContext } from '@/components/v6/shot'
import { vneo } from '@/content/vneo/site'

import { QuadShot } from './quad'
import { SlateMark } from './slate'

/*
 * The closing shot, before the sign-off: sense, decide, act, played calm, as
 * a 5-inch carbon quad that loses a rotor, catches it, and flies on. The
 * robot pack that closed the page before it now opens the robotics and
 * perception hub; the drone-swarm cut (v6's FlyShot, which takes Vneo's
 * accent) is in the backlog.
 */

const CALM = { calm: true, speed: 0.75 }

export function Loop() {
  const c = vneo.loop
  return (
    <section id="loop" className="vn-loop" aria-labelledby="loop-h">
      <div className="vn-loop-head">
        <SlateMark no={8} label={c.label} />
        <h2 id="loop-h" className="v7-vh">
          {c.heading}
        </h2>
      </div>
      <div className="vn-loop-frame">
        <ShotModeContext.Provider value={CALM}>
          <QuadShot replay={c.replay} />
        </ShotModeContext.Provider>
      </div>
    </section>
  )
}
