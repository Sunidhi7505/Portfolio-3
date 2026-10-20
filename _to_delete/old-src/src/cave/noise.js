/** Tiny seeded value-noise helpers used for procedural textures and cave geometry (no external assets). */
function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const NS = 256
const TB = new Float32Array(NS * NS)
{ const r = mulberry(1337); for (let i = 0; i < TB.length; i++) TB[i] = r() }

export function vn(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy)
  const a = TB[((yi & 255) << 8) | (xi & 255)], b = TB[((yi & 255) << 8) | ((xi + 1) & 255)]
  const c = TB[(((yi + 1) & 255) << 8) | (xi & 255)], d = TB[(((yi + 1) & 255) << 8) | ((xi + 1) & 255)]
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}
export function fbm(x, y, oct = 4) {
  let s = 0, a = 0.5, f = 1, n = 0
  for (let i = 0; i < oct; i++) { s += a * vn(x * f, y * f); n += a; a *= 0.5; f *= 2.03 }
  return s / n
}
export const smooth = (a, b, x) => { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x) }
export const rand = mulberry
