import { useEffect } from 'react'
import { sceneStore } from '../utils/sceneStore'

/** Writes the normalised pointer position into the shared scene store (no React re-renders). */
export function usePointerTracker(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined
    const onMove = (e) => {
      sceneStore.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      sceneStore.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled])
}
