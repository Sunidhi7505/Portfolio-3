/**
 * Custom SVG illustrations for project cards (no screenshots are available, and none are faked).
 * Colours come from CSS variables so they follow the active theme.
 */
const common = { viewBox: '0 0 320 190', role: 'img', preserveAspectRatio: 'xMidYMid slice' }

function Food() {
  return (
    <svg {...common} aria-label="Illustration of a delivery route on a map">
      <defs>
        <linearGradient id="art-food" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity=".22" />
          <stop offset="1" stopColor="var(--accent-2)" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect width="320" height="190" fill="url(#art-food)" />
      {[...Array(9)].map((_, i) => <line key={`h${i}`} x1="0" x2="320" y1={i * 24} y2={i * 24} stroke="var(--border)" />)}
      {[...Array(14)].map((_, i) => <line key={`v${i}`} y1="0" y2="190" x1={i * 24} x2={i * 24} stroke="var(--border)" />)}
      <path className="art-route" d="M40 150 C 90 150, 80 70, 140 80 S 220 140, 270 50" fill="none" stroke="var(--accent-3)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
      <circle cx="40" cy="150" r="9" fill="var(--accent-2)" />
      <circle cx="40" cy="150" r="4" fill="var(--bg)" />
      <g transform="translate(270 50)">
        <path d="M0 -26 C14 -26 22 -16 22 -6 C22 8 0 26 0 26 C0 26 -22 8 -22 -6 C-22 -16 -14 -26 0 -26Z" fill="var(--accent)" />
        <circle cx="0" cy="-6" r="8" fill="var(--bg)" />
      </g>
      <g transform="translate(140 80)">
        <g className="art-bob">
          <circle r="13" fill="var(--surface-solid)" stroke="var(--accent-3)" strokeWidth="2" />
          <path d="M-6 3 h12 M-4 -2 h8 a4 4 0 0 1 -8 0z" stroke="var(--text)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
}

function Sort() {
  const heights = [60, 110, 40, 140, 90, 70, 125, 50]
  return (
    <svg {...common} aria-label="Illustration of bars being sorted">
      <defs>
        <linearGradient id="art-sort" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-3)" />
        </linearGradient>
      </defs>
      <rect width="320" height="190" fill="var(--accent)" opacity=".07" />
      {heights.map((h, i) => (
        <rect key={i} className="art-bar" style={{ animationDelay: `${i * 0.18}s` }} x={26 + i * 34} y={170 - h} width="22" height={h} rx="5" fill={i === 3 || i === 6 ? 'var(--accent-2)' : 'url(#art-sort)'} />
      ))}
      <line x1="16" x2="304" y1="171" y2="171" stroke="var(--border-strong)" />
    </svg>
  )
}

function Shop() {
  return (
    <svg {...common} aria-label="Illustration of an inventory revenue chart">
      <rect width="320" height="190" fill="var(--accent-2)" opacity=".08" />
      {[40, 80, 120, 160].map((y) => <line key={y} x1="30" x2="300" y1={y} y2={y} stroke="var(--border)" />)}
      {[[44, 90], [92, 55], [140, 110], [188, 40], [236, 85]].map(([x, h], i) => (
        <rect key={i} className="art-bar" style={{ animationDelay: `${i * 0.2}s` }} x={x} y={160 - h} width="32" height={h} rx="6" fill={i % 2 ? 'var(--accent-3)' : 'var(--accent)'} />
      ))}
      <circle cx="270" cy="34" r="16" fill="var(--accent-2)" opacity=".85" />
      <path d="M262 34 h16 M270 26 v16" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function Api() {
  return (
    <svg {...common} aria-label="Illustration of a REST API response and database rows">
      <rect width="320" height="190" fill="var(--accent-3)" opacity=".07" />
      <rect x="24" y="24" width="150" height="142" rx="12" fill="var(--surface-solid)" stroke="var(--border-strong)" />
      <text x="40" y="58" fontFamily="var(--font-mono)" fontSize="20" fill="var(--accent-2)">{'{ }'}</text>
      {[84, 104, 124, 144].map((y, i) => <rect key={y} x="40" y={y - 8} width={[96, 70, 110, 58][i]} height="8" rx="4" fill="var(--text-faint)" opacity=".55" />)}
      <rect x="190" y="40" width="108" height="26" rx="8" fill="var(--accent)" opacity=".9" />
      {[78, 104, 130].map((y) => <rect key={y} x="190" y={y} width="108" height="20" rx="7" fill="none" stroke="var(--border-strong)" />)}
      <path className="art-route" d="M174 95 H190" stroke="var(--accent-3)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

const ART = { food: Food, sort: Sort, shop: Shop, api: Api }

export default function ProjectArt({ kind }) {
  const Art = ART[kind] || Api
  return <div className="project-art"><Art /></div>
}
