import { memo } from 'react'
import { BRAND, GLYPH, readableBrandColor } from '../../utils/icons'
import { useTheme } from '../../hooks/useTheme'

/**
 * Renders an official brand mark (simple-icons) or a neutral glyph when no official logo exists.
 * Decorative by default — pair with a visible text label.
 */
function TechIcon({ name, size = 22, colored = true, monogram }) {
  const { theme } = useTheme()
  const brand = BRAND[name]
  if (brand) {
    const color = colored ? readableBrandColor(name, theme) : null
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={color || 'currentColor'}>
        <path d={brand.path} />
      </svg>
    )
  }
  const Glyph = GLYPH[name]
  if (Glyph) return <Glyph size={size} aria-hidden="true" strokeWidth={1.6} />
  // Neutral monogram tile (used for Codolio — no official logo is bundled).
  return (
    <span className="mono-tile" style={{ width: size, height: size, fontSize: size * 0.58 }} aria-hidden="true">
      {monogram || '•'}
    </span>
  )
}
export default memo(TechIcon)
