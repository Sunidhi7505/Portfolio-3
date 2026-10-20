import { useMemo } from 'react'
import * as THREE from 'three'
import { ringPoint, frameAt, profile } from '../path'
import { getAssets, getTunnelGeometry } from '../assets'
import { rand, fbm } from '../noise'
import { triplanarStandard } from '../triplanar'

const _o = new THREE.Object3D()

/** Cone with a jittered, faceted silhouette — shared by stalactites and stalagmites. */
function spikeGeometry() {
  const g = new THREE.ConeGeometry(0.5, 1, 7, 4, true)
  g.translate(0, 0.5, 0) // base at the origin, tip at y = 1
  const p = g.attributes.position, r = rand(7)
  for (let i = 0; i < p.count; i++) {
    const k = 1 + (r() - 0.5) * 0.45
    p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k)
  }
  g.computeVertexNormals()
  return g
}
function rockGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 2)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    // displacement is a pure function of position, so duplicated vertices move together (no cracks)
    const k = 0.7 + fbm(x * 1.7 + 4, y * 1.7 + z * 1.3, 3) * 0.6
    p.setXYZ(i, x * k, y * k * 0.7, z * k)
  }
  g.computeVertexNormals()
  return g
}

/** The cave itself: a displaced tube swept along the path, plus instanced stalactites / stalagmites / boulders. */
export default function Tunnel({ quality = 'full', hide = '' }) {
  const lite = quality === 'lite'
  const { geo, mat, spikes, rocks } = useMemo(() => {
    const { rock } = getAssets()
    const geo = getTunnelGeometry(quality)
    const mat = triplanarStandard({ map: rock.map, normalMap: rock.normalMap, scale: 0.26, normalScale: 1.5, color: '#aa9e92' })
    const r = rand(2024)
    const fr = frameAt(0), p = new THREE.Vector3()
    const spikes = [], rocks = []
    const count = lite ? 70 : 150
    for (let i = 0; i < count; i++) {
      const u = 0.02 + r() * 0.97
      const { ry } = profile(u)
      // ceiling spikes
      frameAt(u, fr)
      ringPoint(u, Math.PI * (0.22 + 0.56 * r()), p, fr)
      const len = 0.5 + r() * 1.9 * (ry / 4)
      spikes.push({ pos: p.clone().addScaledVector(fr.u, 0.1), len, w: len * (0.22 + r() * 0.16), down: true })
      // floor spikes (fewer, near the walls so they never block the path)
      if (r() < 0.55) {
        const th = r() < 0.5 ? Math.PI * (1.05 + 0.1 * r()) : Math.PI * (1.85 - 0.1 * r())
        ringPoint(u, th, p, fr)
        if (p.y - fr.c.y < -1) spikes.push({ pos: p.clone(), len: 0.4 + r() * 1.0, w: 0.2 + r() * 0.25, down: false })
      }
      // boulders hugging the side walls
      if (r() < 0.7) {
        const side = r() < 0.5 ? 1 : -1
        ringPoint(u, side > 0 ? Math.PI * (1.9 + 0.1 * r()) : Math.PI * (1.1 - 0.1 * r()), p, fr)
        rocks.push({ pos: p.clone().addScaledVector(fr.r, -side * 0.2), s: 0.25 + r() * 0.5, rot: r() * 6 })
      }
    }
    return { geo, mat, spikes, rocks }
  }, [lite])

  const spikeGeo = useMemo(spikeGeometry, [])
  const rockGeo = useMemo(rockGeometry, [])

  const spikeMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(spikeGeo, mat, spikes.length)
    spikes.forEach((s, i) => {
      _o.position.copy(s.pos)
      _o.rotation.set(s.down ? Math.PI : 0, i * 1.7, 0)
      _o.scale.set(s.w * 2, s.len, s.w * 2)
      _o.updateMatrix(); m.setMatrixAt(i, _o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
    m.frustumCulled = false
    return m
  }, [spikes, spikeGeo, mat])

  const rockMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(rockGeo, mat, rocks.length)
    rocks.forEach((s, i) => {
      _o.position.copy(s.pos); _o.position.y -= s.s * 0.1
      _o.rotation.set(0, s.rot, 0); _o.scale.set(s.s * 1.3, s.s, s.s * 1.1)
      _o.updateMatrix(); m.setMatrixAt(i, _o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
    m.frustumCulled = false
    return m
  }, [rocks, rockGeo, mat])

  return (
    <group>
      {!hide.includes('mesh') && <mesh geometry={geo} material={mat} frustumCulled={false} />}
      {!hide.includes('spike') && <primitive object={spikeMesh} />}
      {!hide.includes('rock') && <primitive object={rockMesh} />}
    </group>
  )
}
