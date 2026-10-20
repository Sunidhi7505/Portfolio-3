import { Binary, Layers, Quote, ShieldCheck, Webhook } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { about } from '../data/portfolioData'

const STRENGTH_ICONS = [Webhook, ShieldCheck, Binary, Layers]

export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <SectionHeading id="about-title">About Me</SectionHeading>
      <div className="about__grid">
      <div className="about__main">
      <div className="about__text">
        <p>{about.summary[0]}</p>
        <p>{about.summary[2]}</p>
      </div>
        <ul className="strengths">
          {about.interests.map((it, i) => {
            const I = STRENGTH_ICONS[i % STRENGTH_ICONS.length]
            return (
              <li key={it.title} title={it.text}>
                <span className="ico"><I size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <span>{it.title}</span>
              </li>
            )
          })}
        </ul>
      </div>
        <figure className="quote">
          <Quote size={20} strokeWidth={1.8} aria-hidden="true" className="quote__mark" />
          <blockquote>{about.philosophy}</blockquote>
        </figure>
      </div>
    </section>
  )
}
