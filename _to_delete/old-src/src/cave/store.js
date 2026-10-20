import { useSyncExternalStore } from 'react'

/** Tiny external store: which chamber the camera is currently in (no React re-render per frame). */
const state = { active: 0, listeners: new Set(), soundOn: false }
export const caveStore = {
  setActive(i) { if (i !== state.active) { state.active = i; state.listeners.forEach((f) => f()) } },
  get active() { return state.active },
  subscribe(f) { state.listeners.add(f); return () => state.listeners.delete(f) },
}
export const useActiveChamber = () => useSyncExternalStore(caveStore.subscribe, () => state.active, () => 0)

export const CHAMBER_COUNT = 10
export const SEG_VH = 150
/** Smooth-scroll to a chamber (the camera follows the scroll position). */
export function jumpTo(i, behavior = 'smooth') {
  const max = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo({ top: (Math.max(0, Math.min(CHAMBER_COUNT - 1, i)) / (CHAMBER_COUNT - 1)) * max, behavior })
}
