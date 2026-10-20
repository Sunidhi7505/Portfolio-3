import { ArrowUp } from 'lucide-react'
import SocialLinks from '../ui/SocialLinks'
import { extraNav, footer, links, navItems, profile } from '../../data/portfolioData'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <a href="#home" className="logo" aria-label={`${profile.name} — back to top`}>
            <span className="logo__mark">{profile.monogram}</span>
            <span className="logo__name">{profile.name}</span>
          </a>
          <p>{footer.tagline}</p>
          <SocialLinks />
        </div>

        <nav aria-label="Footer">
          <h2 className="footer__title">Explore</h2>
          <ul className="footer__links">
            {[...navItems, ...extraNav].map((n) => (
              <li key={n.href}><a href={n.href}>{n.title || n.label}</a></li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="footer__title">Resume</h2>
          <ul className="footer__links">
            <li><a href={links.resumeView} target="_blank" rel="noopener noreferrer">Open full resume</a></li>
            <li><a href={links.resumeDownload} target="_blank" rel="noopener noreferrer">Download PDF</a></li>
            <li><a href={`mailto:${links.email}`}>{links.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {year} {profile.name}. Built with React, Three.js and a lot of Spring Boot curiosity.</p>
        <a href="#home" className="back-top" aria-label="Back to top"><ArrowUp size={16} aria-hidden="true" /><span>Back to top</span></a>
      </div>
    </footer>
  )
}
