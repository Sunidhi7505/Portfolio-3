import { BRAND, GLYPH, readableBrandColor } from '../../utils/icons'

/** Brand mark (simple-icons) or neutral glyph, tinted for a light parchment background. No theme context needed. */
export default function CaveIcon({ name, size = 20, monogram }) {
  const brand = BRAND[name]
  if (brand) {
    const color = readableBrandColor(name, 'light') || '#2b1d0e'
    return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={color}><path d={brand.path} /></svg>
  }
  const Glyph = GLYPH[name]
  if (Glyph) return <Glyph size={size} strokeWidth={1.8} aria-hidden="true" color="#7a4a14" />
  return <span className="cv-mono" style={{ width: size, height: size, fontSize: size * 0.6 }} aria-hidden="true">{monogram || '•'}</span>
}
