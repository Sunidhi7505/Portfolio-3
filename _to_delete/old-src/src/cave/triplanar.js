import * as THREE from 'three'

/**
 * MeshStandardMaterial that samples its diffuse + normal maps triplanar from world position, so an
 * arbitrary displaced mesh (the cave) never shows stretched UVs. `scale` = tiles per world unit.
 */
export function triplanarStandard({ map, normalMap, scale = 0.28, normalScale = 1.2, color = '#ffffff', roughness = 0.95 }) {
  const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 })
  m.onBeforeCompile = (sh) => {
    sh.uniforms.tpMap = { value: map }
    sh.uniforms.tpNormal = { value: normalMap }
    sh.uniforms.tpScale = { value: scale }
    sh.uniforms.tpNS = { value: normalScale }
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 tpP = vec4(position, 1.0); vec3 tpN = normal;
        #ifdef USE_INSTANCING
          tpP = instanceMatrix * tpP; tpN = mat3(instanceMatrix) * tpN;
        #endif
        vWP = (modelMatrix * tpP).xyz; vWN = normalize(mat3(modelMatrix) * tpN);`)
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform sampler2D tpMap; uniform sampler2D tpNormal; uniform float tpScale; uniform float tpNS;')
      .replace('#include <map_fragment>', `
        vec3 tpW = pow(abs(normalize(vWN)), vec3(4.0)); tpW /= (tpW.x + tpW.y + tpW.z);
        vec2 tpX = vWP.zy * tpScale, tpY = vWP.xz * tpScale, tpZ = vWP.xy * tpScale;
        diffuseColor.rgb *= texture2D(tpMap, tpX).rgb * tpW.x + texture2D(tpMap, tpY).rgb * tpW.y + texture2D(tpMap, tpZ).rgb * tpW.z;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.86, 0.74, 0.58), smoothstep(0.55, 0.92, normalize(vWN).y));`)
      .replace('#include <normal_fragment_maps>', `
        {
          vec3 wn = normalize(vWN);
          float nsx = tpNS * mix(1.0, 0.45, smoothstep(0.6, 0.95, wn.y));
          vec3 tx = (texture2D(tpNormal, tpX).xyz * 2.0 - 1.0) * vec3(nsx, nsx, 1.0);
          vec3 ty = (texture2D(tpNormal, tpY).xyz * 2.0 - 1.0) * vec3(nsx, nsx, 1.0);
          vec3 tz = (texture2D(tpNormal, tpZ).xyz * 2.0 - 1.0) * vec3(nsx, nsx, 1.0);
          vec3 nx = vec3(tx.xy + wn.zy, abs(tx.z) * wn.x).zyx;
          vec3 ny = vec3(ty.xy + wn.xz, abs(ty.z) * wn.y).xzy;
          vec3 nz = vec3(tz.xy + wn.xy, abs(tz.z) * wn.z).xyz;
          vec3 wnn = normalize(nx * tpW.x + ny * tpW.y + nz * tpW.z);
          normal = normalize((viewMatrix * vec4(wnn, 0.0)).xyz);
        }`)
  }
  m.customProgramCacheKey = () => 'triplanar-' + scale + '-' + normalScale
  return m
}
