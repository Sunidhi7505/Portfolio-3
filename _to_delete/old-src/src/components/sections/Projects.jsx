import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import ProjectCard from '../ui/ProjectCard'
import ProjectModal from '../ui/ProjectModal'
import Reveal from '../ui/Reveal'
import TechIcon from '../ui/TechIcon'
import { moreRepos, projects } from '../../data/portfolioData'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { fadeUp, stagger, viewportOnce } from '../../utils/motion'

export default function Projects() {
  const reduced = usePrefersReducedMotion()
  const [selected, setSelected] = useState(null)
  const close = useCallback(() => setSelected(null), [])
  const featured = projects.filter((p) => p.featured)
  const others = projects.filter((p) => !p.featured)

  return (
    <section id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeading id="projects-title" eyebrow="05 · Projects" title="Things I’ve built" lede="Two live, resume-featured projects first, then other repositories from my GitHub. Live demos are shown only where a working deployment exists." />

        <motion.div className="project-grid project-grid--featured" variants={stagger(reduced, 0.12)} initial="hidden" whileInView="show" viewport={viewportOnce}>
          {featured.map((p) => <ProjectCard key={p.id} project={p} onOpen={setSelected} variants={fadeUp(reduced)} />)}
        </motion.div>

        <motion.div className="project-grid" variants={stagger(reduced, 0.12)} initial="hidden" whileInView="show" viewport={viewportOnce}>
          {others.map((p) => <ProjectCard key={p.id} project={p} onOpen={setSelected} variants={fadeUp(reduced)} />)}
        </motion.div>

        <Reveal className="more-repos">
          <h3 className="mini-title">More on GitHub</h3>
          <ul>
            {moreRepos.map((r) => (
              <li key={r.name}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="repo-link">
                  <TechIcon name="github" size={18} colored={false} />
                  <span><strong>{r.name}</strong><em>{r.text}</em></span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <ProjectModal project={selected} onClose={close} />
    </section>
  )
}
