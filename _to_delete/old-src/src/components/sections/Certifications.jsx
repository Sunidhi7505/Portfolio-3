import { motion } from 'framer-motion'
import { BadgeCheck, ExternalLink } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { certifications } from '../../data/portfolioData'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { fadeUp, stagger, viewportOnce } from '../../utils/motion'

export default function Certifications() {
  const reduced = usePrefersReducedMotion()
  return (
    <section id="certifications" aria-labelledby="cert-title">
      <div className="container">
        <SectionHeading id="cert-title" eyebrow="07 · Certifications" title="Credentials" lede="Certificates link to the files kept on Google Drive. Credential IDs aren’t publicly documented, so none are listed." />
        <motion.ul className="cert-grid" variants={stagger(reduced, 0.1)} initial="hidden" whileInView="show" viewport={viewportOnce}>
          {certifications.map((c) => (
            <motion.li key={c.id} className="card cert-card" variants={fadeUp(reduced)}>
              <span className="icon-tile"><BadgeCheck size={20} aria-hidden="true" /></span>
              <div>
                <h3>{c.name}</h3>
                <p className="muted">{c.issuer} · {c.year}</p>
              </div>
              <a className="btn btn--ghost btn--sm" href={c.url} target="_blank" rel="noopener noreferrer">
                <span>View certificate</span><ExternalLink size={14} aria-hidden="true" />
                <span className="sr-only"> — {c.name} (opens in a new tab)</span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
