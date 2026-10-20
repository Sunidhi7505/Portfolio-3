import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { U_AT, wallPoint, frameAt, LENGTH } from '../path'
import { getAssets } from '../assets'

/** Wall-torch positions: pairs flanking every chamber + singles in the passages between. */
export function buildTorchSpots() {
  const spots = []
  const add = (u, side, h = 0.4) => {
    const fr = frameAt(u)
    const p = wallPoint(u, side, h)
    p.addScaledVector(fr.r, -side * 0.28)
    spots.push({ pos: p, side, u, seed: spots.length * 1.37 })
  }
  // Entrance: braziers either side of the mouth
  add(0.05, 1, 0.1); add(0.05, -1, 0.1)
  for (let i = 1; i < U_AT.length - 1; i++) {
    add(U_AT[i] - 4.5 / LENGTH, i % 2 ? -1 : 1)
    add(U_AT[i] - 10.5 / LENGTH, i % 2 ? 1 : -1, 0.5)
    add(U_AT[i] + 4.0 / LENGTH, i % 2 ? 1 : -1)
    if (i < U_AT.length - 2) add((U_AT[i] + U_AT[i + 1]) / 2, i % 2 ? 1 : -1, 0.2)
  }
  add(0.985, 1, 0.1); add(0.985, -1, 0.1)
  return spots
}

const FLAME_COL = new THREE.Color('#ffb56a')

export default function Torches({ spots, quality = 'full' }) {
  const POOL = quality === 'lite' ? 5 : 10
  const { flame, glow, wood } = getAssets()
  const lights = useRef([]), flames = useRef([]), glows = useRef([])
  const order = useMemo(() => spots.map((_, i) => i), [spots])
  const tmp = useMemo(() => new THREE.Vector3(), [])

  const handle = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map: wood.map, normalMap: wood.normalMap, color: '#8a6a4a', roughness: 0.9 })
    const iron = new THREE.MeshStandardMaterial({ color: '#2a2220', roughness: 0.55, metalness: 0.7 })
    const emb = new THREE.MeshBasicMaterial({ color: '#ff7a1a' })
    return { m, iron, emb }
  }, [wood])

  useFrame((state) => {
    const cam = state.camera.position, t = state.clock.elapsedTime
    // nearest torches get the real lights; intensity eases to zero by the cutoff so swaps never pop
    order.sort((a, b) => spots[a].pos.distanceToSquared(cam) - spots[b].pos.distanceToSquared(cam))
    for (let k = 0; k < POOL; k++) {
      const L = lights.current[k]; if (!L) continue
      const s = spots[order[k]], d = s.pos.distanceTo(cam)
      const fl = 0.82 + 0.18 * Math.sin(t * 9.3 + s.seed * 5) * Math.sin(t * 5.7 + s.seed) + (Math.sin(t * 23 + s.seed * 9) * 0.06)
      tmp.copy(s.pos); tmp.y += 0.62
      L.position.copy(tmp)
      L.intensity = 90 * fl * (1 - THREE.MathUtils.smoothstep(d, 13, 24))
    }
    spots.forEach((s, i) => {
      const f = flames.current[i], g = glows.current[i]; if (!f) return
      const a = Math.sin(t * 11 + s.seed * 7), b = Math.sin(t * 17.3 + s.seed * 3)
      const sc = 1 + 0.12 * a + 0.07 * b
      f.scale.set(0.5 * sc, 0.95 * (1 + 0.1 * b), 1)
      f.material.rotation = 0.05 * a
      g.scale.setScalar(2.6 + 0.35 * a)
      g.material.opacity = 0.34 + 0.08 * b
    })
  })

  return (
    <group>
      {Array.from({ length: POOL }, (_, k) => (
        <pointLight key={k} ref={(r) => (lights.current[k] = r)} color={FLAME_COL} distance={25} decay={2} intensity={0} />
      ))}
      {spots.map((s, i) => (
        <group key={i} position={s.pos} rotation={[0, 0, -s.side * 0.22]}>
          <mesh material={handle.m} position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.045, 0.06, 0.85, 8]} />
          </mesh>
          <mesh material={handle.iron} position={[0, 0.66, 0]}>
            <cylinderGeometry args={[0.13, 0.06, 0.2, 10, 1, true]} />
          </mesh>
          <mesh material={handle.emb} position={[0, 0.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.1, 10]} />
          </mesh>
          <sprite ref={(r) => (flames.current[i] = r)} position={[0, 1.2, 0]} center={[0.5, 0.5]}>
            <spriteMaterial map={flame} blending={THREE.AdditiveBlending} depthWrite={false} transparent fog={false} />
          </sprite>
          <sprite ref={(r) => (glows.current[i] = r)} position={[0, 1.0, 0]}>
            <spriteMaterial map={glow} color="#ff8a2a" blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.35} fog={false} />
          </sprite>
        </group>
      ))}
    </group>
  )
}
