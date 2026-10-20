import { animate, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

/** Counts from 0 to `value` when the element scrolls into view. Only use with real numbers. */
export function useCounter(value, { duration = 1.4, decimals = 0 } = {}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(reduced ? value : 0)

  useEffect(() => {
    if (!inView) return undefined
    if (reduced) { setDisplay(value); return undefined }
    const controls = animate(0, value, { duration, ease: 'easeOut', onUpdate: (v) => setDisplay(v) })
    return () => controls.stop()
  }, [inView, value, duration, reduced])

  return { ref, text: display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) }
}
