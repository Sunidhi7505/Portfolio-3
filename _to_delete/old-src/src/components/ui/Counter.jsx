import { useCounter } from '../../hooks/useCounter'

/** Animated number — only ever used with verified numeric values from portfolioData. */
export default function Counter({ value, decimals = 0, suffix = '', className = '' }) {
  const { ref, text } = useCounter(value, { decimals })
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{text}{suffix}</span>
      <span className="sr-only">{value.toLocaleString('en-IN', { minimumFractionDigits: decimals })}{suffix}</span>
    </span>
  )
}
