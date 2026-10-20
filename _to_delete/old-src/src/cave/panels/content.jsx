import { ArrowUpRight, Download, ExternalLink, FileText, Mail, Scroll, Trophy } from 'lucide-react'
import CaveIcon from './CaveIcon'
import ProjectArt from '../../components/ui/ProjectArt'
import { BRAND, DISPLAY_NAME } from '../../utils/icons'
import {
  about, achievements, certifications, codingProfiles, contact, education, experience, links, moreRepos, projects, skillCategories, socials,
} from '../../data/portfolioData'

const techLabel = (k) => BRAND[k]?.title || DISPLAY_NAME[k] || k
const fmt = (h) => `${h.value.toFixed(h.decimals || 0)}${h.suffix || ''}`
const Ext = ({ href, children, className = 'cv-btn', ...r }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer" {...r}>{children}</a>
)

export function About() {
  return (
    <div className="cv-cols cv-cols--about">
      <div className="cv-prose">
        {about.summary.map((t) => <p key={t}>{t}</p>)}
      </div>
      <div>
        <ul className="cv-stats">
          {about.highlights.map((h) => <li key={h.label}><strong>{fmt(h)}</strong><span>{h.label}</span></li>)}
        </ul>
        <ul className="cv-list cv-list--tight">
          {about.interests.map((i) => <li key={i.title}><b>{i.title}.</b> {i.text}</li>)}
        </ul>
      </div>
    </div>
  )
}

export function Education() {
  return (
    <ol className="cv-timeline">
      {education.map((e) => (
        <li key={e.id}>
          <div className="cv-timeline__head">
            <h3>{e.degree}</h3>
            <span className="cv-badge">{e.score}</span>
          </div>
          <p className="cv-meta">{e.institution} · {e.location} · {e.period}</p>
          {e.highlights.map((h) => <p key={h} className="cv-small">{h}</p>)}
        </li>
      ))}
    </ol>
  )
}

export function Experience() {
  return (
    <div>
      {experience.map((x) => (
        <article key={x.id} className="cv-role">
          <div className="cv-timeline__head"><h3>{x.role}</h3><span className="cv-badge">{x.type}</span></div>
          <p className="cv-meta"><b>{x.company}</b> · {x.location} · {x.period}</p>
          <p className="cv-small">{x.summary}</p>
          <ul className="cv-list">{x.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <ul className="cv-chips">{x.tech.map((t) => <li key={t} className="cv-chip"><CaveIcon name={t} size={16} /><span>{techLabel(t)}</span></li>)}</ul>
        </article>
      ))}
    </div>
  )
}

const HERO_SKILLS = new Set(['Java', 'Spring Boot'])
export function Skills() {
  return (
    <div className="cv-skills">
      {skillCategories.map((c) => (
        <section key={c.id} className="cv-skillblock" aria-label={c.label}>
          <h3>{c.label}</h3>
          <ul className="cv-chips">
            {c.skills.map((s) => (
              <li key={s.name} className={`cv-chip ${HERO_SKILLS.has(s.name) ? 'cv-chip--hero' : ''}`} title={s.note + (s.source ? ` (source: ${s.source})` : '')}>
                <CaveIcon name={s.logo} size={HERO_SKILLS.has(s.name) ? 24 : 16} /><span>{s.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function Projects({ onOpen }) {
  return (
    <>
      <ul className="cv-projects">
        {projects.map((p) => (
          <li key={p.id} className="cv-project">
            <button type="button" className="cv-project__art" onClick={() => onOpen(p)} aria-label={`Open details for ${p.title}`}>
              {p.screenshot ? <img src={p.screenshot} alt={`${p.title} screenshot`} loading="lazy" /> : <ProjectArt kind={p.art} />}
            </button>
            <div className="cv-project__body">
              <h3>{p.title}</h3>
              <p className="cv-meta">{p.subtitle}</p>
              <ul className="cv-chips cv-chips--mini">{p.tech.slice(0, 6).map((t) => <li key={t} title={techLabel(t)} className="cv-chip cv-chip--icon"><CaveIcon name={t} size={15} /><span className="sr-only">{techLabel(t)}</span></li>)}</ul>
              <div className="cv-actions">
                <button type="button" className="cv-btn cv-btn--primary" onClick={() => onOpen(p)}>Details</button>
                <Ext href={p.github}>Source</Ext>
                {p.live && <Ext href={p.live}>Live <ArrowUpRight size={14} aria-hidden="true" /></Ext>}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="cv-small cv-foot">More on GitHub: {moreRepos.map((r, i) => <span key={r.name}>{i ? ' · ' : ''}<Ext href={r.url} className="cv-link">{r.name}</Ext></span>)}</p>
    </>
  )
}

export function Certifications() {
  return (
    <ul className="cv-cards cv-cards--2">
      {certifications.map((c) => (
        <li key={c.id} className="cv-card">
          <Scroll size={26} aria-hidden="true" color="#7a4a14" />
          <h3>{c.name}</h3>
          <p className="cv-meta">{c.issuer} · {c.year}</p>
          <Ext href={c.url}><FileText size={15} aria-hidden="true" /> View certificate</Ext>
        </li>
      ))}
    </ul>
  )
}

export function Achievements() {
  const a = achievements
  return (
    <div>
      <article className="cv-card cv-card--feature">
        <Trophy size={30} aria-hidden="true" color="#7a4a14" />
        <div>
          <h3>{a.featured.title} <span className="cv-badge">{a.featured.year}</span></h3>
          <p className="cv-small">{a.featured.text}</p>
          <Ext href={a.featured.url}><FileText size={15} aria-hidden="true" /> View proof</Ext>
        </div>
      </article>
      <ul className="cv-stats cv-stats--4">
        {a.counters.map((c) => <li key={c.label} title={c.note}><strong>{c.value}</strong><span>{c.label}</span></li>)}
      </ul>
      <p className="cv-small">DSA by difficulty — Easy <b>{a.difficulty.easy}</b> · Medium <b>{a.difficulty.medium}</b> · Hard <b>{a.difficulty.hard}</b>. {a.difficulty.note}.</p>
      <ul className="cv-chips">{a.badges.map((b) => <li key={b.name} className="cv-chip"><CaveIcon name="leetcode" size={15} /><span>{b.name}</span></li>)}</ul>
      <p className="cv-small cv-foot">Codolio snapshot, {a.snapshotDate} — a static copy, not live. {a.badgeNote}</p>
    </div>
  )
}

export function Coding() {
  return (
    <ul className="cv-cards cv-cards--3">
      {codingProfiles.map((p) => (
        <li key={p.id} className="cv-card">
          <div className="cv-card__head"><CaveIcon name={p.logo} monogram={p.monogram} size={26} /><div><h3>{p.name}</h3><p className="cv-meta">@{p.handle}</p></div></div>
          <p className="cv-small">{p.description}</p>
          {p.stats.length > 0 && <dl className="cv-dl">{p.stats.map((s) => <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl>}
          <Ext href={p.url}>Open profile <ExternalLink size={14} aria-hidden="true" /></Ext>
          <p className="cv-note">{p.footnote}</p>
        </li>
      ))}
    </ul>
  )
}

export function Contact() {
  return (
    <div className="cv-contact">
      <p className="cv-lead">{contact.heading}</p>
      <p className="cv-prose-p">{contact.text}</p>
      <div className="cv-actions cv-actions--big">
        <Ext href={links.linkedin} className="cv-btn cv-btn--primary"><CaveIcon name="linkedin" size={18} /> LinkedIn</Ext>
        <Ext href={links.github} className="cv-btn cv-btn--primary"><CaveIcon name="github" size={18} /> GitHub</Ext>
        <a className="cv-btn cv-btn--primary" href={`mailto:${links.email}`}><Mail size={17} aria-hidden="true" /> {links.email}</a>
      </div>
      <div className="cv-actions">
        <Ext href={links.resumeView}><FileText size={15} aria-hidden="true" /> View résumé</Ext>
        <Ext href={links.resumeDownload}><Download size={15} aria-hidden="true" /> Download résumé</Ext>
        {socials.filter((s) => !['linkedin', 'github'].includes(s.id)).map((s) => <Ext key={s.id} href={s.url}><CaveIcon name={s.logo} monogram={s.monogram} size={16} /> {s.label}</Ext>)}
      </div>
      <p className="cv-journey">The journey continues…</p>
    </div>
  )
}

/** id → heading + body. Headings are display copy for the chambers (content itself comes from portfolioData). */
export const PANELS = {
  about: { kicker: 'Chamber I', title: 'About', C: About },
  education: { kicker: 'Chamber II', title: 'Education', C: Education },
  experience: { kicker: 'Chamber III', title: 'Experience', C: Experience },
  skills: { kicker: 'The Workshop', title: 'Skills', C: Skills },
  projects: { kicker: 'The Vault', title: 'Projects', C: Projects },
  certifications: { kicker: 'The Library', title: 'Certifications', C: Certifications },
  achievements: { kicker: 'The Wall of Honour', title: 'Achievements', C: Achievements },
  coding: { kicker: 'The Crystal Hall', title: 'Coding Profiles', C: Coding },
  contact: { kicker: 'The Campfire', title: 'Let’s Connect', C: Contact },
}
