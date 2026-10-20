import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { chamberFrames, curve, frameAt, LENGTH, UP } from './path'
import { smooth } from './noise'
import { caveStore } from './store'

const lerp = THREE.MathUtils.lerp
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion()
const lookQ = (pos, target, out) => out.setFromRotationMatrix(_m.lookAt(pos, target, UP))

/**
 * Scroll → camera. Progress (0..1) is split into one segment per chamber. The camera rests (plateau) in front of
 * each panel, then travels along the cave's centre line to the next one, easing its orientation with quaternion slerps.
 */
export default function CameraRig({ progressRef, reduced }) {
  const frames = useMemo(() => chamberFrames(), [])
  const N = frames.length
  const st = useMemo(() => ({
    p: 0, pos: new THREE.Vector3(), fwd: new THREE.Vector3(), qF: new THREE.Quaternion(), qA: new THREE.Quaternion(), qB: new THREE.Quaternion(),
    fr: frameAt(0), fr2: frameAt(0), tmp: new THREE.Vector3(), q: new THREE.Quaternion(), e: new THREE.Euler(),
  }), [])
  const { pointer } = useThree()

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05), cam = state.camera
    const target = progressRef.current
    st.p += (target - st.p) * (reduced || window.__caveSnap ? 1 : 1 - Math.exp(-5 * d))
    const seg = Math.min(N - 1 - 1e-6, Math.max(0, st.p * (N - 1)))
    const i = Math.floor(seg), f = seg - i
    const A = frames[i], B = frames[i + 1]
    const e = smooth(0.16, 0.84, f)
    const u = lerp(A.stopU, B.stopU, e)
    const lat = lerp(A.camLat, B.camLat, e), h = lerp(A.camH, B.camH, e)
    frameAt(u, st.fr)
    st.pos.copy(st.fr.c).addScaledVector(st.fr.r, lat).addScaledVector(UP, h)
    // forward look target
    frameAt(Math.min(1, u + 6 / LENGTH), st.fr2)
    st.fwd.copy(st.fr2.c).addScaledVector(st.fr2.r, lat * 0.25).addScaledVector(UP, h * 0.4 - 0.1)
    lookQ(st.pos, st.fwd, st.qF)
    // studying the panel at rest
    const wA = 1 - smooth(0.06, 0.4, f), wB = smooth(0.6, 0.94, f)
    if (wA > 0) {
      st.tmp.lerpVectors(st.fwd, A.look, A.lookMix); lookQ(st.pos, st.tmp, st.qA); st.q.copy(st.qF).slerp(st.qA, wA)
    } else st.q.copy(st.qF)
    if (wB > 0) { st.tmp.lerpVectors(st.fwd, B.look, B.lookMix); lookQ(st.pos, st.tmp, st.qB); st.q.slerp(st.qB, wB) }
    cam.position.copy(st.pos)
    cam.quaternion.copy(st.q)
    if (!reduced) {
      const t = state.clock.elapsedTime
      st.e.set(-pointer.y * 0.035 + Math.sin(t * 0.7) * 0.004, -pointer.x * 0.06 + Math.sin(t * 0.43) * 0.006, 0, 'YXZ')
      cam.quaternion.multiply(_q.setFromEuler(st.e))
      cam.position.y += Math.sin(t * 1.1) * 0.012
    }
    caveStore.setActive(Math.round(Math.min(N - 1, Math.max(0, st.p * (N - 1)))))
    state.scene.userData.camU = u
    state.scene.userData.progress = st.p
  })
  return null
}
