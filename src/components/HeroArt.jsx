/**
 * Soft mountain landscape with an abstract avatar. Purely decorative.
 * The abstract avatar is only drawn when no real photo is configured (`profile.photo` in src/data/portfolioData.js).
 */
export default function HeroArt({ avatar = true }) {
  return (
    <svg className="heroart" viewBox="0 0 420 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ha-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6eefb" /><stop offset="1" stopColor="#f6f9fd" /></linearGradient>
        <linearGradient id="ha-mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6f9fd" stopOpacity="0" /><stop offset="1" stopColor="#f6f9fd" stopOpacity=".95" /></linearGradient>
        <linearGradient id="ha-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2d4a8f" /><stop offset="1" stopColor="#16285a" /></linearGradient>
        <linearGradient id="ha-head" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a9bde3" /><stop offset="1" stopColor="#8aa3d0" /></linearGradient>
      </defs>
      <rect width="420" height="380" fill="url(#ha-sky)" />
      <circle cx="262" cy="196" r="140" fill="#d9e6f8" />
      <path d="M0 262 L64 186 L112 226 L186 126 L268 236 L334 178 L420 258 V380 H0Z" fill="#cddcf1" />
      <path d="M186 126 L168 150 L182 146 L192 156 L204 146 L216 152Z" fill="#f4f8fe" opacity=".9" />
      <path d="M0 310 L84 232 L146 284 L240 204 L330 288 L420 244 V380 H0Z" fill="#b8cbe9" />
      <path d="M240 204 L222 224 L236 220 L246 230 L258 220 L270 226Z" fill="#f4f8fe" opacity=".85" />
      <g fill="#aebfdb" opacity=".75">
        <path d="M28 330 L46 262 L64 330Z" /><path d="M32 296 L46 246 L60 296Z" /><path d="M36 262 L46 226 L56 262Z" />
        <path d="M62 340 L76 290 L90 340Z" /><path d="M66 308 L76 270 L86 308Z" />
      </g>
      <rect y="250" width="420" height="130" fill="url(#ha-mist)" />
      {avatar && (
      <g transform="translate(262 380)">
        <path d="M-118 0 C-118 -64 -64 -92 0 -92 C64 -92 118 -64 118 0Z" fill="url(#ha-body)" />
        <path d="M-26 -92 L0 -62 L26 -92Z" fill="#f4f8fe" opacity=".92" />
        <rect x="-15" y="-120" width="30" height="34" rx="12" fill="#7f98c7" />
        <ellipse cx="0" cy="-152" rx="40" ry="46" fill="url(#ha-head)" />
        <path d="M-41 -158 C-38 -204 36 -208 41 -158 C28 -178 -26 -178 -41 -158Z" fill="#1d3170" />
      </g>
      )}
    </svg>
  )
}
