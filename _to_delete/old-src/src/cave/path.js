import * as THREE from 'three'
import { fbm, smooth } from './noise'

/** Centre-line of the cave. Chambers sit on the first ten points; the last point is the sunrise exit. */
export const POINTS = [
  [0, 0, 3], [0, -0.2, -12], [5, -0.9, -26], [-1, -1.7, -41], [-5, -2.5, -56],
  [2, -3.3, -71], [6, -4.1, -86], [0, -4.9, -101], [-5, -5.7, -116], [-1, -6.5, -131], [4, -7.3, -148],
].map((p) => new THREE.Vector3(...p))

export const curve = new THREE.CatmullRomCurve3(POINTS, false, 'centripetal')
export const LENGTH = curve.getLength()
const UP = new THREE.Vector3(0, 1, 0)

/** Arc-length parameter (0..1) at which the curve passes closest to each control point. */
export const U_AT = (() => {
  const N = 4000, pts = curve.getSpacedPoints(N)
  return POINTS.map((p) => { let bi = 0, bd = Infinity; pts.forEach((q, i) => { const d = q.distanceToSquared(p); if (d < bd) { bd = d; bi = i } }); return bi / N })
})()

export const CHAMBER_IDS = ['gate', 'about', 'education', 'experience', 'skills', 'projects', 'certifications', 'achievements', 'coding', 'contact']
export const CHAMBER_LABELS = ['Home', 'About', 'Education', 'Experience', 'Skills', 'Projects', 'Certifications', 'Achievements', 'Coding', 'Contact']

const _c = new THREE.Vector3(), _t = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3()
export function frameAt(u, out = {}) {
  const uu = Math.min(1, Math.max(0, u))
  out.c = curve.getPointAt(uu, out.c || new THREE.Vector3())
  out.t = curve.getTangentAt(uu, out.t || new THREE.Vector3()).normalize()
  out.r = (out.r || new THREE.Vector3()).crossVectors(out.t, UP).normalize()
  out.u = (out.u || new THREE.Vector3()).crossVectors(out.r, out.t).normalize()
  return out
}

/** Half-width / half-height of the cave at arc-length u: narrow passages that swell into chambers. */
export function profile(u) {
  let bulge = 0
  for (let i = 1; i < U_AT.length; i++) { const d = (u - U_AT[i]) * LENGTH; bulge = Math.max(bulge, Math.exp(-(d * d) / (2 * 6.5 * 6.5))) }
  const mouth = Math.exp(-(((u - U_AT[0]) * LENGTH) ** 2) / (2 * 7 * 7))
  const rx = 3.6 + bulge * 3.2 + mouth * 1.8
  const ry = 3.3 + bulge * 2.4 + mouth * 3.2
  return { rx, ry, bulge }
}
export const FLOOR = -1.9

/** Point on the cave wall at ring angle theta (0 = right wall, PI/2 = ceiling, 3PI/2 = floor). Shared by mesh and props. */
export function ringPoint(u, theta, out = new THREE.Vector3(), fr = frameAt(u)) {
  const { rx, ry } = profile(u)
  const s = u * LENGTH, ex = Math.cos(theta), ey = Math.sin(theta)
  const lump = (fbm(ex * 1.25 + s * 0.085 + 3, ey * 1.25 + s * 0.11, 4) - 0.5) * 0.62 + (fbm(ex * 3.4 + s * 0.3, ey * 3.4 + s * 0.27 + 11, 3) - 0.5) * 0.2
  const f = 1 + lump
  const x = ex * rx * f
  const floor = FLOOR + (fbm(ex * 2 + s * 0.4, s * 0.35, 3) - 0.5) * 0.35
  const y = Math.max(ey * ry * f, floor)
  return out.copy(fr.c).addScaledVector(fr.r, x).addScaledVector(fr.u, y)
}

/** Build the tunnel as one indexed BufferGeometry swept along the curve. Faces point inward. */
export function buildTunnel({ rings = 460, seg = 80 } = {}) {
  const pos = [], uv = [], idx = []
  const p = new THREE.Vector3(), fr = frameAt(0)
  for (let j = 0; j <= rings; j++) {
    const u = j / rings
    frameAt(u, fr)
    for (let k = 0; k < seg; k++) {
      const th = (k / seg) * Math.PI * 2
      ringPoint(u, th, p, fr)
      pos.push(p.x, p.y, p.z)
      uv.push((k / seg) * 7, (u * LENGTH) / 5.2)
    }
  }
  for (let j = 0; j < rings; j++) for (let k = 0; k < seg; k++) {
    const a = j * seg + k, b = j * seg + ((k + 1) % seg), c = (j + 1) * seg + k, d = (j + 1) * seg + ((k + 1) % seg)
    idx.push(a, b, c, b, d, c)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** Position on the cave floor at arc-length u, lateral offset (metres, + = right). */
export function floorPoint(u, lateral = 0, out = new THREE.Vector3()) {
  const fr = frameAt(u)
  return out.copy(fr.c).addScaledVector(fr.r, lateral).addScaledVector(UP, FLOOR + 0.02)
}
export function wallPoint(u, side, height = 0, out = new THREE.Vector3()) {
  // intersect horizontal ray at given height (relative to centre line) with the wall
  const fr = frameAt(u), { rx } = profile(u)
  const th = Math.asin(Math.min(0.95, Math.max(-0.2, height / profile(u).ry)))
  const a = side > 0 ? th : Math.PI - th
  return ringPoint(u, a, out, fr)
}
export { UP }

/** Where the camera rests for each chamber, and what it studies. */
export function chamberFrames() {
  return CHAMBER_IDS.map((id, i) => {
    const gate = i === 0
    const u = gate ? 0.028 : U_AT[i]
    const side = gate ? 1 : i % 2 ? 1 : -1          // which wall carries the panel (+1 = right)
    const panelPos = wallPoint(u, side, 0.7)
    const fr = frameAt(u)
    panelPos.addScaledVector(fr.r, -side * 0.55)
    const stopU = gate ? 0.048 : Math.max(0, u - 8.2 / LENGTH)
    const sf = frameAt(stopU)
    const camLat = gate ? 0.5 : -side * 1.3
    const camH = gate ? -0.4 : 0.3
    // `look` overrides what the camera studies at rest (gate: the mountain vista; contact: toward the sunrise exit).
    let look = panelPos.clone(), lookMix = 1
    if (gate) { look = new THREE.Vector3(-6, 3.2, 90); lookMix = 1 }
    return { id, i, u, side, panelPos, stopU, camLat, camH, look, lookMix, panelNormalTarget: null, sf }
  })
}
