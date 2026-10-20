import { BRAND, GLYPH, readableBrandColor } from '../utils/icons'

/** Official brand mark (simple-icons) in its own colour when legible, else a neutral glyph / monogram. */
export default function Icon({ name, size = 20, monogram, color }) {
  const brand = BRAND[name]
  if (brand) {
    const fill = color || readableBrandColor(name, 'light') || 'var(--text)'
    return <svg className="brandmark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={fill}><path d={brand.path} /></svg>
  }
  const Glyph = GLYPH[name]
  if (Glyph) return <Glyph size={size} strokeWidth={1.7} aria-hidden="true" color={color || 'var(--accent)'} />
  return <span className="mono" style={{ width: size, height: size, fontSize: size * 0.5 }} aria-hidden="true">{monogram || '•'}</span>
}
