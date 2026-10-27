'use client'

import { useEffect, useRef } from 'react'
import type * as THREE_NS from 'three'

import { B, E, lerp, noise, prog } from '@/components/v6/armed'
import { environment } from '@/components/v6/gl/airframe'
import {
  reelLights,
  startGL,
  yieldFrame,
  type Three,
} from '@/components/v6/gl/host'
import type { ShotClock } from '@/components/v6/shot'

/*
 * The quad's 3D layer: a 5-inch carbon quad like Rami's build, hovering over
 * a faint Sage grid. Bar one, it feels its own motion (its body axes, the
 * gyro strip). Bar two, time slows and the front-right rotor stops; the fault
 * is flagged 22 ms later and the yaw-relaxed controller takes over at 58 ms,
 * as in the record's simulated run. Bar three, time runs again: it tilts,
 * spins at about 23 rad/s, and holds near its hover point on three rotors.
 * Every pose is a pure function of the shot's time.
 */

const bt = (n: number) => n * B
/** Where the shot holds: four bars. */
export const HOLD = bt(16)

/*
 * Story time: the simulation's own clock. It runs with the shot, slows from
 * beat 3 to almost still by the fault on beat 4, and speeds back up through
 * beat 7 to 8, so 58 ms of the run fill most of a bar.
 */
const R0 = 0.032
const A1 = bt(3)
const A2 = bt(3.8)
const B1 = bt(7)
const B2 = bt(8)
export function story(l: number) {
  if (l <= A1) return l
  let s = A1
  if (l <= A2) {
    const u = l - A1
    return s + u - ((1 - R0) * u * u) / (2 * (A2 - A1))
  }
  s += ((A2 - A1) * (1 + R0)) / 2
  if (l <= B1) return s + R0 * (l - A2)
  s += R0 * (B1 - A2)
  if (l <= B2) {
    const u = l - B1
    return s + R0 * u + ((1 - R0) * u * u) / (2 * (B2 - B1))
  }
  s += ((B2 - B1) * (1 + R0)) / 2
  return s + (l - B2)
}
/** How fast story time runs against the shot's, 0 to 1. */
function pace(l: number) {
  if (l <= A1 || l >= B2) return 1
  if (l <= A2) return lerp(1, R0, (l - A1) / (A2 - A1))
  if (l <= B1) return R0
  return lerp(R0, 1, (l - B1) / (B2 - B1))
}
/** The shot time at which story time reaches s. */
export function shotAt(s: number) {
  let a = 0,
    b = 60
  for (let i = 0; i < 50; i++) {
    const m = (a + b) / 2
    if (story(m) < s) a = m
    else b = m
  }
  return (a + b) / 2
}
export const FAULT = story(bt(4))
/** The record's run: flagged 22 ms after the rotor stops, the yaw-relaxed controller at 58 ms. */
export const ALARM = FAULT + 0.022
const SWITCH = FAULT + 0.058
/** The spin the yaw-relaxed controller accepts, about 23 rad/s, reached over a short ramp. */
const OMEGA = 23
const RAMP = 0.45
/** The rotor that fails: front right. */
const LOST = 0

const smooth01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}
function yawRate(s: number) {
  return OMEGA * smooth01((s - SWITCH) / RAMP)
}
function yaw(s: number) {
  if (s <= SWITCH) return 0
  const u = (s - SWITCH) / RAMP
  if (u < 1) return OMEGA * RAMP * (u * u * u - (u * u * u * u) / 2)
  return OMEGA * (RAMP * 0.5 + (s - SWITCH - RAMP))
}
/** The tip toward the lost rotor (it falls at about 80 rad/s², until caught), then the relaxed hover's lean. */
function lean(s: number) {
  if (s <= FAULT) return 0
  const u = Math.min(s, SWITCH) - FAULT
  const fall = 40 * u * u
  return lerp(fall, 0.2, E.inOut(prog(s, SWITCH, SWITCH + 0.4)))
}
/** How far it slides from its hover point: up to about 39 cm, back within a few seconds. */
function slide(s: number) {
  const x = (s - FAULT) / 0.7
  return x <= 0 ? 0 : 0.39 * x * Math.exp(1 - x)
}

/** The gyro, in rad/s, body axes x y z: the strip in the left column. */
function gyro(s: number, out: number[]) {
  const n = (seed: number) =>
    (noise(s * 9, seed) - 0.5) * 0.6 + (noise(s * 33, seed + 7) - 0.5) * 0.3
  let x = n(1)
  let y = n(2)
  let z = n(3) * 0.6
  if (s > FAULT) {
    const build = 80 * (Math.min(s, SWITCH) - FAULT)
    const caught = s > SWITCH ? Math.exp(-(s - SWITCH) / 0.12) : 1
    const r = build * caught + 1.4 * smooth01((s - SWITCH) / 0.4)
    x += r * 0.707
    y -= r * 0.707
    z += yawRate(s)
  }
  out[0] = x
  out[1] = y
  out[2] = z
}

const SAGE = 0xb7d3a8
const GREEN = 0xa6e68f
const MAGENTA = 0xe08fd0
const PAPER = 0xeef1ec
/** Hover height, and where the quad sits in the frame: right of centre, the words to its left. */
const H = 1.45
const SHIFT = 290
/** Motor positions: a 220 mm diagonal, 1 unit = 10 cm. Front is +x, right is +z. */
const M = 0.778
const MOTORS: [number, number][] = [
  [M, M],
  [M, -M],
  [-M, M],
  [-M, -M],
]
/** Props in: front right and rear left one way, the other two the other way. */
const DIR = [1, -1, -1, 1]
const PROP_R = 0.635
/** The blades' drawn speed: a readable turn, not the real 2000 rad/s. */
const VIS = 38

function radial(THREE: Three, stops: [number, string][]) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  stops.forEach(([o, col]) => grad.addColorStop(o, col))
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** A 2x2 twill: the carbon's weave, kept faint, as a colour and roughness map. */
function weave(THREE: Three) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const cell = 8
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      const warp = (i + j) % 4 < 2
      const grad = warp
        ? g.createLinearGradient(i * cell, 0, i * cell + cell, 0)
        : g.createLinearGradient(0, j * cell, 0, j * cell + cell)
      grad.addColorStop(0, '#060707')
      grad.addColorStop(0.5, warp ? '#1d2023' : '#131517')
      grad.addColorStop(1, '#060707')
      g.fillStyle = grad
      g.fillRect(i * cell, j * cell, cell, cell)
    }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(5, 5)
  t.anisotropy = 4
  return t
}

/** The battery's shrink wrap: graphite, a lighter printed band, a thin sage rule. */
function lipoWrap(THREE: Three) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = '#191c1f'
  g.fillRect(0, 0, 256, 64)
  g.fillStyle = '#323940'
  g.fillRect(0, 18, 256, 26)
  g.fillStyle = '#8fae84'
  g.fillRect(0, 46, 256, 3)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** The bottom plate's outline: four tapered arms with round ends, filleted where they meet. */
function frameShape(THREE: Three) {
  const L = M * Math.SQRT2
  const w0 = 0.34
  const w1 = 0.2
  const half = (t: number) => (w0 + ((w1 - w0) * t) / L) / 2
  const dir = (k: number) => {
    const a = Math.PI / 4 + (k * Math.PI) / 2
    return [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a)] as const
  }
  // a point on arm k's edge at distance t along it: side +1 left, -1 right
  const edge = (k: number, t: number, side: number): [number, number] => {
    const [dx, dy, nx, ny] = dir(k)
    const h = half(t) * side
    return [dx * t + nx * h, dy * t + ny * h]
  }
  // where arm k's left edge meets the bisector to arm k + 1
  const meet = (() => {
    const [dx, dy] = dir(0)
    const [ex, ey] = dir(1)
    const bx = dx + ex
    const by = dy + ey
    let a = 0,
      b = L
    for (let i = 0; i < 40; i++) {
      const m = (a + b) / 2
      const [px, py] = edge(0, m, 1)
      if (bx * py - by * px > 0) a = m
      else b = m
    }
    return (a + b) / 2
  })()
  const f = 0.16
  const s = new THREE.Shape()
  for (let k = 0; k < 4; k++) {
    const [dx, dy] = dir(k)
    const start = edge(k, meet + f, -1)
    if (k === 0) s.moveTo(start[0], start[1])
    const tip = edge(k, L, -1)
    s.lineTo(tip[0], tip[1])
    const a = Math.PI / 4 + (k * Math.PI) / 2
    s.absarc(dx * L, dy * L, w1 / 2, a - Math.PI / 2, a + Math.PI / 2, false)
    const back = edge(k, meet + f, 1)
    s.lineTo(back[0], back[1])
    const corner = edge(k, meet, 1)
    const next = edge((k + 1) % 4, meet + f, -1)
    s.quadraticCurveTo(corner[0], corner[1], next[0], next[1])
  }
  // a lightening slot down each arm
  for (let k = 0; k < 4; k++) {
    const [dx, dy] = dir(k)
    const a = Math.PI / 4 + (k * Math.PI) / 2
    const r = 0.03
    const t0 = 0.42
    const t1 = 0.8
    const hole = new THREE.Path()
    hole.absarc(dx * t0, dy * t0, r, a + Math.PI / 2, a + (3 * Math.PI) / 2, false)
    hole.absarc(dx * t1, dy * t1, r, a - Math.PI / 2, a + Math.PI / 2, false)
    hole.closePath()
    s.holes.push(hole)
  }
  return s
}

function roundRect(THREE: Three, w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

/** One blade of a 5-inch tri-blade, root at the hub, as a thin twisted plate. */
function bladeGeo(THREE: Three) {
  const s = new THREE.Shape()
  const r0 = 0.05
  // leading edge out, trailing edge back
  s.moveTo(r0, -0.03)
  s.bezierCurveTo(0.18, -0.07, 0.42, -0.06, PROP_R - 0.03, -0.022)
  s.quadraticCurveTo(PROP_R + 0.005, 0, PROP_R - 0.03, 0.018)
  s.bezierCurveTo(0.42, 0.045, 0.2, 0.05, r0, 0.028)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.008,
    bevelEnabled: false,
    curveSegments: 8,
  })
  g.translate(0, 0, -0.004)
  // twist: more pitch at the root than the tip
  const p = g.attributes.position as THREE_NS.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const a = lerp(0.42, 0.16, (x - r0) / (PROP_R - r0))
    p.setY(i, y * Math.cos(a) - z * Math.sin(a))
    p.setZ(i, y * Math.sin(a) + z * Math.cos(a))
  }
  // lie flat: the plate's y becomes the disc's radius direction, z becomes up
  g.rotateX(-Math.PI / 2)
  g.computeVertexNormals()
  return g
}

interface Rotor {
  spin: THREE_NS.Group
  bladeMat: THREE_NS.MeshPhysicalMaterial
  disc: THREE_NS.Mesh<THREE_NS.CircleGeometry, THREE_NS.MeshBasicMaterial>
  halo?: THREE_NS.Mesh<THREE_NS.TorusGeometry, THREE_NS.MeshBasicMaterial>
  bell: THREE_NS.MeshPhysicalMaterial
}

function makeQuad(THREE: Three) {
  const group = new THREE.Group()
  const body = new THREE.Group()
  group.add(body)
  const tex = weave(THREE)
  const carbon = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: tex,
    roughness: 0.46,
    metalness: 0.15,
    clearcoat: 0.55,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.22,
  })
  const plateGeo = new THREE.ExtrudeGeometry(frameShape(THREE), {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
    curveSegments: 14,
  })
  plateGeo.rotateX(-Math.PI / 2)
  const plate = new THREE.Mesh(plateGeo, carbon)
  plate.position.y = -0.11
  body.add(plate)

  const topGeo = new THREE.ExtrudeGeometry(roundRect(THREE, 0.66, 0.38, 0.06), {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  })
  topGeo.rotateX(-Math.PI / 2)
  const top = new THREE.Mesh(topGeo, carbon)
  top.position.set(-0.02, 0.15, 0)
  body.add(top)

  // standoffs, anodized sage
  const alu = new THREE.MeshPhysicalMaterial({
    color: 0x8fae84,
    metalness: 0.85,
    roughness: 0.3,
  })
  const postGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.21, 12)
  for (const [x, z] of [
    [0.25, 0.14],
    [0.25, -0.14],
    [-0.27, 0.14],
    [-0.27, -0.14],
  ]) {
    const post = new THREE.Mesh(postGeo, alu)
    post.position.set(x, 0.045, z)
    body.add(post)
  }

  // the stack: ESC under the flight controller, a status LED
  const pcb = new THREE.MeshStandardMaterial({ color: 0x141816, roughness: 0.55 })
  const escGeo = new THREE.BoxGeometry(0.36, 0.025, 0.36)
  const esc = new THREE.Mesh(escGeo, pcb)
  esc.position.set(-0.02, -0.03, 0)
  body.add(esc)
  const fcGeo = new THREE.BoxGeometry(0.33, 0.02, 0.33)
  const fc = new THREE.Mesh(fcGeo, pcb)
  fc.position.set(-0.02, 0.06, 0)
  body.add(fc)
  const ledGeo = new THREE.BoxGeometry(0.03, 0.012, 0.03)
  const ledMat = new THREE.MeshBasicMaterial({ color: GREEN })
  const led = new THREE.Mesh(ledGeo, ledMat)
  led.position.set(0.1, 0.075, 0.1)
  body.add(led)
  const capGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.16, 16)
  const capMat = new THREE.MeshStandardMaterial({ color: 0x0d0f0e, roughness: 0.4 })
  const cap = new THREE.Mesh(capGeo, capMat)
  cap.rotation.z = Math.PI / 2
  cap.position.set(-0.36, -0.05, 0.09)
  body.add(cap)

  // the FPV camera, tilted up, between two side plates
  const cam = new THREE.Group()
  cam.position.set(0.34, 0.04, 0)
  cam.rotation.z = 0.35
  body.add(cam)
  const camBodyGeo = new THREE.BoxGeometry(0.17, 0.17, 0.17)
  const camBody = new THREE.Mesh(
    camBodyGeo,
    new THREE.MeshStandardMaterial({ color: 0x1a1c1d, roughness: 0.5, metalness: 0.3 })
  )
  cam.add(camBody)
  const lensGeo = new THREE.CylinderGeometry(0.062, 0.07, 0.09, 24)
  lensGeo.rotateZ(-Math.PI / 2)
  const lens = new THREE.Mesh(
    lensGeo,
    new THREE.MeshStandardMaterial({ color: 0x111312, roughness: 0.45, metalness: 0.4 })
  )
  lens.position.x = 0.12
  cam.add(lens)
  const glassGeo = new THREE.CircleGeometry(0.046, 24)
  glassGeo.rotateY(Math.PI / 2)
  const glass = new THREE.Mesh(
    glassGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0x0a1410,
      metalness: 0.9,
      roughness: 0.04,
      clearcoat: 1,
      iridescence: 0.6,
    })
  )
  glass.position.x = 0.166
  cam.add(glass)
  const sideGeo = new THREE.BoxGeometry(0.26, 0.24, 0.018)
  for (const z of [0.105, -0.105]) {
    const side = new THREE.Mesh(sideGeo, carbon)
    side.position.set(0.33, 0.03, z)
    body.add(side)
  }

  // the battery on top, its strap, its XT60 lead
  const loadRounded = import('three/examples/jsm/geometries/RoundedBoxGeometry.js')
  const pack = new THREE.Group()
  pack.position.set(-0.04, 0.34, 0)
  body.add(pack)
  const lipo = lipoWrap(THREE)
  const wrap = new THREE.MeshPhysicalMaterial({
    map: lipo,
    roughness: 0.6,
    metalness: 0.2,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    envMapIntensity: 0.3,
  })
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x0c0d0d, roughness: 0.85 })
  const strapGeo = new THREE.BoxGeometry(0.075, 0.33, 0.395)
  const strap = new THREE.Mesh(strapGeo, strapMat)
  strap.position.set(0.04, -0.01, 0)
  pack.add(strap)
  const xtGeo = new THREE.BoxGeometry(0.09, 0.055, 0.1)
  const xt = new THREE.Mesh(
    xtGeo,
    new THREE.MeshStandardMaterial({ color: 0xc9a63a, roughness: 0.5 })
  )
  xt.position.set(-0.43, -0.09, 0)
  pack.add(xt)

  // the VTX antenna, swept back
  const antGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.36, 8)
  const ant = new THREE.Mesh(antGeo, strapMat)
  ant.position.set(-0.47, 0.18, 0)
  ant.rotation.z = 0.75
  body.add(ant)
  const tipGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.07, 12)
  const tip = new THREE.Mesh(tipGeo, strapMat)
  tip.position.set(-0.6, 0.31, 0)
  tip.rotation.z = 0.75
  body.add(tip)

  // the motors, their bells and props
  const statorGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.05, 28)
  const statorMat = new THREE.MeshStandardMaterial({
    color: 0x1c1f22,
    metalness: 0.6,
    roughness: 0.4,
  })
  const bellGeo = new THREE.CylinderGeometry(0.138, 0.138, 0.1, 36, 1, true)
  const bellTopGeo = new THREE.CylinderGeometry(0.138, 0.138, 0.012, 36)
  const ringGeo = new THREE.TorusGeometry(0.095, 0.012, 8, 36)
  ringGeo.rotateX(Math.PI / 2)
  const silver = new THREE.MeshPhysicalMaterial({
    color: 0xc8cbc8,
    metalness: 1,
    roughness: 0.22,
  })
  const nutGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.04, 6)
  const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.035, 20)
  const blade = bladeGeo(THREE)
  const discGeo = new THREE.CircleGeometry(PROP_R + 0.01, 64)
  discGeo.rotateX(-Math.PI / 2)
  const discTex = radial(THREE, [
    [0, 'rgba(255,255,255,0)'],
    [0.2, 'rgba(255,255,255,0.05)'],
    [0.82, 'rgba(255,255,255,0.12)'],
    [0.93, 'rgba(255,255,255,0.42)'],
    [1, 'rgba(255,255,255,0)'],
  ])
  const haloGeo = new THREE.TorusGeometry(0.2, 0.007, 8, 64)
  haloGeo.rotateX(Math.PI / 2)

  const rotors: Rotor[] = MOTORS.map(([x, z], k) => {
    const mount = new THREE.Group()
    mount.position.set(x, -0.06, z)
    body.add(mount)
    const stator = new THREE.Mesh(statorGeo, statorMat)
    stator.position.y = 0.025
    mount.add(stator)
    const spin = new THREE.Group()
    spin.position.y = 0.05
    mount.add(spin)
    const bell = new THREE.MeshPhysicalMaterial({
      color: 0x2d3742,
      metalness: 0.85,
      roughness: 0.3,
      clearcoat: 0.4,
      emissive: MAGENTA,
      emissiveIntensity: 0,
    })
    const bellSide = new THREE.Mesh(bellGeo, bell)
    bellSide.position.y = 0.05
    spin.add(bellSide)
    const bellTop = new THREE.Mesh(bellTopGeo, bell)
    bellTop.position.y = 0.106
    spin.add(bellTop)
    const ring = new THREE.Mesh(ringGeo, silver)
    ring.position.y = 0.114
    spin.add(ring)
    const hub = new THREE.Mesh(hubGeo, silver)
    hub.position.y = 0.13
    spin.add(hub)
    const nut = new THREE.Mesh(nutGeo, alu)
    nut.position.y = 0.165
    spin.add(nut)
    const bladeMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d2320,
      roughness: 0.28,
      metalness: 0.1,
      clearcoat: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    })
    for (let b = 0; b < 3; b++) {
      const m = new THREE.Mesh(blade, bladeMat)
      m.position.y = 0.13
      m.rotation.y = (b * Math.PI * 2) / 3
      // a prop turning the other way is the mirror image
      if (DIR[k] < 0) m.scale.z = -1
      spin.add(m)
    }
    const disc = new THREE.Mesh(
      discGeo,
      new THREE.MeshBasicMaterial({
        map: discTex,
        color: 0xe6eee0,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      })
    )
    disc.position.y = 0.185
    mount.add(disc)
    let halo: Rotor['halo']
    if (k === LOST) {
      halo = new THREE.Mesh(
        haloGeo,
        new THREE.MeshBasicMaterial({
          color: MAGENTA,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        })
      )
      halo.position.y = 0.06
      mount.add(halo)
    }
    return { spin, bladeMat, disc, halo, bell }
  })

  // the body's axes, drawn over everything: forward, up, right
  const axes = new THREE.Group()
  body.add(axes)
  const shaftGeo = new THREE.CylinderGeometry(0.008, 0.008, 1, 8)
  shaftGeo.translate(0, 0.5, 0)
  const headGeo = new THREE.ConeGeometry(0.032, 0.1, 16)
  const axisMats = [GREEN, 0x7f9a74, PAPER].map(
    (c) =>
      new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        opacity: 0,
      })
  )
  const axisLen = [1.25, 0.95, 1.25]
  const axis = axisMats.map((mat, i) => {
    const g = new THREE.Group()
    const shaft = new THREE.Mesh(shaftGeo, mat)
    shaft.renderOrder = 10
    const head = new THREE.Mesh(headGeo, mat)
    head.renderOrder = 10
    g.add(shaft, head)
    if (i === 0) g.rotation.z = -Math.PI / 2
    if (i === 2) g.rotation.x = Math.PI / 2
    axes.add(g)
    return { g, shaft, head, len: axisLen[i] }
  })
  axes.position.y = 0.02

  const ready = loadRounded.then(({ RoundedBoxGeometry }) => {
    const g = new RoundedBoxGeometry(0.76, 0.3, 0.36, 3, 0.045)
    const cell = new THREE.Mesh(g, wrap)
    pack.add(cell)
  })

  return {
    group,
    body,
    rotors,
    axis,
    axisMats,
    ready,
    lost: MOTORS[LOST],
    dispose: () => {
      tex.dispose()
      discTex.dispose()
      lipo.dispose()
    },
  }
}

function makeFloor(THREE: Three) {
  const group = new THREE.Group()
  const gridMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uAlpha: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec2 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAlpha;
      varying vec2 vW;
      float grid(vec2 p, float s) {
        vec2 g = abs(fract(p / s - 0.5) - 0.5) * s;
        vec2 fw = fwidth(p) * 1.1;
        vec2 a = 1.0 - smoothstep(vec2(0.0), fw, g);
        return max(a.x, a.y);
      }
      void main() {
        float r = length(vW);
        float fade = 1.0 - smoothstep(1.5, 10.0, r);
        float a = max(grid(vW, 0.5) * 0.09, grid(vW, 2.0) * 0.2) * fade * uAlpha;
        gl_FragColor = vec4(0.718, 0.827, 0.659, a);
      }`,
  })
  const gridGeo = new THREE.PlaneGeometry(30, 30)
  gridGeo.rotateX(-Math.PI / 2)
  group.add(new THREE.Mesh(gridGeo, gridMat))

  const soft = radial(THREE, [
    [0, 'rgba(255,255,255,1)'],
    [0.45, 'rgba(255,255,255,0.45)'],
    [1, 'rgba(255,255,255,0)'],
  ])
  const decal = new THREE.PlaneGeometry(1, 1)
  decal.rotateX(-Math.PI / 2)
  const pool = new THREE.Mesh(
    decal,
    new THREE.MeshBasicMaterial({
      map: soft,
      color: SAGE,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  )
  pool.scale.setScalar(5.5)
  pool.position.y = 0.001
  group.add(pool)
  const shadow = new THREE.Mesh(
    decal,
    new THREE.MeshBasicMaterial({
      map: soft,
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })
  )
  shadow.position.y = 0.002
  group.add(shadow)

  // the hover point, and the 39 cm it never leaves
  const ringGeo = new THREE.RingGeometry(0.382, 0.39, 96)
  ringGeo.rotateX(-Math.PI / 2)
  const ringMat = new THREE.MeshBasicMaterial({
    color: SAGE,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.position.y = 0.003
  group.add(ring)
  const crossGeo = new THREE.PlaneGeometry(0.16, 0.008)
  crossGeo.rotateX(-Math.PI / 2)
  for (const r of [0, Math.PI / 2]) {
    const c = new THREE.Mesh(crossGeo, ringMat)
    c.rotation.y = r
    c.position.y = 0.003
    group.add(c)
  }
  return {
    group,
    shadow,
    ringMat,
    dispose: () => soft.dispose(),
  }
}

/** The gyro strip's scale: log, so the hover's hum and the 23 rad/s spin both read. */
const squash = (v: number) =>
  (Math.sign(v) * Math.log1p(Math.abs(v))) / Math.log1p(40)
const STRIP_W = 520
const STRIP_H = 130
const SAMPLES = 120
const WINDOW = 2.4

export function QuadGL({ clock, speed }: { clock: ShotClock; speed: number }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    return startGL(cv, async (THREE, renderer) => {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(30, 1920 / 1080, 0.05, 100)
      camera.setViewOffset(1920, 1080, -SHIFT, 0, 1920, 1080)
      reelLights(THREE, scene, renderer, SAGE)
      // a darker sky than the reel's, so the carbon stays carbon,
      // and its sage rim kept low, on the edges rather than across the plates
      scene.traverse((o) => {
        if ((o as THREE_NS.HemisphereLight).isHemisphereLight)
          (o as THREE_NS.HemisphereLight).intensity = 0.7
        const d = o as THREE_NS.DirectionalLight
        if (d.isDirectionalLight && d.position.x < 0) d.position.y = 0.35
      })
      scene.environment = await environment(THREE, renderer)
      scene.environmentIntensity = 0.75
      const under = new THREE.DirectionalLight(GREEN, 0.5)
      under.position.set(2, -1.5, 3)
      scene.add(under)
      await yieldFrame()
      const floor = makeFloor(THREE)
      scene.add(floor.group)
      const quad = makeQuad(THREE)
      scene.add(quad.group)
      await quad.ready
      const glow = new THREE.PointLight(MAGENTA, 0, 2.2, 1.6)
      quad.body.add(glow)
      glow.position.set(quad.lost[0], 0.05, quad.lost[1])
      await yieldFrame()

      const paths = Array.from(
        cv.closest('.v6-rig')?.querySelectorAll<SVGPathElement>('[data-gyro]') ??
          []
      )
      const g3 = [0, 0, 0]
      const pts: string[][] = [[], [], []]

      const qYaw = new THREE.Quaternion()
      const qLean = new THREE.Quaternion()
      const qWob = new THREE.Quaternion()
      const up = new THREE.Vector3(0, 1, 0)
      const tilt = new THREE.Vector3(1, 0, -1).normalize()
      const wob = new THREE.Euler()
      const target = new THREE.Vector3()
      let cleared = false

      return {
        warm: { scene, camera },
        frame: () => {
          const raw = clock.time()
          if (raw < 0) {
            if (!cleared) renderer.clear()
            cleared = true
            return
          }
          cleared = false
          // past the hold the clock runs in real seconds: back to the shot's own tempo
          const l = raw > HOLD ? HOLD + (raw - HOLD) * speed : raw
          const s = story(l)
          const pc = pace(l)

          // the quad: rises into its hover, slides and dips when the rotor goes, holds its point
          const rise = E.out(prog(l, 0, bt(2)))
          const sl = slide(s)
          const sp = yawRate(s) / OMEGA
          const y =
            H -
            0.35 * (1 - rise) +
            0.018 * Math.sin(s * 2.4) * (1 - sp) -
            0.12 * (sl / 0.39)
          const ps = yaw(s)
          quad.group.position.set(
            (sl * 0.707 + 0.025 * sp * Math.cos(ps)),
            y,
            (sl * 0.707 + 0.025 * sp * Math.sin(ps))
          )
          wob.set(
            0.035 * (noise(s * 0.9, 21) - 0.5),
            0,
            0.035 * (noise(s * 0.8, 22) - 0.5)
          )
          qWob.setFromEuler(wob)
          qYaw.setFromAxisAngle(up, -ps)
          qLean.setFromAxisAngle(tilt, lean(s))
          quad.body.quaternion.copy(qYaw).multiply(qLean).multiply(qWob)

          // the rotors: three hum on; the front-right one spins down and stops
          quad.rotors.forEach((r, k) => {
            let a: number
            let w = 1
            if (k === LOST && s > FAULT) {
              const tau = 0.05
              const d = s - FAULT
              a = VIS * (FAULT + tau * (1 - Math.exp(-d / tau)))
              w = Math.exp(-d / tau)
            } else a = VIS * s
            r.spin.rotation.y = -DIR[k] * a
            // the blur disc shows a fast prop; in slow time the blades stand out instead
            const blur = Math.max(0, w * Math.min(1, (pc - 0.25) / 0.6))
            r.disc.material.opacity = 0.5 * blur
            r.bladeMat.opacity = lerp(1, 0.4, blur)
            if (r.halo) {
              const on = prog(l, bt(4), bt(4.3))
              r.halo.material.opacity = on * (0.75 + 0.2 * Math.sin(l * 5))
              r.bell.emissiveIntensity = on * 0.1
              glow.intensity = on * lerp(2.4, 1.1, prog(l, bt(4.3), bt(8)))
            }
          })

          // the body's axes draw out in bar one and fold away before the spin
          const draw = E.out(prog(l, bt(0.6), bt(2)))
          const fold = 1 - E.inOut(prog(l, bt(7.2), bt(8.2)))
          quad.axis.forEach((a) => {
            const len = a.len * Math.max(0.001, draw)
            a.shaft.scale.y = len
            a.head.position.y = len
          })
          quad.axisMats.forEach((m) => (m.opacity = 0.95 * draw * fold))

          // the floor: its shadow follows, the hover ring shows once it is holding
          floor.shadow.position.set(
            quad.group.position.x,
            0.002,
            quad.group.position.z
          )
          floor.shadow.scale.setScalar(2.1 + 0.3 * (1 - rise))
          floor.shadow.material.opacity = 0.55 * rise
          floor.ringMat.opacity = 0.55 * E.out(prog(l, bt(8.5), bt(10)))

          // the camera: a slow orbit, a push-in for the fault, a pull back up to see it hold
          const p0 = E.soft(prog(l, 0, bt(4)))
          const p1 = E.inOut(prog(l, bt(3), bt(5)))
          const p2 = E.out(prog(l, bt(7.5), bt(11.5)))
          const az = lerp(lerp(0.02, 0.3, p0), 0.42, p1) + 0.14 * p2 + 0.035 * Math.max(0, l - bt(12))
          const R = lerp(lerp(lerp(5.9, 5.3, p0), 4.8, p1), 5.8, p2)
          const el = lerp(lerp(0.2, 0.28, p0), 0.25, p1) + 0.1 * p2
          target.set(0, H - 0.08 - 0.32 * p2, 0)
          camera.position.set(
            target.x + R * Math.cos(el) * Math.cos(az),
            target.y + R * Math.sin(el),
            target.z + R * Math.cos(el) * Math.sin(az)
          )
          camera.lookAt(target)

          // the gyro strip
          if (paths.length === 3) {
            for (let i = 0; i < SAMPLES; i++) {
              const t = l - WINDOW * (1 - i / (SAMPLES - 1))
              if (t < 0) g3[0] = g3[1] = g3[2] = 0
              else gyro(story(t), g3)
              const x = ((i / (SAMPLES - 1)) * STRIP_W).toFixed(1)
              for (let k = 0; k < 3; k++) {
                const yv = (STRIP_H / 2 - squash(g3[k]) * (STRIP_H / 2 - 6)).toFixed(1)
                pts[k][i] = `${i ? 'L' : 'M'}${x} ${yv}`
              }
            }
            for (let k = 0; k < 3; k++) paths[k].setAttribute('d', pts[k].join(''))
          }

          renderer.render(scene, camera)
        },
        dispose: () => {
          scene.traverse((o) => {
            const m = o as THREE_NS.Mesh
            if (m.isMesh) {
              m.geometry.dispose()
              const mats = Array.isArray(m.material) ? m.material : [m.material]
              mats.forEach((x) => x.dispose())
            }
          })
          quad.dispose()
          floor.dispose()
          scene.environment?.dispose()
        },
      }
    })
  }, [clock, speed])

  return (
    <canvas ref={canvas} className="v6-canvas" width={1920} height={1080} />
  )
}
