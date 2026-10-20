import { GraduationCap, School } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { education } from '../data/portfolioData'

export default function Education() {
  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <SectionHeading id="education-title">Education</SectionHeading>
      <ol className="timeline">
        {education.map((e, i) => {
          const I = i === 0 ? GraduationCap : School
          return (
            <li key={e.id} className="timeline__item">
              <span className="timeline__dot" aria-hidden="true" />
              <article className="card entry entry--compact">
                <span className="logo-tile logo-tile--icon" aria-hidden="true"><I size={22} strokeWidth={1.7} /></span>
                <div className="entry__titles">
                  <h3>{e.degree}</h3>
                  <p className="entry__sub">{e.institution} · {e.location}</p>
                  <p className="entry__meta"><span className="pill pill--blue">{e.score}</span>{e.highlights[0] ? <span className="entry__note">{e.highlights[0]}</span> : null}</p>
                </div>
                <p className="entry__date">{e.period}</p>
              </article>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
