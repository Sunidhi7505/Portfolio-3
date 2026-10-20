import { Fragment, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Download, Hand, Mail, Sparkles } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../ui/Button'
import SocialLinks from '../ui/SocialLinks'
import SceneFallback from '../three/SceneFallback'
import { links, profile } from '../../data/portfolioData'
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { useTypewriter } from '../../hooks/useTypewriter'
import { useAnchorRect } from '../../hooks/useAnchorRect'
import { isFolded, notifyScene, sceneStore } from '../../utils/sceneStore'

gsap.registerPlugin(ScrollTrigger)

const nameWords = profile.name.split(' ')

export default function Hero({ sceneStatus }) {
  const reduced = usePrefersReducedMotion()
  const touch = useMediaQuery('(hover: none)')
  const role = useTypewriter(profile.roles, { reduced })
  const stageRef = useRef(null)
  const contentRef = useRef(null)
  const [folded, setFolded] = useState(false)

  useAnchorRect(stageRef)

  // Scroll-linked: fold the avatar's arms once the stage has scrolled up past ~25% of the viewport,
  // and gently parallax the text column. ScrollTrigger is created inside a gsap.context for clean teardown.
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '#home',
        start: '22% top', // once the visitor has scrolled ~a fifth of the hero
        end: 'bottom top',
        onToggle: (self) => {
          sceneStore.foldScroll = self.isActive
          sceneStore.foldManual = null // scrolling hands control back to the scroll trigger
          setFolded(isFolded())
          notifyScene()
        },
      })
      if (!reduced) {
        gsap.to(contentRef.current, {
          yPercent: -8, opacity: 0.35, ease: 'none',
          scrollTrigger: { trigger: contentRef.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      }
    })
    return () => ctx.revert()
  }, [reduced])

  const toggleFold = () => {
    const next = !isFolded()
    sceneStore.foldManual = next
    setFolded(next)
    notifyScene()
  }

  const setHover = (v) => () => { sceneStore.heroHover = v; notifyScene() }

  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__content" ref={contentRef}>
          <motion.p
            className="status-pill"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Sparkles size={14} aria-hidden="true" />
            {profile.status}
          </motion.p>

          <h1 id="hero-title" className="hero__title" aria-label={profile.name}>
            {nameWords.map((w, i) => (
              <Fragment key={w}>
                {i > 0 && ' '}
                <motion.span
                  className="hero__word"
                  aria-hidden="true"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </Fragment>
            ))}
          </h1>

          <p className="hero__role" aria-label={profile.roles.join(', ')}>
            <span aria-hidden="true" className="hero__role-text">{role}</span>
            <span aria-hidden="true" className="caret" />
          </p>

          <motion.p className="hero__headline" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
            {profile.headline}
          </motion.p>
          <motion.p className="hero__intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }}>
            {profile.intro}
          </motion.p>

          <motion.div className="hero__cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }}>
            <Button href="#projects" icon={ArrowDown}>View My Work</Button>
            <Button variant="secondary" href={links.resumeDownload} icon={Download}>Download Resume</Button>
            <Button variant="ghost" href="#contact" icon={Mail}>Let’s Connect</Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.9 }}>
            <SocialLinks className="hero__social" />
          </motion.div>
        </div>

        {/* The 3D avatar is rendered by the fixed scene layer and positioned over this stage. */}
        <div
          id="hero-stage"
          ref={stageRef}
          className="hero__stage"
          onPointerEnter={setHover(true)}
          onPointerLeave={setHover(false)}
          role="group"
          aria-label="Interactive 3D avatar"
        >
          {sceneStatus === 'fallback' && <SceneFallback />}
          <p className="sr-only">{profile.avatarAlt}</p>
          <div className="hero__stage-ui">
            {/* The pose control only makes sense while the 3D avatar is running. */}
            {sceneStatus !== 'fallback' && (
              <button type="button" className="chip-btn" onClick={toggleFold} aria-pressed={folded}>
                <Hand size={15} aria-hidden="true" />
                <span>{folded ? 'Relax pose' : 'Fold arms'}</span>
              </button>
            )}
            <p className="hero__hint" aria-hidden="true">
              {sceneStatus === 'fallback' ? 'Stylized illustration' : touch ? 'Scroll or tap to change her pose' : 'Move your cursor · scroll to change her pose'}
            </p>
          </div>
        </div>
      </div>

      <a href="#about" className="scroll-indicator" aria-label="Scroll to About section">
        <span className="scroll-indicator__mouse" aria-hidden="true"><i /></span>
        <span>Scroll</span>
      </a>
    </section>
  )
}
