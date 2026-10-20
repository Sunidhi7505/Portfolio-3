import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { fadeUp, viewportOnce } from '../../utils/motion'

/** Consistent section heading: mono eyebrow, display title and optional lede. */
export default function SectionHeading({ id, eyebrow, title, lede, align = 'left' }) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.header
      className={`section-heading section-heading--${align}`}
      variants={fadeUp(reduced)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </motion.header>
  )
}
