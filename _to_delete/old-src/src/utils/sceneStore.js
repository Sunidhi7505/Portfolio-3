/**
 * Tiny mutable store shared between DOM UI and the 3D scene.
 * Values change every frame (pointer / scroll) so they deliberately live OUTSIDE React state.
 * Subscribers (used for `frameloop="demand"` in reduced-motion mode) are notified on discrete changes.
 */
const listeners = new Set()

export const sceneStore = {
  pointer: { x: 0, y: 0 }, // normalised -1..1 relative to the viewport
  heroHover: false, // pointer is over the hero stage
  foldManual: null, // null = follow scroll, true/false = user override
  foldScroll: false, // set by the ScrollTrigger in Hero
  anchor: { cx: 0, cy: 0, w: 0, h: 0, visible: false }, // hero stage rect in CSS pixels
  ready: false,
}

export const subscribeScene = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const notifyScene = () => listeners.forEach((fn) => fn())

export const isFolded = () => (sceneStore.foldManual ?? sceneStore.foldScroll)
