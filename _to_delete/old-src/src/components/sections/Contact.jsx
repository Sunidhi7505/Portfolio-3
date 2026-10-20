import { useState } from 'react'
import { Check, Copy, Mail, Send } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../ui/Reveal'
import Button from '../ui/Button'
import SocialLinks from '../ui/SocialLinks'
import { contact, links, profile } from '../../data/portfolioData'

/**
 * No backend exists, so the form composes an email in the visitor’s own mail app via a mailto: link.
 * The copy is explicit about this — nothing pretends to be “sent” from the page.
 */
export default function Contact() {
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({ name: '', subject: '', message: '' })

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const mailto = () => {
    const subject = form.subject || `Hello ${profile.firstName}`
    const body = `${form.message}\n\n— ${form.name}`.trim()
    return `mailto:${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  const onSubmit = (e) => { e.preventDefault(); window.location.href = mailto() }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { window.location.href = `mailto:${links.email}` }
  }

  return (
    <section id="contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeading id="contact-title" eyebrow="10 · Contact" title={contact.heading} lede={contact.text} />
        <div className="contact__grid">
          <Reveal className="card contact-card">
            <h3>Get in touch</h3>
            <p className="contact__email"><Mail size={18} aria-hidden="true" /><a href={`mailto:${links.email}`}>{links.email}</a></p>
            <div className="contact__buttons">
              <Button href={`mailto:${links.email}`} icon={Mail}>Let’s Connect</Button>
              <Button variant="secondary" icon={copied ? Check : Copy} onClick={copy} aria-live="polite">{copied ? 'Copied' : 'Copy email'}</Button>
            </div>
            <h3 className="mini-title">Find me online</h3>
            <SocialLinks withLabels size={18} className="social-links--labeled" />
          </Reveal>

          <Reveal className="card contact-card" delay={0.08}>
            <h3>Write a message</h3>
            <p className="muted small">This opens a pre-filled draft in your email app — nothing is sent from this page.</p>
            <form onSubmit={onSubmit} className="form">
              <label>Your name
                <input type="text" value={form.name} onChange={update('name')} required autoComplete="name" />
              </label>
              <label>Subject
                <input type="text" value={form.subject} onChange={update('subject')} placeholder="e.g. Internship opportunity" />
              </label>
              <label>Message
                <textarea rows={5} value={form.message} onChange={update('message')} required />
              </label>
              <button type="submit" className="btn btn--primary"><Send size={18} aria-hidden="true" /><span>Open in email app</span></button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
