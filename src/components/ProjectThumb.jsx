/**
 * Placeholder project thumbnails (16:9 SVG illustrations, no real screenshots yet).
 * Replace by setting `image` on a project in src/data/portfolioData.js.
 */
const THEMES = {
  food:      ['#fff4e5', '#ffe3c2', '#f59e0b'],
  sort:      ['#e8f0ff', '#d4e2ff', '#2557d6'],
  visitor:   ['#e7f6f1', '#cfeee3', '#0f9d77'],
  api:       ['#eef0fb', '#dde1f7', '#4f46e5'],
  news:      ['#eef3f7', '#dde7ef', '#334e68'],
  headphone: ['#f3eefb', '#e6dbf6', '#7c3aed'],
  netflix:   ['#fdecee', '#f9d6da', '#e5484d'],
}

const QR = ['1110111', '1010101', '1110111', '0001000', '1101011', '0110100', '1011101']

function Content({ art, c }) {
  switch (art) {
    case 'food':
      return (
        <>
          <circle cx="92" cy="104" r="36" fill="#fff" stroke="#f3d3a6" strokeWidth="3" />
          <circle cx="92" cy="104" r="24" fill="#fde7c4" />
          <circle cx="84" cy="98" r="7" fill="#ef6b4a" /><circle cx="100" cy="96" r="6" fill="#59b85c" /><circle cx="94" cy="112" r="7" fill="#f5b83d" />
          <rect x="150" y="68" width="110" height="9" rx="4.5" fill="#fff" /><rect x="150" y="86" width="84" height="7" rx="3.5" fill="#fff" opacity=".7" />
          <path d="M156 126 q22 -22 44 -6 t44 -10" fill="none" stroke={c} strokeWidth="2.4" strokeDasharray="4 4" />
          <circle cx="244" cy="110" r="7" fill={c} /><circle cx="244" cy="110" r="2.6" fill="#fff" />
          <rect x="150" y="136" width="64" height="16" rx="8" fill={c} />
        </>
      )
    case 'sort': {
      const hs = [34, 58, 24, 76, 46, 88, 30, 64, 52, 70, 40, 82]
      return (
        <>
          {hs.map((h, i) => <rect key={i} x={48 + i * 20} y={150 - h} width="13" height={h} rx="3" fill={i === 5 || i === 6 ? '#f59e0b' : c} opacity={i === 5 || i === 6 ? 1 : 0.35 + (i % 4) * 0.15} />)}
          <rect x="44" y="152" width="236" height="3" rx="1.5" fill="#fff" />
        </>
      )
    }
    case 'visitor':
      return (
        <>
          <rect x="50" y="68" width="78" height="78" rx="8" fill="#fff" />
          {QR.map((row, y) => row.split('').map((v, x) => v === '1' ? <rect key={`${x}-${y}`} x={58 + x * 9.6} y={76 + y * 9.6} width="8" height="8" rx="1.5" fill="#12234f" /> : null))}
          <rect x="150" y="68" width="116" height="78" rx="8" fill="#fff" />
          <circle cx="174" cy="92" r="11" fill="#cfeee3" /><rect x="192" y="86" width="56" height="7" rx="3.5" fill="#dfe6ee" /><rect x="192" y="98" width="38" height="6" rx="3" fill="#e9eef4" />
          <rect x="162" y="118" width="92" height="7" rx="3.5" fill="#e9eef4" />
          <rect x="162" y="130" width="52" height="10" rx="5" fill={c} />
          <path d="M229 135 l3.5 3.5 6 -7" fill="none" stroke="#fff" strokeWidth="2" />
        </>
      )
    case 'api':
      return (
        <>
          {[['GET', '#0f9d77', 96], ['POST', '#2557d6', 70], ['PUT', '#f59e0b', 84], ['DELETE', '#e5484d', 60]].map(([m, col, w], i) => (
            <g key={m} transform={`translate(54 ${62 + i * 22})`}>
              <rect width="46" height="16" rx="4" fill={col} /><text x="23" y="11.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">{m}</text>
              <rect x="56" y="3" width={w + 40} height="10" rx="5" fill="#fff" />
              <rect x="206" y="3" width="26" height="10" rx="5" fill={col} opacity=".22" />
            </g>
          ))}
        </>
      )
    case 'news':
      return (
        <>
          <rect x="50" y="66" width="112" height="80" rx="8" fill="#fff" /><rect x="58" y="74" width="96" height="44" rx="5" fill="#c9d8e6" />
          <path d="M58 118 l28 -22 20 14 16 -10 32 18z" fill="#9db4cb" /><rect x="58" y="126" width="80" height="7" rx="3.5" fill="#e3eaf1" /><rect x="58" y="137" width="52" height="5" rx="2.5" fill="#edf1f6" />
          {[0, 1, 2].map((i) => <g key={i} transform={`translate(176 ${68 + i * 27})`}><rect width="90" height="22" rx="6" fill="#fff" /><rect x="8" y="6" width="58" height="5" rx="2.5" fill="#dfe6ee" /><rect x="8" y="14" width="36" height="4" rx="2" fill="#ebf0f5" /></g>)}
        </>
      )
    case 'headphone':
      return (
        <>
          <path d="M104 118 a56 56 0 0 1 112 0" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" />
          <rect x="92" y="110" width="26" height="42" rx="12" fill="#fff" stroke={c} strokeWidth="3" /><rect x="202" y="110" width="26" height="42" rx="12" fill="#fff" stroke={c} strokeWidth="3" />
          <rect x="140" y="146" width="40" height="9" rx="4.5" fill="#fff" />
        </>
      )
    case 'netflix':
      return (
        <>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={46 + i * 62} y="106" width="52" height="42" rx="6" fill="#fff" opacity={0.95 - i * 0.12} />)}
          <rect x="46" y="62" width="236" height="36" rx="8" fill="#fff" />
          <circle cx="76" cy="80" r="11" fill={c} /><path d="M72.5 74.5 l10 5.5 -10 5.5z" fill="#fff" />
          <rect x="98" y="72" width="100" height="7" rx="3.5" fill="#dfe6ee" /><rect x="98" y="84" width="66" height="5" rx="2.5" fill="#ebf0f5" />
        </>
      )
    default:
      return null
  }
}

export default function ProjectThumb({ art, label }) {
  const [a, b, c] = THEMES[art] || THEMES.sort
  const gid = `pt-${art}`
  return (
    <svg className="pthumb" viewBox="0 0 320 180" role="img" aria-label={`${label} — illustrative placeholder thumbnail`} preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <rect width="320" height="180" fill={`url(#${gid})`} />
      <rect x="22" y="20" width="276" height="148" rx="12" fill="#fff" opacity=".55" />
      <circle cx="40" cy="36" r="3.5" fill={c} opacity=".55" /><circle cx="52" cy="36" r="3.5" fill={c} opacity=".35" /><circle cx="64" cy="36" r="3.5" fill={c} opacity=".2" />
      <Content art={art} c={c} />
    </svg>
  )
}
