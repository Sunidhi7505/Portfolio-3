import { memo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, Maximize2 } from 'lucide-react'
import ProjectArt from './ProjectArt'
import TechIcon from './TechIcon'
import { DISPLAY_NAME, BRAND } from '../../utils/icons'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

const techLabel = (key) => BRAND[key]?.title || DISPLAY_NAME[key] || key

/**
 * Project card with pointer-driven perspective tilt and a moving light glare.
 * Tilt is disabled for reduced-motion users and touch (no hover) automatically via CSS `hover: hover`.
 */
function ProjectCard({ project, onOpen, variants }) {
  const reduced = usePrefersReducedMotion()
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 180, damping: 18 })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 180, damping: 18 })
  const glare = useTransform([mx, my], ([x, y]) => `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.10), transparent 55%)`)

  const onMove = (e) => {
    if (reduced || e.pointerType === 'touch') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => { mx.set(0.5); my.set(0.5) }

  return (
    <motion.article
      className={`project-card ${project.featured ? 'project-card--featured' : ''}`}
      variants={variants}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
      aria-labelledby={`proj-${project.id}`}
    >
      <motion.div className="project-card__glare" style={{ background: glare }} aria-hidden="true" />
      <ProjectArt kind={project.art} />
      <div className="project-card__body">
        <p className="project-card__meta">
          {project.featured ? <span className="pill pill--accent">Featured</span> : null}
          {project.period && <span>{project.period}</span>}
        </p>
        <h3 id={`proj-${project.id}`}>{project.title}</h3>
        <p className="project-card__subtitle">{project.subtitle}</p>
        <p className="project-card__desc">{project.description}</p>

        {/* Revealed more prominently on hover / focus; always present for assistive tech and touch. */}
        <ul className="project-card__features">
          {project.highlights.slice(0, 2).map((h) => <li key={h}>{h}</li>)}
        </ul>

        <ul className="tech-chips" aria-label={`${project.title} technology stack`}>
          {project.tech.map((t) => (
            <li key={t} className="tech-chip"><TechIcon name={t} size={14} /><span>{techLabel(t)}</span></li>
          ))}
        </ul>

        <div className="project-card__actions">
          {project.live ? (
            <a className="btn btn--primary btn--sm" href={project.live} target="_blank" rel="noopener noreferrer">
              <ArrowUpRight size={16} aria-hidden="true" /><span>Live Demo</span><span className="sr-only"> — {project.title} (opens in a new tab)</span>
            </a>
          ) : (
            <span className="pill pill--muted" title="No verified live deployment">Live demo unavailable</span>
          )}
          <a className="btn btn--secondary btn--sm" href={project.github} target="_blank" rel="noopener noreferrer">
            <TechIcon name="github" size={16} colored={false} /><span>View Source</span><span className="sr-only"> — {project.title} on GitHub (opens in a new tab)</span>
          </a>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => onOpen(project)} aria-label={`Open ${project.title} case study`}>
            <Maximize2 size={15} aria-hidden="true" /><span>Case study</span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}
export default memo(ProjectCard)
