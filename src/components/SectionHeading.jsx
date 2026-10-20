/** Section title with the short blue underline bar; optional right-aligned action slot. */
export default function SectionHeading({ id, title, children, action }) {
  return (
    <div className="sh">
      <div>
        <h2 id={id} className="sh__title">{title ?? children}</h2>
        <span className="sh__bar" aria-hidden="true" />
      </div>
      {action ? <div className="sh__action">{action}</div> : null}
    </div>
  )
}
