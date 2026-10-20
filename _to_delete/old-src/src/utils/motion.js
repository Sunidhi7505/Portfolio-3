/** Shared framer-motion variants. Components pass `reduced` to collapse movement. */
export const fadeUp = (reduced, delay = 0) => ({
  hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: reduced ? 0.2 : 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
})

export const stagger = (reduced, gap = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: reduced ? 0 : gap, delayChildren: 0.05 } },
})

export const viewportOnce = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' }
