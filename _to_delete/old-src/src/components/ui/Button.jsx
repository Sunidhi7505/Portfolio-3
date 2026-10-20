import { ExternalLink } from 'lucide-react'

/**
 * Link-or-button primitive. Always renders a real <a> when `href` is given, otherwise a <button>.
 * External links open in a new tab with safe rel attributes.
 */
export default function Button({ variant = 'primary', href, icon: Icon, external, children, className = '', size = 'md', ...rest }) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim()
  const isExternal = external ?? /^https?:/.test(href || '')
  const content = (
    <>
      {Icon && <Icon size={18} aria-hidden="true" />}
      <span>{children}</span>
    </>
  )
  if (href) {
    return (
      <a
        className={cls}
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
        {isExternal && variant === 'ghost' && <ExternalLink size={14} aria-hidden="true" />}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  )
}
