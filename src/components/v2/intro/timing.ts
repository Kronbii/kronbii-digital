/** Where the preflight plays, and the session cookie that remembers it was seen. */
export const INTRO_PATH = '/v2'
export const INTRO_COOKIE = 'v2-intro'
/** The E58 (its web build, see home/airframes.ts), fetched from the first paint when the intro will play. */
export const INTRO_MODEL = '/models/eachine-e58-web.glb'
export const INTRO_PRELOAD = [INTRO_MODEL]

let modelBytes: Promise<ArrayBuffer | null> | undefined
/**
 * The E58's bytes, fetched once per page (picking up the home page's preload), so the intro and
 * the hero's specimen share one download. Each caller gets its own copy: the intro hands its copy
 * to a worker.
 */
export function introModelBytes(): Promise<ArrayBuffer | null> {
  modelBytes ??= fetch(INTRO_MODEL)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null)
  return modelBytes.then((b) => b && b.slice(0))
}

/**
 * How fast the flight plays. The marks below are the choreography's own time,
 * in seconds of flight; the clock runs this many times faster than real time,
 * so one number tightens or loosens the whole flight, 3D and overlay together.
 * (The CSS opening and the handoff glide are in real time.)
 */
export const FLIGHT_SPEED = 1.85

/** Phase marks of the preflight, in seconds of flight since the motors spool. Shared by the 3D layer and the overlay. */
export const PREFLIGHT = {
  armedOut: 0.62,
  pull: [0.36, 1.34] as const,
  lift: [0.92, 1.66] as const,
  roll: [1.48, 2.14] as const,
  turn: [2.02, 2.5] as const,
  dive: [2.46, 3.08] as const,
  lock: 2.24,
  iris: [2.88, 3.08] as const,
  name: 3.08,
  /** the name glides onto the page heading while the stage crossfades away behind it */
  handoff: 3.6,
  /** real seconds */
  handoffDur: 0.8,
}

