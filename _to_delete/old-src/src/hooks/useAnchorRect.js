import { useEffect } from 'react'
import { sceneStore, notifyScene } from '../utils/sceneStore'

/**
 * Keeps `sceneStore.anchor` in sync with the on-screen rectangle of the hero "stage" element.
 * The 3D avatar is positioned from this rect, so the scene follows the DOM layout on every breakpoint.
 * Updates are batched into one requestAnimationFrame per scroll/resize burst.
 */
export function useAnchorRect(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    let raf = 0
    const measure = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      sceneStore.anchor = {
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
        w: r.width,
        h: r.height,
        visible: r.bottom > -40 && r.top < window.innerHeight + 40,
      }
      notifyScene()
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure) }
    measure()
    const ro = new ResizeObserver(schedule)
    ro.observe(el)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
      sceneStore.anchor = { cx: 0, cy: 0, w: 0, h: 0, visible: false }
    }
  }, [ref])
}
