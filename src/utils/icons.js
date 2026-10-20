/**
 * Technology / platform logo registry.
 * Official brand marks come from the `simple-icons` package (CC0 data; trademarks belong to their owners).
 * Where no official mark exists (Java, VS Code, SQL, generic concepts) a neutral Lucide glyph is used instead
 * of an inaccurate lookalike logo.
 */
import {
  siCplusplus, siCss3, siExpress, siGit, siGithub, siHibernate, siHtml5, siIntellijidea,
  siJavascript, siJsonwebtokens, siLeaflet, siLeetcode, siLinkedin, siMongodb, siMysql,
  siNodedotjs, siPostman, siRazorpay, siReact, siSpring, siSpringboot, siSpringsecurity,
  siApachemaven,
} from 'simple-icons'
import {
  Binary, Boxes, Coffee, Code2, Cpu, Database, HardDrive, Network, Webhook,
} from 'lucide-react'

export const BRAND = {
  cpp: siCplusplus, css3: siCss3, express: siExpress, git: siGit, github: siGithub,
  hibernate: siHibernate, html5: siHtml5, intellij: siIntellijidea, javascript: siJavascript,
  jwt: siJsonwebtokens, leaflet: siLeaflet, leetcode: siLeetcode, linkedin: siLinkedin,
  mongodb: siMongodb, mysql: siMysql, nodejs: siNodedotjs, postman: siPostman,
  razorpay: siRazorpay, react: siReact, spring: siSpring, springboot: siSpringboot,
  springsecurity: siSpringsecurity, maven: siApachemaven,
}

export const GLYPH = {
  java: Coffee, sql: Database, vscode: Code2, rest: Webhook, dsa: Binary, oop: Boxes,
  dbms: Database, os: Cpu, networks: Network, storage: HardDrive,
}

export const DISPLAY_NAME = {
  jwt: 'JWT', html5: 'HTML', css3: 'CSS', springsecurity: 'Spring Security', mongodb: 'MongoDB', cpp: 'C++', leaflet: 'Leaflet.js',
  java: 'Java', sql: 'SQL', vscode: 'VS Code', rest: 'REST APIs', dsa: 'DSA', oop: 'OOP',
  dbms: 'DBMS', os: 'Operating Systems', networks: 'Computer Networks',
}

/** Relative luminance of a hex colour (no #). */
export function luminance(hex) {
  const n = parseInt(hex, 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

/** Brand colour that stays legible on the given theme; otherwise `null` (use the text colour). */
export function readableBrandColor(key, theme) {
  const icon = BRAND[key]
  if (!icon) return null
  const L = luminance(icon.hex)
  if (theme === 'dark' && L < 0.12) return null
  if (theme === 'light' && L > 0.6) return null
  return `#${icon.hex}`
}
