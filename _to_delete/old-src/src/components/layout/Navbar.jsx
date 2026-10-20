import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { Download, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { extraNav, links, navItems, profile } from '../../data/portfolioData'
import { useActiveSection } from '../../hooks/useActiveSection'

const SECTION_IDS = ['home', 'about', 'resume', 'experience', 'skills', 'projects', 'education', 'certifications', 'achievements', 'coding', 'contact']

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const activeSection = useActiveSection(SECTION_IDS)
  const activeNav = useMemo(() => navItems.find((n) => n.ids.includes(activeSection))?.href, [activeSection])
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu with Escape and lock page scroll while it is open.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <motion.div className="navbar__progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="container navbar__inner">
        <a href="#home" className="logo" aria-label={`${profile.name} — back to top`}>
          <span className="logo__mark">{profile.monogram}</span>
          <span className="logo__name">{profile.name}</span>
        </a>

        <nav className="navbar__links" aria-label="Primary">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={activeNav === item.href ? 'is-active' : ''}
                  aria-current={activeNav === item.href ? 'true' : undefined}
                  title={item.title}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          <a className="btn btn--secondary btn--sm navbar__resume" href={links.resumeDownload} target="_blank" rel="noopener noreferrer">
            <Download size={16} aria-hidden="true" /><span>Resume</span><span className="sr-only"> (download PDF)</span>
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="icon-btn navbar__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <ul>
              {[...navItems, ...extraNav].map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={close} className={activeNav === item.href ? 'is-active' : ''}>{item.title || item.label}</a>
                </li>
              ))}
            </ul>
            <a className="btn btn--primary" href={links.resumeDownload} target="_blank" rel="noopener noreferrer" onClick={close}>
              <Download size={18} aria-hidden="true" /><span>Download Resume</span>
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
