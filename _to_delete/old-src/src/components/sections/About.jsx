import { motion } from 'framer-motion'
import { BookOpen, Binary, Layers, ShieldCheck, Webhook } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'
import Counter from '../ui/Counter'
import TechIcon from '../ui/TechIcon'
import { about, education, orbitSkills, profile } from '../../data/portfolioData'
import { BRAND, DISPLAY_NAME } from '../../utils/icons'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { stagger, fadeUp, viewportOnce } from '../../utils/motion'

const INTEREST_ICONS = [Webhook, ShieldCheck, Binary, Layers]

export default function About() {
  const reduced = usePrefersReducedMotion()
  const cu = education[0]
  return (
    <section id="about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading id="about-title" eyebrow="01 · About" title="Backend-minded, full-stack in practice" />

        <div className="about__grid">
          <div className="about__text">
            {about.summary.map((p, i) => (
              <Reveal as="p" key={i} delay={i * 0.06}>{p}</Reveal>
            ))}
            <Reveal as="blockquote" className="about__quote">{about.philosophy}</Reveal>

            <Reveal className="about__tech">
              <h3 className="mini-title">Technologies I work with</h3>
              <ul className="tech-chips tech-chips--lg">
                {orbitSkills.map((k) => (
                  <li key={k} className="tech-chip">
                    <TechIcon name={k} size={16} />
                    <span>{BRAND[k]?.title || DISPLAY_NAME[k]}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="about__side">
            <motion.ul className="interest-grid" variants={stagger(reduced)} initial="hidden" whileInView="show" viewport={viewportOnce}>
              {about.interests.map((it, i) => {
                const Icon = INTEREST_ICONS[i % INTEREST_ICONS.length]
                return (
                  <motion.li key={it.title} className="card interest-card" variants={fadeUp(reduced)}>
                    <span className="icon-tile"><Icon size={20} aria-hidden="true" /></span>
                    <h3>{it.title}</h3>
                    <p>{it.text}</p>
                  </motion.li>
                )
              })}
            </motion.ul>

            <Reveal className="card edu-glance">
              <span className="icon-tile"><BookOpen size={20} aria-hidden="true" /></span>
              <div>
                <h3 className="mini-title">Education at a glance</h3>
                <p><strong>{cu.degree}</strong></p>
                <p className="muted">{cu.institution} · {cu.period} · {cu.score}</p>
              </div>
            </Reveal>
          </div>
        </div>

        <ul className="stat-row" aria-label={`${profile.firstName}'s highlights`}>
          {about.highlights.map((h) => (
            <Reveal as="li" key={h.label} className="stat">
              <Counter className="stat__value" value={h.value} decimals={h.decimals} suffix={h.suffix} />
              <span className="stat__label">{h.label}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
