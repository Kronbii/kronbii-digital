'use client'

import { ShotModeContext } from '@/components/v6/shot'
import { vneo } from '@/content/vneo/site'

import { QuadShot } from './quad'
import { QuadPhoneShot } from './quad-phone'
import { SlateMark } from './slate'
import { usePhone } from './use-phone'

/*
 * The closing shot, before the sign-off: sense, decide, act, played calm, as
 * a 5-inch carbon quad that loses a rotor, catches it, and flies on. The
 * robot pack that closed the page before it now opens the robotics and
 * perception hub; the drone-swarm cut (v6's FlyShot, which takes Vneo's
 * accent) is in the backlog. A phone plays its own portrait cut of the quad
 * (quad-phone.tsx); the desktop frame is the one it always was.
 */

const CALM = { calm: true, speed: 0.75 }

export function Loop() {
  const c = vneo.loop
  const phone = usePhone()
  return (
    <section id="loop" className="vn-loop" aria-labelledby="loop-h">
      <div className="vn-loop-head">
        <SlateMark no={8} label={c.label} />
        {/* the lens may already have written its offsets on the heading when this section hydrates */}
        <h2 id="loop-h" className="v7-vh" suppressHydrationWarning>
          {c.heading}
        </h2>
      </div>
      <div className="vn-loop-frame">
        <ShotModeContext.Provider value={CALM}>
          {phone ? (
            <QuadPhoneShot replay={c.replay} />
          ) : (
            <QuadShot replay={c.replay} />
          )}
        </ShotModeContext.Provider>
      </div>
    </section>
  )
}
