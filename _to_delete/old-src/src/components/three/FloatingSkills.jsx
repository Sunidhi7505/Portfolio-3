import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BRAND, DISPLAY_NAME, luminance } from '../../utils/icons'

/** Draws a round glass badge with an official brand mark into a canvas texture. */
function makeBadgeTexture(key, theme) {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const dark = theme === 'dark'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2)
  ctx.fillStyle = dark ? 'rgba(14,22,40,0.92)' : 'rgba(255,255,255,0.96)'
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = dark ? 'rgba(130,160,255,0.55)' : 'rgba(47,91,234,0.45)'
  ctx.stroke()
  const icon = BRAND[key]
  if (icon) {
    ctx.save()
    const s = (size * 0.52) / 24
    ctx.translate(size * 0.24, size * 0.24)
    ctx.scale(s, s)
    // Pale brand colours (e.g. JavaScript yellow) would vanish on the light badge, so use the text colour there.
    ctx.fillStyle = dark || luminance(icon.hex) > 0.45 ? (dark ? '#e7edf8' : '#0f172a') : `#${icon.hex}`
    ctx.fill(new Path2D(icon.path))
    ctx.restore()
  } else {
    // No official mark bundled (e.g. Java): show the name rather than an inaccurate lookalike logo.
    ctx.fillStyle = dark ? '#e7edf8' : '#0f172a'
    ctx.font = '700 34px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(DISPLAY_NAME[key] || key, size / 2, size / 2 + 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/**
 * Technology badges orbiting the avatar on a tilted ellipse. Pure GPU sprites (no DOM overlays);
 * they fade in with the avatar reveal and keep depth ordering so they pass behind and in front of her.
 * Decorative only — the accessible skills list lives in the Skills section.
 */
export default function FloatingSkills({ skills, theme, shared, reduced, radius = 1.45, centerY = 1.7 }) {
  const group = useRef()
  const sprites = useRef([])
  const textures = useMemo(() => skills.map((k) => makeBadgeTexture(k, theme)), [skills, theme])

  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures])

  useFrame((state, dt) => {
    const t = reduced ? 0 : state.clock.elapsedTime
    const n = skills.length
    const reveal = shared.current.revealEase
    sprites.current.forEach((sp, i) => {
      if (!sp) return
      const a = t * 0.28 + (i / n) * Math.PI * 2
      sp.position.set(Math.cos(a) * radius * 1.18, Math.sin(a * 2 + i) * 0.3, Math.sin(a) * radius * 0.4)
      const depth = (Math.sin(a) + 1) / 2 // 0 = behind, 1 = in front
      const sc = 0.36 + depth * 0.13
      sp.scale.set(sc, sc, 1)
      sp.material.opacity = Math.max(0, reveal - 0.55) * 2.2 * (0.6 + depth * 0.3)
    })
    if (group.current) group.current.rotation.z = -0.18
  })

  return (
    <group ref={group} position={[0, centerY, 0]}>
      {skills.map((k, i) => (
        <sprite key={k} ref={(el) => { sprites.current[i] = el }}>
          <spriteMaterial map={textures[i]} transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
