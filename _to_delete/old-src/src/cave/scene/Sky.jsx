import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeMountains } from '../textures'
import { POINTS } from '../path'
import Exterior from './Exterior'

const skyVert = /* glsl */`
varying vec3 vDir;
void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.); gl_Position = p.xyww; }`
const skyFrag = /* glsl */`
varying vec3 vDir; uniform float uTime;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*n(p); p*=2.03; a*=.5;} return s; }
void main(){
  vec3 d = normalize(vDir);
  float y = d.y;
  // ---- daytime sky (looking out of the cave mouth, +z)
  vec3 dayTop = vec3(.10,.34,.78), dayHor = vec3(.62,.82,.98);
  vec3 day = mix(dayHor, dayTop, smoothstep(0., .38, y));
  vec3 sunD = normalize(vec3(-.35,.32,.88));
  float sd = max(dot(d, sunD), 0.);
  day += vec3(1.,.86,.55) * (pow(sd, 6.)*.35 + pow(sd, 180.)*2.2);
  // ---- sunrise sky (looking out of the exit, -z)
  vec3 srTop = vec3(.16,.17,.42), srMid = vec3(.85,.42,.42), srHor = vec3(1.,.72,.36);
  vec3 sr = mix(srHor, srMid, smoothstep(0., .22, y));
  sr = mix(sr, srTop, smoothstep(.12, .75, y));
  vec3 sunR = normalize(vec3(.12,.07,-1.));
  float sr2 = max(dot(d, sunR), 0.);
  sr += vec3(1.,.6,.25) * (pow(sr2, 5.)*.55 + pow(sr2, 60.)*.9) + vec3(1.,.9,.6) * pow(sr2, 700.) * 3.;
  float m = smoothstep(-.35, .35, d.z);
  vec3 col = mix(sr, day, m);
  // clouds
  vec2 cp = d.xz / (abs(y) + .32) * 1.6 + vec2(uTime*.004, 0.);
  float c = smoothstep(.5, .85, fbm(cp*1.4)) * smoothstep(.0, .25, y);
  vec3 cloudCol = mix(vec3(1.,.74,.55), vec3(1.), m);
  col = mix(col, cloudCol, c * .75);
  // below the horizon: haze
  col = mix(col, mix(vec3(.85,.62,.45), vec3(.78,.86,.95), m), smoothstep(0., -.35, y) * .85);
  gl_FragColor = vec4(col, 1.);
}`

function SkyDome() {
  const ref = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false, uniforms: { uTime: { value: 0 } } }), [])
  useFrame((s) => { ref.current.position.copy(s.camera.position); mat.uniforms.uTime.value = s.clock.elapsedTime })
  return <mesh ref={ref} material={mat} renderOrder={-10} frustumCulled={false}><sphereGeometry args={[800, 32, 16]} /></mesh>
}

/** One mountain band; `warm` tints it for the sunrise side. */
function Range({ z, y, w, h, tex, dir = 1, x = 0 }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, dir > 0 ? Math.PI : 0, 0]} renderOrder={-5}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent fog={false} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Mountains({ quality }) {
  const tex = useMemo(() => {
    const w = quality === 'lite' ? 768 : 1536
    return {
      d1: makeMountains({ w, h: 384, seed: 2, base: [150, 176, 214], snow: [250, 252, 255], top: 0.28, rough: 0.7 }),
      d2: makeMountains({ w, h: 384, seed: 5, base: [96, 128, 164], snow: [235, 244, 255], top: 0.2, rough: 0.55 }),
      d3: makeMountains({ w, h: 384, seed: 9, base: [58, 92, 90], snow: [200, 220, 210], top: 0.12, rough: 0.35 }),
      s1: makeMountains({ w, h: 384, seed: 12, base: [232, 150, 110], snow: [255, 224, 190], top: 0.24, rough: 0.65 }),
      s2: makeMountains({ w, h: 384, seed: 15, base: [150, 96, 112], snow: [255, 200, 170], top: 0.16, rough: 0.5 }),
      s3: makeMountains({ w, h: 384, seed: 18, base: [70, 52, 70], snow: [200, 150, 140], top: 0.1, rough: 0.35 }),
    }
  }, [quality])
  const exit = POINTS[POINTS.length - 1]
  return (
    <group>
      {/* daylight vista beyond the entrance */}
      <Range tex={tex.d1} z={560} y={150} w={2000} h={700} />
      <Range tex={tex.d2} z={420} y={70} w={1500} h={520} x={-60} />
      <Range tex={tex.d3} z={260} y={10} w={1000} h={300} x={40} />
      {/* sunrise vista beyond the exit */}
      <Range tex={tex.s1} z={exit.z - 560} y={exit.y + 150} w={2000} h={700} dir={-1} />
      <Range tex={tex.s2} z={exit.z - 420} y={exit.y + 70} w={1500} h={520} dir={-1} x={50} />
      <Range tex={tex.s3} z={exit.z - 260} y={exit.y + 10} w={1000} h={300} dir={-1} x={-30} />
    </group>
  )
}

export default function Vista({ quality = 'full' }) {
  return (
    <group>
      <SkyDome />
      <Mountains quality={quality} />
      <Exterior quality={quality} />
    </group>
  )
}
