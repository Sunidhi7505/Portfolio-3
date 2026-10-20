import { Download, ExternalLink, FileText } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Button from '../ui/Button'
import Reveal from '../ui/Reveal'
import { about, certifications, education, experience, links, profile, projects, achievements } from '../../data/portfolioData'
import { skillCategories } from '../../data/portfolioData'

/**
 * Resume highlights laid out like a document preview. Every line is rendered from portfolioData —
 * it is a styled summary, NOT a fabricated PDF. The real PDF lives on Google Drive.
 */
export default function Resume() {
  const job = experience[0]
  const featured = projects.filter((p) => p.featured)
  const skillLine = (id) => skillCategories.find((c) => c.id === id)?.skills.filter((s) => !s.source).map((s) => s.name).join(', ')

  return (
    <section id="resume" aria-labelledby="resume-title">
      <div className="container">
        <SectionHeading id="resume-title" eyebrow="02 · Resume" title="The short version" lede="A snapshot of my resume. Grab the PDF for the full, formatted document." />

        <div className="resume__grid">
          <Reveal className="resume-paper" aria-label="Resume highlights">
            <header className="resume-paper__head">
              <h3>{profile.name}</h3>
              <p>{profile.location} · <a href={`mailto:${links.email}`}>{links.email}</a></p>
            </header>

            <div className="resume-paper__section">
              <h4>Education</h4>
              {education.slice(0, 1).map((e) => (
                <p key={e.id}><strong>{e.institution}</strong> — {e.degree}, {e.score} <span className="muted">({e.period})</span></p>
              ))}
            </div>

            <div className="resume-paper__section">
              <h4>Experience</h4>
              <p><strong>{job.company}</strong> — {job.role} <span className="muted">({job.period}, {job.location})</span></p>
              <ul>{job.points.slice(1).map((p) => <li key={p}>{p}</li>)}</ul>
            </div>

            <div className="resume-paper__section">
              <h4>Projects</h4>
              {featured.map((p) => (
                <p key={p.id}><strong>{p.title}</strong> — {p.subtitle}. <span className="muted">{p.period}</span></p>
              ))}
            </div>

            <div className="resume-paper__section">
              <h4>Skills</h4>
              <p><strong>Languages:</strong> {skillLine('languages')}</p>
              <p><strong>Development:</strong> {skillLine('backend')}</p>
              <p><strong>Databases &amp; tools:</strong> {skillLine('databases')}, {skillLine('tools')}</p>
            </div>

            <div className="resume-paper__section">
              <h4>Certifications &amp; achievements</h4>
              <ul>
                <li>{achievements.featured.title} ({achievements.featured.year})</li>
                {certifications.map((c) => <li key={c.id}>{c.name} — {c.issuer} ({c.year})</li>)}
              </ul>
            </div>
          </Reveal>

          <Reveal className="resume__actions" delay={0.1}>
            <span className="icon-tile icon-tile--lg"><FileText size={26} aria-hidden="true" /></span>
            <h3>Resume_Sunidhi_Goyal.pdf</h3>
            <p className="muted">One page · hosted on Google Drive.</p>
            <Button href={links.resumeDownload} icon={Download} size="lg">Download Resume</Button>
            <Button href={links.resumeView} variant="secondary" icon={ExternalLink} size="lg">Open Full Resume</Button>
            <p className="resume__fallback">
              If the download doesn’t start in your browser, use <a href={links.resumeView} target="_blank" rel="noopener noreferrer">Open Full Resume</a> and download from Google Drive.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
