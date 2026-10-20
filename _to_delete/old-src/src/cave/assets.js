import * as THREE from 'three'
import { makeFlameSprite, makeGlowSprite, makeRock, makeWood } from './textures'
import { buildTunnel, frameAt } from './path'

/** Lazily-built, shared procedural textures (one set per page load). */
let cache
export function getAssets() {
  if (!cache) cache = { rock: makeRock(768), wood: makeWood(512), flame: makeFlameSprite(), glow: makeGlowSprite() }
  return cache
}

const tunnels = {}
export function getTunnelGeometry(quality = 'full') {
  const lite = quality === 'lite'
  const key = lite ? 'lite' : 'full'
  if (!tunnels[key]) tunnels[key] = buildTunnel({ rings: lite ? 240 : 420, seg: lite ? 48 : 72 })
  return tunnels[key]
}

/** Real floor height for props: ray-cast straight down onto the tunnel mesh. */
let groundMesh, ray
const _dir = new THREE.Vector3(0, -1, 0), _from = new THREE.Vector3()
export function groundAt(x, y, z, quality = 'full') {
  if (!groundMesh) {
    groundMesh = new THREE.Mesh(getTunnelGeometry(quality), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
    groundMesh.updateMatrixWorld(true)
    ray = new THREE.Raycaster()
  }
  ray.set(_from.set(x, y + 3.5, z), _dir)
  const hit = ray.intersectObject(groundMesh, false)[0]
  return hit ? hit.point.y : y
}
/** Floor point at arc-length u, lateral offset `lat` (+ = right of travel direction). */
export function floorAt(u, lat = 0, out = new THREE.Vector3(), quality = 'full') {
  const fr = frameAt(u)
  out.copy(fr.c).addScaledVector(fr.r, lat)
  out.y = groundAt(out.x, fr.c.y, out.z, quality)
  return out
}
