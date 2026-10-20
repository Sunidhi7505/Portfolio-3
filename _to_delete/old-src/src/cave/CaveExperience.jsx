import { Component, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CaveScene from './scene/CaveScene'
import { CaveNav, CaveProjectModal, Hero, MobileControls, useAmbience } from './Hud'
import { CHAMBER_COUNT, SEG_VH, jumpTo, caveStore } from './store'
import { smooth } from './noise'
import { useMediaQuery } from '../hooks/useMediaQuery'
import '@fontsource/cinzel/500.css'
import '@fontsource/cinzel/700.css'
import './cave.css'

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e) { console.warn('[cave disabled]', e?.message || e); this.props.onFail?.() }
  render() { return this.state.failed ? null : this.props.children }
}

/** The immersive experience: fixed 3D stage + scroll spacer + HUD. Scroll position drives the camera through the cave. */
export default function CaveExperience({ quality = 'full', reduced = false, onExit }) {
  const progressRef = useRef(0)
  const heroRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [project, setProject] = useState(null)
  const mobile = useMediaQuery('(max-width: 820px)')
  const closeProject = useCallback(() => setProject(null), [])
  const sound = useAmbience(progressRef)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      progressRef.current = p
      const x = p * (CHAMBER_COUNT - 1)
      if (heroRef.current) {
        const o = 1 - smooth(0.04, 0.5, x)
        heroRef.current.style.opacity = o.toFixed(3)
        heroRef.current.style.visibility = o < 0.02 ? 'hidden' : 'visible'
        heroRef.current.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])

  // Keyboard: arrows / PageUp / PageDown / Home / End hop between chambers.
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || project) return
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const a = caveStore.active
      const go = (i) => { e.preventDefault(); jumpTo(i) }
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight') go(a + 1)
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') go(a - 1)
      else if (e.key === 'Home') go(0)
      else if (e.key === 'End') go(CHAMBER_COUNT - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project])

  return (
    <div className="cv-root" data-ready={ready}>
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <filter id="cv-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <a href="#cv-classic" className="skip-link" onClick={(e) => { e.preventDefault(); onExit() }}>Skip the journey — open the classic page</a>
      <div className="cv-spacer" style={{ height: `${(CHAMBER_COUNT - 1) * SEG_VH + 100}vh` }} aria-hidden="true" />
      <div className="cv-stage" aria-hidden={mobile ? 'true' : undefined}>
        <Boundary onFail={onExit}>
          <Canvas
            dpr={[1, mobile || quality === 'lite' ? 1.25 : 1.75]}
            camera={{ fov: mobile ? 70 : 62, near: 0.1, far: 1800, position: [0, 0, 0] }}
            gl={{ antialias: !mobile && quality !== 'lite', powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              setReady(true)
              gl.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onExit() })
            }}
          >
            <CaveScene progressRef={progressRef} quality={mobile ? 'lite' : quality} reduced={reduced} mobile={mobile} onOpenProject={setProject} />
          </Canvas>
        </Boundary>
      </div>
      <div className="cv-vignette" aria-hidden="true" />
      <Hero heroRef={heroRef} />
      <CaveNav sound={sound} onExit={onExit} />
      {mobile && <MobileControls onOpenProject={setProject} />}
      <CaveProjectModal project={project} onClose={closeProject} />
      {!ready && <div className="cv-boot" role="status">Lighting the torches…</div>}
    </div>
  )
}
