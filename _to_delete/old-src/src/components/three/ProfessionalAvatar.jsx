import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { isFolded, sceneStore } from '../../utils/sceneStore'

/**
 * Stylized procedural professional avatar (blazer + trousers), built from Three.js primitives.
 *
 * HONEST NOTE: this is NOT a rigged, skinned mesh with motion-captured animation clips. It is a hierarchy of
 * joints (shoulders, elbows, head) driven by damped procedural poses (relaxed ↔ arms folded). To upgrade to a
 * real rigged GLB later, replace this component with one that loads the model (drei `useGLTF` + `useAnimations`)
 * and maps `isFolded()` / pointer data to your own clips — see README → “Replacing the avatar”.
 *
 * Origin is at the feet; height is AVATAR_H units; she faces +Z (towards the camera).
 */
export const AVATAR_H = 3.4

// Joint targets (radians). `s` is +1 for the arm on screen-right, -1 for screen-left.
const armPose = (s, fold) =>
  fold
    ? { sx: s > 0 ? -0.66 : -0.44, sz: -s * 0.22, ex: -1.88, ey: -s * 1.42 } // arms crossed; right arm layered in front
    : { sx: 0.03, sz: s * 0.1, ex: -0.26, ey: 0 } // relaxed at the sides

const lerp = THREE.MathUtils.lerp
const damp = THREE.MathUtils.damp
const clamp = THREE.MathUtils.clamp

export default function ProfessionalAvatar({ theme, reduced, shared }) {
  const root = useRef()
  const torso = useRef()
  const head = useRef()
  const arms = useRef({ 1: {}, '-1': {} })
  const pose = useRef({ fold: 0, yaw: 0, pitch: 0, bodyYaw: 0 })

  // ── Materials (shared across meshes; clipping plane drives the bottom-to-top reveal) ──
  const mats = useMemo(() => {
    const clippingPlanes = [shared.current.clipPlane]
    const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.04, clippingPlanes, ...extra })
    return {
      skin: std('#dba983', { roughness: 0.75 }),
      hair: std('#1d1722', { roughness: 0.45, metalness: 0.2 }),
      blazer: std('#34457a'),
      lapel: std('#43558f'),
      trousers: std('#222b44'),
      shirt: std('#f4f6fb', { roughness: 0.8 }),
      shoes: std('#10131c', { roughness: 0.35, metalness: 0.2 }),
      eye: new THREE.MeshBasicMaterial({ color: '#1b1b24', clippingPlanes }),
      smile: new THREE.MeshBasicMaterial({ color: '#9a4b4b', clippingPlanes }),
    }
  }, [shared])

  // Theme-aware wardrobe so the silhouette reads on both near-black and light backgrounds.
  useEffect(() => {
    const dark = theme === 'dark'
    mats.blazer.color.set(dark ? '#34457a' : '#1f2d5a')
    mats.lapel.color.set(dark ? '#4a5c98' : '#2b3c72')
    mats.trousers.color.set(dark ? '#262f4c' : '#192034')
  }, [theme, mats])

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  // Profile of the blazer body (radius, height) lathe-revolved, then squashed front-to-back.
  const torsoGeo = useMemo(() => {
    const pts = [[0.001, 0], [0.31, 0], [0.335, 0.1], [0.3, 0.38], [0.345, 0.68], [0.385, 0.86], [0.34, 0.96], [0.14, 1.0], [0.001, 1.0]]
    return new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 32)
  }, [])
  const vNeckGeo = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-0.13, 0.17); s.lineTo(0.13, 0.17); s.lineTo(0, -0.16); s.closePath()
    return new THREE.ShapeGeometry(s)
  }, [])
  useEffect(() => () => { torsoGeo.dispose(); vNeckGeo.dispose() }, [torsoGeo, vNeckGeo])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const p = pose.current
    const a = sceneStore.anchor

    // Smooth pose blend (0 = relaxed, 1 = arms folded). Snaps instantly under reduced motion.
    const targetFold = isFolded() ? 1 : 0
    p.fold = reduced ? targetFold : damp(p.fold, targetFold, 3.4, dt)
    const k = p.fold * p.fold * (3 - 2 * p.fold) // smoothstep easing

    // Pointer → head / body orientation, relative to where the avatar is on screen.
    const ax = (a.cx / window.innerWidth) * 2 - 1
    const ay = -((a.cy / window.innerHeight) * 2 - 1)
    const dx = clamp((sceneStore.pointer.x - ax) * 0.9, -0.55, 0.55)
    const dy = clamp((sceneStore.pointer.y - ay) * 0.35, -0.22, 0.22)
    p.yaw = reduced ? 0 : damp(p.yaw, dx, 4.5, dt)
    p.pitch = reduced ? 0 : damp(p.pitch, -dy, 4.5, dt)
    p.bodyYaw = reduced ? 0 : damp(p.bodyYaw, dx * 0.22, 3, dt)

    // Subtle idle: breathing, weight shift, tiny head drift.
    const idle = reduced ? 0 : 1
    const breathe = Math.sin(t * 1.5) * idle
    if (root.current) root.current.rotation.y = p.bodyYaw + Math.sin(t * 0.45) * 0.035 * idle
    if (torso.current) torso.current.scale.set(1 + breathe * 0.006, 1 + breathe * 0.01, 1 + breathe * 0.006)
    if (head.current) {
      head.current.rotation.y = p.yaw + Math.sin(t * 0.6) * 0.04 * idle
      head.current.rotation.x = p.pitch + Math.sin(t * 0.9) * 0.015 * idle
      head.current.rotation.z = Math.sin(t * 0.5) * 0.015 * idle
    }

    // Arms: blend between the two poses, plus a gentle sway while relaxed.
    for (const s of [1, -1]) {
      const joints = arms.current[s]
      if (!joints.shoulder) continue
      const from = armPose(s, false)
      const to = armPose(s, true)
      const sway = Math.sin(t * 1.1 + (s > 0 ? 0 : 1.7)) * 0.012 * idle * (1 - k)
      joints.shoulder.rotation.set(lerp(from.sx, to.sx, k) + sway, 0, lerp(from.sz, to.sz, k) + breathe * 0.006)
      joints.elbow.rotation.set(lerp(from.ex, to.ex, k), lerp(from.ey, to.ey, k), 0)
    }
  })

  const setArm = (s, key) => (el) => { arms.current[s][key] = el }

  return (
    <group ref={root}>
      {/* Legs (trousers) + shoes */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.15, 0.86, 0]} material={mats.trousers}>
            <cylinderGeometry args={[0.145, 0.108, 1.5, 24]} />
          </mesh>
          <mesh position={[s * 0.15, 0.075, 0.07]} scale={[0.9, 0.52, 1.85]} material={mats.shoes}>
            <sphereGeometry args={[0.13, 20, 14]} />
          </mesh>
        </group>
      ))}
      {/* Pelvis */}
      <mesh position={[0, 1.6, 0]} scale={[1, 1, 0.72]} material={mats.trousers}>
        <cylinderGeometry args={[0.3, 0.3, 0.34, 28]} />
      </mesh>

      {/* Torso: blazer, blouse V and lapels. Pivot at the waist for breathing. */}
      <group ref={torso} position={[0, 1.62, 0]}>
        <mesh geometry={torsoGeo} scale={[1, 1, 0.62]} material={mats.blazer} />
        <mesh geometry={vNeckGeo} position={[0, 0.69, 0.222]} rotation={[0.16, 0, 0]} material={mats.shirt} />
        {/* Blazer buttons */}
        {[0.34, 0.22].map((y) => (
          <mesh key={y} position={[0, y, 0.185]} material={mats.shoes}>
            <sphereGeometry args={[0.018, 10, 10]} />
          </mesh>
        ))}
        {/* Shoulder caps */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.38, 0.9, 0]} scale={[1, 0.9, 0.95]} material={mats.blazer}>
            <sphereGeometry args={[0.115, 20, 16]} />
          </mesh>
        ))}
      </group>

      {/* Neck */}
      <mesh position={[0, 2.7, 0]} material={mats.skin}>
        <cylinderGeometry args={[0.085, 0.095, 0.2, 18]} />
      </mesh>

      {/* Head group pivots at the neck */}
      <group ref={head} position={[0, 2.8, 0]}>
        <mesh position={[0, 0.24, 0]} scale={[0.95, 1.12, 0.98]} material={mats.skin}>
          <sphereGeometry args={[0.26, 36, 28]} />
        </mesh>
        {/* Hair: cap, back volume, low ponytail */}
        <mesh position={[0, 0.27, -0.015]} rotation={[-0.32, 0, 0]} scale={[0.99, 1.13, 1.02]} material={mats.hair}>
          <sphereGeometry args={[0.275, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
        </mesh>
        <mesh position={[0, 0.17, -0.1]} scale={[1, 1.05, 0.9]} material={mats.hair}>
          <sphereGeometry args={[0.24, 28, 20]} />
        </mesh>
        <mesh position={[0, 0.08, -0.3]} material={mats.hair}>
          <sphereGeometry args={[0.095, 18, 14]} />
        </mesh>
        <mesh position={[0, -0.14, -0.32]} rotation={[0.12, 0, 0]} material={mats.hair}>
          <capsuleGeometry args={[0.062, 0.32, 8, 14]} />
        </mesh>
        {/* Face: simple, friendly features */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.093, 0.265, 0.232]} scale={[1, 1.25, 0.5]} material={mats.eye}>
              <sphereGeometry args={[0.027, 12, 12]} />
            </mesh>
            <mesh position={[s * 0.093, 0.325, 0.226]} rotation={[0, 0, -s * 0.12]} material={mats.hair}>
              <boxGeometry args={[0.07, 0.014, 0.014]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.17, 0.238]} rotation={[0, 0, Math.PI]} material={mats.smile}>
          <torusGeometry args={[0.055, 0.0075, 8, 24, Math.PI]} />
        </mesh>
      </group>

      {/* Arms: shoulder joint → upper arm → elbow joint → forearm + hand */}
      {[1, -1].map((s) => (
        <group key={s} ref={setArm(s, 'shoulder')} position={[s * 0.43, 2.5, 0]}>
          <mesh position={[0, -0.28, 0]} material={mats.blazer}>
            <capsuleGeometry args={[0.076, 0.42, 8, 16]} />
          </mesh>
          <group ref={setArm(s, 'elbow')} position={[0, -0.53, 0]} rotation={[0, 0, 0, 'YXZ']}>
            <mesh material={mats.blazer}>
              <sphereGeometry args={[0.07, 14, 12]} />
            </mesh>
            <mesh position={[0, -0.24, 0]} material={mats.blazer}>
              <capsuleGeometry args={[0.064, 0.34, 8, 16]} />
            </mesh>
            <mesh position={[0, -0.44, 0]} material={mats.shirt}>
              <cylinderGeometry args={[0.066, 0.066, 0.04, 16]} />
            </mesh>
            <mesh position={[0, -0.53, 0]} scale={[0.85, 1.15, 0.6]} material={mats.skin}>
              <sphereGeometry args={[0.07, 16, 14]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
