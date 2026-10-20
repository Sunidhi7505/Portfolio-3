import { MapPin } from 'lucide-react'
import SectionHeading from './SectionHeading'
import Icon from './Icon'
import { experience } from '../data/portfolioData'
import { BRAND, DISPLAY_NAME } from '../utils/icons'

const label = (k) => DISPLAY_NAME[k] || BRAND[k]?.title || k
const initials = (name) => name.split(' ').map((w) => w[0]).slice(0, 2).join('')

export default function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <SectionHeading id="experience-title">Experience</SectionHeading>
      <ol className="timeline">
        {experience.map((e) => (
          <li key={e.id} className="timeline__item">
            <span className="timeline__dot" aria-hidden="true" />
            <article className="card entry">
              <header className="entry__head">
                <span className="logo-tile" aria-hidden="true">{initials(e.company)}</span>
                <div className="entry__titles">
                  <h3>{e.company}</h3>
                  <p className="entry__sub">{e.role}</p>
                  <p className="entry__meta"><span className="pill">{e.type}</span><MapPin size={13} aria-hidden="true" />{e.location}</p>
                </div>
                <p className="entry__date">{e.period}</p>
              </header>
              <ul className="bullets">
                {e.points.map((p) => <li key={p}>{p}</li>)}
              </ul>
              <ul className="tags" aria-label="Technologies used">
                {e.tech.map((t) => <li key={t} className="tag"><Icon name={t} size={13} />{label(t)}</li>)}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
