import { useState } from 'react'
import { Award, Binary, Briefcase, ExternalLink, GraduationCap, Layers, ShieldCheck, Trophy, Users } from 'lucide-react'
import SectionHeading from './SectionHeading'
import Icon from './Icon'
import { achievements } from '../data/portfolioData'

const ICONS = { Award, Binary, Briefcase, GraduationCap, Layers, ShieldCheck, Trophy, Users }

function LeetCodeCard() {
  const lc = achievements.leetcode
  const [cardOk, setCardOk] = useState(Boolean(lc.cardUrl))
  const { easy, medium, hard } = lc.difficulty
  const total = easy + medium + hard
  const pct = (n) => `${((n / total) * 100).toFixed(2)}%`
  return (
    <div className={`card lc${cardOk ? '' : ' lc--solo'}`}>
      <div className="lc__stats">
        <div className="lc__main">
        <div className="lc__head">
          <span className="ico ico--lg"><Icon name="leetcode" size={22} /></span>
          <div>
            <p className="lc__num">{lc.solved}</p>
            <p className="lc__label">{lc.title}</p>
          </div>
        </div>
        <p className="lc__text">{lc.text}</p>
        </div>
        <div className="lc__dist">
        <div className="diff" role="img" aria-label={`Difficulty distribution: ${easy} easy, ${medium} medium, ${hard} hard`}>
          <i className="diff__e" style={{ width: pct(easy) }} /><i className="diff__m" style={{ width: pct(medium) }} /><i className="diff__h" style={{ width: pct(hard) }} />
        </div>
        <ul className="diff__legend">
          <li><i className="diff__e" />Easy <b>{easy}</b></li>
          <li><i className="diff__m" />Medium <b>{medium}</b></li>
          <li><i className="diff__h" />Hard <b>{hard}</b></li>
        </ul>
        <p className="lc__note">{lc.difficultyNote}</p>
        <a className="link" href={lc.profileUrl} target="_blank" rel="noopener noreferrer">View LeetCode profile <ExternalLink size={13} aria-hidden="true" /></a>
        </div>
      </div>
      {cardOk && (
        <div className="lc__card">
          <img src={lc.cardUrl} alt="LeetCode activity heatmap and easy, medium and hard solved distribution" loading="lazy" onError={() => setCardOk(false)} />
        </div>
      )}
    </div>
  )
}

export default function Achievements() {
  return (
    <section id="achievements" className="section" aria-labelledby="ach-title">
      <SectionHeading id="ach-title">Achievements &amp; Highlights</SectionHeading>
      <LeetCodeCard />
      <ul className="ach">
        {achievements.items.map((a) => {
          const I = ICONS[a.icon] || Award
          return (
            <li key={a.title} className="card ach__item">
              <span className="ico"><I size={18} strokeWidth={1.8} aria-hidden="true" /></span>
              <div>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                {a.url && <a className="link link--sm" href={a.url} target="_blank" rel="noopener noreferrer">View proof <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> — {a.title}</span></a>}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
