import { PANELS } from './content'

/** Carved-wood-framed parchment board. Plain DOM so it works in the 3D layer *and* the mobile sheet. */
export default function ParchmentPanel({ id, onOpenProject, compact = false }) {
  const def = PANELS[id]
  if (!def) return null
  const { C } = def
  return (
    <section className={`parch parch--${id} ${compact ? 'parch--compact' : ''}`} aria-labelledby={`cv-h-${id}`}>
      <i className="parch__rivet parch__rivet--tl" /><i className="parch__rivet parch__rivet--tr" /><i className="parch__rivet parch__rivet--bl" /><i className="parch__rivet parch__rivet--br" />
      <header className="parch__head">
        <p className="parch__kicker">{def.kicker}</p>
        <h2 id={`cv-h-${id}`}>{def.title}</h2>
        <span className="parch__rule" aria-hidden="true" />
      </header>
      <div className="parch__body"><C onOpen={onOpenProject} /></div>
    </section>
  )
}
