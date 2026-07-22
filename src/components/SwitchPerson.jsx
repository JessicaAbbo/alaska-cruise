import { useState } from 'react'

export default function SwitchPerson({ people, current, onSelect }) {
  const [open, setOpen] = useState(false)

  const groups = {}
  people.forEach(p => {
    const g = p.familyUnit || 'Other'
    if (!groups[g]) groups[g] = []
    groups[g].push(p)
  })

  const handle = (name) => {
    onSelect(name)
    setOpen(false)
  }

  return (
    <>
      <button className="switch-btn" onClick={() => setOpen(true)}>Switch ▾</button>
      {open && (
        <div className="switch-overlay" onClick={() => setOpen(false)}>
          <div className="switch-sheet" onClick={e => e.stopPropagation()}>
            <button className="switch-close" onClick={() => setOpen(false)}>✕</button>
            <h3>Switch person</h3>
            {Object.entries(groups).map(([family, members]) => (
              <div className="family-group" key={family}>
                <h2>{family}</h2>
                {members.map(p => (
                  <button
                    key={p.name}
                    className="name-btn"
                    style={p.name === current ? { borderColor: 'var(--blue)', background: 'var(--pale-blue)' } : {}}
                    onClick={() => handle(p.name)}
                  >
                    <span>{p.name === current ? '✓' : '👤'}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
