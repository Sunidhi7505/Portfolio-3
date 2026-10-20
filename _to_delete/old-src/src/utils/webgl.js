/** Feature detection helpers for the 3D layer. */
export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/** Heuristic for low-powered devices: few cores / little memory / small touch screens. */
export function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency || 8
  const mem = navigator.deviceMemory || 8
  const smallTouch = window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 820
  return cores <= 4 || mem <= 4 || smallTouch
}
