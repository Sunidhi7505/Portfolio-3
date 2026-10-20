import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import SectionHeading from './SectionHeading'
import ProjectThumb from './ProjectThumb'
import Icon from './Icon'
import { links, projects } from '../data/portfolioData'
import { BRAND, DISPLAY_NAME } from '../utils/icons'

const label = (k) => DISPLAY_NAME[k] || BRAND[k]?.title || k

export default function Projects() {
  const track = useRef(null)
  const [edge, setEdge] = useState({ start: true, end: false })

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 })
  }, [])

  useEffect(() => {
    measure()
    const el = track.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const page = (dir) => {
    const el = track.current
    if (!el) return
    const card = el.querySelector('.pcard')
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <SectionHeading
        id="projects-title"
        title="Projects"
        action={(
          <div className="pnav">
            <a className="link" href={links.githubRepos} target="_blank" rel="noopener noreferrer">View All Projects <ArrowRight size={14} aria-hidden="true" /></a>
            <button type="button" className="arrow" onClick={() => page(-1)} disabled={edge.start} aria-label="Previous projects"><ChevronLeft size={18} aria-hidden="true" /></button>
            <button type="button" className="arrow" onClick={() => page(1)} disabled={edge.end} aria-label="Next projects"><ChevronRight size={18} aria-hidden="true" /></button>
          </div>
        )}
      />

      <ul ref={track} className="carousel" onScroll={measure} aria-label="Projects">
        {projects.map((p) => (
          <li key={p.id} className="card pcard">
            <div className="pcard__media">
              {p.image ? <img src={p.image} alt={`${p.title} screenshot`} loading="lazy" /> : <ProjectThumb art={p.art} label={p.title} />}
            </div>
            <div className="pcard__body">
              <h3>{p.title}</h3>
              <p className="pcard__desc">{p.description}</p>
              <ul className="tags" aria-label="Technologies used">
                {p.tech.map((t) => <li key={t} className="tag"><Icon name={t} size={12} />{label(t)}</li>)}
              </ul>
              <div className="pcard__actions">
                {p.live && <a className="link" href={p.live} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={14} aria-hidden="true" /> Live Demo<span className="sr-only"> — {p.title}</span></a>}
                {p.github && <a className="link" href={p.github} target="_blank" rel="noopener noreferrer"><Icon name="github" size={14} color="currentColor" /> GitHub<span className="sr-only"> — {p.title}</span></a>}
                {!p.live && !p.github && p.note ? <span className="pcard__note">{p.note}</span> : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
