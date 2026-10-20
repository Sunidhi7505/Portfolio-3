import { ExternalLink } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { certifications } from '../data/portfolioData'

export default function Certifications() {
  return (
    <section id="certifications" className="section" aria-labelledby="certs-title">
      <SectionHeading id="certs-title">Certifications</SectionHeading>
      <ul className="certs">
        {certifications.map((c) => (
          <li key={c.id} className="card cert">
            <span className="logo-tile logo-tile--cert" aria-hidden="true">{c.mark}</span>
            <div className="cert__body">
              <h3>{c.name}</h3>
              <p className="cert__issuer">{c.issuer}</p>
              <p className="cert__meta"><span className="pill pill--blue">{c.badge}</span><span>{c.year}</span></p>
              <a className="link" href={c.url} target="_blank" rel="noopener noreferrer">View certificate <ExternalLink size={13} aria-hidden="true" /><span className="sr-only"> — {c.name}</span></a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
