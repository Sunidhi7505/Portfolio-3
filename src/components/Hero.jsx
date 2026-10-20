import { ArrowRight, Download, Mail, Target, Code2 } from 'lucide-react'
import HeroArt from './HeroArt'
import Icon from './Icon'
import { achievements, links, profile, projects, socials } from '../data/portfolioData'

const [first, ...rest] = profile.name.split(' ')

export default function Hero() {
  const solved = '500+'
  return (
    <section id="home" className="card hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <p className="hero__hello">Hello, I’m</p>
        <h1 id="hero-title" className="hero__name">
          <span>{first}</span> <span className="hero__name-accent">{rest.join(' ')}</span>
        </h1>
        <p className="hero__role">{profile.roles[0]}</p>
        <p className="hero__summary">{profile.headline}</p>
        <p className="hero__status"><span className="dot" aria-hidden="true" />{profile.status}</p>

        <div className="hero__btns">
          <a className="btn btn--primary" href="#projects">View My Work <ArrowRight size={16} aria-hidden="true" /></a>
          <a className="btn btn--ghost" href={links.resumeDownload} target="_blank" rel="noopener noreferrer">Download Resume <Download size={16} aria-hidden="true" /></a>
        </div>

        <ul className="social" aria-label="Social profiles">
          {socials.map((s) => (
            <li key={s.id}>
              <a className="social__btn" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}><Icon name={s.logo} size={20} /></a>
            </li>
          ))}
          <li>
            <a className="social__btn" href={`mailto:${links.email}`} aria-label={`Email ${links.email}`} title="Email"><Mail size={20} strokeWidth={1.8} aria-hidden="true" color="var(--text)" /></a>
          </li>
        </ul>
      </div>

      <div className="hero__visual">
        <HeroArt avatar={!profile.photo} />
        {profile.photo && <img className="hero__photo" src={profile.photo} alt={profile.photoAlt} width="547" height="704" />}
        <ul className="stats" aria-label="Highlights">
          <li>
            <span className="stats__icon"><Target size={18} aria-hidden="true" /></span>
            <span><b>{solved}</b><small>DSA Problems Solved</small></span>
          </li>
          <li>
            <span className="stats__icon"><Code2 size={18} aria-hidden="true" /></span>
            <span><b>{projects.length}</b><small>Projects Built</small></span>
          </li>
        </ul>
      </div>
    </section>
  )
}
