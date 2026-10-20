import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rand } from '../noise'
import { getAssets } from '../assets'

const vert = /* glsl */`
attribute vec4 aRand; uniform float uTime; uniform vec3 uCenter; uniform float uBox; uniform float uSize; uniform vec3 uVel;
varying float vA; varying float vH;
void main(){
  vec3 p = fract(aRand.xyz + uVel * uTime * (.4 + aRand.w)) - .5;
  p.x += sin(uTime * (.4 + aRand.w) + aRand.z * 20.) * .02;
  vec3 wp = uCenter + p * uBox;
  vec4 mv = viewMatrix * vec4(wp, 1.);
  gl_Position = projectionMatrix * mv;
  float tw = .55 + .45 * sin(uTime * (1.5 + aRand.w * 4.) + aRand.x * 40.);
  gl_PointSize = uSize * (.5 + aRand.w) * tw * (260. / max(1., -mv.z));
  vA = tw * smoothstep(0., .08, 1. - abs(p.y) * 2.) * smoothstep(34., 8., -mv.z);
  vH = aRand.w;
}`
const frag = /* glsl */`
uniform sampler2D uMap; uniform vec3 uCol; uniform vec3 uCol2; uniform float uAlpha; varying float vA; varying float vH;
void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(mix(uCol, uCol2, vH), t.a * vA * uAlpha); if (gl_FragColor.a < .01) discard; }`

function Layer({ count, box, size, vel, col, col2, alpha, seed, additive = true }) {
  const { glow } = getAssets()
  const { geo, mat } = useMemo(() => {
    const r = rand(seed), a = new Float32Array(count * 4), pos = new Float32Array(count * 3)
    for (let i = 0; i < a.length; i++) a[i] = r()
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(a, 4))
    const m = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uBox: { value: box }, uSize: { value: size }, uVel: { value: new THREE.Vector3(...vel) }, uMap: { value: glow }, uCol: { value: new THREE.Color(col) }, uCol2: { value: new THREE.Color(col2) }, uAlpha: { value: alpha } },
    })
    return { geo: g, mat: m }
  }, [count, box, size, vel, col, col2, alpha, seed, additive, glow])
  const fwd = useMemo(() => new THREE.Vector3(), [])
  useFrame((s) => {
    s.camera.getWorldDirection(fwd)
    mat.uniforms.uCenter.value.copy(s.camera.position).addScaledVector(fwd, box * 0.28)
    mat.uniforms.uTime.value = s.clock.elapsedTime
  })
  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={5} />
}

/** Rising embers + slow dust motes in the torch-light. Both follow the camera in a wrapping box (GPU-animated). */
export default function Particles({ quality = 'full' }) {
  const lite = quality === 'lite'
  return (
    <>
      <Layer count={lite ? 140 : 380} box={26} size={5.5} vel={[0.01, 0.045, 0.008]} col="#ff9a3a" col2="#ffd890" alpha={0.95} seed={5} />
      <Layer count={lite ? 120 : 340} box={22} size={3.2} vel={[0.004, -0.004, 0.003]} col="#d9c8a8" col2="#a8b8c8" alpha={0.28} seed={9} />
    </>
  )
}
