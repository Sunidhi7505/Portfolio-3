import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Education from './components/Education'
import Certifications from './components/Certifications'
import Achievements from './components/Achievements'
import Contact from './components/Contact'
import Footer from './components/Footer'

/** One normally-scrolling page: full-width sections stacked top to bottom (Education + Certifications share a row on wide screens). */
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main" className="page">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <div className="row row--2">
          <Education />
          <Certifications />
        </div>
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
