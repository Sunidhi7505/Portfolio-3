/**
 * Flat SVG stand-in for the 3D avatar. Shown when WebGL is unavailable or the 3D scene fails to load,
 * so the hero keeps its composition and the rest of the site stays fully usable.
 */
export default function SceneFallback() {
  return (
    <div className="scene-fallback" aria-hidden="true">
      <svg viewBox="0 0 240 360" role="presentation">
        <defs>
          <radialGradient id="fb-halo" cx="50%" cy="45%" r="55%">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".35" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fb-blazer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle cx="120" cy="150" r="140" fill="url(#fb-halo)" />
        <ellipse cx="120" cy="338" rx="70" ry="9" fill="var(--text)" opacity=".12" />
        {/* trousers + shoes */}
        <rect x="88" y="214" width="30" height="112" rx="12" fill="var(--text)" opacity=".75" />
        <rect x="122" y="214" width="30" height="112" rx="12" fill="var(--text)" opacity=".75" />
        <ellipse cx="102" cy="330" rx="18" ry="7" fill="var(--text)" />
        <ellipse cx="138" cy="330" rx="18" ry="7" fill="var(--text)" />
        {/* arms folded */}
        <path d="M70 120 C52 150 56 196 88 200 L150 186" fill="none" stroke="url(#fb-blazer)" strokeWidth="20" strokeLinecap="round" />
        <path d="M170 120 C188 150 184 196 152 200 L90 186" fill="none" stroke="url(#fb-blazer)" strokeWidth="20" strokeLinecap="round" opacity=".92" />
        {/* blazer */}
        <path d="M76 112 Q120 96 164 112 L170 226 Q120 238 70 226 Z" fill="url(#fb-blazer)" />
        <path d="M104 106 L120 160 L136 106 Z" fill="var(--bg)" />
        {/* head */}
        <rect x="108" y="86" width="24" height="24" rx="8" fill="#d9a77f" />
        <ellipse cx="120" cy="64" rx="30" ry="34" fill="#d9a77f" />
        <path d="M88 64 C86 28 154 24 152 64 C140 46 108 44 88 64Z" fill="#1c1620" />
        <circle cx="120" cy="40" r="6" fill="#1c1620" opacity="0" />
      </svg>
    </div>
  )
}
