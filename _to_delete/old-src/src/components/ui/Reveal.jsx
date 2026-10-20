import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { fadeUp, viewportOnce } from '../../utils/motion'

/** Scroll-triggered fade/slide-up wrapper. */
export default function Reveal({ as = 'div', delay = 0, className, children, ...rest }) {
  const reduced = usePrefersReducedMotion()
  const Tag = motion[as]
  return (
    <Tag className={className} variants={fadeUp(reduced, delay)} initial="hidden" whileInView="show" viewport={viewportOnce} {...rest}>
      {children}
    </Tag>
  )
}
