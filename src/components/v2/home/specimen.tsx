'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import { drawGap } from '@/components/v6/gl/pace'
import { v2Home } from '@/content/v2/home'

import { loadE58, proceduralDrone, type Airframe } from './airframes'
import styles from './specimen.module.css'

/*
 * Fig. 0 — the specimen. One WebGL context holds a contour-line terrain and
 * the Eachine E58 pocket drone (by the_Thorminator, CC BY 4.0) with blurred
 * rotor discs driven by the mixer. Dragging commands roll and pitch
 * rates; letting go hands the airframe to a PD self-level loop, so it
 * overshoots slightly and settles. A quad-X mixer turns the loop's outputs
 * into four motor commands that drive the bars. The controller and mixer are
 * a simulation, labelled as such. If the model cannot load, the procedural
 * quadrotor flies instead.
 */

const KP = 30
const KD = 6.2
const MAX_TILT = 0.8

const TERRAIN_VERT = /* glsl */ `
  uniform float uTime;
  varying float vHeight;
  varying float vDist;
  varying vec2 vGrid;

  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float terrain(vec2 p) {
    float h = snoise(p * 0.11) * 1.1;
    h += snoise(p * 0.27 + 7.3) * 0.38;
    h += snoise(p * 0.62 - 3.1) * 0.12;
    return h;
  }

  void main() {
    vec3 pos = position;
    vec2 q = pos.xz + vec2(0.0, -uTime * 0.55);
    pos.y += terrain(q);
    vHeight = pos.y;
    vGrid = q * 0.5;
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec4 view = viewMatrix * world;
    vDist = -view.z;
    gl_Position = projectionMatrix * view;
  }
`

const TERRAIN_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vHeight;
  varying float vDist;
  varying vec2 vGrid;

  void main() {
    float k = vHeight * 4.0;
    float c = abs(fract(k - 0.5) - 0.5) / fwidth(k);
    float contour = 1.0 - min(c, 1.0);
    float major = 1.0 - min(abs(fract(k / 5.0 - 0.5) - 0.5) / fwidth(k / 5.0), 1.0);
    vec2 g = abs(fract(vGrid - 0.5) - 0.5) / fwidth(vGrid);
    float grid = 1.0 - min(min(g.x, g.y), 1.0);
    float fade = smoothstep(30.0, 7.0, vDist) * smoothstep(1.5, 5.0, vDist);
    float a = (contour * 0.5 + major * 0.45 + grid * 0.1) * fade * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
  }
`

type Mode = 'loading' | 'manual' | 'level' | 'settled'

/** Where each callout's label sits; the order matches the airframe's anchors. */
const SLOTS = [
  { key: 'a', side: 'left' as const, slot: 0.22 },
  { key: 'b', side: 'right' as const, slot: 0.26 },
  { key: 'c', side: 'left' as const, slot: 0.72 },
  { key: 'd', side: 'right' as const, slot: 0.7 },
]

const easeOut = (k: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3)

export function Specimen() {
  const host = useRef<HTMLDivElement>(null)
  const canvasHost = useRef<HTMLDivElement>(null)
  const lines = useRef<(SVGPolylineElement | null)[]>([])
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const labels = useRef<(HTMLSpanElement | null)[]>([])
  const readout = useRef<{
    roll?: HTMLElement | null
    pitch?: HTMLElement | null
    yaw?: HTMLElement | null
  }>({})
  const bars = useRef<(HTMLSpanElement | null)[]>([])
  const [mode, setMode] = useState<Mode>('loading')
  const [failed, setFailed] = useState(false)
  const [airframe, setAirframe] = useState<'none' | 'model' | 'procedural'>(
    'none'
  )

  const copy = v2Home.specimen
  const modelLabels = [
    copy.propLabel(1),
    copy.callouts.arm,
    copy.callouts.airframe,
    copy.callouts.camera,
  ]

  // While the preflight intro plays, the specimen does not exist yet: no renderer,
  // no model, no shader compiles competing with the intro for the main thread.
  // It builds once the intro has handed over, and its drop-in is the next beat.
  const [introClear, setIntroClear] = useState(false)
  useEffect(() => {
    // the root that hosts the intro (v2's own, or any version that hosts it)
    const v2 = host.current?.closest<HTMLElement>('[data-intro-root]')
    const active = () =>
      ['on', 'playing', 'reveal'].includes(v2?.dataset.intro ?? '')
    if (!v2 || !active()) {
      setIntroClear(true)
      return
    }
    const watch = new MutationObserver(() => {
      if (active()) return
      watch.disconnect()
      setIntroClear(true)
    })
    watch.observe(v2, { attributes: true, attributeFilter: ['data-intro'] })
    return () => watch.disconnect()
  }, [])

  useEffect(() => {
    const root = host.current
    const mount = canvasHost.current
    if (!introClear || !root || !mount) return
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    let disposed = false

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch {
      setFailed(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80)
    camera.position.set(0, 1.9, 6.2)
    camera.lookAt(0, -0.25, 0)

    // ---- terrain
    const brandColor = () => {
      const v =
        getComputedStyle(root).getPropertyValue('--brand').trim() || '#c9686a'
      return new THREE.Color(v)
    }
    const terrainMat = new THREE.ShaderMaterial({
      vertexShader: TERRAIN_VERT,
      fragmentShader: TERRAIN_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: brandColor() },
        uOpacity: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
    })
    const terrainGeo = new THREE.PlaneGeometry(64, 48, 200, 150)
    terrainGeo.rotateX(-Math.PI / 2)
    const terrain = new THREE.Mesh(terrainGeo, terrainMat)
    terrain.position.set(0, -2.6, -14)
    scene.add(terrain)

    // ---- light
    // A studio environment gives the airframe's glossy plastic something to reflect.
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    scene.environment = envMap
    scene.add(new THREE.HemisphereLight(0xffe9dc, 0x1a0f0e, 1.15))
    const key = new THREE.DirectionalLight(0xfff3e8, 2.4)
    key.position.set(3.5, 5, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight(brandColor(), 2.2)
    rim.position.set(-4, 1.5, -3.5)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0xfff1e6, 0.9)
    fill.position.set(-2, 2.5, 6)
    scene.add(fill)

    // ---- airframe: the camera drone, or the procedural quadrotor if it cannot load
    const rig = new THREE.Group()
    scene.add(rig)
    let air: Airframe | null = null
    let arrivedAt = -1
    const isLight = () =>
      root.closest('[data-v2]')?.getAttribute('data-theme') === 'light'

    const mountAirframe = (a: Airframe, kind: 'model' | 'procedural') => {
      if (disposed) {
        a.dispose()
        return
      }
      air = a
      a.retint(isLight())
      rig.add(a.root)
      // The left callout points at whichever prop sits nearest the left edge,
      // so its leader never has to cross the airframe.
      if (a.props?.length) {
        rig.updateMatrixWorld(true)
        let best = 0
        let bestX = Infinity
        a.props.forEach((p, i) => {
          const x = p.getWorldPosition(new THREE.Vector3()).project(camera).x
          if (x < bestX) {
            bestX = x
            best = i
          }
        })
        a.anchors[0] = a.props[best]
        a.labels[0] = copy.propLabel(best + 1)
      }
      a.labels.forEach((text, i) => {
        const el = labels.current[i]
        if (el) el.textContent = text
      })
      setAirframe(kind)
      // it arrives from above, tilted, and the self-level loop catches it
      arrivedAt = t
      if (!reduced) {
        s.roll = 0.36
        s.pitch = -0.2
        setModeIfChanged('level')
      } else {
        setModeIfChanged('settled')
      }
      wake()
    }

    loadE58(modelLabels)
      .then(async (a) => {
        // its shaders compile before it mounts (off the main thread where the
        // driver allows), so its first frame doesn't stall the opening screen
        try {
          await renderer.compileAsync(a.root, camera, scene)
        } catch {
          /* compiled on its first frame instead */
        }
        return a
      })
      .then((a) => mountAirframe(a, 'model'))
      .catch(() => {
        if (!disposed)
          mountAirframe(
            proceduralDrone([...copy.fallbackCallouts], brandColor()),
            'procedural'
          )
      })

    const onTheme = () => {
      air?.retint(isLight())
      const c = brandColor()
      terrainMat.uniforms.uColor.value = c
      rim.color.copy(c)
      draw()
    }
    window.addEventListener('v2-theme', onTheme)

    // ---- flight state
    const s = {
      roll: 0,
      pitch: 0,
      rollRate: 0,
      pitchRate: 0,
      yaw: -0.55,
      yawRate: 0,
    }
    let dragging = false
    let lastX = 0
    let lastY = 0
    let lastT = 0
    let cmdRoll = 0
    let cmdPitch = 0
    let modeNow: Mode = 'loading'
    let gustAt = 6

    function setModeIfChanged(m: Mode) {
      if (m !== modeNow) {
        modeNow = m
        setMode(m)
      }
    }

    const onDown = (e: PointerEvent) => {
      if (!air) return
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      lastT = performance.now()
      cmdRoll = 0
      cmdPitch = 0
      renderer.domElement.setPointerCapture(e.pointerId)
      setModeIfChanged('manual')
      wake()
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const now = performance.now()
      const dt = Math.max(8, now - lastT) / 1000
      cmdRoll = ((e.clientX - lastX) / dt) * 0.0042
      cmdPitch = ((e.clientY - lastY) / dt) * 0.0042
      s.yawRate += ((e.clientX - lastX) / dt) * 0.00045
      lastX = e.clientX
      lastY = e.clientY
      lastT = now
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      s.rollRate = cmdRoll
      s.pitchRate = cmdPitch
      cmdRoll = 0
      cmdPitch = 0
      setModeIfChanged('level')
    }
    const onKey = (e: KeyboardEvent) => {
      if (!air) return
      const kick = e.shiftKey ? 3.4 : 2.2
      if (e.key === 'ArrowLeft') s.rollRate -= kick
      else if (e.key === 'ArrowRight') s.rollRate += kick
      else if (e.key === 'ArrowUp') s.pitchRate -= kick
      else if (e.key === 'ArrowDown') s.pitchRate += kick
      else return
      e.preventDefault()
      setModeIfChanged('level')
      wake()
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    root.addEventListener('keydown', onKey)

    // ---- layout
    let w = 1
    let h = 1
    const resize = () => {
      w = mount.clientWidth || 1
      h = mount.clientHeight || 1
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      // Keep the airframe at the same apparent size on narrow plates.
      camera.position.z = w / h < 0.9 ? 8.4 : 6.2
      camera.updateProjectionMatrix()
      draw()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    // ---- callouts
    const labelY = SLOTS.map((c) => c.slot)
    const tmp = new THREE.Vector3()
    const placeCallouts = () => {
      if (!air) return
      air.anchors.forEach((anchor, i) => {
        const p = anchor.getWorldPosition(tmp).project(camera)
        const px = (p.x * 0.5 + 0.5) * w
        const py = (-p.y * 0.5 + 0.5) * h
        const c = SLOTS[i]
        const targetY = Math.min(
          0.9,
          Math.max(0.1, c.slot * 0.6 + (py / h) * 0.4)
        )
        labelY[i] += (targetY - labelY[i]) * 0.12
        const ly = labelY[i] * h
        const edge = c.side === 'left' ? 24 : w - 24
        const elbow =
          c.side === 'left'
            ? Math.min(px - 36, w * 0.3)
            : Math.max(px + 36, w * 0.7)
        lines.current[i]?.setAttribute(
          'points',
          `${edge},${ly} ${elbow},${ly} ${px},${py}`
        )
        dots.current[i]?.setAttribute('cx', String(px))
        dots.current[i]?.setAttribute('cy', String(py))
        const label = labels.current[i]
        if (label) label.style.transform = `translate3d(0, ${ly - 22}px, 0)`
      })
    }

    // ---- mixer (quad X, nose along +x)
    const motor = [0.5, 0.5, 0.5, 0.5]

    const fmt = (rad: number) => {
      const d = THREE.MathUtils.radToDeg(rad)
      return `${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1).padStart(4, '0')}°`
    }

    // ---- loop
    const clock = new THREE.Clock()
    let raf = 0
    let onScreen = true
    let visible = true
    let t = 0
    let uiTick = 0

    function step(dt: number) {
      if (!air) return
      if (dragging) {
        s.rollRate = cmdRoll
        s.pitchRate = cmdPitch
        cmdRoll *= 0.82
        cmdPitch *= 0.82
      } else {
        s.rollRate += (-KP * s.roll - KD * s.rollRate) * dt
        s.pitchRate += (-KP * s.pitch - KD * s.pitchRate) * dt
      }
      s.roll = THREE.MathUtils.clamp(
        s.roll + s.rollRate * dt,
        -MAX_TILT,
        MAX_TILT
      )
      s.pitch = THREE.MathUtils.clamp(
        s.pitch + s.pitchRate * dt,
        -MAX_TILT,
        MAX_TILT
      )
      s.yawRate *= Math.exp(-2.4 * dt)
      s.yaw += s.yawRate * dt

      const settled =
        Math.abs(s.roll) < 0.004 &&
        Math.abs(s.pitch) < 0.004 &&
        Math.abs(s.rollRate) < 0.02 &&
        Math.abs(s.pitchRate) < 0.02
      if (!dragging) setModeIfChanged(settled ? 'settled' : 'level')

      // controller outputs (or the pilot's command while dragging)
      const uRoll = dragging
        ? cmdRoll * 0.25
        : (-KP * s.roll - KD * s.rollRate) * 0.04
      const uPitch = dragging
        ? cmdPitch * 0.25
        : (-KP * s.pitch - KD * s.pitchRate) * 0.04
      const uYaw = -s.yawRate * 0.12
      air.rotors.forEach(({ x, z, dir }, i) => {
        const m = THREE.MathUtils.clamp(
          0.52 + uRoll * z * 0.7 - uPitch * x * 0.7 + uYaw * dir,
          0.05,
          1
        )
        motor[i] += (m - motor[i]) * 0.3
      })
      air.update(dt, motor, !reduced || dragging || !settled)

      const arrive = reduced ? 1 : easeOut((t - arrivedAt) / 0.9)
      const bob = reduced || !air.bob ? 0 : Math.sin(t * 1.3) * 0.045
      rig.position.y = bob + (1 - arrive) * 1.9
      rig.rotation.set(s.roll, s.yaw, -s.pitch, 'YZX')

      // occasional gusts keep the loop visibly working when nobody touches it
      if (!reduced && !dragging && t > gustAt) {
        s.rollRate += (Math.random() - 0.5) * 1.6
        s.pitchRate += (Math.random() - 0.5) * 1.2
        gustAt = t + 5 + Math.random() * 4
      }
    }

    function draw() {
      renderer.render(scene, camera)
      placeCallouts()
    }

    let drawnAt = 0
    function frame(now: number) {
      raf = 0
      // at most 60 frames a second, and 30 while the page scrolls (pace.ts)
      if (now - drawnAt < drawGap(now)) {
        if (visible) raf = window.requestAnimationFrame(frame)
        return
      }
      drawnAt = now
      const dt = Math.min(clock.getDelta(), 1 / 30)
      t += dt
      if (!reduced) terrainMat.uniforms.uTime.value = t
      step(dt)
      draw()
      uiTick += dt
      if (uiTick > 0.05) {
        uiTick = 0
        const r = readout.current
        if (r.roll) r.roll.textContent = fmt(s.roll)
        if (r.pitch) r.pitch.textContent = fmt(s.pitch)
        if (r.yaw)
          r.yaw.textContent = `${(((THREE.MathUtils.radToDeg(s.yaw) % 360) + 360) % 360).toFixed(1).padStart(5, '0')}°`
        motor.forEach((m, i) => {
          const bar = bars.current[i]
          if (bar) bar.style.transform = `scaleY(${m.toFixed(3)})`
        })
      }
      const idle =
        reduced && !dragging && (modeNow === 'settled' || modeNow === 'loading')
      if (visible && !idle) raf = window.requestAnimationFrame(frame)
    }

    function wake() {
      if (!raf && visible) {
        clock.getDelta()
        raf = window.requestAnimationFrame(frame)
      }
    }

    // paused off screen and in a hidden tab
    const update = () => {
      visible = onScreen && document.visibilityState === 'visible'
      if (visible) wake()
    }
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      update()
    })
    io.observe(root)
    const onVis = () => update()
    document.addEventListener('visibilitychange', onVis)

    resize()
    wake()

    return () => {
      disposed = true
      window.cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('v2-theme', onTheme)
      renderer.domElement.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      root.removeEventListener('keydown', onKey)
      air?.dispose()
      terrainGeo.dispose()
      terrainMat.dispose()
      envMap.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
    // the effect owns the scene for the component's life once the intro is clear; copy is static
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introClear])

  const { model } = copy
  return (
    <figure className={styles.specimen}>
      <div
        ref={host}
        className={styles.plate}
        tabIndex={0}
        role="group"
        aria-roledescription="interactive model"
        aria-label={copy.ariaLabel}
        data-cursor="drag"
        data-failed={failed || undefined}
        data-ready={airframe !== 'none' || undefined}
      >
        <div ref={canvasHost} className={styles.canvas} />
        <svg className={styles.leaders} aria-hidden="true">
          {SLOTS.map((c, i) => (
            <g key={c.key}>
              <polyline
                ref={(el) => void (lines.current[i] = el)}
                className={styles.leader}
                points="0,0"
              />
              <circle
                ref={(el) => void (dots.current[i] = el)}
                className={styles.leaderDot}
                r="3"
                cx="-10"
                cy="-10"
              />
            </g>
          ))}
        </svg>
        {SLOTS.map((c, i) => (
          <span
            key={c.key}
            ref={(el) => void (labels.current[i] = el)}
            className={styles.callout}
            data-side={c.side}
            aria-hidden="true"
          >
            {modelLabels[i]}
          </span>
        ))}

        <div className={styles.hud} aria-hidden="true">
          <div className={styles.attitude}>
            <span>
              <i>Roll</i>
              <b ref={(el) => void (readout.current.roll = el)}>+00.0°</b>
            </span>
            <span>
              <i>Pitch</i>
              <b ref={(el) => void (readout.current.pitch = el)}>+00.0°</b>
            </span>
            <span>
              <i>Yaw</i>
              <b ref={(el) => void (readout.current.yaw = el)}>328.5°</b>
            </span>
          </div>
          <div className={styles.mixer}>
            <span className={styles.mode} data-mode={mode}>
              {copy.modes[mode]}
            </span>
            <span className={styles.bars} title={copy.simulated}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={styles.barWell}>
                  <span
                    ref={(el) => void (bars.current[i] = el)}
                    className={styles.bar}
                  />
                  <em>M{i + 1}</em>
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.figLabel}>{copy.label}</span>
        {airframe === 'procedural' ? (
          <span>
            {copy.fallbackCaption} {copy.hint}
          </span>
        ) : (
          <span>
            <a
              className={styles.credit}
              href={model.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              “{model.title}”
            </a>{' '}
            by{' '}
            <a
              className={styles.credit}
              href={model.authorHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {model.author}
            </a>
            ,{' '}
            <a
              className={styles.credit}
              href={model.licenseHref}
              target="_blank"
              rel="noopener noreferrer license"
            >
              {model.license}
            </a>
            . {copy.hint}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
