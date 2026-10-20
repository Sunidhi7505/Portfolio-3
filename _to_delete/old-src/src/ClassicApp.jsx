import { useEffect, useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Resume from './components/sections/Resume'
import Experience from './components/sections/Experience'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Education from './components/sections/Education'
import Certifications from './components/sections/Certifications'
import Achievements from './components/sections/Achievements'
import CodingProfiles from './components/sections/CodingProfiles'
import Contact from './components/sections/Contact'
import SceneRoot from './components/three/SceneRoot'
import { useTheme } from './hooks/useTheme'
import { usePrefersReducedMotion } from './hooks/useMediaQuery'
import { usePointerTracker } from './hooks/usePointerTracker'
import { hasWebGL, isLowPowerDevice } from './utils/webgl'

/** 'full' | 'lite' (low-power devices: fewer particles, no badges/network) | 'off' (no WebGL) */
const detectMode = () => {
  // `?scene=full|lite|off` forces a mode (handy for testing the fallbacks).
  const forced = new URLSearchParams(window.location.search).get('scene')
  if (forced === 'off' || forced === 'lite' || forced === 'full') return forced === 'off' || hasWebGL() ? forced : 'off'
  return !hasWebGL() ? 'off' : isLowPowerDevice() ? 'lite' : 'full'
}

export default function ClassicApp({ onEnterCave }) {
  const { theme } = useTheme()
  const reduced = usePrefersReducedMotion()
  const [mode] = useState(detectMode)
  const [sceneStatus, setSceneStatus] = useState(mode === 'off' ? 'fallback' : 'loading')
  const [mountScene, setMountScene] = useState(false)

  usePointerTracker(mode !== 'off' && !reduced)

  // Paint the text content first; start loading the 3D chunk right afterwards.
  useEffect(() => {
    if (mode === 'off') return undefined
    const id = window.setTimeout(() => setMountScene(true), 60)
    return () => window.clearTimeout(id)
  }, [mode])

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="page-bg" aria-hidden="true" />
      {mountScene && mode !== 'off' && sceneStatus !== 'fallback' && (
        <SceneRoot theme={theme} mode={mode} reduced={reduced} onStatus={setSceneStatus} />
      )}
      {onEnterCave && (
        <button type="button" className="enter-cave" onClick={onEnterCave}>
          <span aria-hidden="true">🔥</span> Enter the 3D cave
        </button>
      )}
      <Navbar />
      <main id="main">
        <Hero sceneStatus={sceneStatus} />
        <About />
        <Resume />
        <Experience />
        <Skills />
        <Projects />
        <Education />
        <Certifications />
        <Achievements />
        <CodingProfiles />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
