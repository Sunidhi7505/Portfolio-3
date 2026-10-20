import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { frameAt, profile, UP, U_AT, LENGTH } from '../path'
import { rand } from '../noise'

/** Simple bat: body + two wings (flapped in the vertex shader) + ears. +Z is forward. */
function batGeometry() {
  const v = [], idx = [], push = (...p) => { v.push(...p); return v.length / 3 - 1 }
  // body
  const b0 = push(0, 0.02, 0.16), b1 = push(-0.05, 0, 0), b2 = push(0.05, 0, 0), b3 = push(0, 0.05, 0.02), b4 = push(0, -0.01, -0.14)
  idx.push(b0, b2, b1, b0, b1, b3, b0, b3, b2, b4, b1, b2, b4, b3, b1, b4, b2, b3)
  // ears
  const e0 = push(-0.025, 0.04, 0.13), e1 = push(-0.04, 0.1, 0.12), e2 = push(-0.005, 0.045, 0.15)
  const e3 = push(0.025, 0.04, 0.13), e4 = push(0.04, 0.1, 0.12), e5 = push(0.005, 0.045, 0.15)
  idx.push(e0, e1, e2, e3, e5, e4)
  // wings (mirrored): shoulder → tip with scalloped trailing edge
  for (const s of [-1, 1]) {
    const sh = push(0.05 * s, 0.02, 0.08), el = push(0.3 * s, 0.07, 0.1), tip = push(0.62 * s, 0.1, -0.02)
    const t1 = push(0.5 * s, 0.03, -0.18), t2 = push(0.3 * s, 0.01, -0.12), root = push(0.05 * s, 0, -0.12)
    if (s > 0) idx.push(sh, el, tip, sh, tip, t1, sh, t1, t2, sh, t2, root)
    else idx.push(sh, tip, el, sh, t1, tip, sh, t2, t1, sh, root, t2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const vert = /* glsl */`
attribute float aPhase; uniform float uTime;
varying float vL;
void main(){
  vec3 p = position;
  float w = abs(p.x);
  p.y += sin(uTime * 15. + aPhase) * w * 1.05 * (.4 + w);
  p.z += cos(uTime * 15. + aPhase) * w * .12;
  vL = w;
  vec4 wp = instanceMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * wp;
}`
const frag = /* glsl */`varying float vL; void main(){ gl_FragColor = vec4(mix(vec3(.04,.025,.02), vec3(.14,.07,.04), vL), 1.); }`

export default function Bats({ quality = 'full' }) {
  const N = quality === 'lite' ? 3 : 8
  const ref = useRef()
  const { geo, mat, bats } = useMemo(() => {
    const geo = batGeometry(), r = rand(31)
    const phase = new Float32Array(N)
    const bats = Array.from({ length: N }, (_, i) => {
      phase[i] = r() * 6
      const home = 1 + Math.floor(r() * 8) // fly in the passages between chambers, never in front of a panel
      return { u0: (U_AT[home] + U_AT[home + 1]) / 2 + (r() - 0.5) * 0.01, amp: (2.5 + r() * 4) / LENGTH, w: 0.25 + r() * 0.25, ph: r() * 6.28, lw: 0.5 + r() * 0.5, lph: r() * 6.28, hh: 0.5 + r() * 0.9, dir: r() < 0.5 ? 1 : -1 }
    })
    // instanced attribute must live on the geometry
    const inst = new THREE.InstancedBufferAttribute(phase, 1)
    geo.setAttribute('aPhase', inst)
    const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, side: THREE.DoubleSide, uniforms: { uTime: { value: 0 } } })
    return { geo, mat, bats }
  }, [N])
  const tmp = useMemo(() => ({ fr: frameAt(0), fr2: frameAt(0), p: new THREE.Vector3(), q: new THREE.Vector3(), m: new THREE.Matrix4(), o: new THREE.Object3D(), up: new THREE.Vector3(0, 1, 0) }), [])
  useFrame((s) => {
    const t = s.clock.elapsedTime, T = tmp
    mat.uniforms.uTime.value = t
    bats.forEach((b, i) => {
      const pos = (tt) => {
        const u = b.u0 + Math.sin(tt * b.w + b.ph) * b.amp
        frameAt(u, T.fr)
        const { rx, ry } = profile(u)
        const lat = Math.sin(tt * b.lw + b.lph) * rx * 0.45
        const h = ry * 0.42 + b.hh + Math.sin(tt * 0.9 + i) * 0.35
        return T.q.copy(T.fr.c).addScaledVector(T.fr.r, lat).addScaledVector(UP, h)
      }
      T.p.copy(pos(t))
      const nxt = pos(t + 0.08).clone()
      T.o.position.copy(T.p)
      T.o.lookAt(nxt.x, nxt.y, nxt.z)
      T.o.rotateZ(Math.sin(t * b.lw + b.lph) * 0.5)
      T.o.scale.setScalar(0.85 + (i % 3) * 0.12)
      T.o.updateMatrix()
      ref.current.setMatrixAt(i, T.o.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={ref} args={[geo, mat, N]} frustumCulled={false} />
}
