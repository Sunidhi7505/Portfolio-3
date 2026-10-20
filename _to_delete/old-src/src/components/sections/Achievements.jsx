import { ExternalLink, Medal, Trophy } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'
import Counter from '../ui/Counter'
import { achievements } from '../../data/portfolioData'

export default function Achievements() {
  const a = achievements
  const total = a.difficulty.easy + a.difficulty.medium + a.difficulty.hard
  const pct = (n) => `${(n / total) * 100}%`
  return (
    <section id="achievements" aria-labelledby="ach-title">
      <div className="container">
        <SectionHeading id="ach-title" eyebrow="08 · Achievements" title="Highlights" lede={`Coding numbers are a static snapshot of my public profiles, taken ${a.snapshotDate}. They are not live.`} />

        <div className="ach__grid">
          <Reveal className="card ach-feature">
            <span className="icon-tile icon-tile--lg"><Trophy size={26} aria-hidden="true" /></span>
            <p className="pill pill--accent">{a.featured.year}</p>
            <h3>{a.featured.title}</h3>
            <p>{a.featured.text}</p>
            <a className="btn btn--secondary btn--sm" href={a.featured.url} target="_blank" rel="noopener noreferrer">
              <span>View certificate</span><ExternalLink size={14} aria-hidden="true" />
            </a>
          </Reveal>

          <div className="ach__stats">
            <ul className="counter-grid">
              {a.counters.map((c) => (
                <Reveal as="li" className="card counter-card" key={c.label}>
                  <Counter className="counter-card__value" value={c.value} />
                  <span className="counter-card__label">{c.label}</span>
                  <span className="counter-card__note">{c.note}</span>
                </Reveal>
              ))}
            </ul>

            <Reveal className="card difficulty">
              <h3 className="mini-title">DSA problems by difficulty (Codolio)</h3>
              <div className="difficulty__bar" role="img" aria-label={`Easy ${a.difficulty.easy}, Medium ${a.difficulty.medium}, Hard ${a.difficulty.hard}`}>
                <span style={{ width: pct(a.difficulty.easy) }} className="d-easy" />
                <span style={{ width: pct(a.difficulty.medium) }} className="d-med" />
                <span style={{ width: pct(a.difficulty.hard) }} className="d-hard" />
              </div>
              <ul className="difficulty__legend">
                <li><i className="d-easy" />Easy <strong>{a.difficulty.easy}</strong></li>
                <li><i className="d-med" />Medium <strong>{a.difficulty.medium}</strong></li>
                <li><i className="d-hard" />Hard <strong>{a.difficulty.hard}</strong></li>
              </ul>
              <p className="muted small">{a.difficulty.note}</p>
            </Reveal>
          </div>
        </div>

        <Reveal className="badge-row">
          <h3 className="mini-title">LeetCode badges</h3>
          <ul>
            {a.badges.map((b) => (
              <li key={b.name} className="badge"><Medal size={16} aria-hidden="true" />{b.name}</li>
            ))}
          </ul>
          <p className="muted small">{a.badgeNote}</p>
        </Reveal>
      </div>
    </section>
  )
}
