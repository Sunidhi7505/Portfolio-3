import { useRef } from 'react'
import TechIcon from './TechIcon'

/**
 * Interactive 3D logo tile: a thick glossy slab that tilts toward the pointer,
 * with the brand mark floating above its face. Decorative — pair with a visible label.
 */
export default function Icon3D({ name, size = 64, iconSize = 38 }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${x * 38}deg`)
    el.style.setProperty('--rx', `${-y * 38}deg`)
    el.style.setProperty('--gx', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--gy', `${(y + 0.5) * 100}%`)
  }
  const reset = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <span className="icon3d" style={{ '--s': `${size}px` }} onPointerMove={onMove} onPointerLeave={reset} onPointerCancel={reset} aria-hidden="true">
      <span className="icon3d__tilt" ref={ref}>
        <span className="icon3d__slab" />
        <span className="icon3d__face" />
        <span className="icon3d__mark"><TechIcon name={name} size={iconSize} official /></span>
      </span>
    </span>
  )
}
