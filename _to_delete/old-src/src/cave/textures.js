import * as THREE from 'three'
import { fbm, smooth } from './noise'

const toTex = (canvas, srgb = false, repeat = true) => {
  const t = new THREE.CanvasTexture(canvas)
  if (repeat) { t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping }
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.generateMipmaps = true
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.needsUpdate = true
  return t
}
const mk = (n, fn) => {
  const c = document.createElement('canvas'); c.width = c.height = n
  const x = c.getContext('2d'), im = x.createImageData(n, n)
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const [r, g, b] = fn(i / n, j / n, i, j), k = (j * n + i) * 4
    im.data[k] = r; im.data[k + 1] = g; im.data[k + 2] = b; im.data[k + 3] = 255
  }
  x.putImageData(im, 0, 0)
  return c
}
/** Height field -> tangent-space normal map canvas. */
function normalFrom(h, n, strength) {
  return mk(n, (_, __, i, j) => {
    const g = (x, y) => h[((y + n) % n) * n + ((x + n) % n)]
    const dx = (g(i + 1, j) - g(i - 1, j)) * strength, dy = (g(i, j + 1) - g(i, j - 1)) * strength
    const l = 1 / Math.hypot(dx, dy, 1)
    return [(-dx * l * 0.5 + 0.5) * 255, (dy * l * 0.5 + 0.5) * 255, (l * 0.5 + 0.5) * 255]
  })
}

export function makeRock(n = 768) {
  const h = new Float32Array(n * n)
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const u = (i / n) * 8, v = (j / n) * 8
    const w = fbm(u * 0.9, v * 0.9, 5)
    const rg = 1 - Math.abs(2 * fbm(u * 1.5 + 5, v * 1.5, 4) - 1)
    const rg2 = 1 - Math.abs(2 * fbm(u * 3.1 + 9, v * 3.4 + 2, 4) - 1)
    const st = fbm(u * 0.45, v * 3.2, 3)
    h[j * n + i] = w * 0.95 + rg * rg * 0.85 + rg2 * rg2 * rg2 * 0.22 + st * 0.3 + fbm(u * 6, v * 6, 2) * 0.05
  }
  const diffuse = mk(n, (_, __, i, j) => {
    const u = (i / n) * 8, v = (j / n) * 8, hh = h[j * n + i]
    const t = fbm(u * 0.6 + 20, v * 0.6, 3), st = fbm(u * 0.4, v * 4 + 5, 3)
    const k = 0.34 + hh * 0.5
    let r = (92 + 40 * t + 16 * st) * k, g = (80 + 34 * t + 14 * st) * k, b = (68 + 28 * t + 12 * st) * k
    const moss = smooth(0.58, 0.8, fbm(u * 1.1 + 40, v * 1.1 + 8, 4)) * smooth(1.05, 0.55, hh)
    r = r * (1 - moss * 0.5) + 30 * moss; g = g * (1 - moss * 0.1) + 52 * moss; b = b * (1 - moss * 0.5) + 22 * moss
    return [r, g, b]
  })
  return { map: toTex(diffuse, true), normalMap: toTex(normalFrom(h, n, 2.3)) }
}

export function makeWood(n = 512) {
  const h = new Float32Array(n * n)
  const col = mk(n, (_, __, i, j) => {
    const u = i / n, v = j / n
    const warp = fbm(u * 3, v * 1.2, 3) * 4
    const g = Math.sin((v * 22 + warp) * Math.PI) * 0.5 + 0.5
    const fine = fbm(u * 2, v * 60, 3)
    const plank = Math.floor(v * 4), edge = Math.abs(((v * 4) % 1) - 0.5) > 0.485 ? 0.4 : 1
    const base = 0.55 + 0.3 * g * 0.6 + 0.35 * fine + (plank % 2) * 0.05
    h[j * n + i] = (g * 0.4 + fine * 0.6) * edge
    return [(150 * base) * edge, (104 * base) * edge, (62 * base) * edge]
  })
  return { map: toTex(col, true), normalMap: toTex(normalFrom(h, n, 2.2)) }
}

export function makeParchment(n = 512) {
  return toTex(mk(n, (_, __, i, j) => {
    const u = i / n, v = j / n
    const c = fbm(u * 3, v * 3, 5), f = fbm(u * 60, v * 4, 2), s = smooth(0.62, 0.8, fbm(u * 2 + 9, v * 2, 4))
    const k = 0.84 + c * 0.28 + (f - 0.5) * 0.08
    return [(232 * k) - s * 40, (205 * k) - s * 52, (156 * k) - s * 66]
  }), true)
}

/** Soft radial flame sprite (white-hot core -> orange -> transparent). */
export function makeFlameSprite() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 256
  const x = c.getContext('2d')
  x.translate(64, 256)
  const g = x.createRadialGradient(0, -80, 4, 0, -80, 90)
  g.addColorStop(0, 'rgba(255,248,200,1)'); g.addColorStop(0.25, 'rgba(255,190,70,.95)')
  g.addColorStop(0.6, 'rgba(255,100,20,.55)'); g.addColorStop(1, 'rgba(255,60,0,0)')
  x.fillStyle = g
  x.beginPath(); x.moveTo(-46, -50); x.bezierCurveTo(-52, -120, -18, -150, 0, -250); x.bezierCurveTo(22, -150, 52, -120, 46, -50)
  x.bezierCurveTo(30, -4, -30, -4, -46, -50); x.fill()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}
export function makeGlowSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 128
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

/** Layered mountain silhouette with snow caps, drawn procedurally (used for the cave-mouth vistas). */
export function makeMountains({ w = 1024, h = 256, seed = 1, base = [92, 118, 160], snow = [240, 246, 255], top = 0.2, rough = 0.55 }) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const x = c.getContext('2d')
  const ridge = (px) => {
    const u = px / w * 6 + seed * 13
    const m = fbm(u, seed, 5), r = 1 - Math.abs(2 * fbm(u * 1.7, seed + 4, 4) - 1)
    return h * (1 - (top + (0.55 - top) * (m * (1 - rough) + r * rough)))
  }
  const g = x.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, `rgb(${base.map((v) => v + 40)})`); g.addColorStop(0.5, `rgb(${base})`); g.addColorStop(1, `rgb(${base.map((v) => v * 0.7)})`)
  x.fillStyle = g
  x.beginPath(); x.moveTo(0, h)
  for (let px = 0; px <= w; px += 2) x.lineTo(px, ridge(px))
  x.lineTo(w, h); x.closePath(); x.fill()
  // snow: clip to silhouette, paint bright cap on upper band with irregular lower edge
  x.save(); x.clip()
  x.fillStyle = `rgb(${snow})`
  x.beginPath(); x.moveTo(0, 0)
  for (let px = 0; px <= w; px += 2) { const y = ridge(px); x.lineTo(px, y + 14 + fbm(px / 40, seed, 3) * 30 * (h - y) / h * 2) }
  x.lineTo(w, 0); x.closePath(); x.globalAlpha = 0.9; x.fill(); x.restore()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}
