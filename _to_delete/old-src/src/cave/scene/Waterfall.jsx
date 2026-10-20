import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getAssets } from '../assets'

const vert = /* glsl */`
varying vec2 vUv;
#include <fog_pars_vertex>
void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`
const frag = /* glsl */`
varying vec2 vUv; uniform float uTime; uniform float uBright; uniform vec3 uTint;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
#include <fog_pars_fragment>
void main(){
  float x = vUv.x, y = vUv.y;
  float flow = n(vec2(x*16., y*2.2 + uTime*1.7)) * .6 + n(vec2(x*34. + 7., y*5. + uTime*2.6)) * .4;
  float streak = smoothstep(.3, .78, flow);
  float edge = smoothstep(0., .14, x) * smoothstep(1., .86, x);
  float top = smoothstep(1., .96, y);
  float foam = smoothstep(.12, 0., y) * (.5 + .5 * n(vec2(x*20., uTime*3.)));
  vec3 col = mix(vec3(.46,.66,.78), vec3(.96,.99,1.), streak) * uBright + uTint * .25 + foam * .5;
  float a = (.32 + .6 * streak) * edge * top;
  gl_FragColor = vec4(col, a);
  #include <colorspace_fragment>
  #include <fog_fragment>
}`

/** Animated waterfall ribbon + splash pool + rising mist. Origin = centre of the fall's base; plane faces +z. */
export default function Waterfall({ position = [0, 0, 0], rotation = [0, 0, 0], quaternion, pool = true, width = 2, height = 7, bright = 0.8, tint = '#ffb070', fogged = true, mist = 7 }) {
  const { glow } = getAssets()
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, fog: fogged, side: THREE.DoubleSide,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 }, uBright: { value: bright }, uTint: { value: new THREE.Color(tint) } }]),
  }), [bright, tint, fogged])
  const mists = useRef([])
  const seeds = useMemo(() => Array.from({ length: mist }, (_, i) => ({ s: i * 1.9 + Math.random() * 3, x: (i / mist - 0.5) * width * 1.2 })), [mist, width])
  useFrame((st) => {
    const t = st.clock.elapsedTime
    mat.uniforms.uTime.value = t
    seeds.forEach((m, i) => {
      const sp = mists.current[i]; if (!sp) return
      const k = (t * 0.18 + m.s) % 1
      sp.position.set(m.x + Math.sin(t * 0.5 + m.s) * 0.3, 0.2 + k * Math.max(1.4, height * 0.16), 0.5 + Math.cos(m.s) * 0.4)
      const sc = (width * 0.9 + k * width * 1.2)
      sp.scale.set(sc, sc * 0.75, 1)
      sp.material.opacity = 0.2 * Math.sin(k * Math.PI)
    })
  })
  return (
    <group position={position} {...(quaternion ? { quaternion } : { rotation })}>
      <mesh material={mat} position={[0, height / 2, 0]}><planeGeometry args={[width, height, 1, 1]} /></mesh>
      {pool && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0.9]}>
        <circleGeometry args={[width * 0.9, 24]} />
        <meshBasicMaterial color="#6fa0b4" transparent opacity={0.45} fog={fogged} depthWrite={false} />
      </mesh>}
      {seeds.map((m, i) => (
        <sprite key={i} ref={(r) => (mists.current[i] = r)}>
          <spriteMaterial map={glow} color="#cfe6f2" transparent opacity={0.15} depthWrite={false} fog={fogged} />
        </sprite>
      ))}
    </group>
  )
}
