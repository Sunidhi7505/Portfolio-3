import { useMemo, useState } from 'react'
import SectionHeading from './SectionHeading'
import Icon from './Icon'
import { skillCategories } from '../data/portfolioData'

const ALL = 'all'

export default function Skills() {
  const [filter, setFilter] = useState(ALL)

  const tiles = useMemo(() => {
    const seen = new Set()
    const out = []
    skillCategories.forEach((c) => {
      if (filter !== ALL && c.id !== filter) return
      c.skills.forEach((s) => {
        if (seen.has(s.name)) return
        seen.add(s.name)
        out.push(s)
      })
    })
    return out
  }, [filter])

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <SectionHeading id="skills-title">Technical Skills</SectionHeading>

      <div className="chips-row" role="group" aria-label="Filter skills by category">
        <button type="button" className="fchip" aria-pressed={filter === ALL} onClick={() => setFilter(ALL)}>All</button>
        {skillCategories.map((c) => (
          <button key={c.id} type="button" className="fchip" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>{c.label}</button>
        ))}
      </div>

      <ul className="tiles">
        {tiles.map((s) => (
          <li key={s.name} className="tile" title={s.note}>
            <Icon name={s.logo} size={28} />
            <span>{s.name}</span>
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">{tiles.length} skills shown</p>
    </section>
  )
}
