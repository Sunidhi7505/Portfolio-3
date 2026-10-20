import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Briefcase, ChevronDown, MapPin } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../ui/SectionHeading'
import TechIcon from '../ui/TechIcon'
import { experience } from '../../data/portfolioData'
import { BRAND } from '../../utils/icons'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

gsap.registerPlugin(ScrollTrigger)

const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')

function ExperienceCard({ item, defaultOpen, reduced }) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `exp-${item.id}`
  return (
    <motion.article
      className="card timeline__card"
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="timeline__head">
        {/* No company logo asset is bundled (none can be used legitimately), so a monogram tile is shown. */}
        <span className="company-tile" aria-hidden="true">{initials(item.company)}</span>
        <div>
          <p className="pill pill--accent">{item.type}</p>
          <h3>{item.role}</h3>
          <p className="timeline__company">{item.company}</p>
          <p className="timeline__meta">
            <span>{item.period}</span>
            <span><MapPin size={14} aria-hidden="true" /> {item.location}</span>
          </p>
        </div>
      </header>
      <p className="timeline__summary">{item.summary}</p>

      <button type="button" className="expander" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <span>{open ? 'Hide' : 'Show'} key contributions</span>
        <ChevronDown size={18} aria-hidden="true" className={open ? 'is-flipped' : ''} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <ul className="check-list">{item.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="tech-chips" aria-label="Technologies used">
        {item.tech.map((t) => <li key={t} className="tech-chip"><TechIcon name={t} size={14} /><span>{BRAND[t]?.title || t}</span></li>)}
      </ul>
    </motion.article>
  )
}

export default function Experience() {
  const reduced = usePrefersReducedMotion()
  const trackRef = useRef(null)
  const lineRef = useRef(null)

  // Draws the timeline line as the section scrolls through the viewport.
  useEffect(() => {
    if (reduced) return undefined
    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current, { scaleY: 0 }, {
        scaleY: 1, ease: 'none', transformOrigin: 'top',
        scrollTrigger: { trigger: trackRef.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 },
      })
    }, trackRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionHeading id="experience-title" eyebrow="03 · Experience" title="Where I’ve worked" lede="Professional experience to date: one software development internship." />
        <div className="timeline" ref={trackRef}>
          <div className="timeline__rail" aria-hidden="true"><span ref={lineRef} className="timeline__progress" /></div>
          {experience.map((item, i) => (
            <div className="timeline__item" key={item.id}>
              <span className="timeline__dot" aria-hidden="true"><Briefcase size={14} /></span>
              <ExperienceCard item={item} defaultOpen={i === 0} reduced={reduced} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
