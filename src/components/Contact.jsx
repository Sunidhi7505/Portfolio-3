import { ArrowRight, Download, Mail } from 'lucide-react'
import Icon from './Icon'
import { contact, links, socials } from '../data/portfolioData'

export default function Contact() {
  const subject = encodeURIComponent('Hello from your portfolio')
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="sh sh--plain">
        <h2 id="contact-title" className="sh__title sh__title--icon"><Mail size={22} strokeWidth={1.9} aria-hidden="true" /> {contact.heading}</h2>
      </div>
      <p className="contact__text">{contact.text}</p>
      <p className="contact__mail"><a href={`mailto:${links.email}`}>{links.email}</a></p>
      <div className="contact__row">
        <ul className="social social--lg" aria-label="Profiles">
          {socials.map((s) => (
            <li key={s.id}><a className="social__btn" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}><Icon name={s.logo} size={22} /></a></li>
          ))}
          <li><a className="social__btn" href={`mailto:${links.email}`} aria-label="Email" title="Email"><Mail size={22} strokeWidth={1.8} color="var(--text)" aria-hidden="true" /></a></li>
        </ul>
        <a className="btn btn--primary" href={`mailto:${links.email}?subject=${subject}`}>Send Message <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <a className="link contact__resume" href={links.resumeView} target="_blank" rel="noopener noreferrer">View résumé <Download size={13} aria-hidden="true" /></a>
    </section>
  )
}
