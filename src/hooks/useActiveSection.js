import { useEffect, useState } from 'react'

/** Tracks which section crosses the middle of the viewport (for the navigation highlight); the last section wins at the page bottom. */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!els.length || typeof IntersectionObserver === 'undefined') return undefined
    const visible = new Map()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0))
        let best = null
        let bestRatio = 0
        visible.forEach((ratio, id) => { if (ratio > bestRatio) { best = id; bestRatio = ratio } })
        if (best) setActive(best)
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.01, 0.1, 0.5, 1] },
    )
    els.forEach((el) => io.observe(el))
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) setActive(els[els.length - 1].id)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [ids])
  return active
}
