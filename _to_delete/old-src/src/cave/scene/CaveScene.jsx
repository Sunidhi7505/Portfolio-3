import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Tunnel from './Tunnel'
import Torches, { buildTorchSpots } from './Torches'
import Vista from './Sky'
import Props from './Props'
import Particles from './Particles'
import Bats from './Bats'
import Panels3D from './Panels3D'
import CameraRig from '../CameraRig'

export default function CaveScene({ progressRef, quality, reduced, mobile, onOpenProject }) {
  const spots = useMemo(buildTorchSpots, [])
  const hide = new URLSearchParams(window.location.search).get('hide') || ''
  const { scene, gl } = useThree()
  useEffect(() => {
    scene.fog = new THREE.Fog('#0a0504', 6, 62)
    scene.background = new THREE.Color('#0a0504')
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.15
    return () => { scene.fog = null }
  }, [scene, gl])
  return (
    <>
      <CameraRig progressRef={progressRef} reduced={reduced} />
      <hemisphereLight args={['#8fa2bb', '#33201a', 0.55]} />
      {/* daylight spilling in at the entrance, sunrise glow at the exit */}
      <pointLight position={[0, 2.5, 9]} color="#d6e6ff" intensity={200} distance={34} decay={1.7} />
      <pointLight position={[4, -5.5, -152]} color="#ffb070" intensity={330} distance={34} decay={1.7} />
      {!hide.includes('tunnel') && <Tunnel quality={quality} hide={hide} />}
      {!hide.includes('torch') && <Torches spots={spots} quality={quality} />}
      {!hide.includes('vista') && <Vista quality={quality} />}
      {!hide.includes('props') && <Props quality={quality} />}
      {!mobile && <Panels3D onOpenProject={onOpenProject} />}
      {!hide.includes('fx') && <Particles quality={quality} />}
      {!hide.includes('fx') && <Bats quality={quality} />}
    </>
  )
}
