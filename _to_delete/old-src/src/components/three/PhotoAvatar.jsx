import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sceneStore } from '../../utils/sceneStore'
import { AVATAR_H } from './ProfessionalAvatar'

const damp = THREE.MathUtils.damp
const clamp = THREE.MathUtils.clamp

const ASPECT = 1024 / 1536
const W = AVATAR_H * ASPECT
// Dark copies stacked behind the photo give the cut-out visible thickness when it turns.
const DEPTH_LAYERS = [-0.1, -0.2, -0.3, -0.4]

function makeBodyDepthGeometry() {
  const geometry = new THREE.PlaneGeometry(W, AVATAR_H, 64, 96)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i) / W
    const y = position.getY(i) / AVATAR_H + 0.5
    const bump = (cx, cy, rx, ry, depth) => {
      const dx = (x - cx) / rx
      const dy = (y - cy) / ry
      return depth * Math.exp(-2.4 * (dx * dx + dy * dy))
    }
    const depth =
      bump(0.5, 0.84, 0.105, 0.09, 0.42) + // head
      bump(0.5, 0.64, 0.19, 0.13, 0.5) + // shoulders and chest
      bump(0.5, 0.48, 0.15, 0.12, 0.34) + // waist
      bump(0.39, 0.28, 0.09, 0.21, 0.22) + // left leg
      bump(0.61, 0.28, 0.09, 0.21, 0.22) + // right leg
      bump(0.29, 0.57, 0.08, 0.22, 0.18) + // left arm
      bump(0.71, 0.57, 0.08, 0.22, 0.18) // right arm
    position.setZ(i, depth)
  }
  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

/**
 * The profile portrait on a gently sculpted, extruded body surface. The supplied PNG remains the
 * front texture so the person's appearance stays unchanged while the silhouette gains depth.
 */
export default function PhotoAvatar({ reduced, shared }) {
  const tilt = useRef()
  const pose = useRef({ yaw: 0, pitch: 0 })
  const [tex, setTex] = useState(null)
  const bodyGeometry = useMemo(makeBodyDepthGeometry, [])
  useEffect(() => () => bodyGeometry.dispose(), [bodyGeometry])

  useEffect(() => {
    let alive = true
    let loaded
    new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}profile.png`, (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      if (!alive) { t.dispose(); return }
      loaded = t
      setTex(t)
    })
    return () => { alive = false; loaded?.dispose() }
  }, [])

  const mats = useMemo(() => {
    if (!tex) return null
    const clippingPlanes = [shared.current.clipPlane]
    const base = {
      map: tex, transparent: true, depthWrite: false, toneMapped: false, clippingPlanes,
      roughness: 0.82, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.55,
    }
    return {
      front: new THREE.MeshStandardMaterial(base),
      back: new THREE.MeshStandardMaterial({ ...base, color: '#070b16', opacity: 0.85, emissiveIntensity: 0.08 }),
    }
  }, [tex, shared])
  useEffect(() => () => { mats?.front.dispose(); mats?.back.dispose() }, [mats])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = reduced ? 0 : state.clock.elapsedTime
    const a = sceneStore.anchor
    const p = pose.current
    // Pointer position relative to where the avatar sits on screen → turn toward it.
    const ax = (a.cx / window.innerWidth) * 2 - 1
    const ay = -((a.cy / window.innerHeight) * 2 - 1)
    const dx = clamp((sceneStore.pointer.x - ax) * 0.9, -0.6, 0.6)
    const dy = clamp((sceneStore.pointer.y - ay) * 0.5, -0.3, 0.3)
    p.yaw = reduced ? 0 : damp(p.yaw, dx, 4.5, dt)
    p.pitch = reduced ? 0 : damp(p.pitch, -dy, 4.5, dt)
    if (tilt.current) {
      tilt.current.rotation.y = p.yaw + Math.sin(t * 0.45) * 0.03
      tilt.current.rotation.x = p.pitch * 0.5
      tilt.current.position.y = AVATAR_H / 2 + Math.sin(t * 1.5) * 0.015
    }
  })

  if (!mats) return null
  return (
    <group ref={tilt} position={[0, AVATAR_H / 2, 0]}>
      {DEPTH_LAYERS.map((z) => (
        <mesh key={z} position={[0, 0, z]} material={mats.back} renderOrder={1}>
          <planeGeometry args={[W, AVATAR_H]} />
        </mesh>
      ))}
      <mesh geometry={bodyGeometry} material={mats.front} renderOrder={2}>
      </mesh>
    </group>
  )
}
