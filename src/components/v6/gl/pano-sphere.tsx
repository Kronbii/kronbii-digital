'use client'

import { useEffect, useRef } from 'react'

import { E, lerp, prog } from '../armed'
import type { ShotClock } from '../shot'
import { startGL, yieldFrame } from './host'

/*
 * MAP's 3D beat, from the reel's panoShot: the flat panorama hands over from
 * the DOM sheet, curls into a sphere from its centre outward like paper
 * wrapping a ball, and spins up while the camera pushes in. The reel cuts
 * away at full speed; here the spin eases down to a slow turn and holds.
 */

const R = 1
const FOV = 32
/** Camera distance at which the flat sheet exactly fills the 16:9 frame's width. */
const D =
  (Math.PI * R) / (Math.tan((FOV / 2) * (Math.PI / 180)) * (1920 / 1080))

const VERT = /* glsl */ `
  uniform float uMorph; uniform float uR;
  varying vec2 vUv; varying float vK;
  void main() {
    vUv = uv;
    float lon = (uv.x - 0.5) * 6.28318530718;
    float lat = (uv.y - 0.5) * 3.14159265359;
    vec3 flat3 = vec3(lon * uR, lat * uR, uR);
    vec3 sph = uR * vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
    float k = clamp(uMorph * 1.75 - abs(lon) / 3.14159265 * 0.75, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vK = k;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(flat3, sph, k), 1.0);
  }`
const FRAG = /* glsl */ `
  uniform sampler2D uMap; uniform float uOpacity;
  varying vec2 vUv; varying float vK;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    float shade = gl_FrontFacing ? 1.0 : 0.42;
    vec3 col = c.rgb * shade;
    float bend = vK * (1.0 - vK) * 4.0;
    col = mix(col, vec3(0.79, 0.41, 0.42), bend * 0.35);
    gl_FragColor = vec4(col, uOpacity);
    #include <colorspace_fragment>
  }`

/** The spin, in closed form: a nudge, a linear spin-up to P, then a decay to the idle turn (velocity continuous). */
function spinAt(l: number) {
  const P = 9 // rad/s at the peak
  const I = 0.3 // rad/s, the idle turn
  let a = 0.35 * E.out(prog(l, 1.2, 1.5))
  const r = Math.min(Math.max(l - 1.45, 0), 0.25)
  a += (P * r * r) / 0.5
  if (l > 1.7) {
    const u = l - 1.7
    a += I * u + (P - I) * 0.5 * (1 - Math.exp(-u / 0.5))
  }
  return a
}

export function PanoSphere({ clock }: { clock: ShotClock }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    return startGL(cv, async (THREE, renderer) => {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(FOV, 1920 / 1080, 0.02, 100)
      // the same request as the DOM sheet's background (no CORS mode, which the page's own
      // picture doesn't need), so the browser fetches it once for both
      const img = new Image()
      img.src = '/images/v6/pano-equirect.jpg'
      await img.decode()
      const tex = new THREE.Texture(img)
      tex.needsUpdate = true
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        toneMapped: false,
        uniforms: {
          uMap: { value: tex },
          uMorph: { value: 0 },
          uOpacity: { value: 0 },
          uR: { value: R },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      })
      const geo = new THREE.PlaneGeometry(1, 1, 256, 128)
      const pano = new THREE.Mesh(geo, mat)
      pano.frustumCulled = false
      scene.add(pano)
      let drawn = -2
      return {
        warm: { scene, camera },
        frame: () => {
          const l = clock.time()
          // nothing until the sheet closes; after the hold the sphere keeps turning
          if (l < 0.9) {
            if (drawn !== -1) renderer.clear()
            drawn = -1
            return
          }
          const m = E.inOut(prog(l, 0.95, 1.48))
          mat.uniforms.uMorph.value = m
          mat.uniforms.uOpacity.value = prog(l, 0.9, 0.94)
          pano.rotation.set(0.32 * m, -spinAt(l), 0.12 * m)
          const push = E.inOut(prog(l, 1.4, 1.875))
          camera.position.set(0, 0, lerp(D + R, 4.2, push))
          camera.lookAt(0, 0, 0)
          renderer.render(scene, camera)
          drawn = l
        },
        dispose: () => {
          geo.dispose()
          mat.dispose()
          tex.dispose()
        },
      }
    })
  }, [clock])

  return (
    <canvas ref={canvas} className="v6-canvas" width={1920} height={1080} />
  )
}
