import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CHAMBER_IDS, LENGTH, U_AT, UP, chamberFrames, frameAt, profile, ringPoint, wallPoint } from '../path'
import { getAssets, groundAt } from '../assets'
import { fbm, rand } from '../noise'
import { triplanarStandard } from '../triplanar'
import Waterfall from './Waterfall'

/* ───────────────────────── materials ───────────────────────── */
function useMats() {
  const { wood, rock } = getAssets()
  return useMemo(() => {
    const std = (o) => new THREE.MeshStandardMaterial(o)
    return {
      wood: std({ map: wood.map, normalMap: wood.normalMap, color: '#a07c54', roughness: 0.86 }),
      woodDark: std({ map: wood.map, normalMap: wood.normalMap, color: '#5d4530', roughness: 0.9 }),
      iron: std({ color: '#2b2523', metalness: 0.8, roughness: 0.5 }),
      brass: std({ color: '#b98a3c', metalness: 0.9, roughness: 0.32, emissive: '#2a1704' }),
      stone: triplanarStandard({ map: rock.map, normalMap: rock.normalMap, scale: 0.4, normalScale: 1.2, color: '#a89a8a' }),
      parchment: std({ color: '#d9c79a', roughness: 1, emissive: '#2a1d0a' }),
      red: std({ color: '#7d2b22', roughness: 0.95, side: THREE.DoubleSide }),
      teal: std({ color: '#2b5e63', roughness: 0.95, side: THREE.DoubleSide }),
      ochre: std({ color: '#a47a2c', roughness: 0.95, side: THREE.DoubleSide }),
      amber: std({ color: '#ffb24a', emissive: '#ff8a1a', emissiveIntensity: 1.5, roughness: 0.25, transparent: true, opacity: 0.93 }),
      cyan: std({ color: '#7ee8d8', emissive: '#27c9b4', emissiveIntensity: 1.3, roughness: 0.25, transparent: true, opacity: 0.9 }),
      leaf: std({ color: '#5b8a38', emissive: '#1b3410', emissiveIntensity: 0.9, roughness: 1, side: THREE.DoubleSide }),
      vine: std({ color: '#3c4e26', roughness: 1 }),
      ember: new THREE.MeshBasicMaterial({ color: '#ff8a2a' }),
    }
  }, [wood, rock])
}

/* ───────────────────────── placement helpers ───────────────────────── */
const _p = new THREE.Vector3()
function wallLat(u, side) {
  const fr = frameAt(u)
  return wallPoint(u, side, -0.8, _p).clone().sub(fr.c).dot(fr.r)
}
/** Resolve a placement descriptor to world position + yaw. wall: +1/-1 = hug that wall, 0 = free-standing at lateral `inset`. */
function place(u, wall, inset, y = 0, mounted = false) {
  const fr = frameAt(u)
  let pos, yaw
  if (wall !== 0) {
    if (mounted) { pos = wallPoint(u, wall, y).clone().addScaledVector(fr.r, -wall * inset) }
    else {
      const lat = wallLat(u, wall) - wall * inset
      pos = fr.c.clone().addScaledVector(fr.r, lat); pos.y = groundAt(pos.x, fr.c.y, pos.z) + y
    }
    const d = fr.r.clone().multiplyScalar(-wall)
    yaw = Math.atan2(d.x, d.z)
  } else {
    pos = fr.c.clone().addScaledVector(fr.r, inset); pos.y = groundAt(pos.x, fr.c.y, pos.z) + y
    yaw = Math.atan2(-fr.t.x, -fr.t.z)
  }
  return { pos, yaw }
}

/* ───────────────────────── prop components (local space, +z = front) ───────────────────────── */
const B = ({ args, p = [0, 0, 0], r, m }) => <mesh position={p} rotation={r} material={m}><boxGeometry args={args} /></mesh>

function Barrel({ m }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} material={m.wood}><cylinderGeometry args={[0.38, 0.38, 1, 12]} /></mesh>
      {[0.2, 0.8].map((y) => <mesh key={y} position={[0, y, 0]} material={m.iron}><cylinderGeometry args={[0.395, 0.395, 0.06, 12]} /></mesh>)}
    </group>
  )
}
function Crate({ m, s = 1 }) {
  return (
    <group scale={s}>
      <B args={[0.9, 0.9, 0.9]} p={[0, 0.45, 0]} m={m.wood} />
      {[-0.45, 0.45].map((x) => <B key={x} args={[0.07, 0.95, 0.95]} p={[x, 0.45, 0]} m={m.woodDark} />)}
      <B args={[0.95, 0.07, 0.95]} p={[0, 0.9, 0]} m={m.woodDark} />
    </group>
  )
}
function Chest({ m }) {
  return (
    <group>
      <B args={[1.3, 0.6, 0.75]} p={[0, 0.3, 0]} m={m.wood} />
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]} material={m.wood}><cylinderGeometry args={[0.375, 0.375, 1.3, 12, 1, false, 0, Math.PI]} /></mesh>
      {[-0.4, 0.4].map((x) => <B key={x} args={[0.08, 0.98, 0.8]} p={[x, 0.42, 0]} m={m.iron} />)}
      <B args={[0.14, 0.16, 0.06]} p={[0, 0.55, 0.39]} m={m.brass} />
    </group>
  )
}
function Table({ m, scrolls = true }) {
  return (
    <group>
      <B args={[1.9, 0.12, 0.95]} p={[0, 0.82, 0]} m={m.wood} />
      {[[-0.82, -0.38], [0.82, -0.38], [-0.82, 0.38], [0.82, 0.38]].map(([x, z], i) => <B key={i} args={[0.1, 0.8, 0.1]} p={[x, 0.4, z]} m={m.woodDark} />)}
      {scrolls && <>
        <mesh position={[-0.4, 0.95, 0.1]} rotation={[0, 0.5, Math.PI / 2]} material={m.parchment}><cylinderGeometry args={[0.07, 0.07, 0.6, 10]} /></mesh>
        <mesh position={[0.1, 0.89, -0.1]} rotation={[-Math.PI / 2, 0, 0.2]} material={m.parchment}><planeGeometry args={[0.6, 0.42]} /></mesh>
        <mesh position={[0.62, 0.99, 0.12]} material={m.parchment}><cylinderGeometry args={[0.04, 0.04, 0.22, 8]} /></mesh>
      </>}
    </group>
  )
}
function Anvil({ m }) {
  return (
    <group>
      <mesh position={[0, 0.3, 0]} material={m.woodDark}><cylinderGeometry args={[0.32, 0.4, 0.6, 10]} /></mesh>
      <B args={[0.9, 0.2, 0.34]} p={[0, 0.7, 0]} m={m.iron} />
      <B args={[0.3, 0.14, 0.3]} p={[0, 0.58, 0]} m={m.iron} />
      <mesh position={[0.6, 0.72, 0]} rotation={[0, 0, -Math.PI / 2]} material={m.iron}><coneGeometry args={[0.12, 0.35, 8]} /></mesh>
    </group>
  )
}
function Workbench({ m }) {
  return (
    <group>
      <B args={[2.4, 0.14, 0.9]} p={[0, 0.95, 0]} m={m.wood} />
      {[-1.05, 1.05].map((x) => <B key={x} args={[0.12, 0.95, 0.8]} p={[x, 0.47, 0]} m={m.woodDark} />)}
      <B args={[2.2, 0.08, 0.7]} p={[0, 0.4, 0]} m={m.woodDark} />
      <Anvil m={m} />
      <mesh position={[0.5, 1.05, 0.1]} rotation={[0, 0.4, 0]} material={m.iron}><boxGeometry args={[0.5, 0.08, 0.1]} /></mesh>
      <mesh position={[-0.6, 1.1, 0]} material={m.brass}><torusGeometry args={[0.16, 0.04, 8, 16]} /></mesh>
    </group>
  )
}
function Books({ w, h, rows, seed }) {
  const mesh = useMemo(() => {
    const r = rand(seed), items = []
    const cols = ['#6b2d24', '#3f4f3a', '#6e5328', '#2f3c4c', '#7a4a2a', '#4c2f3c', '#8a7048', '#3a3a30']
    for (let row = 0; row < rows; row++) {
      let x = -w / 2 + 0.08
      while (x < w / 2 - 0.12) {
        const bw = 0.05 + r() * 0.08, bh = (h / rows) * (0.55 + r() * 0.35)
        items.push({ x: x + bw / 2, y: 0.12 + row * (h / rows) + bh / 2, bw, bh, c: cols[Math.floor(r() * cols.length)], tilt: r() < 0.08 ? 0.25 : 0 })
        x += bw + 0.008
      }
    }
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.9 }), items.length)
    const o = new THREE.Object3D(), c = new THREE.Color()
    items.forEach((it, i) => { o.position.set(it.x, it.y, 0); o.rotation.set(0, 0, it.tilt); o.scale.set(it.bw, it.bh, 0.3); o.updateMatrix(); m.setMatrixAt(i, o.matrix); m.setColorAt(i, c.set(it.c)) })
    return m
  }, [w, h, rows, seed])
  return <primitive object={mesh} />
}
function Shelf({ m, w = 2.2, h = 3.2, rows = 4, seed = 1 }) {
  return (
    <group>
      <B args={[w, h, 0.08]} p={[0, h / 2, -0.17]} m={m.woodDark} />
      {[-w / 2, w / 2].map((x) => <B key={x} args={[0.1, h, 0.42]} p={[x, h / 2, 0]} m={m.wood} />)}
      {Array.from({ length: rows + 1 }, (_, i) => <B key={i} args={[w, 0.07, 0.42]} p={[0, 0.1 + (i * (h - 0.1)) / rows, 0]} m={m.wood} />)}
      {Array.from({ length: rows }, (_, i) => <group key={i} position={[0, 0.06 + (i * (h - 0.1)) / rows, -0.02]}><Books w={w} h={(h - 0.1) / rows} rows={1} seed={seed * 10 + i} /></group>)}
    </group>
  )
}
function ScrollRack({ m, w = 2, h = 2.6 }) {
  const items = useMemo(() => Array.from({ length: 18 }, (_, i) => ({ x: ((i % 6) - 2.5) * 0.3, y: 0.5 + Math.floor(i / 6) * 0.7 })), [])
  return (
    <group>
      <B args={[w, h, 0.12]} p={[0, h / 2, -0.1]} m={m.woodDark} />
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, it.y, 0.02]} rotation={[0.1, 0, Math.PI / 2 + 0.05 * (i % 3)]} material={m.parchment}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        </mesh>
      ))}
    </group>
  )
}
function Gear({ m, r = 1.3, teeth = 14, speed = 0.18, mat = 'brass' }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * speed })
  const tooth = useMemo(() => Array.from({ length: teeth }, (_, i) => i / teeth * Math.PI * 2), [teeth])
  return (
    <group ref={ref}>
      <mesh material={m[mat]}><torusGeometry args={[r, r * 0.09, 8, 36]} /></mesh>
      <mesh material={m[mat]}><cylinderGeometry args={[r * 0.16, r * 0.16, 0.2, 14]} rotation={[Math.PI / 2, 0, 0]} /></mesh>
      {[0, 1, 2, 3].map((i) => <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]} material={m[mat]}><boxGeometry args={[r * 2, r * 0.08, 0.1]} /></mesh>)}
      {tooth.map((a, i) => <mesh key={i} position={[Math.cos(a) * (r + r * 0.1), Math.sin(a) * (r + r * 0.1), 0]} rotation={[0, 0, a]} material={m[mat]}><boxGeometry args={[r * 0.22, r * 0.17, 0.2]} /></mesh>)}
    </group>
  )
}
function Crystals({ m, kind = 'amber', n = 6, s = 1 }) {
  const { glow } = getAssets()
  const items = useMemo(() => { const r = rand(n * 7); return Array.from({ length: n }, () => ({ x: (r() - 0.5) * 0.9, z: (r() - 0.5) * 0.7, h: 0.6 + r() * 1.1, w: 0.1 + r() * 0.12, tx: (r() - 0.5) * 0.5, tz: (r() - 0.5) * 0.5 })) }, [n])
  const col = kind === 'amber' ? '#ffa43a' : '#4fe6d2'
  return (
    <group scale={s}>
      {items.map((c, i) => (
        <mesh key={i} position={[c.x, c.h / 2, c.z]} rotation={[c.tx, 0, c.tz]} material={m[kind === 'amber' ? 'amber' : 'cyan']}>
          <coneGeometry args={[c.w, c.h, 6]} />
        </mesh>
      ))}
      <sprite position={[0, 0.7, 0]} scale={[3.4, 3.4, 1]}><spriteMaterial map={glow} color={col} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.4} /></sprite>
    </group>
  )
}
function Banner({ m, kind = 'red', w = 1.1, h = 2.2 }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current) ref.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.8 + w) * 0.015 })
  return (
    <group>
      <mesh position={[0, h + 0.05, 0.03]} rotation={[0, 0, Math.PI / 2]} material={m.woodDark}><cylinderGeometry args={[0.05, 0.05, w + 0.3, 8]} /></mesh>
      <group ref={ref} position={[0, h, 0.04]}>
        <mesh position={[0, -h / 2, 0]} material={m[kind]}><planeGeometry args={[w, h]} /></mesh>
        <mesh position={[0, -h + 0.02, 0]} rotation={[0, 0, Math.PI / 4]} material={m[kind]}><planeGeometry args={[w * 0.7, w * 0.7]} /></mesh>
        <mesh position={[0, -h * 0.4, 0.01]} material={m.brass}><ringGeometry args={[0.18, 0.26, 24]} /></mesh>
      </group>
    </group>
  )
}
function Pedestal({ m }) {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} material={m.stone}><cylinderGeometry args={[0.45, 0.6, 0.8, 8]} /></mesh>
      <mesh position={[0, 0.86, 0]} material={m.brass}><cylinderGeometry args={[0.52, 0.45, 0.1, 8]} /></mesh>
      <group position={[0, 0.9, 0]}><Crystals m={m} kind="amber" n={4} s={0.7} /></group>
    </group>
  )
}
function Arch({ m, w = 3.2 }) {
  return (
    <group>
      {[-w / 2, w / 2].map((x) => <B key={x} args={[0.55, 2.8, 0.7]} p={[x, 1.4, 0]} m={m.stone} />)}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, 0]} material={m.stone}><cylinderGeometry args={[w / 2 + 0.28, w / 2 + 0.28, 0.7, 16, 1, false, 0, Math.PI]} rotation={[Math.PI / 2, 0, 0]} /></mesh>
    </group>
  )
}
function Campfire({ m }) {
  const { flame, glow } = getAssets()
  const fl = useRef([]), light = useRef(), g1 = useRef()
  const stones = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * Math.PI * 2, s: 0.18 + ((i * 7) % 5) * 0.03 })), [])
  useFrame((s) => {
    const t = s.clock.elapsedTime
    fl.current.forEach((f, i) => { if (!f) return; const a = Math.sin(t * (9 + i * 2.1) + i * 3), b = Math.sin(t * (14 + i) + i); f.scale.set(0.9 * (1 + 0.14 * a) * (1 - i * 0.12), 1.7 * (1 + 0.16 * b) * (1 - i * 0.1), 1); f.material.rotation = a * 0.06 })
    if (light.current) light.current.intensity = 190 * (0.85 + 0.12 * Math.sin(t * 11) + 0.06 * Math.sin(t * 27))
    if (g1.current) g1.current.material.opacity = 0.5 + 0.08 * Math.sin(t * 7)
  })
  return (
    <group>
      {stones.map((st, i) => <mesh key={i} position={[Math.cos(st.a) * 0.75, st.s * 0.6, Math.sin(st.a) * 0.75]} material={m.stone} scale={[1.3, 0.8, 1]}><icosahedronGeometry args={[st.s, 1]} /></mesh>)}
      {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.cos(i * 1.26) * 0.25, 0.28, Math.sin(i * 1.26) * 0.25]} rotation={[Math.sin(i * 1.26) * 0.9, 0, -Math.cos(i * 1.26) * 0.9]} material={m.woodDark}><cylinderGeometry args={[0.07, 0.09, 1.2, 7]} /></mesh>)}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m.ember}><circleGeometry args={[0.45, 14]} /></mesh>
      {[0, 1, 2].map((i) => (
        <sprite key={i} ref={(r) => (fl.current[i] = r)} position={[(i - 1) * 0.12, 0.85 - i * 0.08, (i - 1) * 0.06]}>
          <spriteMaterial map={flame} blending={THREE.AdditiveBlending} depthWrite={false} transparent />
        </sprite>
      ))}
      <sprite ref={g1} position={[0, 0.9, 0]} scale={[5.5, 5.5, 1]}><spriteMaterial map={glow} color="#ff8a2a" blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.5} /></sprite>
      <pointLight ref={light} position={[0, 1.1, 0]} color="#ffa24e" distance={24} decay={1.7} intensity={190} />
    </group>
  )
}
function Log({ m }) {
  return <mesh position={[0, 0.25, 0]} rotation={[0, 0, Math.PI / 2]} material={m.woodDark}><cylinderGeometry args={[0.24, 0.26, 1.6, 9]} /></mesh>
}

function signTexture(text) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128
  const x = c.getContext('2d')
  const { wood } = getAssets()
  x.fillStyle = '#6b4f33'; x.fillRect(0, 0, 512, 128)
  x.drawImage(wood.map.image, 0, 0, 512, 128)
  x.fillStyle = 'rgba(30,18,8,.35)'; x.fillRect(0, 0, 512, 128)
  x.strokeStyle = '#2a1a0c'; x.lineWidth = 8; x.strokeRect(4, 4, 504, 120)
  x.fillStyle = '#f3dba6'; x.font = '700 54px Cinzel, Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'
  x.shadowColor = '#000'; x.shadowBlur = 4
  x.fillText(text, 256, 68)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
  return t
}
function Signpost({ m, signs = ['Explore'] }) {
  const tex = useMemo(() => signs.map(signTexture), [signs])
  return (
    <group>
      <mesh position={[0, 1.4, 0]} material={m.woodDark}><cylinderGeometry args={[0.09, 0.12, 2.8, 8]} /></mesh>
      {signs.map((s, i) => (
        <group key={s} position={[0, 2.35 - i * 0.62, 0.1]} rotation={[0, (i % 2 ? -1 : 1) * 0.18, 0]}>
          <mesh><boxGeometry args={[1.5, 0.46, 0.06]} /><meshStandardMaterial map={tex[i]} roughness={0.9} /></mesh>
        </group>
      ))}
    </group>
  )
}

/* ───────────────────────── lanterns (glow sprites + emissive core) ───────────────────────── */
function Lanterns({ spots, m }) {
  const { glow } = getAssets()
  const gl = useRef([])
  useFrame((s) => {
    const t = s.clock.elapsedTime
    gl.current.forEach((g, i) => { if (g) { g.material.opacity = 0.5 + 0.1 * Math.sin(t * 6 + i * 2) + 0.04 * Math.sin(t * 19 + i); g.scale.setScalar(2.1 + 0.15 * Math.sin(t * 4 + i)) } })
  })
  return (
    <>
      {spots.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.5, 0]} material={m.iron}><cylinderGeometry args={[0.012, 0.012, 1, 4]} /></mesh>
          <mesh material={m.iron}><cylinderGeometry args={[0.15, 0.12, 0.34, 6, 1, true]} /></mesh>
          <mesh position={[0, 0.2, 0]} material={m.iron}><coneGeometry args={[0.19, 0.12, 6]} /></mesh>
          <mesh material={m.amber}><sphereGeometry args={[0.09, 8, 8]} /></mesh>
          <sprite ref={(r) => (gl.current[i] = r)}><spriteMaterial map={glow} color="#ffae52" blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.55} /></sprite>
        </group>
      ))}
    </>
  )
}

/* ───────────────────────── vines + mouth rocks ───────────────────────── */
function Vines({ clusters, quality }) {
  const m = useMats()
  const { strands, leaves } = useMemo(() => {
    const r = rand(404), fr = frameAt(0), p = new THREE.Vector3()
    const strands = [], leaves = []
    clusters.forEach(({ u, n, th = [0.18, 0.82], len = [1.3, 3.8] }) => {
      for (let i = 0; i < n; i++) {
        frameAt(u + (r() - 0.5) * (3 / LENGTH), fr)
        ringPoint(u + (r() - 0.5) * (3 / LENGTH), Math.PI * (th[0] + (th[1] - th[0]) * r()), p, fr)
        const L = len[0] + r() * (len[1] - len[0])
        strands.push({ pos: p.clone().addScaledVector(fr.u, -0.15), L })
        const k = Math.floor(L / 0.22)
        for (let j = 1; j <= k; j++) leaves.push({ x: p.x + (r() - 0.5) * 0.35, y: p.y - 0.15 - (j / k) * L, z: p.z + (r() - 0.5) * 0.35, rot: r() * 6, s: 0.16 + r() * 0.14 })
      }
    })
    return { strands, leaves }
  }, [clusters])
  const sm = useMemo(() => {
    const mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.018, 1, 4), m.vine, strands.length), o = new THREE.Object3D()
    strands.forEach((s, i) => { o.position.set(s.pos.x, s.pos.y - s.L / 2, s.pos.z); o.scale.set(1, s.L, 1); o.rotation.set(0, 0, 0); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix) })
    mesh.frustumCulled = false; return mesh
  }, [strands, m])
  const lm = useMemo(() => {
    const g = new THREE.CircleGeometry(0.5, 5); g.scale(0.7, 1.3, 1); g.translate(0, -0.35, 0)
    const mesh = new THREE.InstancedMesh(g, m.leaf, leaves.length), o = new THREE.Object3D(), c = new THREE.Color()
    leaves.forEach((l, i) => {
      o.position.set(l.x, l.y, l.z); o.rotation.set((l.rot % 1) * 0.6 - 0.3, l.rot, (l.rot % 0.7) - 0.35); o.scale.setScalar(l.s * 0.75); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix)
      mesh.setColorAt(i, c.set('#4f7a34').offsetHSL((l.rot % 0.1) - 0.03, 0, ((l.rot * 13) % 0.2) - 0.12))
    })
    mesh.frustumCulled = false; return mesh
  }, [leaves, m])
  void quality
  return <><primitive object={sm} /><primitive object={lm} /></>
}

function MouthRocks({ m }) {
  const mesh = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 0.72 + fbm(x * 1.6 + 4, y * 1.6 + z * 1.2, 3) * 0.55; p.setXYZ(i, x * k, y * k, z * k) }
    g.computeVertexNormals()
    const items = [], r = rand(808), fr = frameAt(0), q = new THREE.Vector3()
    for (let i = 0; i < 16; i++) {
      const th = ((i + r() * 0.6) / 16) * Math.PI * 2
      if (th > Math.PI * 1.1 && th < Math.PI * 1.9) continue
      ringPoint(0, th, q, fr)
      const out = q.clone().sub(fr.c).setY(q.y - fr.c.y).normalize()
      items.push({ pos: q.clone().addScaledVector(out, 0.9 + r() * 0.8).addScaledVector(fr.t, 1.2 + r() * 2.2), s: 0.6 + r() * 0.8 })
    }
    const mm = new THREE.InstancedMesh(g, m.stone, items.length), o = new THREE.Object3D()
    items.forEach((it, i) => { o.position.copy(it.pos); o.scale.setScalar(it.s); o.rotation.set(i, i * 2, 0); o.updateMatrix(); mm.setMatrixAt(i, o.matrix) })
    mm.frustumCulled = false; return mm
  }, [m])
  return <primitive object={mesh} />
}

/* ───────────────────────── interior waterfalls (follow the curved wall) ───────────────────────── */
function WallFall({ u, side, width = 1.8 }) {
  const g = useMemo(() => {
    const fr = frameAt(u), { ry } = profile(u)
    const B = wallPoint(u, side, -1.1).clone().addScaledVector(fr.r, -side * 0.12)
    B.y = groundAt(B.x, fr.c.y, B.z) + 0.02
    const T0 = wallPoint(u, side, ry * 0.78).clone().addScaledVector(fr.r, -side * 0.12)
    // lean only part-way toward the (bulging) wall so the sheet reads as falling water, not a tilted beam
    const T = B.clone().add(T0.clone().sub(B).multiply(new THREE.Vector3(0.3, 1, 0.3)))
    const y = T.clone().sub(B); const height = y.length(); y.normalize()
    const z = fr.r.clone().multiplyScalar(-side); z.addScaledVector(y, -z.dot(y)).normalize()
    const x = new THREE.Vector3().crossVectors(y, z).normalize()
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z))
    return { B, q, height, pool: B.clone().addScaledVector(fr.r, -side * 0.9) }
  }, [u, side])
  return (
    <>
      <Waterfall position={g.B.toArray()} quaternion={g.q} width={width} height={g.height} bright={0.5} tint="#ffb070" pool={false} mist={5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[g.pool.x, g.B.y + 0.04, g.pool.z]}>
        <circleGeometry args={[width * 1.1, 24]} /><meshBasicMaterial color="#5f93a8" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </>
  )
}

/* ───────────────────────── chamber layouts ───────────────────────── */
// w: 'p' = panel wall, 'o' = opposite wall, 'c' = free-standing (inset = lateral metres, + right of travel)
const LAYOUT = {
  about: [
    { t: 'shelf', du: -2.5, w: 'o', inset: 0.15, seed: 1 }, { t: 'shelf', du: 0.5, w: 'o', inset: 0.15, seed: 2 },
    { t: 'table', du: -0.2, w: 'p', inset: 0.9 }, { t: 'barrel', du: 3.6, w: 'p', inset: 0.7 }, { t: 'crate', du: -3.6, w: 'p', inset: 0.7 },
    { t: 'crystals', du: 3.2, w: 'o', inset: 0.9, kind: 'amber', n: 5 },
  ],
  education: [
    { t: 'shelf', du: -3, w: 'o', inset: 0.15, seed: 3 }, { t: 'shelf', du: 0, w: 'o', inset: 0.15, seed: 4 }, { t: 'shelf', du: 3, w: 'o', inset: 0.15, seed: 5 },
    { t: 'table', du: 0.5, w: 'p', inset: 0.9 }, { t: 'chest', du: -3.5, w: 'p', inset: 0.7 }, { t: 'banner', du: 3.6, w: 'p', inset: 0.15, y: 1.9, mounted: true, kind: 'teal' },
  ],
  experience: [
    { t: 'workbench', du: 0.4, w: 'p', inset: 0.9 }, { t: 'gear', du: -2.5, w: 'o', inset: 0.2, y: 1.8, mounted: true, r: 1.6 },
    { t: 'gear', du: 0.8, w: 'o', inset: 0.2, y: 0.4, mounted: true, r: 1.0, speed: -0.28 }, { t: 'barrel', du: -3.5, w: 'p', inset: 0.7 }, { t: 'crate', du: 3.6, w: 'p', inset: 0.7 }, { t: 'crate', du: 3.7, w: 'p', inset: 0.7, y: 0.9, s: 0.7 },
  ],
  skills: [
    { t: 'workbench', du: -0.6, w: 'p', inset: 0.9 }, { t: 'gear', du: -3.4, w: 'o', inset: 0.2, y: 2.0, mounted: true, r: 1.9 }, { t: 'gear', du: 0.8, w: 'o', inset: 0.2, y: 1.2, mounted: true, r: 1.2, speed: -0.3 },
    { t: 'gear', du: 3.4, w: 'o', inset: 0.2, y: 0.3, mounted: true, r: 0.8, speed: 0.4, mat: 'iron' }, { t: 'crystals', du: 3.2, w: 'p', inset: 0.8, kind: 'cyan', n: 7 }, { t: 'barrel', du: -3.6, w: 'p', inset: 0.7 },
  ],
  projects: [
    { t: 'arch', du: -4, w: 'o', inset: 0.5 }, { t: 'chest', du: -2.4, w: 'p', inset: 0.7 }, { t: 'chest', du: 0.6, w: 'p', inset: 0.7 }, { t: 'chest', du: 3, w: 'p', inset: 0.7 },
    { t: 'crystals', du: -0.5, w: 'o', inset: 0.9, kind: 'cyan', n: 8, s: 1.3 }, { t: 'banner', du: 2.2, w: 'o', inset: 0.15, y: 1.9, mounted: true, kind: 'ochre' },
  ],
  certifications: [
    { t: 'scrollrack', du: -3, w: 'o', inset: 0.2 }, { t: 'shelf', du: 0, w: 'o', inset: 0.15, seed: 6 }, { t: 'shelf', du: 3, w: 'o', inset: 0.15, seed: 7 },
    { t: 'table', du: 0.2, w: 'p', inset: 0.9 }, { t: 'barrel', du: 3.6, w: 'p', inset: 0.7 }, { t: 'banner', du: -3.4, w: 'p', inset: 0.15, y: 1.9, mounted: true, kind: 'red' },
  ],
  achievements: [
    { t: 'banner', du: -3.4, w: 'o', inset: 0.15, y: 1.9, mounted: true, kind: 'red' }, { t: 'banner', du: -0.8, w: 'o', inset: 0.15, y: 1.9, mounted: true, kind: 'ochre' }, { t: 'banner', du: 1.8, w: 'o', inset: 0.15, y: 1.9, mounted: true, kind: 'teal' },
    { t: 'pedestal', du: 0.3, w: 'p', inset: 1.0 }, { t: 'crate', du: -3.4, w: 'p', inset: 0.7 }, { t: 'chest', du: 3.6, w: 'p', inset: 0.7 },
  ],
  coding: [
    { t: 'crystals', du: -2.2, w: 'p', inset: 0.9, kind: 'cyan', n: 8, s: 1.5 }, { t: 'crystals', du: 2.8, w: 'o', inset: 0.9, kind: 'amber', n: 6, s: 1.2 }, { t: 'gear', du: 0.4, w: 'o', inset: 0.2, y: 1.6, mounted: true, r: 1.5, speed: 0.22 },
    { t: 'table', du: 0.4, w: 'p', inset: 0.9 }, { t: 'barrel', du: -3.8, w: 'o', inset: 0.7 },
  ],
  contact: [
    { t: 'campfire', du: 4.2, w: 'c', inset: 0 }, { t: 'log', du: 4.2, w: 'c', inset: -1.9 }, { t: 'log', du: 5.4, w: 'c', inset: 1.7 },
    { t: 'signpost', du: 1.4, w: 'p', inset: 0.9, signs: ['The journey continues', 'Contact'] }, { t: 'barrel', du: -3, w: 'o', inset: 0.7 }, { t: 'crate', du: -3.1, w: 'o', inset: 1.7 },
  ],
}

function Item({ it, u, sideP, m }) {
  const wall = it.w === 'p' ? sideP : it.w === 'o' ? -sideP : 0
  const uu = u + (it.du || 0) / LENGTH
  const { pos, yaw } = useMemo(() => place(uu, wall, it.inset ?? 0.7, it.y ?? 0, !!it.mounted), [uu, wall, it.inset, it.y, it.mounted])
  const C = {
    shelf: <Shelf m={m} seed={it.seed} />, table: <Table m={m} />, barrel: <Barrel m={m} />, crate: <Crate m={m} s={it.s || 1} />, chest: <Chest m={m} />,
    crystals: <Crystals m={m} kind={it.kind} n={it.n} s={it.s || 1} />, workbench: <Workbench m={m} />, gear: <Gear m={m} r={it.r} speed={it.speed} mat={it.mat} />,
    banner: <Banner m={m} kind={it.kind} />, arch: <Arch m={m} />, pedestal: <Pedestal m={m} />, scrollrack: <ScrollRack m={m} />,
    campfire: <Campfire m={m} />, log: <Log m={m} />, signpost: <Signpost m={m} signs={it.signs} />,
  }[it.t]
  return <group position={pos} rotation={[0, yaw + (it.yaw || 0), 0]}>{C}</group>
}

export default function Props({ quality = 'full' }) {
  const m = useMats()
  const frames = useMemo(() => chamberFrames(), [])
  const lanterns = useMemo(() => {
    const out = []
    const add = (u, lat, h) => { const fr = frameAt(u); out.push(fr.c.clone().addScaledVector(fr.r, lat).addScaledVector(UP, h)) }
    add(0.02, -3.2, 4.3); add(0.02, 3.2, 4.3); add(0.035, 0, 5)
    CHAMBER_IDS.forEach((id, i) => { if (!i) return; const { rx, ry } = profile(U_AT[i]); add(U_AT[i] - 3 / LENGTH, 0, ry * 0.85); add(U_AT[i] + 3.5 / LENGTH, rx * 0.35, ry * 0.8) })
    return out
  }, [])
  const vines = useMemo(() => [{ u: 0.004, n: 20, th: [0.1, 0.9], len: [1.5, 4.2] }, { u: 0.02, n: 10 }, ...U_AT.slice(1, 9).map((u, i) => ({ u: u + (i % 2 ? 0.01 : -0.012), n: 7 }))], [])
  return (
    <group>
      {CHAMBER_IDS.slice(1).map((id, k) => (LAYOUT[id] || []).map((it, j) => <Item key={id + j} it={it} u={U_AT[k + 1]} sideP={frames[k + 1].side} m={m} />))}
      {/* entrance ledge dressing */}
      <group position={[-3.6, -1.9, 7]} rotation={[0, Math.PI + 0.25, 0]}><Signpost m={m} signs={['Explore ↓', 'Projects', 'Contact']} /></group>
      <group position={[4.6, -1.9, 6.5]} rotation={[0, 0.6, 0]}><Barrel m={m} /></group>
      <group position={[5.5, -1.9, 7.4]} rotation={[0, 0.2, 0]}><Crate m={m} /></group>
      <WallFall u={(U_AT[1] + U_AT[2]) / 2} side={1} />
      <WallFall u={(U_AT[4] + U_AT[5]) / 2} side={-1} width={2.2} />
      <WallFall u={(U_AT[7] + U_AT[8]) / 2} side={1} />
      <Lanterns spots={lanterns} m={m} />
      <Vines clusters={vines} quality={quality} />
      <MouthRocks m={m} />
    </group>
  )
}
