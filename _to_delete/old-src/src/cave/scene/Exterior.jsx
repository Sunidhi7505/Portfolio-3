import { useMemo } from 'react'
import * as THREE from 'three'
import { getAssets } from '../assets'
import { fbm, rand, smooth } from '../noise'
import { POINTS } from '../path'
import { triplanarStandard } from '../triplanar'
import Waterfall from './Waterfall'

const SUN = new THREE.Vector3(-0.4, 0.8, -0.45).normalize()
const col = (hex) => new THREE.Color(hex)

/** Box that has been roughened into a crag, with baked vertex colours (grass cap, warm rock, shaded base). */
function crag(w, h, d, seed, { top = '#5d9a34', rock = '#b0865a', low = '#6a4a32', sun = SUN, haze = '#b9d3ea', at = [0, 0, 0], hazeNear = 30, hazeFar = 300 } = {}) {
  const g = new THREE.BoxGeometry(w, h, d, 12, 16, 12)
  const p = g.attributes.position
  const cT = col(top), cR = col(rock), cL = col(low), cH = col(haze), c = new THREE.Color()
  const colors = new Float32Array(p.count * 3)
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    const k = Math.min(w, d) * 0.3
    const dx = (fbm(x * 0.09 + seed, y * 0.06 + z * 0.08, 4) - 0.5) * k, dz = (fbm(z * 0.09 + seed + 9, y * 0.06 + x * 0.08, 4) - 0.5) * k
    const edge = smooth(0, 1, Math.min(1, (Math.abs(y) < h / 2 - 0.01 ? 1 : 0.3)))
    x += dx * edge; z += dz * edge; y += (fbm(x * 0.15 + seed, z * 0.15, 3) - 0.5) * 2.2
    p.setXYZ(i, x, y, z)
  }
  g.computeVertexNormals()
  const n = g.attributes.normal
  for (let i = 0; i < p.count; i++) {
    const t = (p.getY(i) / h) + 0.5
    const up = n.getY(i)
    c.copy(cL).lerp(cR, smooth(0.05, 0.5, t) * (0.7 + 0.3 * fbm(p.getX(i) * 0.2, p.getY(i) * 0.1 + p.getZ(i) * 0.2, 3)))
    c.lerp(cT, smooth(0.45, 0.8, up) * smooth(0.35, 0.9, t) * 0.95)
    const lit = 0.68 + 0.5 * Math.max(0, n.getX(i) * sun.x + up * sun.y + n.getZ(i) * sun.z)
    const band = 0.84 + 0.16 * Math.sin(p.getY(i) * 0.55 + fbm(p.getX(i) * 0.1, p.getZ(i) * 0.1, 2) * 6)
    c.multiplyScalar(lit * band * (0.85 + 0.3 * smooth(0, 1, t)))
    const dist = Math.hypot(p.getX(i) + at[0], p.getY(i) * 0.4 + at[1], p.getZ(i) + at[2] )
    c.lerp(cH, smooth(hazeNear, hazeFar, dist) * 0.38)
    colors.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  return g
}

const cragMat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, toneMapped: false })

function Pines({ spots, color = '#2f5a3f' }) {
  const mesh = useMemo(() => {
    const g1 = new THREE.ConeGeometry(0.9, 2.2, 7); g1.translate(0, 2.4, 0)
    const g2 = new THREE.ConeGeometry(0.7, 1.8, 7); g2.translate(0, 3.5, 0)
    const g3 = new THREE.CylinderGeometry(0.12, 0.16, 1.0, 5); g3.translate(0, 0.5, 0)
    const merge = (arr) => {
      const pos = [], idx = []; let off = 0
      arr.forEach((g) => { const ng = g.index ? g : g.toNonIndexed(); const pa = ng.attributes.position
        for (let i = 0; i < pa.count; i++) pos.push(pa.getX(i), pa.getY(i), pa.getZ(i))
        if (ng.index) ng.index.array.forEach((v) => idx.push(v + off)); else for (let i = 0; i < pa.count; i++) idx.push(i + off)
        off += pa.count })
      const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setIndex(idx); return out
    }
    const geo = merge([g1, g2, g3])
    const m = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false }), spots.length)
    const o = new THREE.Object3D(), c = new THREE.Color()
    spots.forEach((s, i) => {
      o.position.set(s[0], s[1], s[2]); o.scale.setScalar(s[3]); o.rotation.y = i; o.updateMatrix(); m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, c.set(color).multiplyScalar(0.7 + ((i * 37) % 10) / 22))
    })
    m.frustumCulled = false
    return m
  }, [spots, color])
  return <primitive object={mesh} />
}

function Bridge() {
  const { wood } = getAssets()
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: wood.map, color: '#a98655', fog: false, toneMapped: false }), [wood])
  const dark = useMemo(() => new THREE.MeshBasicMaterial({ color: '#5c4630', fog: false, toneMapped: false }), [])
  const planks = useMemo(() => Array.from({ length: 82 }, (_, i) => i), [])
  const z0 = 15, z1 = 96
  const sag = (t) => -Math.sin(t * Math.PI) * 2.6
  return (
    <group>
      {planks.map((i) => {
        const t = i / 81
        return <mesh key={i} position={[0, -1.9 + sag(t), z0 + t * (z1 - z0)]} material={mat}><boxGeometry args={[2.8, 0.14, 0.86]} /></mesh>
      })}
      {[-1.5, 1.5].map((x) => (
        <group key={x}>
          {Array.from({ length: 14 }, (_, i) => {
            const t = i / 13
            return <mesh key={i} position={[x, -0.9 + sag(t), z0 + t * (z1 - z0)]} material={dark}><cylinderGeometry args={[0.09, 0.1, 2, 6]} /></mesh>
          })}
          {Array.from({ length: 40 }, (_, i) => {
            const t0 = i / 40, t1 = (i + 1) / 40
            const a = new THREE.Vector3(x, -0.05 + sag(t0), z0 + t0 * (z1 - z0)), b = new THREE.Vector3(x, -0.05 + sag(t1), z0 + t1 * (z1 - z0))
            const mid = a.clone().add(b).multiplyScalar(0.5), len = a.distanceTo(b)
            return (
              <mesh key={i} position={mid} rotation={[Math.atan2(b.y - a.y, -(b.z - a.z)) , 0, 0]} material={dark}>
                <boxGeometry args={[0.05, 0.05, len]} />
              </mesh>
            )
          })}
        </group>
      ))}
    </group>
  )
}

export default function Exterior({ quality = 'full' }) {
  const { rock } = getAssets()
  const ledgeMat = useMemo(() => triplanarStandard({ map: rock.map, normalMap: rock.normalMap, scale: 0.2, normalScale: 1.2, color: '#d9c9b4' }), [rock])
  const g = useMemo(() => {
    const D = (x, y, z) => ({ at: [x, y, z] })
    return {
    sideL: crag(14, 70, 22, 1, D(-15, -36, 12)), sideR: crag(14, 70, 22, 2, D(15, -36, 12)),
    farL: crag(36, 110, 36, 3, D(-48, -4, 130)), farR: crag(34, 90, 34, 4, D(48, -8, 140)), farC: crag(70, 44, 40, 5, { ...D(0, -24, 118), top: '#5d9a34' }),
    mid: crag(80, 60, 40, 6, D(-4, -40, 230)),
    exL: crag(18, 70, 24, 7, { ...D(-18, -36, -12), haze: '#f2b48e', top: '#7a8a52', rock: '#a07a62', sun: new THREE.Vector3(0.1, 0.5, 0.9).normalize() }),
    exR: crag(18, 70, 24, 8, { ...D(18, -36, -12), haze: '#f2b48e', top: '#7a8a52', rock: '#a07a62', sun: new THREE.Vector3(0.1, 0.5, 0.9).normalize() }),
    exFar: crag(120, 70, 50, 9, { ...D(0, -50, -90), haze: '#f2b48e', top: '#807a58', rock: '#9a6f5c', sun: new THREE.Vector3(0.1, 0.5, 0.9).normalize() }),
    }
  }, [])
  const pines = useMemo(() => {
    const r = rand(77), arr = [], n = quality === 'lite' ? 60 : 170
    for (let i = 0; i < n; i++) arr.push([(r() - 0.5) * 420, -44, 130 + r() * 200, 3 + r() * 6])
    return arr
  }, [quality])
  const exit = POINTS[POINTS.length - 1]
  const exitPines = useMemo(() => {
    const r = rand(78), arr = []
    for (let i = 0; i < 60; i++) arr.push([exit.x + (r() - 0.5) * 160, exit.y - 62 + r() * 6, exit.z - 110 - r() * 120, 5 + r() * 7])
    return arr
  }, [exit])
  return (
    <group>
      {/* ───── daylight side: ledge, gorge, bridge, far cliffs ───── */}
      <mesh position={[0, -3.45, 9.5]} material={ledgeMat}><boxGeometry args={[18, 3.1, 13]} /></mesh>
      <mesh geometry={g.sideL} material={cragMat} position={[-15, -36, 12]} />
      <mesh geometry={g.sideR} material={cragMat} position={[15, -36, 12]} />
      <mesh geometry={g.farC} material={cragMat} position={[0, -24, 120]} />
      <mesh geometry={g.farL} material={cragMat} position={[-48, -4, 130]} />
      <mesh geometry={g.farR} material={cragMat} position={[48, -8, 140]} />
      <mesh geometry={g.mid} material={cragMat} position={[-4, -40, 230]} />
      <Bridge />
      <Pines spots={pines} color="#4d7d66" />
      {/* valley floor + river */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -46, 200]}><planeGeometry args={[900, 520]} /><meshBasicMaterial color="#5d8c5b" fog={false} toneMapped={false} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, -45.8, 110]}><planeGeometry args={[22, 260]} /><meshBasicMaterial color="#5aa3c0" fog={false} toneMapped={false} /></mesh>
      <Waterfall position={[-40, -45, 108]} rotation={[0, Math.PI, 0]} width={8} height={98} bright={1.1} tint="#ffffff" fogged={false} mist={9} />
      <Waterfall position={[42, -45, 118]} rotation={[0, Math.PI, 0]} width={7} height={80} bright={1.1} tint="#ffffff" fogged={false} mist={7} />
      <Waterfall position={[-14, -45, 92]} rotation={[0, Math.PI, 0]} width={4} height={43} bright={1.05} tint="#ffffff" fogged={false} mist={5} />

      {/* ───── sunrise side beyond the exit ───── */}
      <mesh position={[exit.x, exit.y - 3.2, exit.z - 8]} material={ledgeMat}><boxGeometry args={[18, 3.1, 14]} /></mesh>
      <mesh geometry={g.exL} material={cragMat} position={[exit.x - 18, exit.y - 36, exit.z - 12]} />
      <mesh geometry={g.exR} material={cragMat} position={[exit.x + 18, exit.y - 36, exit.z - 12]} />
      <mesh geometry={g.exFar} material={cragMat} position={[exit.x, exit.y - 50, exit.z - 90]} />
      <Pines spots={exitPines} color="#4a4a3a" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[exit.x, exit.y - 62, exit.z - 220]}><planeGeometry args={[900, 520]} /><meshBasicMaterial color="#7a6a5a" fog={false} toneMapped={false} /></mesh>
    </group>
  )
}
