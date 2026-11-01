import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import { buildDrone } from '@/components/three/drone/geometry'
import { introModelBytes } from '@/components/v2/intro/timing'

/*
 * The specimen's airframe, behind one small interface so the flight
 * controller, mixer, and callouts never care which model is flying. The
 * Eachine E58 pocket drone is the primary airframe; the procedural quadrotor
 * is the fallback if the model cannot load.
 */

export interface Airframe {
  /** Added to the rig; nose along +x, centred on the rig origin. */
  root: THREE.Object3D
  /** Callout targets, in the order the specimen lays its labels out. */
  anchors: THREE.Object3D[]
  labels: string[]
  /** Rotor positions in rig space (unit-ish), for the quad-X mixer. */
  rotors: { x: number; z: number; dir: number }[]
  /** Whether the specimen should add its own hover bob (the model brings its own). */
  bob: boolean
  /** The four props, when the model names them, so a callout can pick the nearest one. */
  props?: THREE.Object3D[]
  /** Advance the airframe's own motion: rotor spin or the authored animation. */
  update(dt: number, motors: number[], animate: boolean): void
  retint(light: boolean): void
  dispose(): void
}

/*
 * The web build of the E58 (built from eachine-e58.glb): the same mesh and the
 * same colour and normal maps, with meshopt geometry instead of Draco (no decoder
 * download or workers), smaller helper maps, the source tilt undone in the file,
 * and no glass transmission pass on the lenses.
 */
export const E58_URL = '/models/eachine-e58-web.glb'

/*
 * The E58 ships as two merged meshes (body and lenses) with a tilt baked into
 * its nodes and no named parts or animation. Its geometry was measured once
 * with the tilt undone; these are model units, nose along -z.
 */
export const E58_HUBS: [number, number, number][] = [
  [-0.055, 0.0141, -0.0391], // front left (front arms sit higher, Mavic-style)
  [0.0546, 0.0138, -0.039], // front right
  [0.0499, -0.0001, 0.0414], // rear right
  [-0.0504, -0.0001, 0.0415], // rear left
]
const E58_LENS: [number, number, number] = [-0.0003, -0.0012, -0.0379]
const E58_ARM: [number, number, number] = [0.03, 0.0076, -0.0215] // along the front-right arm
const E58_TOP: [number, number, number] = [0, 0.009, 0.006]
const E58_ROTOR_R = 0.025

/** A translucent disc with two ghost blades: what a spinning prop looks like on camera. */
function rotorBlurTexture(): THREE.CanvasTexture {
  const n = 256
  const c = document.createElement('canvas')
  c.width = c.height = n
  const g = c.getContext('2d')!
  const r = n / 2
  g.translate(r, r)
  const disc = g.createRadialGradient(0, 0, r * 0.12, 0, 0, r)
  disc.addColorStop(0, 'rgba(210, 205, 200, 0.02)')
  disc.addColorStop(0.85, 'rgba(210, 205, 200, 0.09)')
  disc.addColorStop(1, 'rgba(210, 205, 200, 0)')
  g.fillStyle = disc
  g.beginPath()
  g.arc(0, 0, r, 0, Math.PI * 2)
  g.fill()
  for (const a0 of [0, Math.PI]) {
    for (let k = 0; k < 14; k++) {
      // each ghost blade is a fan of thin wedges fading behind the leading edge
      const a = a0 - k * 0.07
      g.fillStyle = `rgba(24, 22, 22, ${(0.42 * (1 - k / 14)).toFixed(3)})`
      g.beginPath()
      g.moveTo(0, 0)
      g.arc(0, 0, r * 0.96, a - 0.05, a + 0.05)
      g.closePath()
      g.fill()
    }
  }
  g.strokeStyle = 'rgba(240, 232, 222, 0.22)'
  g.lineWidth = 2
  g.beginPath()
  g.arc(0, 0, r * 0.95, 0, Math.PI * 2)
  g.stroke()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export async function loadE58(labels: string[]): Promise<Airframe> {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  // the intro may already have it, or have it on the way
  const bytes = await introModelBytes()
  const gltf: GLTF = bytes ? await loader.parseAsync(bytes, '') : await loader.loadAsync(E58_URL)

  const model = gltf.scene
  const materials: THREE.MeshStandardMaterial[] = []
  model.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.quaternion.identity() // undo the tilt baked in from its source scene
    const m = mesh.material as THREE.MeshStandardMaterial
    if (m && !materials.includes(m)) materials.push(m)
  })

  // Nose along -z in the model; the specimen flies nose-first along +x.
  const turn = new THREE.Group()
  turn.rotation.y = -Math.PI / 2
  turn.add(model)
  const root = new THREE.Group()
  root.add(turn)

  const at = ([x, y, z]: [number, number, number]) => {
    const o = new THREE.Object3D()
    o.position.set(x, y, z)
    turn.add(o)
    return o
  }
  const props = E58_HUBS.map(at)
  const anchors = [props[0], at(E58_ARM), at(E58_TOP), at(E58_LENS)]

  const blurTex = rotorBlurTexture()
  const blurMat = new THREE.MeshBasicMaterial({
    map: blurTex,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const blurGeo = new THREE.CircleGeometry(E58_ROTOR_R, 48)
  blurGeo.rotateX(-Math.PI / 2)
  const discs = E58_HUBS.map(([x, y, z]) => {
    const d = new THREE.Mesh(blurGeo, blurMat)
    d.position.set(x, y + 0.0022, z)
    turn.add(d)
    return d
  })

  // Normalise to the procedural airframe's footprint: prop-to-prop diagonal of
  // about 2.1 units, centred on the hubs in plan and on the body in height.
  const diag = Math.max(
    Math.hypot(E58_HUBS[0][0] - E58_HUBS[2][0], E58_HUBS[0][2] - E58_HUBS[2][2]),
    Math.hypot(E58_HUBS[1][0] - E58_HUBS[3][0], E58_HUBS[1][2] - E58_HUBS[3][2]),
  )
  const k = 2.1 / diag
  const centre = new THREE.Vector3()
  E58_HUBS.forEach(([x, , z]) => centre.add(new THREE.Vector3(x, 0, z)))
  centre.multiplyScalar(1 / E58_HUBS.length)
  model.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(model)
  centre.y = (box.min.y + box.max.y) / 2
  turn.scale.setScalar(k)
  // the turn rotates the centre too, so offset in the turned frame
  const offset = centre.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), turn.rotation.y).multiplyScalar(-k)
  turn.position.copy(offset)
  root.updateMatrixWorld(true)

  const rotors = props.map((p, i) => {
    const v = root.worldToLocal(p.getWorldPosition(new THREE.Vector3()))
    const len = Math.hypot(v.x, v.z) || 1
    return { x: v.x / len, z: v.z / len, dir: i % 2 === 0 ? 1 : -1 }
  })

  return {
    root,
    anchors,
    labels,
    rotors,
    bob: true,
    props,
    update(dt, motors, animate) {
      if (!animate) return
      discs.forEach((d, i) => {
        d.rotation.y += dt * (26 + (motors[i] ?? 0.5) * 40) * rotors[i].dir
      })
    },
    retint(light) {
      // glossy black plastic reads by its reflections; lift them on the dark ground
      for (const m of materials) m.envMapIntensity = light ? 0.9 : 1.6
      blurMat.opacity = light ? 1 : 0.85
    },
    dispose() {
      model.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) mesh.geometry.dispose()
      })
      for (const m of materials) {
        m.map?.dispose()
        m.normalMap?.dispose()
        m.aoMap?.dispose()
        m.roughnessMap?.dispose()
        m.metalnessMap?.dispose()
        m.dispose()
      }
      blurGeo.dispose()
      blurMat.dispose()
      blurTex.dispose()
    },
  }
}

/* ------------------------------------------------------------ fallback */

export function proceduralDrone(labels: string[], brand: THREE.Color): Airframe {
  const parts = buildDrone()
  const live = parts.materials.live as THREE.MeshBasicMaterial
  live.color.copy(brand)
  const TINTS: Record<'light' | 'dark', Record<string, number>> = {
    light: { body: 0x231b1a, dark: 0x140f0f, metal: 0x4a3c39, shell: 0x302624, arm: 0x2a201f, blade: 0x5a4a46 },
    dark: { body: 0x5b4946, dark: 0x2e2423, metal: 0x8a7570, shell: 0x6d5853, arm: 0x524240, blade: 0x9a8580 },
  }
  return {
    root: parts.group,
    anchors: [parts.rotors[1], parts.navLights[0], parts.bay, parts.gimbal],
    labels,
    rotors: parts.booms.map((b, i) => ({
      x: Math.cos(b.rotation.y),
      z: -Math.sin(b.rotation.y),
      dir: (parts.rotors[i].userData.dir as number) ?? 1,
    })),
    bob: true,
    update(dt, motors, animate) {
      if (!animate) return
      parts.rotors.forEach((r, i) => {
        r.rotation.y += dt * (14 + (motors[i] ?? 0.5) * 30) * ((r.userData.dir as number) ?? 1)
      })
    },
    retint(light) {
      for (const [name, color] of Object.entries(TINTS[light ? 'light' : 'dark'])) {
        ;(parts.materials[name] as THREE.MeshStandardMaterial | undefined)?.color.setHex(color)
      }
    },
    dispose: () => parts.dispose(),
  }
}
