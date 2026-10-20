import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import ProfessionalAvatar, { AVATAR_H } from './ProfessionalAvatar'
import FloatingSkills from './FloatingSkills'
import { orbitSkills } from '../../data/portfolioData'
import { sceneStore, subscribeScene, isFolded } from '../../utils/sceneStore'

const clamp = THREE.MathUtils.clamp
const damp = THREE.MathUtils.damp

/** Colour / opacity palette per theme (light mode needs darker, lower-glow marks). */
const PALETTE = {
  dark: { particle: '#9db8ff', particleOp: 0.75, line: '#6c93ff', lineOp: 0.15, wire1: '#6c93ff', wire2: '#9b8cff', wire3: '#3cd2ee', wireOp: 0.35, ring: '#6c93ff', halo: 0.5 },
  light: { particle: '#3b5bd6', particleOp: 0.45, line: '#2f5bea', lineOp: 0.13, wire1: '#2f5bea', wire2: '#6a4de0', wire3: '#0e7490', wireOp: 0.24, ring: '#2f5bea', halo: 0.32 },
}

/** Soft radial gradient used for the halo behind the avatar. */
function makeHaloTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d').createRadialGradient(128, 128, 8, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.28)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  const ctx = c.getContext('2d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ───────────────────────── Background: particles, network, wireframes ───────────────────────── */
function Backdrop({ theme, mode, reduced }) {
  const root = useRef()
  const pts = useRef()
  const lines = useRef()
  const wires = useRef([])
  const lite = mode === 'lite'
  const pal = PALETTE[theme]
  const viewport = useThree((s) => s.viewport)
  const wireScaleRef = useRef(1)

  const { particlePos, linePos, nodePos } = useMemo(() => {
    const rnd = (a, b) => a + Math.random() * (b - a)
    const count = lite ? 140 : 520
    const particlePos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      particlePos[i * 3] = rnd(-13, 13)
      particlePos[i * 3 + 1] = rnd(-8, 8)
      particlePos[i * 3 + 2] = rnd(-9, 3)
    }
    // Network of nodes joined by thin lines when close together (software-architecture motif).
    const nodes = lite ? 0 : 30
    const nodePos = new Float32Array(nodes * 3)
    for (let i = 0; i < nodes; i++) {
      nodePos[i * 3] = rnd(-10, 10); nodePos[i * 3 + 1] = rnd(-6, 6); nodePos[i * 3 + 2] = rnd(-6, -1)
    }
    const seg = []
    for (let i = 0; i < nodes; i++) {
      for (let j = i + 1; j < nodes; j++) {
        const d = Math.hypot(nodePos[i * 3] - nodePos[j * 3], nodePos[i * 3 + 1] - nodePos[j * 3 + 1], nodePos[i * 3 + 2] - nodePos[j * 3 + 2])
        if (d < 3.9) seg.push(nodePos[i * 3], nodePos[i * 3 + 1], nodePos[i * 3 + 2], nodePos[j * 3], nodePos[j * 3 + 1], nodePos[j * 3 + 2])
      }
    }
    return { particlePos, linePos: new Float32Array(seg), nodePos }
  }, [lite])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = reduced ? 0 : state.clock.elapsedTime
    const scrollN = window.scrollY / Math.max(1, window.innerHeight)
    const fade = THREE.MathUtils.lerp(1, 0.4, clamp(scrollN / 1.0, 0, 1)) // calmer once past the hero
    const g = root.current
    if (g) {
      g.rotation.y = damp(g.rotation.y, t * 0.02 + sceneStore.pointer.x * 0.06 + scrollN * 0.12, 2, dt)
      g.rotation.x = damp(g.rotation.x, sceneStore.pointer.y * 0.03 + scrollN * 0.04, 2, dt)
      g.position.y = damp(g.position.y, scrollN * 1.1, 3, dt) // parallax: backdrop drifts up slower than content
    }
    if (pts.current) pts.current.material.opacity = pal.particleOp * fade
    if (lines.current) lines.current.material.opacity = pal.lineOp * fade
    wires.current.forEach((w, i) => {
      if (!w) return
      w.rotation.x = t * (0.06 + i * 0.02)
      w.rotation.y = t * (0.09 - i * 0.015)
      w.material.opacity = pal.wireOp * fade * fade * wireScaleRef.current
    })
  })

  // Decorative shapes are placed as fractions of the visible area so they stay on-screen on any aspect.
  const sc = Math.min(1, viewport.width / 11)
  const portrait = viewport.width < viewport.height
  // On portrait screens the text spans the whole width, so shapes move to the margins and get quieter.
  const place = (fx, fy) => [fx * viewport.width * 0.5, fy * viewport.height * 0.5, 0]
  wireScaleRef.current = portrait ? 0.4 : 1

  return (
    <group ref={root}>
      <points ref={pts}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePos, 3]} />
        </bufferGeometry>
        <pointsMaterial color={pal.particle} size={lite ? 0.05 : 0.04} sizeAttenuation transparent opacity={pal.particleOp} depthWrite={false} />
      </points>

      {!lite && linePos.length > 0 && (
        <>
          <lineSegments ref={lines}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={pal.line} transparent opacity={pal.lineOp} depthWrite={false} />
          </lineSegments>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[nodePos, 3]} />
            </bufferGeometry>
            <pointsMaterial color={pal.line} size={0.09} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
          </points>
        </>
      )}

      <group position={place(portrait ? 0.7 : 0.58, portrait ? 0.78 : 0.02)} scale={portrait ? sc * 0.55 : sc} position-z={-5}>
        <Float speed={reduced ? 0 : 1.1} rotationIntensity={0} floatIntensity={0.7}>
          <mesh ref={(el) => { wires.current[0] = el }}>
            <icosahedronGeometry args={[1.9, 1]} />
            <meshBasicMaterial color={pal.wire1} wireframe transparent opacity={pal.wireOp} depthWrite={false} />
          </mesh>
        </Float>
      </group>
      {!lite && (
        <>
          <group position={place(0.1, 0.78)} scale={sc} position-z={-3.5}>
            <Float speed={reduced ? 0 : 1.4} rotationIntensity={0} floatIntensity={0.6}>
              <mesh ref={(el) => { wires.current[1] = el }}>
                <octahedronGeometry args={[0.8, 0]} />
                <meshBasicMaterial color={pal.wire2} wireframe transparent opacity={pal.wireOp} depthWrite={false} />
              </mesh>
            </Float>
          </group>
          <group position={place(0.9, 0.62)} scale={sc} position-z={-4}>
            <Float speed={reduced ? 0 : 1.2} rotationIntensity={0} floatIntensity={0.5}>
              <mesh ref={(el) => { wires.current[2] = el }}>
                <torusGeometry args={[0.55, 0.16, 10, 28]} />
                <meshBasicMaterial color={pal.wire3} wireframe transparent opacity={pal.wireOp} depthWrite={false} />
              </mesh>
            </Float>
          </group>
        </>
      )}
    </group>
  )
}

/* ───────────────────────── Avatar placement, lights, stage ───────────────────────── */
function AvatarRig({ theme, mode, reduced, shared }) {
  const group = useRef()
  const inner = useRef()
  const ring = useRef()
  const scan = useRef()
  const halo = useRef()
  const rim = useRef()
  const pal = PALETTE[theme]
  const haloTex = useMemo(makeHaloTexture, [])
  useEffect(() => () => haloTex.dispose(), [haloTex])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = shared.current
    const a = sceneStore.anchor
    const g = group.current
    if (!g) return
    g.visible = a.visible && a.h > 0
    if (!g.visible) return

    // Intro: reveal from feet to head after a short delay (instant for reduced motion).
    if (reduced) s.reveal = 1
    else s.reveal = Math.min(1, s.reveal + (state.clock.elapsedTime > 0.5 ? Math.min(delta, 0.2) / 2.4 : 0))
    s.revealEase = 1 - (1 - s.reveal) ** 3

    // Hover → "move into focus": brighter rim light, halo and a slight scale-up.
    const targetFocus = sceneStore.heroHover ? 1 : 0.55
    s.focus = reduced ? targetFocus : damp(s.focus, targetFocus, 4, dt)

    // Map the DOM stage rectangle (CSS px) onto the z=0 plane in world units.
    const { size, camera } = state
    const wpp = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z) / size.height
    const fit = Math.min((a.h * 0.8 * wpp) / AVATAR_H, (a.w * 0.98 * wpp) / 3.9)
    g.scale.setScalar(fit)
    g.position.set((a.cx - size.width / 2) * wpp, -(a.cy - size.height / 2) * wpp - (AVATAR_H * fit) / 2 + a.h * 0.02 * wpp, 0)
    if (inner.current) inner.current.scale.setScalar(1 + 0.035 * s.focus)

    // Clipping plane (world space): everything above the scan height is hidden until revealed.
    s.clipPlane.constant = g.position.y + s.revealEase * AVATAR_H * fit * 1.06 + 0.02

    if (scan.current) {
      scan.current.visible = s.reveal < 1
      scan.current.position.y = s.revealEase * AVATAR_H * 1.02
      scan.current.material.opacity = (1 - s.reveal) * 0.9
    }
    if (halo.current) halo.current.material.opacity = (pal.halo * (0.55 + s.focus * 0.75)) * Math.min(1, s.revealEase * 1.4)
    if (ring.current) {
      ring.current.rotation.z += reduced ? 0 : dt * 0.25
      ring.current.material.opacity = (0.35 + s.focus * 0.45) * s.revealEase
    }
    if (rim.current) rim.current.intensity = 0.8 + s.focus * 2.2

    // Stay in sync with the manual / scroll fold state for any consumers reading the store.
    s.fold = isFolded() ? 1 : 0
  })

  return (
    <>
      {/* Lighting: soft key, cool rim from behind (intensity follows focus), violet fill. */}
      <hemisphereLight args={[theme === 'dark' ? '#cfd9ff' : '#ffffff', theme === 'dark' ? '#1a2038' : '#c5cde4', theme === 'dark' ? 0.85 : 1.1]} />
      <directionalLight position={[3, 5, 6]} intensity={theme === 'dark' ? 2.1 : 2.4} />
      <directionalLight ref={rim} position={[-4, 3, -4]} color={theme === 'dark' ? '#6c93ff' : '#7c8cff'} intensity={1.5} />
      <pointLight position={[3, 1, 3]} color="#9b8cff" intensity={theme === 'dark' ? 6 : 3} distance={14} />

      <group ref={group}>
        {/* Stage: faint platform ring + halo (sprite) behind her */}
        <sprite ref={halo} position={[0, AVATAR_H * 0.52, -0.8]} scale={[5.2, 5.2, 1]}>
          <spriteMaterial map={haloTex} color={pal.ring} transparent opacity={0} depthWrite={false} />
        </sprite>
        <mesh ref={ring} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.0, 64, 1, 0, Math.PI * 1.7]} />
          <meshBasicMaterial color={pal.ring} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.35, 48]} />
          <meshBasicMaterial color={pal.ring} transparent opacity={theme === 'dark' ? 0.08 : 0.07} depthWrite={false} />
        </mesh>
        {/* Reveal scan ring that sweeps up the body during the entrance */}
        <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.012, 8, 48]} />
          <meshBasicMaterial color="#3cd2ee" transparent opacity={0.9} depthWrite={false} />
        </mesh>

        <group ref={inner}>
          <ProfessionalAvatar theme={theme} reduced={reduced} shared={shared} />
        </group>
        {mode === 'full' && <FloatingSkills skills={orbitSkills} theme={theme} shared={shared} reduced={reduced} />}
      </group>
    </>
  )
}

/** Keeps a `frameloop="demand"` canvas (reduced motion) up to date when the DOM-driven state changes. */
function DemandInvalidator({ enabled, deps }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!enabled) return undefined
    const un = subscribeScene(invalidate)
    invalidate()
    return un
  }, [enabled, invalidate])
  useEffect(() => { if (enabled) invalidate() }, [enabled, invalidate, deps])
  return null
}

export default function HeroScene({ theme, mode, reduced, onReady, onError }) {
  // Mutable values shared by the avatar, rig and floating badges (updated every frame, so not React state).
  const shared = useRef({
    reveal: 0, revealEase: 0, focus: 0.55, fold: 0,
    clipPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
  })
  const lite = mode === 'lite'

  return (
    <Canvas
      dpr={lite ? 1 : [1, 1.5]}
      camera={{ position: [0, 0, 12], fov: 35, near: 0.1, far: 60 }}
      gl={{ alpha: true, antialias: !lite, powerPreference: lite ? 'low-power' : 'high-performance' }}
      frameloop={reduced ? 'demand' : 'always'}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true // required for the feet-to-head reveal
        gl.setClearColor(0x000000, 0)
        gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onError?.() })
        sceneStore.ready = true
        onReady?.()
      }}
    >
      <DemandInvalidator enabled={reduced} deps={theme} />
      <Backdrop theme={theme} mode={mode} reduced={reduced} />
      <AvatarRig theme={theme} mode={mode} reduced={reduced} shared={shared} />
    </Canvas>
  )
}
