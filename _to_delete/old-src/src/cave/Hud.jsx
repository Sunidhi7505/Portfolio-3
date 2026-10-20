import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown, ArrowUp, ArrowUpRight, ChevronDown, ChevronUp, Coffee, FileText, LayoutList, Volume2, VolumeX, X } from 'lucide-react'
import { CHAMBER_LABELS } from './path'
import { CHAMBER_COUNT, jumpTo, useActiveChamber } from './store'
import ParchmentPanel from './panels/ParchmentPanel'
import CaveIcon from './panels/CaveIcon'
import { BRAND, DISPLAY_NAME } from '../utils/icons'
import { createAmbience } from './audio'
import { links, profile } from '../data/portfolioData'

const techLabel = (k) => BRAND[k]?.title || DISPLAY_NAME[k] || k

/* ───────────── top nav (wooden plank) ───────────── */
export function CaveNav({ sound, onExit }) {
  const active = useActiveChamber()
  return (
    <header className="cv-nav">
      <button type="button" className="cv-brand" onClick={() => jumpTo(0)} aria-label={`${profile.name} — back to the cave entrance`}>
        <span className="cv-brand__mono" aria-hidden="true">{profile.monogram}</span>
        <span className="cv-brand__name">{profile.name}</span>
      </button>
      <nav aria-label="Cave chambers" className="cv-nav__list">
        {CHAMBER_LABELS.map((l, i) => (
          <button key={l} type="button" className="cv-nav__btn" aria-current={i === active ? 'step' : undefined} onClick={() => jumpTo(i)}>
            <span>{l}</span>
          </button>
        ))}
      </nav>
      <div className="cv-nav__tools">
        {sound}
        <button type="button" className="cv-tool" onClick={onExit} title="Skip the journey — plain, fast page">
          <LayoutList size={16} aria-hidden="true" /><span className="cv-tool__txt">Classic view</span>
        </button>
      </div>
    </header>
  )
}

/* ───────────── sound toggle + volume ───────────── */
export function useAmbience(progressRef) {
  const amb = useRef(null)
  const [on, setOn] = useState(false)
  const [vol, setVol] = useState(() => { try { const v = parseFloat(localStorage.getItem('cave-vol')); return Number.isFinite(v) ? v : 0.6 } catch { return 0.6 } })
  if (!amb.current) amb.current = createAmbience()
  useEffect(() => {
    const a = amb.current
    const onVis = () => (document.hidden ? a.suspend() : a.resume())
    document.addEventListener('visibilitychange', onVis)
    const id = setInterval(() => a.setProgress(progressRef.current), 400)
    return () => { document.removeEventListener('visibilitychange', onVis); clearInterval(id); a.dispose() }
  }, [progressRef])
  const toggle = () => { const a = amb.current; if (on) { a.stop(); setOn(false) } else { a.setVolume(vol); a.start(); setOn(true) } }
  const change = (v) => { setVol(v); amb.current.setVolume(v); try { localStorage.setItem('cave-vol', String(v)) } catch { /* private mode */ } }
  const ui = (
    <div className="cv-sound">
      <button type="button" className="cv-tool" aria-pressed={on} onClick={toggle} title={on ? 'Mute ambient sound' : 'Play ambient cave sound (off by default)'}>
        {on ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
        <span className="cv-tool__txt">{on ? 'Sound on' : 'Sound off'}</span>
      </button>
      {on && <label className="cv-vol"><span className="sr-only">Volume</span><input type="range" min="0" max="1" step="0.05" value={vol} onChange={(e) => change(parseFloat(e.target.value))} /></label>}
    </div>
  )
  return ui
}

/* ───────────── hero overlay (entrance chamber) ───────────── */
export function Hero({ heroRef }) {
  return (
    <div className="cv-hero" ref={heroRef}>
      <div className="cv-nameplate">
        <span className="cv-chain cv-chain--l" aria-hidden="true" /><span className="cv-chain cv-chain--r" aria-hidden="true" />
        <div className="cv-emblem" aria-hidden="true"><Coffee size={26} strokeWidth={1.6} /><b>Java</b></div>
        <div className="cv-nameplate__txt">
          <h1>{profile.name}</h1>
          <p>{profile.roles[1]}</p>
        </div>
      </div>
      <div className="cv-hero__sub">
        <p className="cv-hero__headline">{profile.headline}</p>
        <p className="cv-hero__tag">{profile.tagline}</p>
      </div>
      <div className="cv-hero__actions">
        <a className="cv-hbtn cv-hbtn--primary" href={links.resumeView} target="_blank" rel="noopener noreferrer"><FileText size={17} aria-hidden="true" /> View Resume</a>
        <button type="button" className="cv-hbtn" onClick={() => jumpTo(5)}>Explore Projects</button>
        <button type="button" className="cv-hbtn" onClick={() => jumpTo(9)}>Contact Me</button>
      </div>
      <button type="button" className="cv-scrollhint" onClick={() => jumpTo(1)}>Scroll to Explore <ArrowDown size={16} aria-hidden="true" /></button>
    </div>
  )
}

/* ───────────── mobile: stepper + bottom sheet ───────────── */
export function MobileControls({ onOpenProject }) {
  const active = useActiveChamber()
  const [open, setOpen] = useState(true)
  useEffect(() => setOpen(true), [active])
  const id = ['gate', 'about', 'education', 'experience', 'skills', 'projects', 'certifications', 'achievements', 'coding', 'contact'][active]
  return (
    <>
      <div className={`cv-step ${active === 0 ? 'cv-step--hero' : ''}`} role="group" aria-label="Move through the cave">
        <button type="button" onClick={() => jumpTo(active - 1)} disabled={active === 0} aria-label="Previous chamber"><ArrowUp size={22} aria-hidden="true" /></button>
        <span aria-live="polite">{CHAMBER_LABELS[active]}</span>
        <button type="button" onClick={() => jumpTo(active + 1)} disabled={active === CHAMBER_COUNT - 1} aria-label="Next chamber"><ArrowDown size={22} aria-hidden="true" /></button>
      </div>
      {active > 0 && (
        <aside className={`cv-sheet ${open ? 'is-open' : ''}`} aria-label={`${CHAMBER_LABELS[active]} details`}>
          <button type="button" className="cv-sheet__handle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? <ChevronDown size={20} aria-hidden="true" /> : <ChevronUp size={20} aria-hidden="true" />}<span>{open ? 'Hide' : `Show ${CHAMBER_LABELS[active]}`}</span>
          </button>
          {open && <div className="cv-sheet__body"><ParchmentPanel id={id} onOpenProject={onOpenProject} compact /></div>}
        </aside>
      )}
    </>
  )
}

/* ───────────── project detail dialog (accessible, parchment-styled) ───────────── */
export function CaveProjectModal({ project, onClose }) {
  const closeRef = useRef(null), dialogRef = useRef(null), back = useRef(null)
  useEffect(() => {
    if (!project) return undefined
    back.current = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const f = dialogRef.current.querySelectorAll('a[href], button:not([disabled])')
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); back.current?.focus?.() }
  }, [project, onClose])
  if (!project) return null
  return createPortal(
    <div className="cv-modal-backdrop" onClick={onClose}>
      <div ref={dialogRef} className="cv-modal parch" role="dialog" aria-modal="true" aria-labelledby="cv-modal-title" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className="cv-modal__close" onClick={onClose} aria-label="Close project details"><X size={20} aria-hidden="true" /></button>
        <p className="parch__kicker">{project.subtitle}{project.period ? ` · ${project.period}` : ''}</p>
        <h2 id="cv-modal-title">{project.title}</h2>
        <span className="parch__rule" aria-hidden="true" />
        <div className="cv-modal__body">
          <h3>The problem</h3><p>{project.problem}</p>
          <h3>Highlights</h3>
          <ul className="cv-list">{project.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          <h3>Stack</h3>
          <ul className="cv-chips">{project.tech.map((t) => <li key={t} className="cv-chip"><CaveIcon name={t} size={16} /><span>{techLabel(t)}</span></li>)}</ul>
        </div>
        <div className="cv-actions cv-actions--big">
          {project.live && <a className="cv-btn cv-btn--primary" href={project.live} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16} aria-hidden="true" /> Live demo</a>}
          <a className="cv-btn cv-btn--primary" href={project.github} target="_blank" rel="noopener noreferrer"><CaveIcon name="github" size={16} /> View source</a>
        </div>
      </div>
    </div>,
    document.body,
  )
}
