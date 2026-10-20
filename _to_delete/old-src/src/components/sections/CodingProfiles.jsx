import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import TechIcon from '../ui/TechIcon'
import { codingProfiles } from '../../data/portfolioData'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { fadeUp, stagger, viewportOnce } from '../../utils/motion'

export default function CodingProfiles() {
  const reduced = usePrefersReducedMotion()
  return (
    <section id="coding" aria-labelledby="coding-title">
      <div className="container">
        <SectionHeading id="coding-title" eyebrow="09 · Coding profiles" title="Practice in public" lede="Where my problem solving and code live. Statistics are snapshots from 19 Oct 2026 and don’t update automatically." />
        <motion.ul className="profile-grid" variants={stagger(reduced, 0.1)} initial="hidden" whileInView="show" viewport={viewportOnce}>
          {codingProfiles.map((p) => (
            <motion.li key={p.id} className="card profile-card" variants={fadeUp(reduced)}>
              <header>
                <span className="icon-tile icon-tile--lg"><TechIcon name={p.logo} monogram={p.monogram} size={26} colored={p.logo === 'leetcode'} /></span>
                <div><h3>{p.name}</h3><p className="muted">@{p.handle}</p></div>
              </header>
              <p>{p.description}</p>
              {p.stats.length > 0 && (
                <dl className="profile-stats">
                  {p.stats.map((s) => (
                    <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
                  ))}
                </dl>
              )}
              <p className="muted small">{p.footnote}</p>
              <a className="btn btn--secondary btn--sm" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.name} profile (opens in a new tab)`}>
                <span>Open {p.name}</span><ExternalLink size={14} aria-hidden="true" />
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
