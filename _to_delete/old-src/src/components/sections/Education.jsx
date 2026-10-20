import { motion } from 'framer-motion'
import { GraduationCap, MapPin } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import { education } from '../../data/portfolioData'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { fadeUp, stagger, viewportOnce } from '../../utils/motion'

export default function Education() {
  const reduced = usePrefersReducedMotion()
  return (
    <section id="education" aria-labelledby="education-title">
      <div className="container">
        <SectionHeading id="education-title" eyebrow="06 · Education" title="Where I studied" />
        <motion.ol className="edu-list" variants={stagger(reduced, 0.1)} initial="hidden" whileInView="show" viewport={viewportOnce}>
          {education.map((e, i) => (
            <motion.li key={e.id} className={`card edu-card ${i === 0 ? 'edu-card--primary' : ''}`} variants={fadeUp(reduced)}>
              <span className="icon-tile"><GraduationCap size={20} aria-hidden="true" /></span>
              <div className="edu-card__body">
                <p className="edu-card__period">{e.period}</p>
                <h3>{e.degree}</h3>
                <p className="edu-card__inst">{e.institution}</p>
                <p className="muted"><MapPin size={14} aria-hidden="true" /> {e.location}</p>
                {e.highlights.map((h) => <p key={h} className="edu-card__hl">{h}</p>)}
              </div>
              <p className="edu-card__score"><span>{i === 0 ? 'CGPA' : 'Score'}</span>{e.score.replace(' CGPA', '')}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
