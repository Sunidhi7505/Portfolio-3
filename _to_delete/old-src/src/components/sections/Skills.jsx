import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Code2, Cpu, Database, Layout, Server, Wrench } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import TechIcon from '../ui/TechIcon'
import { orbitSkills, skillCategories } from '../../data/portfolioData'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

const CAT_ICONS = { Code2, Server, Layout, Database, Wrench, Cpu }

/** Decorative CSS orbit of the core stack. The accessible list of skills is the tabbed panel beside it. */
function Orbit() {
  const inner = orbitSkills.slice(0, 4)
  const outer = orbitSkills.slice(4)
  const ring = (items, r, dur, rev) => (
    <div className="orbit__ring" style={{ '--r': `${r}px`, '--dur': `${dur}s`, animationDirection: rev ? 'reverse' : 'normal' }}>
      {items.map((k, i) => (
        <div className="orbit__item" key={k} style={{ '--a': `${(360 / items.length) * i}deg` }}>
          <div className="orbit__upright">
            <div className="orbit__badge" style={{ animationDirection: rev ? 'normal' : 'reverse', animationDuration: `${dur}s` }}>
              <TechIcon name={k} size={26} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
  return (
    <div className="orbit-wrap" aria-hidden="true">
      <div className="orbit">
        <div className="orbit__path orbit__path--1" />
        <div className="orbit__path orbit__path--2" />
        <div className="orbit__core"><span>Core<br />stack</span></div>
        {ring(inner, 92, 36, false)}
        {ring(outer, 150, 56, true)}
      </div>
    </div>
  )
}

export default function Skills() {
  const reduced = usePrefersReducedMotion()
  const [activeId, setActiveId] = useState(skillCategories[0].id)
  const tabRefs = useRef({})
  const active = useMemo(() => skillCategories.find((c) => c.id === activeId), [activeId])

  const onKey = (e) => {
    const i = skillCategories.findIndex((c) => c.id === activeId)
    let n = i
    if (e.key === 'ArrowRight') n = (i + 1) % skillCategories.length
    else if (e.key === 'ArrowLeft') n = (i - 1 + skillCategories.length) % skillCategories.length
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = skillCategories.length - 1
    else return
    e.preventDefault()
    setActiveId(skillCategories[n].id)
    tabRefs.current[skillCategories[n].id]?.focus()
  }

  return (
    <section id="skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeading id="skills-title" eyebrow="04 · Skills" title="Tools I build with" lede="Taken from my resume and projects. No made-up percentages — just the technologies and where I’ve used them." />

        <div className="skills__grid">
          <Orbit />

          <div className="skills__panel">
            <div className="tabs" role="tablist" aria-label="Skill categories" onKeyDown={onKey}>
              {skillCategories.map((c) => {
                const Icon = CAT_ICONS[c.icon] || Code2
                const selected = c.id === activeId
                return (
                  <button
                    key={c.id}
                    ref={(el) => { tabRefs.current[c.id] = el }}
                    role="tab"
                    id={`tab-${c.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${c.id}`}
                    tabIndex={selected ? 0 : -1}
                    className={`tab ${selected ? 'is-active' : ''}`}
                    onClick={() => setActiveId(c.id)}
                  >
                    <Icon size={16} aria-hidden="true" /><span>{c.label}</span>
                  </button>
                )
              })}
            </div>

            <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} className="skills__cards" tabIndex={0}>
              <AnimatePresence mode="wait">
                <motion.ul
                  key={active.id}
                  className="skill-grid"
                  initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {active.skills.map((s) => (
                    <li key={s.name} className="skill-card" tabIndex={0}>
                      <span className="skill-card__icon"><TechIcon name={s.logo} size={28} /></span>
                      <span className="skill-card__name">{s.name}</span>
                      <span className="skill-card__note">{s.note}{s.source ? ` (${s.source})` : ''}</span>
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
