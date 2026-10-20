import { useEffect, useState } from 'react'
import { Code2, Download, Menu, X } from 'lucide-react'
import { links, navItems, profile } from '../data/portfolioData'
import useActiveSection from '../hooks/useActiveSection'

const SECTION_IDS = [...new Set(navItems.flatMap((n) => n.ids))]

export default function Navbar() {
  const active = useActiveSection(SECTION_IDS)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    const onResize = () => { if (window.innerWidth > 1060) setOpen(false) }
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => { document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize) }
  }, [open])

  const isActive = (item) => item.ids.includes(active)

  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="brand" href="#home" onClick={() => setOpen(false)} aria-label={`${profile.name} — back to top`}>
          <span className="brand__logo" aria-hidden="true"><Code2 size={22} strokeWidth={1.8} /></span>
          <span className="brand__text">
            <span className="brand__name">{profile.name}</span>
            <span className="brand__role">{profile.roles[0]}</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {navItems.map((n) => (
            <a key={n.href} href={n.href} className={isActive(n) ? 'is-active' : undefined} aria-current={isActive(n) ? 'location' : undefined}>{n.label}</a>
          ))}
        </nav>

        <a className="btn btn--primary btn--sm nav__resume" href={links.resumeDownload} target="_blank" rel="noopener noreferrer">
          Download Resume <Download size={15} aria-hidden="true" />
        </a>

        <button type="button" className="nav__toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      <div id="mobile-menu" className={`mmenu${open ? ' is-open' : ''}`} hidden={!open}>
        <nav aria-label="Mobile">
          {navItems.map((n) => (
            <a key={n.href} href={n.href} className={isActive(n) ? 'is-active' : undefined} onClick={() => setOpen(false)}>{n.label}</a>
          ))}
          <a className="btn btn--primary" href={links.resumeDownload} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            Download Resume <Download size={16} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}
