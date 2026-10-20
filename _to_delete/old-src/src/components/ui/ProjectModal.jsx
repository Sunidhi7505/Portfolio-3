import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, X } from 'lucide-react'
import ProjectArt from './ProjectArt'
import TechIcon from './TechIcon'
import { BRAND, DISPLAY_NAME } from '../../utils/icons'

const techLabel = (key) => BRAND[key]?.title || DISPLAY_NAME[key] || key

/** Accessible dialog: Esc closes, focus moves in and returns to the trigger, Tab is trapped. */
export default function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
  const returnFocus = useRef(null)

  useEffect(() => {
    if (!project) return undefined
    returnFocus.current = document.activeElement
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const f = dialogRef.current.querySelectorAll('a[href], button:not([disabled])')
      if (!f.length) return
      const first = f[0]; const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      returnFocus.current?.focus?.()
    }
  }, [project, onClose])

  // Rendered in a portal so it sits above the fixed navbar (<main> creates its own stacking context).
  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            ref={dialogRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeRef} type="button" className="modal__close" onClick={onClose} aria-label="Close case study">
              <X size={20} aria-hidden="true" />
            </button>
            <ProjectArt kind={project.art} />
            <div className="modal__body">
              <p className="eyebrow">{project.subtitle}{project.period ? ` · ${project.period}` : ''}</p>
              <h3 id="modal-title">{project.title}</h3>

              <h4>The problem</h4>
              <p>{project.problem}</p>

              <h4>Highlights</h4>
              <ul className="check-list">
                {project.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>

              <h4>Stack</h4>
              <ul className="tech-chips">
                {project.tech.map((t) => (
                  <li key={t} className="tech-chip"><TechIcon name={t} size={14} /><span>{techLabel(t)}</span></li>
                ))}
              </ul>

              <div className="modal__actions">
                {project.live && (
                  <a className="btn btn--primary" href={project.live} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRight size={18} aria-hidden="true" /><span>Live Demo</span>
                  </a>
                )}
                <a className="btn btn--secondary" href={project.github} target="_blank" rel="noopener noreferrer">
                  <TechIcon name="github" size={18} colored={false} /><span>View Source</span>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
