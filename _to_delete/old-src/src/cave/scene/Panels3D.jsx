import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CHAMBER_IDS, UP, chamberFrames, frameAt } from '../path'
import { smooth } from '../noise'
import ParchmentPanel from '../panels/ParchmentPanel'

/**
 * The carved parchment boards, mounted on the cave walls as real 3D-positioned DOM (crisp, selectable, accessible text).
 * Each faces the spot where the camera rests; only neighbours of the active chamber are mounted.
 */
export default function Panels3D({ onOpenProject }) {
  const { size } = useThree()
  // Keep panel text ~1:1 with CSS pixels on any desktop viewport (apparent scale ∝ distanceFactor × height).
  const fit = Math.min(1, (size.width - 120) / 780, (size.height - 120) / 600)
  const factor = Math.max(1.5, (fit * 4918) / size.height)
  const frames = useMemo(() => chamberFrames(), [])
  const placed = useMemo(() => frames.map((f) => {
    const sf = frameAt(f.stopU)
    const cam = sf.c.clone().addScaledVector(sf.r, f.camLat).addScaledVector(UP, f.camH)
    return { pos: f.panelPos.clone(), yaw: Math.atan2(cam.x - f.panelPos.x, cam.z - f.panelPos.z) }
  }), [frames])
  const els = useRef({})
  useFrame((s) => {
    const x = (s.scene.userData.progress ?? 0) * (frames.length - 1)
    for (let i = 1; i < frames.length; i++) {
      const el = els.current[i]; if (!el) continue
      const o = 1 - smooth(0.16, 0.46, Math.abs(x - i))
      el.style.opacity = o.toFixed(3)
      el.style.visibility = o < 0.02 ? 'hidden' : 'visible'
      el.style.display = o < 0.02 ? 'none' : ''
      el.style.pointerEvents = o > 0.7 ? 'auto' : 'none'
    }
  })
  return (
    <>
      {CHAMBER_IDS.map((id, i) => i > 0 && (
        <Html key={id} transform position={placed[i].pos} rotation={[0, placed[i].yaw, 0]} distanceFactor={factor} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div ref={(r) => { els.current[i] = r }} className="cv-3d" style={{ opacity: 0, visibility: 'hidden', display: 'none' }}>
            <ParchmentPanel id={id} onOpenProject={onOpenProject} />
          </div>
        </Html>
      ))}
    </>
  )
}
