import { socials } from '../../data/portfolioData'
import TechIcon from './TechIcon'

/** Icon row for LinkedIn / GitHub / LeetCode / Codolio. */
export default function SocialLinks({ size = 20, className = '', withLabels = false }) {
  return (
    <ul className={`social-links ${className}`} aria-label="Professional profiles">
      {socials.map((s) => (
        <li key={s.id}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label={`${s.label} profile (opens in a new tab)`}
          >
            <TechIcon name={s.logo} monogram={s.monogram} size={size} colored={false} />
            {withLabels && <span>{s.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  )
}
